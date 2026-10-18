"use client";

import { useState } from "react";
import { Button, Chip, Panel } from "@/components/ui";
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
      <Panel className="mb-4 p-4 sm:p-6">
        <div className="relative">
        <h1 className="text-xl font-bold text-cinema-primary sm:text-2xl">接口源设置</h1>
        <p className="mt-2 max-w-2xl text-xs leading-relaxed text-cinema-subtle sm:text-sm">
          对应 APK SettingActivity 的 api_url，支持 `地址;pk;密码`、Base64/AES 加密配置与 `urls` 多线路订阅。选择线路后，站点、解析接口与嗅探规则都会由该线路真实驱动（type 0/4 采集源真实请求，Spider/Jar 源需 TVBox 客户端）。
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <div className="rounded bg-[#2a2a2a] p-3"><p className="text-[11px] text-cinema-subtle">站点源</p><p className="mt-0.5 text-lg font-bold text-cinema-primary">{config?.sites.length ?? 0}</p></div>
          <div className="rounded bg-[#2a2a2a] p-3"><p className="text-[11px] text-cinema-subtle">解析接口</p><p className="mt-0.5 text-lg font-bold text-cinema-primary">{config?.parses.length ?? 0}</p></div>
          <div className="rounded bg-[#2a2a2a] p-3"><p className="text-[11px] text-cinema-subtle">嗅探规则</p><p className="mt-0.5 text-lg font-bold text-cinema-primary">{config?.rules.length ?? 0}</p></div>
        </div>
        <form
          className="mt-5 flex flex-col gap-3 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            setApiUrl(url.trim());
          }}
        >
          <input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://example.com/config.json 留空使用内置演示源"
            className="h-11 w-full flex-1 rounded bg-[#2a2a2a] px-4 text-sm text-cinema-primary outline-none transition focus-visible:ring-1 focus-visible:ring-cinema-brand/70"
          />
          <Button type="submit" size="lg" disabled={loading} className="w-full rounded sm:w-auto">
            {loading ? "加载中…" : "保存并加载"}
          </Button>
        </form>
        {notice ? <p className="mt-3 rounded border border-cinema-warning/25 bg-cinema-warning/10 p-2.5 text-xs text-cinema-warning">{notice}</p> : null}
        </div>
      </Panel>

      {lines.length ? (
        <Panel className="mb-4 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-cinema-primary">多线路订阅</h2>
              <p className="mt-0.5 text-xs text-cinema-subtle">检测到 {lines.length} 条线路，选择后立即加载该线路配置</p>
            </div>
            <Chip size="sm">{lines.length} 条</Chip>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {lines.map((line) => (
              <button
                key={line.url}
                onClick={() => pickLine(line.url)}
                disabled={loading || lineUrl === line.url}
                className={`flex min-h-[56px] flex-col justify-center gap-1 rounded p-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft ${
                  lineUrl === line.url
                    ? "border border-cinema-brand/50 bg-cinema-brand/12"
                    : "border border-white/8 bg-[#2a2a2a] hover:bg-[#333]"
                }`}
              >
                <span className="text-sm font-medium text-cinema-primary">{line.name}</span>
                <span className="truncate font-mono text-[10px] text-cinema-subtle">{line.url}</span>
              </button>
            ))}
          </div>
        </Panel>
      ) : null}

      <Panel className="mb-4 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-cinema-primary">站点源</h2>
            <p className="mt-0.5 text-xs text-cinema-subtle">点击切换当前首页、搜索与详情使用的源；仅 CMS 采集源可在 Web 端真实请求</p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {remote ? <Chip tone="success" size="sm">外部配置已生效</Chip> : <Chip size="sm">内置演示</Chip>}
            <Chip size="sm">{config?.sites.length ?? 0} 个</Chip>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {config?.sites.map((site) => (
            <button
              key={site.key}
              onClick={() => setSiteKey(site.key)}
              className={`flex min-h-[64px] w-full items-center gap-3 rounded p-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft ${
                site.key === siteKey ? "border border-cinema-brand/50 bg-cinema-brand/12" : "border border-white/8 bg-[#2a2a2a] hover:bg-[#333]"
              }`}
            >
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-sm text-xs font-bold ${site.key === siteKey ? "bg-cinema-brand/20 text-cinema-brand-soft" : "bg-[#333] text-cinema-primary"}`}>{site.name.slice(0, 2)}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-cinema-primary">{site.name}</span>
                <span className="mt-0.5 block truncate font-mono text-[10px] text-cinema-subtle">{site.api}</span>
              </span>
              <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] ${
                site.key === siteKey
                  ? "bg-cinema-brand/20 text-cinema-brand-soft"
                  : engineOf(site, remote).ok
                    ? "bg-[#333] text-cinema-muted"
                    : "bg-cinema-warning/15 text-cinema-warning"
              }`}>
                {site.key === siteKey ? "当前源" : engineOf(site, remote).label}
              </span>
            </button>
          ))}
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel className="p-4">
          <h2 className="mb-3 border-b border-white/6 pb-2.5 text-base font-bold text-cinema-primary">解析接口</h2>
          <div className="space-y-1.5">
            {config?.parses.map((parse) => (
              <div key={parse.name} className="flex items-center justify-between rounded bg-[#2a2a2a] px-3 py-2.5 text-xs">
                <span className="font-medium text-cinema-primary">{parse.name}</span>
                <Chip size="sm">{PARSE_LABEL[parse.type] ?? `type ${parse.type}`}</Chip>
              </div>
            ))}
          </div>
        </Panel>
        <Panel className="p-4">
          <h2 className="mb-3 border-b border-white/6 pb-2.5 text-base font-bold text-cinema-primary">嗅探规则</h2>
          <div className="space-y-1.5 text-xs text-cinema-muted">
            {config?.rules.map((rule, index) => (
              <div key={index} className="rounded bg-[#2a2a2a] p-2.5 font-mono text-[10px] leading-relaxed">
                <span className="text-cinema-brand-soft">{rule.host}</span> → {(rule.regex ?? []).join(", ")}
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
