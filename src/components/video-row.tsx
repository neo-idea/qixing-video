import Link from "next/link";
import { useRef } from "react";
import type { VodItem } from "@/lib/types";
import { IconButton } from "@/components/ui";
import { VideoCard } from "./video-card";

/** 腾讯视频式内容行: 左侧粗标题 + 右侧「全部 >」与翻页箭头, 横向滚动 */
export function VideoRow({ title, subtitle, more = "/", list }: { title: string; subtitle?: string; more?: string; list: VodItem[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  const scrollBy = (direction: 1 | -1) => {
    scroller.current?.scrollBy({ left: direction * Math.max(360, scroller.current.clientWidth * 0.8), behavior: "smooth" });
  };
  if (!list.length) return null;

  return (
    <section className="mt-8 sm:mt-10">
      <div className="mb-3.5 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2.5 text-base font-bold text-cinema-primary sm:text-lg">
            {title}
          </h2>
          {subtitle ? <p className="mt-1 line-clamp-1 text-xs text-cinema-subtle">{subtitle}</p> : null}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Link href={more} className="flex h-9 items-center pr-1 text-xs text-cinema-muted transition-colors hover:text-cinema-brand-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft">全部 ›</Link>
          <IconButton onClick={() => scrollBy(-1)} aria-label="向左浏览">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2"><path d="m14 6-6 6 6 6" strokeLinecap="round"/></svg>
          </IconButton>
          <IconButton onClick={() => scrollBy(1)} aria-label="向右浏览">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2"><path d="m10 6 6 6-6 6" strokeLinecap="round"/></svg>
          </IconButton>
        </div>
      </div>
      <div className="relative">
        <div ref={scroller} className="no-scrollbar -mx-3 flex gap-3 overflow-x-auto px-3 pb-1 sm:-mx-4 sm:gap-4 sm:px-4 lg:mx-0 lg:px-0">
          {list.map((v, index) => (
            <div key={`${v.vod_id}-${index}`} className="w-[38vw] shrink-0 sm:w-[28vw] md:w-[22vw] lg:w-[158px] xl:w-[178px] 2xl:w-[196px]">
              <VideoCard item={v} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
