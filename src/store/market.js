import api from 'services'
import { action, observable, computed } from "mobx";
import BaseStore from "store/base";
import utils from 'utils';
import cloneDeep from 'lodash/cloneDeep';
import moment from 'moment';

class MarketStore extends BaseStore {
  @observable
  selfSelectSymbolList = [];
  @observable
  currentSelfSelectSymbol = {};

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
  setCurrentSelfSelectSymbol = symbol => {
    this.currentSelfSelectSymbol = symbol;
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

  @observable
  symbolList = [];
  @observable
  currentSymbol = {};

  @action
  getSymbolList = async config => {
    const res = await this.$api.market.getSymbolList(config);
    this.setSymbolList(res.data.results);
  };

  @action
  setSymbolList = data => {
    this.symbolList = data;
  }

  @action
  getCurrentSymbol = async (id, config) => {
    const res = await this.$api.market.getCurrentSymbol(id, config);
    this.setCurrentSymbol(res.data);
  }

  @computed
  get currentShowSymbol() {
    const obj = {};

    obj.min_volume = parseFloat((this.currentSymbol?.symbol_display?.min_trading_volume / this.currentSymbol?.symbol_display?.contract_size)?.toFixed(2));
    obj.basic_step = parseFloat((this.currentSymbol?.symbol_display?.volume_step / this.currentSymbol?.symbol_display?.contract_size)?.toFixed(2));

    if (!utils.isEmpty(this.currentSymbol.trend)) {
      const trend = cloneDeep(this.currentSymbol.trend);
      obj.trendBuy = [];
      obj.trendSell = [];

      let cur;
      for (let i = 0; i < trend.length; i++) {
        cur = trend[i];


        obj.trendBuy.push({
          name: moment(cur[0] * 1000).toString(),
          value: [
            // moment(cur[0] * 1000).format('YYYY.MM.DD HH:mm:ss'),
            new Date(cur[0] * 1000),
            +cur[1],
          ],
        });

        obj.trendSell.push({
          name: moment(cur[0] * 1000).toString(),
          value: [
            // moment(cur[0] * 1000).format('YYYY.MM.DD HH:mm:ss'),
            new Date(cur[0] * 1000),
            +cur[2],
          ],
        });
      }
    }

    return {
      ...this.currentSymbol,
      ...obj,
    };
  }

  @action
  setCurrentSymbol = (symbol, overwrite = false) => {
    if (overwrite) {
      this.currentSymbol = symbol;
    } else {
      this.currentSymbol = {
        ...this.currentSymbol,
        ...symbol
      }
    }
  }
}

export default new MarketStore();