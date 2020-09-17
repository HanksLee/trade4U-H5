import React from "react";
import { inject, observer } from "mobx-react";
import { reaction } from "mobx";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import moment from "moment-timezone";
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
export default class ProductList extends React.Component {
  state = {
    dataLoading: this.props.dataLoading,
    currentSymbolType: this.props.currentSymbolType,
  };

  constructor(props) {
    super(props);
    this.setUpdateListListener();
  }
  componentDidMount() {
    // this.props.setReceviceMsgLinter(this.receviceMsgLinter);
  }

  componentDidUpdate(prevProps, prevState) {
    const { nextSymbolIDList, prevSymbolIDList } = this.props.market;

    // if (this.state.currentSymbolType !== "自选") {
    //   if (!utils.isEmpty(prevSymbolIDList)) {
    //     this.props.common.setUnSubscribeSymbol({list:prevSymbolIDList})
    //     // this.trackSymbol(prevSymbolIDList, "unsubscribe");
    //   }
    //   this.props.common.setSubscribeSymbol({list:nextSymbolIDList})
    //   // this.trackSymbol(nextSymbolIDList, "subscribe");
    // }
  }

  trackSymbol = (currentList, type) => {
    const o = {
      type: type,
      data: {
        symbol_ids: currentList,
      },
    };

    // console.log(o);
    // this.props.sendMsg(o);
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.dataLoading !== this.state.dataLoading) {
      this.setState({ dataLoading: nextProps.dataLoading });
    }
    if (nextProps.currentSymbolType !== this.state.currentSymbolType) {
      this.setState({ currentSymbolType: nextProps.currentSymbolType });
    }
  }

  // receviceMsgLinter = (d) => {
  //   //this.updateContent(d);

  // };

  setUpdateListListener = () => {
    const { subscribeSymbolList } = this.props.common;
    reaction(
      () => this.props.common.subscribeSymbolList,
      (subscribeSymbolList) => {
        this.updateContent(subscribeSymbolList);
      }
    );
  };

  updateContent = (list) => {
    const { currentSymbolType } = this.state;
    const {
      selfSelectSymbolList,
      symbolList,
      updateCurrentSymbolList,
    } = this.props.market;
    const currentList =
      currentSymbolType === "自选" ? selfSelectSymbolList : symbolList;

    const sortList = this.sortList(list);
    const filterList = this.filterBufferlList(sortList);

    updateCurrentSymbolList(filterList, currentList, currentSymbolType);
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

  render() {
    // console.log(this.props.market.selfSelectSymbolList)
    // console.log(this)
    // console.log(this.props)
    // console.log("this.$f7router :>> ", this.$f7router);
    const {
      thisRouter,
      quoted_price,
      thisStore,
      symbol_type_code,
    } = this.props;
    const { selfSelectSymbolList, symbolList } = this.props.market;
    const { currentSymbolType, dataLoading } = this.state;
    const currentList =
      currentSymbolType === "自选" ? selfSelectSymbolList : symbolList;
    const PriceItem = this.getProductItem(quoted_price);
    const testTimestamp = {
      color: "#FFF",
      padding: "10px",
    };
    return (
      <>
        {currentList.map((item, index) => {
          return (
            <React.Fragment key={index}>
              <PriceItem
                key={`item-${index}`}
                thisRouter={thisRouter}
                currentSymbolType={currentSymbolType}
                currentSymbolTypeCode={symbol_type_code}
                item={item}
                thisStore={thisStore}
              />
              <div style={testTimestamp} key={`time-${index}`}>
                {moment(item.product_details?.timestamp * 1000).format(
                  "YYYY/MM/DD hh:mm:ss"
                )}
              </div>
            </React.Fragment>
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
