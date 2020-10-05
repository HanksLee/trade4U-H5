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
  userAuthentication = -1


  @action
  checkUserStatus = (auth) => {
    // 计算用户审核状态
    // 0-未完善资料，或审核资料失败
    // 1-资料审核中
    // 2-资料审核通过，但未入金
    // 3-已入金，可进行交易
    const { inspect_status, recharge_status, } = this.userInfo;
    if (auth === 'withdraw_authentication') {
      if (recharge_status == 0) {
        this.userAuthentication = 0;
      } else if (inspect_status == 0 || inspect_status == 3) {
        this.userAuthentication = 1;
      } else if (inspect_status == 1) {
        this.userAuthentication = 2;
      } else if (inspect_status == 2 && recharge_status == 1) {
        this.userAuthentication = 3;
      } else {
        this.userAuthentication = -1;
      }
    } else {
      if (inspect_status == 0 || inspect_status == 3) {
        this.userAuthentication = 0;
      } else if (inspect_status == 1) {
        this.userAuthentication = 1;
      } else if (inspect_status == 2 && recharge_status == 0) {
        this.userAuthentication = 2;
      } else if (inspect_status == 2 && recharge_status == 1) {
        this.userAuthentication = 3;
      } else {
        this.userAuthentication = -1;
      }
    }
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

  @observable
  waitTime = 60;
  @observable
  canSendSMS = true;
  @observable
  smsKey = undefined;
  @observable
  errMsg = ""

  @action
  sendSMS = async () => {
    if (!this.canSendSMS) {
      return false;
    } else {
      this.canSendSMS = false;
      let payload = {
        type: "reset_pwd_sms",
      };
      const res = await api.setting.sendSMS(payload);

      if (res.status === 201) {
        // this.setState({ smsKey: res.data.key });
        this.setSmsKey(res.data.key)
      } else {
        // this.setState({ errMsg: res.data.message });
        this.setErrMsg(res.data.message)
        // this.errMsg = res.data.message;
      }

      let timeID = setInterval(() => {
        if (this.waitTime === 0) {
          clearInterval(timeID);
        }
        this.setTiming();
      }, 1000);
    }
  };

  @action
  setTiming = () => {
    if (this.waitTime === 0) {
      this.waitTime = 60;
      this.canSendSMS = true;
    } else {
      this.waitTime--;
    }

  }

  @action
  setErrMsg = (errMsg) => {
    this.errMsg = errMsg;
  }

  @action
  setSmsKey = (smsKey) => {
    this.smsKey = smsKey
  }

}

export default new SettingStore();