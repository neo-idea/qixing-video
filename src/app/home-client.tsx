"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { HeroCarousel } from "@/components/hero-carousel";
import { RankPanel } from "@/components/rank-panel";
import { VideoCard } from "@/components/video-card";
import { VideoRow } from "@/components/video-row";
import { Button, Chip } from "@/components/ui";
import { useConfig } from "@/lib/store";
import type { CategoryFilter, VodItem } from "@/lib/types";

const CATEGORY_ID: Record<string, string> = { tv: "tv", movie: "movie", show: "show", anime: "anime", doc: "doc" };
const CHANNELS = [
  { id: "tv", name: "剧场", desc: "热播大剧" },
  { id: "movie", name: "电影", desc: "院线大片" },
  { id: "anime", name: "动漫", desc: "热血新番" },
  { id: "show", name: "综艺", desc: "真人秀场" },
  { id: "doc", name: "纪实", desc: "开阔视野" },
] as const;

export function HomeClient() {
  const params = useSearchParams();
  const { siteKey, loading: cfgLoading, notice } = useConfig();
  const [classes, setClasses] = useState<{ type_id: string; type_name: string }[]>([]);
  const [filters, setFilters] = useState<Record<string, CategoryFilter[]>>({});
  const [homeList, setHomeList] = useState<VodItem[]>([]);
  const [list, setList] = useState<VodItem[]>([]);
  const [tid, setTid] = useState("");
  const [pg, setPg] = useState(1);
  const [extend, setExtend] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const c = params.get("c") ?? "";

  useEffect(() => {
    if (!c) {
      setTid("");
      return;
    }
    if (CATEGORY_ID[c]) {
      setPg(1);
      setTid(CATEGORY_ID[c]);
    }
  }, [c]);

  useEffect(() => {
    if (!siteKey) return;
    let cancelled = false;
    setLoading(true);
    fetch(`/api/site/${siteKey}/home`)
      .then((response) => response.json())
      .then((data) => {
        if (cancelled) return;
        setClasses(data.class ?? []);
        setFilters(data.filters ?? {});
        setHomeList(data.list ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [siteKey]);

  useEffect(() => {
    if (!siteKey) return;
    let cancelled = false;
    setLoading(true);
    const query = new URLSearchParams({ tid, pg: String(pg), ...extend });
    fetch(`/api/site/${siteKey}/category?${query}`)
      .then((response) => response.json())
      .then((data) => {
        if (cancelled) return;
        setList((previous) => (pg === 1 ? data.list ?? [] : [...previous, ...(data.list ?? [])]));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [siteKey, tid, pg, extend]);

  const tidFilters = useMemo(() => filters[tid] ?? [], [filters, tid]);
  const visible = useMemo(() => {
    const seen = new Set<string>();
    return (tid ? list : [...homeList, ...list]).filter((item) => {
      if (seen.has(item.vod_id)) return false;
      seen.add(item.vod_id);
      return true;
    });
  }, [tid, homeList, list]);

  const pick = useCallback((key: string, value: string) => {
    setPg(1);
    setExtend((previous) => ({ ...previous, [key]: value === "全部" ? "" : value }));
  }, []);

  const byCategory = useCallback((name: string) => visible.filter((item) => item.category === name), [visible]);

  if (cfgLoading) {
    return (
      <div className="grid place-items-center py-40">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-cinema-brand" />
        <p className="mt-4 text-xs text-cinema-subtle">正在加载接口源配置…</p>
      </div>
    );
  }

  return (
    <>
      {notice ? (
        <div className="mb-4 rounded border border-cinema-warning/25 bg-cinema-warning/10 px-4 py-2.5 text-xs text-cinema-warning">{notice}</div>
      ) : null}

      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="min-w-0 flex-1">
          <HeroCarousel list={(tid ? list : homeList).slice(0, 5)} />
        </div>
        <RankPanel list={visible.slice(0, 10)} />
      </div>

      {!tid ? (
        <div className="no-scrollbar mt-4 flex gap-2.5 overflow-x-auto sm:grid sm:grid-cols-5 sm:gap-3">
          {CHANNELS.map((channel) => (
            <button
              key={channel.id}
              onClick={() => setTid(channel.id)}
              className="group flex min-w-[96px] shrink-0 flex-col justify-center rounded-md border border-white/6 bg-cinema-panel px-3.5 py-2.5 text-left transition hover:border-cinema-brand/50 hover:bg-cinema-elevated focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft sm:min-w-0"
            >
              <span className="text-sm font-bold text-cinema-primary group-hover:text-cinema-brand-soft">{channel.name}</span>
              <span className="mt-0.5 text-[11px] text-cinema-subtle">{channel.desc}</span>
            </button>
          ))}
        </div>
      ) : null}

      <div className="no-scrollbar mt-6 flex items-center gap-5 overflow-x-auto border-b border-white/6 pb-2.5 sm:mt-8">
        <button
          onClick={() => {
            setTid("");
            setPg(1);
          }}
          className={`relative h-9 shrink-0 text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft ${
            !tid ? "font-bold text-cinema-brand-soft" : "text-cinema-muted hover:text-cinema-primary"
          }`}
        >
          精选
          <span className={`absolute bottom-[-10px] left-1/2 h-[3px] -translate-x-1/2 rounded-t bg-cinema-brand transition-all ${!tid ? "w-8" : "w-0"}`} />
        </button>
        {classes.map((item) => (
          <button
            key={item.type_id}
            onClick={() => {
              setTid(item.type_id);
              setPg(1);
            }}
            className={`relative h-9 shrink-0 text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft ${
              tid === item.type_id ? "font-bold text-cinema-brand-soft" : "text-cinema-muted hover:text-cinema-primary"
            }`}
          >
            {item.type_name}
            <span className={`absolute bottom-[-10px] left-1/2 h-[3px] -translate-x-1/2 rounded-t bg-cinema-brand transition-all ${tid === item.type_id ? "w-8" : "w-0"}`} />
          </button>
        ))}
        <Chip className="ml-auto shrink-0 sm:hidden">{visible.length} 部</Chip>
      </div>

      {tidFilters.length ? (
        <div className="mt-3.5 space-y-1.5 rounded-md bg-cinema-panel p-3">
          {tidFilters.map((filter) => (
            <div key={filter.key} className="no-scrollbar flex items-center gap-1 overflow-x-auto text-xs">
              <span className="w-9 shrink-0 text-cinema-subtle">{filter.name}</span>
              {filter.value.map((value) => {
                const active = (extend[filter.key] ?? "") === (value === "全部" ? "" : value);
                return (
                  <button
                    key={value}
                    onClick={() => pick(filter.key, value)}
                    className={`h-8 shrink-0 rounded px-2.5 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft ${
                      active ? "bg-cinema-brand/18 font-semibold text-cinema-brand-soft" : "text-cinema-muted hover:text-cinema-primary"
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      ) : null}

      {tid ? (
        <>
          <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-6 lg:grid-cols-5 xl:grid-cols-6">
            {visible.map((item, index) => (
              <VideoCard key={`${item.vod_id}-${index}`} item={item} rank={index < 3 ? index + 1 : undefined} />
            ))}
            {loading ? Array.from({ length: 6 }).map((_, index) => <div key={index} className="aspect-[2/3] animate-pulse rounded-md bg-white/5" />) : null}
          </div>
          <div className="mt-8 text-center">
            <Button onClick={() => setPg((page) => page + 1)} disabled={loading} variant="secondary" className="rounded">
              {loading ? "正在加载…" : "加载更多内容"}
            </Button>
          </div>
        </>
      ) : (
        <>
          <VideoRow title="热播剧场" subtitle="连续剧 · 更新优先级最高" more="/?c=tv" list={byCategory("电视剧")} />
          <VideoRow title="院线精选" subtitle="动作 / 科幻 / 喜剧大片" more="/?c=movie" list={byCategory("电影")} />
          <VideoRow title="热血番剧" subtitle="国漫与动画新番" more="/?c=anime" list={byCategory("动漫")} />
          <VideoRow title="综艺与纪实" subtitle="真人秀、音乐现场和世界视野" more="/?c=show" list={[...byCategory("综艺"), ...byCategory("纪录片")]} />
        </>
      )}
    </>
  );
}
