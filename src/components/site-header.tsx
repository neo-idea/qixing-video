"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui";
import { useConfig } from "@/lib/store";

const NAV = [
  { id: "", label: "精选" },
  { id: "tv", label: "电视剧" },
  { id: "movie", label: "电影" },
  { id: "show", label: "综艺" },
  { id: "anime", label: "动漫" },
  { id: "doc", label: "纪录片" },
];

export function SiteHeader() {
  const [keyword, setKeyword] = useState("");
  const [activeId, setActiveId] = useState("");
  const [sourceOpen, setSourceOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const { config, siteKey, setSiteKey } = useConfig();

  useEffect(() => {
    setActiveId(new URLSearchParams(window.location.search).get("c") ?? "");
  }, [pathname]);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setSourceOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const currentSite = config?.sites.find((site) => site.key === siteKey);

  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-cinema-page/94 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-[1480px] items-center gap-3 px-3 md:h-[72px] md:gap-5 md:px-6 lg:px-8">
        <Link href="/" className="flex min-h-11 min-w-0 shrink-0 items-center gap-2.5 py-1" aria-label="七星视频首页">
          <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-cinema-brand to-cinema-brand-strong text-base font-black text-white shadow-brand-glow">
            七
            <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/25" />
          </span>
          <span className="hidden leading-none sm:block">
            <span className="block text-lg font-black tracking-tight text-white">七星视频</span>
            <span className="mt-1 block text-[8px] font-semibold uppercase tracking-[0.28em] text-cinema-subtle">Premium Cinema</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-white/8 bg-black/25 p-1 lg:flex">
          {NAV.map((item) => {
            const active = pathname === "/" && activeId === item.id;
            return (
              <Link
                key={item.label}
                href={item.id ? `/?c=${item.id}` : "/"}
                className={`group relative flex h-11 items-center rounded-full px-3.5 text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft xl:px-4 ${
                  active ? "bg-white/12 font-bold text-white shadow-panel" : "text-cinema-muted hover:bg-white/6 hover:text-white"
                }`}
              >
                {item.label}
                <span className={`absolute bottom-1 h-[2px] rounded-full bg-cinema-brand transition-all ${active ? "w-4" : "w-0 group-hover:w-3"}`} />
              </Link>
            );
          })}
        </nav>

        <form
          className="ml-auto hidden w-full max-w-[380px] items-center rounded-full border border-white/10 bg-white/6 pl-4 transition focus-within:border-cinema-brand/60 focus-within:bg-white/8 md:flex"
          onSubmit={(event) => {
            event.preventDefault();
            if (keyword.trim()) router.push(`/search?q=${encodeURIComponent(keyword.trim())}`);
          }}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-cinema-subtle" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" strokeLinecap="round" /></svg>
          <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="搜索剧集 / 电影 / 综艺" className="w-full bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-cinema-subtle" />
          <Button type="submit" size="sm" className="mr-1 shrink-0">搜索</Button>
        </form>

        <div className="ml-auto flex items-center gap-1.5 md:ml-0 md:gap-2">
          <Link href="/search" aria-label="搜索" className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/6 text-cinema-muted transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft md:hidden">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" strokeLinecap="round" /></svg>
          </Link>

          <div ref={menuRef} className="relative">
            <button
              onClick={() => setSourceOpen((value) => !value)}
              className="flex h-11 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 text-xs text-cinema-muted transition hover:border-cinema-brand/50 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft md:max-w-[190px] md:px-3"
              aria-label="切换站点源"
              aria-expanded={sourceOpen}
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-cinema-success shadow-[0_0_10px_var(--success)]" />
              <span className="hidden max-w-[104px] truncate md:block">{currentSite?.name ?? "加载中…"}</span>
              <svg viewBox="0 0 24 24" className={`h-3 w-3 shrink-0 transition-transform ${sourceOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
            </button>
            {sourceOpen ? (
              <div className="absolute right-0 top-full z-50 mt-2 w-[min(88vw,340px)] overflow-hidden rounded-2xl border border-white/10 bg-cinema-panel/98 p-2 shadow-2xl backdrop-blur-xl">
                {config?.sites.map((site) => (
                  <button
                    key={site.key}
                    onClick={() => {
                      setSiteKey(site.key);
                      setSourceOpen(false);
                      router.push("/");
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft ${
                      site.key === siteKey ? "bg-cinema-brand/12 text-cinema-brand-soft" : "text-cinema-muted hover:bg-white/6 hover:text-white"
                    }`}
                  >
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/8 text-xs font-black">{site.name.slice(0, 2)}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-semibold">{site.name}</span>
                      <span className="block truncate font-mono text-[9px] text-cinema-subtle">{site.api}</span>
                    </span>
                    <span className="rounded bg-white/8 px-1.5 py-0.5 text-[9px]">T{site.type}</span>
                  </button>
                ))}
                <Link href="/settings" className="mt-1 block rounded-xl border-t border-white/6 px-4 py-3 text-xs text-cinema-subtle transition hover:bg-white/5 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft">
                  管理接口源与解析规则
                </Link>
              </div>
            ) : null}
          </div>

          <Link href="/settings" aria-label="设置" className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/6 text-cinema-muted transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft lg:hidden">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.07A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.07A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1.03-1.56V3a2 2 0 1 1 4 0v.07A1.7 1.7 0 0 0 15 4.6a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9v.07c.66.27 1.1.92 1.03 1.56V15Z" /></svg>
          </Link>
        </div>
      </div>
      {pathname === "/" ? (
        <nav className="border-t border-white/6 bg-black/20 lg:hidden">
          <div className="no-scrollbar mx-auto flex max-w-[1480px] items-center gap-2 overflow-x-auto px-3 py-2">
            {NAV.map((item) => {
              const active = activeId === item.id;
              return (
                <Link
                  key={item.label}
                  href={item.id ? `/?c=${item.id}` : "/"}
                  className={`h-11 shrink-0 rounded-full px-3.5 text-xs transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft ${
                    active ? "bg-cinema-brand/16 font-bold text-cinema-brand-soft" : "text-cinema-muted hover:bg-white/6 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
