import React from "react";
import { BaseReact } from "components/baseComponent";
import {
  Page,
  Navbar,
  List,
  ListItem,
  NavRight,
  NavTitle,
  Link,
  Card,
  Icon,
  Block,
  Row,
  Col,
  BlockFooter,
  SwipeoutActions,
  SwipeoutButton,
  BlockTitle,
  Actions,
  ActionsGroup,
  ActionsLabel,
  ActionsButton,
} from "framework7-react";
import AddIcon from "assets/img/add.svg";
import moment from "moment";
import { inject, observer } from "mobx-react";
import "./index.scss";
import ws from "utils/ws";
import { tradeActionMap } from "constant";
import utils from "utils";
import cloneDeep from "lodash/cloneDeep";

@inject("common", "trade")
@observer
export default class extends BaseReact {
  wsConnect = null;
  $event = null;
  state = {
    title: "交易",
    tapIndex: -1,
    // currentTrade: null,
    loading: false,
    effect: null,
    items: [
      {
        title: "Yellow Submarine",
        author: "Beatles",
        cover: "https://cdn.framework7.io/placeholder/abstract-88x88-1.jpg",
      },
      {
        title: "Don't Stop Me Now",
        author: "Queen",
        cover: "https://cdn.framework7.io/placeholder/abstract-88x88-2.jpg",
      },
      {
        title: "Billie Jean",
        author: "Michael Jackson",
        cover: "https://cdn.framework7.io/placeholder/abstract-88x88-3.jpg",
      },
    ],
    songs: [
      "Yellow Submarine",
      "Don't Stop Me Now",
      "Billie Jean",
      "Californication",
    ],
    authors: ["Beatles", "Queen", "Michael Jackson", "Red Hot Chili Peppers"],
  };

  // constructor() {
  //   super();
  //
  // }

  componentDidMount() {
    this.initEvents();
    this.initData();
    this.connectWebsocket();
  }

  initEvents = () => {
    this.props.common.globalEvent.on('refresh-trade-page', () => {
        this.onRefresh();
    });
  }

  initData = () => {
    if (this.state.loading) return;

    this.onRefresh();

    this.$f7.$(".trade-list-in-transaction").on("taphold", (evt) => {
      const { tradeList, futureTradeList } = this.props.trade;
      const dom = this.$f7.$(evt.target).parents(".media-item")[0];
      if (dom != null) {
        const currentTrade =
          (tradeList[dom.id] || futureTradeList[dom.id]) ?? {};

        this.props.trade.setCurrentTrade(currentTrade);

        this.setState(
          {
            longTapIndex: dom.id,
          },
          () => {
            this.refs.actionsGroup.open();
          }
        );
      }
    });

    this.$f7.$(".trade-list-pending").on("taphold", (evt) => {
      const { tradeList, futureTradeList } = this.props.trade;
      console.log('evt', evt.target);

      const dom = this.$f7.$(evt.target).parents(".media-item")[0];
      if (dom != null) {
        const currentTrade =
          (tradeList[dom.id] || futureTradeList[dom.id]) ?? {};

        this.props.trade.setCurrentTrade(currentTrade);

        this.setState(
          {
            longTapIndex: dom.id,
          },
          () => {
            this.refs.actionsGroup.open();
          }
        );
      }
    });
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
    payload.equity =
      tradeList.reduce((acc, cur) => acc + cur.profit, 0) + payload.balance;
    payload.free_margin = payload.equity - payload.margin;
    payload.margin_level = (payload.equity / payload.margin) * 100;

    setTradeInfo(payload);
  };

