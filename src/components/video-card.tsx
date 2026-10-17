import Link from "next/link";
import type { VodItem } from "@/lib/types";
import { Poster } from "./poster";

export function VideoCard({ item, site, rank }: { item: VodItem; site?: string; rank?: number }) {
  return (
    <Link href={`/detail/${item.vod_id}${site ? `?site=${site}` : ""}`} className="group block" aria-label={`${item.vod_name} 详情`}>
      <div className="relative overflow-hidden rounded-[10px] ring-1 ring-white/10 transition duration-300 group-hover:-translate-y-1 group-hover:ring-[#ff812b]/70 group-hover:shadow-[0_26px_60px_rgba(255,77,0,0.22)]">
        {typeof rank === "number" ? (
          <span className="absolute left-0 top-0 z-10 rounded-br-xl bg-gradient-to-br from-[#ff5b04] to-[#b62c00] px-2.5 py-1 text-xs font-black italic text-white">
            {rank}
          </span>
        ) : null}
        <div className="transition-transform duration-[650ms] group-hover:scale-[1.045]">
          <Poster item={item} compact={typeof rank === "number"} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#ff4d00]/25 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute inset-x-0 bottom-0 translate-y-3 p-3 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur">
            立即观看
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor"><path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86a1 1 0 0 0-1.5.86Z"/></svg>
          </span>
        </div>
      </div>
      <p className="mt-2.5 truncate text-sm font-semibold text-zinc-100 transition-colors group-hover:text-[#ffa257]">{item.vod_name}</p>
      <p className="truncate text-[11px] text-zinc-500">{item.year} · {item.category} · {item.vod_remarks}</p>
    </Link>
  );
}
