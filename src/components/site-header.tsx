"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useConfig } from "@/lib/store";

const NAV = [
  { id: "", label: "精选", tag: "HOME" },
  { id: "tv", label: "电视剧", tag: "HOT" },
  { id: "movie", label: "电影", tag: "NEW" },
  { id: "show", label: "综艺", tag: "LIVE" },
  { id: "anime", label: "动漫", tag: "RAW" },
  { id: "doc", label: "纪录片", tag: "PURE" },
];

export function SiteHeader() {
  const [q, setQ] = useState("");
  const [activeId, setActiveId] = useState("");
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const { config, siteKey, setSiteKey } = useConfig();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setActiveId(params.get("c") ?? "");
  }, [pathname]);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-[#08080b]/88 backdrop-blur-2xl">
      <div className="mx-auto flex h-[72px] max-w-[1480px] items-center gap-5 px-4 lg:px-8">
        <Link href="/" className="group flex shrink-0 items-center gap-3">
          <span className="relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#ff812b] to-[#d92c00] text-lg font-black text-white shadow-[0_12px_30px_rgba(255,77,0,0.34)]">
            七
            <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/25" />
          </span>
          <span className="hidden leading-none sm:block">
            <span className="block text-xl font-black tracking-tight text-white">七星视频</span>
            <span className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.34em] text-zinc-500">Premium Cinema</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 xl:flex">
          {NAV.map((item) => {
            const active = pathname === "/" && activeId === item.id;
            return (
              <Link
                key={item.label}
                href={item.id ? `/?c=${item.id}` : "/"}
                className={`group relative flex h-10 items-center gap-1.5 rounded-full px-4 text-sm transition ${
                  active ? "bg-white/10 font-bold text-white" : "text-zinc-400 hover:bg-white/6 hover:text-white"
                }`}
              >
                {item.label}
                {item.id === "tv" ? <span className="rounded-sm bg-[#ff4d00] px-1 py-px text-[9px] font-black text-white">HOT</span> : null}
                <span className={`absolute bottom-1 h-[2px] rounded-full bg-[#ff5e00] transition-all ${active ? "w-4" : "w-0 group-hover:w-3"}`} />
              </Link>
            );
          })}
        </nav>

        <form
          className="ml-auto hidden w-full max-w-[420px] items-center rounded-full border border-white/10 bg-white/6 pl-4 transition focus-within:border-orange-500/60 focus-within:bg-white/8 md:flex"
          onSubmit={(event) => {
            event.preventDefault();
            if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
          }}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-zinc-500" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5" strokeLinecap="round"/></svg>
          <input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="搜索剧集 / 电影 / 综艺 / 动漫"
            className="w-full bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-500"
          />
          <button type="submit" className="mr-1 h-8 shrink-0 rounded-full px-4 text-xs font-bold text-white brand-button">搜索</button>
        </form>

        <div ref={menuRef} className="relative ml-auto hidden md:ml-0 md:block">
          <button
            onClick={() => setOpen((value) => !value)}
            className="flex h-10 max-w-[190px] items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 text-xs text-zinc-300 transition hover:border-orange-500/50 hover:text-white"
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
            <span className="truncate">{config?.sites.find((site) => site.key === siteKey)?.name ?? "加载中…"}</span>
            <svg viewBox="0 0 24 24" className={`h-3 w-3 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
          </button>
          {open ? (
            <div className="absolute right-0 top-full z-50 mt-2 w-[300px] overflow-hidden rounded-2xl border border-white/10 bg-[#101015]/98 p-2 shadow-2xl backdrop-blur-xl">
              {config?.sites.map((site) => (
                <button
                  key={site.key}
                  onClick={() => {
                    setSiteKey(site.key);
                    setOpen(false);
                    router.push("/");
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                    site.key === siteKey ? "bg-orange-500/12 text-[#ffb66e]" : "text-zinc-400 hover:bg-white/6 hover:text-white"
                  }`}
                >
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/8 text-xs font-black">{site.name.slice(0, 2)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-semibold">{site.name}</span>
                    <span className="block truncate font-mono text-[9px] text-zinc-600">{site.api}</span>
                  </span>
                  <span className="rounded bg-white/8 px-1.5 py-0.5 text-[9px]">T{site.type}</span>
                </button>
              ))}
              <Link href="/settings" className="mt-1 block rounded-xl border-t border-white/6 px-4 py-3 text-xs text-zinc-500 transition hover:bg-white/5 hover:text-white">
                管理接口源与解析规则
              </Link>
            </div>
          ) : null}
        </div>

        <Link
          href="/settings"
          className="hidden h-10 shrink-0 items-center rounded-full border border-white/12 bg-white/6 px-4 text-xs font-bold text-zinc-200 transition hover:border-orange-500/50 hover:text-white lg:flex"
        >
          接口源
        </Link>
      </div>

      <div className="border-t border-white/5 xl:hidden">
        <div className="no-scrollbar mx-auto flex max-w-[1480px] items-center gap-1 overflow-x-auto px-3 py-2 lg:px-6">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.id ? `/?c=${item.id}` : "/"}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs transition ${
                activeId === item.id ? "bg-orange-500/15 font-bold text-[#ffb66e]" : "text-zinc-400 hover:bg-white/6 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
