import { action, observable } from "mobx";
import BaseStore from "store/base";

class MarketStore extends BaseStore {
  @observable
  selfSelectSymbolList = [];
  @action
  getSelfSelectSymbolList = async config => {
    const res = await this.$api.market.getSelfSelectSymbolList(config);
    this.setSelfSelectSymbolList(res.data.results);
  };

  @action
  setSelfSelectSymbolList = data => {
    this.selfSelectSymbolList = data;
  }
}

export default new MarketStore();