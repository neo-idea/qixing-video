import { resolveConfig } from "@/lib/engines/config-store";
import { DemoSpider } from "@/lib/engines/demo-spider";
import { CmsSpider } from "@/lib/engines/cms-spider";
import type { SiteConfig, SourceBean, Spider } from "@/lib/types";

const cache = new Map<string, Spider>();

/**
 * 分派规则与 APK 中 oo0oO0.getCSP() 对齐:
 *   api 以 .js 结尾/含 .js? -> JsSpider
 *   api 以 py_ 开头        -> PythonSpider
 *   其余(csp_*)           -> JarLoader
 * Web 端实际能力:
 *   - 内置演示源          -> DemoSpider(演示数据)
 *   - 外部 type 0/4 采集源 -> CmsSpider(真实 HTTP)
 *   - 外部 Spider/Jar 源   -> UnsupportedSpider(明确报错, 不用假数据冒充)
 */
export async function getCSP(key: string, from?: string | null): Promise<Spider> {
  const raw = (from ?? "").trim();
  const { config } = await resolveConfig(raw);
  const cacheKey = `${raw ? `${raw}#` : ""}${key}`;
  const hit = cache.get(cacheKey);
  if (hit) return hit;

  const bean = findBean(config, key);
  const spider = raw ? spawnRemote(bean) : new DemoSpider(bean.key, bean.name);
  spider.init(bean.ext);
  cache.set(cacheKey, spider);
  return spider;
}

function findBean(config: SiteConfig, key: string): SourceBean {
  return config.sites.find((s) => s.key === key) ?? config.sites[0];
}

function spawnRemote(bean: SourceBean): Spider {
  if (bean.type === 0 || bean.type === 4) return new CmsSpider(bean.key, bean.name, bean.api);
  const kind = bean.api.startsWith("py_")
    ? "Python"
    : bean.api.endsWith(".js") || bean.api.includes(".js?")
      ? "JS"
      : "Spider/Jar";
  return new UnsupportedSpider(bean.key, bean.name, kind);
}

/** 明确告知该源无法在 Web 端运行, 避免演示数据误导 */
export class UnsupportedSpider implements Spider {
  readonly key: string;
  readonly name: string;
  private readonly reason: string;

  constructor(key: string, name: string, kind: string) {
    this.key = key;
    this.name = name;
    this.reason = `「${name}」是 ${kind} 源, 需要 TVBox 客户端的运行时, Web 端暂不支持。请切换 type 0/4 的采集源或使用内置演示源。`;
  }

  init() {}

  private fail(): never {
    throw new Error(this.reason);
  }

  homeContent() {
    return this.fail();
  }
  homeVideoContent() {
    return this.fail();
  }
  categoryContent() {
    return this.fail();
  }
  detailContent() {
    return this.fail();
  }
  searchContent() {
    return this.fail();
  }
  playerContent() {
    return this.fail();
  }
}
