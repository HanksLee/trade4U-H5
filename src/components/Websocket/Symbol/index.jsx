import * as React from "react";
import { inject, observer } from "mobx-react";
import { toJS, reaction } from "mobx";
import WSConnect from "components/HOC/WSConnect";
import { START, CLOSE, RESTART } from "../config/wsCmd";
import channelConfig from "./config/channel";

import {
  STANDBY, //啟動ws之前
  CONNECTING, //已開通通路，未接收到訊息
  CONNECTED, //已接收到訊息
  DISCONNECTED, //斷線
  RECONNECT, //斷線重新連線
  URLREPLACE, // Url 切換
  ERROR, //
} from "utils/WebSocketControl/status";

const SUBSCRIBE = "subscribe";
const UNSUBSCRIBE = "unsubscribe";
@observer
@inject("common")
class Symbol extends React.Component {
  state = {
    chart: null,
    chartOption: null,
  };

  constructor(props) {
    super(props);

    this.setSubscribeListener();
    this.setUnsubscribeListener();
    this.setWSActionListener();
    this.setSelectedSymbolIdListener();
    this.setSelectedSymbolTypeInfoListener();
  }
  static getDerivedStateFromProps(nextProps, prevState) {
    return {
      ...prevState,
      ...nextProps,
    };
  }
  render() {
    return <div></div>;
  }

  componentDidMount() {
    this.props.setReceviceMsgLinter(this.receviceMsgLinter);
  }

  //function
  receviceMsgLinter = (d) => {
    const sortList = this.sortList(d);
    const filterList = this.filterBufferlList(sortList);

    this.props.common.setSubscribeSymbolList(filterList);

    const { setSelectedSymbolInfo, selectedSymbolId } = this.props.common;
    const { next } = selectedSymbolId;

    if (next === null) return;
    if (this.checkIdExist(filterList, next.symbol)) {
      const infoList = filterList.filter((item, i) => {
        return item.symbol === next.symbol;
      });

      if (infoList.length === 0) return;
      const info = infoList[infoList.length - 1];
      setSelectedSymbolInfo(info);
    }
  };

  filterBufferlList(list) {
    return list.filter((item, i, all) => {
      return (
        all.findIndex((fItem) => {
          return fItem.symbol === item.symbol;
        }) === i
      );
    });
  }

  sortList = (list) => {
    const tmp = Object.assign([], list);

    tmp.sort((a, b) => {
      if (a.symbol !== b.symbol) {
        return -1;
      }

      if (a.timestamp > b.timestamp) {
        return -1;
      }

      if (a.timestamp < b.timestamp) {
        return 1;
      }

      if (a.timestamp === b.timestamp) {
        return 0;
      }
    });

    return tmp;
  };

  //ws
  setSelectedSymbolIdListener = () => {
    reaction(
      () => this.props.common.selectedSymbolId,
      (selectedSymbolId) => {
        const {
          subscribeSymbol,
          selectedSymbolTypeInfo,
          setSelectedSymbolInfo,
        } = this.props.common;

        const { code, next, prev } = selectedSymbolId;

        if (code === null) {
          setSelectedSymbolInfo({});
          return;
        }

        if (code === "self") {
          return;
        }

        const symbolTypeCode = selectedSymbolTypeInfo.code;
        const nowProgress = this.props.getProgress();
        if (nowProgress === DISCONNECTED || code !== symbolTypeCode) {
          this.replaceWSUrl(code);
        }

        const { list } = subscribeSymbol;
        if (prev  && !this.checkIdExist(list, prev.id)) {
          this.trackSymbol([prev.id], UNSUBSCRIBE);
        }

        if (next && !this.checkIdExist(list, next.id)) {
          this.trackSymbol([next.id], SUBSCRIBE);
        }
      }
    );
  };

  setSubscribeListener = () => {
    reaction(
      () => this.props.common.subscribeSymbol,
      (subscribeSymbol) => {
        const { list } = subscribeSymbol;
        this.trackSymbol(list, SUBSCRIBE);
      }
    );
  };

  setUnsubscribeListener = () => {
    reaction(
      () => this.props.common.unSubscribeSymbol,
      (unSubscribeSymbol) => {
        const { list } = unSubscribeSymbol;
        this.trackSymbol(list, UNSUBSCRIBE);
      }
    );
  };

  setSelectedSymbolTypeInfoListener = () => {
    reaction(
      () => this.props.common.selectedSymbolTypeInfo,
      (selectedSymbolTypeInfo) => {
        const { code } = selectedSymbolTypeInfo;
        this.replaceWSUrl(code);
      }
    );
  };

  setWSActionListener = () => {
    reaction(
      () => this.props.common.symbolWSAction,
      (symbolWSAction) => {
        const { cmd } = symbolWSAction;
        const { startWS, closeWS, reconnectWS } = this.props;
        switch (cmd) {
          case START:
            startWS();
            break;
          case CLOSE:
            closeWS();
            break;
          case RESTART:
            reconnectWS();
            break;
        }
        //this.trackSymbol(list, "unsubscribe");
      }
    );
  };

  trackSymbol = (currentList, type) => {
    const o = {
      type: type,
      data: {
        symbol_ids: currentList,
      },
    };

    this.props.sendMsg(o);
  };

  replaceWSUrl = (code) => {
    let tarUrl = "";
    switch (code) {
      case "self":
        tarUrl = "self-select-symbol";
        break;
      default:
        tarUrl = `${code}/symbol`;
        break;
    }
    this.props.replaceUrl(tarUrl);
  };

  checkIdExist = (list, id) => {
    if (list.length === 0 || id === null) return false;

    const findId = list.findIndex((item) => {
      return item.symbol === id;
    });

    if (findId === -1) {
      return false;
    }

    return true;
  };
}

export default WSConnect(channelConfig[0], channelConfig, Symbol);
