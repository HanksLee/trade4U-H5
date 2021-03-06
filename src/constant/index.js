export const SHARE_DATA = {
  title: "",
  desc: "",
  link: "",
  imgUrl: "",
};

export const FORMAT_TIME = "YYYY.MM.DD HH:mm";

export const UPLOAD_URL = "https://upyun.com";

export const tradeTypeOptions = [
  {
    id: "instance",
    name: "立即执行",
  },
  {
    id: "future",
    name: "挂单",
  },
];

export const stockTypeOptions = [
  {
    id: 0,
    name: "做多",
  },
  {
    id: 1,
    name: "做空",
  },
];

export const executeOptions = [
  {
    id: 0,
    name: "买入",
  },
  {
    id: 1,
    name: "卖出",
  },
];

export const pendingOrderOptions = [
  {
    id: 2,
    name: "Buy Limit",
  },
  {
    id: 3,
    name: "Sell Limit",
  },
  {
    id: 4,
    name: "Buy Stop",
  },
  {
    id: 5,
    name: "Sell Stop",
  },
];

export const tradeTabOptions = [
  {
    name: "持仓",
  },
  // {
  //   name: "挂单",
  // },
  {
    name: "历史",
  },
];

export const executeMotionMap = [
  {
    id: "delete",
    name: "平倉",
  },
  {
    id: "update",
    name: "修改",
  },
];

export const tradeActionMap = {
  0: "buy",
  1: "sell",
  2: "buy limit",
  3: "sell limit",
  4: "buy stop",
  5: "sell stop",
};

export const THREE_DAY_OPTIONS = [
  {
    id: 0,
    name: "周日",
  },
  {
    id: 1,
    name: "周一",
  },
  {
    id: 2,
    name: "周二",
  },
  {
    id: 3,
    name: "周三",
  },
  {
    id: 4,
    name: "周四",
  },
  {
    id: 5,
    name: "周五",
  },
  {
    id: 6,
    name: "周六",
  },
];

export const PAGE_ROUTES = [
  {
    title: "资金管理",
    path: "/dashboard/capital",
    children: [
      {
        title: "钱包明细",
        path: "/dashboard/capital/wallet",
      },
      {
        title: "出金审核记录",
        path: "/dashboard/capital/audit",
      },
    ],
  },
  {
    title: "佣金管理",
    path: "/dashboard/rebate",
    children: [
      {
        title: "佣金列表",
        path: "/dashboard/rebate/record",
      },
      {
        title: "团队返佣",
        path: "/dashboard/rebate/setting",
      },
    ],
  },
  {
    title: "团队管理",
    path: "/dashboard/team",
  },
  {
    title: "推广管理",
    path: "/dashboard/promotion",
    children: [
      {
        title: "客户开户",
        path: "/dashboard/promotion/account",
      },
      {
        title: "代理开户",
        path: "/dashboard/promotion/agent",
      },
    ],
  },
];

export const supportedResolution = [
  "1",
  "5",
  "15",
  "30",
  "60",
  "240",
  "1D",
  "7D",
];
export const SYMBOL_TYPE = {
  HK: "港股",
  ASHARES: "A股",
  MT: "外汇",
  hk: "港股",
  a_shares: "A股",
};
export const MARKET_TYPE = {
  HK: { name: "港股" },
  SZ: { name: "深圳" },
  SH: { name: "上证" },
};
export const TIME_ZONE = "Asia/Shanghai";

export const CURRENCY_TYPE = {
  HKD: { "zh-cn": "港元" },
  CNY: { "zh-cn": "人民币" },
  USD: { "zh-cn": "美金" },
};
