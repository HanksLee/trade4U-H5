import { computed, action, observable } from "mobx";
import BaseStore from "store/base";
import utils from "utils";

class CommonStore extends BaseStore {
  @observable
  test = "";

  @action
  setTest = (val) => {
    this.test = val;
  };

  @observable
  globalEvent = null;

  @action
  setGlobalEvent = (event) => {
    this.globalEvent = event;
  };

  @observable
  systemConfig = [];

  @action
  getSystemConfig = async (params) => {
    const res = await this.$api.common.getConfig({ params });
    this.setSystemConfig(res.data);
  };
  @action
  setSystemConfig = (systemConfig) => {
    this.systemConfig = systemConfig;
  };

  @action
  getKeyConfig = (key) => {
    if (this.systemConfig.length === 0) return null;

    return this.systemConfig.filter((item, i) => {
      return item.key === key;
    })[0].value;
  };

  @observable
  profitRule = {};

  @action
  async getProfitRule() {
    const res = await this.$api.trade.getProfitrule();
    if (res.status === 200) {
      const d = res.data;
      this.setProfitRule(d);
    }
  }

  @action
  setProfitRule(d) {
    this.profitRule = {
      ...d,
    };
  }

  @computed
  get nowProfitRule() {
    return this.profitRule;
  }

  //Symbol WS
  @observable
  selectedSymbolTypeInfo = {
    code: "",
  };
  @action
  setSelectedSymbolTypeInfo = (d) => {
    this.selectedSymbolTypeInfo = {
      ...this.selectedSymbolTypeInfo,
      ...d,
    };
  };

  @observable
  selectedSymbolId = {
    code: "",
    prev: null,
    next: null,
  };

  @action
  setSelectedSymbolId = (code, o) => {
    // console.log(code, o)
    const { prev, next } = this.selectedSymbolId;

    this.selectedSymbolId = {
      prevId: next,
      next: o,
      code
    };
  };

  @observable
  selectedSymbolInfo = {};

  @action
  setSelectedSymbolInfo = (d) => {
    this.selectedSymbolInfo = {
      ...d,
    };
  };

  @observable
  subscribeSymbolList = [];

  @action
  setSubscribeSymbolList = (d) => {
    this.subscribeSymbolList = d;
  };

  @observable
  subscribeSymbol = { list: [] };

  @observable
  unSubscribeSymbol = { list: [] };

  @action
  setSubscribeSymbol = (d) => {
    this.subscribeSymbol = { ...d };
  };

  @action
  setUnSubscribeSymbol = (d) => {
    this.unSubscribeSymbol = { ...d };
  };


  @observable
  symbolWSAction = {
    cmd: "",
  };

  @action
  setSymbolWSAction = (d) => {
    this.symbolWSAction = {
      ...d,
    };
  };
}

export default new CommonStore();
