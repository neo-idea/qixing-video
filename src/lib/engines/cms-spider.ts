import type { Episode, Spider, VodDetail, VodItem } from "@/lib/types";
import { relevanceScore, searchQueryVariants } from "@/lib/search-text";
import { isDirectStream } from "./stream-url";

/**
 * MacCMS 采集站引擎, 对齐 StreamLib iOS CMSEngine:
 *   type 0 (XML): ?ac=videolist(列表/搜索/详情)  + XML 响应解析
 *   type 1 (JSON): ?ac=detail(标准 MacCMS JSON 接口, 部分源不认 videolist)
 *   type 4 (T4): ?ac=detail(列表) + ?ac=player(取流)
 * 请求头携带 Referer/Origin(防盗链源需要)。
 */

interface CmsVod {
  vod_id: number | string;
  vod_name: string;
  vod_pic?: string;
  vod_remarks?: string;
  vod_score?: string;
  type_name?: string;
  vod_year?: string;
  vod_area?: string;
  vod_actor?: string;
  vod_director?: string;
  vod_content?: string;
  vod_play_from?: string;
  vod_play_url?: string;
  /** XML 接口专用: 分类 id, 用于无分类表时反推 */
  tid?: string;
}

interface CmsResp {
  class?: { type_id: string | number; type_name: string }[];
  list?: CmsVod[];
}

