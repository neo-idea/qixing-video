# 七星视频 · Next.js

参考腾讯视频的信息架构与暗黑影院视觉风格，实现完整的影视门户界面；功能逻辑复刻 TVBox APK（七星影仓）的配置驱动解析链路。

## 运行

```bash
npm install
npm run dev
# http://localhost:3000
```

```bash
npm run build
npm run start
```

## Cloudflare 部署

项目使用 Cloudflare OpenNext 适配器部署到 Workers，保留 Next.js 动态路由与接口代理能力：

```bash
npm run build:cf    # 构建 .open-next 产物
npm run preview:cf  # 本地 Workers 预览
npm run deploy:cf   # 登录 Wrangler 后部署
```

首次部署前先执行 `npx wrangler login`。Worker 名称与兼容性配置在 `wrangler.jsonc` 中维护。

## 产品界面

- **首页**：沉浸式主推轮播、七星空降榜、频道入口、横向内容专区、分类筛选与分页。
- **详情**：电影级竖版海报、演职信息、双播放线路、全量选集、跨源同名换源。
- **播放**：影院级播放器、解析链路追踪、选集面板、线路切换。
- **搜索**：全源并发搜索、实时进度、按站点分组展示。
- **设置**：接口地址、站点源、解析接口、嗅探规则统一管理。
- **响应式**：桌面门户、平板与手机窄屏均可使用，无横向溢出；手机端提供底部导航、压缩顶栏、单手可触搜索与源切换入口。

## 与 APK 的对应关系

| APK | Web | 说明 |
| --- | --- | --- |
| `SettingActivity` api_url | `/settings` | 后台/用户配置接口地址，支持 `地址;pk;密码` |
| `oo0oO0.loadConfig` + `FindResult` | `/api/config/load` | 下载配置 → Base64/AES/2423 解密 → 校验 sites |
| `sites[]` + `getCSP()` 引擎分派 | `src/lib/engines/registry.ts` | `.js`→QuickJS / `py_`→Chaquopy / `csp_`→Jar |
| 首页分类 + 筛选 | `/` | homeContent(class/filters) + categoryContent(tid/pg/extend) 分页 |
| `FastSearchActivity` | `/search` | 全部 searchable 源并发 searchContent，先到先展示 |
| `DetailActivity` 换源 | `/detail/[id]?site=` | 跨源同名搜索，一键换源 |
| `PlayActivity.OooOO0O` | `/play/[id]/[src]-[ep]` | 四种 parse 类型 0 嗅探 / 1 Json / 2 并发 / 3 扩展 |
| 本地 9978 `/proxy` | `/api/site/[key]/*` + `/api/parse` | home/category/detail/search/play 五个 Spider 方法 |

## 站点接入

在 `/settings` 填入 TVBox 格式的接口地址即可；也可扩展 `src/lib/engines/`
实现真实 JS/Python/Jar 站点引擎。内置三个演示源展示引擎分派逻辑。
