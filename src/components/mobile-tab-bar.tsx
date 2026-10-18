"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const TABS = [
  { href: "/", label: "精选", icon: "M4 5.5C4 4.67 4.67 4 5.5 4h13c.83 0 1.5.67 1.5 1.5v9c0 .83-.67 1.5-1.5 1.5H13l-4 3.5V16H5.5A1.5 1.5 0 0 1 4 14.5v-9Z" },
  { href: "/?c=tv", label: "剧集", icon: "M5 4h14v12H5V4Zm2 14h10v2H7v-2Z" },
  { href: "/?c=movie", label: "电影", icon: "M4 5h16v10H4V5Zm5 12h6v2H9v-2Z" },
  { href: "/search", label: "搜索", icon: "M10.5 3a7.5 7.5 0 1 1-4.7 13.35L3 19.5 4.5 21l2.7-2.7A7.5 7.5 0 0 0 10.5 3Zm0 2a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11Z" },
  { href: "/settings", label: "我的", icon: "M12 3a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Zm0 11c4.2 0 7.5 2.35 7.5 5.25V21H4.5v-1.75C4.5 16.35 7.8 14 12 14Z" },
];

export function MobileTabBar() {
  const pathname = usePathname();
  const [category, setCategory] = useState("");

  useEffect(() => {
    const sync = () => setCategory(new URLSearchParams(window.location.search).get("c") ?? "");
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, [pathname]);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/8 bg-cinema-page pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-5">
        {TABS.map((tab) => {
          const active = tab.href.startsWith("/?")
            ? category === (new URLSearchParams(tab.href.split("?")[1]).get("c") ?? "")
            : pathname === tab.href;
          return (
            <Link
              key={tab.label}
              href={tab.href}
              className={`flex min-h-[52px] flex-1 flex-col items-center justify-center gap-1 px-1 py-1.5 text-[10px] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft ${
                active ? "font-bold text-cinema-brand-soft" : "text-cinema-subtle"
              }`}
            >
              <svg viewBox="0 0 24 24" className={`h-5 w-5 ${active ? "fill-cinema-brand-soft" : "fill-cinema-subtle"}`}><path d={tab.icon} /></svg>
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
