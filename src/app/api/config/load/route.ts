import { NextRequest, NextResponse } from "next/server";
import { siteConfig } from "@/lib/config";
import { findResult } from "@/lib/find-result";
import type { SiteConfig } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * 对应 APK oo0oO0.loadConfig():
 * api_url 支持 `地址;pk;密码`, 下载后经 FindResult 解密,
 * 校验 sites 字段后返回标准化配置。解析失败时回落到内置演示源。
 */
export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("url") ?? "";
  if (!raw.trim()) return NextResponse.json(siteConfig);

  const [addr, pk] = raw.includes(";pk;") ? raw.split(";pk;") : [raw, null];
  let url = addr.trim();
  if (!/^https?:\/\//i.test(url)) url = `http://${url}`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "okhttp/3.15" },
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    const decoded = findResult(text, pk);
    if (!decoded) throw new Error("配置解密失败");
    const json = JSON.parse(decoded) as SiteConfig;
    if (!Array.isArray(json.sites) || !json.sites.length) throw new Error("配置缺少 sites 字段");
    json.parses ??= [];
    json.flags ??= [];
    json.rules ??= [];
    return NextResponse.json(json);
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message, ...siteConfig, warningText: `接口加载失败: ${(e as Error).message}，已回落内置演示源` },
      { status: 200 }
    );
  }
}
