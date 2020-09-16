import api from "services";
import { action, observable, computed, toJS } from "mobx";
import BaseStore from "store/base";
import utils from "utils";
import cloneDeep from "lodash/cloneDeep";
import moment from "moment";

class SubscribeStore extends BaseStore {
  @observable
  newStockList = [];
  @computed get newStockMap() {
    return this.newStockList.reduce((obj, curr) => {
      const { id } = curr;
      obj[id] = curr;
      return obj;
    }, {});
  }
  @action.bound
  setNewStockList(data) {
    this.newStockList = data;
  }
  getNewStockDetail(id) {
    return this.newStockMap[Number(id)];
  }
}
export default new SubscribeStore();
