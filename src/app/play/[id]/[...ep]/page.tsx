import { cookies } from "next/headers";
import { getCSP } from "@/lib/engines/registry";
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
