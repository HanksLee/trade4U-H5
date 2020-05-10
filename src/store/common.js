import { computed, action, observable } from "mobx";
import BaseStore from "store/base";

class CommonStore extends BaseStore {
  @observable
  test = '';

  @action
  setTest = val => {
    this.test = val;
  }

  @observable
  lastChartSymbol = null;

  @action
  setLastChartSymbol = symbol => {
    this.lastChartSymbol = symbol;
  }
}

export default new CommonStore();
