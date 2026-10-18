"use client";

import { useState } from "react";
import { Button, Chip, Eyebrow, Panel } from "@/components/ui";
import { useConfig } from "@/lib/store";
import type { SourceBean } from "@/lib/types";

const PARSE_LABEL: Record<number, string> = { 0: "网页嗅探", 1: "Json 解析", 2: "Json 并发", 3: "扩展解析" };

/** Web 端实际可运行的引擎: 采集源可用, Spider/Jar 源无法在浏览器运行 */
function engineOf(site: SourceBean, remote?: boolean) {
  if (!remote) return { label: "演示链路", ok: true };
  if (site.type === 0 || site.type === 4) return { label: "CMS 采集", ok: true };
  const kind = site.api.startsWith("py_")
    ? "Python"
    : site.api.endsWith(".js") || site.api.includes(".js?")
      ? "JS"
      : "Spider/Jar";
  return { label: `${kind} · Web 暂不支持`, ok: false };
}

export function SettingsClient() {
  const { config, siteKey, setSiteKey, setApiUrl, loading, notice, lines, lineUrl, pickLine } = useConfig();
  const [url, setUrl] = useState("");
  const remote = Boolean(config?.remote);

  return (
    <div className="mx-auto max-w-5xl">
      <Panel className="relative mb-5 overflow-hidden p-4 sm:mb-6 sm:p-6 lg:p-8">
        <div aria-hidden className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-cinema-brand/12 blur-3xl" />
        <div className="relative">
        <Eyebrow wide>Source Center</Eyebrow>
        <h1 className="mt-2 bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-2xl font-black tracking-tight text-transparent sm:mt-3 sm:text-3xl">接口源设置</h1>
        <p className="mt-2 max-w-2xl text-xs leading-relaxed text-cinema-subtle sm:text-sm sm:leading-relaxed">
          对应 APK SettingActivity 的 api_url，支持 `地址;pk;密码`、Base64/AES 加密配置与 `urls` 多线路订阅。选线线路后，站点、解析接口与嗅探规则都会由该线路真实驱动（type 0/4 采集源真实请求，Spider/Jar 源需 TVBox 客户端）。
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/8 bg-black/25 p-3"><p className="text-[10px] text-cinema-subtle">站点源</p><p className="mt-1 text-lg font-black text-white">{config?.sites.length ?? 0}</p></div>
          <div className="rounded-2xl border border-white/8 bg-black/25 p-3"><p className="text-[10px] text-cinema-subtle">解析接口</p><p className="mt-1 text-lg font-black text-white">{config?.parses.length ?? 0}</p></div>
          <div className="rounded-2xl border border-white/8 bg-black/25 p-3"><p className="text-[10px] text-cinema-subtle">嗅探规则</p><p className="mt-1 text-lg font-black text-white">{config?.rules.length ?? 0}</p></div>
        </div>
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
            className="h-12 w-full flex-1 rounded-xl border border-white/10 bg-black/35 px-4 text-sm text-white outline-none transition focus:border-cinema-brand/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft"
          />
          <Button type="submit" size="lg" disabled={loading} className="w-full sm:w-auto">
            {loading ? "加载中…" : "保存并加载"}
          </Button>
        </form>
        {notice ? <p className="mt-3 rounded-xl border border-cinema-warning/20 bg-cinema-warning/10 p-3 text-xs text-cinema-warning">{notice}</p> : null}
        </div>
      </Panel>

      {lines.length ? (
        <Panel className="mb-5 p-4 sm:mb-6 sm:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Eyebrow>Subscription Lines</Eyebrow>
              <h2 className="mt-1.5 text-lg font-black text-white">多线路订阅</h2>
              <p className="mt-1 text-xs text-cinema-subtle">检测到 {lines.length} 条线路，选择后立即加载该线路配置</p>
            </div>
            <Chip>{lines.length} 条线路</Chip>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {lines.map((line) => (
              <button
                key={line.url}
                onClick={() => pickLine(line.url)}
                disabled={loading || lineUrl === line.url}
                className={`flex min-h-[64px] flex-col justify-center gap-1 rounded-2xl p-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft sm:p-4 ${
                  lineUrl === line.url
                    ? "border border-cinema-brand/40 bg-cinema-brand/12"
                    : "border border-white/7 bg-white/4 hover:bg-white/8"
                }`}
              >
                <span className="text-sm font-bold text-white">{line.name}</span>
                <span className="truncate font-mono text-[10px] text-cinema-subtle">{line.url}</span>
              </button>
            ))}
          </div>
        </Panel>
      ) : null}

      <Panel className="mb-5 p-4 sm:mb-6 sm:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-black text-white">站点源</h2>
            <p className="mt-1 text-xs text-cinema-subtle">点击切换当前首页、搜索与详情使用的 Spider；仅 CMS 采集源可在 Web 端真实请求</p>
          </div>
          <div className="flex items-center gap-2">
            {remote ? <Chip tone="success" size="sm">外部配置已生效</Chip> : <Chip size="sm">内置演示</Chip>}
            <Chip>{config?.sites.length ?? 0} 个源</Chip>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {config?.sites.map((site) => (
            <button
              key={site.key}
              onClick={() => setSiteKey(site.key)}
              className={`relative flex min-h-[84px] w-full items-center gap-3 overflow-hidden rounded-2xl p-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft sm:gap-4 sm:p-4 ${
                site.key === siteKey ? "border border-cinema-brand/40 bg-cinema-brand/12" : "border border-white/7 bg-white/4 hover:bg-white/8"
              }`}
            >
              {site.key === siteKey ? <span aria-hidden className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-cinema-brand/18 to-transparent" /> : null}
              <span className={`relative grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-black sm:h-11 sm:w-11 ${site.key === siteKey ? "bg-cinema-brand/20 text-cinema-brand-soft" : "bg-white/8 text-white"}`}>{site.name.slice(0, 2)}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-white">{site.name}</span>
                <span className="mt-1 block truncate font-mono text-[10px] text-cinema-subtle">{site.api}</span>
              </span>
              <span className={`relative shrink-0 rounded-full px-2.5 py-1 text-[10px] ${
                site.key === siteKey
                  ? "bg-cinema-brand/20 text-cinema-brand-soft"
                  : engineOf(site, remote).ok
                    ? "bg-white/8 text-cinema-muted"
                    : "bg-cinema-warning/15 text-cinema-warning"
              }`}>
                {site.key === siteKey ? "当前源" : engineOf(site, remote).label}
              </span>
            </button>
          ))}
        </div>
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel className="p-4 sm:p-6">
          <h2 className="mb-4 text-lg font-black text-white">解析接口</h2>
          <div className="space-y-2">
            {config?.parses.map((parse) => (
              <div key={parse.name} className="flex items-center justify-between rounded-xl border border-white/7 bg-white/4 px-4 py-3 text-xs">
                <span className="font-semibold text-cinema-primary">{parse.name}</span>
                <Chip size="sm">{PARSE_LABEL[parse.type] ?? `type ${parse.type}`}</Chip>
              </div>
            ))}
          </div>
        </Panel>
        <Panel className="p-4 sm:p-6">
          <h2 className="mb-4 text-lg font-black text-white">嗅探规则</h2>
          <div className="space-y-2 text-xs text-cinema-muted">
            {config?.rules.map((rule, index) => (
              <div key={index} className="rounded-xl border border-white/7 bg-black/25 p-3 font-mono text-[10px] leading-relaxed">
                <span className="text-cinema-brand-soft">{rule.host}</span> → {(rule.regex ?? []).join(", ")}
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
