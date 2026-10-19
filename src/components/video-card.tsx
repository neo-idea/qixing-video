import Link from "next/link";
import type { VodItem } from "@/lib/types";
import { Poster } from "./poster";

export function VideoCard({ item, site, rank }: { item: VodItem; site?: string; rank?: number }) {
  const key = site ?? item.sourceKey;
  const origin = item.sourceOrigin;
  const query = key ? `?site=${encodeURIComponent(key)}${origin ? `&from=${encodeURIComponent(origin)}` : ""}` : "";

  return (
    <Link href={`/detail/${item.vod_id}${query}`} className="group block outline-none focus-visible:ring-2 focus-visible:ring-cinema-brand-soft" aria-label={`${item.vod_name} 详情`}>
      <div className="movie-sheen relative overflow-hidden rounded-xl bg-cinema-elevated ring-1 ring-white/8 transition duration-200 group-hover:-translate-y-1.5 group-hover:ring-cinema-brand/45 group-hover:shadow-cinematic group-active:translate-y-0 group-active:scale-[0.98]">
        {typeof rank === "number" ? (
          <span className={`absolute left-0 top-0 z-10 rounded-br-xl px-2.5 py-1 text-xs font-black italic ${rank <= 3 ? "bg-cinema-hot text-white" : "bg-black/72 text-cinema-muted"}`}>
            {rank}
          </span>
        ) : null}
        <Poster item={item} />
        <span className="absolute inset-0 grid place-items-center bg-black/45 opacity-0 transition duration-200 group-hover:opacity-100">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-cinema-brand/95 text-cinema-on-brand shadow-brand-glow">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86a1 1 0 0 0-1.5.86Z"/></svg>
          </span>
        </span>
      </div>
      <div className="mt-2.5 flex items-start justify-between gap-2">
        <p className="min-w-0 flex-1 truncate text-sm font-medium text-cinema-primary transition-colors group-hover:text-cinema-brand-soft">{item.vod_name}</p>
        {item.vod_score ? <span className="shrink-0 text-xs font-bold text-cinema-warning">{item.vod_score}</span> : null}
      </div>
      <p className="mt-1 truncate text-xs text-cinema-subtle">{item.vod_remarks || `${item.year} · ${item.category}`}</p>
    </Link>
  );
}
