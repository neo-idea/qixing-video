import type { VodDetail, VodItem } from "@/lib/types";

const HLS = [
  "/v1.mp4",
  "/v2.mp4",
  "/v3.mp4",
  "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
  "https://test-streams.mux.dev/tos_ismc/main.m3u8",
];

const pick = (n: number) => HLS[n % HLS.length];

type Seed = {
  id: string;
  name: string;
  category: string;
  remarks: string;
  score: string;
  year: string;
  area: string;
  actors: string;
  director: string;
  content: string;
  emoji: string;
  gradient: [string, string];
  eps: number;
};

const seeds: Seed[] = [
  {
    id: "poax",
    name: "破晓行动",
    category: "电视剧",
    remarks: "更新至 24 集",
    score: "9.2",
    year: "2026",
    area: "中国大陆",
    actors: "林一 / 苏青 / 陈默 / 周雨",
    director: "张黎",
    content:
      "滨海市刑警队长黎明临危受命，率专案组深入虎穴，与跨境犯罪集团展开一场跨越三年的生死博弈。每一次破晓之前，都是最深的黑夜。",
    emoji: "🌆",
    gradient: ["#1f3b8c", "#7a1f5c"],
    eps: 24,
  },
  {
    id: "changanshi",
    name: "长安十二夜",
    category: "电视剧",
    remarks: "全 36 集",
    score: "8.8",
    year: "2025",
    area: "中国大陆",
    actors: "雷佳音 / 岳云鹏 / 郭京飞",
    director: "路阳",
    content:
      "上元夜灯会前夕，长安城十二时辰内暗流涌动。一桩离奇命案牵出朝堂与市井之间的惊天棋局，繁华之下，人人皆是棋子。",
    emoji: "🏮",
    gradient: ["#7a2d18", "#c9972f"],
    eps: 36,
  },
  {
    id: "fanhua",
    name: "繁花似锦",
    category: "电视剧",
    remarks: "更新至 18 集",
    score: "8.5",
    year: "2026",
    area: "中国大陆",
    actors: "胡歌 / 马伊琍 / 唐嫣",
    director: "王家卫",
    content: "九十年代的黄河路，霓虹养眼，万商云集。青年阿宝在时代浪潮中沉浮起落，写下一部上海的市井传奇。",
    emoji: "🌃",
    gradient: ["#5b1f7a", "#d4552f"],
    eps: 18,
  },
  {
    id: "dushigang",
    name: "独行月球日记",
    category: "电影",
    remarks: "HD 高清",
    score: "9.0",
    year: "2026",
    area: "中国大陆",
    actors: "沈腾 / 马丽 / 常远",
    director: "张吃鱼",
    content:
      "为阻挡小行星撞击地球，人类在月球部署月盾计划。撤离前夕，维修工独孤月被意外落下，成为月球上最后的人类，开始了一场笑泪交织的生存直播。",
    emoji: "🌕",
    gradient: ["#0f2a5e", "#3b6fd4"],
    eps: 1,
  },
  {
    id: "liulangq",
    name: "流浪行星前夜",
    category: "电影",
    remarks: "TC 抢版",
    score: "8.9",
    year: "2026",
    area: "中国大陆",
    actors: "吴京 / 刘德华 / 李雪健",
    director: "郭帆",
    content: "太阳危机初现端倪，行星发动机尚未点火。在末日倒计时的前夜，一群普通人做出了改变人类命运的选择。",
    emoji: "🚀",
    gradient: ["#101b3a", "#5d7bd5"],
    eps: 1,
  },
  {
    id: "wushan",
    name: "雾山五行志",
    category: "动漫",
    remarks: "更新至 10 话",
    score: "9.5",
    year: "2026",
    area: "中国大陆",
    actors: "动画配音",
    director: "林魂",
    content: "妖兽横行之地，五行传人闻人翊悬为救母闯入雾山，与哑巴小麒麟结下不解之缘，一场人妖大战就此拉开帷幕。",
    emoji: "🔥",
    gradient: ["#5c1616", "#e0762a"],
    eps: 10,
  },
  {
    id: "shanhai",
    name: "山海旅人",
    category: "动漫",
    remarks: "全 12 话",
    score: "9.1",
    year: "2025",
    area: "中国大陆",
    actors: "动画配音",
    director: "不思凡",
    content: "一名游走于山海经世界的旅人，以一杯茶换一段故事，收拢散落人间的执念与温柔。",
    emoji: "🌿",
    gradient: ["#123a2e", "#3f9d6c"],
    eps: 12,
  },
  {
    id: "jixian",
    name: "极限挑战者联盟",
    category: "综艺",
    remarks: "第 8 季更新中",
    score: "8.3",
    year: "2026",
    area: "中国大陆",
    actors: "黄渤 / 孙红雷 / 黄磊",
    director: "严敏",
    content: "六位常驻嘉宾走进全国十二座城市，在极限任务中碰撞笑料，也在烟火人间里读懂彼此。",
    emoji: "🏁",
    gradient: ["#7a3d0f", "#f0a12c"],
    eps: 12,
  },
  {
    id: "shiguang",
    name: "时光音乐会·老友记",
    category: "综艺",
    remarks: "每周五更新",
    score: "8.7",
    year: "2026",
    area: "中国大陆",
    actors: "谭咏麟 / 林子祥 / 叶蒨文",
    director: "洪涛",
    content: "一众华语乐坛老友围炉而坐，把岁月唱成歌。没有竞技，只有音乐与故事。",
    emoji: "🎤",
    gradient: ["#3a1d5e", "#b56ac4"],
    eps: 10,
  },
  {
    id: "lanxing",
    name: "蓝色星球之上",
    category: "纪录片",
    remarks: "全 8 集",
    score: "9.7",
    year: "2025",
    area: "英国",
    actors: "解说：大卫·爱登堡",
    director: "BBC",
    content: "从深海热泉到极地冰盖，摄制组历时五年，用镜头记录这颗蓝色星球上最不可思议的生命奇迹。",
    emoji: "🐋",
    gradient: ["#062b4d", "#1e88c9"],
    eps: 8,
  },
  {
    id: "shejian",
    name: "舌尖上的四季",
    category: "纪录片",
    remarks: "全 12 集",
    score: "9.4",
    year: "2026",
    area: "中国大陆",
    actors: "解说：李立宏",
    director: "陈晓卿",
    content: "跟随节气的脚步，走遍中国二十四个省份，寻找藏在山野与市井里的时令至味。",
    emoji: "🍜",
    gradient: ["#5e2a10", "#c98a3a"],
    eps: 12,
  },
  {
    id: "shenye",
    name: "深夜食堂·新章",
    category: "电视剧",
    remarks: "更新至 8 集",
    score: "8.6",
    year: "2026",
    area: "日本",
    actors: "小林薰 / 松重丰",
    director: "松冈锭司",
    content: "午夜十二点，营业开始的食堂。一碟茶泡饭、一份黄油拌饭，装得下都市人所有的委屈与温柔。",
    emoji: "🏮",
    gradient: ["#2b1a3d", "#8a5f9e"],
    eps: 8,
  },
];

