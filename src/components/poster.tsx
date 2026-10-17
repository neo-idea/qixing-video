import type { VodItem } from "@/lib/types";

export function Poster({ item, wide = false, compact = false }: { item: VodItem; wide?: boolean; compact?: boolean }) {
  return (
    <div
      className={`poster-noise relative w-full overflow-hidden ${wide ? "aspect-video" : "aspect-[2/3]"}`}
      style={{
        background: `radial-gradient(120% 80% at 20% 0%, ${item.gradient[1]} 0%, transparent 58%), linear-gradient(155deg, ${item.gradient[0]} 0%, var(--surface-page) 96%)`,
      }}
    >
      <div aria-hidden className="absolute -right-4 top-3 select-none text-[110px] leading-none opacity-20 blur-[0.5px] sm:text-[135px]">
        {item.vod_pic}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-1" style={{ background: `linear-gradient(90deg, ${item.gradient[1]}, transparent)` }} />
      {!compact ? (
        <div className="absolute inset-x-0 bottom-0 p-3">
          <p className="truncate text-[13px] font-bold tracking-wide text-white drop-shadow">{item.vod_name}</p>
          <p className="mt-1 truncate text-[10px] text-white/60">{item.year} · {item.area}</p>
        </div>
      ) : null}
      {item.vod_score ? (
        <span className="absolute left-2 top-2 rounded-md border border-white/15 bg-black/60 px-1.5 py-0.5 text-[11px] font-black text-cinema-brand-soft backdrop-blur">
          {item.vod_score}
        </span>
      ) : null}
      <span className="absolute right-2 top-2 max-w-[62%] truncate rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white/75 backdrop-blur">
        {item.vod_remarks}
      </span>
    </div>
  );
}
