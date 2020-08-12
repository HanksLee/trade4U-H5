import React from "react";
import { BaseReact } from "components/baseComponent";
import {
  List,
  ListItem,
  Icon,
  Row,
  Col,
  SwipeoutActions,
  SwipeoutButton,

} from "framework7-react";
import { Modal } from 'antd';
import { Toast } from 'antd-mobile';
import moment from "moment";
import { inject, observer } from "mobx-react";
import "./index.scss";
import ws from "utils/ws";
import { tradeActionMap, tradeTabOptions } from "constant";
import utils from "utils";
import Dom7 from "dom7";

const $$ = Dom7;

@inject("common", "trade")
@observer
export default class extends BaseReact {
  wsConnect = null;
  $event = null;
  state = {
    loading: false,
    effect: null,
    activeItem: undefined,
    currentTradeTab: this.props.currentTradeTab,
    tapIndex: -1
  };

  // constructor() {
  //   super();
  //
  // }

  componentWillReceiveProps(nextProps) {
    if (nextProps.currentTradeTab !== this.state.currentTradeTab) {
      this.setState({
        currentTradeTab: nextProps.currentTradeTab,
      })
      this.onRefresh(nextProps.currentTradeTab)
    }
  }

  componentDidMount() {
    const { currentTradeTab } = this.state;
    // this.initEvents();
    this.initData(currentTradeTab);
    // this.connectWebsocket();
  }

  // initEvents = () => {
  //   this.props.common.globalEvent.on("refresh-trade-page", () => {
  //     this.onRefresh();
  //   });
  // };

  initData = (currentTradeTab) => {
    if (this.state.loading) return;

    this.onRefresh(currentTradeTab);
  };

  // updateTradeInfo = (tradeInfo) => {
  //   let payload = {};
  //   const { tradeList, setTradeInfo } = this.props.trade;
  //   if (utils.isEmpty(tradeInfo)) {
  //     payload = {
  //       balance: this.props.trade.tradeInfo.balance,
  //       margin: this.props.trade.tradeInfo.margin,
  //     };
  //   } else {
  //     payload = {
  //       balance: tradeInfo.balance,
  //       margin: tradeInfo.margin,
  //     };
  //   }
  //   payload.profit = tradeList.reduce((acc, cur) => acc + cur.profit, 0);
  //   payload.equity =
  //     tradeList.reduce((acc, cur) => acc + cur.profit, 0) + payload.balance;
  //   payload.free_margin = payload.equity - payload.margin;
  //   payload.margin_level = (payload.equity / payload.margin) * 100;

  //   setTradeInfo(payload);
  // };

  // connectWebsocket = () => {
  //   const that = this;
  //   if (this.wsConnect == null) {
  //     this.wsConnect = ws("order");
  //   }

  //   // setInterval(function () {
  //   //   that.wsConnect.send(`{"type":"ping"}`);
  //   // }, 3000)

  //   const { setTradeInfo, setTradeList } = this.props.trade;

  //   this.wsConnect.onmessage = (evt) => {
  //     const msg = JSON.parse(evt.data);
  //     if (msg.type === 'pong') {
  //       clearInterval(this.orderInterval);

  //       // 如果一定时间没有调用clearInterval，则执行重连
  //       this.orderInterval = setInterval(function () {
  //         that.connectWebsocket();
  //       }, 1000);
  //     }
  //     if (msg.type && msg.type !== 'pong') { // 消息推送
  //       // code ...      
  //       if (msg.type == "meta_fund") {
  //         this.updateTradeInfo({
  //           balance: msg.data.balance,
  //           margin: msg.data.margin,
  //         });
  //       } else {
  //         let list = cloneDeep(this.props.trade?.tradeList);
  //         let futureList = cloneDeep(this.props.trade?.futureTradeList);
  //         if (msg.type == "order_open") {
  //           list = [msg.data, ...list];
  //         } else if (msg.type == "order_profit") {
  //           list = list.map((item) => {
  //             if (
  //               item.order_number == msg.data.order_number &&
  //               msg.data.timestamp > item.timestamp
  //             ) {
  //               item = msg.data;
  //             }
  //             return item;
  //           });
  //         } else if (msg.type == "order_close") {
  //           list = list.filter(
  //             (item) => item.order_number != msg.data.order_number
  //           );
  //         } else if (msg.type == "pending_order_close") {
  //           futureList = futureList.filter(
  //             (item) => item.order_number != msg.data.order_number
  //           );
  //         }

  //         setTradeList(list);
  //         setTradeList(futureList, "future");
  //         this.updateTradeInfo({
  //           balance: this.props.trade.tradeInfo.balance,
  //           margin: this.props.trade.tradeInfo.margin,
  //         });
  //       }
  //     }

  //   };

