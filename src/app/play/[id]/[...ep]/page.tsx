import { cookies } from "next/headers";
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
}
