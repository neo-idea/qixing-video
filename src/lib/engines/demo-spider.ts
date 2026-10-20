import { categories, videoDetails, videos } from "@/data/videos";
import { relevanceScore } from "@/lib/search-text";
import type { Spider, VodItem } from "@/lib/types";

/* eslint-disable @typescript-eslint/no-unused-vars */

const catMap: Record<string, string> = {
  tv: "电视剧",
  movie: "电影",
  show: "综艺",
  anime: "动漫",
  doc: "纪录片",
};

function paged(list: VodItem[], pg: number) {
  return list.slice((pg - 1) * 30, pg * 30);
}

export class DemoSpider implements Spider {
  readonly key: string;
  readonly name: string;

  constructor(key: string, name: string) {
    this.key = key;
    this.name = name;
  }

  init(_ext: Record<string, unknown> | string | undefined) {}

  async homeContent() {
    return {
      class: categories,
      list: videos.slice(0, 6),
      filters: Object.fromEntries(
        categories.map((c) => [
          c.type_id,
          [
            { key: "year", name: "年份", value: ["全部", "2026", "2025"] },
            { key: "area", name: "地区", value: ["全部", "中国大陆", "日本", "英国"] },
          ],
        ])
      ),
    };
  }

  async homeVideoContent() {
    return { list: videos.slice(6, 12) };
  }

  async categoryContent(tid: string, pg: number, _filter: boolean, extend: Record<string, string>) {
    const name = catMap[tid] ?? "";
    let list = videos.filter((v) => !name || v.category === name);
    if (extend.year && extend.year !== "全部") list = list.filter((v) => v.year === extend.year);
    if (extend.area && extend.area !== "全部") list = list.filter((v) => v.area === extend.area);
    return { list: paged(list, pg) };
  }

  async detailContent(ids: string[]) {
    const detail = videoDetails[ids[0]];
    if (!detail) throw new Error(`未找到影片: ${ids[0]}`);
    return detail;
  }

  async searchContent(key: string) {
    return {
      list: videos
        .filter((v) => relevanceScore(`${v.vod_name}${v.category}${v.actors ?? ""}`, key) <= 4)
        .sort((left, right) => relevanceScore(left.vod_name, key) - relevanceScore(right.vod_name, key)),
    };
  }

  async playerContent(flag: string, id: string, _vipFlags: string[]) {
    const [vid, src, ep] = id.split("|");
    const detail = videoDetails[vid];
    if (!detail) throw new Error(`未找到影片: ${vid}`);
    const source = detail.vod_play_url[Number(src)] ?? detail.vod_play_url[0];
    const episode = source[Number(ep)] ?? source[0];
    return {
      parse: episode.parse ?? 0,
      url: episode.url,
      header: {
        "User-Agent": "Mozilla/5.0 (Linux; Android 14)七星Video/5.0.23",
        Referer: "https://demo.example/",
      },
      playUrl: "",
      flag,
    } as Awaited<ReturnType<Spider["playerContent"]>> & { flag: string };
  }
}
