import Link from "next/link";
import type { VodItem } from "@/lib/types";
import { Panel } from "@/components/ui";
import { Poster } from "./poster";

/** 腾讯视频式热榜: 前三橙色粗体序号, 行式列表, 悬停浮起 */
export function RankPanel({ list, title = "热门榜单" }: { list: VodItem[]; title?: string }) {
  return (
    <Panel className="w-full p-3.5 sm:p-4 lg:w-[300px] xl:w-[320px]">
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <h3 className="text-base font-bold text-cinema-primary">{title}</h3>
        <span className="text-[11px] text-cinema-subtle">实时更新</span>
      </div>
      <ol className="flex-1 divide-y divide-white/5">
        {list.map((v, idx) => (
          <li key={v.vod_id}>
            <Link href={`/detail/${v.vod_id}`} className="group flex items-center gap-2.5 rounded px-1 py-2 transition duration-150 active:scale-[0.98] hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft">
              <span className={`w-5 shrink-0 text-center text-base font-black italic ${idx < 3 ? "text-cinema-hot" : "text-cinema-subtle"}`}>
                {idx + 1}
              </span>
              <span className="h-[57px] w-10 shrink-0 overflow-hidden rounded-sm">
                <Poster item={v} compact />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-cinema-primary group-hover:text-cinema-brand-soft">{v.vod_name}</span>
                <span className="mt-0.5 block truncate text-[11px] text-cinema-subtle">{v.vod_remarks || `${v.year} · ${v.category}`}</span>
              </span>
              {v.vod_score ? <span className="shrink-0 text-xs font-bold text-cinema-warning">{v.vod_score}</span> : null}
            </Link>
          </li>
        ))}
      </ol>
    </Panel>
  );
}
