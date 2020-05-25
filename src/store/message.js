import { computed, action, observable } from "mobx";
import BaseStore from "store/base";
import ws from "utils/ws";

class TradeStore extends BaseStore {
  @observable
  wsConnect = null;
  @observable
  hasNotify = false;
  @observable
  hasAnnouncement = false;

  @action
  connnetNotifyWebsocket = () => {
    this.wsConnect = ws("notify");
    // console.log(this.wsConnect);
    this.wsConnect.onmessage = (event) => {
      const message = event.data;

      const type = JSON.parse(message).type;

      if (type == "notify") {
        this.hasNotify = true;
      }
      if (type == "announcement") {
        this.hasAnnouncement = true;
      }
    };
  };
}

export default new TradeStore();
