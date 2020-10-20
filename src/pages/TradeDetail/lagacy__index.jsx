import React from "react";
import {
  Page,
  Navbar,
  List,
  ListItem,
  NavTitle,
  NavRight,
  NavLeft,
  Icon,
  Link,
  Block,
  AccordionItem,
  AccordionToggle,
  AccordionContent,
  Stepper,
  Row,
  Col,
  Input,
} from "framework7-react";
import echarts from "echarts/lib/echarts";
import "echarts/lib/chart/line";
import "echarts/lib/component/tooltip";
import "echarts/lib/component/title";

import moment from "moment";
import { inject, observer } from "mobx-react";
import utils from "utils";
import ws from "utils/ws";
import "./index.scss";
import { BaseReact } from "components/baseComponent";
import { toJS } from "mobx";
import { tradeTypeOptions, tradeActionMap } from "constant";
import cloneDeep from "lodash/cloneDeep";
import maxBy from "lodash/maxBy";
import minBy from "lodash/minBy";

function randomData() {
  now = new Date(+now + oneDay);
  value = value + Math.random() * 21 - 10;
  return {
    name: now.toString(),
    value: [
      [now.getFullYear(), now.getMonth() + 1, now.getDate()].join("/"),
      Math.round(value),
    ],
  };
}

var data = [];
var now = +new Date(1997, 9, 3);
var oneDay = 24 * 3600 * 1000;
var value = Math.random() * 1000;
for (var i = 0; i < 10; i++) {
  data.push(randomData());
}

var data2 = [];
var now = +new Date(1997, 9, 3);
var oneDay = 24 * 3600 * 1000;
var value = Math.random() * 1000;
for (var i = 0; i < 1000; i++) {
  data2.push(randomData());
}

@inject("common", "trade", "market")
@observer
export default class TradeDetail extends BaseReact {
  wsConnect = null;
  $myChart = null;
  state = {
    currentTradeType: tradeTypeOptions[0],
    opened: false,
    lossValue: undefined,
    profitValue: undefined,
    priceValue: undefined,
    lotsValue: 0,

    chartOption: {
      title: {
        text: "",
      },
      backgroundColor: "white",
      grid: {
        right: "14%",
      },
      tooltip: {
        trigger: "axis",
        formatter: function (params) {
          params = params[0];
          return (
            moment(params.value[0]).format("HH:mm:ss") + " / " + params.value[1]
          );
        },
        axisPointer: {
          animation: false,
        },
      },
      xAxis: {
        show: false,
        type: "category",
        splitLine: {
          show: false,
        },
      },
      yAxis: {
        position: "right",
        type: "value",
        boundaryGap: [0, "100%"],
        splitLine: {
          show: true,
          lineStyle: {
            type: "dashed",
          },
        },
      },
    },
  };

  componentDidMount() {
    this.initSymbolList();
    this.initTrade();
    setTimeout(() => {
      this.initChart();
      this.connectWebsocket();
    }, 600);
  }

  initSymbolList = async () => {
    const {
      symbolList,
      getSymbolList,
      setCurrentSymbol,
      getCurrentSymbol,
    } = this.props.market;

    const { id, mode } = this.props;

    if (utils.isEmpty(symbolList)) {
      await getSymbolList();
    }

    await getCurrentSymbol(
      mode == "add" && (id == null || id == 0)
        ? this.props.market.symbolList[0]?.id
        : id
    );

    const { currentShowSymbol } = this.props.market;
    this.setState({
      lotsValue: currentShowSymbol?.symbol_display?.min_lots,
    });
  };

  componentWillUnmount() {}

  initTrade = async () => {
    const {
      id,
      mode,
      trade: { currentTrade },
    } = this.props;

    if (mode != "add") {
      let action = currentTrade?.action;
      let ret;

      if (action == 0 || action == 1) {
        ret = tradeTypeOptions[0];
      } else {
        ret = tradeTypeOptions.find((item) => item.id == action);
      }

      this.setState({
        currentTradeType: ret,
        lossValue: currentTrade.stop_loss,
        profitValue: currentTrade.take_profit,
        priceValue: currentTrade.open_price,
      });
    }
  };