  connectWebsocket = () => {
    if (this.wsConnect == null) {
      this.wsConnect = ws("order");
    }

    const { setTradeInfo, setTradeList,  } = this.props.trade;

    this.wsConnect.onmessage = (evt) => {
      const msg = JSON.parse(evt.data);
      if (msg.type == "meta_fund") {
        this.updateTradeInfo({
          balance: msg.data.balance,
          margin: msg.data.margin,
        });
      } else {
        let list = cloneDeep(this.props.trade?.tradeList);
        let futureList = cloneDeep(this.props.trade?.futureTradeList);
        if (msg.type == "order_open") {
          list = [msg.data, ...list];
        } else if (msg.type == "order_profit") {
          list = list.map((item) => {
            if (item.order_number == msg.data.order_number) {
              item = msg.data;
            }
            return item;
          });
        } else if (msg.type == "order_close") {
          list = list.filter(
            (item) => item.order_number != msg.data.order_number
          );
        } else if (msg.type == "pending_order_close") {
          futureList = futureList.filter(
            (item) => item.order_number != msg.data.order_number
          );
        }

        setTradeList(list);
        setTradeList(futureList, 'future');
        this.updateTradeInfo({
          balance: this.props.trade.tradeInfo.balance,
          margin: this.props.trade.tradeInfo.margin,
        });
      }
    };
  };

  componentWillUnmount = () => {
    if (this.wsConnect) {
      this.wsConnect.close()
    }
  }

  goToPage = (url, opts = {}) => {
    this.$f7router.navigate(url, opts);


  };

  onRefresh = async (done) => {
    this.setState(
      {
        loading: true,
      },
      async () => {
        try {
          // await this.props.trade.getTradeInfo();
          const res = await this.$api.trade.getTradeInfo();
          let tradeInfo = {
            balance: res.data.balance,
            // equity: 1014404.86, // 净值
            margin: res.data.margin, // 预付款
            // free_margin: 1014399.22, // 可用预付款
            // margin_level: 18017848.22, // 预付款比例
          };
          const res2 = await Promise.all([
            this.$api.trade.getTradeList({
              params: {
                status: "in_transaction",
              },
            }),
            this.$api.trade.getTradeList({
              params: {
                status: "pending",
              },
            }),
          ]);

          const list = res2.map((item) => item.data);
          this.props.trade.setTradeList(list[0]);
          this.props.trade.setTradeList(list[1], "future");

          this.updateTradeInfo(tradeInfo);
        } catch (e) {
          this.$f7.toast.show({
            text: e.response.data.message,
            position: "center",
            closeTimeout: 2000,
          });
        }

        this.setState({ loading: false });
        done && done();
      }
    );
  };

