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
  globalEvent = null;

  @action
  setGlobalEvent = event => {
    this.globalEvent = event;
  }


  @observable
  systemConfig = []

  @action
  getSystemConfig = async (params) => {
    const res = await this.$api.common.getConfig({ params, });
    this.setSystemConfig(res.data);
  }
  @action
  setSystemConfig = (systemConfig) => {
    this.systemConfig = systemConfig;
  }

  @action
  getKeyConfig(key) {
    if(this.systemConfig.length === 0)
      return null;
     
    return this.systemConfig.filter((item, i)=>{
      return item.key === key;
    })[0].value;
  }
  
}

export default new CommonStore();
