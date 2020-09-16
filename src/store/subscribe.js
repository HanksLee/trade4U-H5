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
    }, observable({}));
    // 初始物件要使用 observable, toJS 才能还原 proxy 成物件
  }
  @action.bound
  async getNewStockList(data) {
    const res = await api.subscribe.getNewStockList();
    console.log("NewStock res :>> ", res);
    this.setNewStockList(res.data);
  }

  @action.bound
  setNewStockList(data) {
    this.newStockList = data;
  }
  getNewStockDetail(id) {
    return this.newStockMap[Number(id)];
  }

  //
  @observable
  userSubscribeList = [];
  @computed get userSubscribeMap() {
    // userSubscribeList 列表为使用者所有申购的订单
    // * 转为物件 userSubscribeMap， key 为申购的股票 id
    return this.userSubscribeList.reduce((obj, curr) => {
      const { new_stock } = curr;
      obj[new_stock] = curr;
      return obj;
    }, observable({}));
    // 初始物件要使用 observable, toJS 才能还原 proxy 成物件
  }
  @action.bound
  async getUserSubscribeList(data) {
    const res = await api.subscribe.getUserSubscribeList();
    console.log("UserSubscribe res :>> ", res);
    this.setUserSubscribeList(res.data.results);
  }

  @action.bound
  setUserSubscribeList(data) {
    this.userSubscribeList = data;
  }
}
export default new SubscribeStore();
