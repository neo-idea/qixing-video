"use client";

import { useEffect, useState } from "react";
import type { CategoryFilter, VodItem } from "@/lib/types";

export interface SourceHomeData {
  classes: { type_id: string; type_name: string }[];
  filters: Record<string, CategoryFilter[]>;
  list: VodItem[];
}

interface SourceHomeSnapshot {
  key: string;
  data: SourceHomeData | null;
  loading: boolean;
}

const cache = new Map<string, SourceHomeData>();
const requests = new Map<string, Promise<SourceHomeData>>();

function sourceKey(siteKey: string, siteOrigin: string) {
  return `${siteOrigin}::${siteKey}`;
}

function normalize(data: Record<string, unknown>): SourceHomeData {
  return {
    classes: (Array.isArray(data.class) ? data.class : []).filter(
      (item): item is { type_id: string; type_name: string } =>
        Boolean(item) && typeof (item as { type_id?: unknown }).type_id === "string" && typeof (item as { type_name?: unknown }).type_name === "string"
    ),
    filters: (data.filters ?? {}) as Record<string, CategoryFilter[]>,
    list: (Array.isArray(data.list) ? data.list : []) as VodItem[],
  };
}

function loadSourceHome(key: string, siteKey: string, siteOrigin: string) {
  const cached = cache.get(key);
  if (cached) return Promise.resolve(cached);

  const pending = requests.get(key);
  if (pending) return pending;

  const query = siteOrigin ? `?from=${encodeURIComponent(siteOrigin)}` : "";
  const request = fetch(`/api/site/${encodeURIComponent(siteKey)}/home${query}`)
    .then(async (response) => {
      const data = normalize((await response.json()) as Record<string, unknown>);
      cache.set(key, data);
      return data;
    })
    .catch(() => ({ classes: [], filters: {}, list: [] }));

  requests.set(key, request);
  void request.finally(() => requests.delete(key));
  return request;
}

export function useSourceHome(siteKey: string, siteOrigin: string) {
  const key = siteKey ? sourceKey(siteKey, siteOrigin) : "";
  const [snapshot, setSnapshot] = useState<SourceHomeSnapshot>(() => ({
    key,
    data: key ? cache.get(key) ?? null : null,
    loading: Boolean(key && !cache.has(key)),
  }));

  useEffect(() => {
    if (!key) {
      setSnapshot({ key: "", data: null, loading: false });
      return;
    }

    const cached = cache.get(key);
    if (cached) {
      setSnapshot({ key, data: cached, loading: false });
      return;
    }

    let current = true;
    setSnapshot({ key, data: null, loading: true });
    void loadSourceHome(key, siteKey, siteOrigin).then((data) => {
      if (current) setSnapshot({ key, data, loading: false });
    });

    return () => { current = false; };
  }, [key, siteKey, siteOrigin]);

  const current = snapshot.key === key;
  return { data: current ? snapshot.data : null, loading: !current || snapshot.loading };
}
