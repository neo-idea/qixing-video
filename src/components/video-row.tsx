import Link from "next/link";
import { useRef } from "react";
import type { VodItem } from "@/lib/types";
import { Eyebrow } from "@/components/ui";
import { VideoCard } from "./video-card";
import { IconButton } from "@/components/ui";

export function VideoRow({ title, subtitle, more = "/", list }: { title: string; subtitle?: string; more?: string; list: VodItem[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  const scrollBy = (direction: 1 | -1) => {
    scroller.current?.scrollBy({ left: direction * Math.max(360, scroller.current.clientWidth * 0.8), behavior: "smooth" });
  };
  if (!list.length) return null;

  return (
    <section className="mt-8 sm:mt-10 lg:mt-12">
      <div className="mb-4 flex items-end justify-between gap-3 sm:gap-4">
        <div>
          <Eyebrow>Featured</Eyebrow>
          <h2 className="flex items-center gap-2.5 text-lg font-black tracking-tight text-white sm:text-xl">
            <span className="h-5 w-[3px] rounded-full bg-gradient-to-b from-cinema-brand-soft to-cinema-brand-strong sm:h-6" />
            {title}
          </h2>
          {subtitle ? <p className="mt-1 line-clamp-1 pl-[13px] text-[11px] text-cinema-subtle sm:pl-[15px] sm:text-xs">{subtitle}</p> : null}
        </div>
        <div className="flex items-center gap-2">
          <Link href={more} className="mr-1 flex h-11 shrink-0 items-center text-xs font-medium text-cinema-subtle transition-colors hover:text-cinema-brand-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft">全部 ›</Link>
          <IconButton onClick={() => scrollBy(-1)} aria-label="向左浏览">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="m14 6-6 6 6 6" strokeLinecap="round"/></svg>
          </IconButton>
          <IconButton onClick={() => scrollBy(1)} aria-label="向右浏览">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="m10 6 6 6-6 6" strokeLinecap="round"/></svg>
          </IconButton>
        </div>
      </div>
      <div className="relative">
        <div ref={scroller} className="no-scrollbar -mx-3 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-3 pb-2 sm:-mx-4 sm:gap-4 sm:px-4 lg:mx-0 lg:px-0">
          {list.map((v, index) => (
            <div key={`${v.vod_id}-${index}`} className="w-[40vw] shrink-0 snap-start sm:w-[30vw] md:w-[23vw] lg:w-[172px] xl:w-[194px] 2xl:w-[210px]">
              <VideoCard item={v} />
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-16 bg-gradient-to-l from-cinema-page to-transparent lg:block" />
      </div>
    </section>
  );
}
