import type { VodDetail, VodItem } from "@/lib/types";

/**
 * API 路由层装饰: 给每条返回的 vod 注入所属站点与配置地址,
 * 前端据此生成 detail/play 链接(?site=&from=), 多配置模式下
 * 页面跳转不会丢失源上下文。
 */
export function withSource<T extends VodItem | VodDetail>(data: T, key: string, from: string): T {
  if (Array.isArray((data as VodDetail).vod_play_url)) {
    (data as VodDetail).sourceKey = key;
    (data as VodDetail).sourceOrigin = from;
    return data;
  }
  data.sourceKey = key;
  data.sourceOrigin = from;
  return data;
}

export function withSourceList<T extends VodItem>(list: T[], key: string, from: string): T[] {
  return list.map((item) => withSource(item, key, from));
}
