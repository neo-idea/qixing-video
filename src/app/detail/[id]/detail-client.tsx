"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Poster } from "@/components/poster";
import { Chip, EmptyState, LinkButton, Panel } from "@/components/ui";
import { useConfig } from "@/lib/store";
import type { VodDetail, VodItem } from "@/lib/types";

export function DetailClient({ id, site, from }: { id: string; site?: string; from?: string }) {
  const { config, siteKey, siteOrigin, loading: cfgLoading } = useConfig();
  const key = site ?? siteKey;
  const origin = from ?? (site ? undefined : siteOrigin);
  const [detail, setDetail] = useState<VodDetail | null>(null);
  const [error, setError] = useState("");
  const [sources, setSources] = useState<{ site: string; name: string; playable: boolean; item: VodItem }[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!key) return;
    let alive = true;
    setDetail(null);
    setError("");
    setSources([]);
    const originQuery = origin ? `&from=${encodeURIComponent(origin)}` : "";
    fetch(`/api/site/${key}/detail?id=${encodeURIComponent(id)}${originQuery}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "加载失败");
        setDetail(data as VodDetail);
        return data as VodDetail;
      })
      .then((data) => {
        (config?.sites ?? []).forEach((source) => {
          if (source.key === key && source.origin === origin) return;
          const q = source.origin ? `&from=${encodeURIComponent(source.origin)}` : "";
          fetch(`/api/site/${source.key}/search?key=${encodeURIComponent(data.vod_name)}${q}`)
            .then((response) => response.json())
            .then((result) => {
              if (!alive) return;
              const hit = (result.list ?? []).find((item: VodItem) => item.vod_name === data.vod_name);
          if (hit) {
            const playable = source.type === 0 || source.type === 4 || ["csp_AppYs", "csp_AppYsV2", "csp_AppGet", "csp_AppGet2"].includes(source.api);
            setSources((previous) => [...previous, { site: source.key, name: source.name, playable, item: hit }]
              .sort((left, right) => Number(right.playable) - Number(left.playable) || left.name.localeCompare(right.name)));
          }
            })
            .catch(() => {});
        });
      })
      .catch((err) => {
        if (alive) setError((err as Error).message);
      });
    return () => {
      alive = false;
    };
  }, [id, key, origin, config]);

  if (cfgLoading || !detail) {
    return (
      <div className="space-y-5">
        <div className="flex flex-col gap-5 rounded-xl bg-cinema-panel p-4 sm:flex-row sm:p-6">
          <div className="aspect-[2/3] w-32 shrink-0 animate-pulse rounded-xl bg-white/5 sm:w-40" />
          <div className="flex-1 space-y-4 py-2">
            <div className="h-7 w-4/5 animate-pulse rounded bg-white/5" />
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="h-16 animate-pulse rounded-lg bg-white/5" />
              <div className="h-16 animate-pulse rounded-lg bg-white/5" />
            </div>
            <div className="h-14 animate-pulse rounded bg-white/5" />
            <div className="h-11 w-40 animate-pulse rounded-full bg-white/5" />
          </div>
        </div>
        <p className="text-center text-xs text-cinema-subtle">正在读取影片详情…</p>
      </div>
    );
  }
  if (error) return <EmptyState title="影片详情加载失败" description={error} />;

  return (
    <>
      <section className="relative -mx-3 -mt-4 overflow-hidden px-3 pb-8 pt-6 sm:-mx-4 sm:-mt-6 sm:px-4 sm:pb-10 sm:pt-10 lg:-mx-8 lg:px-8">
        {detail.vod_pic && /^(https?:)?\/\//i.test(detail.vod_pic) ? (
          <div aria-hidden className="absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={detail.vod_pic} alt="" referrerPolicy="no-referrer" className="h-full w-full scale-110 object-cover object-top opacity-25 blur-md" />
            <div className="absolute inset-0 bg-gradient-to-b from-cinema-page/55 via-cinema-page/88 to-cinema-page" />
          </div>
        ) : null}
        <div className="relative mx-auto flex max-w-[1480px] flex-row items-start gap-4 md:gap-7">
          <div className="w-[104px] shrink-0 sm:w-[136px] md:w-[170px] lg:w-[210px]">
            <div className="overflow-hidden rounded-xl bg-cinema-panel p-1.5 ring-1 ring-white/10 shadow-cinematic">
              <Poster item={detail} compact />
            </div>
          </div>
          <div className="min-w-0 flex-1 self-center">
            <div className="mb-3 flex flex-wrap gap-1.5 text-xs">
              {detail.vod_score ? <Chip tone="warning" size="sm" className="font-bold">{detail.vod_score}</Chip> : null}
              <Chip size="sm">{detail.year}</Chip>
              <Chip size="sm">{detail.area}</Chip>
              <Chip size="sm">{detail.category}</Chip>
              <Chip tone="brand" size="sm">
                源: {config?.sites.find((source) => source.key === key)?.name ?? key}
              </Chip>
            </div>
            <h1 className="mb-3 line-clamp-2 text-xl font-bold leading-tight text-cinema-primary sm:text-3xl lg:text-[40px]">{detail.vod_name}</h1>
            <dl className="mb-4 grid gap-2 sm:grid-cols-2">
              <div className="rounded-xl border border-white/8 bg-cinema-panel/80 px-3.5 py-3">
                <dt className="text-[10px] tracking-wide text-cinema-subtle">导演</dt>
                <dd className="mt-1 line-clamp-2 text-sm leading-6 text-cinema-muted">{detail.director || "暂无资料"}</dd>
              </div>
              <div className="rounded-xl border border-white/8 bg-cinema-panel/80 px-3.5 py-3">
                <dt className="text-[10px] tracking-wide text-cinema-subtle">主演</dt>
                <dd className="mt-1 line-clamp-2 text-sm leading-6 text-cinema-muted">{detail.actors || "暂无资料"}</dd>
              </div>
            </dl>
            <p className={`mb-3 max-w-3xl text-xs leading-6 text-cinema-muted sm:text-sm ${expanded ? "" : "line-clamp-3"}`}>{detail.content}</p>
            <button onClick={() => setExpanded((value) => !value)} className="mb-5 flex h-10 items-center rounded-full px-4 text-xs font-semibold text-cinema-brand-soft transition duration-150 active:scale-[0.96] hover:bg-cinema-brand/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft">
              {expanded ? "收起简介" : "展开完整简介"}
            </button>
            <div className="flex flex-wrap items-center gap-2.5">
              <LinkButton href={`/play/${detail.vod_id}/0-0?site=${encodeURIComponent(key)}${origin ? `&from=${encodeURIComponent(origin)}` : ""}`} size="lg" className="rounded-full px-7">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86a1 1 0 0 0-1.5.86Z"/></svg>
                立即播放
              </LinkButton>
              <Chip size="lg" className="rounded-full">{detail.vod_remarks}</Chip>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          {detail.vod_play_from.map((from, sourceIndex) => (
            <Panel key={from} className="rounded-xl p-3.5 sm:p-4">
              <div className="mb-3.5 flex items-center justify-between gap-3 border-b border-white/8 pb-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="h-4 w-1 rounded-full bg-cinema-brand/70" />
                  <h2 className="truncate text-base font-bold text-cinema-primary">{from}</h2>
                </div>
                <Chip size="sm">{detail.vod_play_url[sourceIndex]?.length ?? 0} 集</Chip>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8">
                {detail.vod_play_url[sourceIndex].map((episode, episodeIndex) => (
                  <Link
                    key={`${episode.name}-${episodeIndex}`}
                    href={`/play/${detail.vod_id}/${sourceIndex}-${episodeIndex}?site=${encodeURIComponent(key)}${origin ? `&from=${encodeURIComponent(origin)}` : ""}`}
                    className="group relative flex min-h-11 items-center justify-center overflow-hidden rounded-lg border border-white/8 bg-cinema-elevated px-2 text-center text-xs text-cinema-muted transition duration-150 active:scale-[0.95] hover:border-cinema-brand/55 hover:bg-cinema-brand/10 hover:text-cinema-brand-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft"
                  >
                    <span className="block truncate">{episode.name}</span>
                    {episode.parse === 1 ? <span className="absolute right-1 top-0.5 text-[9px] font-bold text-cinema-hot">JX</span> : null}
                  </Link>
                ))}
              </div>
            </Panel>
          ))}
        </div>

        <Panel className="h-fit rounded-xl p-3.5 sm:p-4 lg:sticky lg:top-[88px]">
          <div className="mb-3 border-b border-white/8 pb-3">
            <h2 className="text-base font-bold text-cinema-primary">同名影片换源</h2>
            <p className="mt-1 text-[10px] tracking-wide text-cinema-subtle">SAME TITLE SOURCES</p>
          </div>
          {sources.length ? (
            <div className="space-y-1">
              {sources.map((source) => (
                <Link key={`${source.site}-${source.item.sourceOrigin ?? ""}`} href={`/detail/${source.item.vod_id}?site=${encodeURIComponent(source.site)}${source.item.sourceOrigin ? `&from=${encodeURIComponent(source.item.sourceOrigin)}` : ""}`} className="flex items-center gap-2.5 rounded p-1.5 transition duration-150 active:scale-[0.98] hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft">
                  <span className="h-[57px] w-10 overflow-hidden rounded-sm"><Poster item={source.item} compact /></span>
                  <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-cinema-primary">{source.name}</span>
                    <span className="mt-0.5 block truncate text-[11px] text-cinema-subtle">{source.item.vod_remarks}</span>
                  </span>
                <span className={`shrink-0 rounded-md px-1.5 py-1 text-[10px] ${source.playable ? "bg-cinema-success/12 text-cinema-success" : "bg-cinema-warning/12 text-cinema-warning"}`}>
                  {source.playable ? "可播" : "受限"}
                </span>
                  {source.item.vod_score ? <span className="text-xs font-bold text-cinema-warning">{source.item.vod_score}</span> : null}
                </Link>
              ))}
            </div>
          ) : (
            <div className="space-y-3 rounded p-2">
              <div className="flex items-center gap-2.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cinema-brand" />
                <p className="text-xs text-cinema-subtle">正在并发搜索其他源的同名影片</p>
              </div>
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center gap-2.5">
                  <div className="h-14 w-10 animate-pulse rounded-sm bg-white/5" />
                  <div className="h-3 flex-1 animate-pulse rounded bg-white/5" />
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </>
  );
}
