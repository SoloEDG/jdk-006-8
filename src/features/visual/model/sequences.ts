import type { VisualSequence } from "../../../shared/types";

export const VISUAL_SEQUENCES: VisualSequence[] = [
  {
    episodeId: "arrival-normal",
    clueId: "bell",
    title: "来电里的钟声",
    intro:
      "把线路上的震动转成可视脉冲，跟随播放逐一记录。每个光点只说明它自己的方向与持续时间，结论需要你自己比较。",
    events: [
      {
        id: "bell-1",
        offset: 15.19,
        label: "金属敲击 · 脉冲 1",
        detail: "短促的共振，由窗外同一个方向传来。",
        direction: "north",
        cadence: "brief",
      },
      {
        id: "bell-2",
        offset: 15.86,
        label: "金属敲击 · 脉冲 2",
        detail: "短促的共振，方位与上一次完全重合。",
        direction: "north",
        cadence: "brief",
      },
      {
        id: "bell-3",
        offset: 16.53,
        label: "金属敲击 · 脉冲 3",
        detail: "短促的共振，仍来自那个固定的方向。",
        direction: "north",
        cadence: "brief",
      },
    ],
    question: {
      prompt: "比较已经呈现的脉冲：这串钟声一共敲了几下？",
      options: [
        { id: "two", label: "两下" },
        { id: "three", label: "三下" },
        { id: "four", label: "四下" },
      ],
      answer: "three",
    },
  },
  {
    episodeId: "harbor-normal",
    clueId: "horn",
    title: "雾中的雾笛",
    intro:
      "雨声之外的鸣放会在雾幕上亮起一段段光带。先让每条光带随时间展开，再比较它们的长短与间隔。",
    events: [
      {
        id: "horn-1",
        offset: 5.18,
        label: "雾笛鸣放 · 光带 1",
        detail: "光带停留较久，从海面方向缓缓漫开。",
        direction: "east",
        cadence: "long",
      },
      {
        id: "horn-2",
        offset: 5.7,
        label: "雾笛鸣放 · 光带 2",
        detail: "又是一段停留较久的光带，方位没有移动。",
        direction: "east",
        cadence: "long",
      },
      {
        id: "horn-3",
        offset: 6.22,
        label: "雾笛鸣放 · 光带 3",
        detail: "第三条光带同样拖得很长。",
        direction: "east",
        cadence: "long",
      },
      {
        id: "horn-4",
        offset: 6.86,
        label: "雾笛鸣放 · 光带 4",
        detail: "这一条只闪了一下便收住，明显更短。",
        direction: "east",
        cadence: "brief",
      },
    ],
    question: {
      prompt: "按顺序比较四条光带的持续时间，雾笛的鸣放节奏是哪一种？",
      options: [
        { id: "short-long", label: "一短三长" },
        { id: "all-long", label: "四条都长" },
        { id: "long-short", label: "三长一短" },
      ],
      answer: "long-short",
    },
  },
  {
    episodeId: "interview-normal",
    clueId: "static",
    title: "收音机里的电流",
    intro:
      "把异常底噪画成跳动的电火花，留意每次迸裂偏向哪个方位。画面只记录单次现象，信号来源要由你比对判断。",
    events: [
      {
        id: "static-1",
        offset: 11.51,
        label: "电流迸裂 · 火花 1",
        detail: "指针向北一侧跳了一格，随后回落。",
        direction: "north",
        cadence: "brief",
      },
      {
        id: "static-2",
        offset: 12.18,
        label: "电流迸裂 · 火花 2",
        detail: "火花再次偏向同一侧，节奏凌乱。",
        direction: "north",
        cadence: "brief",
      },
      {
        id: "static-3",
        offset: 12.85,
        label: "电流迸裂 · 火花 3",
        detail: "第三次迸裂，指针仍指向那一侧。",
        direction: "north",
        cadence: "brief",
      },
    ],
    question: {
      prompt: "比较三次电火花偏向的方位，这股干扰信号指向哪里？",
      options: [
        { id: "north", label: "北侧灯塔" },
        { id: "south", label: "南侧码头" },
        { id: "east", label: "东侧海面" },
      ],
      answer: "north",
    },
  },
  {
    episodeId: "interview-aware",
    clueId: "static",
    title: "坦白时的电流",
    intro:
      "周姨开口后，底噪再次出现。继续把电火花按时间记录下来，比对它们偏向的方位。",
    events: [
      {
        id: "static-aware-1",
        offset: 14.557,
        label: "电流迸裂 · 火花 1",
        detail: "指针向北一侧跳格，底噪里夹着低声念白。",
        direction: "north",
        cadence: "brief",
      },
      {
        id: "static-aware-2",
        offset: 15.227,
        label: "电流迸裂 · 火花 2",
        detail: "火花仍偏向北侧，节奏比刚才更密。",
        direction: "north",
        cadence: "brief",
      },
      {
        id: "static-aware-3",
        offset: 15.897,
        label: "电流迸裂 · 火花 3",
        detail: "第三次迸裂，指针没有离开过那一侧。",
        direction: "north",
        cadence: "brief",
      },
    ],
    question: {
      prompt: "比较三次电火花偏向的方位，这股干扰信号指向哪里？",
      options: [
        { id: "north", label: "北侧灯塔" },
        { id: "south", label: "南侧码头" },
        { id: "east", label: "东侧海面" },
      ],
      answer: "north",
    },
  },
];
