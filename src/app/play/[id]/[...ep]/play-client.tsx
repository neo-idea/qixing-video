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
}: {
  detail: VodDetail;
  sourceIndex: number;
  episodeIndex: number;
  play: Play;
  siteKey?: string;
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

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_330px] lg:gap-5 xl:grid-cols-[minmax(0,1fr)_358px]">
      <div className="min-w-0">
        <VideoPlayer src={finalUrl} title={detail.vod_name} sourceLabel={`${from} · ${current.name}`} />
        <Panel className="relative mt-3 p-4 sm:mt-4 sm:p-5">
          <div aria-hidden className="absolute -right-12 -top-16 h-44 w-44 rounded-full bg-cinema-brand/12 blur-3xl" />
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-4">
            <div className="min-w-0">
              <Link href={`/detail/${detail.vod_id}?site=${siteKey}`} className="inline-flex min-h-11 max-w-full items-center truncate text-xl font-bold tracking-tight text-cinema-primary transition hover:text-cinema-brand-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cinema-brand-soft sm:text-2xl">
                {detail.vod_name}
              </Link>
              <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-cinema-subtle sm:mt-2 sm:text-xs">{detail.year} · {detail.area} · {detail.category} · {detail.vod_remarks}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {previous ? <LinkButton href={`/play/${detail.vod_id}/${sourceIndex}-${episodeIndex - 1}?site=${siteKey}`} variant="secondary" size="sm" className="rounded">上一集</LinkButton> : <span className="inline-flex h-10 items-center rounded bg-[#2a2a2a] px-4 text-xs text-cinema-subtle">已是第一集</span>}
                {next ? <LinkButton href={`/play/${detail.vod_id}/${sourceIndex}-${episodeIndex + 1}?site=${siteKey}`} variant="secondary" size="sm" className="rounded">下一集</LinkButton> : <span className="inline-flex h-10 items-center rounded bg-[#2a2a2a] px-4 text-xs text-cinema-subtle">已是最后一集</span>}
                <LinkButton href={`/detail/${detail.vod_id}?site=${siteKey}`} variant="ghost" size="sm" className="rounded">详情与换源</LinkButton>
              </div>
            </div>
            <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 text-xs sm:mx-0 sm:flex-wrap sm:px-0">
              <Chip className="shrink-0">{from} · {current.name}</Chip>
              <Chip tone="brand" className="shrink-0 font-semibold">解析: {parseLabel}</Chip>
            </div>
          </div>
        </Panel>

        <Panel className="mt-4 p-4">
          <div className="mb-3.5 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-cinema-primary">播放解析链路</h2>
            </div>
            <Chip size="sm" tone={steps.length && steps.every((step) => step.ok) ? "success" : steps.some((step) => !step.ok) ? "warning" : "brand"} className="hidden text-[11px] sm:inline-flex">
              {steps.length ? `${steps.length} 步` : "解析中"}
            </Chip>
          </div>
          <ol className="space-y-3">
            {steps.map((step, index) => (
              <li key={index} className="relative flex items-start gap-2.5 rounded-md bg-[#2a2a2a] p-3 text-xs sm:gap-3">
                <span className="absolute bottom-0 left-[22px] top-3 w-px bg-white/8" aria-hidden />
                <span className={`relative z-10 mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg font-mono text-[10px] ${step.ok ? "bg-cinema-success/15 text-cinema-success" : "bg-cinema-danger/15 text-cinema-danger"}`}>
                  {step.engine}
                </span>
                <span className="min-w-0 flex-1 text-cinema-muted">{step.message}</span>
                <span className="shrink-0 font-mono text-[10px] text-cinema-subtle">{step.costMs}ms</span>
              </li>
            ))}
            {!steps.length ? (
              <li className="flex items-center gap-3 rounded-md bg-[#2a2a2a] p-4 text-xs text-cinema-subtle">
                <span className="h-2 w-2 animate-pulse rounded-full bg-cinema-brand" />
                正在生成解析过程…
              </li>
            ) : null}
          </ol>
        </Panel>
      </div>

      <Panel className="h-fit p-3.5 sm:p-4 lg:sticky lg:top-[76px]">
        <div className="mb-3 flex items-center justify-between gap-3 border-b border-white/6 pb-2.5">
          <div>
            <h3 className="line-clamp-1 text-base font-bold text-cinema-primary">选集 · {from}</h3>
          </div>
          <Chip size="sm" className="text-[11px]">{episodes.length} 集</Chip>
        </div>
        <div className="grid max-h-[42vh] grid-cols-4 gap-1.5 overflow-y-auto pr-1 sm:max-h-[48vh]">
          {episodes.map((episode, index) => (
            <Link
              key={`${episode.name}-${index}`}
              href={`/play/${detail.vod_id}/${sourceIndex}-${index}?site=${siteKey}`}
              className={`flex h-10 items-center justify-center rounded px-1 text-center text-xs transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft ${
                index === episodeIndex ? "brand-button font-bold" : "border border-white/8 bg-[#2a2a2a] text-cinema-muted hover:border-cinema-brand/50 hover:text-cinema-brand-soft"
              }`}
            >
              <span className="truncate">{index + 1}</span>
            </Link>
          ))}
        </div>

        <div className="mt-6">
          <h3 className="mb-3 text-sm font-bold text-cinema-primary">切换线路</h3>
          <div className="space-y-2">
            {detail.vod_play_from.map((line, index) => (
              <Link
                key={line}
                href={`/play/${detail.vod_id}/${index}-0?site=${siteKey}`}
                className={`flex items-center justify-between rounded px-3.5 py-2.5 text-xs transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft ${
                  index === sourceIndex ? "border border-cinema-brand/50 bg-cinema-brand/12 font-bold text-cinema-brand-soft" : "border border-white/8 bg-[#2a2a2a] text-cinema-muted hover:bg-[#333] hover:text-cinema-primary"
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
