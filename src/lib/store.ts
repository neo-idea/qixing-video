"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import type { SiteConfig, SourceBean, SubscriptionLine } from "@/lib/types";

const SOURCES_KEY = "qx_sources";
const SITE_REF_KEY = "qx_site_ref";
/** 兼容旧版单配置存储 */
const LEGACY_API_KEY = "qx_api_url";
const LEGACY_LINE_KEY = "qx_line_url";
const LEGACY_LINE_NAME_KEY = "qx_line_name";

/** 一条已导入的外部配置(直连配置或订阅中选定的某条线路) */
export interface SourceEntry {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
  addedAt: number;
}

type LoadResult = SiteConfig & { error?: string; remote?: boolean; requestedUrl?: string };

interface ConfigStore {
  sources: SourceEntry[];
  config: SiteConfig | null;
  loading: boolean;
  notice: string;
  siteRef: string;
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function hostOf(url: string) {
  try {
    return new URL(url).host;
  } catch {
    return url.slice(0, 40);
  }
}

/** 源的唯一标识: 配置地址 + 站点 key(不同配置下同名站点互不冲突) */
export function siteRef(origin: string, key: string) {
  return `${origin}::${key}`;
}

function readEntries(): SourceEntry[] {
  const raw = localStorage.getItem(SOURCES_KEY);
  if (raw) {
    try {
      const list = JSON.parse(raw) as SourceEntry[];
      if (Array.isArray(list)) return list.filter((e) => e && e.url);
    } catch {
      /* 损坏则走迁移 */
    }
  }
  // 旧版单配置迁移: 已选线路优先
  const lineUrl = localStorage.getItem(LEGACY_LINE_KEY) ?? "";
  const apiUrl = localStorage.getItem(LEGACY_API_KEY) ?? "";
  const url = lineUrl || apiUrl;
  if (!url) return [];
  const name = localStorage.getItem(LEGACY_LINE_NAME_KEY) || hostOf(url);
  return [{ id: uid(), name, url, enabled: true, addedAt: Date.now() }];
}

/**
 * 全局单例: 所有 useConfig 消费者(顶栏/首页/设置页/详情页)共享
 * 同一份状态, 任一处导入/开关立即广播到全部实例。
 */
let store: ConfigStore = {
  sources: [],
  config: null,
  loading: true,
  notice: "",
  siteRef: "",
};
const listeners = new Set<() => void>();
let initialized = false;

function emit() {
  listeners.forEach((listener) => listener());
}

function setStore(patch: Partial<ConfigStore>) {
  store = { ...store, ...patch };
  emit();
}

function persist(list: SourceEntry[]) {
  localStorage.setItem(SOURCES_KEY, JSON.stringify(list));
  for (const key of [LEGACY_API_KEY, LEGACY_LINE_KEY, LEGACY_LINE_NAME_KEY]) {
    localStorage.removeItem(key);
  }
}

function restoreSiteRef(cfg: SiteConfig) {
  const prev = store.siteRef;
  if (prev && cfg.sites.some((s) => siteRef(s.origin ?? "", s.key) === prev)) return;
  const cms = cfg.sites.find((s) => s.type === 0 || s.type === 4) ?? cfg.sites[0];
  const next = cms ? siteRef(cms.origin ?? "", cms.key) : "";
  if (next !== prev) setStore({ siteRef: next });
}

async function reload(list: SourceEntry[]) {
  setStore({ loading: true, notice: "" });
  try {
    const enabled = list.filter((e) => e.enabled);
    if (!enabled.length) {
      const res = await fetch(`/api/config/load?url=`);
      const json = (await res.json()) as LoadResult;
      const builtin = { ...json, remote: false };
      restoreSiteRef(builtin);
      setStore({ config: builtin, loading: false });
      return;
    }
    const results = await Promise.all(
      enabled.map(async (entry) => {
        try {
          const res = await fetch(`/api/config/load?url=${encodeURIComponent(entry.url)}`);
          const json = (await res.json()) as LoadResult;
          return { entry, json };
        } catch {
          return { entry, json: null as LoadResult | null };
        }
      })
    );
    const errors = results
      .filter((r) => !r.json || r.json.error || !r.json.sites?.length)
      .map((r) => `「${r.entry.name}」${r.json?.error ?? "加载失败"}`);
    const ok = results.filter((r) => r.json?.sites?.length);

    const merged: SiteConfig = {
      spider: ok.find((r) => r.json?.spider)?.json?.spider ?? "",
      wallpaper: ok.find((r) => r.json?.wallpaper)?.json?.wallpaper ?? "",
      warningText: "",
      sites: ok.flatMap((r) =>
        (r.json?.sites ?? []).map((s) => ({ ...s, origin: r.entry.url, originName: r.entry.name }))
      ),
      parses: ok.flatMap((r) => r.json?.parses ?? []),
      flags: [...new Set(ok.flatMap((r) => r.json?.flags ?? []))],
      rules: ok.flatMap((r) => r.json?.rules ?? []),
      remote: true,
    };
    restoreSiteRef(merged);
    setStore({
      config: merged,
      loading: false,
      notice: errors.length ? `部分配置加载失败: ${errors.join("；")}` : "",
    });
  } catch {
    setStore({ loading: false, notice: "接口源请求失败，请检查网络后重试" });
  }
}

function ensureInit() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  const list = readEntries();
  store = { ...store, sources: list, siteRef: localStorage.getItem(SITE_REF_KEY) ?? "" };
  reload(list);
}