  initChart = () => {
    this.$myChart = echarts.init(document.querySelector(".chart"));
    window.$echart = echarts;
    window.$myChart = this.$myChart;

    // 绘制图表
    const { chartOption } = this.state;
    const { currentShowSymbol, currentSymbol } = this.props.market;
    const trend = currentSymbol?.trend ?? [];

    const maxBuy = maxBy(trend, (item) => item[1]);
    const minBuy = minBy(trend, (item) => item[1]);
    const maxSell = maxBy(trend, (item) => item[2]);
    const minSell = minBy(trend, (item) => item[2]);
    const max = Math.max(maxBuy ? maxBuy[1] : 0, maxSell ? maxSell[1] : 0);
    const min = Math.min(minBuy ? minBuy[2] : 0, minSell ? minSell[2] : 0);
    const interval = +((max - min) / 10).toFixed(
      currentSymbol?.symbol_display?.decimals_place
    );

    const options = {
      ...chartOption,
      xAxis: {
        ...chartOption.xAxis,
        data: currentSymbol?.trendBuy?.value[0],
      },
      yAxis: {
        ...chartOption.yAxis,
        min,
        max,
        interval,
      },
      series: [
        {
          name: "模拟数据",
          type: "line",
          showSymbol: false,
          hoverAnimation: false,
          // data: data ?? [],
          data: currentShowSymbol?.trendBuy ?? [],
          lineStyle: {
            color: "#44d7b6",
          },
        },
        {
          name: "模拟数据",
          type: "line",
          showSymbol: false,
          hoverAnimation: false,
          data: currentShowSymbol?.trendSell ?? [],
          lineStyle: {
            color: "#e94a39",
          },
        },
      ],
    };

    // console.log(JSON.stringify(options));

    this.$myChart.setOption(options, true);
  };

  updateTrendData = (data) => {
    const {
      currentSymbol,
      currentShowSymbol,
      setCurrentSymbol,
    } = this.props.market;

    let trend = currentSymbol?.trend ?? [];
    let newTrend = cloneDeep(trend);
    let lastData = trend[trend.length - 1] ?? [];
    let firstData = trend[0];

    // 新变化的数据是最新的数据
    if (data.timestamp > (lastData[0] ?? 0)) {
      newTrend.push([data.timestamp, data.buy, data.sell]);
    } else if (
      data.timestamp >= (firstData[0] ?? 0) &&
      data.timestamp <= (lastData[0] ?? 0)
    ) {
      newTrend = newTrend.map((item) => {
        if (item[0] == data.timestamp) {
          item = [data.timestamp, data.buy, data.sell];
        }

        return item;
      });
    }

    setCurrentSymbol({
      ...data,
      timestamp:
        data.timestamp >= currentSymbol.timestamp
          ? data.timestamp
          : currentSymbol.timestamp,
      trend: newTrend,
    });
  };

  connectWebsocket = () => {
    const {
      id,
      prevSelectedId,
      market: { currentShowSymbol },
    } = this.props;
    const that = this;

    if (!prevSelectedId || +prevSelectedId != id) {
      if (this.wsConnect) this.wsConnect.close();

      this.wsConnect = ws(`symbol/${id}/trend`);

      // setInterval(function () {
      //   that.wsConnect.send(`{"type":"ping"}`);
      // }, 3000)

      this.wsConnect.onmessage = (evt) => {
        const msg = JSON.parse(evt.data);
        const data = msg.data;
        if (msg.type === "pong") {
          clearInterval(this.orderInterval);

          // 如果一定时间没有调用clearInterval，则执行重连
          this.orderInterval = setInterval(function () {
            that.connectWebsocket();
          }, 1000);
        }
        if (msg.type && msg.type !== "pong") {
          // 消息推送
          // code ...

          // console.log('data', data);

          this.updateTrendData(data);
          this.initChart();
        }
      };

      this.wsConnect.onclose = (evt) => {
        setInterval(function () {
          that.connectWebsocket();
        }, 3000);
      };

      // if (this.wsConnect) {
      //   this.wsConnect.close();
      //
      //   this.wsConnect.onclose = evt => {
      //     this.wsConnect = ws(`symbol/${id}/trend`);
      //     this.wsConnect.onmessage = evt => {
      //       const msg = evt.data;
      //
      //       const data = JSON.parse(msg).data;
      //
      //       this.updateTrendData(data);
      //       this.initChart();
      //     }
      //   }
      // } else {
      //   this.wsConnect = ws(`symbol/${id}/trend`);
      //   this.wsConnect.onmessage = evt => {
      //     const msg = evt.data;
      //     const data = JSON.parse(msg).data;
      //     console.log('data', data);
      //
      //
      //     this.updateTrendData(data);
      //     this.initChart();
      //   }
      // }
    }
  };

