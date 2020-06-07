export const SHARE_DATA = {
  title: "",
  desc: "",
  link: "",
  imgUrl: "",
};

export const FORMAT_TIME = 'YYYY.MM.DD HH:mm';

export const UPLOAD_URL = "https://upyun.com";

export const tradeTypeOptions = [
  {
    id: '1',
    name: '立即执行',
    color: '',
  },
  {
    id: '2',
    name: 'Buy Limit',
    color: 'p-up',
  },
  {
    id: '3',
    name: 'Sell Limit',
    color: 'p-down',
  },
  {
    id: '4',
    name: 'Buy Stop',
    color: 'p-up',
  },
  {
    id: '5',
    name: 'Sell Stop',
    color: 'p-down',
  }
];

export const tradeActionMap = {
  0: 'buy',
  1: 'sell',
  2: 'buy limit',
  3: 'sell limit',
  4: 'buy stop',
  5: 'sell stop',
}

export const marketOptions = [
  {
    id: 1,
    name: '上证',
  },
  {
    id: 2,
    name: '日经',
  },
  {
    id: 3,
    name: '纳斯达克',
  }
];

export const WeeklyOrder = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

export const THREE_DAY_OPTIONS = [
  {
    id: 0,
    name: '周日',
  },
  {
    id: 1,
    name: '周一',
  },
  {
    id: 2,
    name: '周二',
  },
  {
    id: 3,
    name: '周三',
  },
  {
    id: 4,
    name: '周四',
  },
  {
    id: 5,
    name: '周五',
  },
  {
    id: 6,
    name: '周六',
  }
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
        title: '出金审核记录',
        path: '/dashboard/capital/audit',
      }
    ],
  },
  {
    title: "佣金管理",
    path: "/dashboard/rebate",
    children: [
      {
        title: '佣金列表',
        path: '/dashboard/rebate/record',
      },
      {
        title: '团队返佣',
        path: '/dashboard/rebate/setting',
      }
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
        title: '客户开户',
        path: '/dashboard/promotion/account',
      },
      {
        title: '代理开户',
        path: '/dashboard/promotion/agent',
      }
    ],
  }
];

export const supportedResolution = ['1', '5', '15', '30', '60', '240', '1D', '7D'];