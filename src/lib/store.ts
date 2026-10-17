"use client";

import { useCallback, useEffect, useState } from "react";
import type { SiteConfig } from "@/lib/types";

const API_URL_KEY = "qx_api_url";
const SITE_KEY_KEY = "qx_site_key";

export function useConfig() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [siteKey, setSiteKeyState] = useState("demo");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  const load = useCallback(async (url: string) => {
    setLoading(true);
    setNotice("");
    try {
      const res = await fetch(`/api/config/load?url=${encodeURIComponent(url)}`);
      const json: SiteConfig & { warningText?: string; error?: string } = await res.json();
      setConfig(json);
      if (json.error) setNotice(json.warningText ?? json.error);
      const saved = localStorage.getItem(SITE_KEY_KEY) ?? "";
      const first = json.sites.find((s) => s.key === saved) ?? json.sites[0];
      if (first) setSiteKeyState(first.key);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(localStorage.getItem(API_URL_KEY) ?? "");
  }, [load]);

  const setApiUrl = useCallback((url: string) => {
    localStorage.setItem(API_URL_KEY, url);
    load(url);
  }, [load]);

  const setSiteKey = useCallback((key: string) => {
    localStorage.setItem(SITE_KEY_KEY, key);
    setSiteKeyState(key);
  }, []);

  return { config, siteKey, setSiteKey, setApiUrl, loading, notice };
}
