"use client";

import { useEffect, useState } from "react";
import { VideoCard } from "@/components/video-card";
import { useConfig } from "@/lib/store";
import type { SourceBean, VodItem } from "@/lib/types";

type Group = { site: SourceBean; list: VodItem[] };

export function SearchClient({ q }: { q: string }) {
  const { config } = useConfig();
  const [groups, setGroups] = useState<Group[]>([]);
  const [done, setDone] = useState(0);
  const total = config?.sites.filter((site) => site.searchable !== 0).length ?? 0;
  const loading = done < total;

  useEffect(() => {
    if (!config || !q) return;
    let alive = true;
    setGroups([]);
    setDone(0);

    const sites = config.sites.filter((site) => site.searchable !== 0);
    sites.forEach((site) => {
      fetch(`/api/site/${site.key}/search?key=${encodeURIComponent(q)}`)
        .then((response) => response.json())
        .then((data) => {
          if (!alive) return;
          if (data.list?.length) setGroups((previous) => [...previous, { site, list: data.list }]);
        })
        .catch(() => {})
        .finally(() => {
          if (alive) setDone((count) => count + 1);
        });
    });
    return () => {
      alive = false;
    };
  }, [config, q]);

  return (
    <>
      <section className="panel mb-7 overflow-hidden rounded-2xl p-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.36em] text-[#ff812b]">Global Search</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
          “<span className="brand-text">{q}</span>” 全源搜索
        </h1>
        <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
          <span className="rounded-full border border-white/8 bg-white/5 px-3 py-2">{done} / {total} 个源已完成</span>
          <span className="rounded-full border border-white/8 bg-white/5 px-3 py-2">{groups.reduce((sum, group) => sum + group.list.length, 0)} 条结果</span>
          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-emerald-400">FastSearchActivity 并发</span>
        </div>
        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/8">
          <div className="h-full rounded-full bg-gradient-to-r from-[#ffb66e] to-[#ff4d00] transition-all" style={{ width: total ? `${(done / total) * 100}%` : "0%" }} />
        </div>
      </section>

      {loading && !groups.length ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="aspect-[2/3] animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
      ) : groups.length ? (
        groups.map((group) => (
          <section key={group.site.key} className="mb-10">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="flex items-center gap-3 text-lg font-black text-white">
                <span className="h-5 w-[3px] rounded-full bg-gradient-to-b from-[#ffb66e] to-[#ff3d00]" />
                {group.site.name}
              </h2>
              <span className="rounded-full bg-white/6 px-3 py-1.5 text-[11px] text-zinc-500">{group.list.length} 条</span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
              {group.list.map((item, index) => (
                <VideoCard key={`${group.site.key}-${item.vod_id}-${index}`} item={item} site={group.site.key} />
              ))}
            </div>
          </section>
        ))
      ) : (
        <div className="panel grid place-items-center rounded-2xl py-24 text-center">
          <p className="text-lg font-bold text-white">没有找到相关影片</p>
          <p className="mt-2 text-xs text-zinc-500">可尝试切换关键词，或在接口源页更换配置</p>
        </div>
      )}
    </>
  );
}
