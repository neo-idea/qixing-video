"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_358px]">
      <div className="min-w-0">
        <VideoPlayer src={finalUrl} />
        <section className="panel mt-4 rounded-2xl p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <Link href={`/detail/${detail.vod_id}?site=${siteKey}`} className="block truncate text-2xl font-black tracking-tight text-white transition hover:text-[#ffa257]">
                {detail.vod_name}
              </Link>
              <p className="mt-2 text-xs text-zinc-500">{detail.year} · {detail.area} · {detail.category} · {detail.vod_remarks}</p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-white/10 bg-white/6 px-3 py-2 text-zinc-300">{from} · {current.name}</span>
              <span className="rounded-full border border-orange-500/25 bg-orange-500/10 px-3 py-2 font-semibold text-[#ffb66e]">解析: {parseLabel}</span>
            </div>
          </div>
        </section>

        <section className="panel mt-4 rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#ff812b]">Parser Trace</p>
              <h2 className="mt-1.5 text-base font-black text-white">播放解析链路</h2>
            </div>
            <span className="rounded-full bg-white/6 px-3 py-1.5 text-[11px] text-zinc-500">PlayActivity.OooOO0O</span>
          </div>
          <ol className="space-y-3">
            {steps.map((step, index) => (
              <li key={index} className="flex items-start gap-3 rounded-xl border border-white/6 bg-white/4 p-3 text-xs">
                <span className={`mt-0.5 rounded-lg px-2 py-1 font-mono text-[10px] ${step.ok ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                  {step.engine}
                </span>
                <span className="min-w-0 flex-1 text-zinc-400">{step.message}</span>
                <span className="shrink-0 font-mono text-[10px] text-zinc-600">{step.costMs}ms</span>
              </li>
            ))}
            {!steps.length ? <li className="rounded-xl bg-white/4 p-4 text-xs text-zinc-500">正在生成解析过程…</li> : null}
          </ol>
        </section>
      </div>

      <aside className="panel h-fit rounded-2xl p-5 xl:sticky xl:top-[92px]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#ff812b]">Episode</p>
            <h3 className="mt-1.5 text-lg font-black text-white">选集 · {from}</h3>
          </div>
          <span className="rounded-full bg-white/6 px-3 py-1.5 text-[11px] text-zinc-400">{episodes.length} 集</span>
        </div>
        <div className="grid max-h-[48vh] grid-cols-4 gap-2 overflow-y-auto pr-1">
          {episodes.map((episode, index) => (
            <Link
              key={`${episode.name}-${index}`}
              href={`/play/${detail.vod_id}/${sourceIndex}-${index}?site=${siteKey}`}
              className={`rounded-xl py-2.5 text-center text-xs transition ${
                index === episodeIndex ? "brand-button font-bold text-white" : "border border-white/7 bg-white/4 text-zinc-400 hover:bg-white/10 hover:text-white"
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
                className={`flex items-center justify-between rounded-xl px-4 py-3 text-xs transition ${
                  index === sourceIndex ? "border border-orange-500/40 bg-orange-500/12 font-bold text-[#ffb66e]" : "border border-white/7 bg-white/4 text-zinc-400 hover:bg-white/8 hover:text-white"
                }`}
              >
                {line}
                <span className="text-[10px] text-zinc-600">{index === sourceIndex ? "当前" : "切换"}</span>
              </Link>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
