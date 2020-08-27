import { computed, action, observable, toJS } from "mobx";
import BaseStore from "store/base";
import {
  META_FUND,
  ORDER_OPEN,
  ORDER_CLOSE,
  ORDER_PROFIT,
  PENDING_ORDER_CLOSE
} from "pages/Trade/config/wsType";
import utils from 'utils';


class TradeStore extends BaseStore {
  @observable
  tradeInfo = {};
  @observable
  tradeList = []; // 持仓订单
  @observable
  futureTradeList = []; // 挂单订单
  @observable
  finishTradeList = []; // 歷史订单
  @observable
  finishTradeInfo = []; // 歷史订单
  @computed
  get computedTradeList() {
    let list = [];

    list = this.tradeList;

    return list;
  }

  @action
  getTradeInfo = async config => {
    const res = await this.$api.trade.getTradeInfo(config);

    this.setTradeInfo(res.data);
  }

  @action
  setTradeInfo = (info, overwrite = true) => {
    if (overwrite) {
      this.tradeInfo = info;
    } else {
      this.tradeInfo = {
        ...this.tradeInfo,
        ...info,
      }
    }
  }

  @action
  setFinishTradeInfo = (info, overwrite = true) => {
    if (overwrite) {
      this.finishTradeInfo = info;
    } else {
      this.finishTradeInfo = {
        ...this.finishTradeInfo,
        ...info,
      }
    }
  }

  @action
  getTradeList = (config) => {
    const res = this.$api.trade.getTradeList(config);

    this.setTradeList(res.data);
  }

  @action
  setTradeList = (list, type = 'order') => {
    if (type == 'order') {
      this.tradeList = list;
    } else if (type == "future") {
      this.futureTradeList = list;
    } else if (type == "finish") {
      this.finishTradeList = list
    }
  }

  @observable
  currentTrade = {};

  @action
  getCurrentTrade = async (id) => {
    const res = await this.$api.trade.getCurrentTrade(id);
    this.setCurrentTrade(res.data);
  }
  @action
  setCurrentTrade = (trade) => {
    this.currentTrade = trade;
  }

  @action
  updateTrade = buffer => {
    const { tradeInfo, tradeList, futureTradeList } = this;
    const pendingList = toJS(futureTradeList);
    const transList = toJS(tradeList);

    const pendingCloseList = buffer[PENDING_ORDER_CLOSE];
    this.removeTradeList(pendingList, pendingCloseList);

    const orderCloseList = buffer[ORDER_CLOSE];
    this.removeTradeList(transList, orderCloseList);

    const orderOpenList = buffer[ORDER_OPEN];
    this.addTradeList(transList, orderOpenList);

    const orderProfitList = buffer[ORDER_PROFIT];
    this.addTradeList(transList, orderProfitList);

    let newMeta = {
      ...tradeInfo,
      ...buffer[META_FUND],
    };

    newMeta = this.calcTradeInfo(newMeta, transList);

    this.setTradeInfo(newMeta, false);
    this.setTradeList(transList, "order");
    this.setTradeList(pendingList, "future");
  };
  calcTradeInfo = (meta, list) => {
    const { balance, margin, } = meta;
    const profit = list.reduce((acc, cur) => acc + cur.profit, 0);
    const equity = list.reduce((acc, cur) => acc + cur.profit, 0) + balance;
    const free_margin = equity - margin;
    const margin_level = equity / margin;

    return {
      ...meta,
      profit,
      equity,
      free_margin,
      margin_level,
    };
  };
  addTradeList = (originlist, addList) => {
    let originTimestamp
    addList.map(aItem => {
      const { order_number, timestamp, } = aItem;
      const i = originlist.findIndex(oItem => {
        return (oItem.order_number = order_number);
      });
      if (!utils.isEmpty(originlist[i])) {
        originTimestamp = originlist[i].timestamp;
      }
      if (i === -1) {
        originlist.push(aItem);
      } else if (originTimestamp < timestamp) {
        originlist[i] = aItem;
      }
    });
  };
  removeTradeList = (originlist, removeList) => {
    removeList.map(rItem => {
      const { order_number, } = rItem;
      const i = originlist.findIndex(oItem => {
        return (oItem.order_number = order_number);
      });
      if (i === -1) return;
      originlist.splice(i, 1);
    });
  };
}

export default new TradeStore();
