import { computed, action, observable } from "mobx";
import BaseStore from "store/base";
import ws from "utils/ws";

class MessageStore extends BaseStore {
  @observable
  wsConnect = null;
  @observable
  hasNotify = false;
  @observable
  hasAnnouncement = false;

  @action switchHasNotifyStatus = (status) => {
    this.hasNotify = status;
  };

  @action switchHasAnnouncementStatus = (status) => {
    this.hasAnnouncement = status;
  };

  @action connnetNotifyWebsocket = () => {
    this.wsConnect = ws("notify");
    console.log(this.wsConnect);
    this.wsConnect.onmessage = (event) => {
      console.log(event);
      const message = event.data;

      const type = JSON.parse(message).type;

      if (type == "notify") {
        this.switchHasNotifyStatus(true);
      }
      if (type == "announcement") {
        this.switchHasAnnouncementStatus(true);
      }
    };
  };
}

export default new MessageStore();
