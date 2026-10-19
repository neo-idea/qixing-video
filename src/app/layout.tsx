import type { Metadata } from "next";
import { MobileTabBar } from "@/components/mobile-tab-bar";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: "七星视频 · 沉浸式影视聚合中心",
  description: "配置驱动的影视聚合站，复刻 TVBox 解析链路，并提供腾讯视频式沉浸浏览体验。",
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
        <SiteHeader />
        <main className="mx-auto max-w-[1480px] px-3 pb-28 pt-4 sm:px-4 sm:pt-5 md:pb-14 lg:px-8">{children}</main>
        <footer className="relative overflow-hidden border-t border-white/8 bg-cinema-panel">
          <div className="mx-auto grid max-w-[1480px] gap-6 px-4 pb-28 pt-8 text-xs text-cinema-subtle md:grid-cols-3 md:items-start md:pb-8 lg:px-8">
            <div>
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-md bg-cinema-brand text-xs font-black text-cinema-on-brand">七</span>
                <span className="text-sm font-bold text-cinema-primary">七星视频</span>
              </div>
              <p className="mt-3 leading-relaxed">配置驱动的影视聚合播放体验，支持多源搜索、并发解析与移动端沉浸浏览。</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-[0.18em] text-cinema-muted">CORE FEATURES</p>
              <ul className="mt-3 space-y-2">
                <li>多配置源合并 · CMS 采集请求</li>
                <li>全源并发搜索 · 同名智能换源</li>
                <li>HLS 播放 · 解析链路可视化</li>
              </ul>
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-[0.18em] text-cinema-muted">NOTICE</p>
              <p className="mt-3 leading-relaxed">© 2026 七星视频 · 内容为公共测试流，仅用于学习 TVBox 配置驱动与播放解析链路。</p>
            </div>
          </div>
        </footer>
        <MobileTabBar />
      </body>
    </html>
  );
}
