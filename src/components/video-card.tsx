import Link from "next/link";
import type { VodItem } from "@/lib/types";
import { Poster } from "./poster";

export function VideoCard({ item, site, rank }: { item: VodItem; site?: string; rank?: number }) {
  return (
    <Link href={`/detail/${item.vod_id}${site ? `?site=${site}` : ""}`} className="group block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-cinema-brand-soft" aria-label={`${item.vod_name} 详情`}>
      <div className="relative overflow-hidden rounded-2xl bg-black/40 ring-1 ring-white/10 transition duration-300 group-hover:-translate-y-1.5 group-hover:ring-cinema-brand/60 group-hover:shadow-brand-glow">
        {typeof rank === "number" ? (
          <span className="absolute left-0 top-0 z-10 rounded-br-2xl bg-gradient-to-br from-cinema-brand to-cinema-brand-strong px-3 py-1.5 text-xs font-black italic text-white shadow-brand-glow">
            {rank}
          </span>
        ) : null}
        <div className="transition-transform duration-[650ms] group-hover:scale-[1.045]">
          <Poster item={item} compact={typeof rank === "number"} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/12 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
          <span className="min-w-0 translate-y-2 text-[10px] font-semibold text-white/85 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <span className="block truncate">{item.year} · {item.area}</span>
          </span>
          <span className="grid h-10 w-10 shrink-0 translate-y-2 place-items-center rounded-full bg-white/15 text-white opacity-0 backdrop-blur transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor"><path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86a1 1 0 0 0-1.5.86Z"/></svg>
          </span>
        </div>
      </div>
      <p className="mt-2.5 truncate text-sm font-semibold text-cinema-primary transition-colors group-hover:text-cinema-brand-soft">{item.vod_name}</p>
      <p className="truncate text-[11px] text-cinema-subtle">{item.vod_remarks || `${item.year} · ${item.category}`}</p>
    </Link>
  );
}
