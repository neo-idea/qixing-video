"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { HeroCarousel } from "@/components/hero-carousel";
import { RankPanel } from "@/components/rank-panel";
import { VideoCard } from "@/components/video-card";
import { VideoRow } from "@/components/video-row";
import { Button } from "@/components/ui";
import { useConfig } from "@/lib/store";
import type { CategoryFilter, VodItem } from "@/lib/types";

/** 频道语义 → 分类名关键词(不同 CMS 源分类命名不一, 按名称模糊匹配) */
const CHANNEL_MATCH: Record<string, string[]> = {
  tv: ["剧", "电视", "连续", "国产"],
  movie: ["电影", "片"],
  anime: ["动漫", "动画", "番"],
  show: ["综艺", "秀"],
  doc: ["纪", "记录", "纪录"],
};

/** 把频道入口解析为当前源的真实分类 id; 演示源(type_id 即频道名)原样返回;
 *  CMS 源未命中返回 null(部分源不提供全量分类表, 不应传无效 tid 查空) */
function resolveChannel(channelId: string, classes: { type_id: string; type_name: string }[]): string | null {
  if (!classes.length || classes.some((c) => c.type_id === channelId)) return channelId;
  const keywords = CHANNEL_MATCH[channelId] ?? [];
  const hit = classes.find((c) => keywords.some((k) => (c.type_name ?? "").includes(k)));
  return hit ? hit.type_id : null;
}

export function HomeClient() {
  const params = useSearchParams();
  const { siteKey, siteOrigin, config, loading: cfgLoading, notice } = useConfig();
  const [classes, setClasses] = useState<{ type_id: string; type_name: string }[]>([]);
  const [filters, setFilters] = useState<Record<string, CategoryFilter[]>>({});
  const [sourceHomeList, setSourceHomeList] = useState<VodItem[]>([]);
  const [aggList, setAggList] = useState<VodItem[]>([]);
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
    // 等当前源真实分类就绪后再解析频道(演示源除外); 未命中回落精选
    setPg(1);
    setTid(resolveChannel(c, classes) ?? "");
  }, [c, classes]);

  /** 聚合首页: 启用配置中的 CMS 源并行拉取去重, 未选分类时展示 */
  useEffect(() => {
    const cmsSites = (config?.sites ?? []).filter((s) => (s.type === 0 || s.type === 4) && s.searchable !== 0).slice(0, 8);
    if (!config?.remote || !cmsSites.length) return;
    let cancelled = false;
    fetch("/api/home/aggregate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sources: cmsSites.map((s) => ({ url: s.origin, key: s.key })) }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (cancelled) return;
        setAggList(data.list ?? []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [config]);

  useEffect(() => {
    if (!siteKey) return;
    let cancelled = false;
    setLoading(true);
    const from = siteOrigin ? `?from=${encodeURIComponent(siteOrigin)}` : "";
    fetch(`/api/site/${siteKey}/home${from}`)
      .then((response) => response.json())
      .then((data) => {
        if (cancelled) return;
        setClasses(data.class ?? []);
        setFilters(data.filters ?? {});
        setSourceHomeList(data.list ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [siteKey, siteOrigin]);

  useEffect(() => {
    if (!siteKey) return;
    let cancelled = false;
    setLoading(true);
    const query = new URLSearchParams({ tid, pg: String(pg), ...extend });
    if (siteOrigin) query.set("from", siteOrigin);
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
  }, [siteKey, siteOrigin, tid, pg, extend]);

  const tidFilters = useMemo(() => filters[tid] ?? [], [filters, tid]);
  const homeList = useMemo(() => {
    const seen = new Set<string>();
    return [...sourceHomeList, ...aggList].filter((item) => {
      const name = item.vod_name?.trim();
      if (!name || seen.has(name)) return false;
      seen.add(name);
      return true;
    });
  }, [sourceHomeList, aggList]);

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
      <div>
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="min-w-0 flex-1">
            <div className="aspect-[16/10] w-full animate-pulse rounded-lg bg-cinema-panel sm:aspect-[16/7]" />
          </div>
          <div className="w-full space-y-3 rounded-lg bg-cinema-panel p-4 lg:w-[300px] xl:w-[320px]">
            <div className="h-5 w-24 animate-pulse rounded bg-white/5" />
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex items-center gap-2.5">
                <div className="h-[57px] w-10 shrink-0 animate-pulse rounded-sm bg-white/5" />
                <div className="h-3 flex-1 animate-pulse rounded bg-white/5" />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8 flex gap-3 overflow-hidden sm:gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="w-[38vw] shrink-0 sm:w-[28vw] md:w-[22vw] lg:w-[158px] xl:w-[178px]">
              <div className="aspect-[2/3] animate-pulse rounded-md bg-white/5" />
              <div className="mt-2 h-3.5 w-4/5 animate-pulse rounded bg-white/5" />
              <div className="mt-1.5 h-2.5 w-2/5 animate-pulse rounded bg-white/5" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {notice ? (
        <div className="mb-4 rounded-xl border border-cinema-warning/25 bg-cinema-warning/10 px-4 py-3 text-xs text-cinema-warning">{notice}</div>
      ) : null}

      <div className="flex flex-col gap-4 lg:flex-row lg:gap-5">
        <div className="min-w-0 flex-1">
          <HeroCarousel list={(tid ? list : homeList).slice(0, 5)} />
        </div>
        <RankPanel list={visible.slice(0, 10)} />
      </div>

      {tidFilters.length ? (
        <div className="mt-3.5 space-y-1.5 rounded-xl bg-cinema-panel/80 p-3.5">
          {tidFilters.map((filter) => (
            <div key={filter.key} className="no-scrollbar flex items-center gap-1 overflow-x-auto text-xs">
              <span className="w-9 shrink-0 text-cinema-subtle">{filter.name}</span>
              {filter.value.map((value) => {
                const active = (extend[filter.key] ?? "") === (value === "全部" ? "" : value);
                return (
                  <button
                    key={value}
                    onClick={() => pick(filter.key, value)}
                    className={`flex h-10 shrink-0 items-center rounded-md px-3 transition duration-150 active:scale-[0.95] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft ${
                      active ? "bg-cinema-brand/18 font-semibold text-cinema-brand-soft" : "text-cinema-muted hover:bg-white/6 hover:text-cinema-primary"
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
          <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-7 lg:grid-cols-5 xl:grid-cols-6">
            {visible.map((item, index) => (
              <VideoCard key={`${item.vod_id}-${index}`} item={item} rank={index < 3 ? index + 1 : undefined} />
            ))}
            {loading ? Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="space-y-2.5">
                <div className="aspect-[2/3] animate-pulse rounded-xl bg-white/5" />
                <div className="h-3.5 w-4/5 animate-pulse rounded bg-white/5" />
                <div className="h-2.5 w-2/5 animate-pulse rounded bg-white/5" />
              </div>
            )) : null}
          </div>
          <div className="mt-8 text-center">
            <Button onClick={() => setPg((page) => page + 1)} disabled={loading} variant="secondary" className="rounded-full px-7">
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