  componentWillUnmount = () => {
    if (this.wsConnect) {
      this.wsConnect.close();
    }
  };

  onTradeTypeChanged = (currentTradeType) => {
    this.setState({
      currentTradeType,
    });
    this.toggleTypePanel();
  };

  toggleTypePanel = () => {
    this.setState({
      opened: !this.state.opened,
    });
  };

  onTrade = async (mode) => {
    const {
      currentTradeType,
      priceValue,
      profitValue,
      lossValue,
      lotsValue,
    } = this.state;
    const { currentSymbol } = this.props.market;
    const { currentTrade } = this.props.trade;
    const actionMode = this.props.mode;

    let payload = {
      trading_volume: lotsValue * currentSymbol?.symbol_display?.contract_size,
      lots: lotsValue,
      symbol: currentSymbol.id,
      take_profit: profitValue,
      stop_loss: lossValue,
    };

    if (actionMode == "add") {
      if (mode == "buy") {
        payload.open_price = currentSymbol?.buy;
      } else if (mode == "sell") {
        payload.open_price = currentSymbol?.sell;
      }

      if (currentTradeType.id == 1) {
        if (mode == "buy") {
          payload.action = "0";
        } else if (mode == "sell") {
          payload.action = "1";
        }
      } else {
        payload.action = currentTradeType.id;
        payload.open_price = priceValue;
      }
    } else if (actionMode == "update") {
      payload.open_price = priceValue;
    }

    // console.log('payload', JSON.stringify(payload));

    // const errMsg = this.getValidation(payload, mode);

    // if (errMsg) {
    //   return this.$f7.toast.show({
    //     text: errMsg,
    //     position: 'center',
    //     closeTimeout: 2000,
    //   });
    // }

    let res;
    if (actionMode == "add") {
      try {
        res = await this.$api.trade.createTrade(payload);

        // console.log('res', res);
        if (res.status == 201) {
          this.$f7.toast.show({
            text: "下单成功",
            position: "center",
            closeTimeout: 2000,
          });
          this.wsConnect.close();
          this.onTradeListPageRefresh();
          this.$f7router.back({
            force: false,
          });
        }
      } catch (e) {
        this.$f7.toast.show({
          text: e.response.data.message,
          position: "center",
          closeTimeout: 2000,
        });
      }
    } else if (actionMode == "update") {
      payload = {
        open_price: payload.open_price,
        take_profit: payload.take_profit,
        stop_loss: payload.stop_loss,
      };
      try {
        res = await this.$api.trade.updateTrade(
          currentTrade.order_number,
          payload
        );

        if (res.status == 200) {
          this.$f7.toast.show({
            text: "修改成功",
            position: "center",
            closeTimeout: 2000,
          });
          this.wsConnect.close();
          this.onTradeListPageRefresh();
          this.$f7router.back("/trade/", {
            force: false,
          });
        }
      } catch (e) {
        this.$f7.toast.show({
          text: e.response.data.message,
          position: "center",
          closeTimeout: 2000,
        });
      }
    }
  };

  getValidation = (payload, mode) => {
    const { currentSymbol } = this.props.market;
    const { currentTradeType } = this.state;
    let errMsg = "";
    let buy = +currentSymbol?.buy;
    let sell = +currentSymbol?.sell;
    let limit =
      (currentSymbol?.symbol_display?.limit_stop_level * 1) /
      10 ** currentSymbol?.symbol_display?.decimals_place; // 止盈止损点位

    if (mode == "buy") {
      if (payload.take_profit - buy < limit) {
        errMsg = `止盈点位不得小于止盈止损点位`;
      } else if (sell - payload.stop_loss < limit) {
        errMsg = "止损点位不得小于止盈止损点位";
      }
    } else if (mode == "sell") {
      if (buy - payload.take_profit < limit) {
        errMsg = "止盈点位不得小于止盈止损点位";
      } else if (payload.stop_loss - sell < limit) {
        errMsg = "止损点位不得小于止盈止损点位";
      }
    }

    if (payload.action != 0 || payload.action != 1) {
      // 挂单交易校验规则：https://zhidao.baidu.com/question/71819653.html
      if (payload.action == 2 && payload.open_price >= currentSymbol.buy) {
        errMsg = "请在当前买入价格下方挂单";
      } else if (
        payload.action == 3 &&
        payload.open_price <= currentSymbol.sell
      ) {
        errMsg = "请在当前卖出价格上方挂单";
      } else if (
        payload.action == 4 &&
        payload.open_price <= currentSymbol.buy
      ) {
        errMsg = "请在当前买入价格上方挂单";
      } else if (
        payload.action == 5 &&
        payload.open_price >= currentSymbol.sell
      ) {
        errMsg = "请在当前卖出价格上方挂单";
      }
    }

    if (!payload.take_profit && !payload.stop_loss) {
      errMsg = "";
    }

    return errMsg;
  };

