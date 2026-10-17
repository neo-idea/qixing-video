"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { HeroCarousel } from "@/components/hero-carousel";
import { RankPanel } from "@/components/rank-panel";
import { VideoCard } from "@/components/video-card";
import { VideoRow } from "@/components/video-row";
import { Button, Chip, Eyebrow, Panel } from "@/components/ui";
import { useConfig } from "@/lib/store";
import type { CategoryFilter, VodItem } from "@/lib/types";

const CATEGORY_ID: Record<string, string> = { tv: "tv", movie: "movie", show: "show", anime: "anime", doc: "doc" };
const CHANNELS = [
  { id: "tv", name: "剧场频道", desc: "同步热播大剧", initial: "剧", accent: "brand" },
  { id: "movie", name: "院线大片", desc: "视效爽片抢先看", initial: "影", accent: "brand" },
  { id: "anime", name: "番剧专区", desc: "国漫热血不断更", initial: "番", accent: "warning" },
  { id: "show", name: "综艺现场", desc: "舞台与真人秀", initial: "秀", accent: "success" },
  { id: "doc", name: "纪实视野", desc: "看更辽阔的世界", initial: "纪", accent: "brand" },
] as const;
const CHANNEL_ACCENT = {
  brand: "from-cinema-brand/28 to-transparent text-cinema-brand-soft",
  warning: "from-cinema-warning/24 to-transparent text-cinema-warning",
  success: "from-cinema-success/22 to-transparent text-cinema-success",
};

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
  const currentName = classes.find((item) => item.type_id === tid)?.type_name ?? "";

  if (cfgLoading) {
    return (
      <div className="grid place-items-center py-40">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-white/10 border-t-cinema-brand" />
        <p className="mt-5 text-xs tracking-wide text-cinema-subtle">正在加载接口源配置…</p>
      </div>
    );
  }

  return (
    <>
      {notice ? (
        <div className="mb-5 rounded-xl border border-cinema-warning/25 bg-cinema-warning/10 px-4 py-3 text-xs text-cinema-warning">{notice}</div>
      ) : null}

      <Panel className="mb-5 overflow-hidden p-4 sm:p-5 lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <Eyebrow wide>Qixing Original</Eyebrow>
            <h1 className="mt-2 bg-gradient-to-r from-white via-white to-white/65 bg-clip-text text-2xl font-black leading-tight tracking-tight text-transparent sm:text-3xl lg:text-[40px]">{tid ? `${currentName}频道` : "今晚看点，全部为你排好"}</h1>
            <p className="mt-2 line-clamp-2 max-w-2xl text-xs leading-relaxed text-cinema-subtle sm:text-sm">
              {tid ? `按 ${currentName} 分类聚合当前接口源，支持年份与地区筛选` : "多站点内容统一编排，保留 APK 的源切换、搜索与解析逻辑"}
            </p>
          </div>
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:justify-end lg:px-0">
            <Chip className="shrink-0">{visible.length} 部作品</Chip>
            <Chip className="shrink-0">{classes.length} 个分类</Chip>
            <Chip tone="success" className="shrink-0">源服务在线</Chip>
          </div>
        </div>
      </Panel>

      <div className="flex flex-col gap-5 lg:flex-row">
        <div className="min-w-0 flex-1">
          <HeroCarousel list={(tid ? list : homeList).slice(0, 5)} />
        </div>
        <RankPanel list={visible.slice(0, 9)} />
      </div>

      {!tid ? (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-5">
          {CHANNELS.map((channel) => (
            <button
              key={channel.id}
              onClick={() => setTid(channel.id)}
              className="channel-card group relative min-h-[112px] overflow-hidden rounded-2xl border border-white/8 bg-white/4 p-4 text-left transition hover:-translate-y-1 hover:border-cinema-brand/40 hover:bg-white/8 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft"
            >
              <span aria-hidden className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-b opacity-70 transition group-hover:opacity-100 ${CHANNEL_ACCENT[channel.accent]}`} />
              <span className="relative flex items-center gap-3">
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-black/35 text-sm font-black backdrop-blur ${CHANNEL_ACCENT[channel.accent].split(" ").pop()}`}>{channel.initial}</span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-black text-white">{channel.name}</span>
                  <span className="mt-1 block truncate text-[11px] text-cinema-subtle">{channel.desc}</span>
                </span>
              </span>
              <span aria-hidden className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-cinema-brand-soft to-cinema-brand-strong transition-all duration-300 group-hover:w-full" />
            </button>
          ))}
        </div>
      ) : null}

      <div className="no-scrollbar mt-8 flex items-center gap-2 overflow-x-auto border-b border-white/6 pb-4 sm:mt-10 lg:flex-wrap">
        <button
          onClick={() => {
            setTid("");
            setPg(1);
          }}
            className={`h-11 shrink-0 rounded-full px-4 text-xs transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft sm:px-5 ${!tid ? "brand-button font-bold text-white" : "border border-white/8 bg-white/4 text-cinema-muted hover:text-white"}`}
        >
          精选
        </button>
        {classes.map((item) => (
          <button
            key={item.type_id}
            onClick={() => {
              setTid(item.type_id);
              setPg(1);
            }}
              className={`h-11 shrink-0 rounded-full px-4 text-xs transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft sm:px-5 ${
              tid === item.type_id ? "brand-button font-bold text-white" : "border border-white/8 bg-white/4 text-cinema-muted hover:text-white"
            }`}
          >
            {item.type_name}
          </button>
        ))}
      </div>

      {tidFilters.length ? (
        <Panel className="mt-5 space-y-3 p-3 sm:p-4">
          {tidFilters.map((filter) => (
            <div key={filter.key} className="no-scrollbar flex items-center gap-2 overflow-x-auto text-xs sm:flex-wrap">
              <span className="w-10 shrink-0 text-cinema-subtle">{filter.name}</span>
              {filter.value.map((value) => {
                const active = (extend[filter.key] ?? "") === (value === "全部" ? "" : value);
                return (
                  <button
                    key={value}
                    onClick={() => pick(filter.key, value)}
                    className={`h-11 shrink-0 rounded-xl px-3 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft ${active ? "bg-cinema-brand/18 font-semibold text-cinema-brand-soft" : "text-cinema-muted hover:bg-white/6 hover:text-white"}`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          ))}
        </Panel>
      ) : null}

      {tid ? (
        <>
          <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-8 lg:grid-cols-5 xl:grid-cols-6">
            {visible.map((item, index) => (
              <VideoCard key={`${item.vod_id}-${index}`} item={item} rank={index < 3 ? index + 1 : undefined} />
            ))}
            {loading ? Array.from({ length: 6 }).map((_, index) => <div key={index} className="aspect-[2/3] animate-pulse rounded-xl bg-white/5" />) : null}
          </div>
          <div className="mt-10 text-center">
            <Button
              onClick={() => setPg((page) => page + 1)}
              disabled={loading}
              variant="secondary"
            >
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
