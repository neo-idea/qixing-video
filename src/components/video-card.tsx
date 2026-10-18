import Link from "next/link";
import type { VodItem } from "@/lib/types";
import { Poster } from "./poster";

/** 腾讯视频式卡片: 2:3 海报小圆角, 标题在卡片下方, hover 轻微上浮 + 青色标题 */
export function VideoCard({ item, site, rank }: { item: VodItem; site?: string; rank?: number }) {
  return (
    <Link href={`/detail/${item.vod_id}${site ? `?site=${site}` : ""}`} className="group block outline-none focus-visible:ring-2 focus-visible:ring-cinema-brand-soft" aria-label={`${item.vod_name} 详情`}>
      <div className="relative overflow-hidden rounded-md bg-[#262626] transition duration-200 group-hover:-translate-y-1 group-hover:shadow-cinematic">
        {typeof rank === "number" ? (
          <span className={`absolute left-0 top-0 z-10 rounded-br-md px-2 py-0.5 text-xs font-black italic ${rank <= 3 ? "bg-cinema-hot text-white" : "bg-black/70 text-cinema-muted"}`}>
            {rank}
          </span>
        ) : null}
        <Poster item={item} />
        <span className="absolute inset-0 grid place-items-center bg-black/30 opacity-0 transition duration-200 group-hover:opacity-100">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-cinema-brand/90 text-[#063434]">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86a1 1 0 0 0-1.5.86Z"/></svg>
          </span>
        </span>
      </div>
      <p className="mt-2 truncate text-sm font-medium text-cinema-primary transition-colors group-hover:text-cinema-brand-soft">{item.vod_name}</p>
      <p className="mt-0.5 truncate text-xs text-cinema-subtle">{item.vod_remarks || `${item.year} · ${item.category}`}</p>
    </Link>
  );
}