  //   //this.wsConnect.onclose = (evt) => {
  //   //setInterval(function () { that.connectWebsocket() }, 3000)
  //   //}
  // };

  // componentWillUnmount = () => {
  //   if (this.wsConnect) {
  //     this.wsConnect.close();
  //   }
  // };

  goToPage = (url, opts = {}) => {
    // console.log(this)
    // this.$f7router.navigate(url, opts);
    this.props.thisRouter.navigate(url, opts);
  };

  // bindEvents = () => {
  //   this.$f7.$(".transaction-btn").on("click", (evt) => {
  //     evt.stopPropagation();
  //     const { tradeList, futureTradeList } = this.props.trade;
  //     const dom = this.$f7.$(evt.target).parents(".media-item")[0];
  //     if (dom != null) {
  //       const currentTrade =
  //         (tradeList?.find((item) => item.order_number == dom.id) ||
  //           futureTradeList.find((item) => item.order_number == dom.id)) ??
  //         {};

  //       this.props.trade.setCurrentTrade(currentTrade);

  //       this.setState(
  //         {
  //           longTapIndex: dom.id,
  //         },
  //         () => {
  //           this.refs.actionsGroup.open();
  //         }
  //       );
  //     }
  //   });
  //   this.$f7.$(".trade-list-in-transaction").on("taphold", (evt) => {
  //     const { tradeList, futureTradeList } = this.props.trade;
  //     console.log('evt', evt.target);
  //     const dom = this.$f7.$(evt.target).parents(".media-item")[0];
  //     if (dom != null) {
  //       const currentTrade =
  //         (tradeList?.find((item) => item.order_number == dom.id) ||
  //           futureTradeList.find((item) => item.order_number == dom.id)) ??
  //         {};

  //       this.props.trade.setCurrentTrade(currentTrade);

  //       this.setState(
  //         {
  //           longTapIndex: dom.id,
  //         },
  //         () => {
  //           this.refs.actionsGroup.open();
  //         }
  //       );
  //     }
  //   });

  //   this.$f7.$(".trade-list-pending").on("taphold", (evt) => {
  //     const { tradeList, futureTradeList } = this.props.trade;
  //     console.log('evt', evt.target);

  //     const dom = this.$f7.$(evt.target).parents(".media-item")[0];
  //     if (dom != null) {
  //       const currentTrade =
  //         (tradeList?.find((item) => item.order_number == dom.id) ||
  //           futureTradeList.find((item) => item.order_number == dom.id)) ??
  //         {};

  //       this.props.trade.setCurrentTrade(currentTrade);

  //       this.setState(
  //         {
  //           longTapIndex: dom.id,
  //         },
  //         () => {
  //           this.refs.actionsGroup.open();
  //         }
  //       );
  //     }
  //   });
  // };

  onRefresh = async (currentTradeTab) => {
    this.setState(
      {
        loading: true,
      },
      async () => {
        try {
          // await this.props.trade.getTradeInfo();
          // const res = await this.$api.trade.getTradeInfo();
          // let tradeInfo = {
          //   balance: res.data.balance,
          //   // equity: 1014404.86, // 净值
          //   margin: res.data.margin, // 预付款
          //   // free_margin: 1014399.22, // 可用预付款
          //   // margin_level: 18017848.22, // 预付款比例
          // };
          // const res2 = await Promise.all([
          //   this.$api.trade.getTradeList({
          //     params: {
          //       status: "in_transaction",
          //     },
          //   }),
          //   this.$api.trade.getTradeList({
          //     params: {
          //       status: "pending",
          //     },
          //   }),
          // ]);

          if (currentTradeTab === '持仓') {
            const res = await this.$api.trade.getTradeList({
              params: {
                status: "in_transaction"
              }
            })

            this.props.trade.setTradeList(res.data);
          }

          if (currentTradeTab === '挂单') {
            const res = await this.$api.trade.getTradeList({
              params: {
                status: "pending"
              }
            })

            this.props.trade.setTradeList(res.data, "future");
          }

          if (currentTradeTab === '历史') {
            const res = await this.$api.trade.getFinishTradeList({});
            this.props.trade.setTradeList(res.data.results, "finish");
            this.props.trade.setFinishTradeInfo(resTradeList.data.total_data);
          }



          // const list = res2.map((item) => item.data);
          // this.props.trade.setTradeList(res.data);
          // this.props.trade.setTradeList(list[1], "future");

          // this.updateTradeInfo(tradeInfo);
          // this.bindEvents();
          // console.log('list', $$('.trade-data'));
          //
          // $$('.trade-data').forEach(dom => {
          //   $$(`#${dom.id}`).on('taphold', evt => {
          //     console.log('evt', evt.target);
          //
          //   })
          // });
        } catch (e) {
          // this.$f7.toast.show({
          //   text: e.response.data.message,
          //   position: "center",
          //   closeTimeout: 2000,
          // });
        }

        this.setState({ loading: false });
        // done && done();
      }
    );
  };