export const videos: VodItem[] = seeds.map((s) => ({
  vod_id: s.id,
  vod_name: s.name,
  vod_pic: s.emoji,
  vod_remarks: s.remarks,
  vod_score: s.score,
  category: s.category,
  year: s.year,
  area: s.area,
  actors: s.actors,
  director: s.director,
  content: s.content,
  gradient: s.gradient,
}));

export const videoDetails: Record<string, VodDetail> = Object.fromEntries(
  seeds.map((s, idx) => {
    const base = videos[idx];
    const epCount = s.eps;
    return [
      s.id,
      {
        ...base,
        vod_play_from: ["七星蓝光", "备用线路"],
        vod_play_url: [
          Array.from({ length: epCount }, (_, e) => ({
            name: epCount === 1 ? "正片" : `第 ${e + 1} 集`,
            url: pick(idx + e),
            parse: e % 3 === 1 ? 1 : 0,
          })),
          Array.from({ length: epCount }, (_, e) => ({
            name: epCount === 1 ? "正片" : `第 ${e + 1} 集`,
            url: pick(idx + e + 4),
            parse: 0,
          })),
        ],
      },
    ];
  })
);

export const categories = [
  { type_id: "tv", type_name: "电视剧" },
  { type_id: "movie", type_name: "电影" },
  { type_id: "show", type_name: "综艺" },
  { type_id: "anime", type_name: "动漫" },
  { type_id: "doc", type_name: "纪录片" },
];
