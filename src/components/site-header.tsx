"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useConfig } from "@/lib/store";

const NAV = [
  { id: "", label: "精选" },
  { id: "tv", label: "电视剧" },
  { id: "movie", label: "电影" },
  { id: "show", label: "综艺" },
  { id: "anime", label: "动漫" },
  { id: "doc", label: "纪录片" },
];

/** 腾讯视频式顶栏: 黑底, 文字导航 + 青色激活下划线, 右侧圆角搜索框与源切换 */
export function SiteHeader() {
  const [keyword, setKeyword] = useState("");
  const [activeId, setActiveId] = useState("");
  const [sourceOpen, setSourceOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const { config, siteKey, siteOrigin, setSiteKey } = useConfig();

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

  const currentSite = config?.sites.find((site) => site.key === siteKey && (!siteOrigin || site.origin === siteOrigin));
  /** 下拉仅列出 CMS 采集源(type 0/4): Spider/Jar 源在 Web 端不可用, 列出只是噪音 */
  const cmsSites = config?.remote ? config.sites.filter((site) => site.type === 0 || site.type === 4) : config?.sites ?? [];

  return (
    <header className="sticky top-0 z-50 border-b border-white/6 bg-cinema-page/92 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1480px] items-center gap-4 px-3 md:h-[60px] md:gap-6 md:px-6 lg:px-8">
        <Link href="/" className="flex min-h-11 shrink-0 items-center gap-2" aria-label="七星视频首页">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded bg-cinema-brand text-sm font-black text-[#063434]">七</span>
          <span className="hidden text-lg font-bold tracking-tight text-cinema-primary sm:block">七星视频</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => {
            const active = pathname === "/" && activeId === item.id;
            return (
              <Link
                key={item.label}
                href={item.id ? `/?c=${item.id}` : "/"}
                className={`relative flex h-14 items-center px-3 text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft md:h-[60px] xl:px-4 ${
                  active ? "font-bold text-cinema-brand-soft" : "text-cinema-primary/85 hover:text-cinema-brand-soft"
                }`}
              >
                {item.label}
                <span className={`absolute bottom-0 h-[3px] rounded-t bg-cinema-brand transition-all ${active ? "w-6" : "w-0"}`} />
              </Link>
            );
          })}
        </nav>

        <form
          className="ml-auto hidden h-9 w-full max-w-[320px] items-center rounded bg-[#2a2a2a] px-3 transition focus-within:ring-1 focus-within:ring-cinema-brand/70 md:flex"
          onSubmit={(event) => {
            event.preventDefault();
            if (keyword.trim()) router.push(`/search?q=${encodeURIComponent(keyword.trim())}`);
          }}
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 text-cinema-subtle" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" strokeLinecap="round" /></svg>
          <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="搜索剧集 / 电影 / 综艺" className="w-full bg-transparent px-2.5 text-sm text-cinema-primary outline-none placeholder:text-cinema-subtle" />
          <button type="submit" className="ml-auto shrink-0 text-xs font-medium text-cinema-brand-soft transition hover:text-cinema-brand">搜索</button>
        </form>

        <div className="ml-auto flex items-center gap-1.5 md:ml-0">
          <Link href="/search" aria-label="搜索" className="grid h-9 w-9 place-items-center rounded text-cinema-muted transition duration-150 active:scale-[0.94] hover:bg-[#2a2a2a] hover:text-cinema-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft md:hidden">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" strokeLinecap="round" /></svg>
          </Link>

          <div ref={menuRef} className="relative">
            <button
              onClick={() => setSourceOpen((value) => !value)}
              className="flex h-9 max-w-[180px] items-center gap-2 rounded bg-[#2a2a2a] px-2.5 text-xs text-cinema-muted transition duration-150 active:scale-[0.97] hover:text-cinema-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft"
              aria-label="切换站点源"
              aria-expanded={sourceOpen}
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-cinema-success" />
              <span className="hidden max-w-[110px] truncate md:block">{currentSite?.name ?? "加载中…"}</span>
              <svg viewBox="0 0 24 24" className={`h-3 w-3 shrink-0 transition-transform ${sourceOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
            </button>
            {sourceOpen ? (
              <div className="absolute right-0 top-full z-50 mt-1.5 w-[min(88vw,340px)] overflow-hidden rounded-lg border border-white/8 bg-cinema-panel p-1.5 shadow-cinematic">
                <div className="flex items-center justify-between px-1.5 pb-1.5 pt-0.5">
                  <span className="text-[10px] text-cinema-subtle">CMS 采集源（Web 可用）</span>
                  <span className="text-[10px] text-cinema-subtle">{cmsSites.length} 个</span>
                </div>
                <div className="max-h-[60vh] overflow-y-auto">
                  {cmsSites.length ? cmsSites.map((site) => {
                    const ref = `${site.origin ?? ""}::${site.key}`;
                    const active = ref === `${siteOrigin}::${siteKey}`;
                    return (
                    <button
                      key={ref}
                      onClick={() => {
                        setSiteKey(ref);
                        setSourceOpen(false);
                        router.push("/");
                      }}
                      className={`flex w-full items-center gap-2.5 rounded px-2.5 py-2 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft ${
                        active ? "bg-cinema-brand/15 text-cinema-brand-soft" : "text-cinema-muted hover:bg-white/6 hover:text-cinema-primary"
                      }`}
                    >
                      <span className="grid h-7 w-7 place-items-center rounded-sm bg-[#2f2f2f] text-[11px] font-bold">{site.name.slice(0, 2)}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-medium">{site.name}</span>
                        <span className="block truncate font-mono text-[9px] text-cinema-subtle">{site.originName ? `${site.originName} · ` : ""}{site.api}</span>
                      </span>
                      <span className="rounded-sm bg-[#2f2f2f] px-1 py-0.5 text-[9px]">T{site.type}</span>
                    </button>
                    );
                  }) : (
                    <div className="px-2.5 py-4 text-center text-[11px] leading-relaxed text-cinema-subtle">
                      当前启用的配置里没有 CMS 采集源<br />Spider/Jar 源需 TVBox 客户端，去设置页导入含采集源的配置
                    </div>
                  )}
                </div>
                <Link href="/settings" className="mt-1 block rounded border-t border-white/6 px-3 py-2.5 text-xs text-cinema-subtle transition hover:bg-white/5 hover:text-cinema-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft">
                  管理接口源与解析规则
                </Link>
              </div>
            ) : null}
          </div>

          <Link href="/settings" aria-label="设置" className="grid h-9 w-9 place-items-center rounded text-cinema-muted transition hover:bg-[#2a2a2a] hover:text-cinema-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft lg:hidden">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.07A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.07A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1.03-1.56V3a2 2 0 1 1 4 0v.07A1.7 1.7 0 0 0 15 4.6a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9v.07c.66.27 1.1.92 1.03 1.56V15Z" /></svg>
          </Link>
        </div>
      </div>
      {pathname === "/" ? (
        <nav className="border-t border-white/5 bg-cinema-page lg:hidden">
          <div className="no-scrollbar mx-auto flex max-w-[1480px] items-center gap-1 overflow-x-auto px-3 py-1.5">
            {NAV.map((item) => {
              const active = activeId === item.id;
              return (
                <Link
                  key={item.label}
                  href={item.id ? `/?c=${item.id}` : "/"}
                  className={`h-9 shrink-0 rounded px-3 text-xs transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft ${
                    active ? "bg-cinema-brand/15 font-bold text-cinema-brand-soft" : "text-cinema-muted hover:text-cinema-primary"
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
