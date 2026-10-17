"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Chip, Eyebrow, Panel } from "@/components/ui";
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

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_330px] lg:gap-5 xl:grid-cols-[minmax(0,1fr)_358px]">
      <div className="min-w-0">
        <VideoPlayer src={finalUrl} />
        <Panel className="mt-3 p-4 sm:mt-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-4">
            <div className="min-w-0">
              <Link href={`/detail/${detail.vod_id}?site=${siteKey}`} className="block truncate text-xl font-black tracking-tight text-white transition hover:text-cinema-brand-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cinema-brand-soft sm:text-2xl">
                {detail.vod_name}
              </Link>
              <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-cinema-subtle sm:mt-2 sm:text-xs">{detail.year} · {detail.area} · {detail.category} · {detail.vod_remarks}</p>
            </div>
            <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 text-xs sm:mx-0 sm:flex-wrap sm:px-0">
              <Chip className="shrink-0">{from} · {current.name}</Chip>
              <Chip tone="brand" className="shrink-0 font-semibold">解析: {parseLabel}</Chip>
            </div>
          </div>
        </Panel>

        <Panel className="mt-4 p-4 sm:p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <Eyebrow>Parser Trace</Eyebrow>
              <h2 className="mt-1.5 text-base font-black text-white">播放解析链路</h2>
            </div>
            <Chip size="sm" className="hidden text-[11px] sm:inline-flex">PlayActivity.OooOO0O</Chip>
          </div>
          <ol className="space-y-3">
            {steps.map((step, index) => (
              <li key={index} className="flex items-start gap-2.5 rounded-xl border border-white/6 bg-white/4 p-3 text-xs sm:gap-3">
                <span className={`mt-0.5 rounded-lg px-2 py-1 font-mono text-[10px] ${step.ok ? "bg-cinema-success/15 text-cinema-success" : "bg-cinema-danger/15 text-cinema-danger"}`}>
                  {step.engine}
                </span>
                <span className="min-w-0 flex-1 text-cinema-muted">{step.message}</span>
                <span className="shrink-0 font-mono text-[10px] text-cinema-subtle">{step.costMs}ms</span>
              </li>
            ))}
            {!steps.length ? <li className="rounded-xl bg-white/4 p-4 text-xs text-cinema-subtle">正在生成解析过程…</li> : null}
          </ol>
        </Panel>
      </div>

      <Panel className="h-fit p-4 sm:p-5 lg:sticky lg:top-[92px]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <Eyebrow>Episode</Eyebrow>
            <h3 className="mt-1 line-clamp-1 text-base font-black text-white sm:mt-1.5 sm:text-lg">选集 · {from}</h3>
          </div>
          <Chip size="sm" className="text-[11px]">{episodes.length} 集</Chip>
        </div>
        <div className="grid max-h-[42vh] grid-cols-4 gap-2 overflow-y-auto pr-1 sm:max-h-[48vh] sm:grid-cols-4 lg:grid-cols-4">
          {episodes.map((episode, index) => (
            <Link
              key={`${episode.name}-${index}`}
              href={`/play/${detail.vod_id}/${sourceIndex}-${index}?site=${siteKey}`}
              className={`rounded-xl py-2.5 text-center text-xs transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft ${
                index === episodeIndex ? "brand-button font-bold text-white" : "border border-white/7 bg-white/4 text-cinema-muted hover:bg-white/10 hover:text-white"
              }`}
            >
              {index + 1}
            </Link>
          ))}
        </div>

        <div className="mt-6">
          <h3 className="mb-3 text-sm font-black text-white">切换线路</h3>
          <div className="space-y-2">
            {detail.vod_play_from.map((line, index) => (
              <Link
                key={line}
                href={`/play/${detail.vod_id}/${index}-0?site=${siteKey}`}
                className={`flex items-center justify-between rounded-xl px-4 py-3 text-xs transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft ${
                  index === sourceIndex ? "border border-cinema-brand/40 bg-cinema-brand/12 font-bold text-cinema-brand-soft" : "border border-white/7 bg-white/4 text-cinema-muted hover:bg-white/8 hover:text-white"
                }`}
              >
                {line}
                <span className="text-[10px] text-cinema-subtle">{index === sourceIndex ? "当前" : "切换"}</span>
              </Link>
            ))}
          </div>
        </div>
      </Panel>
    </div>
  );
}
