"use client";

import type HlsJs from "hls.js";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui";

export type PlaybackStatus = "parsing" | "ready" | "failed";

const STATUS_TEXT: Record<PlaybackStatus, string> = {
  parsing: "解析中",
  ready: "片源就绪",
  failed: "待切换线路",
};

function readProgress(key: string) {
  try {
    const value = Number(localStorage.getItem(key));
    return Number.isFinite(value) ? value : 0;
  } catch {
    return 0;
  }
}

function saveProgress(key: string, value: number) {
  try {
    localStorage.setItem(key, String(value));
  } catch {}
}

export function VideoPlayer({
  src,
  poster,
  title,
  sourceLabel,
  playbackStatus = "ready",
}: {
  src: string;
  poster?: string;
  title?: string;
  sourceLabel?: string;
  playbackStatus?: PlaybackStatus;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [chromeVisible, setChromeVisible] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const [resumeTime, setResumeTime] = useState(0);
  const [resumedAt, setResumedAt] = useState(0);
  const lastSavedRef = useRef(0);
  const formatTime = (seconds: number) => {
    const minute = Math.floor(seconds / 60);
    const second = Math.floor(seconds % 60);
    return `${minute}:${String(second).padStart(2, "0")}`;
  };

  const progressKey = `qixing:play-progress:${src}`;

  useEffect(() => {
    setError("");
    setLoading(true);
    setChromeVisible(true);
    const savedTime = readProgress(progressKey);
    setResumeTime(savedTime > 15 ? savedTime : 0);
    setResumedAt(0);
    const video = ref.current;
    if (!video) return;
    let hls: HlsJs | null = null;
    const isM3u8 = src.includes(".m3u8");

    if (isM3u8 && !video.canPlayType("application/vnd.apple.mpegurl")) {
      import("hls.js").then(({ default: Hls }) => {
        if (!Hls.isSupported()) {
          setLoading(false);
          setError("当前浏览器不支持 HLS 播放");
          return;
        }
        hls = new Hls({ enableWorker: true });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            console.error("HLS playback failed", data.details);
            setLoading(false);
            setChromeVisible(true);
            setError("当前线路暂时不可用，可重试或切换其它线路");
          }
        });
      });
    } else {
      video.src = src;
    }
    return () => {
      if (video && video.currentTime > 15 && Number.isFinite(video.duration) && video.duration - video.currentTime > 20) {
        saveProgress(progressKey, video.currentTime);
      }
      hls?.destroy();
    };
  }, [src, attempt, progressKey]);

  useEffect(() => {
    if (!resumedAt) return;
    const timer = setTimeout(() => setResumedAt(0), 3200);
    return () => clearTimeout(timer);
  }, [resumedAt]);

  const showChrome = chromeVisible || Boolean(error);

  return (
    <div className="relative overflow-hidden rounded-xl bg-black ring-1 ring-white/10 shadow-cinematic">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24 bg-gradient-to-b from-black/78 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-28 bg-gradient-to-t from-black/80 to-transparent" />

      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        ref={ref}
        controls
        autoPlay
        playsInline
        poster={poster}
        preload="metadata"
        className="aspect-video w-full bg-black"
        onLoadedMetadata={() => {
          const video = ref.current;
          if (video && resumeTime > 15 && resumeTime < video.duration - 20) {
            video.currentTime = resumeTime;
            setResumedAt(resumeTime);
          }
          setResumeTime(0);
          setLoading(false);
        }}
        onCanPlay={() => setLoading(false)}
        onTimeUpdate={() => {
          const video = ref.current;
          const now = Date.now();
          if (!video || !Number.isFinite(video.duration) || video.duration - video.currentTime <= 20) return;
          if (now - lastSavedRef.current < 5000) return;
          lastSavedRef.current = now;
          saveProgress(progressKey, video.currentTime);
        }}
        onWaiting={() => {
          setLoading(true);
          setChromeVisible(true);
        }}
        onPlaying={() => {
          setLoading(false);
          setError("");
          setChromeVisible(false);
        }}
        onPause={() => {
          setLoading(false);
          setChromeVisible(true);
        }}
        onError={() => {
          setLoading(false);
          setChromeVisible(true);
          setError("视频加载失败，请切换线路或集数");
        }}
      />

      {resumedAt ? (
        <div className="pointer-events-none absolute left-1/2 top-16 z-30 -translate-x-1/2 rounded-full border border-white/10 bg-black/70 px-4 py-2 text-[11px] font-semibold text-white/85 backdrop-blur-md">
          已从 {formatTime(resumedAt)} 继续播放
        </div>
      ) : null}

      {(title || sourceLabel) && !error ? (
        <div className={`pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 p-3 transition-opacity duration-300 sm:p-4 ${showChrome ? "opacity-100" : "opacity-0"}`}>
          <div className="min-w-0 max-w-[68%] rounded-xl border border-white/10 bg-black/45 px-3 py-2 backdrop-blur-md">
            {title ? <p className="truncate text-xs font-bold text-white sm:text-sm">{title}</p> : null}
            {sourceLabel ? <p className="mt-1 truncate text-[10px] text-white/60">{sourceLabel}</p> : null}
          </div>
          <div className="flex h-9 shrink-0 items-center gap-2 rounded-full border border-white/10 bg-black/45 px-3 text-[10px] font-semibold text-white/80 backdrop-blur-md">
            <span className={`h-1.5 w-1.5 rounded-full ${playbackStatus === "ready" ? "bg-cinema-success" : playbackStatus === "failed" ? "bg-cinema-warning" : "animate-pulse bg-cinema-brand"}`} />
            {STATUS_TEXT[playbackStatus]}
          </div>
        </div>
      ) : null}

      {loading && !error ? (
        <div className="pointer-events-none absolute inset-0 grid place-items-center bg-gradient-to-t from-black/85 via-black/45 to-black/65 backdrop-blur-[3px]" aria-live="polite">
          <div className="flex flex-col items-center gap-5 px-8 text-center">
            <span className="relative grid h-16 w-16 place-items-center">
              <span className="absolute inset-0 animate-ping rounded-full bg-cinema-brand/12" />
              <span className="absolute inset-2 rounded-full border border-white/18" />
              <span className="grid h-11 w-11 place-items-center rounded-full bg-cinema-brand text-lg font-black text-cinema-on-brand shadow-brand-glow">七</span>
            </span>
            <span>
              <span className="block text-sm font-semibold text-white/92">正在接入片源</span>
              <span className="mt-1.5 block text-[11px] text-white/55">{playbackStatus === "parsing" ? "正在解析可播放地址" : "正在缓冲最佳画面"}</span>
            </span>
            <span className="relative h-1 w-44 overflow-hidden rounded-full bg-white/10">
              <span className="source-progress absolute inset-0" />
            </span>
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="absolute inset-0 grid place-items-center bg-black/93 px-8 text-center backdrop-blur-md">
          <div className="max-w-md">
            <span className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-cinema-danger/14 text-cinema-danger">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8v5" strokeLinecap="round" /><path d="M12 16.5v.01" strokeLinecap="round" /><path d="M10.3 3.9 2.5 17.4A2 2 0 0 0 4.2 20.4h15.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" strokeLinecap="round" /></svg>
            </span>
            <p className="mb-2.5 text-lg font-bold text-white">播放暂时不可用</p>
            <p className="text-xs leading-relaxed text-cinema-subtle">当前线路可能受限或已经失效。可以重新连接，也可以切换线路、集数或内容源。</p>
            <Button variant="secondary" size="sm" className="mt-6 rounded-full px-6 active:scale-[0.97]" onClick={() => {
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
