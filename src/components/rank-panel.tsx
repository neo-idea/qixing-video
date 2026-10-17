import Link from "next/link";
import type { VodItem } from "@/lib/types";
import { Chip, Eyebrow, Panel } from "@/components/ui";
import { Poster } from "./poster";

export function RankPanel({ list, title = "七星空降榜" }: { list: VodItem[]; title?: string }) {
  return (
    <Panel className="flex w-full flex-col p-3 sm:p-4 lg:w-[330px] xl:w-[354px]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <Eyebrow>Hot Ranking</Eyebrow>
          <h3 className="mt-1 text-lg font-black text-white">{title}</h3>
        </div>
        <Chip tone="brand" size="sm">实时更新</Chip>
      </div>
      <ol className="flex-1 space-y-2">
        {list.map((v, idx) => (
          <li key={v.vod_id}>
            <Link href={`/detail/${v.vod_id}`} className="group flex items-center gap-2.5 rounded-xl p-2 transition-colors hover:bg-white/5">
              <span className={`w-5 shrink-0 text-center text-lg font-black italic ${idx === 0 ? "text-cinema-brand-strong" : idx === 1 ? "text-cinema-brand" : idx === 2 ? "text-cinema-warning" : "text-cinema-subtle"}`}>
                {idx + 1}
              </span>
              <span className="h-[66px] w-11 shrink-0 overflow-hidden rounded-md ring-1 ring-white/10">
                <Poster item={v} compact />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-cinema-primary group-hover:text-cinema-brand-soft">{v.vod_name}</span>
                <span className="mt-1 block truncate text-[11px] text-cinema-subtle">{v.year} · {v.category}</span>
              </span>
              <span className="shrink-0 text-xs font-bold text-cinema-brand-soft">{v.vod_score}</span>
            </Link>
          </li>
        ))}
      </ol>
    </Panel>
  );
}
