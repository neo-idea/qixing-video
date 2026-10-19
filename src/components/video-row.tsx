import Link from "next/link";
import { useRef } from "react";
import type { VodItem } from "@/lib/types";
import { IconButton } from "@/components/ui";
import { VideoCard } from "./video-card";

export function VideoRow({ title, subtitle, more = "/", list }: { title: string; subtitle?: string; more?: string; list: VodItem[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  const scrollBy = (direction: 1 | -1) => {
    scroller.current?.scrollBy({ left: direction * Math.max(360, scroller.current.clientWidth * 0.78), behavior: "smooth" });
  };
  if (!list.length) return null;

  return (
    <section className="mt-9 sm:mt-11">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="flex items-center gap-3 text-base font-bold tracking-tight text-cinema-primary sm:text-xl">
            <span className="h-5 w-1 rounded-full bg-cinema-brand" />
            {title}
          </h2>
          {subtitle ? <p className="mt-1.5 line-clamp-1 pl-4 text-xs text-cinema-subtle">{subtitle}</p> : null}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Link href={more} className="flex h-10 items-center rounded-md px-2 text-xs text-cinema-muted transition-colors hover:text-cinema-brand-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft">全部 ›</Link>
          <IconButton onClick={() => scrollBy(-1)} aria-label={`向左浏览${title}`} className="hidden sm:grid">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="m14 6-6 6 6 6" strokeLinecap="round"/></svg>
          </IconButton>
          <IconButton onClick={() => scrollBy(1)} aria-label={`向右浏览${title}`} className="hidden sm:grid">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="m10 6 6 6-6 6" strokeLinecap="round"/></svg>
          </IconButton>
        </div>
      </div>

      <div className="relative">
        <div ref={scroller} className="no-scrollbar -mx-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-3 pb-1 sm:-mx-4 sm:gap-4 sm:px-4 lg:mx-0 lg:px-0">
          {list.map((item, index) => (
            <div key={`${item.vod_id}-${index}`} className="w-[38vw] shrink-0 snap-start sm:w-[28vw] md:w-[21vw] lg:w-[160px] xl:w-[180px] 2xl:w-[198px]">
              <VideoCard item={item} />
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-10 bg-gradient-to-l from-cinema-page to-transparent lg:block" />
      </div>
    </section>
  );
}
