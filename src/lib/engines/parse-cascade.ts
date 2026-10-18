import type { ParseBean } from "@/lib/types";
import { isAdDomain, isDirectStream } from "./stream-url";

/**
 * VIP 解析级联(Web 可行子集), 移植自 StreamLib iOS ParserCascade:
 *   - 仅并发 JSON 解析接口(type 1/2), 网页嗅探(type 0)需要浏览器环境
 *   - buildParseURL 拼接规则: 以 url= 结尾直接拼 / 含 url= 替换 / 否则追加
 *   - 响应判定: JSON 多 key 提取 -> HTML 正则嗅探直链
 *   - 权重记忆: 成功 +1 / 失败 -1, 夹在 0..20(默认 10), 跨次访问持续生效
 * 全并发 + 12s 预算, 返回首个命中的可播直链。
 */

const JSON_KEYS = ["url", "playUrl", "videoUrl", "parse", "stream", "src", "source", "link", "durl", "video", "redirect"];

function buildParseURL(parseUrl: string, target: string): string {
  const enc = encodeURIComponent(target);
  if (parseUrl.endsWith("url=")) return parseUrl + enc;
  const m = parseUrl.match(/url=[^&]*/);
  if (m) return parseUrl.replace(m[0], `url=${enc}`);
  const sep = parseUrl.includes("?") ? "&" : "?";
  return `${parseUrl}${sep}url=${enc}`;
}

function sniffHtml(text: string): string | null {
  const patterns = [
    /(https?:\/\/[^\s'"<>]+\.(?:m3u8|mp4|flv|mkv|webm)[^\s'"<>]*)/i,
    /["'](url|playUrl|videoUrl|src|source|stream)["']\s*:\s*["'](https?:\/\/[^"']+)["']/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) {
      const u = (m[2] ?? m[1]).replace(/\\/g, "");
      if (u.startsWith("http") && !isAdDomain(u) && isDirectStream(u)) return u;
    }
  }
  return null;
}

function extractFromJson(obj: unknown): string | null {
  if (!obj || typeof obj !== "object") return null;
  const record = obj as Record<string, unknown>;
  for (const key of JSON_KEYS) {
    const v = record[key];
    if (typeof v === "string" && v.startsWith("http") && !isAdDomain(v) && isDirectStream(v)) return v;
    if (v && typeof v === "object") {
      const nested = (v as Record<string, unknown>).url;
      if (typeof nested === "string" && nested.startsWith("http") && !isAdDomain(nested) && isDirectStream(nested)) {
        return nested;
      }
    }
  }
  return null;
}

async function resolveOne(parse: ParseBean, target: string): Promise<string | null> {
  const url = buildParseURL(parse.url, target);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36" },
      cache: "no-store",
      signal: AbortSignal.timeout(12000),
      redirect: "follow",
    });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") ?? "";
    if (/mpegurl|video\//i.test(ct) && !isAdDomain(url)) return url;
    const text = await res.text();
    const trimmed = text.trimStart();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        return extractFromJson(JSON.parse(trimmed));
      } catch {
        /* 继续嗅探 */
      }
    }
    return sniffHtml(text);
  } catch {
    return null;
  }
}

/** 解析器权重(模块级, worker 生命周期内持续): url -> 0..20 */
const WEIGHT_MAX = 20;
const weights = new Map<string, number>();

function bumpWeight(url: string, delta: number) {
  const v = Math.max(0, Math.min(WEIGHT_MAX, (weights.get(url) ?? 10) + delta));
  weights.set(url, v);
}

/** 按权重降序排序(高权重优先, 并发场景下影响命中后的记录与后续排序) */
export function sortedParsers<T extends { url: string }>(parses: T[]): T[] {
  return [...parses].sort((a, b) => (weights.get(a.url) ?? 10) > (weights.get(b.url) ?? 10) ? -1 : 1);
}

/** 并发全部 Json 解析接口, 返回首个可播直链; 无 parses 或全部失败返回 null */
export async function parseCascade(target: string, parses: ParseBean[]): Promise<string | null> {
  const jsonParses = sortedParsers(parses.filter((p) => (p.type === 1 || p.type === 2) && p.url?.startsWith("http")));
  if (!jsonParses.length || !target) return null;
  const results = await Promise.all(
    jsonParses.map(async (p) => ({ parse: p, url: await resolveOne(p, target) }))
  );
  let winner: string | null = null;
  for (const r of results) {
    bumpWeight(r.parse.url, r.url ? 1 : -1);
    if (!winner && r.url) winner = r.url;
  }
  return winner;
}
