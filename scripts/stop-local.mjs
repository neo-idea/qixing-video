/**
 * 部署前置: 停掉本地 dev/preview server。
 * 生产构建会重写 .next, 与运行中的 dev server 冲突
 * (表现为 dev 页面报 Cannot find module './xxx.js')。
 */
import { execSync } from "node:child_process";

const PORTS = [3000, 3998, 3999];

for (const port of PORTS) {
  try {
    const pids = execSync(`lsof -ti:${port}`).toString().trim();
    if (pids) {
      execSync(`kill -9 ${pids.split("\n").join(" ")}`);
      console.log(`stopped local server on :${port}`);
    }
  } catch {
    /* 端口无进程 */
  }
}
