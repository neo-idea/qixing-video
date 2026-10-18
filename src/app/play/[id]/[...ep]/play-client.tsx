"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Chip, LinkButton, Panel } from "@/components/ui";
import { VideoPlayer } from "@/components/video-player";
import type { ParseStep } from "@/lib/engines/parse";
import type { VodDetail } from "@/lib/types";

type Play = { parse: number; url: string; header?: Record<string, string>; playUrl?: string };

export function PlayClient({
  detail,
  sourceIndex,
  episodeIndex,
  play,
  siteKey = "demo",
  siteOrigin = "",
}: {
  detail: VodDetail;
  sourceIndex: number;
  episodeIndex: number;
  play: Play;
  siteKey?: string;
  siteOrigin?: string;
}) {
  const [steps, setSteps] = useState<ParseStep[]>([]);
  const [finalUrl, setFinalUrl] = useState(play.url);

  useEffect(() => {
    let alive = true;
    setSteps([]);
    setFinalUrl(play.url);
    fetch(`/api/parse?url=${encodeURIComponent(play.url)}&type=${play.parse}`)
      .then((response) => response.json())
      .then((data) => {
        if (!alive) return;
        setSteps(data.steps ?? []);
        if (data.url) setFinalUrl(data.url);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [play.url, play.parse]);

  const from = detail.vod_play_from[sourceIndex] ?? detail.vod_play_from[0];
  const episodes = detail.vod_play_url[sourceIndex] ?? detail.vod_play_url[0];
  const current = episodes[episodeIndex] ?? episodes[0];
  const parseLabel = play.parse === 0 ? "网页嗅探" : play.parse === 1 ? "Json 解析" : "并发扩展";
  const previous = episodes[episodeIndex - 1];
  const next = episodes[episodeIndex + 1];
  const href = (index: number) => `/play/${detail.vod_id}/${sourceIndex}-${index}?site=${encodeURIComponent(siteKey)}${siteOrigin ? `&from=${encodeURIComponent(siteOrigin)}` : ""}`;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0">
        <VideoPlayer src={finalUrl} poster={detail.vod_pic || undefined} title={detail.vod_name} sourceLabel={`${from} · ${current.name}`} />

        <Panel className="mt-3 p-3.5 sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <Link href={`/detail/${detail.vod_id}?site=${encodeURIComponent(siteKey)}${siteOrigin ? `&from=${encodeURIComponent(siteOrigin)}` : ""}`} className="inline-flex min-h-11 max-w-full items-center truncate text-lg font-bold tracking-tight text-cinema-primary transition hover:text-cinema-brand-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cinema-brand-soft sm:text-xl">
                {detail.vod_name}
              </Link>
              <p className="mt-1 line-clamp-1 text-[11px] text-cinema-subtle sm:text-xs">
                {detail.year} · {detail.area} · {detail.category} · {detail.vod_remarks}
              </p>
            </div>
            <div className="no-scrollbar -mx-1 flex shrink-0 items-center gap-2 overflow-x-auto px-1">
              {previous ? (
                <LinkButton href={href(episodeIndex - 1)} variant="secondary" size="sm" className="rounded active:scale-[0.97]">上一集</LinkButton>
              ) : (
                <span className="inline-flex h-10 items-center rounded bg-[#2a2a2a] px-4 text-xs text-cinema-subtle">已是第一集</span>
              )}
              {next ? (
                <LinkButton href={href(episodeIndex + 1)} variant="secondary" size="sm" className="rounded active:scale-[0.97]">下一集</LinkButton>
              ) : (
                <span className="inline-flex h-10 items-center rounded bg-[#2a2a2a] px-4 text-xs text-cinema-subtle">已是最后一集</span>
              )}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-white/6 pt-3 text-xs">
            <Chip size="sm">{from} · {current.name}</Chip>
            <Chip tone="brand" size="sm">解析: {parseLabel}</Chip>
            <Link href={`/detail/${detail.vod_id}?site=${encodeURIComponent(siteKey)}${siteOrigin ? `&from=${encodeURIComponent(siteOrigin)}` : ""}`} className="ml-auto flex h-8 items-center rounded px-2 text-xs text-cinema-muted transition hover:text-cinema-brand-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft">详情与换源 ›</Link>
          </div>
        </Panel>

        <Panel className="mt-4 p-3.5 sm:p-4">
          <details open className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft">
              <h2 className="text-sm font-bold text-cinema-primary">播放解析链路</h2>
              <span className="flex items-center gap-2">
                <Chip size="sm" tone={steps.length && steps.every((step) => step.ok) ? "success" : steps.some((step) => !step.ok) ? "warning" : "brand"}>
                  {steps.length ? `${steps.length} 步` : "解析中"}
                </Chip>
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-cinema-subtle transition-transform group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
              </span>
            </summary>
            <ol className="mt-3 space-y-1">
              {steps.map((step, index) => (
                <li key={index} className="flex items-center gap-2.5 rounded bg-[#2a2a2a] px-2.5 py-2 text-xs">
                  <span className={`grid h-5 w-5 shrink-0 place-items-center rounded font-mono text-[9px] ${step.ok ? "bg-cinema-success/15 text-cinema-success" : "bg-cinema-danger/15 text-cinema-danger"}`}>
                    {step.engine}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-cinema-muted">{step.message}</span>
                  <span className="shrink-0 font-mono text-[10px] text-cinema-subtle">{step.costMs}ms</span>
                </li>
              ))}
              {!steps.length ? (
                <li className="flex items-center gap-2.5 rounded bg-[#2a2a2a] px-2.5 py-2 text-xs text-cinema-subtle">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cinema-brand" />
                  正在生成解析过程…
                </li>
              ) : null}
            </ol>
          </details>
        </Panel>
      </div>

      <Panel className="h-fit p-3.5 lg:sticky lg:top-[76px]">
        <div className="mb-2.5 flex items-center justify-between gap-3 border-b border-white/6 pb-2.5">
          <h3 className="line-clamp-1 text-sm font-bold text-cinema-primary">选集 · {from}</h3>
          <Chip size="sm" className="text-[11px]">{episodes.length} 集</Chip>
        </div>
        <div className="grid max-h-[38vh] grid-cols-4 gap-1.5 overflow-y-auto pr-1 sm:max-h-[44vh]">
          {episodes.map((episode, index) => (
            <Link
              key={`${episode.name}-${index}`}
              href={href(index)}
              className={`flex h-9 items-center justify-center rounded px-1 text-center text-xs transition active:scale-[0.96] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft ${
                index === episodeIndex ? "brand-button font-bold" : "bg-[#2a2a2a] text-cinema-muted hover:bg-[#333] hover:text-cinema-brand-soft"
              }`}
            >
              <span className="truncate">{index + 1}</span>
            </Link>
          ))}
        </div>

        <div className="mt-5">
          <h3 className="mb-2 text-sm font-bold text-cinema-primary">切换线路</h3>
          <div className="space-y-1.5">
            {detail.vod_play_from.map((line, index) => (
              <Link
                key={line}
                href={`/play/${detail.vod_id}/${index}-0?site=${encodeURIComponent(siteKey)}${siteOrigin ? `&from=${encodeURIComponent(siteOrigin)}` : ""}`}
                className={`flex items-center justify-between rounded px-3 py-2 text-xs transition active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft ${
                  index === sourceIndex ? "border border-cinema-brand/50 bg-cinema-brand/12 font-bold text-cinema-brand-soft" : "bg-[#2a2a2a] text-cinema-muted hover:bg-[#333] hover:text-cinema-primary"
                }`}
              >
                <span className="min-w-0 truncate">{line}</span>
                <span className="shrink-0 text-[10px] text-cinema-subtle">{index === sourceIndex ? "当前" : `${detail.vod_play_url[index]?.length ?? 0} 集`}</span>
              </Link>
            ))}
          </div>
        </div>
      </Panel>
    </div>
  );
}
