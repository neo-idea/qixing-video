"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { useConfig } from "@/lib/store";
import { useSourceHome } from "@/lib/use-source-home";

const HOME_ICON = "M4 5.5C4 4.67 4.67 4 5.5 4h13c.83 0 1.5.67 1.5 1.5v9c0 .83-.67 1.5-1.5 1.5H13l-4 3.5V16H5.5A1.5 1.5 0 0 1 4 14.5v-9Z";
const SEARCH_ICON = "M10.5 3a7.5 7.5 0 1 1-4.7 13.35L3 19.5 4.5 21l2.7-2.7A7.5 7.5 0 0 0 10.5 3Zm0 2a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11Z";
const SETTINGS_ICON = "M12 3a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Zm0 11c4.2 0 7.5 2.35 7.5 5.25V21H4.5v-1.75C4.5 16.35 7.8 14 12 14Z";

function categoryIcon(name: string) {
  if (/电影|片/.test(name)) return "M4 5h16v10H4V5Zm5 12h6v2H9v-2Z";
  if (/剧|电视|连续/.test(name)) return "M5 4h14v12H5V4Zm2 14h10v2H7v-2Z";
  if (/动漫|动画|番/.test(name)) return "M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z";
  if (/纪|记录|纪录/.test(name)) return "M4 5h16v14H4V5Zm2 2v10h12V7H6Zm2 2h8v2H8V9Z";
  return "M8 5h8v14H8V5Zm-4 2h3v10H4V7Zm13 0h3v10h-3V7Z";
}

export function MobileTabBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const category = searchParams.get("c") ?? "";
  const { siteKey, siteOrigin } = useConfig();
  const { data: sourceHome } = useSourceHome(siteKey, siteOrigin);
  const tabs = useMemo(() => {
    const categories = sourceHome?.classes ?? [];
    const quick = categories.slice(0, 3);
    const activeCategory = categories.find((item) => item.type_id === category);
    if (category && activeCategory && !quick.some((item) => item.type_id === category)) {
      quick.splice(quick.length - 1, 1, activeCategory);
    }

    return [
      { href: "/", label: "精选", icon: HOME_ICON, category: "" },
      ...quick.map((item) => ({
        href: `/?c=${encodeURIComponent(item.type_id)}`,
        label: item.type_name,
        icon: categoryIcon(item.type_name),
        category: item.type_id,
      })),
      { href: "/search", label: "搜索", icon: SEARCH_ICON, category: "" },
      { href: "/settings", label: "我的", icon: SETTINGS_ICON, category: "" },
    ];
  }, [category, sourceHome]);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-cinema-page/94 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
      <div className="mx-auto grid h-[60px] max-w-lg" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
        {tabs.map((tab) => {
          const active = tab.category ? category === tab.category : tab.href === "/" ? pathname === "/" && !category : pathname === tab.href;
          return (
            <Link
              key={tab.label}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={`relative flex min-h-[52px] flex-1 flex-col items-center justify-center gap-1 px-1 text-[10px] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft ${
                active ? "font-bold text-cinema-brand-soft" : "text-cinema-subtle active:text-cinema-primary"
              }`}
            >
              {active ? <span className="absolute top-0 h-[2px] w-8 rounded-full bg-cinema-brand shadow-brand-glow" /> : null}
              <svg viewBox="0 0 24 24" className={`h-5 w-5 transition-transform ${active ? "scale-110 fill-cinema-brand-soft" : "fill-cinema-subtle"}`}><path d={tab.icon} /></svg>
              <span className="max-w-full truncate">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
