import { computed, action, observable } from "mobx";
import BaseStore from "store/base";


class TradeStore extends BaseStore {
  @observable
  tradeInfo = {};
  @observable
  tradeList = [];
  @computed
  get computedTradeList() {
    let list = [];

    list = this.tradeList.map(item => {
      item.profit = item.profit && +item.profit;
      item.swaps = item.swaps && +item.swaps;
      item.taxes = item.taxes && +item.taxes;
      item.take_profit = item.take_profit && +item.take_profit;
      item.stop_loss = item.stop_loss && +item.stop_loss;
      item.fee = item.fee && +item.fee;

      return item;
    });

    return list;
  }

  @action
  getTradeInfo = async config => {
    const res = await this.$api.trade.getTradeInfo(config);

    this.setTradeInfo(res.data);
  }

  @action
  setTradeInfo = info => this.tradeInfo = info;

  @action
  getTradeList = (config) => {
    const res = this.$api.trade.getTradeList(config);

    this.setTradeList(res.data);
  }

  @action
  setTradeList = list => {
    this.tradeList = list;
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
