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
      <body className="min-h-screen text-white antialiased">
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(1000px_600px_at_18%_-10%,rgba(255,77,0,0.18),transparent_70%),radial-gradient(1000px_700px_at_88%_0%,rgba(45,91,255,0.13),transparent_72%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,11,0.42),rgba(8,8,11,0.94))]" />
        </div>
        <SiteHeader />
        <main className="mx-auto max-w-[1480px] px-3 pb-28 pt-4 sm:px-4 sm:pt-6 md:pb-20 lg:px-8">{children}</main>
        <footer className="border-t border-white/6 bg-black/40">
          <div className="mx-auto flex max-w-[1480px] flex-col gap-3 px-4 pb-28 pt-8 text-xs text-zinc-600 md:flex-row md:items-center md:justify-between md:pb-8 lg:px-8">
            <span>© 2026 七星视频 · Next.js 影视聚合演示</span>
            <span>内容为公共测试流，仅用于学习 TVBox 配置驱动与播放解析链路</span>
          </div>
        </footer>
        <MobileTabBar />
      </body>
    </html>
  );
}
