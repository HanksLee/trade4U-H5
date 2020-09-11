import { computed, action, observable } from "mobx";
import BaseStore from "store/base";
import api from 'services';

class SettingStore extends BaseStore {
  @observable
  userInfo = {};
  @observable
  isInputDisable = true;

  @action
  getUserInfo = async () => {
    const res = await api.setting.getAccountInfo();
    if (res.status === 200) {
      this.setUserInfo(res.data)
    }
  }

  @action
  setUserInfo = (userInfo) => {
    this.userInfo = userInfo;
    this.isInputDisable = userInfo["inspect_status"] === 1 || userInfo["inspect_status"] === 2
      ? true
      : false
  }

  @observable
  withdrawableBalance = 0

  @action
  getWithdrawableBalance = async () => {
    const res = await api.setting.getWithdrawableBalance();
    if (res.status === 200) {
      this.setWithdrawableBalance(res.data.withdrawable_balance)
    }
  }

  @action
  setWithdrawableBalance = (withdrawableBalance) => {
    this.withdrawableBalance = withdrawableBalance;
  }

}

export default new SettingStore();