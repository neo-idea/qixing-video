import { siteConfig } from "@/lib/config";
import { findResult } from "@/lib/find-result";
import type { SiteConfig, SubscriptionLine } from "@/lib/types";

/**
 * 服务端配置解析与缓存(对应 APK oo0oO0.loadConfig 的服务端承载):
 * - 空 url -> 内置演示源
 * - 下载 -> FindResult 解密 -> 校验 sites
 * - 失败回落内置源并携带 error 说明
 * TTL 缓存避免每次请求都回源下载。
 */

const TTL_MS = 10 * 60 * 1000;

const cache = new Map<string, { config: SiteConfig; at: number }>();

export interface ResolvedConfig {
  config: SiteConfig;
  source: "builtin" | "remote";
  error?: string;
}

export function normalizeApiUrl(raw: string): string {
  let url = raw.trim();
  if (!/^https?:\/\//i.test(url)) url = `http://${url}`;
  return url;
}

/**
 * 字符串感知的注释剥离: 仅剔除字符串字面量之外的 // 与 # 注释,
 * 避免 URL 中的 # 或 // 被误伤。
 */
function stripJsonComments(text: string): string {
  let out = "";
  let inStr = false;
  let esc = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (esc) {
      out += ch;
      esc = false;
      continue;
    }
    if (ch === "\\" && inStr) {
      out += ch;
      esc = true;
      continue;
    }
    if (ch === '"') {
      inStr = !inStr;
      out += ch;
      continue;
    }
    if (!inStr && (ch === "#" || (ch === "/" && text[i + 1] === "/"))) {
      while (i < text.length && text[i] !== "\n") i++;
      out += "\n";
      continue;
    }
    out += ch;
  }
  return out;
}

/** 字符串感知的尾随逗号移除: ,\s*}\] 场景 */
function stripTrailingCommas(text: string): string {
  let out = "";
  let inStr = false;
  let esc = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (esc) {
      out += ch;
      esc = false;
      continue;
    }
    if (ch === "\\" && inStr) {
      out += ch;
      esc = true;
      continue;
    }
    if (ch === '"') inStr = !inStr;
    if (ch === "," && !inStr) {
      let j = i + 1;
      while (j < text.length && /\s/.test(text[j])) j++;
      if (text[j] === "}" || text[j] === "]") continue; // 丢弃尾随逗号
    }
    out += ch;
  }
  return out;
}

/**
 * 宽松 JSON 解析: 真实世界配置常含 BOM、裸控制字符、// 与 # 注释
 * (JSONC 风格, TVBox 客户端解析器宽容处理)与尾随逗号,
 * Node JSON.parse 严格拒绝。此处逐级清理后重试。
 */
function parseLoose(text: string): unknown {
  const body = text.replace(/^\ufeff/, "");
  try {
    return JSON.parse(body);
  } catch {
    /* 继续宽松清理 */
  }
  const noComments = stripJsonComments(body);
  let out = "";
  let inStr = false;
  let esc = false;
  for (const ch of noComments) {
    const code = ch.charCodeAt(0);
    if (esc) {
      out += ch;
      esc = false;
      continue;
    }
    if (ch === "\\" && inStr) {
      out += ch;
      esc = true;
      continue;
    }
    if (ch === '"') inStr = !inStr;
    if (inStr && code < 0x20) continue; // 丢弃字符串内的裸控制字符
    out += ch;
  }
  try {
    return JSON.parse(out);
  } catch {
    return JSON.parse(stripTrailingCommas(out));
  }
}
/** 下载并解密一份 TVBox 配置; 解析结果不含 sites 时抛错 */
export async function fetchSiteConfig(raw: string): Promise<SiteConfig> {
  const [addr, pk] = raw.includes(";pk;") ? raw.split(";pk;") : [raw, null];
  const url = normalizeApiUrl(addr);
  const res = await fetch(url, {
    headers: { "User-Agent": "okhttp/3.15" },
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const decoded = findResult(await res.text(), pk);
  if (!decoded) throw new Error("配置解密失败");
  const json = parseLoose(decoded) as SiteConfig;
  if (!Array.isArray(json.sites) || !json.sites.length) {
    if (Array.isArray((json as { urls?: unknown }).urls)) throw new Error("SUBSCRIPTION");
    throw new Error("配置缺少 sites 字段");
  }
  json.parses ??= [];
  json.flags ??= [];
  json.rules ??= [];
  return json;
}

/** 带 TTL 缓存的配置解析, 供 /api/config/load 与各站点路由共用 */
export async function resolveConfig(raw: string | null | undefined): Promise<ResolvedConfig> {
  const url = (raw ?? "").trim();
  if (!url) return { config: siteConfig, source: "builtin" };
  const hit = cache.get(url);
  if (hit && Date.now() - hit.at < TTL_MS) return { config: hit.config, source: "remote" };
  try {
    const config = await fetchSiteConfig(url);
    cache.set(url, { config, at: Date.now() });
    return { config, source: "remote" };
  } catch (e) {
    return { config: siteConfig, source: "builtin", error: (e as Error).message };
  }
}

/** 多线路订阅(urls 结构)解析 */
export async function fetchSubscription(raw: string): Promise<{ lines: SubscriptionLine[] }> {
  const [addr] = raw.split(";pk;");
  const url = normalizeApiUrl(addr);
  const res = await fetch(url, {
    headers: { "User-Agent": "okhttp/3.15" },
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const decoded = findResult(await res.text(), null);
  if (!decoded) throw new Error("订阅解密失败");
  const json = parseLoose(decoded) as { urls?: { url: string; name?: string }[] };
  if (!Array.isArray(json.urls) || !json.urls.length) throw new Error("订阅缺少 urls 字段");
  return {
    lines: json.urls.map((line, index) => ({
      url: line.url,
      name: line.name?.trim() || `线路 ${index + 1}`,
    })),
  };
}
