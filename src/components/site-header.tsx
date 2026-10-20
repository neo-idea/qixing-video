"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useConfig } from "@/lib/store";
import { useSourceHome } from "@/lib/use-source-home";

export function SiteHeader() {
  const [keyword, setKeyword] = useState("");
  const [sourceOpen, setSourceOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeId = searchParams.get("c") ?? "";
  const menuRef = useRef<HTMLDivElement>(null);
  const { config, siteKey, siteOrigin, setSiteKey } = useConfig();
  const { data: sourceHome, loading: categoriesLoading } = useSourceHome(siteKey, siteOrigin);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setSourceOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const currentSite = config?.sites.find((site) => site.key === siteKey && (!siteOrigin || site.origin === siteOrigin));
  const isPlayable = (site: { type: number; api: string }) =>
    site.type === 0 || site.type === 4 || ["csp_AppYs", "csp_AppYsV2", "csp_AppGet", "csp_AppGet2"].includes(site.api);
  const orderedSites = useMemo(
    () => [...(config?.sites ?? [])].sort((a, b) => Number(isPlayable(b)) - Number(isPlayable(a))),
    [config]
  );
  const playableCount = orderedSites.filter(isPlayable).length;
  const nav = useMemo(() => {
    const seen = new Set<string>();
    const sourceCategories = (sourceHome?.classes ?? [])
      .filter((item) => {
        const id = item.type_id.trim();
        const label = item.type_name.trim();
        const valid = Boolean(id && label) && !seen.has(id);
        if (valid) seen.add(id);
        return valid;
      })
      .map((item) => ({ id: item.type_id.trim(), label: item.type_name.trim() }));
    return [{ id: "", label: "精选" }, ...sourceCategories];
  }, [sourceHome]);
  const selectedId = nav.some((item) => item.id === activeId) ? activeId : "";

  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-cinema-page/94 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1480px] items-center gap-3 px-3 md:h-[72px] md:gap-5 md:px-6 lg:px-8">
        <Link href="/" className="group flex min-h-11 shrink-0 items-center gap-2.5" aria-label="七星视频首页">
          <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-cinema-brand text-base font-black text-cinema-on-brand shadow-brand-glow transition group-hover:scale-105">
            七
            <span className="absolute inset-0 rounded-lg ring-1 ring-inset ring-white/25" />
          </span>
          <span className="hidden flex-col leading-none sm:flex">
            <span className="text-lg font-bold tracking-tight text-cinema-primary">七星视频</span>
            <span className="mt-1 text-[10px] tracking-[0.18em] text-cinema-subtle">QIXING CINEMA</span>
          </span>
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center overflow-x-auto no-scrollbar lg:flex" aria-label="主导航">
          {categoriesLoading && !sourceHome ? (
            <span className="px-3.5 text-xs text-cinema-subtle" aria-live="polite">分类读取中…</span>
          ) : null}
          {nav.map((item) => {
            const active = pathname === "/" && selectedId === item.id;
            return (
              <Link
                key={item.id || "featured"}
                href={item.id ? `/?c=${item.id}` : "/"}
                className={`relative flex h-16 max-w-[128px] shrink-0 items-center px-3.5 text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft xl:px-4 md:h-[72px] ${
                  active ? "font-bold text-cinema-brand-soft" : "text-cinema-primary/78 hover:text-cinema-brand-soft"
                }`}
              >
                <span className="truncate">{item.label}</span>
                <span className={`absolute bottom-0 h-[3px] rounded-t-full bg-cinema-brand transition-all duration-200 ${active ? "w-7 shadow-brand-glow" : "w-0"}`} />
              </Link>
            );
          })}
        </nav>

        <form
          className="ml-auto hidden h-10 w-full max-w-[360px] items-center rounded-full border border-white/8 bg-cinema-elevated px-4 transition focus-within:border-cinema-brand/55 focus-within:bg-black/25 md:flex"
          onSubmit={(event) => {
            event.preventDefault();
            if (keyword.trim()) router.push(`/search?q=${encodeURIComponent(keyword.trim())}`);
          }}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-cinema-subtle" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" strokeLinecap="round" /></svg>
          <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="搜索剧集 / 电影 / 综艺" aria-label="搜索影片" className="w-full bg-transparent px-3 text-sm text-cinema-primary outline-none placeholder:text-cinema-subtle" />
          <button type="submit" className="ml-auto shrink-0 rounded-full px-2 text-xs font-bold text-cinema-brand-soft transition hover:text-cinema-brand">搜索</button>
        </form>

        <div className="ml-auto flex items-center gap-1.5 md:ml-0">
          <Link href="/search" aria-label="搜索" className="grid h-10 w-10 place-items-center rounded-lg text-cinema-muted transition duration-150 active:scale-[0.94] hover:bg-white/8 hover:text-cinema-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft md:hidden">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" strokeLinecap="round" /></svg>
          </Link>

          <div ref={menuRef} className="relative">
            <button
              onClick={() => setSourceOpen((value) => !value)}
              className="flex h-10 max-w-[220px] items-center gap-2 rounded-lg border border-white/8 bg-cinema-elevated px-3 text-xs text-cinema-muted transition duration-150 active:scale-[0.97] hover:border-white/16 hover:text-cinema-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft"
              aria-label="切换站点源"
              aria-expanded={sourceOpen}
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-cinema-success shadow-brand-glow" />
              <span className="hidden max-w-[130px] truncate md:block">{currentSite?.name ?? "加载中…"}</span>
              <span className="md:hidden">片源</span>
              <svg viewBox="0 0 24 24" className={`h-3.5 w-3.5 shrink-0 transition-transform ${sourceOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
            </button>
            {sourceOpen ? (
              <div className="absolute right-0 top-full z-50 mt-2 w-[min(90vw,390px)] overflow-hidden rounded-xl border border-white/10 bg-cinema-panel shadow-cinematic">
                <div className="flex items-center justify-between border-b border-white/8 px-3.5 py-3">
                  <div>
                    <p className="text-xs font-bold text-cinema-primary">选择内容源</p>
                    <p className="mt-1 text-[10px] text-cinema-subtle">可播源置顶 · {playableCount} 个可用</p>
                  </div>
                  <span className="rounded-md border border-white/8 bg-white/6 px-2 py-1 text-[10px] text-cinema-subtle">{config?.sites.length ?? 0}</span>
                </div>
                <div className="max-h-[58vh] space-y-1 overflow-y-auto p-1.5">
                  {orderedSites.map((site) => {
                    const ref = `${site.origin ?? ""}::${site.key}`;
                    const active = ref === `${siteOrigin}::${siteKey}`;
                    const playable = isPlayable(site);
                    return (
                      <button
                        key={ref}
                        onClick={() => {
                          setSiteKey(ref);
                          setSourceOpen(false);
                          router.push("/");
                        }}
                        className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft ${
                          active ? "border border-cinema-brand/40 bg-cinema-brand/12 text-cinema-brand-soft" : playable ? "border border-transparent text-cinema-muted hover:border-white/10 hover:bg-white/6 hover:text-cinema-primary" : "border border-transparent text-cinema-subtle/75 hover:bg-white/5"
                        }`}
                      >
                        <span className={`grid h-8 w-8 place-items-center rounded-md text-[11px] font-bold ${active ? "bg-cinema-brand/20 text-cinema-brand-soft" : "bg-white/8 text-cinema-muted"}`}>{site.name.slice(0, 2)}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-medium">{site.name}</span>
                          <span className="block truncate font-mono text-[9px] text-cinema-subtle">{site.originName ? `${site.originName} · ` : ""}{site.api}</span>
                        </span>
                        <span className={`shrink-0 rounded-md px-1.5 py-1 text-[9px] ${active ? "bg-cinema-brand/20 text-cinema-brand-soft" : playable ? "bg-cinema-success/12 text-cinema-success" : "bg-white/6 text-cinema-subtle"}`}>
                          {active ? "当前" : playable ? "可播" : "受限"}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <Link href="/settings" className="block border-t border-white/8 px-3.5 py-3 text-xs text-cinema-subtle transition hover:bg-white/5 hover:text-cinema-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft">
                  管理接口源与解析规则 ›
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