  renderTradeList = (tradeList, type) => {
    const { tapIndex, loading } = this.state;

    return (
      <List mediaList className={`trade-list-${type == 'order' ? 'in-transaction' : 'pending'}`} style={{
        paddingBottom: type == 'order' ? 0 : 80,
      }}>
        {tradeList.length > 0 &&
          (type == "order" ? (
            <div className={"trade-data-title"}>持仓</div>
          ) : (
            <div className={"trade-data-title"}>挂单</div>
          ))}
        {tradeList.map((item, index) => (
          <ListItem
            // dataItem={item}
            id={index}
            key={index}
            swipeout
            className={`trade-data ${
              loading ? "skeleton-text skeleton-effect-blink" : ""
            }`}
            onSwipeoutOpen={() => {
              this.props.trade.setCurrentTrade(item);
            }}
            // onSwipeoutClose=fk{() => {
            //   debugger
            //   this.props.trade.setCurrentTrade({});
            // }}
            onClick={() => {
              this.setState({
                tapIndex: tapIndex == index ? -1 : index,
              });
            }}
          >
            {/*<img slot="media" src={item.cover} width="44" />*/}
            <div slot={"title"} className={"trade-data-top"}>
              <strong>{item.symbol_name},</strong>
              <span className={`p-down`}>
                {tradeActionMap[item.action]} {item.lots}
              </span>
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
                tapIndex == index ? "active" : ""
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
    const { title, tapIndex, loading } = this.state;
    const {
      tradeInfo,
      tradeList,
      futureTradeList,
      computedTradeList,
      currentTrade,
    } = this.props.trade;
    const initSymbol = utils.isEmpty(tradeList) ? 0 : tradeList[0]?.symbol;

    console.log('currentTrade', currentTrade);


    return (
      <Page
        name="trade"
        className="trade-page"
        ptr
        onPtrRefresh={this.onRefresh}
      >
        <Navbar title={title}>
          <NavRight>
            {/*<img alt="add" src={AddIcon} onClick={() => this.goToPage(`/trade/${initSymbol}/`, {*/}
            {/*props: {*/}
            {/*mode: 'add'*/}
            {/*}*/}
            {/*})}/>*/}
            <Link
              iconF7={"plus"}
              color={"white"}
              onClick={() => {
                this.goToPage(`/trade/${initSymbol}/`, {
                  props: {
                    mode: "add",
                  },
                });
              }}
            ></Link>
          </NavRight>
        </Navbar>
        <Block
          strong
          className={`trade-stats ${
            loading ? "skeleton-text skeleton-effect-blink" : ""
          }`}
        >
          <Row className={"trade-stats-row"}>
            <Col width="33" className={"trade-stats-col"}>
              <p>结余</p>
              <p>{tradeInfo?.balance?.toFixed(2)}</p>
            </Col>
            <Col width="33" className={"trade-stats-col"}>
              <p>净值</p>
              <p>{tradeInfo?.equity?.toFixed(2)}</p>
            </Col>
            <Col width="33"></Col>
          </Row>
          <Row className={"trade-stats-row"}>
            <Col width="33" className={"trade-stats-col"}>
              <p>预付款</p>
              <p>{+tradeInfo?.margin?.toFixed(2)}</p>
            </Col>
            <Col width="33" className={"trade-stats-col"}>
              <p>可用预付款</p>
              <p>{tradeInfo?.free_margin?.toFixed(2)}</p>
            </Col>
            <Col width="33" className={"trade-stats-col"}>
              <p>预付款比率(%)</p>
              <p>
                {tradeInfo.margin == 0
                  ? "-"
                  : tradeInfo?.margin_level?.toFixed(2)}
              </p>
            </Col>
          </Row>
        </Block>
        {this.renderTradeList(tradeList, "order")}
        {this.renderTradeList(futureTradeList, "future")}
        <Actions
          ref="actionsGroup"
          onActionsClose={() => {
            this.props.trade.setCurrentTrade(currentTrade);
          }}
        >
          <ActionsGroup>
            <ActionsLabel>
              {`交易：${currentTrade?.symbol_name}, ${
                tradeActionMap[currentTrade?.action]
              } ${currentTrade?.profit}`}
            </ActionsLabel>
            <ActionsButton color={"red"}
                           onClick={() =>
                             this.goToPage(`/trade/${currentTrade?.symbol}/`, {
                               props: {
                                 mode: "close",
                               },
                             })
                           }
            >
              <div
              >
                {
                  currentTrade.status == "pending"
                    ? '删除'
                    : '平仓'
                }
              </div>
            </ActionsButton>
            <ActionsButton onClick={() =>
              this.goToPage(`/trade/${currentTrade?.symbol}/`, {
                props: {
                  mode: "update",
                },
              })
            }>
              <span

              >
                修改
              </span>
            </ActionsButton>
            <ActionsButton onClick={() =>
              this.goToPage(`/trade/${currentTrade?.symbol}/`, {
                props: {
                  mode: "add",
                },
              })
            }>
              <span

              >
                交易
              </span>
            </ActionsButton>
            <ActionsButton onClick={() => {
              this.goToPage(`/chart/${currentTrade.symbol}/`, {
                context: currentTrade,
              })
            }}>
              <span
              >
                图表
              </span>
            </ActionsButton>
          </ActionsGroup>
          <ActionsGroup>
            <ActionsButton>取消</ActionsButton>
          </ActionsGroup>
        </Actions>
      </Page>
    );
  }
}
