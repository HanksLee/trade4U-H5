import api from 'services'
import { action, observable, computed, toJS } from "mobx";
import BaseStore from "store/base";
import utils from 'utils';
import cloneDeep from 'lodash/cloneDeep';
import moment from 'moment';

class MarketStore extends BaseStore {
  @observable
  selfSelectSymbolList = [];
  @observable
  selfSelectSymbolListCount = [];
  @observable
  currentSelfSelectSymbol = {};

  @action
  getSelfSelectSymbolList = async (config, overwrite) => {
    const res = await api.market.getSelfSelectSymbolList(config);
    // const selfSelectSymbolList = await this.createSymbolList(res.data.results);
    // this.setSelfSelectSymbolList(selfSelectSymbolList, overwrite);
    this.setSelfSelectSymbolList(res.data.results, overwrite);
    this.selfSelectSymbolListCount = res.data.count
  };

  @action
  setSelfSelectSymbolList = (data, overwrite) => {
    if (overwrite) {
      this.selfSelectSymbolList = data;
    } else {
      this.selfSelectSymbolList = [...this.selfSelectSymbolList, ...data]
    }

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
    this.setSelfSelectSymbolList(newResults, true);
  };

  @observable
  symbolList = [];
  @observable
  prevSymbolIDList = [];
  @observable
  nextSymbolIDList = [];
  @observable
  symbolListCount = 0;
  @observable
  currentSymbol = {};

  @action
  getSymbolList = async (config, overwrite) => {
    const res = await this.$api.market.getSymbolList(config);
    this.setSymbolList(res.data.results, overwrite);
    this.symbolListCount = res.data.count;
  };

  @action
  setSymbolList = (data, overwrite) => {
    if (overwrite) {
      this.symbolList = data;
      this.symbolList.map((item) => {
        this.nextSymbolIDList.push(item.id)
      })
    } else {
      this.symbolList = [...this.symbolList, ...data]
    }
  }

  @action
  moveSymbolIDList = (array) => {
    this.prevSymbolIDList = array;
    this.nextSymbolIDList = [];
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

  @action
  createSymbolList = (list) => {
    // console.log(list)
    return list.map((item, i) => {
      const {
        id,
        name,
        spread,
        decimals_place,
        spread_mode_display,
        profit_currency_display,
        max_lots,
        purchase_fee,
        contract_size,
        margin_currency_display,
        lots_step,
        min_lots,
        selling_fee,
      } = item.symbol_display;
      // const { symbol_type_code, } = this.currentSymbolType;
      const deleteID = item.symbol;
      const addID = item.id;
      const { symbol, sell, buy, chg, change } = item.product_details
        ? item.product_details
        : {
          symbol: "-----",
          sell: 0,
          buy: 0,
          chg: 0,
        };

      return {
        key: `${id}-${name}`,
        id: id,
        rowInfo: {
          id,
          name,
          spread,
          chg,
          change,
          sell,
          buy,
          symbol,
          deleteID,
          addID,
          // symbol_type_code,
        },
        detailInfo: {
          decimals_place,
          spread_mode_display,
          profit_currency_display,
          max_lots,
          purchase_fee,
          contract_size,
          margin_currency_display,
          lots_step,
          min_lots,
          selling_fee,
        },
      };
    });
  }

  @action
  setCurrentSymbolList = (d, currentSymbolType) => {
    if (currentSymbolType === '自选') {
      //       this.currentList = {
      //   ...this.currentList,
      //   ...d,
      // };
      this.setSelfSelectSymbolList(d, true)
    }
  }

  @action
  updateCurrentSymbolList = (updateList, originList, currentSymbolType) => {
    updateList.forEach(uItem => {
      const selectedItem = originList.filter(cItem => {
        const { product_details, } = cItem;
        return (
          product_details &&
          uItem.symbol === product_details.symbol &&
          product_details.timestamp < uItem.timestamp
        );
      });

      if (selectedItem.length === 0) return;
      let { product_details, } = selectedItem[0];
      product_details = {
        ...product_details,
        ...uItem,
      };
      selectedItem[0].product_details = {
        ...product_details,
      };
    });
    // const symbolList = this.createSymbolList(originList);

    // this.setCurrentSymbolList(
    //   symbolList, currentSymbolType
    // );
    this.setCurrentSymbolList(toJS(originList), currentSymbolType)
  }
}

export default new MarketStore();