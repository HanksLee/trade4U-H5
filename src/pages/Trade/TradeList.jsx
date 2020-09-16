import React from "react";
import { BaseReact } from "components/baseComponent";

import { Modal, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { Toast } from "antd-mobile";
import moment from "moment";
import { inject, observer } from "mobx-react";
import "./index.scss";
import { tradeActionMap } from "constant";
import utils from "utils";
import Dom7 from "dom7";
import {
  META_FUND,
  ORDER_OPEN,
  ORDER_CLOSE,
  ORDER_PROFIT,
  PENDING_ORDER_CLOSE,
} from "./config/wsType";

const $$ = Dom7;

@inject("common", "trade")
@observer
export default class extends BaseReact {
  buffer = null;
  $event = null;
  state = {
    loading: false,
    effect: null,
    activeItem: undefined,
    currentTradeTab: this.props.currentTradeTab,
    tapIndex: -1,
    error: false,
    hasMore: true,
    dataLoading: false,
    page_size: 20,
    page: 1,
    historyList: [],
  };

  constructor(props) {
    super(props);
    this.buffer = this.initBuffer();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.currentTradeTab !== this.state.currentTradeTab) {
      this.setState(
        {
          currentTradeTab: nextProps.currentTradeTab,
          page: 1,
        },
        () => {
          this.onRefresh(nextProps.currentTradeTab);
        }
      );

      if (nextProps.currentTradeTab === "历史") {
        window.addEventListener("scroll", this.handleScroll, true);
      } else {
        window.removeEventListener("scroll", this.handleScroll, true);
      }
    }
  }

  componentDidMount() {
    const { setReceviceMsgLinter, setStatusChangListener } = this.props;
    const { currentTradeTab } = this.state;
    this.initEvents(currentTradeTab);
    this.initData(currentTradeTab);
    // this.connectWebsocket();
    setReceviceMsgLinter(this.receviceMsgLinter);
    // setStatusChangListener(this.statusChangListener);

  }

  componentDidUpdate(prevProps, prevState) {
    this.initBuffer();
  }

  setTradeContentHeight = () => {
    // page
    const pageHeight = document.getElementById("view-trade").clientHeight;
    const tradeNavbarHeight = document.getElementsByClassName("trade-navbar")[0]
      .clientHeight;
    const tabbarHeight = document.getElementsByClassName("app-tabbar")[0]
      .clientHeight;
    const tradeStatsHeight = document.getElementsByClassName("trade-stats")[0]
      .clientHeight;
    const tradeTabsHeight = document.getElementsByClassName("trade-tabs")[0]
      .clientHeight;
    const tradeContentTitleHeight = document.getElementsByClassName(
      "trade-content-title"
    )[0].clientHeight;

    const tradeContentContentHeight =
      pageHeight -
      tradeNavbarHeight -
      tradeStatsHeight -
      tradeTabsHeight -
      tradeContentTitleHeight -
      tabbarHeight;

    document.getElementsByClassName(
      "trade-content-content"
    )[0].style.height = `${tradeContentContentHeight}px`;
  };

  initEvents = (currentTradeTab) => {
    this.props.common.globalEvent.on("refresh-trade-page", () => {
      this.onRefresh(currentTradeTab);
    });
  };

  initData = (currentTradeTab) => {
    if (this.state.loading) return;

    this.onRefresh(currentTradeTab);
  };

  handleScroll = () => {
    const { error, hasMore, dataLoading, currentTradeTab } = this.state;

    // Bails early if:
    // * there's an error
    // * it's already loading
    // * there's nothing left to load
    if (error || dataLoading || !hasMore) return;
    let scrollTop = $$(".trade-content-content")[0].scrollTop;
    let scrollHeight = $$(".trade-content-content")[0].scrollHeight;

    // Checks that the page has scrolled to the bottom
    if (window.innerHeight + scrollTop >= scrollHeight) {
      this.initData(currentTradeTab);
    }
  };

  goToPage = (url, opts = {}) => {
    this.props.thisRouter.navigate(url, opts);
  };

  updateTradeInfo = (tradeInfo) => {
    let payload = {};
    const { tradeList, setTradeInfo } = this.props.trade;
    if (utils.isEmpty(tradeInfo)) {
      payload = {
        balance: this.props.trade.tradeInfo.balance,
        margin: this.props.trade.tradeInfo.margin,
      };
    } else {
      payload = {
        balance: tradeInfo.balance,
        margin: tradeInfo.margin,
      };
    }
    payload.profit = tradeList.reduce((acc, cur) => acc + cur.profit, 0);
    payload.equity =
      tradeList.reduce((acc, cur) => acc + cur.profit, 0) + payload.balance;
    payload.free_margin = payload.equity - payload.margin;
    payload.margin_level = (payload.equity / payload.margin) * 100;

    setTradeInfo(payload);
  };

  onRefresh = async (currentTradeTab) => {
    this.setTradeContentHeight();
    this.setState(
      {
        loading: true,
      },
      async () => {
        try {
          const { page, page_size, historyList, dataLoading } = this.state;
          // console.log(this)
          const res = await this.$api.trade.getTradeInfo();
          let tradeInfo = {
            balance: res.data.balance,
            // equity: 1014404.86, // 净值
            margin: res.data.margin, // 预付款
            // free_margin: 1014399.22, // 可用预付款
            // margin_level: 18017848.22, // 预付款比例
          };

          if (currentTradeTab === "持仓") {
            const res = await this.$api.trade.getTradeList({
              params: {
                status: "in_transaction",
              },
            });

            this.props.trade.setTradeList(res.data);
            this.updateTradeInfo(tradeInfo);
          }

          if (currentTradeTab === "挂单") {
            const res = await this.$api.trade.getTradeList({
              params: {
                status: "pending",
              },
            });

            this.props.trade.setTradeList(res.data, "future");
            this.updateTradeInfo(tradeInfo);
          }

          if (currentTradeTab === "历史") {
            this.setState({ dataLoading: true }, async () => {
              let queryString = `page_size=${page_size}&page=${page}`;
              const res = await this.$api.trade.getFinishTradeList(
                queryString,
                {}
              );
              if (res.status === 200) {
                this.setState(
                  {
                    dataLoading: false,
                    historyList: [...historyList, ...res.data.results],
                    page: page + 1,
                  },
                  () => {
                    const { historyList } = this.state;
                    this.setState({
                      hasMore: this.state.historyList.length < res.data.count,
                    });
                    this.props.trade.setTradeList(historyList, "finish");
                    this.props.trade.setFinishTradeInfo(res.data.total_data);
                  }
                );
              }
            });
          }
        } catch (e) { }

        this.setState({ loading: false });
      }
    );
  };

  receviceMsgLinter = (d) => {
    const { currentTradeTab } = this.state;
    const { buffer } = this;
    const { timeId, BUFFER_TIME } = buffer;

    if (currentTradeTab === "历史") {
      if (timeId) window.clearTimeout(timeId);
      return;
    }

    const receviceTime = moment().valueOf();
    //console.log("setReceviceMsgLinter" , d);
    const { type, data } = d;

    if (type === META_FUND) {
      buffer[META_FUND] = data;
    } else if (
      type === ORDER_PROFIT ||
      type === ORDER_OPEN ||
      type === ORDER_CLOSE ||
      type === PENDING_ORDER_CLOSE
    ) {
      buffer[type] = [...buffer[type], ...data];
    }

    // 檢查buffer 是否有滿足更新畫面條件，沒有的話，延遲 BUFFER_TIME 定義的時間執行
    if (timeId) window.clearTimeout(timeId);
    if (!this.checkBuffer(buffer, currentTradeTab, receviceTime)) {
      buffer.timeId = window.setTimeout(() => {
        this.updateContent(buffer);
      }, BUFFER_TIME);
      return;
    }

    this.updateContent(buffer);
  };

  checkBuffer(buffer, key, receviceTime) {
    const { lastCheckUpdateTime, BUFFER_MAXCOUNT, BUFFER_TIME } = buffer;
    let maxCount = 0;
    switch (key) {
      case "持仓":
        maxCount =
          buffer[ORDER_PROFIT].length +
          buffer[ORDER_OPEN].length +
          buffer[ORDER_CLOSE].length;
        break;
      case "挂单":
        maxCount = buffer[PENDING_ORDER_CLOSE].length;
        break;
    }

    if (
      receviceTime - lastCheckUpdateTime >= BUFFER_TIME ||
      maxCount >= BUFFER_MAXCOUNT
    )
      return true;
    else return false;
  }

  filterBufferlList(list) {
    return list.filter((item, i, all) => {
      return (
        all.findIndex((fItem) => {
          return fItem.order_number === item.order_number;
        }) === i
      );
    });
  }

  updateContent = (buffer) => {
    for (let key in buffer) {
      const value = buffer[key];

      if (
        key === META_FUND ||
        key === ORDER_CLOSE ||
        key === PENDING_ORDER_CLOSE
      )
        continue;
      const list = this.sortOrderList(value);
      buffer[key] = this.filterBufferlList(list);
    }

    this.props.trade.updateTrade(buffer);

    this.buffer = this.initBuffer();
    // const {initMsg} = this.props;
  };

  sortOrderList = (list) => {
    const tmp = Object.assign([], list);

    tmp.sort((a, b) => {
      if (a.order_number !== b.order_number) {
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
      [META_FUND]: null,
      [ORDER_OPEN]: [],
      [ORDER_CLOSE]: [],
      [ORDER_PROFIT]: [],
      [PENDING_ORDER_CLOSE]: [],
    };
  }

  render() {
    const { tapIndex, currentTradeTab, dataLoading } = this.state;
    const { tradeList, futureTradeList, finishTradeList } = this.props.trade;
    const initSymbol = utils.isEmpty(tradeList) ? 0 : tradeList[0]?.symbol;
    const { getKeyConfig } = this.props.common;
    const refCurrency = getKeyConfig("platform_currency");
    const refCurrencyIcon = refCurrency === 'CNY'
      ? '￥'
      : refCurrency === 'USD' ? '＄' : 'HK';
    const currentTradeList =
      currentTradeTab === "持仓"
        ? tradeList
        : currentTradeTab === "挂单"
          ? futureTradeList
          : finishTradeList;
    return (
      <div
        className={`trade-content-content ${
          currentTradeTab === "历史" && "history-mode"
          }`}
      >
        {!utils.isEmpty(currentTradeList) &&
          currentTradeList.map((item, index) => (
            <div className="trade-content-item">
              <div
                className="trade-content-content-top"
                onClick={() => {
                  this.setState({
                    tapIndex:
                      tapIndex == item.order_number ? -1 : item.order_number,
                  });
                }}
              >
                <div className="trade-content-content-top-item">
                  <p className="content-text" style={{ fontSize: item?.symbol_name?.length >= 6 && '1px' }}>{item.symbol_name}</p>
                  <p>
                    <span className="symbol-type-code">
                      {item.product_market}
                    </span>
                    <span className="symbol-code" style={{ fontSize: item?.product_code?.length >= 6 && '10px' }}>{item.product_code}</span>
                  </p>
                </div>
                <div className="trade-content-content-top-item">
                  <p className="content-text">{item.new_price}</p>
                </div>
                <div className="trade-content-content-top-item">
                  <p
                    className={`transaction-direction 
                ${
                      Number(item.action) === 0 ||
                        Number(item.action) === 2 ||
                        Number(item.action) === 4
                        ? "buy"
                        : "sell"
                      }`}
                  >
                    {tradeActionMap[item.action]}
                  </p>
                  <p>{item.lots}</p>
                </div>
                <div className="trade-content-content-top-item">
                  <p
                    className={`${Number(item.profit) > 0 ? "p-up" : "p-down"}`}
                  >
                    {item.profit}
                  </p>
                </div>
              </div>
              <div
                className={`trade-content-content-bottom ${
                  tapIndex == item.order_number ? "show" : ""
                  }`}
              >
                <div className="trade-content-content-bottom-data">
                  <p>开仓价</p>
                  <p>{item.open_price}</p>
                  {currentTradeTab === "历史" && (
                    <>
                      <p>平仓价</p>
                      <p>{item.close_price}</p>
                    </>
                  )}
                  <p>买入股数</p>
                  <p>{item.lots}</p>
                  <p>止盈</p>
                  <p>{item.take_profit || "-"}</p>
                  <p>止損</p>
                  <p>{item.stop_loss || "-"}</p>
                  <p>盈亏</p>
                  <p>{refCurrencyIcon}{item.profit}</p>
                  <p>库存费</p>
                  <p>{item.swaps || "-"}</p>
                  <p>手续费</p>
                  <p>{refCurrencyIcon}{item.fee || "-"}</p>
                  <p>税费</p>
                  <p>{item.taxes || "-"}</p>
                  <p>开仓时间</p>
                  <p>
                    <div>
                      {moment(item.create_time * 1000).format("YYYY.MM.DD")}
                    </div>
                    <div>
                      {moment(item.create_time * 1000).format("HH:mm:ss")}
                    </div>
                  </p>
                  {currentTradeTab === "历史" && (
                    <>
                      <p>平仓时间</p>
                      <p>
                        <div>
                          {moment(item.close_time * 1000).format("YYYY.MM.DD")}
                        </div>
                        <div>
                          {moment(item.close_time * 1000).format("HH:mm:ss")}
                        </div>
                      </p>
                    </>
                  )}
                  <p>订单号</p>
                  <p className="order-number">{item.order_number}</p>
                </div>
                {currentTradeTab === "持仓" && (
                  <div className="trade-content-content-bottom-btn-group">
                    <div
                      className="trade-content-content-bottom-btn"
                      onClick={async () => {
                        const id = item.symbol;
                        const symbol = item.product_code;
                        await this.props.trade.setCurrentTrade(item);
                        await this.props.common.setSelectedSymbolId(item.product_market, {
                          id,
                          symbol
                        });
                        this.goToPage(`/trade/${item?.symbol}/`, {
                          props: {
                            mode: "update",
                            currentTradeTab,
                          },
                        });
                      }}
                    >
                      修改
                    </div>
                    <div
                      className="trade-content-content-bottom-btn"
                      onClick={async () => {
                        const id = item.symbol;
                        const symbol = item.product_code;
                        await this.props.trade.setCurrentTrade(item);
                        await this.props.common.setSelectedSymbolId(item.product_market, {
                          id,
                          symbol
                        });
                        this.goToPage(`/trade/${item?.symbol}/`, {
                          props: {
                            mode: "delete",
                            currentTradeTab,
                          },
                        });
                      }}
                    >
                      平仓
                    </div>
                    {item?.product_market !== "MT" && (
                      <div
                        style={{
                          pointerEvents: !item?.swap_switch && "none",
                          opacity: !item?.swap_switch && "0.5",
                        }}
                        className="trade-content-content-bottom-btn"
                        onClick={() => {
                          const { confirm } = Modal;
                          const that = this;
                          confirm({
                            title: "关闭递延提示",
                            content: (<p>您確定要关闭递延嗎<br />将于下一个交易日16:00自动卖出</p>),
                            className: "trade-modal",
                            centered: true,
                            cancelText: "取消",
                            okText: "确认",
                            async onOk() {
                              await that.props.common.$api.trade.updateTrade(
                                item.order_number,
                                {
                                  swap_switch: false,
                                }
                              );
                              Toast.success("关闭递延成功", 2);
                              await that.onRefresh(currentTradeTab);
                            },
                            onCancel() { },
                          });
                        }}
                      >
                        关闭递延
                      </div>
                    )}
                  </div>
                )}
                {currentTradeTab === "挂单" && (
                  <div className="trade-content-content-bottom-btn-group">
                    <div
                      className="trade-content-content-bottom-btn"
                      onClick={() => {
                        this.props.trade.setCurrentTrade(item);
                        this.goToPage(`/trade/${item?.symbol}/`, {
                          props: {
                            mode: "update",
                            currentTradeTab,
                          },
                        });
                      }}
                    >
                      修改
                    </div>
                    <div
                      className="trade-content-content-bottom-btn"
                      onClick={() => {
                        // this.props.trade.setCurrentTrade(item);
                        // this.goToPage(`/trade/${item?.symbol}/`, {
                        //   props: {
                        //     mode: "delete",
                        //     currentTradeTab
                        //   },
                        // })
                        const { confirm } = Modal;

                        const that = this;
                        confirm({
                          title: "提示",
                          content: "您確定要删单嗎",
                          className: "trade-modal",
                          centered: true,
                          cancelText: "取消",
                          okText: "确认",
                          async onOk() {
                            await that.props.common.$api.trade.closeTrade(
                              item.order_number
                            );
                            Toast.success("删单成功", 2);
                            await that.onRefresh(currentTradeTab);
                          },
                          onCancel() { },
                        });
                      }}
                    >
                      删单
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        {currentTradeTab === "历史" && dataLoading && (
          <Spin
            className="spin-icon"
            indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
          />
        )}
      </div>
    );
  }
}
