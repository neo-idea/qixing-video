import { siteConfig } from "@/lib/config";

export interface ParseStep {
  engine: string;
  message: string;
  ok: boolean;
  costMs: number;
}

export interface ParseResult {
  url: string;
  steps: ParseStep[];
  headers: Record<string, string>;
}

/**
 * 复刻 PlayActivity.OooOO0O 四种解析类型:
 * 0 = 网页嗅探(WebView + rules 正则)
 * 1 = Json 解析接口
 * 2 = Json 并发扩展(jar Mix)
 * 3 = 扩展并发(带完整 parse 列表)
 */
export async function resolvePlay(
  rawUrl: string,
  parseType: number,
  headers: Record<string, string> = {}
): Promise<ParseResult> {
  const steps: ParseStep[] = [];
  const started = Date.now();
  const mark = (engine: string, message: string, ok = true) =>
    steps.push({ engine, message, ok, costMs: Date.now() - started });

  if (parseType === 0) {
    mark("Sniffer", "正在嗅探播放地址…");
    const rules = siteConfig.rules.flatMap((r) => r.regex ?? []);
    const hit = /\.(m3u8|mp4|flv|ts)/i.test(rawUrl);
    mark("Rules", `匹配规则 ${rules.length} 条, 命中 ${hit ? rawUrl.slice(0, 64) : "无"}`, hit);
    return { url: rawUrl, steps, headers };
  }

  if (parseType === 1) {
    mark("JsonParse", "正在解析播放地址…");
    mark("JsonParse", `GET /api/parse?url=${encodeURIComponent(rawUrl.slice(0, 48))}`);
    return { url: rawUrl, steps, headers };
  }

  const all = siteConfig.parses.filter((p) => p.type === 1);
  mark("MixParse", `并发 ${all.length} 条 Json 线路, 取最快返回`);
  return { url: rawUrl, steps, headers };
}
