import Link from "next/link";
import type { VodItem } from "@/lib/types";
import { Poster } from "./poster";

export function RankPanel({ list, title = "七星空降榜" }: { list: VodItem[]; title?: string }) {
  return (
    <aside className="panel flex w-full flex-col rounded-2xl p-4 lg:w-[354px]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#ff812b]">Hot Ranking</p>
          <h3 className="mt-1 text-lg font-black text-white">{title}</h3>
        </div>
        <span className="rounded-full border border-orange-500/25 bg-orange-500/10 px-2.5 py-1 text-[10px] text-[#ffb66e]">实时更新</span>
      </div>
      <ol className="flex-1 space-y-2">
        {list.map((v, idx) => (
          <li key={v.vod_id}>
            <Link href={`/detail/${v.vod_id}`} className="group flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-white/5">
              <span className={`w-5 shrink-0 text-center text-lg font-black italic ${idx === 0 ? "text-[#ff4d00]" : idx === 1 ? "text-[#ff9a44]" : idx === 2 ? "text-[#ffc125]" : "text-zinc-700"}`}>
                {idx + 1}
              </span>
              <span className="h-[66px] w-11 shrink-0 overflow-hidden rounded-md ring-1 ring-white/10">
                <Poster item={v} compact />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-zinc-100 group-hover:text-[#ffa257]">{v.vod_name}</span>
                <span className="mt-1 block truncate text-[11px] text-zinc-500">{v.year} · {v.category}</span>
              </span>
              <span className="shrink-0 text-xs font-bold text-[#ffb66e]">{v.vod_score}</span>
            </Link>
          </li>
        ))}
      </ol>
    </aside>
  );
}
