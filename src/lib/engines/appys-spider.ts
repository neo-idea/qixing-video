import { createDecipheriv } from "node:crypto";
import type { Episode, SourceBean, Spider, VodDetail, VodItem } from "@/lib/types";
import { isDirectStream } from "./stream-url";

/**
 * AppYs / AppGet 引擎移植(StreamLib iOS AppYsEngine):
 *   csp_AppYs / csp_AppYsV2  — type 3 特例, ext 携带接口地址
 *   csp_AppGet / csp_AppGet2 — 同协议 + AES-128-CBC 加密响应(ext.key/ext.iv)
 * 三种路径风格: api.php/app -> app, xgapp.php -> xgapp, .vod -> vod。
 */

type Json = Record<string, unknown>;

const PLAYER_KEYS = ["url", "playUrl", "videoUrl", "src", "link", "jx"];
const T4_PLAYER_KEYS = ["url", "playUrl", "videoUrl", "src", "source", "link", "durl", "video", "redirect"];

const UA = { "User-Agent": "okhttp/3.15" };

function headersOf(api: string) {
  const h: Record<string, string> = { ...UA, Accept: "application/json, */*" };
  try {
    const origin = new URL(api).origin;
    h.Referer = `${origin}/`;
    h.Origin = origin;
  } catch {
    /* 无效地址时仅 UA */
  }
  return h;
}

function aesDecryptBase64(base64: string, key: string, iv: string): string | null {
  try {
    const data = Buffer.from(base64.trim(), "base64");
    const keyBuf = Buffer.from(key, "utf8");
    const ivBuf = Buffer.from(iv, "utf8");
    if (!data.length || ![16, 24, 32].includes(keyBuf.length) || ivBuf.length !== 16) return null;
    const decipher = createDecipheriv(`aes-${keyBuf.length * 8}-cbc`, keyBuf, ivBuf);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}

function str(v: unknown): string {
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  return "";
}

/** AppYs 列表字段与 MacCMS 同名(vod_*), 做宽松映射 */
function toItem(raw: Json): VodItem {
  const name = str(raw.vod_name ?? raw.name);
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.codePointAt(0)!) >>> 0;
  const h1 = hash % 360;
  const h2 = (h1 + 40 + (hash % 60)) % 360;
  return {
    vod_id: str(raw.vod_id ?? raw.id),
    vod_name: name,
    vod_pic: str(raw.vod_pic ?? raw.pic),
    vod_remarks: str(raw.vod_remarks ?? raw.note ?? raw.remarks),
    vod_score: str(raw.vod_score ?? raw.score),
    category: str(raw.type_name ?? raw.category),
    year: str(raw.vod_year ?? raw.year),
    area: str(raw.vod_area ?? raw.area),
    actors: str(raw.vod_actor ?? raw.actor),
    director: str(raw.vod_director ?? raw.director),
    content: str(raw.vod_content ?? raw.content).replace(/<[^>]+>/g, ""),
    gradient: [`hsl(${h1} 45% 16%)`, `hsl(${h2} 55% 28%)`],
  };
}

function episodesOf(url: string): Episode[] {
  return url
    .split("#")
    .filter(Boolean)
    .map((ep, idx) => {
      const dollar = ep.indexOf("$");
      const name = dollar > 0 ? ep.slice(0, dollar) : "";
      const target = dollar > 0 ? ep.slice(dollar + 1) : ep;
      return {
        name: name || `第${idx + 1}集`,
        url: target,
        parse: isDirectStream(target) ? 0 : 1,
      };
    });
}

export class AppYsSpider implements Spider {
  readonly key: string;
  readonly name: string;
  private base: string;
  private readonly aesKey?: string;
  private readonly aesIV?: string;
  private readonly style: "app" | "xgapp" | "vod";

