import Link from "next/link";
import type { VodItem } from "@/lib/types";
import { Chip, Eyebrow, Panel } from "@/components/ui";
import { Poster } from "./poster";

export function RankPanel({ list, title = "七星空降榜" }: { list: VodItem[]; title?: string }) {
  return (
    <Panel className="relative flex w-full flex-col overflow-hidden p-4 sm:p-5 lg:w-[330px] xl:w-[354px]">
      <div aria-hidden className="absolute -right-10 -top-12 h-36 w-36 rounded-full bg-cinema-brand/16 blur-3xl" />
      <div className="relative mb-4 flex items-center justify-between gap-3">
        <div>
          <Eyebrow>Hot Ranking</Eyebrow>
          <h3 className="mt-1 text-lg font-black text-white">{title}</h3>
        </div>
        <Chip tone="brand" size="sm">实时更新</Chip>
      </div>
      <ol className="relative flex-1 space-y-1.5">
        {list.map((v, idx) => (
          <li key={v.vod_id}>
            <Link href={`/detail/${v.vod_id}`} className={`group flex items-center gap-3 rounded-xl p-2 transition hover:bg-white/6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft ${idx < 3 ? "bg-white/4" : ""}`}>
              <span className={`w-6 shrink-0 text-center text-lg font-black italic ${idx === 0 ? "text-cinema-brand-strong" : idx === 1 ? "text-cinema-brand" : idx === 2 ? "text-cinema-warning" : "text-cinema-subtle"}`}>
                {idx + 1}
              </span>
              <span className="h-[64px] w-11 shrink-0 overflow-hidden rounded-lg ring-1 ring-white/10 transition group-hover:ring-cinema-brand/50">
                <Poster item={v} compact />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-cinema-primary group-hover:text-cinema-brand-soft">{v.vod_name}</span>
                <span className="mt-1 block truncate text-[11px] text-cinema-subtle">{v.year} · {v.category}</span>
              </span>
              <span className="shrink-0 rounded-lg bg-cinema-brand/12 px-2 py-1 text-xs font-bold text-cinema-brand-soft">{v.vod_score}</span>
            </Link>
          </li>
        ))}
      </ol>
    </Panel>
  );
}
