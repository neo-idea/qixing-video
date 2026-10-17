"use client";

import { useEffect, useState } from "react";
import { VideoCard } from "@/components/video-card";
import { Chip, EmptyState, Eyebrow, Panel } from "@/components/ui";
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
      <Panel className="mb-6 p-4 sm:p-6">
        <Eyebrow wide>Global Search</Eyebrow>
        <h1 className="mt-2 line-clamp-2 text-2xl font-black leading-tight tracking-tight text-white sm:mt-3 sm:text-4xl">
          “<span className="brand-text">{q}</span>” 全源搜索
        </h1>
        <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto sm:mt-5 sm:flex-wrap sm:gap-3">
          <Chip className="shrink-0">{done} / {total} 个源已完成</Chip>
          <Chip className="shrink-0">{groups.reduce((sum, group) => sum + group.list.length, 0)} 条结果</Chip>
          <Chip tone="success" className="shrink-0">全源并发搜索</Chip>
        </div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/8 sm:mt-5">
          <div className="h-full rounded-full bg-gradient-to-r from-cinema-brand-soft to-cinema-brand-strong transition-all" style={{ width: total ? `${(done / total) * 100}%` : "0%" }} />
        </div>
      </Panel>

      {loading && !groups.length ? (
        <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-8 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="aspect-[2/3] animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
      ) : groups.length ? (
        groups.map((group) => (
          <section key={group.site.key} className="mb-8 sm:mb-10">
            <div className="mb-4 flex items-center justify-between gap-3 sm:gap-4">
              <h2 className="flex min-w-0 items-center gap-2.5 text-base font-black text-white sm:text-lg">
                <span className="h-5 w-[3px] shrink-0 rounded-full bg-gradient-to-b from-cinema-brand-soft to-cinema-brand-strong" />
                {group.site.name}
              </h2>
              <Chip size="sm" className="text-[11px]">{group.list.length} 条</Chip>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-8 lg:grid-cols-5 xl:grid-cols-6">
              {group.list.map((item, index) => (
                <VideoCard key={`${group.site.key}-${item.vod_id}-${index}`} item={item} site={group.site.key} />
              ))}
            </div>
          </section>
        ))
      ) : (
        <EmptyState title="没有找到相关影片" description="可尝试缩短关键词、切换站点源，或在接口源页更换配置。" />
      )}
    </>
  );
}
