"use client";

import type HlsJs from "hls.js";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui";

/**
 * 播放器: 海报帧即刻呈现(响应感), loading 为居中细腻单圈 spinner
 * (不放假进度条), 错误态提供明确恢复动作。
 */
export function VideoPlayer({ src, poster, title, sourceLabel }: { src: string; poster?: string; title?: string; sourceLabel?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setError("");
    setLoading(true);
    const video = ref.current;
    if (!video) return;
    let hls: HlsJs | null = null;
    const isM3u8 = src.includes(".m3u8");

    if (isM3u8 && !video.canPlayType("application/vnd.apple.mpegurl")) {
      import("hls.js").then(({ default: Hls }) => {
        if (!Hls.isSupported()) {
          setError("当前浏览器不支持 HLS 播放");
          return;
        }
        hls = new Hls({ enableWorker: true });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            setLoading(false);
            setError(`播放失败: ${data.details}`);
          }
        });
      });
    } else {
      video.src = src;
    }
    return () => hls?.destroy();
  }, [src, attempt]);

  return (
    <div className="relative overflow-hidden rounded-md bg-black ring-1 ring-white/10">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 bg-gradient-to-b from-black/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-20 bg-gradient-to-t from-black/75 to-transparent" />
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        ref={ref}
        controls
        autoPlay
        playsInline
        poster={poster}
        preload="metadata"
        className="aspect-video w-full bg-black"
        onLoadedMetadata={() => setLoading(false)}
        onCanPlay={() => setLoading(false)}
        onWaiting={() => setLoading(true)}
        onPlaying={() => {
          setLoading(false);
          setError("");
        }}
        onPause={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError("视频加载失败，请切换线路或集数");
        }}
      />
      {title ? (
        <div className="pointer-events-none absolute left-0 right-0 top-0 z-20 flex items-start justify-between gap-3 p-3 sm:p-4">
          <div className="min-w-0 rounded bg-black/60 px-2.5 py-1.5 backdrop-blur-sm">
            <p className="truncate text-[11px] font-bold text-white sm:text-xs">{title}</p>
            {sourceLabel ? <p className="mt-0.5 truncate text-[9px] text-white/55">{sourceLabel}</p> : null}
          </div>
        </div>
      ) : null}
      {loading && !error ? (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="flex flex-col items-center gap-2.5">
            <span className="block h-7 w-7 animate-spin rounded-full border-2 border-white/15 border-t-cinema-brand" />
            <span className="text-[11px] text-white/45">加载中</span>
          </div>
        </div>
      ) : null}
      {error ? (
        <div className="absolute inset-0 grid place-items-center bg-black/88 px-8 text-center">
          <div className="max-w-md">
            <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-cinema-danger/15 text-cinema-danger">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8v5" strokeLinecap="round" /><path d="M12 16.5v.01" strokeLinecap="round" /><path d="M10.3 3.9 2.5 17.4A2 2 0 0 0 4.2 20.4h15.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" strokeLinecap="round" /></svg>
            </span>
            <p className="mb-1.5 text-sm font-bold text-white">{error}</p>
            <p className="text-xs leading-relaxed text-cinema-subtle">可尝试切换线路、集数或接口源；公共测试流在网络受限时可能不可用。</p>
            <Button variant="secondary" size="sm" className="mt-4 rounded active:scale-[0.97]" onClick={() => {
              setError("");
              setLoading(true);
              setAttempt((value) => value + 1);
            }}>重新连接</Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