  renderTradeList = (tradeList, type) => {
    const { tapIndex, loading } = this.state;

    return (
      <List
        mediaList
        className={`trade-list-${
          type == "order" ? "in-transaction" : "pending"
          }`}
        style={{
          paddingBottom: type == "order" ? 0 : 80,
        }}
      >
        {tradeList.map((item, index) => (
          <ListItem
            id={item.order_number}
            key={item.order_number}
            swipeout
            className={`trade-data ${
              loading ? "skeleton-text skeleton-effect-blink" : ""
              }`}
            onSwipeoutOpen={() => {
              this.props.trade.setCurrentTrade(item);
            }}
            onClick={() => {
              this.setState({
                tapIndex: tapIndex == item.order_number ? -1 : item.order_number,
              });
            }}
          >
            <div slot={"title"} className={"trade-data-top"}>
              <div className="transaction-title">
                <strong>{item.symbol_name},</strong>
                <span className={`p-down`}>
                  {tradeActionMap[item.action]} {item.lots}
                </span>
              </div>
              <div className="transaction-btn">
                <span>交易</span>
              </div>
            </div>
            <div slot={"subtitle"} className={"trade-data-middle"}>
              <Row className={"align-items-center"}>
                <Col
                  width={"60"}
                  className={`${
                    item.profit > 0
                      ? "p-up"
                      : item.profit < 0
                        ? "p-down"
                        : "p-grey"
                    } trade-data-middle-current`}
                >
                  <p>{item.profit > 0 ? `+${item.profit}` : item.profit}</p>
                </Col>
                <Col width={"20"}>
                  <p>开仓</p>
                  <p className={"p-black"}>{item.open_price}</p>
                </Col>
                <Col width={"20"}>
                  <p>现价</p>
                  <p className={`p-black`}>{item.new_price}</p>
                </Col>
              </Row>
            </div>
            <div
              slot={"footer"}
              className={`trade-data-bottom ${
                tapIndex == item.order_number ? "active" : ""
                }`}
            >
              <Row>
                <Col width={"100"}>
                  {moment(item.create_time * 1000).format(
                    "YYYY.MM.DD HH:mm:ss"
                  )}
                </Col>
              </Row>
              <Row>
                <Col width={"50"}>
                  <Row className={"justify-content-space-between"}>
                    <span>止损：</span>
                    <span>{item.stop_loss || "-"}</span>
                  </Row>
                </Col>
                <Col width={"50"}>
                  <Row className={"justify-content-space-between"}>
                    <span>库存费：</span>
                    <span>{item.swaps || "-"}</span>
                  </Row>
                </Col>
              </Row>
              <Row>
                <Col width={"50"}>
                  <Row className={"justify-content-space-between"}>
                    <span>止盈：</span>
                    <span>{item.take_profit || "-"}</span>
                  </Row>
                </Col>
                <Col width={"50"}>
                  <Row className={"justify-content-space-between"}>
                    <span>税费：</span>
                    <span>{item.taxes || "-"}</span>
                  </Row>
                </Col>
              </Row>
              <Row>
                <Col width={"50"}>
                  <Row className={"justify-content-space-between"}>
                    <span>订单号：</span>
                    <span>{item.order_number}</span>
                  </Row>
                </Col>
                <Col width={"50"}>
                  <Row className={"justify-content-space-between"}>
                    <span>手续费：</span>
                    <span>{item.fee || "-"}</span>
                  </Row>
                </Col>
              </Row>
            </div>
            <SwipeoutActions right>
              <SwipeoutButton
                bgColor={"primary"}
                onClick={() =>
                  this.goToPage(`/trade/${item.symbol}/`, {
                    props: {
                      mode: "close",
                    },
                  })
                }
              >
                <Icon f7={"checkmark_alt_circle"} size={r(16)}></Icon>
              </SwipeoutButton>
              <SwipeoutButton
                bgColor={"primary"}
                onClick={() =>
                  this.goToPage(`/trade/${item.symbol}/`, {
                    props: {
                      mode: "update",
                    },
                  })
                }
              >
                <Icon f7={"pencil"} size={r(16)}></Icon>
              </SwipeoutButton>
              <SwipeoutButton
                bgColor={"primary"}
                onClick={() =>
                  this.goToPage(`/trade/${item.symbol}/`, {
                    props: {
                      mode: "add",
                    },
                  })
                }
              >
                <Icon f7={"plus"} size={r(16)}></Icon>
              </SwipeoutButton>
              <SwipeoutButton
                bgColor={"primary"}
                onClick={() => this.goToPage(`/chart/${item.symbol}/`)}
              >
                <Icon f7={"chart_bar_alt_fill"} size={r(16)}></Icon>
              </SwipeoutButton>
            </SwipeoutActions>
          </ListItem>
        ))}
      </List>
    );
  };

