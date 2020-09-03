import React from "react";
import { inject, observer } from "mobx-react";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import moment from "moment";
import Dom7 from "dom7";
import "../index.scss";
import {
  STANDBY, //啟動ws之前
  CONNECTING, //已開通通路，未接收到訊息
  CONNECTED, //已接收到訊息
  DISCONNECTED, //斷線
  RECONNECT, //斷線重新連線
  ERROR, //
} from "utils/WebSocketControl/status";
import utils from "utils";

import OnePriceItem from "./OnePriceItem";
import TwoPriceItem from "./TwoPriceItem";

const $$ = Dom7;

@inject("common", "market")
@observer
export default class extends React.Component {
  state = {
    dataLoading: this.props.dataLoading,
    currentSymbolType: this.props.currentSymbolType,
  };

  buffer = {};

  constructor(props) {
    super(props);
    this.buffer = this.initBuffer();
  }
  componentDidMount() {
    this.props.setReceviceMsgLinter(this.receviceMsgLinter);
  }

  componentDidUpdate() {
    const { nextSymbolIDList, prevSymbolIDList } = this.props.market;
    if (this.state.currentSymbolType !== "自选") {
      if (!utils.isEmpty(prevSymbolIDList)) {
        this.trackSymbol(prevSymbolIDList, "unsubscribe");
      }
      this.trackSymbol(nextSymbolIDList, "subscribe");
    }
  }

  trackSymbol = (currentList, type) => {
    const o = {
      type: type,
      data: {
        symbol_ids: currentList,
      },
    };

    console.log(o);
    this.props.sendMsg(o);
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.dataLoading !== this.state.dataLoading) {
      this.setState({ dataLoading: nextProps.dataLoading });
    }
    if (nextProps.currentSymbolType !== this.state.currentSymbolType) {
      this.setState({ currentSymbolType: nextProps.currentSymbolType });
    }
  }

  receviceMsgLinter = (d) => {
    const { data } = d;

    const { buffer } = this;
    const { timeId, BUFFER_TIME, list } = buffer;
    const receviceTime = moment().valueOf();
    buffer.list = [...list, ...data];

    if (timeId) window.clearTimeout(timeId);
    if (!this.checkBuffer(buffer, receviceTime)) {
      buffer.timeId = window.setTimeout(() => {
        this.updateContent(buffer);
      }, BUFFER_TIME);
      return;
    }

    this.updateContent(buffer);
  };

  checkBuffer(buffer, receviceTime) {
    const { list, lastCheckUpdateTime, BUFFER_MAXCOUNT, BUFFER_TIME } = buffer;
    let maxCount = list.length;

    if (
      receviceTime - lastCheckUpdateTime >= BUFFER_TIME ||
      maxCount >= BUFFER_MAXCOUNT
    )
      return true;
    else return false;
  }

  updateContent = (buffer) => {
    const { currentSymbolType } = this.state;
    const {
      selfSelectSymbolList,
      symbolList,
      updateCurrentSymbolList,
    } = this.props.market;
    const currentList =
      currentSymbolType === "自选" ? selfSelectSymbolList : symbolList;
    const { list } = buffer;
    const newList = this.sortList(list);
    buffer.list = this.filterBufferlList(newList);

    updateCurrentSymbolList(buffer.list, currentList, currentSymbolType);

    this.buffer = this.initBuffer();
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

  initBuffer() {
    return {
      BUFFER_MAXCOUNT: 50,
      BUFFER_TIME: 2000,
      timeId: 0,
      lastCheckUpdateTime: moment().valueOf(),
      list: [],
    };
  }

  render() {
    const { thisRouter, quoted_price } = this.props;
    const { selfSelectSymbolList, symbolList } = this.props.market;
    const { currentSymbolType, dataLoading } = this.state;
    const currentList =
      currentSymbolType === "自选" ? selfSelectSymbolList : symbolList;
    const PirceItem = this.getProductItem(quoted_price);
    return (
      <>
        {currentList.map((item) => {
          return (
            <PirceItem
              thisRouter={thisRouter}
              currentSymbolType={currentSymbolType}
              item={item}

            />
          );
        })}

        {/* {
      currentSymbolType !== "自选" && currentSymbolType !== "外汇" &&
      <>
        <div className="hot-stock-market">热门股票</div>
        <div className="self-select-tr">
          <div className="item-main-info">
            <div className="self-select-name">新创建集团</div>
            <div className="self-select-buy-sell-block self-select-buy-block p-down">
              6.15
              </div>
            <div className="self-select-buy-sell-block self-select-sell-block p-up">
              6.15
              </div>
          </div>
          <div className="item-sub-info">
            <div className="self-select-code">
              <span className="symbol-type-code">US</span>
              <span className="symbol-code">BILI</span>
            </div>
          </div>
        </div>
      </>
    } */}
        {dataLoading && (
          <Spin
            className="spin-icon"
            indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
          />
        )}
      </>
    );
  }
  getProductItem = (priceType) => {
    if (priceType === "one_price") {
      return OnePriceItem;
    } else {
      return TwoPriceItem;
    }
  };

}
