# 七星视频项目规则

## UI / UX 设计系统

- IMPORTANT: 新 UI 统一放入 `src/components`，可复用基础组件放入 `src/components/ui`。
- IMPORTANT: 颜色、阴影和文字语义必须使用 `tailwind.config.ts` 映射的 `cinema.*` 令牌，不要新增十六进制色值。
- 面板使用 `Panel`，按钮使用 `Button` / `LinkButton` / `IconButton`，状态标签使用 `Chip`，小节标题使用 `Eyebrow`。
- 组件导出使用 PascalCase 命名函数；业务组件放页面目录，跨页面组件才放入 `src/components`。
- 移动端触控目标不小于 44px；横向滚动容器必须加 `no-scrollbar` 并防止纵向布局被挤压。
- 页面布局必须覆盖 390、768、1024、1440 宽度，且不得出现页面级横向溢出。
- 重要操作必须提供 `focus-visible` 焦点样式；动效遵守系统 reduced-motion。
- 数据加载优先使用骨架屏，空状态使用 `EmptyState`，错误状态保留可恢复动作。

## 工程约定

- 使用 `@/` 路径别名；客户端数据请求组件保持 `"use client"`。
- 修改 UI 后必须运行 `npm run lint`、`npx tsc --noEmit` 和 `npm run build`。
- Cloudflare 发布使用 `npm run build:cf` 与 `npm run deploy:cf`，配置文件是 `wrangler.jsonc`。
