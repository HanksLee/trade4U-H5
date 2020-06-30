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
    const that = this;

    // setInterval(function () {
    //   that.wsConnect.send(`{"type":"ping"}`);
    // }, 3000)

    this.wsConnect.onmessage = (event) => {
      const message = event.data;
      const type = JSON.parse(message).type;
      if (message.type === 'pong') {
        clearInterval(this.interval);

        // 如果一定时间没有调用clearInterval，则执行重连
        this.interval = setInterval(function () {
          that.connnetNotifyWebsocket();
        }, 1000);
      }
      if (message.type && message.type !== 'pong') { // 消息推送
        // code ...       
        if (type == "notify") {
          this.switchHasNotifyStatus(true);
        }
        if (type == "announcement") {
          this.switchHasAnnouncementStatus(true);
        }
      }

    };

    this.wsConnect.onclose = (evt) => {
      setInterval(function () { that.connnetNotifyWebsocket() }, 3000)
    }
  };
}

export default new MessageStore();