  render() {

    const { tapIndex, currentTradeTab } = this.state;
    const { tradeList, futureTradeList, finishTradeList } = this.props.trade;
    const initSymbol = utils.isEmpty(tradeList) ? 0 : tradeList[0]?.symbol;
    const currentTradeList = currentTradeTab === '持仓'
      ? tradeList
      : currentTradeTab === '挂单'
        ? futureTradeList
        : finishTradeList;

    return (
      <div className={`trade-content-content ${currentTradeTab === "历史" && "history-mode"}`}>
        {!utils.isEmpty(currentTradeList) && currentTradeList.map((item, index) => (<div className="trade-content-item">
          <div className="trade-content-content-top"
            onClick={() => {
              this.setState({
                tapIndex: tapIndex == item.order_number ? -1 : item.order_number,
              });
            }}
          >
            <div className="trade-content-content-top-item">
              <p className="content-text">{item.symbol_name}</p>
              <p>
                <span className="symbol-type-code">{item.product_market}</span>
                <span className="symbol-code">{item.product_code}</span>
              </p>
            </div>
            <div className="trade-content-content-top-item">
              <p className="content-text">{item.new_price}</p>
            </div>
            <div className="trade-content-content-top-item">
              <p className={`transaction-direction 
                ${(Number(item.action) === 0 ||
                  Number(item.action) === 2 ||
                  Number(item.action) === 4)
                  ? 'buy'
                  : 'sell'}`}>
                {tradeActionMap[item.action]}</p>
              <p>{item.lots}</p>
            </div>
            <div className="trade-content-content-top-item">
              <p className={`${Number(item.profit) > 0 ? "p-up" : "p-down"}`}>{item.profit}</p>
            </div>
          </div>
          <div className={`trade-content-content-bottom ${tapIndex == item.order_number ? "show" : ""}`}>
            <div className="trade-content-content-bottom-data">
              <p>开仓价</p>
              <p>{item.open_price}</p>
              {currentTradeTab === "历史" &&
                <>
                  <p>平仓价</p>
                  <p>{item.close_price}</p>
                </>
              }
              <p>交易手数</p>
              <p>{item.lots}</p>
              <p>止盈</p>
              <p>{item.take_profit || "-"}</p>
              <p>止損</p>
              <p>{item.stop_loss || "-"}</p>
              <p>盈亏</p>
              <p>{item.profit}</p>
              <p>库存费</p>
              <p>{item.swaps || "-"}</p>
              <p>手续费</p>
              <p>{item.fee || "-"}</p>
              <p>税费</p>
              <p>{item.taxes || "-"}</p>
              <p>开仓时间</p>
              <p>
                <div>{moment(item.create_time * 1000).format("YYYY.MM.DD")}</div>
                <div>{moment(item.create_time * 1000).format("HH:mm:ss")}</div>
              </p>
              {currentTradeTab === "历史" &&
                <>
                  <p>平仓时间</p>
                  <p>
                    <div>{moment(item.close_time * 1000).format("YYYY.MM.DD")}</div>
                    <div>{moment(item.close_time * 1000).format("HH:mm:ss")}</div>
                  </p>
                </>
              }
              <p>订单号</p>
              <p className="order-number">{item.order_number}</p>
            </div>
            {currentTradeTab === "持仓" && <div className="trade-content-content-bottom-btn"
              onClick={() => {
                this.props.trade.setCurrentTrade(item);
                this.goToPage(`/trade/${item?.symbol}/`, {
                  props: {
                    mode: "update",
                    currentTradeTab
                  },
                })
              }
              }>
              平仓/修改
            </div>}
            {currentTradeTab === "挂单" &&
              <div className="trade-content-content-bottom-btn-group">
                <div className="trade-content-content-bottom-btn"
                  onClick={() => {
                    this.props.trade.setCurrentTrade(item);
                    this.goToPage(`/trade/${item?.symbol}/`, {
                      props: {
                        mode: "update",
                        currentTradeTab
                      },
                    })
                  }
                  }>
                  修改
              </div>
                <div className="trade-content-content-bottom-btn"
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
                      title: '提示',
                      content: '您確定要删单嗎',
                      className: "trade-modal",
                      centered: true,
                      cancelText: "取消",
                      okText: "确认",
                      async onOk() {
                        await that.props.common.$api.trade.closeTrade(item.order_number);
                        Toast.success("删单成功", 2);
                        await that.onRefresh(currentTradeTab)
                      },
                      onCancel() {
                      },
                    });
                  }
                  }>
                  删单
            </div>
              </div>}
          </div>
        </div>
        ))}
      </div>
    );
  }
}
