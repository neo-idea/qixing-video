import type { Episode, Spider, VodDetail, VodItem } from "@/lib/types";

/**
 * MacCMS(JSON) 采集站引擎, 对应 APK 中 type 0/4 的 SortSpider 链路:
 *   首页/分类: ?ac=videolist(&t=&pg=)   详情: ?ac=videolist&ids=
 *   搜索: ?ac=videolist&wd=
 * 全部走真实 HTTP 请求, 不再使用演示数据。
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
  const classes = [...text.matchAll(/<type id="([^"]*)">([\\s\S]*?)<\/type>/g)].map((m) => ({
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

const UA = { "User-Agent": "okhttp/3.15" };

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

  constructor(key: string, name: string, api: string) {
    this.key = key;
    this.name = name;
    this.api = api;
  }

  init() {}

  private async request(query: string): Promise<CmsResp> {
    const url = `${this.api}${this.api.includes("?") ? "&" : "?"}${query}`;
    const res = await fetch(url, { headers: UA, cache: "no-store", signal: AbortSignal.timeout(12000) });
    if (!res.ok) throw new Error(`源请求失败 HTTP ${res.status}`);
    const text = await res.text();
    if (text.trimStart().startsWith("<")) return parseXmlResp(text); // 部分 type 0 源实为 XML 接口
    return JSON.parse(text) as CmsResp;
  }

  async homeContent() {
    const [meta, latest] = await Promise.all([this.request("ac=list"), this.request("ac=videolist")]);
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
    return { class: classes, list: (latest.list ?? []).map(toVodItem) };
  }

  async homeVideoContent() {
    return { list: [] };
  }

  async categoryContent(tid: string, pg: number, _filter: boolean, extend: Record<string, string>) {
    const extra = Object.entries(extend)
      .filter(([, v]) => v && v !== "全部")
      .map(([k, v]) => `&${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join("");
    const data = await this.request(`ac=videolist&t=${encodeURIComponent(tid)}&pg=${pg}${extra}`);
    return { list: (data.list ?? []).map(toVodItem) };
  }

  async detailContent(ids: string[]) {
    const data = await this.request(`ac=videolist&ids=${encodeURIComponent(ids[0])}`);
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
    const data = await this.request(`ac=videolist&wd=${encodeURIComponent(key)}`);
    return { list: (data.list ?? []).map(toVodItem) };
  }

  /** id 格式与演示链路一致: `vodId|播放组序号|集序号` */
  async playerContent(flag: string, id: string) {
    const [vid, src, ep] = id.split("|");
    const detail = await this.detailContent([vid]);
    const group = detail.vod_play_url[Number(src) ?? 0] ?? detail.vod_play_url[0];
    const episode = group?.[Number(ep) ?? 0] ?? group?.[0];
    if (!episode?.url) throw new Error(`未找到播放地址: ${id}`);
    return {
      parse: episode.parse ?? 0,
      url: episode.url,
      header: { ...UA, Referer: new URL(this.api).origin },
      playUrl: "",
    };
  }
}
