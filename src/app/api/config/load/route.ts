import { NextRequest, NextResponse } from "next/server";
import { inspectSubscription, fetchSiteConfig, normalizeApiUrl } from "@/lib/engines/config-store";
import { siteConfig } from "@/lib/config";
import type { SiteConfig } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * 对应 APK oo0oO0.loadConfig():
 * api_url 支持 `地址;pk;密码`, 下载后经 FindResult 解密,
 * 校验 sites 字段后返回标准化配置。解析失败时回落到内置演示源。
 * 额外支持 `urls` 多线路订阅: 返回线路列表由前端选择后二次加载。
 */
export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("url") ?? "";
  if (!raw.trim()) return NextResponse.json(siteConfig);

  try {
    let json: SiteConfig;
    try {
      json = await fetchSiteConfig(raw);
    } catch (e) {
      if ((e as Error).message !== "SUBSCRIPTION") throw e;
      // 多线路订阅: 不含 sites, 携带线路列表回落内置源, 由设置页选择线路
      const subscription = await inspectSubscription(raw);
      return NextResponse.json({
        ...siteConfig,
        subscription,
        warningText: `检测到多线路订阅(${subscription.lines.length} 条), 请在下方选择线路`,
      });
    }
    return NextResponse.json({ ...json, remote: true });
  } catch (e) {
    return NextResponse.json(
      {
        error: (e as Error).message,
        ...siteConfig,
        requestedUrl: normalizeApiUrl(raw),
        warningText: `接口加载失败: ${(e as Error).message}，已回落内置演示源`,
      },
      { status: 200 }
    );
  }
}
