import Link from "next/link";
import type { VodItem } from "@/lib/types";
import { Panel } from "@/components/ui";
import { Poster } from "./poster";

export function RankPanel({ list, title = "热门榜单" }: { list: VodItem[]; title?: string }) {
  return (
    <Panel className="w-full rounded-xl p-3.5 sm:p-4 lg:w-[308px] xl:w-[328px]">
      <div className="mb-3 flex items-center justify-between gap-3 border-b border-white/8 pb-3">
        <div>
          <h3 className="text-base font-bold text-cinema-primary">{title}</h3>
          <p className="mt-1 text-[10px] tracking-wide text-cinema-subtle">SOURCE HOT LIST</p>
        </div>
        <span className="flex items-center gap-1.5 text-[10px] text-cinema-subtle">
          <span className="h-1.5 w-1.5 rounded-full bg-cinema-success" />
          实时更新
        </span>
      </div>
      <ol className="divide-y divide-white/6">
        {list.map((item, index) => (
          <li key={item.vod_id}>
            <Link href={`/detail/${item.vod_id}${item.sourceKey ? `?site=${encodeURIComponent(item.sourceKey)}${item.sourceOrigin ? `&from=${encodeURIComponent(item.sourceOrigin)}` : ""}` : ""}`} className="group flex min-h-[68px] items-center gap-3 rounded-lg px-1 py-2 transition duration-150 active:scale-[0.98] hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft">
              <span className={`w-5 shrink-0 text-center text-lg font-black italic ${index < 3 ? "text-cinema-hot" : "text-cinema-subtle"}`}>
                {index + 1}
              </span>
              <span className="h-[58px] w-10 shrink-0 overflow-hidden rounded-md ring-1 ring-white/8">
                <Poster item={item} compact />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-cinema-primary group-hover:text-cinema-brand-soft">{item.vod_name}</span>
                <span className="mt-1 block truncate text-[11px] text-cinema-subtle">{item.vod_remarks || `${item.year} · ${item.category}`}</span>
              </span>
              {item.vod_score ? <span className="shrink-0 text-xs font-bold text-cinema-warning">{item.vod_score}</span> : null}
            </Link>
          </li>
        ))}
      </ol>
    </Panel>
  );
}
