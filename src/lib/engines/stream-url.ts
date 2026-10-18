/**
 * 直链流媒体判定, 移植自 StreamLib iOS StreamURL/_isDirectVideoUrl:
 * 扩展名表 + 流媒体 scheme + live 路径特征。
 */
const DIRECT_EXTENSIONS = new Set([
  "m3u8", "mp4", "mkv", "flv", "avi", "mov", "ts", "webm", "mpd",
  "mp3", "m4a", "aac", "flac", "wav", "ogg", "opus", "3gp", "rmvb", "wmv",
]);

export function isDirectStream(url: string): boolean {
  if (!url) return false;
  const lowered = url.toLowerCase();
  let scheme = "";
  try {
    scheme = new URL(url).protocol.replace(":", "");
  } catch {
    return false;
  }
  if (["magnet", "ed2k", "thunder"].includes(scheme)) return false;
  // .m3u8?xxx / .mp4#frag 风格: 剥离 query 与 fragment 后看扩展名
  const path = lowered.split("?")[0].split("#")[0];
  const dot = path.lastIndexOf(".");
  if (dot >= 0 && DIRECT_EXTENSIONS.has(path.slice(dot + 1))) return true;
  if (["rtsp", "rtmp", "rtsps"].includes(scheme)) return true;
  if (lowered.includes("/live/") || lowered.includes("live.flv")) return true;
  return false;
}

/** 广告/追踪域名(解析结果过滤用) */
const AD_DOMAINS = ["bulsis.net", "jxjson.icu"];

export function isAdDomain(url: string): boolean {
  try {
    const host = new URL(url).host;
    return AD_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`));
  } catch {
    return false;
  }
}
