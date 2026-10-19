import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { MobileTabBar } from "@/components/mobile-tab-bar";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "七星视频 · 沉浸式影视聚合中心",
    template: "%s · 七星视频",
  },
  description: "配置驱动的影视聚合站，支持多源搜索、智能换源、HLS 播放与继续观看。",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen text-cinema-primary antialiased">
        <Suspense>
          <SiteHeader />
        </Suspense>
        <main className="mx-auto max-w-[1480px] px-3 pb-28 pt-4 sm:px-4 sm:pt-5 md:pb-14 lg:px-8">{children}</main>
        <footer className="relative overflow-hidden border-t border-white/8 bg-cinema-panel">
          <div className="mx-auto grid max-w-[1480px] gap-8 px-4 pb-28 pt-10 text-xs text-cinema-subtle md:grid-cols-4 md:items-start md:pb-10 lg:px-8">
            <div>
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-md bg-cinema-brand text-xs font-black text-cinema-on-brand">七</span>
                <span className="text-sm font-bold text-cinema-primary">七星视频</span>
              </div>
              <p className="mt-3 leading-relaxed">配置驱动的影视聚合播放体验，支持多源搜索、并发解析与移动端沉浸浏览。</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-[0.18em] text-cinema-muted">BROWSE</p>
              <nav className="mt-3 grid gap-2">
                <Link href="/" className="w-fit transition hover:text-cinema-primary">精选首页</Link>
                <Link href="/?c=tv" className="w-fit transition hover:text-cinema-primary">电视剧</Link>
                <Link href="/?c=movie" className="w-fit transition hover:text-cinema-primary">电影</Link>
                <Link href="/search" className="w-fit transition hover:text-cinema-primary">全源搜索</Link>
              </nav>
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-[0.18em] text-cinema-muted">CORE FEATURES</p>
              <ul className="mt-3 space-y-2">
                <li>多配置源合并</li>
                <li>全源并发搜索 · 智能换源</li>
                <li>HLS 播放 · 继续观看</li>
              </ul>
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-[0.18em] text-cinema-muted">NOTICE</p>
              <p className="mt-3 leading-relaxed">© 2026 七星视频 · 内容为公共测试流，仅用于学习 TVBox 配置驱动与播放解析链路。</p>
            </div>
          </div>
        </footer>
        <Suspense>
          <MobileTabBar />
        </Suspense>
      </body>
    </html>
  );
}
