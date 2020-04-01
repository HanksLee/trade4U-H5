import { computed, action, observable } from "mobx";
import BaseStore from "store/base";

class CommonStore extends BaseStore {
  @observable
  test = '';

  @action
  setTest = val => {
    this.test = val;
  }
}

export default new CommonStore();
