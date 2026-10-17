"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Poster } from "@/components/poster";
import { useConfig } from "@/lib/store";
import type { VodDetail, VodItem } from "@/lib/types";

export function DetailClient({ id, site }: { id: string; site?: string }) {
  const { config, siteKey, loading: cfgLoading } = useConfig();
  const key = site ?? siteKey;
  const [detail, setDetail] = useState<VodDetail | null>(null);
  const [error, setError] = useState("");
  const [sources, setSources] = useState<{ site: string; name: string; item: VodItem }[]>([]);

  useEffect(() => {
    if (!key) return;
    let alive = true;
    setDetail(null);
    setError("");
    setSources([]);
    fetch(`/api/site/${key}/detail?id=${encodeURIComponent(id)}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "加载失败");
        setDetail(data as VodDetail);
        return data as VodDetail;
      })
      .then((data) => {
        (config?.sites ?? []).forEach((source) => {
          if (source.key === key) return;
          fetch(`/api/site/${source.key}/search?key=${encodeURIComponent(data.vod_name)}`)
            .then((response) => response.json())
            .then((result) => {
              if (!alive) return;
              const hit = (result.list ?? []).find((item: VodItem) => item.vod_name === data.vod_name);
              if (hit) setSources((previous) => [...previous, { site: source.key, name: source.name, item: hit }]);
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
  }, [id, key, config]);

  if (cfgLoading || !detail) {
    return (
      <div className="grid place-items-center py-28 sm:py-44">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-white/10 border-t-[#ff4d00]" />
        <p className="mt-5 text-xs text-zinc-500">正在读取影片详情 detailContent…</p>
      </div>
    );
  }
  if (error) return <div className="grid place-items-center px-4 py-28 text-center text-sm text-zinc-500 sm:py-44">{error}</div>;

  return (
    <>
      <section className="relative -mx-3 -mt-4 overflow-hidden px-3 pb-8 pt-6 sm:-mx-4 sm:-mt-6 sm:px-4 sm:pb-10 sm:pt-10 lg:-mx-8 lg:px-8 lg:pt-16">
        <div aria-hidden className="absolute inset-0 opacity-65" style={{ background: `radial-gradient(90% 100% at 75% 0%, ${detail.gradient[1]}, transparent 65%)` }} />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-[#08080b]/45 via-[#08080b]/85 to-[#08080b]" />
        <div className="relative mx-auto flex max-w-[1480px] flex-row gap-4 md:gap-8">
          <div className="w-[104px] shrink-0 overflow-hidden rounded-xl ring-1 ring-white/15 cinematic-shadow sm:w-[136px] md:w-[180px] md:rounded-2xl lg:w-[236px]">
            <Poster item={detail} compact />
          </div>
          <div className="min-w-0 flex-1 self-center pt-0 md:self-auto md:pt-1">
            <div className="no-scrollbar -mx-1 mb-3 flex gap-1.5 overflow-x-auto px-1 text-xs sm:mb-4 sm:flex-wrap sm:gap-2">
              <span className="rounded-sm bg-gradient-to-r from-[#ff5e00] to-[#ff9d2e] px-2 py-1 font-black text-white">{detail.vod_score}</span>
              <span className="rounded-sm border border-white/15 bg-white/8 px-2 py-1 text-zinc-200">{detail.year}</span>
              <span className="rounded-sm border border-white/15 bg-white/8 px-2 py-1 text-zinc-200">{detail.area}</span>
              <span className="rounded-sm border border-white/15 bg-white/8 px-2 py-1 text-zinc-200">{detail.category}</span>
              <span className="rounded-sm border border-emerald-500/25 bg-emerald-500/10 px-2 py-1 text-emerald-400">
                源: {config?.sites.find((source) => source.key === key)?.name ?? key}
              </span>
            </div>
            <h1 className="mb-3 line-clamp-2 text-2xl font-black leading-tight tracking-tight text-white sm:mb-5 sm:text-4xl lg:text-6xl">{detail.vod_name}</h1>
            <dl className="mb-4 hidden gap-2 text-sm text-zinc-400 md:mb-6 md:grid md:grid-cols-2">
              <div><dt className="inline text-zinc-600">导演：</dt><dd className="inline text-zinc-300">{detail.director}</dd></div>
              <div><dt className="inline text-zinc-600">主演：</dt><dd className="inline text-zinc-300">{detail.actors}</dd></div>
            </dl>
            <p className="mb-5 line-clamp-3 max-w-3xl text-xs leading-6 text-zinc-300 sm:mb-7 sm:text-sm sm:leading-7">{detail.content}</p>
            <div className="flex flex-wrap gap-2.5 sm:gap-3">
              <Link href={`/play/${detail.vod_id}/0-0?site=${key}`} className="flex flex-1 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white transition-transform hover:scale-[1.03] brand-button sm:flex-none sm:px-8">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86a1 1 0 0 0-1.5.86Z"/></svg>
                立即播放
              </Link>
              <span className="flex min-w-0 flex-1 items-center justify-center rounded-full border border-white/12 bg-white/6 px-4 py-3 text-xs text-zinc-400 sm:flex-none sm:px-6">{detail.vod_remarks}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          {detail.vod_play_from.map((from, sourceIndex) => (
            <section key={from} className="panel rounded-2xl p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#ff812b]">Play List</p>
                  <h2 className="mt-1.5 text-lg font-black text-white">{from}</h2>
                </div>
                <span className="rounded-full bg-white/6 px-3 py-1.5 text-xs text-zinc-400">{detail.vod_play_url[sourceIndex]?.length ?? 0} 集</span>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-2.5 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8">
                {detail.vod_play_url[sourceIndex].map((episode, episodeIndex) => (
                  <Link
                    key={`${episode.name}-${episodeIndex}`}
                    href={`/play/${detail.vod_id}/${sourceIndex}-${episodeIndex}?site=${key}`}
                    className="group relative rounded-xl border border-white/8 bg-white/4 px-3 py-3 text-center text-xs text-zinc-300 transition hover:-translate-y-0.5 hover:border-orange-500/45 hover:bg-orange-500/10 hover:text-white"
                  >
                    {episode.name}
                    {episode.parse === 1 ? <span className="absolute right-1 top-1 text-[9px] font-bold text-[#66aaff]">JX</span> : null}
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>

        <aside className="panel h-fit rounded-2xl p-4 sm:p-5">
          <div className="mb-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#ff812b]">Change Source</p>
            <h2 className="mt-1.5 text-lg font-black text-white">同名影片换源</h2>
          </div>
          {sources.length ? (
            <div className="space-y-2">
              {sources.map((source) => (
                <Link key={source.site} href={`/detail/${source.item.vod_id}?site=${source.site}`} className="flex items-center gap-3 rounded-xl border border-white/7 bg-white/4 p-3 transition hover:border-orange-500/40 hover:bg-white/8">
                  <span className="h-[64px] w-11 overflow-hidden rounded-md"><Poster item={source.item} compact /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-zinc-100">{source.name}</span>
                    <span className="mt-1 block truncate text-[11px] text-zinc-500">{source.item.vod_remarks}</span>
                  </span>
                  <span className="text-xs font-black text-[#ffb66e]">{source.item.vod_score}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="rounded-xl bg-white/4 p-4 text-xs leading-relaxed text-zinc-500">正在并发搜索其他源的同名影片，命中后会自动出现在这里。</p>
          )}
        </aside>
      </div>
    </>
  );
}