  constructor(bean: SourceBean) {
    this.key = bean.key;
    this.name = bean.name;
    let base = "";
    let key: string | undefined;
    let iv: string | undefined;
    const ext = bean.ext;
    if (typeof ext === "string" && ext.startsWith("http")) {
      base = ext.split("###")[0];
    } else if (ext && typeof ext === "object") {
      const obj = ext as Json;
      base = str(obj.url ?? obj.api);
      base = base.split("###")[0];
      if (bean.api === "csp_AppGet" || bean.api === "csp_AppGet2") {
        key = str(obj.key ?? obj.dataKey) || undefined;
        iv = str(obj.iv ?? obj.dataIv) || undefined;
      }
      // AppGet2 中转: url 为空时 site 指向的 JSON 才是真实接口地址(异步解析)
      if (!base && typeof obj.site === "string" && obj.site.startsWith("http")) {
        this.siteUrl = obj.site;
      }
    }
    if (!base && !this.siteUrl) throw new Error(`「${bean.name}」ext 未配置接口地址`);
    this.base = base ? (base.endsWith("/") ? base : `${base}/`) : "";
    this.aesKey = key;
    this.aesIV = iv;
    const lowered = this.base.toLowerCase();
    this.style = lowered.includes("xgapp.php")
      ? "xgapp"
      : lowered.includes(".vod")
        ? "vod"
        : "app";
  }

  private siteUrl?: string;
  private basePromise?: Promise<string>;

