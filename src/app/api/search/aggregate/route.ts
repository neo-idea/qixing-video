import { NextResponse } from "next/server";
import { getCSP } from "@/lib/engines/registry";
import { withSourceList } from "@/lib/with-source";
import { aggregateSearch } from "@/lib/search-aggregate";
import type { VodItem } from "@/lib/types";

/**
 * 聚合搜索端点: POST { q, sources: [{url, key, name}] }
 * 服务端并发全部源(8s 单源超时、熔断、LRU 缓存、归一化去重),
 * 返回按源分组 + 聚合视图 + 熔断跳过数。
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { q?: string; sources?: { url: string; key: string; name: string }[] };
    const q = (body.q ?? "").trim();
    const sources = (body.sources ?? []).filter((s) => s?.url && s?.key).slice(0, 64);
    if (!q || !sources.length) return NextResponse.json({ groups: [], aggregated: [], skippedCircuit: 0, error: "缺少参数" });

    const result = await aggregateSearch(q, sources, async (source) => {
      const spider = await getCSP(source.key, source.url);
      const data = await spider.searchContent(q, false);
      return withSourceList(Array.isArray(data.list) ? data.list : [], source.key, source.url);
    });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ groups: [], aggregated: [], skippedCircuit: 0, error: (e as Error).message });
  }
}