/**
 * 导入配置/订阅: 订阅(urls 结构)展开为多条线路条目(默认关闭),
 * 直连配置为单条(默认开启)。导入后立即刷新合并配置。
 */
async function addSourceAction(url: string): Promise<string> {
  const res = await fetch(`/api/config/load?url=${encodeURIComponent(url)}`);
  const json = (await res.json()) as LoadResult;
  if (json.error) throw new Error(json.error);
  const sources = store.sources;
  if (json.subscription?.lines?.length) {
    const exists = new Set(sources.map((e) => e.url));
    const fresh = json.subscription.lines
      .filter((l: SubscriptionLine) => !exists.has(l.url))
      .map((l: SubscriptionLine) => ({
        id: uid(),
        name: l.name,
        url: l.url,
        enabled: false,
        addedAt: Date.now(),
      }));
    if (!fresh.length) return "该订阅的线路均已存在，可在下方列表中开启";
    const next = [...sources, ...fresh];
    persist(next);
    setStore({ sources: next });
    reload(next);
    return `识别为多线路订阅，已导入 ${fresh.length} 条线路（默认关闭，请按需开启）`;
  }
  if (!json.sites?.length) throw new Error("配置解析成功但未发现站点源");
  if (sources.some((e) => e.url === url)) return "该配置已在列表中";
  const next: SourceEntry[] = [
    ...sources,
    { id: uid(), name: hostOf(url), url, enabled: true, addedAt: Date.now() },
  ];
  persist(next);
  setStore({ sources: next });
  reload(next);
  return `已导入配置（${json.sites.length} 个站点源）`;
}

function toggleSourceAction(id: string) {
  const next = store.sources.map((e) => (e.id === id ? { ...e, enabled: !e.enabled } : e));
  persist(next);
  setStore({ sources: next });
  reload(next);
}

function removeSourceAction(id: string) {
  const next = store.sources.filter((e) => e.id !== id);
  persist(next);
  setStore({ sources: next });
  reload(next);
}

function clearAllAction() {
  persist([]);
  setStore({ sources: [] });
  reload([]);
}

function setSiteKeyAction(ref: string) {
  localStorage.setItem(SITE_REF_KEY, ref);
  setStore({ siteRef: ref });
}

export function useConfig() {
  const snapshot = useSyncExternalStore(
    (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => store,
    () => store
  );
  useEffect(() => {
    ensureInit();
  }, []);

  const setSiteKey = useCallback(setSiteKeyAction, []);
  const addSource = useCallback(addSourceAction, []);
  const toggleSource = useCallback(toggleSourceAction, []);
  const removeSource = useCallback(removeSourceAction, []);
  const clearAll = useCallback(clearAllAction, []);

  const currentSite: SourceBean | null =
    snapshot.config?.sites.find((s) => siteRef(s.origin ?? "", s.key) === snapshot.siteRef) ?? null;

  return {
    sources: snapshot.sources,
    config: snapshot.config,
    currentSite,
    siteKey: currentSite?.key ?? "",
    siteOrigin: currentSite?.origin ?? "",
    siteRef: snapshot.siteRef,
    setSiteKey,
    addSource,
    toggleSource,
    removeSource,
    clearAll,
    loading: snapshot.loading,
    notice: snapshot.notice,
  };
}
