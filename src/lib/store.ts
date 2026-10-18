"use client";

import { useCallback, useEffect, useState } from "react";
import type { SiteConfig, SubscriptionLine } from "@/lib/types";

const API_URL_KEY = "qx_api_url";
const SITE_KEY_KEY = "qx_site_key";
const LINE_URL_KEY = "qx_line_url";
const LINE_NAME_KEY = "qx_line_name";
const COOKIE_NAME = "qx_api_url";

type LoadResult = SiteConfig & { error?: string; remote?: boolean; requestedUrl?: string };

/** 服务端路由与 play 页通过该 cookie 找到当前生效的配置地址 */
function syncConfigCookie(url: string) {
  if (typeof document === "undefined") return;
  document.cookie = url
    ? `${COOKIE_NAME}=${encodeURIComponent(url)}; Path=/; Max-Age=31536000; SameSite=Lax`
    : `${COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function useConfig() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [siteKey, setSiteKeyState] = useState("demo");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [lines, setLines] = useState<SubscriptionLine[]>([]);
  const [apiUrl, setApiUrlState] = useState("");
  const [lineUrl, setLineUrlState] = useState("");
  const [lineName, setLineNameState] = useState("");

  const load = useCallback(async (url: string) => {
    setLoading(true);
    setNotice("");
    setLines([]);
    try {
      const res = await fetch(`/api/config/load?url=${encodeURIComponent(url)}`);
      const json = (await res.json()) as LoadResult;
      setConfig(json);
      setLines(json.subscription?.lines ?? []);
      if (json.error) setNotice(json.warningText ?? json.error);
      else if (json.warningText) setNotice(json.warningText);
      // 订阅未选线路时回落内置源, cookie 置空; 真正生效的线路才写入
      syncConfigCookie(json.remote ? url : "");
      const saved = localStorage.getItem(SITE_KEY_KEY) ?? "";
      const first = json.sites.find((s) => s.key === saved) ?? json.sites[0];
      if (first) setSiteKeyState(first.key);
    } catch {
      setNotice("接口源请求失败，请检查网络后重试；当前可能显示旧配置");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedApi = localStorage.getItem(API_URL_KEY) ?? "";
    const savedLine = localStorage.getItem(LINE_URL_KEY) ?? "";
    setApiUrlState(savedApi);
    setLineUrlState(savedLine);
    setLineNameState(localStorage.getItem(LINE_NAME_KEY) ?? "");
    load(savedLine || savedApi);
  }, [load]);

  const setApiUrl = useCallback(
    (url: string) => {
      localStorage.setItem(API_URL_KEY, url);
      localStorage.removeItem(LINE_URL_KEY);
      localStorage.removeItem(LINE_NAME_KEY);
      setApiUrlState(url);
      setLineUrlState("");
      setLineNameState("");
      load(url);
    },
    [load]
  );

  /** 多线路订阅: 选择具体线路后以该线路为当前配置, 线路名一并持久化便于回显 */
  const pickLine = useCallback(
    (line: SubscriptionLine) => {
      localStorage.setItem(LINE_URL_KEY, line.url);
      localStorage.setItem(LINE_NAME_KEY, line.name);
      setLineUrlState(line.url);
      setLineNameState(line.name);
      load(line.url);
    },
    [load]
  );

  /** 回到订阅线路选择: 清除已选线路, 重新加载订阅列表 */
  const resetLine = useCallback(() => {
    localStorage.removeItem(LINE_URL_KEY);
    localStorage.removeItem(LINE_NAME_KEY);
    setLineUrlState("");
    setLineNameState("");
    load(localStorage.getItem(API_URL_KEY) ?? "");
  }, [load]);

  const setSiteKey = useCallback((key: string) => {
    localStorage.setItem(SITE_KEY_KEY, key);
    setSiteKeyState(key);
  }, []);

  return { config, siteKey, setSiteKey, setApiUrl, loading, notice, lines, lineUrl, lineName, apiUrl, pickLine, resetLine };
}
