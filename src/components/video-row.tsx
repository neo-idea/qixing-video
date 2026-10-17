import Link from "next/link";
import { useRef } from "react";
import type { VodItem } from "@/lib/types";
import { VideoCard } from "./video-card";

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
          <h2 className="flex items-center gap-2.5 text-lg font-black tracking-tight text-white sm:text-xl">
            <span className="h-5 w-[3px] rounded-full bg-gradient-to-b from-[#ffb66e] to-[#ff3d00] sm:h-6" />
            {title}
          </h2>
          {subtitle ? <p className="mt-1 line-clamp-1 pl-[13px] text-[11px] text-zinc-500 sm:pl-[15px] sm:text-xs">{subtitle}</p> : null}
        </div>
        <div className="flex items-center gap-2">
          <Link href={more} className="mr-1 shrink-0 text-xs font-medium text-zinc-500 transition-colors hover:text-[#ff9a44]">全部 ›</Link>
          <button onClick={() => scrollBy(-1)} aria-label="向左浏览" className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/5 text-zinc-300 transition hover:border-orange-500/50 hover:text-white">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="m14 6-6 6 6 6" strokeLinecap="round"/></svg>
          </button>
          <button onClick={() => scrollBy(1)} aria-label="向右浏览" className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/5 text-zinc-300 transition hover:border-orange-500/50 hover:text-white">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="m10 6 6 6-6 6" strokeLinecap="round"/></svg>
          </button>
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
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-16 bg-gradient-to-l from-[#08080b] to-transparent lg:block" />
      </div>
    </section>
  );
}
