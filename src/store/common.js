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

    if (!localStorage.getItem("color_mode")) {
      const colorMode = res.data.find(function (item, index, array) {
        return item.key === "color_mode";
      });
      localStorage.setItem("color_mode", colorMode.value)
    }
    this.setQuoteColor();
  };
  @action
  setSystemConfig = (systemConfig) => {
    this.systemConfig = systemConfig;
  };
  @action
  setQuoteColor = () => {
    const colorMode = localStorage.getItem("color_mode");
    const root = document.documentElement;
    if (colorMode === "hk_style") {
      root.style.setProperty('--up-color', `#e94a39`)
      root.style.setProperty('--down-color', `#44d7b6`)
      root.style.setProperty('--up-color-rgb', `233, 74, 57`)
      root.style.setProperty('--down-color-rgb', `68, 215, 182`)
      // this.colorUp = 'p-red';
      // this.colorDown = 'p-green';
    } else {
      root.style.setProperty('--up-color', `#44d7b6`)
      root.style.setProperty('--down-color', `#e94a39`)
      root.style.setProperty('--up-color-rgb', `68, 215, 182`)
      root.style.setProperty('--down-color-rgb', `233, 74, 57`)
      // this.colorUp = 'p-green';
      // this.colorDown = 'p-red';
    }
  }

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
