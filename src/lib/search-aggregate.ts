import type { VodItem } from "@/lib/types";

/**
 * 服务端搜索聚合, 移植自 StreamLib iOS SearchService:
 *   - 每源熔断: 连续 3 次请求级失败(空结果不算) → 跳过 5 分钟
 *   - LRU 结果缓存: TTL 5 分钟, 容量 50
 *   - 片名归一化去重(括号段/画质词/尾缀年份/分隔符), 按命中源数排序
 */

export interface SearchSource {
  url: string;
  key: string;
  name: string;
}

export interface SearchHit {
  item: VodItem;
  siteKey: string;
  siteName: string;
  origin: string;
}

export interface AggregateResult {
  /** 按源分组(前端现有 UI 形态) */
  groups: { siteKey: string; siteName: string; origin: string; list: VodItem[] }[];
  /** 聚合视图: 归一化去重后的影片与全部命中源 */
  aggregated: { name: string; year: string; pic: string; sources: { siteKey: string; siteName: string; origin: string; item: VodItem }[] }[];
  skippedCircuit: number;
  fromCache: boolean;
}

interface CircuitState {
  fails: number;
  openUntil: number;
}

const CIRCUIT_THRESHOLD = 3;
const CIRCUIT_COOLDOWN_MS = 5 * 60 * 1000;
const CACHE_TTL_MS = 5 * 60 * 1000;
const CACHE_CAPACITY = 50;
const SITE_TIMEOUT_MS = 8000;

const circuits = new Map<string, CircuitState>();

const cache = new Map<string, { at: number; result: AggregateResult }>();

function recordSuccess(ref: string) {
  circuits.set(ref, { fails: 0, openUntil: 0 });
}

function recordFailure(ref: string) {
  const c = circuits.get(ref) ?? { fails: 0, openUntil: 0 };
  c.fails += 1;
  if (c.fails >= CIRCUIT_THRESHOLD) c.openUntil = Date.now() + CIRCUIT_COOLDOWN_MS;
  circuits.set(ref, c);
}

export function circuitOpen(ref: string): boolean {
  const c = circuits.get(ref);
  return Boolean(c && c.openUntil > Date.now());
}

/** 搜索结果片名归一化(searchAggregate 同款规则) */
export function normalizeName(name: string): string {
  let s = name.toLowerCase().trim();
  s = s.replace(/\[[^\][)】]*[\]】)]]?/g, "");
  s = s.replace(/[【([][\u4e00-\u9fff\w\s]*[】)\]]/g, "");
  const qualityWords = [
    "高清", "蓝光", "4k", "1080p", "720p", "bd", "hd", "web-rip", "webrip", "web-dl", "webdl",
    "dvd", "完整版", "国语版", "粤语版", "国语", "粤语", "中字", "双语", "首发", "超清", "正片",
  ];
  for (const w of qualityWords) {
    s = s.replace(new RegExp(`(?<![\\w\\u4e00-\\u9fff])${w}(?![\\w\\u4e00-\\u9fff])`, "gi"), " ");
  }
  s = s.replace(/\s*(19|20)\d{2}\s*$/g, "");
  s = s.replace(/[\s\-_·•]+/g, "");
  return s;
}

function setCache(q: string, result: AggregateResult) {
  cache.set(q, { at: Date.now(), result });
  while (cache.size > CACHE_CAPACITY) {
    const oldest = cache.keys().next().value;
    if (oldest === undefined) break;
    cache.delete(oldest);
  }
}

function aggregate(hits: SearchHit[]): AggregateResult["aggregated"] {
  const order: string[] = [];
  const map = new Map<string, AggregateResult["aggregated"][number]>();
  for (const hit of hits) {
    const key = `${normalizeName(hit.item.vod_name)}__${hit.item.year ?? ""}`;
    if (!map.has(key)) {
      map.set(key, { name: hit.item.vod_name, year: hit.item.year ?? "", pic: hit.item.vod_pic, sources: [] });
      order.push(key);
    }
    const agg = map.get(key)!;
    agg.sources.push({ siteKey: hit.siteKey, siteName: hit.siteName, origin: hit.origin, item: hit.item });
    if (!agg.pic && hit.item.vod_pic) agg.pic = hit.item.vod_pic;
  }
  return order
    .map((k) => map.get(k)!)
    .sort((a, b) => b.sources.length - a.sources.length);
}

/** 并发搜索全部源: 8s 单源超时, 空结果算成功(不进熔断), 失败计数 */
export async function aggregateSearch(
  q: string,
  sources: SearchSource[],
  searchOne: (source: SearchSource) => Promise<VodItem[]>
): Promise<AggregateResult> {
  const trimmed = q.trim();
  const cached = cache.get(trimmed);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    // 触碰 LRU 顺序
    cache.delete(trimmed);
    cache.set(trimmed, cached);
    return { ...cached.result, fromCache: true };
  }

  const ref = (s: SearchSource) => `${s.url}::${s.key}`;
  const eligible = sources.filter((s) => !circuitOpen(ref(s)));
  const skippedCircuit = sources.length - eligible.length;

  const results = await Promise.all(
    eligible.map(async (s) => {
      try {
        const items = await Promise.race([
          searchOne(s),
          new Promise<VodItem[]>((_, reject) => setTimeout(() => reject(new Error("timeout")), SITE_TIMEOUT_MS)),
        ]);
        return { source: s, ok: true as const, items };
      } catch {
        return { source: s, ok: false as const, items: [] as VodItem[] };
      }
    })
  );

  const hits: SearchHit[] = [];
  const groups: AggregateResult["groups"] = [];
  for (const r of results) {
    if (!r.ok) {
      recordFailure(ref(r.source));
      continue;
    }
    recordSuccess(ref(r.source));
    if (r.items.length) {
      groups.push({
        siteKey: r.source.key,
        siteName: r.source.name,
        origin: r.source.url,
        list: r.items,
      });
      for (const item of r.items) {
        hits.push({ item, siteKey: r.source.key, siteName: r.source.name, origin: r.source.url });
      }
    }
  }

  const result: AggregateResult = {
    groups,
    aggregated: aggregate(hits),
    skippedCircuit,
    fromCache: false,
  };
  setCache(trimmed, result);
  return result;
}
