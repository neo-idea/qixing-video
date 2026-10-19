"use client";

import { useState } from "react";
import { Button, Chip, Panel } from "@/components/ui";
import { useConfig, siteRef } from "@/lib/store";
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
  const {
    sources,
    config,
    siteRef: currentRef,
    setSiteKey,
    addSource,
    toggleSource,
    removeSource,
    clearAll,
    loading,
    notice,
  } = useConfig();
  const [url, setUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState("");
  const remote = Boolean(config?.remote);
  const enabledCount = sources.filter((s) => s.enabled).length;

  const onImport = async (event: React.FormEvent) => {
    event.preventDefault();
    const target = url.trim();
    if (!target || importing) return;
    setImporting(true);
    setImportMsg("");
    try {
      const msg = await addSource(target);
      setImportMsg(msg);
      setUrl("");
    } catch (e) {
      setImportMsg(`导入失败: ${(e as Error).message}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <Panel className="mb-4 rounded-xl p-4 sm:p-6">
        <p className="text-[11px] font-semibold tracking-[0.22em] text-cinema-subtle">SOURCE CONTROL</p>
        <h1 className="mt-2 text-xl font-bold text-cinema-primary sm:text-3xl">接口源设置</h1>
        <p className="mt-3 max-w-3xl text-xs leading-relaxed text-cinema-subtle sm:text-sm">
          对应 APK SettingActivity 的 api_url，支持 `地址;pk;密码`、Base64/AES 加密配置、JSONC 注释配置与 `urls` 多线路订阅。可导入多份配置并行使用，按开关自由启停；启用配置的站点、解析接口与嗅探规则将合并生效（type 0/4 采集源真实请求，Spider/Jar 源需 TVBox 客户端）。
        </p>
        <div className="mt-5 grid gap-2.5 sm:grid-cols-4">
          <div className="rounded-xl border border-white/8 bg-cinema-elevated p-3.5"><p className="text-[11px] text-cinema-subtle">已导入配置</p><p className="mt-1 text-2xl font-bold text-cinema-primary">{sources.length}</p></div>
          <div className="rounded-xl border border-white/8 bg-cinema-elevated p-3.5"><p className="text-[11px] text-cinema-subtle">启用中</p><p className="mt-1 text-2xl font-bold text-cinema-success">{enabledCount}</p></div>
          <div className="rounded-xl border border-white/8 bg-cinema-elevated p-3.5"><p className="text-[11px] text-cinema-subtle">站点源</p><p className="mt-1 text-2xl font-bold text-cinema-primary">{config?.sites.length ?? 0}</p></div>
          <div className="rounded-xl border border-white/8 bg-cinema-elevated p-3.5"><p className="text-[11px] text-cinema-subtle">解析接口</p><p className="mt-1 text-2xl font-bold text-cinema-primary">{config?.parses.length ?? 0}</p></div>
        </div>
        <form className="mt-6 flex flex-col gap-3 sm:flex-row" onSubmit={onImport}>
          <input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="粘贴配置或订阅地址，可连续导入多份"
            className="h-12 w-full flex-1 rounded-full border border-white/10 bg-cinema-elevated px-5 py-4 text-sm text-cinema-primary outline-none transition focus-visible:border focus-visible:border-cinema-brand/60"
          />
          <Button type="submit" size="lg" disabled={importing || !url.trim()} className="w-full rounded sm:w-auto">
            {importing ? "导入中…" : "导入"}
          </Button>
        </form>
        {importMsg ? (
          <p className="mt-3 rounded-xl border border-cinema-brand/25 bg-cinema-brand/10 p-3 text-xs text-cinema-brand-soft">{importMsg}</p>
        ) : null}
        {notice ? <p className="mt-3 rounded border border-cinema-warning/25 bg-cinema-warning/10 p-2.5 text-xs text-cinema-warning">{notice}</p> : null}
      </Panel>

      {/* 配置列表: 开关 + 删除 */}
      {sources.length ? (
        <Panel className="mb-4 rounded-xl p-4">
          <div className="mb-3.5 flex items-center justify-between gap-3 border-b border-white/8 pb-3.5">
            <div>
              <h2 className="text-base font-bold text-cinema-primary">配置管理</h2>
              <p className="mt-0.5 text-xs text-cinema-subtle">开关决定该配置的站点是否参与合并；多份配置可同时启用</p>
            </div>
            <Button variant="ghost" size="sm" className="rounded active:scale-[0.97]" onClick={clearAll} disabled={loading}>
              全部清空
            </Button>
          </div>
          <div className="space-y-2">
            {sources.map((entry) => (
              <div
                key={entry.id}
                className={`flex min-h-[60px] items-center gap-3 rounded p-3 transition ${
                  entry.enabled ? "rounded-xl border border-cinema-brand/30 bg-cinema-brand/8" : "rounded-xl border border-white/8 bg-cinema-elevated"
                }`}
              >
                <Switch checked={entry.enabled} onChange={() => toggleSource(entry.id)} label={`启用 ${entry.name}`} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-cinema-primary">
                    {entry.name}
                    {entry.enabled ? <span className="ml-2 text-[10px] text-cinema-success">生效中</span> : null}
                  </p>
                  <p className="mt-0.5 truncate font-mono text-[10px] text-cinema-subtle">{entry.url}</p>
                </div>
                <button
                  onClick={() => removeSource(entry.id)}
                  disabled={loading}
                  aria-label={`删除 ${entry.name}`}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-cinema-subtle transition duration-150 active:scale-[0.94] hover:bg-cinema-danger/15 hover:text-cinema-danger focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                    <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </Panel>
      ) : null}

      <Panel className="mb-4 rounded-xl p-4">
        <div className="mb-3.5 flex items-center justify-between gap-3 border-b border-white/8 pb-3.5">
          <div>
            <h2 className="text-base font-bold text-cinema-primary">站点源</h2>
            <p className="mt-0.5 text-xs text-cinema-subtle">
              {remote ? "多配置合并后的全部站点；仅 CMS 采集源可在 Web 端真实请求" : "当前为内置演示源，导入外部配置后可查看真实站点"}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {remote ? <Chip tone="success" size="sm">外部配置已生效</Chip> : <Chip size="sm">内置演示</Chip>}
            <Chip size="sm">{config?.sites.length ?? 0} 个</Chip>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {config?.sites.map((site) => {
            const ref = siteRef(site.origin ?? "", site.key);
            const active = ref === currentRef;
            return (
              <button
                key={ref}
                onClick={() => setSiteKey(ref)}
                className={`flex min-h-[68px] w-full items-center gap-3 rounded-xl p-3 text-left transition duration-150 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft ${
                  active ? "border border-cinema-brand/50 bg-cinema-brand/12" : "border border-white/8 bg-cinema-elevated hover:border-white/16"
                }`}
              >
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg text-xs font-bold ${active ? "bg-cinema-brand/20 text-cinema-brand-soft" : "bg-white/8 text-cinema-primary"}`}>{site.name.slice(0, 2)}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-cinema-primary">{site.name}</span>
                  <span className="mt-0.5 block truncate font-mono text-[10px] text-cinema-subtle">
                    {site.originName ? `${site.originName} · ` : ""}{site.api}
                  </span>
                </span>
                <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] ${
                  active
                    ? "bg-cinema-brand/20 text-cinema-brand-soft"
                    : engineOf(site, remote).ok
                    ? "bg-[#333] text-cinema-muted"
                    : "bg-cinema-warning/15 text-cinema-warning"
                }`}>
                  {active ? "当前源" : engineOf(site, remote).label}
                </span>
              </button>
            );
          })}
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel className="rounded-xl p-4">
          <h2 className="mb-3 border-b border-white/8 pb-3 text-base font-bold text-cinema-primary">解析接口</h2>
          <div className="space-y-1.5">
            {config?.parses.map((parse, index) => (
              <div key={`${parse.name}-${index}`} className="flex min-h-11 items-center justify-between rounded-lg border border-white/8 bg-cinema-elevated px-3 py-2.5 text-xs">
                <span className="font-medium text-cinema-primary">{parse.name}</span>
                <Chip size="sm">{PARSE_LABEL[parse.type] ?? `type ${parse.type}`}</Chip>
              </div>
            ))}
          </div>
        </Panel>
        <Panel className="rounded-xl p-4">
          <h2 className="mb-3 border-b border-white/8 pb-3 text-base font-bold text-cinema-primary">嗅探规则</h2>
          <div className="space-y-1.5 text-xs text-cinema-muted">
            {config?.rules.map((rule, index) => (
              <div key={index} className="rounded-lg border border-white/8 bg-cinema-elevated p-3 font-mono text-[10px] leading-relaxed">
                <span className="text-cinema-brand-soft">{rule.host}</span> → {(rule.regex ?? []).join(", ")}
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

/** 开关控件 */
function Switch({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft ${
        checked ? "bg-cinema-brand" : "bg-white/18"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
