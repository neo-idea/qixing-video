"use client";

import { useState } from "react";
import { useConfig } from "@/lib/store";

const PARSE_LABEL: Record<number, string> = { 0: "网页嗅探", 1: "Json 解析", 2: "Json 并发", 3: "扩展解析" };

export function SettingsClient() {
  const { config, siteKey, setSiteKey, setApiUrl, loading, notice } = useConfig();
  const [url, setUrl] = useState("");

  return (
    <div className="mx-auto max-w-5xl">
      <section className="panel mb-5 rounded-2xl p-4 sm:mb-6 sm:p-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.36em] text-[#ff812b]">Source Center</p>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-white sm:mt-3 sm:text-3xl">接口源设置</h1>
        <p className="mt-2 max-w-2xl text-xs leading-relaxed text-zinc-500 sm:text-sm sm:leading-relaxed">
          对应 APK SettingActivity 的 api_url，支持 `地址;pk;密码` 与 Base64/AES 加密配置。当前站点、解析接口与嗅探规则都会由同一份配置驱动。
        </p>
        <form
          className="mt-5 flex flex-col gap-3 sm:mt-6 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            setApiUrl(url.trim());
          }}
        >
          <input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://example.com/config.json 留空使用内置演示源"
            className="h-12 w-full flex-1 rounded-xl border border-white/10 bg-black/35 px-4 text-sm text-white outline-none transition focus:border-orange-500/60"
          />
          <button type="submit" disabled={loading} className="h-12 w-full rounded-full px-8 text-sm font-bold text-white transition-transform hover:scale-[1.02] brand-button disabled:opacity-50 sm:w-auto">
            {loading ? "加载中…" : "保存并加载"}
          </button>
        </form>
        {notice ? <p className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-300">{notice}</p> : null}
      </section>

      <section className="panel mb-5 rounded-2xl p-4 sm:mb-6 sm:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-black text-white">站点源</h2>
            <p className="mt-1 text-xs text-zinc-500">点击切换当前首页、搜索与详情使用的 Spider</p>
          </div>
          <span className="rounded-full border border-white/8 bg-white/5 px-3 py-2 text-xs text-zinc-400">{config?.sites.length ?? 0} 个源</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {config?.sites.map((site) => (
            <button
              key={site.key}
              onClick={() => setSiteKey(site.key)}
              className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition sm:gap-4 sm:p-4 ${
                site.key === siteKey ? "border border-orange-500/40 bg-orange-500/12" : "border border-white/7 bg-white/4 hover:bg-white/8"
              }`}
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/8 text-sm font-black text-white sm:h-11 sm:w-11">{site.name.slice(0, 2)}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-white">{site.name}</span>
                <span className="mt-1 block truncate font-mono text-[10px] text-zinc-500">{site.api}</span>
              </span>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] ${site.key === siteKey ? "bg-orange-500/20 text-[#ffb66e]" : "bg-white/8 text-zinc-500"}`}>
                type {site.type}
              </span>
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="panel rounded-2xl p-4 sm:p-6">
          <h2 className="mb-4 text-lg font-black text-white">解析接口</h2>
          <div className="space-y-2">
            {config?.parses.map((parse) => (
              <div key={parse.name} className="flex items-center justify-between rounded-xl border border-white/7 bg-white/4 px-4 py-3 text-xs">
                <span className="font-semibold text-zinc-100">{parse.name}</span>
                <span className="rounded-full bg-white/8 px-2.5 py-1 text-[10px] text-zinc-500">{PARSE_LABEL[parse.type] ?? `type ${parse.type}`}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="panel rounded-2xl p-4 sm:p-6">
          <h2 className="mb-4 text-lg font-black text-white">嗅探规则</h2>
          <div className="space-y-2 text-xs text-zinc-400">
            {config?.rules.map((rule, index) => (
              <div key={index} className="rounded-xl border border-white/7 bg-black/25 p-3 font-mono text-[10px] leading-relaxed">
                <span className="text-[#ffb66e]">{rule.host}</span> → {(rule.regex ?? []).join(", ")}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
