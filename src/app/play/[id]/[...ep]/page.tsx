import { cookies } from "next/headers";
import Link from "next/link";
import { getCSP } from "@/lib/engines/registry";
import { resolveConfig } from "@/lib/engines/config-store";
import { parseCascade } from "@/lib/engines/parse-cascade";
import { PlayClient } from "./play-client";

export default async function PlayPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; ep: string[] }>;
  searchParams: Promise<{ site?: string; from?: string }>;
}) {
  const resolvedParams = await params;
  const { site, from } = await searchParams;
  // 兼容 /play/id/0-0 与 /play/id/0/0 两种格式
  const joined = (resolvedParams.ep ?? []).join("-");
  const [, src, ep] = joined.match(/(\d+)-(\d+)/) ?? ["", "0", "0"];
  const siteKey = site ?? "demo";
  // from 参数携带源所属配置地址(多配置模式), 缺省回落 cookie
  const origin = from ?? (await cookies()).get("qx_api_url")?.value;

  try {
    const spider = await getCSP(siteKey, origin);
    const detail = await spider.detailContent([resolvedParams.id]);
    const play = await spider.playerContent("七星蓝光", `${resolvedParams.id}|${src}|${ep}`, []);
    // parse=1(VIP 页面): 尝试解析级联(Json 解析接口并发), 命中则直接可播
    if (play.parse === 1 && play.url) {
      try {
        const { config } = await resolveConfig(origin ?? "");
        const resolved = await parseCascade(play.url, config.parses);
        if (resolved) {
          play.parse = 0;
          play.url = resolved;
        }
      } catch {
        /* 解析级联不可用时保持原样 */
      }
    }
    return (
      <PlayClient
        detail={detail}
        sourceIndex={Number(src)}
        episodeIndex={Number(ep)}
        play={play}
        siteKey={siteKey}
        siteOrigin={origin ?? ""}
      />
    );
  } catch (e) {
    // 源站下架/网络失败/播放组缺失等: 渲染可恢复的错误页而非裸 500
    const message = (e as Error).message ?? "播放信息获取失败";
    const backHref = `/detail/${resolvedParams.id}?site=${encodeURIComponent(siteKey)}${origin ? `&from=${encodeURIComponent(origin)}` : ""}`;
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-cinema-warning/15">
          <svg viewBox="0 0 24 24" className="h-8 w-8 text-cinema-warning" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v5M12 16.5v.01" strokeLinecap="round" />
          </svg>
        </div>
        <h1 className="mt-5 text-lg font-bold text-cinema-primary sm:text-xl">无法播放这部影片</h1>
        <p className="mt-2.5 max-w-md text-xs leading-relaxed text-cinema-subtle sm:text-sm">{message}</p>
        <p className="mt-1.5 max-w-md text-xs leading-relaxed text-cinema-subtle">
          可能是源站已下架该片或网络波动。可回到详情页换其它源，或稍后重试。
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
          <Link
            href={backHref}
            className="flex h-11 items-center rounded bg-cinema-brand px-5 text-sm font-bold text-[#063434] transition duration-150 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft"
          >
            返回详情换源
          </Link>
          <Link
            href="/"
            className="flex h-11 items-center rounded border border-white/10 px-5 text-sm text-cinema-muted transition duration-150 active:scale-[0.97] hover:text-cinema-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft"
          >
            回首页
          </Link>
        </div>
      </div>
    );
  }
}
