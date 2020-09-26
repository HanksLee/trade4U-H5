import api from "services";
import { action, observable, computed, toJS } from "mobx";
import BaseStore from "store/base";
import utils from "utils";
import cloneDeep from "lodash/cloneDeep";
import moment from "moment";
import momentTimezone from "moment-timezone";
class SubscribeStore extends BaseStore {
  @observable
  newStockList = [];
  @computed get sortedNewStockList() {
    const expiredList = [];
    const runningList = [];
    const notStartedList = [];
    for (let item of this.newStockList) {
      if (item.isExpired) {
        expiredList.push(item);
      } else if (item.isNotStarted) {
        notStartedList.push(item);
      } else {
        runningList.push(item);
      }
    }
    return observable([...runningList, ...notStartedList, ...expiredList]);
  }
  @computed get newStockMap() {
    if (this.newStockList.length === 0) return {};
    try {
      return this.newStockList.reduce((obj, curr) => {
        const { id } = curr;
        obj[id] = curr;
        return obj;
      }, observable({}));
      // 初始物件要使用 observable, toJS 才能还原 proxy 成物件
    } catch (err) {
      return {};
    }
  }
  @action.bound
  async getNewStockList(data) {
    const res = await api.subscribe.getNewStockList();
    // console.log("NewStock res :>> ", res);
    const nowMoment = momentTimezone(Date.now()).tz("Asia/Shanghai");
    // console.log("nowMoment :>> ", nowMoment);
    const newStockList = res.data
      .map((each) => {
        const { subscription_date_end, subscription_date_start } = each;

        each["isExpired"] = nowMoment.isAfter(moment(subscription_date_end));
        each["isNotStarted"] = nowMoment.isBefore(
          moment(subscription_date_start)
        );
        return each;
      })
      .reverse(); // 改为日期由新到旧排序

    this.setNewStockList(newStockList);
  }

  @action.bound
  setNewStockList(data) {
    this.newStockList = data;
  }

  //
  @observable
  userSubscribeList = [];
  @computed get userSubscribeMap() {
    // userSubscribeList 列表为使用者所有申购的订单
    // * 转为物件 userSubscribeMap， key 为申购的股票 id
    if (this.userSubscribeList.length === 0) return {};
    try {
      return this.userSubscribeList.reduce((obj, curr) => {
        const { new_stock } = curr;
        obj[new_stock] = curr;
        return obj;
      }, observable({}));
      // 初始物件要使用 observable, toJS 才能还原 proxy 成物件
    } catch (error) {
      return {};
    }
  }
  @action.bound
  async getUserSubscribeList(data) {
    const res = await api.subscribe.getUserSubscribeList();
    // console.log("UserSubscribe res :>> ", res);
    this.setUserSubscribeList(res.data.results);
  }

  @action.bound
  setUserSubscribeList(data) {
    this.userSubscribeList = data;
  }
}
export default new SubscribeStore();
