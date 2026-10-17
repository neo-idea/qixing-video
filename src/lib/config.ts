import type { SiteConfig } from "./types";

export const siteConfig: SiteConfig = {
  spider: "https://demo.example/csp.jar;md5;00000000000000000000000000000000",
  wallpaper: "linear-gradient(135deg, #101828 0%, #2b1a4d 100%)",
  warningText: "本站为开源演示项目，内容仅供学习解析链路使用。",
  sites: [
    {
      key: "demo",
      name: "七星演示源",
      type: 3,
      api: "csp_Demo",
      searchable: 1,
      quickSearch: 1,
      filterable: 1,
      playerType: 1,
      ext: { proxy: true },
    },
    {
      key: "demojs",
      name: "七星 JS 源(演示)",
      type: 3,
      api: "https://demo.example/spider.js",
      searchable: 1,
      quickSearch: 0,
      filterable: 0,
    },
    {
      key: "demopy",
      name: "七星 Python 源(演示)",
      type: 3,
      api: "py_demo",
      searchable: 1,
      quickSearch: 1,
      filterable: 0,
    },
  ],
  parses: [
    { name: "Json并发", url: "json:http://127.0.0.1:3000/api/parse?type=2", type: 2 },
    { name: "Json解析", url: "http://127.0.0.1:3000/api/parse?type=1", type: 1 },
    { name: "Web嗅探", url: "http://127.0.0.1:3000/api/parse?type=0", type: 0 },
  ],
  flags: ["youku", "qq", "iqiyi", "mgtv", "bilibili"],
  rules: [
    {
      host: "demo.example",
      hosts: ["*.demo.example"],
      regex: ["\\.(m3u8|mp4|flv|ts)"],
      rule: ["http"],
      filter: ["ad\\.example\\.com"],
    },
  ],
};
