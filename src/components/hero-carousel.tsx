"use client";

import { useEffect, useState } from "react";
import type { VodItem } from "@/lib/types";
import { EmptyState, LinkButton } from "@/components/ui";

export function HeroCarousel({ list }: { list: VodItem[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    setActiveIndex((current) => (current >= list.length ? 0 : current));
  }, [list.length]);

  useEffect(() => {
    if (list.length <= 1 || !autoPlay || document.hidden) return;
    const timer = setInterval(() => setActiveIndex((value) => (value + 1) % list.length), 6500);
    return () => clearInterval(timer);
  }, [list.length, autoPlay]);

  useEffect(() => {
    const syncVisibility = () => setAutoPlay(!document.hidden);
    document.addEventListener("visibilitychange", syncVisibility);
    return () => document.removeEventListener("visibilitychange", syncVisibility);
  }, []);

  const current = list[activeIndex] ?? list[0];
  const go = (direction: 1 | -1) => setActiveIndex((value) => (value + direction + list.length) % list.length);

  if (!current) {
    return <EmptyState title="当前分类暂无推荐" description="可以切换到精选频道，或到接口源设置里更换内容源。" />;
  }

  return (
    <section
      className="group relative aspect-[16/11] min-h-[320px] w-full overflow-hidden rounded-xl bg-cinema-panel ring-1 ring-white/10 sm:aspect-[16/7]"
      role="region"
      aria-roledescription="carousel"
      aria-label="首页推荐"
      onMouseEnter={() => setAutoPlay(false)}
      onMouseLeave={() => setAutoPlay(true)}
      onFocus={() => setAutoPlay(false)}
      onBlur={() => setAutoPlay(true)}
    >
      {list.map((item, index) => (
        <div
          key={item.vod_id}
          aria-hidden={index !== activeIndex}
          className="absolute inset-0 overflow-hidden transition-opacity duration-700"
          style={{ opacity: index === activeIndex ? 1 : 0 }}
        >
          {item.vod_pic && /^(https?:)?\/\//i.test(item.vod_pic) ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.vod_pic}
                alt=""
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
                referrerPolicy="no-referrer"
                className="h-full w-full scale-[1.04] object-cover object-top"
              />
              <div className="absolute inset-0 bg-black/20" />
            </>
          ) : (
            <div className="h-full w-full" style={{ background: `linear-gradient(125deg, ${item.gradient[0]}, ${item.gradient[1]})` }} />
          )}
        </div>
      ))}

      <div className="absolute inset-0 bg-gradient-to-r from-black/92 via-black/55 to-black/15" />
      <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/92 via-black/45 to-transparent" />

      <button onClick={() => go(-1)} aria-label="上一部推荐" className="absolute left-0 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-r-xl bg-black/35 text-white/80 opacity-0 backdrop-blur transition hover:bg-black/60 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-cinema-brand-soft group-hover:opacity-100 sm:grid">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="m14 6-6 6 6 6" strokeLinecap="round" /></svg>
      </button>
      <button onClick={() => go(1)} aria-label="下一部推荐" className="absolute right-0 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-l-xl bg-black/35 text-white/80 opacity-0 backdrop-blur transition hover:bg-black/60 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-cinema-brand-soft group-hover:opacity-100 sm:grid">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="m10 6 6 6-6 6" strokeLinecap="round" /></svg>
      </button>

      <div className="absolute inset-x-0 bottom-0 z-10 p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl">
          <div className="mb-3 flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="rounded-md bg-cinema-brand px-2 py-1 text-[11px] font-bold text-cinema-on-brand">{current.category || "推荐"}</span>
            <span className="rounded-md border border-white/12 bg-black/50 px-2 py-1 text-[11px] text-white/85">{current.year}</span>
            <span className="rounded-md border border-white/12 bg-black/50 px-2 py-1 text-[11px] text-white/85">{current.area}</span>
            {current.vod_score ? <span className="text-xs font-bold text-cinema-warning">★ {current.vod_score}</span> : null}
          </div>
          <h2 className="mb-3 line-clamp-1 text-2xl font-bold leading-tight text-white drop-shadow-lg sm:text-4xl lg:text-[46px]" aria-live="polite">{current.vod_name}</h2>
          <p className="mb-5 line-clamp-1 max-w-xl text-xs text-white/70 sm:text-sm">
            {(current.actors ?? "").split(" / ").slice(0, 3).join(" / ")} {current.content ? `· ${current.content}` : ""}
          </p>
          <div className="flex flex-wrap items-center gap-2.5">
            <LinkButton href={`/play/${current.vod_id}/0-0${current.sourceKey ? `?site=${encodeURIComponent(current.sourceKey)}${current.sourceOrigin ? `&from=${encodeURIComponent(current.sourceOrigin)}` : ""}` : ""}`} size="lg" className="rounded-full px-7">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86a1 1 0 0 0-1.5.86Z"/></svg>
              立即播放
            </LinkButton>
            <LinkButton href={`/detail/${current.vod_id}${current.sourceKey ? `?site=${encodeURIComponent(current.sourceKey)}${current.sourceOrigin ? `&from=${encodeURIComponent(current.sourceOrigin)}` : ""}` : ""}`} variant="ghost" size="lg" className="rounded-full bg-black/45 text-white/90 backdrop-blur hover:text-white">剧集详情</LinkButton>
          </div>
        </div>
      </div>

      <div className="absolute bottom-3 right-4 z-20 hidden items-center gap-2 sm:flex">
        {list.map((item, index) => (
          <button key={item.vod_id} onClick={() => setActiveIndex(index)} aria-label={`切换到 ${item.vod_name}`} className={`h-1.5 rounded-full transition-all active:scale-125 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cinema-brand-soft ${index === activeIndex ? "w-7 bg-cinema-brand" : "w-3.5 bg-white/32 hover:bg-white/60"}`} />
        ))}
      </div>
      <div className="absolute bottom-3 left-4 z-20 flex w-24 items-center gap-1 sm:hidden">
        {list.map((item, index) => (
          <span key={item.vod_id} className={`h-1 flex-1 rounded-full transition-all ${index === activeIndex ? "bg-cinema-brand" : "bg-white/30"}`} />
        ))}
      </div>
    </section>
  );
}
