"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { VideoCard } from "@/components/video-card";
import { Button, Chip, EmptyState, LinkButton, Panel } from "@/components/ui";
import { relevanceScore } from "@/lib/search-text";
import { useConfig } from "@/lib/store";
import type { SourceBean, VodItem } from "@/lib/types";

type Group = { site: SourceBean; list: VodItem[] };
type SiteStatus = "searching" | "hit" | "empty" | "error";

const SUGGESTIONS = ["繁花", "庆余年", "三体", "流浪地球", "狂飙", "漫长的季节"];

function isWebRunnableSite(site: SourceBean, remote?: boolean) {
  if (!remote) return true;
  return (
    site.type === 0 ||
    site.type === 4 ||
    ["csp_AppYs", "csp_AppYsV2", "csp_AppGet", "csp_AppGet2"].includes(site.api)
  );
}

export function SearchClient({ q }: { q: string }) {
  const router = useRouter();
  const { config } = useConfig();
  const [keyword, setKeyword] = useState(q);
  const [groups, setGroups] = useState<Group[]>([]);
  const [statuses, setStatuses] = useState<Record<string, SiteStatus>>({});
  const [done, setDone] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const searchableSites = useMemo(
    () => config?.sites.filter((site) => site.searchable !== 0 && isWebRunnableSite(site, config.remote)) ?? [],
    [config]
  );
  const total = searchableSites.length;
  const searching = Boolean(q) && done < total;
  const resultCount = groups.reduce((sum, group) => sum + group.list.length, 0);
  const orderedGroups = useMemo(() => {
    const ranked = groups.map((group) => ({
      ...group,
      list: [...group.list].sort((left, right) =>
        relevanceScore(left.vod_name, q) - relevanceScore(right.vod_name, q) || Number(right.vod_score ?? 0) - Number(left.vod_score ?? 0)
      ),
    }));
    return ranked.sort((left, right) =>
      relevanceScore(left.list[0].vod_name, q) - relevanceScore(right.list[0].vod_name, q) ||
      right.list.length - left.list.length ||
      left.site.name.localeCompare(right.site.name)
    );
  }, [groups, q]);

  useEffect(() => setKeyword(q), [q]);

  useEffect(() => {
    try {
      setRecent(JSON.parse(localStorage.getItem("qixing:recent-searches") ?? "[]"));
    } catch {
      setRecent([]);
    }
  }, []);

  useEffect(() => {
    if (!config || !q) return;
    let alive = true;
    const sites = config.sites.filter((site) => site.searchable !== 0 && isWebRunnableSite(site, config.remote));
    setGroups([]);
    setDone(0);
    setStatuses(Object.fromEntries(sites.map((site) => [`${site.origin ?? ""}::${site.key}`, "searching"])));

    sites.forEach((site) => {
      const from = site.origin ? `&from=${encodeURIComponent(site.origin)}` : "";
      fetch(`/api/site/${site.key}/search?key=${encodeURIComponent(q)}${from}`)
        .then(async (response) => {
          const data = await response.json();
          if (!alive) return;
          const list: VodItem[] = data.list ?? [];
          if (list.length) setGroups((previous) => [...previous, { site, list }]);
          setStatuses((previous) => ({ ...previous, [`${site.origin ?? ""}::${site.key}`]: list.length ? "hit" : "empty" }));
        })
        .catch(() => {
          if (alive) setStatuses((previous) => ({ ...previous, [`${site.origin ?? ""}::${site.key}`]: "error" }));
        })
        .finally(() => {
          if (alive) setDone((count) => count + 1);
        });
    });
    return () => {
      alive = false;
    };
  }, [config, q]);

  const submit = (value: string) => {
    const next = value.trim();
    if (!next) return;
    const nextRecent = [next, ...recent.filter((word) => word !== next)].slice(0, 8);
    setRecent(nextRecent);
    try {
      localStorage.setItem("qixing:recent-searches", JSON.stringify(nextRecent));
    } catch {}
    router.push(`/search?q=${encodeURIComponent(next)}`);
  };

  return (
    <>
      <Panel className="mb-5 rounded-xl p-4 sm:p-6">
        <div className="relative">
          <p className="text-[11px] font-semibold tracking-[0.22em] text-cinema-subtle">GLOBAL SEARCH</p>
          <h1 className="mt-2 text-xl font-bold leading-tight text-cinema-primary sm:text-3xl">
            {q ? <>“<span className="text-cinema-brand-soft">{q}</span>” 全源搜索</> : "搜索想看的每一部"}
          </h1>
          <form
            className="relative mt-5 flex flex-col gap-3 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              submit(keyword);
            }}
          >
            <div className="flex h-12 flex-1 items-center rounded-full border border-white/10 bg-cinema-elevated px-4 transition focus-within:border-cinema-brand/60 focus-within:bg-black/25">
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-cinema-subtle" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" strokeLinecap="round" /></svg>
              <input
                ref={inputRef}
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="输入剧名、电影名或综艺名"
                className="w-full bg-transparent px-3 py-4 text-sm text-cinema-primary outline-none placeholder:text-cinema-subtle"
              />
            </div>
            <Button type="submit" size="lg" className="w-full rounded-full px-7 sm:w-auto">开始搜索</Button>
          </form>

          <div className="no-scrollbar -mx-4 mt-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            <span className="shrink-0 text-[11px] text-cinema-subtle">热搜</span>
            {SUGGESTIONS.map((word) => (
              <button
                key={word}
                onClick={() => {
                  setKeyword(word);
                  submit(word);
                }}
                className="flex h-10 shrink-0 items-center rounded-full border border-white/8 bg-white/6 px-4 text-[11px] text-cinema-muted transition duration-150 active:scale-[0.95] hover:border-cinema-brand/40 hover:text-cinema-brand-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft"
              >
                {word}
              </button>
            ))}
          </div>

          {recent.length ? (
            <div className="no-scrollbar -mx-4 mt-3 flex items-center gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
              <span className="shrink-0 text-[11px] text-cinema-subtle">最近</span>
              {recent.map((word) => (
                <button
                  key={word}
                  onClick={() => {
                    setKeyword(word);
                    submit(word);
                  }}
                  className="flex h-10 shrink-0 items-center rounded-full border border-white/8 bg-cinema-elevated px-4 text-[11px] text-cinema-muted transition duration-150 active:scale-[0.95] hover:border-white/18 hover:text-cinema-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft"
                >
                  {word}
                </button>
              ))}
              <button
                onClick={() => {
                  setRecent([]);
                  try {
                    localStorage.removeItem("qixing:recent-searches");
                  } catch {}
                }}
                className="flex h-10 shrink-0 items-center rounded-full px-3 text-[11px] text-cinema-subtle transition hover:text-cinema-danger focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft"
              >
                清空
              </button>
            </div>
          ) : null}

          {q ? (
            <div className="mt-5 rounded-xl border border-white/8 bg-black/18 p-3.5">
              <div className="flex items-center justify-between gap-3 text-[11px] text-cinema-subtle">
                <span className="flex min-w-0 items-center gap-2">
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${searching ? "animate-pulse bg-cinema-brand" : "bg-cinema-success"}`} />
                  <span className="truncate">{searching ? "正在并发请求所有可搜索源…" : "全源搜索完成"}</span>
                </span>
                <span className="shrink-0">{done}/{total} · {resultCount} 条结果</span>
              </div>
              <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/8">
                <div className="h-full rounded-full bg-cinema-brand shadow-brand-glow transition-all duration-500" style={{ width: total ? `${(done / total) * 100}%` : "0%" }} />
              </div>
              <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap">
                {searchableSites.map((site) => {
                  const ref = `${site.origin ?? ""}::${site.key}`;
                  const status = statuses[ref];
                  return (
                    <Chip
                      key={ref}
                      tone={status === "hit" ? "success" : status === "error" ? "warning" : status === "empty" ? "neutral" : "brand"}
                      size="sm"
                      className="max-w-full shrink-0 truncate"
                    >
                      {site.name}
                      <span className="ml-1 opacity-75">{status === "hit" ? "命中" : status === "empty" ? "无结果" : status === "error" ? "失败" : "搜索中"}</span>
                    </Chip>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </Panel>

      {!q ? (
        <EmptyState title="输入关键词开始搜索" description="搜索会同时请求所有可搜索站点源，命中结果会按来源分组展示。">
          <Button variant="secondary" onClick={() => inputRef.current?.focus()}>聚焦搜索框</Button>
        </EmptyState>
      ) : searching && !groups.length ? (
        <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-7 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="aspect-[2/3] animate-pulse rounded-xl bg-white/5" />
              <div className="h-3.5 w-4/5 animate-pulse rounded bg-white/5" />
              <div className="h-2.5 w-2/5 animate-pulse rounded bg-white/5" />
            </div>
          ))}
        </div>
      ) : groups.length ? (
        orderedGroups.map((group) => (
          <section key={`${group.site.origin ?? ""}::${group.site.key}`} className="mb-8 sm:mb-10">
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-white/8 pb-3">
              <h2 className="flex min-w-0 items-center gap-2.5 truncate text-base font-bold text-cinema-primary sm:text-lg">
                <span className="h-4 w-1 rounded-full bg-cinema-brand/70" />
                <span className="truncate">{group.site.name}</span>
                {group.site.originName ? <span className="shrink-0 text-xs font-normal text-cinema-subtle">{group.site.originName}</span> : null}
              </h2>
              <Chip size="sm" className="text-[11px]">{group.list.length} 条</Chip>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-7 lg:grid-cols-5 xl:grid-cols-6">
              {group.list.map((item, index) => (
                <VideoCard key={`${group.site.key}-${item.vod_id}-${index}`} item={item} site={group.site.key} />
              ))}
            </div>
          </section>
        ))
      ) : (
        <EmptyState title="没有找到相关影片" description="可以缩短关键词、去掉年份或版本号，也可以更换接口源后重新搜索。">
          <Button variant="secondary" onClick={() => inputRef.current?.focus()}>重新输入</Button>
          <LinkButton href="/settings" variant="ghost">更换接口源</LinkButton>
        </EmptyState>
      )}
    </>
  );
}
