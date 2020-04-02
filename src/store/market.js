import api from 'services'
import { action, observable } from "mobx";
import BaseStore from "store/base";

class MarketStore extends BaseStore {
  @observable
  selfSelectSymbolList = [];
  @action
  getSelfSelectSymbolList = async config => {
    const res = await api.market.getSelfSelectSymbolList(config);
    this.setSelfSelectSymbolList(res.data.results);
  };

  @action
  setSelfSelectSymbolList = data => {
    this.selfSelectSymbolList = data;
  }

  @action
  updateSelfSelectSymbolList = async config => {
    const res = await api.market.getSelfSelectSymbolList(config);
    const results = res.data.results;
    const newResults = results.map(item => {
      for (let i = 0; i < this.selfSelectSymbolList.length; i++) {
        if (item.symbol === this.selfSelectSymbolList[i].symbol) {
          return this.selfSelectSymbolList[i]
        }
      }
      return item;
    })
    this.setSelfSelectSymbolList(newResults);
  };
}

export default new MarketStore();