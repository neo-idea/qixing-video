"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { VodItem } from "@/lib/types";
import { Poster } from "./poster";

export function HeroCarousel({ list }: { list: VodItem[] }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    setI((current) => (current >= list.length ? 0 : current));
  }, [list.length]);

  useEffect(() => {
    if (list.length <= 1) return;
    const timer = setInterval(() => setI((value) => (value + 1) % list.length), 6000);
    return () => clearInterval(timer);
  }, [list.length]);

  const cur = list[i] ?? list[0];
  if (!cur) {
    return <div className="grid min-h-[340px] w-full place-items-center rounded-2xl bg-white/5 p-6 text-center text-sm text-zinc-500 ring-1 ring-white/10 sm:min-h-[430px]">当前分类暂无推荐内容</div>;
  }

  return (
    <div className="relative min-h-[370px] w-full overflow-hidden rounded-[18px] ring-1 ring-white/10 cinematic-shadow sm:min-h-[450px] md:rounded-[20px] lg:min-h-[485px]">
      {list.map((v, idx) => (
        <div
          key={v.vod_id}
          className="absolute inset-0 transition-all duration-[900ms]"
          style={{
            background: `radial-gradient(85% 100% at 78% 20%, ${v.gradient[1]} 0%, transparent 62%), linear-gradient(120deg, ${v.gradient[0]} 0%, #08080b 78%)`,
            opacity: idx === i ? 1 : 0,
            transform: idx === i ? "scale(1)" : "scale(1.035)",
          }}
        >
          <div aria-hidden className="absolute right-[-4%] top-4 select-none text-[160px] leading-none opacity-[0.13] blur-[1px] sm:right-[5%] sm:top-6 sm:text-[300px]">{v.vod_pic}</div>
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-black/25" />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#08080b] via-[#08080b]/70 to-transparent" />
      <div className="relative flex h-full flex-col justify-end gap-4 p-4 sm:gap-6 sm:p-8 lg:flex-row lg:items-end">
        <div className="min-w-0 max-w-2xl flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-1.5 sm:mb-4 sm:gap-2">
            <span className="rounded-sm bg-gradient-to-r from-[#ff5e00] to-[#ff9d2e] px-2 py-1 text-[10px] font-black tracking-wide text-white">{cur.category}</span>
            <span className="rounded-sm border border-white/20 bg-black/40 px-2 py-1 text-[10px] text-white/75 backdrop-blur">{cur.year}</span>
            <span className="rounded-sm border border-white/20 bg-black/40 px-2 py-1 text-[10px] text-white/75 backdrop-blur">{cur.area}</span>
            <span className="text-xs font-black text-[#ffb66e]">★ {cur.vod_score}</span>
          </div>
          <h2 className="mb-3 line-clamp-2 text-3xl font-black leading-tight tracking-tight text-white drop-shadow-xl sm:mb-4 sm:text-5xl lg:text-6xl">{cur.vod_name}</h2>
          <p className="mb-5 line-clamp-2 max-w-xl text-xs leading-relaxed text-zinc-300 sm:mb-6 sm:text-base">
            {(cur.actors ?? "").split(" / ").slice(0, 3).join(" / ")} · {cur.content}
          </p>
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <Link href={`/play/${cur.vod_id}/0-0`} className="flex flex-1 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white transition-transform hover:scale-[1.03] brand-button sm:flex-none sm:px-7">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86a1 1 0 0 0-1.5.86Z"/></svg>
              立即播放
            </Link>
            <Link href={`/detail/${cur.vod_id}`} className="flex-1 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-center text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/20 sm:flex-none sm:px-7">剧集详情</Link>
          </div>
        </div>
        <div className="hidden w-[176px] shrink-0 lg:block">
          <div className="overflow-hidden rounded-xl ring-1 ring-white/15 cinematic-shadow">
            <Poster item={cur} compact />
          </div>
        </div>
      </div>
      <div className="absolute right-4 top-4 flex items-center gap-1.5 sm:right-8 sm:top-7 sm:gap-2">
        {list.map((v, idx) => (
          <button key={v.vod_id} onClick={() => setI(idx)} aria-label={`切换到 ${v.vod_name}`} className={`h-1 rounded-full transition-all ${idx === i ? "w-8 bg-[#ff5e00]" : "w-3 bg-white/30 hover:bg-white/60"}`} />
        ))}
      </div>
    </div>
  );
}
