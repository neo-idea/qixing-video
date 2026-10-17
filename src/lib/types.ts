export interface SourceBean {
  key: string;
  name: string;
  type: 0 | 3 | 4;
  api: string;
  searchable?: number;
  quickSearch?: number;
  filterable?: number;
  playerUrl?: string;
  ext?: Record<string, unknown> | string;
  jar?: string;
  playerType?: number;
  categories?: string[];
}

export interface ParseBean {
  name: string;
  url: string;
  ext?: Record<string, unknown>;
  type: 0 | 1 | 2 | 3;
}

export interface SniffRule {
  host: string;
  hosts?: string[];
  regex?: string[];
  rule?: string[];
  filter?: string[];
}

export interface SiteConfig {
  spider: string;
  wallpaper: string;
  warningText: string;
  sites: SourceBean[];
  parses: ParseBean[];
  flags: string[];
  rules: SniffRule[];
}

export interface VodItem {
  vod_id: string;
  vod_name: string;
  vod_pic: string;
  vod_remarks: string;
  vod_score?: string;
  category: string;
  year?: string;
  area?: string;
  actors?: string;
  director?: string;
  content?: string;
  gradient: [string, string];
}

export interface Episode {
  name: string;
  url: string;
  parse?: number;
}

export interface VodDetail extends VodItem {
  vod_play_from: string[];
  vod_play_url: Episode[][];
}

export interface CategoryFilter {
  key: string;
  name: string;
  value: string[];
}

export interface Spider {
  key: string;
  name: string;
  init(ext: SourceBean["ext"]): void;
  homeContent(filter: boolean): Promise<{
    class: { type_id: string; type_name: string }[];
    list: VodItem[];
    filters?: Record<string, CategoryFilter[]>;
  }>;
  homeVideoContent(): Promise<{ list: VodItem[] }>;
  categoryContent(
    tid: string,
    pg: number,
    filter: boolean,
    extend: Record<string, string>
  ): Promise<{ list: VodItem[] }>;
  detailContent(ids: string[]): Promise<VodDetail>;
  searchContent(key: string, quick: boolean): Promise<{ list: VodItem[] }>;
  playerContent(
    flag: string,
    id: string,
    vipFlags: string[]
  ): Promise<{
    parse: number;
    url: string;
    header?: Record<string, string>;
    playUrl?: string;
  }>;
}