  /** ext.url 为空时通过 ext.site 指向的 JSON 解析真实接口地址(缓存) */
  private async ensureBase(): Promise<string> {
    if (this.base) return this.base;
    this.basePromise ??= (async () => {
      const res = await fetch(this.siteUrl!, { cache: "no-store", signal: AbortSignal.timeout(10000) });
      const text = (await res.text()).trim();
      let url = text;
      try {
        const j = JSON.parse(text) as Json;
        url = str(j.url ?? j.api) || text;
      } catch {
        /* 纯文本 URL */
      }
      if (!/^https?:\/\//.test(url)) throw new Error(`「${this.name}」接口地址解析失败`);
      this.base = url.endsWith("/") ? url : `${url}/`;
      return this.base;
    })();
    return this.basePromise;
  }

  init() {}

  private async request(query: string): Promise<Json> {
    const base = await this.ensureBase();
    const url = `${base}${base.includes("?") ? "&" : "?"}${query}`;
    const res = await fetch(url, { headers: headersOf(base), cache: "no-store", signal: AbortSignal.timeout(12000) });
    if (!res.ok) throw new Error(`源请求失败 HTTP ${res.status}`);
    const text = await res.text();
    try {
      return JSON.parse(text) as Json;
    } catch {
      /* AppGet: AES-128-CBC 解密 base64 响应 */
    }
    if (this.aesKey && this.aesIV) {
      const plain = aesDecryptBase64(text, this.aesKey, this.aesIV);
      if (plain) {
        try {
          return JSON.parse(plain) as Json;
        } catch {
          /* fallthrough */
        }
      }
    }
    throw new Error(`「${this.name}」响应解析失败`);
  }

  private listPayload(d: Json): Json[] {
    const list = d.list;
    if (Array.isArray(list)) return list as Json[];
    const data = d.data;
    if (data && typeof data === "object" && !Array.isArray(data)) {
      const nested = (data as Json).list;
      if (Array.isArray(nested)) return nested as Json[];
    }
    if (Array.isArray(data)) return data as Json[];
    return [];
  }

  private toList(d: Json): VodItem[] {
    return this.listPayload(d).map(toItem);
  }

  async homeContent() {
    const d = await this.request("ac=list");
    const cls = Array.isArray(d.class) ? (d.class as Json[]) : [];
    return {
      class: cls.map((c) => ({ type_id: str(c.type_id), type_name: str(c.type_name) })),
      list: [],
    };
  }

  async homeVideoContent() {
    return { list: [] };
  }

  async categoryContent(tid: string, pg: number) {
    const d = await this.request(`ac=detail&t=${encodeURIComponent(tid)}&pg=${pg || 1}`);
    return { list: this.toList(d) };
  }

  async detailContent(ids: string[]): Promise<VodDetail> {
    const d = await this.request(`ac=detail&ids=${encodeURIComponent(ids[0])}`);
    const first = this.toList(d)[0];
    if (!first) throw new Error(`未找到影片: ${ids[0]}`);
    const routes = this.parseRoutes(d, first);
    const detail: VodDetail = {
      ...first,
      vod_play_from: routes.map((r) => r.name),
      vod_play_url: routes.map((r) => r.eps),
    };
    return detail;
  }

  async searchContent(key: string) {
    const d = await this.request(`ac=detail&wd=${encodeURIComponent(key)}`);
    return { list: this.toList(d) };
  }

  /** id 格式与全站约定一致: `vodId|播放组序号|集序号` */
  async playerContent(flag: string, id: string) {
    const [vid, src, ep] = id.split("|");
    const detail = await this.detailContent([vid]);
    const group = detail.vod_play_url[Number(src) ?? 0] ?? detail.vod_play_url[0];
    const episode = group?.[Number(ep) ?? 0] ?? group?.[0];
    if (!episode?.url) throw new Error(`未找到播放地址: ${id}`);
    const header = headersOf(await this.ensureBase());
    // 先走 ac=player 接口探测真实流地址
    try {
      const d = await this.request(`ac=player&url=${encodeURIComponent(episode.url)}`);
      for (const k of PLAYER_KEYS) {
        const s = str(d[k]);
        if (s.startsWith("http")) {
          return { parse: isDirectStream(s) ? 0 : 1, url: s, header, playUrl: "" };
        }
      }
    } catch {
      /* 接口不可用时回落剧集原地址 */
    }
    return {
      parse: isDirectStream(episode.url) ? 0 : 1,
      url: episode.url,
      header,
      playUrl: "",
    };
  }

  /** app: data.vod_url_with_player[]; xgapp: data.vod_info.vod_url_with_player[]; vod: data.vod_play_list[] */
  private parseRoutes(payload: Json, fallback: VodItem): { name: string; eps: Episode[] }[] {
    const routes: { name: string; eps: Episode[] }[] = [];
    const data = (payload.data ?? {}) as Json;
    const info = (data.vod_info ?? {}) as Json;

    const pushList = (arr: unknown) => {
      if (!Array.isArray(arr)) return;
      for (const entry of arr as Json[]) {
        const name = str(entry.name ?? entry.code);
        const url = str(entry.url);
        if (url) routes.push({ name: name || "播放", eps: episodesOf(url) });
      }
    };

    if (this.style === "app") {
      pushList(data.vod_url_with_player);
    } else if (this.style === "xgapp") {
      pushList(info.vod_url_with_player);
    } else {
      const playList = data.vod_play_list;
      if (Array.isArray(playList)) {
        for (const pl of playList as Json[]) {
          const pInfo = (pl.player_info ?? {}) as Json;
          const nestedInfo = (pInfo.info ?? {}) as Json;
          const name = str(pInfo.from ?? pInfo.show);
          const url = str(nestedInfo.url ?? pl.url);
          if (url) routes.push({ name: name || "播放", eps: episodesOf(url) });
        }
      }
      if (!routes.length) pushList(data.vod_url_with_player);
    }
    // 回落: 顶层 vod_play_from / vod_play_url
    if (!routes.length) {
      const raw = payload as unknown as { vod_play_from?: string; vod_play_url?: string };
      const groups = (raw.vod_play_url ?? "").split("$$$").filter(Boolean);
      const names = (raw.vod_play_from ?? "").split("$$$").filter(Boolean);
      groups.forEach((g, i) => routes.push({ name: names[i] || "播放", eps: episodesOf(g) }));
    }
    if (!routes.length && fallback) {
      // 单集兜底: 无法解析路由时不可播
    }
    return routes;
  }
}

export { T4_PLAYER_KEYS };
