import { NextResponse } from "next/server";
import { getCSP } from "@/lib/engines/registry";
import { withSourceList } from "@/lib/with-source";
import type { VodItem } from "@/lib/types";

/**
 * 首页聚合: 并行拉取多个启用 CMS 源的最新内容并按片名去重合并。
 * 请求体 { sources: [{ url, key }] }, 上限 8 个源防止雪崩。
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { sources?: { url: string; key: string }[] };
    const sources = (body.sources ?? []).filter((s) => s.url && s.key).slice(0, 8);
    if (!sources.length) return NextResponse.json({ list: [], error: "无可聚合的源" });

    const results = await Promise.all(
      sources.map(async ({ url, key }) => {
        try {
          const data = await (await getCSP(key, url)).homeContent(true);
          return {
            list: withSourceList(Array.isArray(data.list) ? data.list : [], key, url),
            classes: Array.isArray(data.class) ? data.class : [],
          };
        } catch {
          return { list: [] as VodItem[], classes: [] };
        }
      })
    );

    const seen = new Set<string>();
    const list: VodItem[] = [];
    for (const item of results.flatMap((r) => r.list)) {
      const name = (item.vod_name ?? "").trim();
      if (!name) continue;
      const dedupeKey = name;
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);
      list.push(item);
    }
    return NextResponse.json({ list, aggregated: sources.length });
  } catch (e) {
    return NextResponse.json({ list: [], error: (e as Error).message });
  }
}
