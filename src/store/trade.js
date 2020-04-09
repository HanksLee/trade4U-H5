import { computed, action, observable } from "mobx";
import BaseStore from "store/base";


class TradeStore extends BaseStore {
  @observable
  tradeInfo = {};
  @observable
  tradeList = []; // 持仓订单
  @observable
  futureTradeList = []; // 挂单订单
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
  getTradeList = (config) => {
    const res = this.$api.trade.getTradeList(config);

    this.setTradeList(res.data);
  }

  @action
  setTradeList = (list, type = 'order') => {
    if (type == 'order') {
      this.tradeList = list;
    } else {
      this.futureTradeList = list;
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
}

export default new TradeStore();