/** MacCMS XML 接口(ac= 同名) -> 统一 CmsResp, 与 JSON 走同一后续链路 */
function parseXmlResp(text: string): CmsResp {
  const dec = (s: string) =>
    s
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&amp;/g, "&")
      .trim();
  const tag = (seg: string, name: string) => {
    const m = seg.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`, "i"));
    return m ? dec(m[1]) : "";
  };
  const resp: CmsResp = {};
  const classes = [...text.matchAll(/<ty id="([^"]*)">([\s\S]*?)<\/ty>/g)].map((m) => ({
    type_id: m[1],
    type_name: dec(m[2]),
  }));
  if (classes.length) resp.class = classes;
  const videos = [...text.matchAll(/<video>([\s\S]*?)<\/video>/g)].map(([, seg]) => {
    const dds = [...seg.matchAll(/<dd flag="([^"]*)">([\s\S]*?)<\/dd>/g)];
    return {
      vod_id: tag(seg, "id"),
      vod_name: tag(seg, "name"),
      vod_pic: tag(seg, "pic"),
      vod_remarks: tag(seg, "note"),
      type_name: tag(seg, "type"),
      tid: tag(seg, "tid"),
      vod_year: tag(seg, "year"),
      vod_area: tag(seg, "area"),
      vod_actor: tag(seg, "actor"),
      vod_director: tag(seg, "director"),
      vod_content: tag(seg, "des"),
      vod_play_from: dds.map(([, flag]) => dec(flag)).filter(Boolean).join("$$$") || undefined,
      vod_play_url: dds.map(([, , body]) => dec(body)).join("$$$") || undefined,
    };
  });
  if (videos.length) resp.list = videos;
  return resp;
}

const UA = { "User-Agent": "okhttp/3.15", Accept: "application/json, */*" };

/** 防盗链: 从接口地址派生 Referer/Origin(移植 StreamLib buildHeaders) */
function headersOf(api: string) {
  const h: Record<string, string> = { ...UA };
  try {
    const origin = new URL(api).origin;
    h.Referer = `${origin}/`;
    h.Origin = origin;
  } catch {
    /* 仅 UA */
  }
  return h;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&[a-z]+;/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** 由片名生成稳定渐变色(海报占位用), hsl 避免新增十六进制色值 */
function gradientFor(name: string): [string, string] {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.codePointAt(0)!) >>> 0;
  const h1 = hash % 360;
  const h2 = (h1 + 40 + (hash % 60)) % 360;
  return [`hsl(${h1} 45% 16%)`, `hsl(${h2} 55% 28%)`];
}

function toVodItem(v: CmsVod): VodItem {
  return {
    vod_id: String(v.vod_id),
    vod_name: v.vod_name,
    vod_pic: v.vod_pic ?? "",
    vod_remarks: v.vod_remarks ?? "",
    vod_score: v.vod_score ?? "",
    category: v.type_name ?? "",
    year: v.vod_year ?? "",
    area: v.vod_area ?? "",
    gradient: gradientFor(v.vod_name),
  };
}

function withCategory(items: VodItem[], category: string): VodItem[] {
  return items.map((item) => ({ ...item, category: item.category || category }));
}

/** `qiyi$$$youku` + `第1集$url#第2集$url$$$...` -> 播放组 */
function parsePlaySources(v: CmsVod): { from: string[]; episodes: Episode[][] } {
  const from = (v.vod_play_from ?? "").split("$$$").filter(Boolean);
  const groups = (v.vod_play_url ?? "").split("$$$").filter(Boolean);
  const episodes = groups.map((group) =>
    group
      .split("#")
      .filter(Boolean)
      .map((ep) => {
        const dollar = ep.indexOf("$");
        const name = dollar >= 0 ? ep.slice(0, dollar) : ep;
        const url = dollar >= 0 ? ep.slice(dollar + 1) : "";
        return { name, url, parse: /\.(m3u8|mp4|flv|ts)(\?|$)/i.test(url) ? 0 : 1 };
      })
  );
  if (!from.length && episodes.length) from.push("播放");
  return { from, episodes };
}

export class CmsSpider implements Spider {
  readonly key: string;
  readonly name: string;
  private readonly api: string;

  private readonly cmsType: number;

  constructor(key: string, name: string, api: string, cmsType = 0) {
    this.key = key;
    this.name = name;
    this.api = api;
    this.cmsType = cmsType;
  }

  init() {}

  /** 列表动作参数: type 1 用 ac=detail(标准 JSON 接口), 其余用 ac=videolist */
  private get listAc() {
    return this.cmsType === 1 ? "detail" : "videolist";
  }

  private async request(query: string): Promise<CmsResp> {
    const url = `${this.api}${this.api.includes("?") ? "&" : "?"}${query}`;
    const res = await fetch(url, { headers: headersOf(this.api), cache: "no-store", signal: AbortSignal.timeout(12000) });
    if (!res.ok) throw new Error(`源请求失败 HTTP ${res.status}`);
    const text = await res.text();
    if (text.trimStart().startsWith("<")) return parseXmlResp(text); // 部分 type 0 源实为 XML 接口
    return JSON.parse(text) as CmsResp;
  }

  async homeContent() {
    const [meta, latest] = await Promise.all([this.request("ac=list"), this.request(`ac=${this.listAc}&pg=1`)]);
    const classes = (meta.class ?? []).map((c) => ({ type_id: String(c.type_id), type_name: c.type_name }));
    if (!classes.length) {
      // 部分 XML 接口不提供分类表, 从列表 tid/type 去重反推
      const seen = new Set<string>();
      for (const v of [...(meta.list ?? []), ...(latest.list ?? [])]) {
        if (v.tid && v.type_name && !seen.has(v.tid)) {
          seen.add(v.tid);
          classes.push({ type_id: v.tid, type_name: v.type_name });
        }
      }
    }
    let list = (latest.list ?? []).map(toVodItem);
    if (!list.length && classes.length) {
      const candidates = await Promise.all(
        classes.slice(0, 8).map(async (item) => {
          try {
            const data = await this.request(`ac=${this.listAc}&t=${encodeURIComponent(item.type_id)}&pg=1`);
            return withCategory((data.list ?? []).map(toVodItem), item.type_name);
          } catch {
            return [] as VodItem[];
          }
        })
      );
      list = candidates.find((items) => items.length) ?? [];
    }
    return { class: classes, list };
  }

  async homeVideoContent() {
    return { list: [] };
  }

  async categoryContent(tid: string, pg: number, _filter: boolean, extend: Record<string, string>) {
    const extra = Object.entries(extend)
      .filter(([key, v]) => v && v !== "全部" && !["tid", "pg", "from"].includes(key))
      .map(([k, v]) => `&${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join("");
    const data = await this.request(`ac=${this.listAc}&t=${encodeURIComponent(tid)}&pg=${pg}${extra}`);
    return { list: (data.list ?? []).map(toVodItem) };
  }

  async detailContent(ids: string[]) {
    const data = await this.request(`ac=${this.listAc}&ids=${encodeURIComponent(ids[0])}`);
    const v = data.list?.[0];
    if (!v) throw new Error(`未找到影片: ${ids[0]}`);
    const { from, episodes } = parsePlaySources(v);
    const detail: VodDetail = {
      ...toVodItem(v),
      actors: v.vod_actor ?? "",
      director: v.vod_director ?? "",
      content: stripHtml(v.vod_content ?? ""),
      vod_play_from: from,
      vod_play_url: episodes,
    };
    return detail;
  }

  async searchContent(key: string) {
    let data: CmsResp | null = null;
    for (const variant of searchQueryVariants(key)) {
      try {
        const result = await this.request(`ac=${this.listAc}&wd=${encodeURIComponent(variant)}`);
        data = result;
        if ((result.list ?? []).length) break;
      } catch {
        data ??= null;
      }
    }
    if ((data?.list ?? []).length) return { list: (data!.list ?? []).map(toVodItem) };

    const meta = await this.request("ac=list").catch(() => null);
    const classes = (meta?.class ?? []).slice(0, 8);
    const pages = await Promise.all(
      classes.map(async (item) => {
        try {
          const page = await this.request(`ac=${this.listAc}&t=${encodeURIComponent(item.type_id)}&pg=1`);
          return withCategory((page.list ?? []).map(toVodItem), item.type_name);
        } catch {
          return [] as VodItem[];
        }
      })
    );
    const seen = new Set<string>();
    const list = pages
      .flat()
      .filter((item) => {
        const name = item.vod_name.trim();
        if (!name || seen.has(name)) return false;
        seen.add(name);
        return relevanceScore(name, key) <= 4;
      })
      .sort((left, right) => relevanceScore(left.vod_name, key) - relevanceScore(right.vod_name, key))
      .slice(0, 30);
    return { list };
  }

  /** id 格式与全站约定一致: `vodId|播放组序号|集序号`。
   * T4(type 4)聚合接口: 剧集地址非直链时先请求 ?ac=player 取真实流。 */
  async playerContent(flag: string, id: string) {
    const [vid, src, ep] = id.split("|");
    const detail = await this.detailContent([vid]);
    const group = detail.vod_play_url[Number(src) ?? 0] ?? detail.vod_play_url[0];
    const episode = group?.[Number(ep) ?? 0] ?? group?.[0];
    if (!episode?.url) throw new Error(`未找到播放地址: ${id}`);
    const header = headersOf(this.api);

    if (this.cmsType === 4 && !isDirectStream(episode.url)) {
      for (const param of [`id=${encodeURIComponent(episode.url)}`, `url=${encodeURIComponent(episode.url)}`]) {
        try {
          const d = await this.request(`ac=player&${param}`) as CmsResp & Record<string, unknown>;
          for (const k of ["url", "playUrl", "videoUrl", "src", "source", "link", "durl", "video", "redirect"]) {
            const s = d[k];
            if (typeof s === "string" && s.startsWith("http") && isDirectStream(s)) {
              return { parse: 0, url: s, header, playUrl: "" };
            }
          }
        } catch {
          /* 尝试下一种参数 */
        }
      }
    }
    return {
      parse: isDirectStream(episode.url) ? 0 : 1,
      url: episode.url,
      header,
      playUrl: "",
    };
  }
}
