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

  @action connectNotifyWebsocket = () => {
    this.wsConnect = ws("notify");
    // console.log(this.wsConnect)
    const that = this;

    setTimeout(function () {
      setInterval(function () {
        that.wsConnect.send(`{"type":"ping"}`);
      }, 3000)
    }, 30000)

    this.wsConnect.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const type = message.type;
      if (message.type === 'pong') {
        clearInterval(this.interval);

        // 如果一定时间没有调用clearInterval，则执行重连
        this.interval = setInterval(function () {
          that.connectNotifyWebsocket();
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

    //this.wsConnect.onclose = (evt) => {
    //setInterval(function () { that.connectNotifyWebsocket() }, 3000)
    //}
  };
}

export default new MessageStore();
