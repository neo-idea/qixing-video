"use client";

import type HlsJs from "hls.js";
import { useEffect, useRef, useState } from "react";

export function VideoPlayer({ src, poster }: { src: string; poster?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

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
          if (data.fatal) setError(`播放失败: ${data.details}`);
        });
      });
    } else {
      video.src = src;
    }
    return () => hls?.destroy();
  }, [src]);

  return (
    <div className="relative overflow-hidden rounded-xl bg-black ring-1 ring-white/12 cinematic-shadow sm:rounded-[18px]">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-20 bg-gradient-to-b from-black/75 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-t from-black/80 to-transparent" />
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        ref={ref}
        controls
        autoPlay
        playsInline
        poster={poster}
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
      {loading && !error ? (
        <div className="pointer-events-none absolute inset-0 grid place-items-center bg-black/45">
          <div className="flex flex-col items-center gap-3">
            <div className="h-11 w-11 animate-spin rounded-full border-2 border-white/18 border-t-cinema-brand" />
            <p className="text-xs text-cinema-muted">正在接入播放源…</p>
          </div>
        </div>
      ) : null}
      {error ? (
        <div className="absolute inset-0 grid place-items-center bg-black/88 px-8 text-center">
          <div>
            <p className="mb-2 text-base font-bold text-white">{error}</p>
            <p className="text-xs leading-relaxed text-cinema-subtle">可尝试切换线路、集数或接口源；公共测试流在网络受限时可能不可用。</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
