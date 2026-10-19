"use client";

import { useState } from "react";
import type { VodItem } from "@/lib/types";

export function Poster({ item }: { item: VodItem; compact?: boolean }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const hasPicture = Boolean(item.vod_pic) && !failed;

  return (
    <div className="poster-fallback relative aspect-[2/3] w-full overflow-hidden rounded-[inherit] bg-cinema-elevated">
      {hasPicture ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.vod_pic}
            alt={item.vod_name}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setFailed(true)}
            onLoad={() => setLoaded(true)}
            className={`absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.04] ${loaded ? "opacity-100" : "opacity-0"}`}
          />
          {!loaded ? <div className="absolute inset-0 animate-pulse bg-white/6" /> : null}
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3 text-center">
          <span className="line-clamp-3 text-sm font-bold text-cinema-muted">{item.vod_name}</span>
          <span className="text-[11px] text-cinema-subtle">{item.category || item.year}</span>
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/65 to-transparent" />
      {item.vod_score ? (
        <span className="absolute left-2 top-2 rounded-md bg-black/65 px-1.5 py-0.5 text-[11px] font-bold text-cinema-warning backdrop-blur-sm">
          {item.vod_score}
        </span>
      ) : null}
      {item.vod_remarks ? (
        <span className="absolute bottom-2 right-2 max-w-[78%] truncate rounded-md bg-black/65 px-1.5 py-0.5 text-[10px] text-white/90 backdrop-blur-sm">
          {item.vod_remarks}
        </span>
      ) : null}
    </div>
  );
}
