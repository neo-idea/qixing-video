import { siteConfig } from "@/lib/config";
import type { Spider } from "@/lib/types";
import { DemoSpider } from "./demo-spider";

const cache = new Map<string, Spider>();

/**
 * 分派规则与 APK 中 oo0oO0.getCSP() 一致:
 *   api 以 .js 结尾/含 .js? -> JsSpider
 *   api 以 py_ 开头        -> PythonSpider
 *   其余(csp_*)           -> JarLoader
 * Web 演示中三者都由 DemoSpider 承载。
 */
export function getCSP(key: string): Spider {
  const hit = cache.get(key);
  if (hit) return hit;
  const bean = siteConfig.sites.find((s) => s.key === key) ?? siteConfig.sites[0];
  const engine = bean.api.endsWith(".js") || bean.api.includes(".js?")
    ? "QuickJS"
    : bean.api.startsWith("py_")
      ? "Chaquopy"
      : "DexClassLoader";
  console.info(`[getCSP] ${bean.key} -> ${engine} (${bean.api})`);
  const spider = new DemoSpider(bean.key, bean.name);
  spider.init(bean.ext);
  cache.set(key, spider);
  return spider;
}
