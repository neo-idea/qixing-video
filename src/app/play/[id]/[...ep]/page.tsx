import { getCSP } from "@/lib/engines/registry";
import { PlayClient } from "./play-client";

export default async function PlayPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; ep: string[] }>;
  searchParams: Promise<{ site?: string }>;
}) {
  const resolvedParams = await params;
  const { site } = await searchParams;
  // 兼容 /play/id/0-0 与 /play/id/0/0 两种格式
  const joined = (resolvedParams.ep ?? []).join("-");
  const [, src, ep] = joined.match(/(\d+)-(\d+)/) ?? ["", "0", "0"];
  const siteKey = site ?? "demo";
  const spider = getCSP(siteKey);
  const detail = await spider.detailContent([resolvedParams.id]);
  const play = await spider.playerContent("七星蓝光", `${resolvedParams.id}|${src}|${ep}`, []);
  return (
    <PlayClient
      detail={detail}
      sourceIndex={Number(src)}
      episodeIndex={Number(ep)}
      play={play}
      siteKey={siteKey}
    />
  );
}
