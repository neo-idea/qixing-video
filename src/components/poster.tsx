"use client";

import { useState } from "react";
import type { VodItem } from "@/lib/types";

/**
 * 海报: 优先加载源站真实图片(vod_pic), 失败回退深色占位。
 * 腾讯视频式: 小圆角、右下角集数/状态、左上评分, 无多余装饰。
 */
export function Poster({ item }: { item: VodItem; compact?: boolean }) {
  const [failed, setFailed] = useState(false);
  const hasPic = Boolean(item.vod_pic) && !failed;

  return (
    <div className="poster-fallback relative aspect-[2/3] w-full overflow-hidden rounded-md bg-[#262626]">
      {hasPic ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.vod_pic}
          alt={item.vod_name}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3 text-center">
          <span className="line-clamp-3 text-sm font-bold text-cinema-muted">{item.vod_name}</span>
          <span className="text-[11px] text-cinema-subtle">{item.category || item.year}</span>
        </div>
      )}
      {item.vod_score ? (
        <span className="absolute left-1.5 top-1.5 rounded bg-black/70 px-1 py-0.5 text-[11px] font-bold text-cinema-warning">
          {item.vod_score}
        </span>
      ) : null}
      {item.vod_remarks ? (
        <span className="absolute bottom-1.5 right-1.5 max-w-[75%] truncate rounded bg-black/70 px-1 py-0.5 text-[10px] text-white/90">
          {item.vod_remarks}
        </span>
      ) : null}
    </div>
  );
}
