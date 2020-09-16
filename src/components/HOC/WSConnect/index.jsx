import * as React from "react";
import { BaseReact } from "components/baseComponent";
import WebSocketControl from "utils/WebSocketControl";
import { AUTO, NORMAL } from "utils/WebSocketControl/close";

import {
  initBuffer,
  checkBuffer,
  mergeRegisterData,
  getRegisterCount,
  checkRegisterHasValue,
} from "utils/buffer";
import moment from "moment";

import {
  STANDBY, //啟動ws之前
  CONNECTING, //已開通通路，未接收到訊息
  CONNECTED, //已接收到訊息
  DISCONNECTED, //斷線
  RECONNECT, //斷線重新連線
  URLREPLACE, // Url 切換
  ERROR, //
} from "utils/WebSocketControl/status";

export default function WSConnect(defaultChannl, channelConfig, Comp) {
  const {
    path,
    pathKey,
    bufferInfo,
    connectDistanceTime,
    tryConnectMax,
    disconnectMax,
  } = defaultChannl;

  const wsControl = new WebSocketControl({
    path: path,
    connectDistanceTime: connectDistanceTime,
  });

  const connectQueue = [];
  const RECONNECT_DELAYTIME = 5000;
  const tryReconnect = () => {
    const id = window.setTimeout(() => {
      wsControl.reconnectWS();
    }, RECONNECT_DELAYTIME);
    connectQueue.push(id);
  };

  const clearConnectQueue = () => {
    connectQueue.forEach((id) => {
      window.clearTimeout(id);
    });
    connectQueue.splice(0, connectQueue.length);
  };

  return class extends BaseReact {
    state = {
      selectedChannel: defaultChannl,
      refreshChannel: false,
      initMsg: false,
    };
    disconnetCount = 0;
    buffer = null;
    constructor(props) {
      super(props);

      this.buffer = this.createBuffer();
    }

    static getDerivedStateFromProps(nextProps, prevState) {
      //console.log("left getDerivedStateFromProps");
      const { selectedChannel } = prevState;
      const refreshChannel =
        nextProps.channelCode !== selectedChannel.channelCode ||
        selectedChannel.pathKey;

      return {
        ...prevState,
        refreshChannel,
      };
    }

    shouldComponentUpdate(nextProps, nextState) {
      const { refreshChannel } = nextState;
      if (!refreshChannel) {
        return true;
      }

      const newChannel = channelConfig.filter((item) => {
        return item.channelCode === nextProps.channelCode;
      });

      if (newChannel.length === 0) {
        return true;
      }

      nextState.selectedChannel = {
        ...newChannel[0],
      };

      return true;
    }

    render() {
      return (
        <Comp
          {...this.props}
          setReceviceMsgLinter={this.setReceviceMsgLinter}
          setStatusChangeListener={this.setStatusChangeListener}
          sendMsg={this.sendMsg}
          replaceUrl={this.replaceUrl}
          startWS={this.startWS}
          closeWS={this.closeWS}
          reconnectWS={this.reconnectWS}
          getProgress={this.getProgress}
        />
      );
    }

    componentDidMount() {
      this.setWSEvent(wsControl);

      const { selectedChannel } = this.state;
      const { path, pathKey } = selectedChannel;

      if (pathKey) {
        const newPath = this.getNewPath(path, pathKey);
        wsControl.replaceUrl(newPath);
      } else {
        wsControl.startWS();
      }
    }

    componentDidUpdate(prevProps, PrevState) {
      const { selectedChannel, refreshChannel } = this.state;
      if (!refreshChannel) return;

      const { path, pathKey, bufferInfo } = selectedChannel;

      const newPath = this.getNewPath(path, pathKey);
      if (wsControl._path === newPath) return;
      this.buffer = this.createBuffer();
      wsControl.replaceUrl(newPath);
    }

    componentWillUnmount() {
      wsControl.closeWS();
    }

    //function

    getNewPath = (path, pathKey) => {
      if (!pathKey) {
        return path;
      }

      for (let key of pathKey) {
        const vaule = this.props[key];
        if (!vaule) {
          path = "";
          break;
        }
        const pathKey = `<${key}>`;
        path = path.replace(pathKey, vaule);
      }

      return path;
    };

    createBuffer = () => {
      const { limitTime, maxCount, regType } = bufferInfo || {
        limitTime: null,
        maxCount: null,
        reg: null,
      };
      return initBuffer(limitTime, maxCount, regType);
    };

    setWSEvent = (wsc) => {
      wsc.setStatusChange((wsc, before, now) => {
        // console.log("StatusChange:" ,`${before}->${now}`);
        if (this.statusChangListener) this.statusChangListener(before, now);
      });
      wsc.setReceviceMsg((wsc, msg) => {
        // console.log("ReceviceMsg:" ,msg);
        if (!bufferInfo && this.receviceMsgLinter) {
          this.receviceMsgLinter(msg);
          return;
        }
        const { buffer } = this;
        const {
          timeId,
          BUFFER_TIME,
          BUFFER_MAXCOUNT,
          lastCheckUpdateTime,
        } = buffer;
        const receviceTime = moment().valueOf();
        buffer.register = mergeRegisterData(buffer.register, msg);

        const maxCount = getRegisterCount(buffer.register);
        if (
          !checkBuffer(
            BUFFER_TIME,
            BUFFER_MAXCOUNT,
            maxCount,
            lastCheckUpdateTime,
            receviceTime
          )
        ) {
          return;
        }
        if (this.receviceMsgLinter) this.receviceMsgLinter(buffer.register);
        this.buffer = this.createBuffer();
      });

      wsc.setStatusEvent(STANDBY, (wsc) => {
        // console.log("STANDBY");
        clearConnectQueue();
      });
      wsc.setStatusEvent(CONNECTING, (wsc, count) => {
        // console.log("CONNECTING:",count);
        if (
          this.receviceMsgLinter &&
          checkRegisterHasValue(this.buffer.register)
        ) {
          this.receviceMsgLinter(this.buffer.register);
          // console.log("CONNECTING:receviceMsgLinter - ",count);
        }

        if (count === tryConnectMax) {
          tryReconnect();
        }
      });
      wsc.setStatusEvent(CONNECTED, (wsc) => {
        this.disconnetCount = 0;
        // console.log("CONNECTED");
      });
      wsc.setStatusEvent(RECONNECT, (wsc) => {
        // console.log("RECONNECT");
      });
      wsc.setStatusEvent(DISCONNECTED, (wsc, closeCode) => {
        this.disconnetCount++;
        if (closeCode === AUTO && this.disconnetCount < disconnectMax) {
          tryReconnect();
        } else if (this.disconnetCount === disconnectMax) {
          this.$msg.error("已断线，请确认网路状态或联系客服");
          this.disconnetCount = 0;
        }
      });
      wsc.setStatusEvent(ERROR, (wsc, e) => {
        // console.log("ERROR");
        wsc.closeWS();
      });
    };

    receviceMsgLinter = null;
    setReceviceMsgLinter = (fn) => {
      this.receviceMsgLinter = fn;
    };
    statusChangListener = null;
    setStatusChangeListener = (fn) => {
      this.statusChangListener = fn;
    };

    getProgress = () => {
      return wsControl.nowProgress;
    };
    sendMsg = (o) => {
      wsControl.sendMsg(o);
    };
    replaceUrl = (newPath) => {
      wsControl.replaceUrl(newPath);
    };
    startWS = () => {
      wsControl.startWS();
    };
    closeWS = () => {
      wsControl.closeWS();
    };
    reconnectWS = () => {
      wsControl.reconnectWS();
    };
  };
}
