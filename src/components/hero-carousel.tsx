"use client";

import { useEffect, useState } from "react";
import type { VodItem } from "@/lib/types";
import { EmptyState, LinkButton } from "@/components/ui";

/** 腾讯视频式轮播: 大图铺满, 左下信息层(标题/meta/播放按钮), 右下切换点 */
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
    return <EmptyState title="当前分类暂无推荐" description="可以切换到精选频道，或到接口源设置里更换内容源。" />;
  }

  return (
    <div className="relative aspect-[16/10] min-h-[300px] w-full overflow-hidden rounded-lg bg-[#1f1f1f] sm:aspect-[16/7]">
      {list.map((v, idx) => (
        <div
          key={v.vod_id}
          className="absolute inset-0 overflow-hidden transition-opacity duration-500"
          style={{ opacity: idx === i ? 1 : 0 }}
        >
          {v.vod_pic ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={v.vod_pic} alt="" referrerPolicy="no-referrer" className="h-full w-full scale-105 object-cover object-top opacity-90" />
          ) : (
            <div className="h-full w-full" style={{ background: `linear-gradient(120deg, ${v.gradient[0]}, ${v.gradient[1]})` }} />
          )}
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/85 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl">
          <div className="mb-2.5 flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="rounded bg-cinema-brand px-1.5 py-0.5 text-[11px] font-bold text-[#063434]">{cur.category || "推荐"}</span>
            <span className="rounded bg-black/60 px-1.5 py-0.5 text-[11px] text-white/85">{cur.year}</span>
            <span className="rounded bg-black/60 px-1.5 py-0.5 text-[11px] text-white/85">{cur.area}</span>
            {cur.vod_score ? <span className="text-xs font-bold text-cinema-warning">★ {cur.vod_score}</span> : null}
          </div>
          <h2 className="mb-2 line-clamp-1 text-2xl font-bold leading-tight text-white drop-shadow sm:mb-3 sm:text-4xl lg:text-[44px]">{cur.vod_name}</h2>
          <p className="mb-4 line-clamp-1 max-w-xl text-xs text-cinema-muted sm:mb-5 sm:text-sm">
            {(cur.actors ?? "").split(" / ").slice(0, 3).join(" / ")} {cur.content ? `· ${cur.content}` : ""}
          </p>
          <div className="flex flex-wrap items-center gap-2.5">
            <LinkButton href={`/play/${cur.vod_id}/0-0`} size="lg" className="rounded">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86a1 1 0 0 0-1.5.86Z"/></svg>
              立即播放
            </LinkButton>
            <LinkButton href={`/detail/${cur.vod_id}`} variant="secondary" size="lg" className="rounded bg-black/55 text-white backdrop-blur hover:bg-black/70">剧集详情</LinkButton>
          </div>
        </div>
      </div>
      <div className="absolute bottom-3 right-4 hidden items-center gap-1.5 sm:flex">
        {list.map((v, idx) => (
          <button key={v.vod_id} onClick={() => setI(idx)} aria-label={`切换到 ${v.vod_name}`} className={`h-1.5 rounded-full transition-all active:scale-125 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cinema-brand-soft ${idx === i ? "w-6 bg-cinema-brand" : "w-3 bg-white/35 hover:bg-white/60"}`} />
        ))}
      </div>
    </div>
  );
}
