import React from 'react';
import { inject, observer } from "mobx-react";
import { Spin } from 'antd';
import { LoadingOutlined } from "@ant-design/icons";
import moment from 'moment';
import Dom7 from 'dom7';
import '../index.scss';
import {
  STANDBY, //啟動ws之前
  CONNECTING, //已開通通路，未接收到訊息
  CONNECTED, //已接收到訊息
  DISCONNECTED, //斷線
  RECONNECT, //斷線重新連線
  ERROR //
} from "utils/WebSocketControl/status";

const $$ = Dom7;

@inject("common", "market")
@observer
export default class extends React.Component {

  state = {
    dataLoading: this.props.dataLoading,
    currentSymbolType: this.props.currentSymbolType
  }

  buffer = {};

  constructor(props) {
    super(props)
    this.buffer = this.initBuffer();
  }
  componentDidMount() {
    this.props.setReceviceMsgLinter(this.receviceMsgLinter)

  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.dataLoading !== this.state.dataLoading) {
      this.setState({ dataLoading: nextProps.dataLoading })
    }
    if (nextProps.currentSymbolType !== this.state.currentSymbolType) {
      this.setState({ currentSymbolType: nextProps.currentSymbolType })
    }
  }

  receviceMsgLinter = d => {
    const { data, } = d;

    const { buffer, } = this;
    const { timeId, BUFFER_TIME, list, } = buffer;
    const receviceTime = moment().valueOf();
    buffer.list = [
      ...list,
      ...data
    ];

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
    const { list, lastCheckUpdateTime, BUFFER_MAXCOUNT, BUFFER_TIME, } = buffer;
    let maxCount = list.length;

    if (
      receviceTime - lastCheckUpdateTime >= BUFFER_TIME ||
      maxCount >= BUFFER_MAXCOUNT
    )
      return true;
    else return false;
  }

  updateContent = buffer => {
    const { currentSymbolType } = this.state;
    const { selfSelectSymbolList, symbolList, updateCurrentSymbolList } = this.props.market;
    const currentList = currentSymbolType === "自选" ? selfSelectSymbolList : symbolList;
    const { list, } = buffer;
    const newList = this.sortList(list);
    buffer.list = this.filterBufferlList(newList);

    updateCurrentSymbolList(buffer.list, currentList, currentSymbolType);

    this.buffer = this.initBuffer();
  };

  filterBufferlList(list) {
    return list.filter((item, i, all) => {
      return (
        all.findIndex(fItem => {
          return fItem.symbol === item.symbol;
        }) === i
      );
    });
  }

  sortList = list => {
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
    console.log(this.props.market.selfSelectSymbolList)
    // console.log(this)
    // console.log(this.props)
    const { thisRouter } = this.props
    const { selfSelectSymbolList, symbolList } = this.props.market;
    const { currentSymbolType, dataLoading } = this.state;
    const currentList = currentSymbolType === "自选" ? selfSelectSymbolList : symbolList;
    return (
      <>
        {
          currentList.map(item => {
            return (
              <div className="self-select-tr" key={item.symbol} data-id={item.id}
                onClick={() => {
                  thisRouter.navigate(`/market/symbol/${item.id}`, {
                    props: {
                      currentSymbol: item,
                      currentSymbolType
                    }
                  })
                }}
              >
                {/* <div>
              <div className="self-select-buy-sell-block self-select-buy-block">
                {item.product_details.buy ? this.addSpecialStyle(item.product_details.sell) : '--'}
              </div>
              <div className="self-select-low">
                最低:{item.product_details.low ? item.product_details.low : '--'}
              </div>
            </div>
            <div>
              <div className="self-select-buy-sell-block self-select-sell-block">
                {item.product_details.sell ? this.addSpecialStyle(item.product_details.buy) : '--'}
              </div>
              <div className="self-select-high">
                最高:{item.product_details.high ? item.product_details.high : '--'}
              </div>
            </div> */}
                <div className="item-main-info">
                  <div className="self-select-name">{item?.symbol_display?.name}</div>
                  <div className="self-select-buy-sell-block self-select-buy-block p-down">
                    {item?.product_details?.buy}
                  </div>
                  <div className="self-select-buy-sell-block self-select-sell-block p-up">
                    {item?.product_details?.sell}
                  </div>
                </div>
                <div className="item-sub-info">
                  <div className="self-select-code">{item?.symbol_display?.product_display?.code}</div>
                  <div className="self-select-spread">
                    點差:{item?.symbol_display?.spread}
                  </div>
                </div>
              </div>
            )
          })
        }
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
        {
          (dataLoading && <Spin
            className="spin-icon"
            indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
          />
          )}
      </>
    );
  }
}
