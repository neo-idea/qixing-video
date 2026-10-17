import { getCSP } from "@/lib/engines/registry";
import { PlayClient } from "./play-client";

export default async function PlayPage({
  params,
  searchParams,
}: {
  params: { id: string; ep: string[] };
  searchParams: { site?: string };
}) {
  // 兼容 /play/id/0-0 与 /play/id/0/0 两种格式
  const joined = (params.ep ?? []).join("-");
  const [, src, ep] = joined.match(/(\d+)-(\d+)/) ?? ["", "0", "0"];
  const siteKey = searchParams.site ?? "demo";
  const spider = getCSP(siteKey);
  const detail = await spider.detailContent([params.id]);
  const play = await spider.playerContent("七星蓝光", `${params.id}|${src}|${ep}`, []);
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