  onLotsChanged = (val) => {
    const {
      market: { currentShowSymbol },
    } = this.props;

    val = Number(val);
    val = Number(this.state.lotsValue || 0) + val;
    val = Number(val.toFixed(3));

    if (val < currentShowSymbol?.symbol_display?.min_lots) {
      return;
    }

    this.setState({
      lotsValue: val,
    });
  };

  onFieldChanged = (change, field) => {
    const { currentSymbol } = this.props.market;
    const limit = currentSymbol?.symbol_display?.decimals_place ?? 1;

    let fieldValue = this.state[field];

    if (!fieldValue) {
      if (field == "lossValue") {
        fieldValue = +currentSymbol.sell + change;
      } else {
        fieldValue = +currentSymbol.buy + change;
      }
    } else {
      fieldValue += change;
    }

    fieldValue = +fieldValue.toFixed(limit);

    this.setState({
      [field]: fieldValue,
    });
  };

  onTradeListPageRefresh = async () => {
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

  render() {
    const {
      id,
      mode,
      market: { currentSymbol, currentShowSymbol },
      trade: { currentTrade },
    } = this.props;
    const {
      currentTradeType,
      opened,
      priceValue,
      profitValue,
      lossValue,
      lotsValue,
    } = this.state;
    const stepLevel = currentSymbol?.symbol_display?.decimals_place
      ? 1 / 10 ** currentSymbol?.symbol_display?.decimals_place
      : 0.001;
    // debugger;
    const actionSwitch = currentSymbol?.symbol_display?.action;
    const useBuyBtn = actionSwitch?.includes("0");
    const useSellBtn = actionSwitch?.includes("1");

    return (
      <Page
        noToolbar
        name="trade-detail"
        className={"trade-detail"}
        onPageBeforeIn={(pageData) => {}}
      >
        <Navbar>
          <NavLeft>
            <Link
              onClick={() => {
                this.wsConnect.close();
                this.$f7router.back({ force: false });
              }}
            >
              <Icon color={"white"} f7={"chevron_left"} size={r(18)}></Icon>
            </Link>
          </NavLeft>
          <NavTitle>
            <span
              style={{ marginRight: r(8) }}
              onClick={() => {
                if (mode == "add") {
                  // this.wsConnect.close();
                  this.$f7router.navigate("/products/", {
                    props: {
                      selectedId: id,
                      mode,
                    },
                  });
                }
              }}
            >
              {currentSymbol?.symbol_display?.name}
            </span>
            {mode == "add" && (
              <Icon
                color={"white"}
                f7={"arrowtriangle_down_fill"}
                size={r(10)}
              ></Icon>
            )}
          </NavTitle>
        </Navbar>
        {mode == "add" && (
          <section>
            <div
              className={`trade-detail-title ${currentTradeType.color}`}
              onClick={this.toggleTypePanel}
            >
              {currentTradeType.name}
            </div>
            <div className={`trade-detail-type ${opened ? "active" : ""}`}>
              {tradeTypeOptions.map((item) => {
                return (
                  <div
                    className={`
                      trade-detail-type-item ${item.color}
                      ${
                        (item.id == 2 || item.id == 4) && !useBuyBtn
                          ? "bg-grey"
                          : (item.id == 3 || item.id == 5) && !useSellBtn
                          ? "bg-grey"
                          : ""
                      }
                      `}
                    style={{
                      display:
                        currentTradeType?.id == item.id ? "none" : "block",
                    }}
                    key={item.id}
                    onClick={() => {
                      if ((item.id == 2 || item.id == 4) && !useBuyBtn) return;
                      if ((item.id == 3 || item.id == 5) && !useSellBtn) return;

                      this.onTradeTypeChanged(item);
                    }}
                  >
                    {item.name}
                  </div>
                );
              })}
            </div>
          </section>
        )}
        {mode == "add" && (
          <Row bgColor={"white"} noGap className={"trade-detail-lots"}>
            <Col width={"20"}>
              <span
                className={"blue"}
                onClick={() => {
                  this.onLotsChanged(
                    0 - currentShowSymbol?.symbol_display?.lots_step * 10
                  );
                }}
              >
                {-currentShowSymbol?.symbol_display?.lots_step * 10 || "-"}
              </span>
            </Col>
            <Col width={"20"}>
              <span
                className={"blue"}
                onClick={() => {
                  this.onLotsChanged(
                    0 - currentShowSymbol?.symbol_display?.lots_step
                  );
                }}
              >
                {-currentShowSymbol?.symbol_display?.lots_step || "-"}
              </span>
            </Col>
            <Col width={"20"}>
              <Input
                type="number"
                min={currentShowSymbol?.symbol_display?.min_lots}
                value={lotsValue}
                color={"black"}
                onChange={(evt) => {
                  if (evt.target.value < currentShowSymbol?.min_lots) return;

                  this.setState({
                    lotsValue: evt.target.value,
                  });
                }}
              />
            </Col>
            <Col width={"20"}>
              <span
                className={"blue"}
                onClick={() => {
                  this.onLotsChanged(
                    currentShowSymbol?.symbol_display?.lots_step
                  );
                }}
              >
                {(currentShowSymbol?.symbol_display?.lots_step &&
                  "+" + currentShowSymbol?.symbol_display?.lots_step) ||
                  "-"}
              </span>
            </Col>
            <Col width={"20"}>
              <span
                className={"blue"}
                onClick={() => {
                  this.onLotsChanged(
                    currentShowSymbol?.symbol_display?.lots_step * 10
                  );
                }}
              >
                {(currentShowSymbol?.symbol_display?.lots_step &&
                  "+" + currentShowSymbol?.symbol_display?.lots_step * 10) ||
                  "-"}
              </span>
            </Col>
          </Row>
        )}
        <List simple-list>
          {(mode == "update" || mode == "close") && currentTrade != null && (
            <ListItem>
              <div className={"trade-detail-info"}>
                <span>
                  {mode == "update"
                    ? "修改"
                    : mode == "close"
                    ? currentTradeType?.id == 1
                      ? "平仓"
                      : "删除"
                    : ""}
                  ：
                </span>
                <span>#{currentTrade.order_number}</span>
                <span>{tradeActionMap[currentTrade.action]}</span>
                <span>{currentTrade.lots}</span>
              </div>
            </ListItem>
          )}
          <ListItem
            title="价格"
            style={{
              display: currentTradeType?.id != 1 ? "block" : "none",
            }}
          >
            <Row className={"trade-detail-stepper align-items-center"}>
              <Col
                width={"20"}
                onClick={() => {
                  this.onFieldChanged(-stepLevel, "priceValue");
                }}
              >
                <Icon f7={"minus"} size={r(22)}></Icon>
              </Col>
              <Col width={"60"}>
                <Input
                  type="number"
                  min={0.01}
                  value={priceValue}
                  onChange={(evt) => {
                    this.setState({
                      priceValue: evt.target.value,
                    });
                  }}
                />
              </Col>
              <Col
                width={"20"}
                onClick={() => {
                  this.onFieldChanged(stepLevel, "priceValue");
                }}
              >
                <Icon f7={"plus"} size={r(22)}></Icon>
              </Col>
            </Row>
          </ListItem>
          <ListItem title="止损">
            <Row className={"trade-detail-stepper align-items-center"}>
              <Col
                width={"20"}
                onClick={() => {
                  this.onFieldChanged(-stepLevel, "lossValue");
                }}
              >
                <Icon f7={"minus"} size={r(22)}></Icon>
              </Col>
              <Col width={"60"}>
                <Input
                  type="number"
                  min={0.01}
                  placeholder={"未设置"}
                  value={lossValue || undefined}
                  onChange={(evt) => {
                    this.setState({
                      lossValue: evt.target.value,
                    });
                  }}
                />
              </Col>
              <Col
                width={"20"}
                onClick={() => {
                  this.onFieldChanged(stepLevel, "lossValue");
                }}
              >
                <Icon f7={"plus"} size={r(22)}></Icon>
              </Col>
            </Row>
          </ListItem>
          <ListItem title="止盈">
            <Row className={"trade-detail-stepper align-items-center"}>
              <Col
                width={"20"}
                onClick={() => {
                  this.onFieldChanged(-stepLevel, "profitValue");
                }}
              >
                <Icon f7={"minus"} size={r(22)}></Icon>
              </Col>
              <Col width={"60"}>
                <Input
                  type="number"
                  min={0.01}
                  placeholder={"未设置"}
                  value={profitValue || undefined}
                  onChange={(evt) => {
                    this.setState({
                      profitValue: evt.target.value,
                    });
                  }}
                />
              </Col>
              <Col
                width={"20"}
                onClick={() => {
                  this.onFieldChanged(stepLevel, "profitValue");
                }}
              >
                <Icon f7={"plus"} size={r(22)}></Icon>
              </Col>
            </Row>
          </ListItem>
        </List>
        <Row noGap className={"trade-detail-price"}>
          <Col width={"50"} className={"p-down"}>
            {currentSymbol?.sell}
            <strong></strong>
          </Col>
          <Col width={"50"} className={`p-up`}>
            {currentSymbol?.buy}
            <strong></strong>
          </Col>
        </Row>
        {mode == "add" && (
          <Row noGap className={"trade-detail-actions"}>
            <Col
              onClick={() => {
                if (!useSellBtn) return;

                this.onTrade("sell");
              }}
              width={"50"}
              className={`bg-down trade-detail-action ${
                !useSellBtn ? "bg-grey" : ""
              }`}
            >
              <span>Sell</span>
            </Col>
            <Col
              onClick={() => {
                if (!useBuyBtn) return;

                this.onTrade("buy");
              }}
              width={"50"}
              className={`bg-up trade-detail-action ${
                !useBuyBtn ? "bg-grey" : ""
              }`}
            >
              <span>Buy</span>
            </Col>
          </Row>
        )}
        {
          // 非挂单交易的修改
          mode == "update" && currentTradeType.id == 1 && (
            <div
              className={"trade-detail-actions update bg-down"}
              onClick={() => {
                this.onTrade(tradeActionMap[currentTrade.action]);
              }}
            >
              修改
            </div>
          )
        }
        {
          // 非挂单交易的修改
          mode == "update" && currentTradeType.id != 1 && (
            <Row noGap className={"trade-detail-actions"}>
              <Col
                onClick={() => {
                  this.onTrade(tradeActionMap[currentTrade.action]);
                }}
                width={"50"}
                className={"bg-deep-grey trade-detail-action"}
              >
                <span>修改</span>
              </Col>
              <Col
                onClick={async () => {
                  try {
                    const res = await this.$api.trade.closeTrade(
                      currentTrade.order_number
                    );

                    if (res.status == 200) {
                      this.$f7.toast.show({
                        text: "删除成功",
                        position: "center",
                        closeTimeout: 2000,
                      });
                      this.wsConnect.close();
                      this.onTradeListPageRefresh();
                      this.$f7router.back("/trade/", {
                        force: false,
                      });
                    }
                  } catch (e) {
                    this.$f7.toast.show({
                      text: e.response.data.message,
                      position: "center",
                      closeTimeout: 2000,
                    });
                  }
                }}
                width={"50"}
                className={`bg-down trade-detail-action`}
              >
                <span>删除</span>
              </Col>
            </Row>
          )
        }
        {
          // 非挂单交易的修改
          mode == "close" && (
            <div
              className={"trade-detail-actions update bg-orange"}
              onClick={async () => {
                try {
                  const res = await this.$api.trade.closeTrade(
                    currentTrade.order_number
                  );
                  if (res.status == 200) {
                    this.$f7.toast.show({
                      text: `${currentTradeType.id == 1 ? "平仓" : "删除"}成功`,
                      position: "center",
                      closeTimeout: 2000,
                    });
                    this.wsConnect.close();
                    this.onTradeListPageRefresh();
                    this.$f7router.back("/trade/", {
                      force: false,
                    });
                  }
                } catch (e) {
                  this.$f7.toast.show({
                    text: e.response.data.message,
                    position: "center",
                    closeTimeout: 2000,
                  });
                }
              }}
            >
              {currentTradeType.id == 1 ? "平仓" : "删除"}
            </div>
          )
        }

        <div className={"chart"}></div>
      </Page>
    );
  }
}
