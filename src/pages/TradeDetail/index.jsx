import api from "services";
import React from "react";
import {
  Page,
  Navbar,
  List,
  ListItem,
  Block,
  NavTitle,
  NavLeft,
  NavRight,
  Icon,
  Link,
  Toolbar,
  Input,
} from "framework7-react";
import { Tabs } from "antd-mobile";
import { Modal, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import {
  tradeTypeOptions,
  tradeActionMap,
  pendingOrderOptions,
  executeOptions,
  executeMotionMap,
  stockTypeOptions,
} from "constant";
import { inject, observer } from "mobx-react";
import { toJS } from "mobx";
import utils from "utils";
import moment from "moment";
import Dom7 from "dom7";
import "antd/dist/antd.css";
import "./index.scss";
import ReactEcharts from "echarts-for-react";
import { create, all } from "mathjs";
import produce from "immer";
import ContactsListComponent from "framework7/components/contacts-list/contacts-list";
const config = {
  number: "BigNumber",
};
const math = create(all, config);

const tradeActions = [
  "多单",
  "空单",
  "Buy Limit",
  "Sell Limit",
  "Buy Stop",
  "Sell Stop",
];

const moreInfoTabs = [
  { title: "盘口", code: "fund" },
  { title: "资讯", code: "news" },
];

const $$ = Dom7;

@inject("common", "trade", "market")
@observer
export default class TradeDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // symbolDisplay: this.$f7route.context.symbol_display,
      moreInfo: false,
      tradeType: tradeTypeOptions[0].id,
      params: {
        lots: 1,
        open_price: undefined,
        action: 0,
        take_profit: undefined,
        stop_loss: undefined,
        totalFunds: 0,
        trading_volume: 0,
      },
      stockParams: {
        holdDays: "",
        action: 0,
        margin_value: 0,
        unitFunds: 100,
        leverage: 1,
        rules: {
          calculate_for_buy_hands_fee: "",
          calculate_for_buy_stock_fee: "",
          calculate_for_sell_hands_fee: "",
          calculate_for_sell_stock_fee: "",
        },
      },
      positionTypeMap: [],
      leverageMap: [],
      newsList: [],
      newsListCount: 0,
      fund: {},
      tabDataLoading: false,
      page: 1,
      newsHasMore: true,
      newsError: false,
      isSubmit: false,
    };
  }
  profitRule = this.props.common.nowProfitRule;
  init = async () => {
    // 初始表单参数
    const { currentSymbol } = this.props.market;
    const { min_margin_value } = currentSymbol.symbol_display;
    this.setState(
      produce((draft) => {
        draft.stockParams.margin_value = min_margin_value;
      })
    );
  };

  async componentDidMount() {
    await this.fetchCurrentSymbol();
    await this.init();

    const { stockParams } = this.state;
    const { mode, currentTradeTab } = this.props;
    const { currentTrade } = this.props.trade;
    const { currentSymbol } = this.props.market;
    const {
      calculate_for_buy_hands_fee,
      calculate_for_buy_stock_fee,
      calculate_for_buy_tax,
      calculate_for_cash_deposit,
      calculate_for_sell_hands_fee,
      calculate_for_sell_stock_fee,
      calculate_for_sell_tax,
      contract_size,
      min_margin_value,
    } = currentSymbol.symbol_display;

    const { margin_value, leverage } =
      mode === "add" ? stockParams : currentTrade;
    /**
     * add 是从产品页进入下单页
     * 另一个模式是从 交易持仓页进入下单页
     * 想分开但我怕豹不敢改
     */
    const { sell } = currentSymbol.product_details ?? { sell: 0 };
    const leverageMap = currentSymbol?.symbol_display?.leverage.split(",");
    const defaultLeverage = mode === "add" ? leverageMap[0] : leverage;
    const defaultPrice = mode === "add" ? sell : currentTrade.open_price;
    const { trading_volume, lots, totalFunds } = this.getTradingVolumeInfo(
      margin_value,
      defaultLeverage,
      defaultPrice,
      contract_size
    );

    this.getFunds();
    window.addEventListener("scroll", this.newsHandleScroll, true);
    // this.getNewsList(currentSymbol?.product_details?.symbol);
    if (mode === "add") {
      this.setState({
        params: {
          ...this.state.params,
          open_price: currentSymbol?.sell,
          trading_volume,
          lots,
          totalFunds,
        },
        positionTypeMap: currentSymbol?.symbol_display?.position_type,
        leverageMap: leverageMap,
        stockParams: {
          ...stockParams,
          holdDays: currentSymbol?.symbol_display?.position_type[0],
          leverage: currentSymbol?.symbol_display?.leverage.split(",")[0],
          rules: {
            calculate_for_buy_hands_fee,
            calculate_for_buy_stock_fee,
            calculate_for_sell_hands_fee,
            calculate_for_sell_stock_fee,
          },
        },
      });
    } else {
      this.setState({
        stockParams: {
          ...stockParams,
          leverage: currentTrade.leverage,
          holdDays: currentTrade.position_type,
        },
        params: {
          ...this.state.params,
          open_price: currentTrade.open_price,
          trading_volume: currentTrade.trading_volume,
          lots: currentTrade.lots,
          take_profit: currentTrade.take_profit,
          stop_loss: currentTrade.stop_loss,

          totalFunds,
        },
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {}

  newsHandleScroll = () => {
    const { newsError, newsHasMore, tabDataLoading } = this.state;

    let newsOuterHeight = $$(
      "#view-market .trade-detail-more-info-news .am-tabs-pane-wrap "
    )[1].clientHeight;
    if (newsOuterHeight === 0) return;

    // Bails early if:
    // * there's an error
    // * it's already loading
    // * there's nothing left to load
    if (newsError || tabDataLoading || !newsHasMore) return;

    let scrollTop = $$(
      "#view-market .trade-detail-more-info-news .news-content "
    )[0].scrollTop;
    let scrollHeight = $$(
      "#view-market .trade-detail-more-info-news .news-content "
    )[0].scrollHeight;
    let newsInnerHeight = $$(
      "#view-market .trade-detail-more-info-news .news-content "
    )[0].clientHeight;

    // Checks that the page has scrolled to the bottom
    if (newsInnerHeight + scrollTop >= scrollHeight) {
      this.getNewsList();
    }
  };
  getTradingVolumeInfo = (margin_value, leverage, sell, contract_size) => {
    const totalFunds = math
      .chain(margin_value)
      .multiply(leverage ? leverage : 0)
      .done();

    const trading_volume = this.getStockBuyCount(
      totalFunds,
      sell,
      contract_size
    );

    const lots = math.chain(trading_volume).divide(contract_size).done();

    return {
      totalFunds,
      trading_volume,
      lots,
    };
  };
  onChangeTabs = (tab, index) => {
    // console.log('onChange', index, tab);
    if (tab.code === "fund") {
      this.getFunds();
    } else if (tab.code === "news") {
      this.setState({ page: 1, newsList: [], newsListCount: 0 }, () => {
        this.getNewsList();
      });
    }
  };

  getFunds = async () => {
    const { currentSymbol } = this.props.market;
    const { type_display: currentSymbolType } =
      currentSymbol?.symbol_display ?? {};
    this.setState({ tabDataLoading: true }, async () => {
      const id = currentSymbol?.product_details?.symbol;
      const res = await api.trade.getFunds(id, {});
      if (res.status === 200) {
        this.setState({ tabDataLoading: false, fund: res.data });
      } else {
        // 某些产品没有盘口资讯，会回传 404
        this.setState({ tabDataLoading: false, fund: "" });
      }
    });
  };

  getNewsList = async () => {
    const { currentSymbol } = this.props.market;
    this.setState({ tabDataLoading: true }, async () => {
      const res = await api.news.getNewsList({
        params: {
          symbol_code: currentSymbol?.product_details?.symbol,
          page: this.state.page,
          // page_size: 1
        },
      });

      if (res.status === 200) {
        this.setState(
          {
            tabDataLoading: false,
            page: this.state.page + 1,
            newsList: [...this.state.newsList, ...res.data.results],
            newsListCount: res.data.count,
          },
          () => {
            const { newsList, newsListCount } = this.state;
            this.setState({ newsHasMore: newsList.length < newsListCount });
          }
        );
      }
    });
  };

  fetchCurrentSymbol = async () => {
    const { currentSymbol, getCurrentSymbol } = this.props.market;
    const { id, mode } = this.props;
    if (utils.isEmpty(currentSymbol) || currentSymbol.id !== id) {
      await getCurrentSymbol(id);
    }
  };

  getStockBuyCount = (totalFunds, sell, contract_size) => {
    const buyCount = math
      .chain(totalFunds)
      .divide(sell)
      .divide(contract_size)
      .done();
    const countRounding = math.fix(buyCount);

    return math.chain(countRounding).multiply(contract_size).done();
  };

  calculateForValue = (formulaName, obj, decimals_place) => {
    let formula = this.profitRule[formulaName];
    if (!formula) return 0;

    for (let key in obj) {
      if (formula.indexOf(key) === -1) {
        continue;
      }

      formula = formula.replace(key, obj[key]);
    }

    try {
      return math.evaluate(formula).toFixed(2);
    } catch (e) {
      return 0;
    }
  };

  setStopLess = (value, stop_less, action) => {
    let retV = 0;
    switch (action) {
      case 0:
        retV = value - stop_less;
        break;
      case 1:
        retV = value + stop_less;
        break;
    }
    return retV;
  };

  setTakeProfit = (value, take_profit, change, action) => {
    let retV = 0;
    let basic = 0;
    switch (action) {
      case 0:
        basic = value + take_profit;
        retV = basic + change;
        if (basic > retV) {
          retV = basic;
        }
        break;
      case 1:
        basic = value - take_profit;
        retV = basic + change;
        if (basic < retV) {
          retV = basic;
        }
        break;
    }

    return retV;
  };

  setPointLimit = (type, origin, profit) => {
    let retV = 0;
    switch (type) {
      case "high":
        retV = origin + profit;
        break;
      case "low":
        retV = origin - profit;
        break;
    }

    return retV;
  };

  checkPointLimit = (type, origin, changeValue) => {
    let isOver = false;
    switch (type) {
      case "high":
        isOver = origin < changeValue;
        break;
      case "low":
        isOver = origin > changeValue;
        break;
    }
    const retV = isOver ? origin : changeValue < 0 ? origin : changeValue;
    return retV;
  };
  // initTrade = async () => {
  //   const {
  //     id, mode, trade: {
  //       currentTrade
  //     }
  //   } = this.props;

  //   if (mode != 'add') {
  //     // let action = currentTrade?.action;
  //     // let ret;

  //     // if (action == 0 || action == 1) {
  //     //   ret = tradeTypeOptions[0];
  //     // } else {
  //     //   ret = tradeTypeOptions.find(item => item.id == action);
  //     // }

  //     this.setState({
  //       // currentTradeType: ret,
  //       lossValue: currentTrade.stop_loss,
  //       profitValue: currentTrade.take_profit,
  //       priceValue: currentTrade.open_price,
  //     });
  //   }
  // }

  onLotsChanged = (val) => {
    const { params } = this.state;

    const {
      market: { currentShowSymbol },
    } = this.props;

    val = Number(val);
    val = Number(this.state.params.lots || 0) + val;
    val = Number(val.toFixed(2));

    if (val < currentShowSymbol?.symbol_display?.min_lots) {
      return;
    }

    this.setState({
      params: {
        ...params,
        lots: val,
      },
    });
  };

  onTradeListPageRefresh = async () => {
    const { currentTradeTab } = this.props;
    let resTradeList;
    const res = await this.props.common.$api.trade.getTradeInfo();
    let tradeInfo = {
      balance: res.data.balance,
      // equity: 1014404.86, // 净值
      margin: res.data.margin, // 预付款
      // free_margin: 1014399.22, // 可用预付款
      // margin_level: 18017848.22, // 预付款比例
    };
    if (currentTradeTab === "持仓") {
      resTradeList = await this.props.common.$api.trade.getTradeList({
        params: {
          status: "in_transaction",
        },
      });

      this.props.trade.setTradeList(resTradeList.data);
    }

    if (currentTradeTab === "挂单") {
      resTradeList = await this.props.common.$api.trade.getTradeList({
        params: {
          status: "pending",
        },
      });

      this.props.trade.setTradeList(resTradeList.data, "future");
    }

    if (currentTradeTab === "历史") {
      resTradeList = await this.$api.trade.getFinishTradeList({});

      this.props.trade.setTradeList(resTradeList.data.results, "finish");
      this.props.trade.setFinishTradeInfo(resTradeList.data.total_data);
    }

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
    payload.profit = tradeList.reduce((acc, cur) => acc + cur.profit, 0);
    payload.equity =
      tradeList.reduce((acc, cur) => acc + cur.profit, 0) + payload.balance;
    payload.free_margin = payload.equity - payload.margin;
    payload.margin_level = (payload.equity / payload.margin) * 100;

    setTradeInfo(payload);
  };

  onFieldChanged = (change, field) => {
    const { currentSymbol } = this.props.market;
    const { params, stockParams } = this.state;
    const { action } = stockParams;
    const limit = currentSymbol?.symbol_display?.decimals_place ?? 1;
    const {
      take_profit_point,
      stop_loss_point,
    } = currentSymbol?.symbol_display ?? {
      take_profit_point: 0,
      stop_loss_point: 0,
    };

    let fieldValue = this.state.params[field];
    let type = "";
    let originValue = 0;
    let valueStep = 0;

    if (field == "stop_loss") {
      type = action === 1 ? "low" : "high";
      valueStep = +currentSymbol.sell * stop_loss_point * 0.001;
      originValue = currentSymbol.buy;
    } else if (field == "take_profit") {
      type = action === 0 ? "low" : "high";
      valueStep = currentSymbol.buy * take_profit_point * 0.001;
      originValue = currentSymbol.buy;
    } else {
      fieldValue = +currentSymbol.buy + change;
    }

    if (!fieldValue) {
      fieldValue = this.setPointLimit(type, originValue, valueStep);
    } else {
      fieldValue += change;
    }

    fieldValue = +this.checkPointLimit(type, originValue, fieldValue).toFixed(
      limit
    ); //  +fieldValue;

    this.setState({
      params: {
        ...params,
        [field]: fieldValue,
      },
    });
  };
  onFundsChanged = (value, change, field) => {
    const { stockParams, params } = this.state;
    const { leverage } = stockParams;
    const { currentSymbol } = this.props.market;
    const { product_details, symbol_display } = currentSymbol;
    const { contract_size, min_margin_value } = symbol_display;
    const { sell } = product_details ?? { sell: 0 };
    let fieldValue = value || stockParams[field];
    if (fieldValue)
      if (change !== null) {
        if (!utils.isEmpty(fieldValue)) {
          fieldValue += change;
        } else {
          fieldValue = min_margin_value;
        }
      }

    const { lots, trading_volume, totalFunds } = this.getTradingVolumeInfo(
      fieldValue,
      leverage,
      sell,
      contract_size
    );
    this.setState({
      stockParams: {
        ...stockParams,
        [field]: fieldValue,
      },
      params: {
        ...params,
        lots,
        trading_volume,
        totalFunds,
      },
    });
  };

  switchLever = (leverage) => {
    const { stockParams, params } = this.state;
    const { currentSymbol } = this.props.market;
    const { product_details, symbol_display } = currentSymbol;
    const { contract_size } = symbol_display;
    const { sell } = product_details ?? { sell: 0 };
    const { margin_value } = stockParams;
    const { lots, trading_volume, totalFunds } = this.getTradingVolumeInfo(
      margin_value,
      leverage,
      sell,
      contract_size
    );
    this.setState({
      stockParams: {
        ...stockParams,
        leverage: leverage,
      },
      params: {
        ...params,
        lots,
        trading_volume,
        totalFunds,
      },
    });
  };

  switchHoldDays = (days) => {
    const { stockParams } = this.state;
    this.setState({
      stockParams: {
        ...stockParams,
        holdDays: days,
      },
    });
  };

  switchStockType = (id) => {
    const { stockParams } = this.state;
    this.setState({
      stockParams: {
        ...stockParams,
        action: id,
      },
    });
  };

  switchTradeOptions = (id) => {
    const { params } = this.state;
    const { currentSymbol } = this.props.market;

    if (id === 2 || id === 4) {
      this.setState({
        params: {
          ...params,
          open_price: currentSymbol?.buy,
          action: id,
        },
      });
    } else if (id === 3 || id === 5) {
      this.setState({
        params: {
          ...params,
          open_price: currentSymbol?.sell,
          action: id,
        },
      });
    } else {
      this.setState({
        params: {
          ...params,
          open_price: undefined,
          action: id,
        },
      });
    }
  };

  switchTradeType = (name) => {
    const { params } = this.state;
    if (name === "instance") {
      // this.setState({
      //   params: {
      //     ...params,
      //     action: executeOptions[0].id
      //   }
      // })
      this.switchTradeOptions(executeOptions[0].id);
    }
    if (name === "future") {
      // this.setState({
      //   params: {
      //     ...params,
      //     action: pendingOrderOptions[0].id
      //   }
      // })
      this.switchTradeOptions(pendingOrderOptions[0].id);
    }
    this.setState({ tradeType: name });
  };

  switchTradeDetail = () => {
    const { moreInfo } = this.state;
    this.setState({ moreInfo: !moreInfo });
  };

  onSubmit = async (totalPlatformCurrency) => {
    const { params, stockParams, isSubmit } = this.state;
    const {
      mode,
      market: { currentSymbol },
      trade: { currentTrade, tradeInfo },
    } = this.props;
    const { success, error } = Modal;
    const lots = params.lots;
    const { min_margin_value, max_margin_value } = currentSymbol.symbol_display;
    const { margin_value } = stockParams;

    if (!isSubmit) {
      this.setState({
        isSubmit: true,
      });
    } else {
      return;
    }

    try {
      if (mode == "add") {
        const decimals_place = currentSymbol?.symbol_display?.decimals_place;

        const payload = {
          trading_volume: (
            Number(lots) * Number(currentSymbol?.symbol_display?.contract_size)
          ).toFixed(decimals_place),
          lots: lots.toString(),
          symbol: currentSymbol.id,
          action: params.action,
          position_type: stockParams.holdDays,
        };

        if (tradeInfo.free_margin - totalPlatformCurrency < 0) {
          error({
            title: "提示",
            className: "app-modal success-modal",
            content: "可用预付款不足",
          });
          this.setState({
            isSubmit: false,
          });
          return;
        }

        if (stockParams.margin_value) {
          payload.margin_value = stockParams.margin_value;
        }
        if (stockParams.leverage) {
          payload.leverage = stockParams.leverage;
        }

        if (params.take_profit !== undefined) {
          payload.take_profit = params.take_profit;
        }

        if (params.stop_loss !== undefined) {
          payload.stop_loss = params.stop_loss;
        }

        if (params.action == 0) {
          payload.open_price = currentSymbol?.buy;
        } else if (params.action == 1) {
          payload.open_price = currentSymbol?.sell;
        } else {
          payload.open_price = params.open_price;
        }

        if (utils.isEmpty(payload.open_price) || utils.isEmpty(payload.lots)) {
          return false;
        }

        const res = await this.props.common.$api.trade.createTrade(payload);
        const that = this;

        if (res.status == 201) {
          success({
            title: "提示",
            content: "下单成功",
            className: "app-modal success-modal",
            centered: true,
            // cancelText: "取消",
            okText: "确认",
            onOk() {
              that.$f7router.back("/trade/", {
                force: false,
              });
            },
            // onCancel() {
            // },
          });
        } else {
          error({
            title: "提示",
            className: "app-modal success-modal",
            content: res.data.message,
            okText: "确认",
            onOk() {},
          });

          this.setState({
            isSubmit: false,
          });
        }
      } else if (mode === "update") {
        const payload = params;
        const res = await this.props.common.$api.trade.updateTrade(
          currentTrade.order_number,
          payload
        );
        const that = this;

        if (res.status == 200) {
          const { success } = Modal;
          success({
            title: "提示",
            content: "修改成功",
            className: "app-modal success-modal",
            centered: true,
            // cancelText: "取消",
            okText: "确认",
            onOk() {
              that.onTradeListPageRefresh();
              that.$f7router.back("/trade/", {
                force: false,
              });
            },
            // onCancel() {
            // },
          });
        }
      } else if (mode === "delete") {
        const res = await this.props.common.$api.trade.closeTrade(
          currentTrade.order_number
        );
        const that = this;

        if (res.status == 200) {
          const { success } = Modal;
          success({
            title: "提示",
            content: "平倉成功",
            className: "app-modal success-modal",
            centered: true,
            // cancelText: "取消",
            okText: "确认",
            onOk() {
              that.onTradeListPageRefresh();
              that.$f7router.back("/trade/", {
                force: false,
              });
            },
            // onCancel() {
            // },
          });
        }
      }
    } catch (err) {
      this.$msg.error(err?.response?.data?.message);
      this.setState({
        isSubmit: false,
      });
    }
  };

  renderStockInput = () => {
    const { mode, currentTradeTab } = this.props;
    const { currentTrade } = this.props.trade;
    const { swaps, taxes, fee } = currentTrade;
    const { currentSymbol, currentShowSymbol } = this.props.market;
    const {
      open_currency_rate,
      close_currency_rate,
      hands_fee_for_sell,
      hands_fee_for_buy,
      contract_size,
      decimals_place,
      purchase_fee,
      selling_fee,
    } = currentSymbol.symbol_display;

    const { sell } = currentSymbol.product_details ?? {
      sell: 0,
    };
    const { getKeyConfig } = this.props.common;
    const refCurrency = getKeyConfig("platform_currency");
    const {
      tradeType,
      params,
      stockParams,
      positionTypeMap,
      leverageMap,
      isSubmit,
    } = this.state;
    const { leverage, margin_value, rules, action } = stockParams;
    const { totalFunds, trading_volume, lots } = params;

    const {
      calculate_for_buy_hands_fee,
      calculate_for_buy_stock_fee,
      calculate_for_sell_hands_fee,
      calculate_for_sell_stock_fee,
    } = rules;
    const calcObj = {
      trading_volume,
      margin_value,
      open_currency_rate,
      close_currency_rate,
      hands_fee_for_sell,
      hands_fee_for_buy,
      open_price: sell,
      purchase_fee,
      selling_fee,
    };
    const handFee =
      fee ||
      this.calculateForValue(
        calculate_for_buy_hands_fee,
        calcObj,
        decimals_place
      );

    const calculate_stock_fee =
      action === 0 ? calculate_for_buy_stock_fee : calculate_for_sell_stock_fee;
    const stockFee =
      swaps ||
      this.calculateForValue(calculate_stock_fee, calcObj, decimals_place);

    const stockTypes = this.getNowStockTypeOptions(stockParams.holdDays);

    const stepLevel = currentSymbol?.symbol_display
      ? (1 / 10) * decimals_place
      : 0.001;

    const totalPlatformCurrency = math
      .chain(margin_value)
      .multiply(open_currency_rate)
      .add(handFee)
      .done()
      .toFixed(2);

    return (
      <>
        <div className="trade-detail-input-container">
          {(mode === "update" || mode === "delete") && (
            <div className="trade-detail-input-item">
              <div className="trade-detail-input-item-title">开仓价格</div>
              <div className="trade-detail-input-item-btn-group">
                <div className={`trade-detail-input-item-text`}>
                  {params.open_price}
                </div>
              </div>
            </div>
          )}

          <div className="trade-detail-input-item">
            <div className="trade-detail-input-item-title">
              {mode !== "add" && "持仓"}类型
            </div>
            <div className="trade-detail-input-item-btn-group">
              {mode === "add" && (
                <>
                  {positionTypeMap.map((item, index) => {
                    return (
                      <div
                        key={index}
                        onClick={() => {
                          this.switchHoldDays(item);
                        }}
                        className={`trade-detail-input-item-btn ${
                          stockParams.holdDays === item && "btn-active"
                        }`}
                      >
                        {item}
                      </div>
                    );
                  })}
                  {/* {<div
                    onClick={() => { this.switchHoldDays("T+0") }}
                    className={`trade-detail-input-item-btn ${stockParams.holdDays === "T+0" && 'btn-active'}`}>
                    {"T+0"}
                  </div>}
                  <div
                    onClick={() => { this.switchHoldDays("T+1") }}
                    className={`trade-detail-input-item-btn ${stockParams.holdDays === "T+1" && 'btn-active'}`}>
                    {"T+1"}
                  </div> */}
                </>
              )}
              {(mode === "update" || mode === "delete") && (
                <div className={`trade-detail-input-item-text`}>
                  {stockParams.holdDays}
                </div>
              )}
            </div>
          </div>

          {mode === "add" && (
            <div className="trade-detail-input-item">
              <div className="trade-detail-input-item-title">方向</div>
              <div className="trade-detail-input-item-btn-group">
                {stockTypes.map((item, index) => {
                  return (
                    <div
                      key={index}
                      onClick={() => {
                        this.switchStockType(item.id);
                      }}
                      className={`trade-detail-input-item-btn ${
                        (stockParams.action === item.id ||
                          stockTypes.length === 1) &&
                        "btn-active"
                      }`}
                    >
                      {item.name}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {mode !== "add" && (
            <div className="trade-detail-input-item">
              <div className="trade-detail-input-item-title">方向</div>
              <div className="trade-detail-input-item-btn-group">
                <div className={`trade-detail-input-item-text`}>
                  {tradeActions[Number(stockParams.action)]}
                </div>
              </div>
            </div>
          )}

          {/* {mode !== 'add' && <div className="trade-detail-input-item">
            <div className="trade-detail-input-item-title">类型</div>
            <div className="trade-detail-input-item-btn-group">
              {currentTradeTab === '持仓' && <div
                onClick={() => { this.switchExecuteMotion("delete") }}
                className={`trade-detail-input-item-btn ${executeMotion === "delete" && 'btn-active'}`}>
                {"平仓"}
              </div>}
              <div
                onClick={() => { this.switchExecuteMotion("update") }}
                className={`trade-detail-input-item-btn ${executeMotion === "update" && 'btn-active'}`}>
                {"修改"}
              </div>
            </div>
          </div>} */}

          {mode === "add" && (
            <div className="trade-detail-input-item">
              <div className="trade-detail-input-item-title">操作资金</div>
              <div className="trade-detail-input-item-btn-group">
                <div
                  className="trade-detail-input-item-less-btn"
                  onClick={() => {
                    this.onFundsChanged(
                      null,
                      -stockParams.unitFunds,
                      "margin_value"
                    );
                  }}
                >
                  －
                </div>
                <div className="trade-detail-input-item-input">
                  <Input
                    type="number"
                    min={100}
                    value={stockParams.margin_value}
                    onChange={(evt) => {
                      this.onFundsChanged(
                        Number(evt.target.value),
                        null,
                        "margin_value"
                      );
                    }}
                  />
                </div>
                <div
                  className="trade-detail-input-item-add-btn"
                  onClick={() => {
                    this.onFundsChanged(
                      null,
                      stockParams.unitFunds,
                      "margin_value"
                    );
                  }}
                >
                  ＋
                </div>
              </div>
            </div>
          )}

          <div className="trade-detail-input-item">
            <div className="trade-detail-input-item-title">槓杆倍数</div>
            <div className="trade-detail-input-item-btn-group">
              {mode === "add" && (
                <>
                  {leverageMap.map((item, index) => {
                    return (
                      <div
                        key={index}
                        onClick={() => {
                          this.switchLever(item);
                        }}
                        className={`trade-detail-input-item-btn-small ${
                          stockParams.leverage === item && "btn-active"
                        }`}
                      >
                        {item}
                      </div>
                    );
                  })}
                </>
              )}
              {(mode === "update" || mode === "delete") && (
                <div className={`trade-detail-input-item-text`}>{leverage}</div>
              )}
            </div>
          </div>

          <div className="trade-detail-input-item">
            <div className="trade-detail-input-item-title">操盘资金</div>
            <div className="trade-detail-input-item-btn-group">
              <div className={`trade-detail-input-item-text`}>{totalFunds}</div>
            </div>
          </div>

          <div className="trade-detail-input-item">
            <div className="trade-detail-input-item-title">买入数量</div>
            <div className="trade-detail-input-item-btn-group">
              <div className={`trade-detail-input-item-text`}>
                {trading_volume}
              </div>
            </div>
          </div>
          <div className="trade-detail-input-item">
            <div className="trade-detail-input-item-title">止盈</div>
            <div className="trade-detail-input-item-btn-group">
              {mode !== "delete" ? (
                <>
                  <div
                    className="trade-detail-input-item-less-btn"
                    onClick={() => {
                      this.onFieldChanged(-stepLevel, "take_profit");
                    }}
                  >
                    －
                  </div>
                  <div className="trade-detail-input-item-input">
                    <Input
                      type="number"
                      min={0.01}
                      placeholder={"未设置"}
                      value={params.take_profit || undefined}
                      onChange={(evt) => {
                        this.setState({
                          params: {
                            ...params,
                            take_profit: Number(evt.target.value),
                          },
                        });
                      }}
                    />
                  </div>
                  <div
                    className="trade-detail-input-item-add-btn"
                    onClick={() => {
                      this.onFieldChanged(stepLevel, "take_profit");
                    }}
                  >
                    ＋
                  </div>
                </>
              ) : (
                <div className={`trade-detail-input-item-text`}>
                  {params.take_profit}
                </div>
              )}
            </div>
          </div>

          <div className="trade-detail-input-item">
            <div className="trade-detail-input-item-title">止损</div>
            <div className="trade-detail-input-item-btn-group">
              {mode !== "delete" ? (
                <>
                  <div
                    className="trade-detail-input-item-less-btn"
                    onClick={() => {
                      this.onFieldChanged(-stepLevel, "stop_loss");
                    }}
                  >
                    －
                  </div>
                  <div className="trade-detail-input-item-input">
                    <Input
                      type="number"
                      min={0.01}
                      placeholder={"未设置"}
                      value={params.stop_loss || undefined}
                      onChange={(evt) => {
                        this.setState({
                          params: {
                            ...params,
                            stop_loss: Number(evt.target.value),
                          },
                        });
                      }}
                    />
                  </div>
                  <div
                    className="trade-detail-input-item-add-btn"
                    onClick={() => {
                      this.onFieldChanged(stepLevel, "stop_loss");
                    }}
                  >
                    ＋
                  </div>
                </>
              ) : (
                <div className={`trade-detail-input-item-text`}>
                  {params.stop_loss}
                </div>
              )}
            </div>
          </div>
        </div>
        <div
          className={`trade-detail-submit-btn 
                        ${
                          (tradeType !== "instance" &&
                            utils.isEmpty(params.open_price)) ||
                          utils.isEmpty(params.lots) ||
                          isSubmit
                            ? "reject"
                            : ""
                        }
                        ${mode === "add" ? "add" : "modify"}`}
          style={{ marginBottom: "20px" }}
          onClick={() => {
            this.onSubmit(totalPlatformCurrency);
          }}
        >
          {mode === "add" ? "下单" : mode === "update" ? "修改" : "平仓"}
        </div>

        <div className="trade-detail-remarks-container">
          <div className="trade-detail-remarks-item">
            <div className="trade-detail-remarks-item-title">服務費</div>
            <div className="trade-detail-remarks-item-content">
              {refCurrency}${handFee}(手續費)
            </div>
          </div>
          <div className="trade-detail-remarks-item">
            <div className="trade-detail-remarks-item-title">遞延費</div>
            <div className="trade-detail-remarks-item-content">
              ${stockFee}({refCurrency}/交易日)
            </div>
          </div>
          <div className="trade-detail-remarks-item">
            <div className="trade-detail-remarks-item-title">參考匯率</div>
            <div className="trade-detail-remarks-item-content">
              ${open_currency_rate}
            </div>
          </div>
          <div className="trade-detail-remarks-item">
            <div className="trade-detail-remarks-item-title">總計</div>
            <div className="trade-detail-remarks-item-content">
              {refCurrency}${`${totalPlatformCurrency}`}元
            </div>
          </div>
          <div className="trade-detail-remarks-placeholder">
            *總計=操作資金+服務費
          </div>
        </div>
      </>
    );
  };

  renderForexInput = () => {
    const { mode, currentTradeTab } = this.props;
    const { currentTrade } = this.props.trade;
    const { currentSymbol, currentShowSymbol } = this.props.market;
    const { tradeType, params } = this.state;
    const stepLevel = currentSymbol?.symbol_display?.decimals_place
      ? 1 / 10 ** currentSymbol?.symbol_display?.decimals_place
      : 0.001;
    return (
      <>
        <div className="trade-detail-input-container">
          <div className="trade-detail-input-item">
            <div className="trade-detail-input-item-title">类型</div>
            <div className="trade-detail-input-item-btn-group">
              {mode === "add" &&
                tradeTypeOptions.map((item, index) => {
                  return (
                    <div
                      key={index}
                      className={`trade-detail-input-item-btn ${
                        tradeType === item.id && "btn-active"
                      }`}
                      onClick={() => {
                        this.switchTradeType(item.id);
                      }}
                    >
                      {item.name}
                    </div>
                  );
                })}
              {(mode === "update" || mode === "delete") && (
                <div className={`trade-detail-input-item-text`}>
                  {Number(currentTrade.action) === 0 ||
                  Number(currentTrade.action) === 1
                    ? "立即执行"
                    : "挂单"}
                </div>
              )}
              {/* <div className="trade-detail-input-item-btn">立即执行</div>
          <div className="trade-detail-input-item-btn">挂单</div> */}
            </div>
          </div>

          {mode !== "add" && (
            <div className="trade-detail-input-item">
              <div className="trade-detail-input-item-title">方向</div>
              <div className="trade-detail-input-item-btn-group">
                <div className={`trade-detail-input-item-text`}>
                  {tradeActions[Number(currentTrade.action)]}
                </div>
              </div>
            </div>
          )}

          {mode === "add" && (
            <div className="trade-detail-input-item">
              <div className="trade-detail-input-item-title">类型</div>
              <div className="trade-detail-input-item-btn-group">
                {tradeType === "future" &&
                  pendingOrderOptions.map((item, index) => {
                    return (
                      <div
                        key={index}
                        onClick={() => {
                          this.switchTradeOptions(item.id);
                        }}
                        className={`trade-detail-input-item-btn ${
                          params.action === item.id && "btn-active"
                        }`}
                      >
                        {item.name}
                      </div>
                    );
                  })}
                {tradeType === "instance" &&
                  executeOptions.map((item, index) => {
                    return (
                      <div
                        key={index}
                        onClick={() => {
                          this.switchTradeOptions(item.id);
                        }}
                        className={`trade-detail-input-item-btn ${
                          params.action === item.id && "btn-active"
                        }`}
                      >
                        {item.name}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {(currentTradeTab === "挂单" || tradeType === "future") && (
            <div className="trade-detail-input-item">
              <div className="trade-detail-input-item-title">价格</div>
              <div className="trade-detail-input-item-btn-group">
                <div
                  className="trade-detail-input-item-less-btn"
                  onClick={() => {
                    this.onFieldChanged(-stepLevel, "open_price");
                  }}
                >
                  －
                </div>
                <div className="trade-detail-input-item-input">
                  <Input
                    type="number"
                    min={0.01}
                    value={params.open_price}
                    onChange={(evt) => {
                      this.setState({
                        params: {
                          ...params,
                          open_price: evt.target.value,
                        },
                      });
                    }}
                  />
                </div>
                <div
                  className="trade-detail-input-item-add-btn"
                  onClick={() => {
                    this.onFieldChanged(stepLevel, "open_price");
                  }}
                >
                  ＋
                </div>
              </div>
            </div>
          )}

          <div className="trade-detail-input-item">
            <div className="trade-detail-input-item-title">数量</div>
            {mode !== "delete" && currentTradeTab !== "持仓" ? (
              <div className="trade-detail-input-item-btn-group">
                <div
                  className="trade-detail-input-item-less-btn"
                  onClick={() => {
                    this.onLotsChanged(
                      0 - currentShowSymbol?.symbol_display?.lots_step
                    );
                  }}
                >
                  －
                </div>
                <div className="trade-detail-input-item-input">
                  <Input
                    type="number"
                    min={0.01}
                    placeholder={"未设置"}
                    value={params.lots || undefined}
                    onChange={(evt) => {
                      if (
                        evt.target.value <
                        currentShowSymbol?.symbol_display?.min_lots
                      )
                        return;
                      this.setState({
                        params: {
                          ...params,
                          lots: evt.target.value,
                        },
                      });
                    }}
                  />
                </div>
                <div
                  className="trade-detail-input-item-add-btn"
                  onClick={() => {
                    this.onLotsChanged(
                      currentShowSymbol?.symbol_display?.lots_step
                    );
                  }}
                >
                  ＋
                </div>
              </div>
            ) : (
              <div className="trade-detail-input-item-btn-group">
                <div className={`trade-detail-input-item-text`}>
                  {params.lots}
                </div>
              </div>
            )}
          </div>

          <div className="trade-detail-input-item">
            <div className="trade-detail-input-item-title">止盈</div>
            <div className="trade-detail-input-item-btn-group">
              {mode !== "delete" ? (
                <>
                  <div
                    className="trade-detail-input-item-less-btn"
                    onClick={() => {
                      this.onFieldChanged(-stepLevel, "take_profit");
                    }}
                  >
                    －
                  </div>
                  <div className="trade-detail-input-item-input">
                    <Input
                      type="number"
                      min={0.01}
                      placeholder={"未设置"}
                      value={params.take_profit || undefined}
                      onChange={(evt) => {
                        this.setState({
                          params: {
                            ...params,
                            take_profit: Number(evt.target.value),
                          },
                        });
                      }}
                    />
                  </div>
                  <div
                    className="trade-detail-input-item-add-btn"
                    onClick={() => {
                      this.onFieldChanged(stepLevel, "take_profit");
                    }}
                  >
                    ＋
                  </div>
                </>
              ) : (
                <div className={`trade-detail-input-item-text`}>
                  {params.stop_loss}
                </div>
              )}
            </div>
          </div>

          <div className="trade-detail-input-item">
            <div className="trade-detail-input-item-title">止损</div>
            <div className="trade-detail-input-item-btn-group">
              {mode !== "delete" ? (
                <>
                  <div
                    className="trade-detail-input-item-less-btn"
                    onClick={() => {
                      this.onFieldChanged(-stepLevel, "stop_loss");
                    }}
                  >
                    －
                  </div>
                  <div className="trade-detail-input-item-input">
                    <Input
                      type="number"
                      min={0.01}
                      placeholder={"未设置"}
                      value={params.stop_loss || undefined}
                      onChange={(evt) => {
                        this.setState({
                          params: {
                            ...params,
                            stop_loss: Number(evt.target.value),
                          },
                        });
                      }}
                    />
                  </div>
                  <div
                    className="trade-detail-input-item-add-btn"
                    onClick={() => {
                      this.onFieldChanged(stepLevel, "stop_loss");
                    }}
                  >
                    ＋
                  </div>
                </>
              ) : (
                <div className={`trade-detail-input-item-text`}>
                  {params.stop_loss}
                </div>
              )}
            </div>
          </div>
        </div>
        <div
          className={`trade-detail-submit-btn 
                        ${
                          (tradeType !== "instance" &&
                            utils.isEmpty(params.open_price)) ||
                          utils.isEmpty(params.lots)
                            ? "reject"
                            : ""
                        }
                        ${mode === "add" ? "add" : "modify"}`}
          style={{ marginBottom: "30px" }}
          onClick={this.onSubmit}
        >
          {mode === "add" ? "下单" : mode === "update" ? "修改" : "平仓"}
        </div>
      </>
    );
  };
  renderFundContent = () => {
    // 渲染盘口资讯
    const { fund, tabDataLoading } = this.state;
    const { currentSymbol } = this.props.market;
    // console.log("this.state.fund :>> ", this.state.fund);
    // console.log("this.props.market :>> ", this.props.market);
    const { type_display: currentSymbolType } =
      currentSymbol?.symbol_display ?? {};
    // console.log("currentSymbolType :>> ", currentSymbolType);
    return (
      <div className="fund-content">
        {!utils.isEmpty(fund) ? (
          <ReactEcharts
            option={{
              color: ["#b8eeb8", "#EEB8B8", "#fff798", "#9de6e2"],
              legend: {
                top: 15,
                data: ["主力买入", "主力卖出", "散户买入", "散户卖出"],
                textStyle: { color: "#838d9e", fontSize: 14 },
              },
              series: [
                {
                  bottom: 0,
                  top: 50,
                  right: 0,
                  left: 0,
                  type: "pie",
                  radius: "55%",
                  data: [
                    {
                      value: Math.round(Number(fund.major_in_amount) / 10000),
                      name: "主力买入",
                    },
                    {
                      value: Math.round(Number(fund.major_out_amount) / 10000),
                      name: "主力卖出",
                    },
                    {
                      value: Math.round(Number(fund.retail_in_amount) / 10000),
                      name: "散户买入",
                    },
                    {
                      value: Math.round(Number(fund.retail_out_amount) / 10000),
                      name: "散户卖出",
                    },
                  ],
                  label: { fontSize: 14 },
                },
              ],
            }}
          />
        ) : (
          <div />
        )}
        <div>主力、散户资金流向</div>
        {utils.isEmpty(fund) && (
          <div>
            <span>此产品无资金流向显示</span>
          </div>
        )}
        {!utils.isEmpty(fund) && (
          <>
            <div>
              <span></span>
              <span>主力买入</span>
              <span>主力卖出</span>
              <span>散户买入</span>
              <span>散户卖出</span>
            </div>
            <div>
              <span>金额(万)</span>
              <span>{Math.round(Number(fund.major_in_amount) / 10000)}</span>
              <span>{Math.round(Number(fund.major_out_amount) / 10000)}</span>
              <span>{Math.round(Number(fund.retail_in_amount) / 10000)}</span>
              <span>{Math.round(Number(fund.retail_out_amount) / 10000)}</span>
            </div>
          </>
        )}
        {tabDataLoading && this.renderTabDataLoadingSpinner()}
      </div>
    );
  };
  renderDetail = () => {
    const { currentSymbol } = this.props.market;
    const { selectedSymbolInfo } = this.props.common;
    console.log(toJS(selectedSymbolInfo));
    const { symbol_display, product_details } = currentSymbol;
    const { quoted_price } = this.props;
    const onePirceField = {
      open: { text: "开盘", format: (val) => String(val) },
      last_close: { text: "昨收", format: (val) => String(val) },
      high: { text: "最高", format: (val) => String(val) },
      low: { text: "最低", format: (val) => String(val) },
      volume: { text: "总量", format: (val) => String(val) },
      amount: {
        text: "总额",
        format: (val) => `${String(Math.round(Number(val) / 10000))}万`,
      },
      change: { text: "涨跌", format: (val) => String(val) },
      chg: { text: "涨跌幅", format: (val) => `${String(val)}%` },
      amplitude: { text: "振幅", format: (val) => `${String(val * 100)}%` },
      contract_size: { text: "每手股数", format: (val) => String(val) },
      purchase_fee: { text: "买入库存费", format: (val) => `${String(val)}%` },
      selling_fee: { text: "卖出库存费", format: (val) => `${String(val)}%` },
    };

    const twoPriceField = {
      decimals_place: { text: "小数点位", format: (val) => String(val) },
      contract_size: { text: "合约大小", format: (val) => String(val) },
      spread: { text: "点差", format: (val) => String(val) },
      margin_currency_display: {
        text: "预付款货币",
        format: (val) => String(val),
      },
      profit_currency_display: {
        text: "获利货币",
        format: (val) => String(val),
      },
      min_lots: { text: "最小交易手数", format: (val) => String(val) },
      max_lots: { text: "最大交易手数", format: (val) => String(val) },
      lots_step: { text: "交易数步长", format: (val) => String(val) },
      purchase_fee: { text: "买入库存费", format: (val) => `${String(val)}%` },
      selling_fee: { text: "卖出库存费", format: (val) => `${String(val)}%` },
    };

    const field = quoted_price === "one_price" ? onePirceField : twoPriceField;
    return (
      <div className="trade-detail-more-info-contract">
        <div className="trade-detail-more-info-contract-title">合约资讯</div>
        <div className={"trade-detail-more-info-contract-content"}>
          {Object.entries(field).map(([key, detail]) => {
            const displayValue =
              symbol_display[key] ?? product_details[key] ?? "-";
            const newValue = selectedSymbolInfo[key];
            console.log(newValue);
            const currentValue = newValue ?? displayValue;
            return (
              <div>
                <span>{detail.text}</span>
                <span>{detail.format(currentValue)}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  renderNewsContent = () => {
    // 渲染新闻资讯
    const { newsList, tabDataLoading } = this.state;
    return (
      <div className="news-content">
        {utils.isEmpty(newsList) && (
          <div className="no-news">此产品无新聞显示</div>
        )}
        {!utils.isEmpty(newsList) &&
          newsList.map((item, index) => (
            <div
              key={index}
              className="news-content-item"
              onClick={() => {
                this.$f7router.navigate("/news/detail", {
                  props: {
                    newsDetail: item,
                  },
                });
              }}
            >
              <div className="news-content-item-text">
                <p>{item.title}</p>
                <p>
                  {moment(item.pub_time * 1000).format("YYYY/MM/DD HH:mm:ss")}
                </p>
              </div>
              {!utils.isEmpty(item.thumbnail) && (
                <div className="news-content-item-img">
                  <img src={item.thumbnail} alt="thumbmail" />
                </div>
              )}
            </div>
          ))}
        {tabDataLoading && this.renderTabDataLoadingSpinner()}
      </div>
    );
  };
  renderTabDataLoadingSpinner = () => {
    return (
      <div className="spin-container">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
      </div>
    );
  };
  render() {
    const { mode, common } = this.props;
    const { selectedSymbolInfo } = this.props.common;
    console.log(selectedSymbolInfo);
    const quoted_price = common.getKeyConfig("quoted_price");
    const { currentSymbol } = this.props.market;
    const { moreInfo, tradeType, params, tabDataLoading } = this.state;
    const isHigh = selectedSymbolInfo.change
      ? selectedSymbolInfo?.change > 0
      : currentSymbol?.product_details?.change > 0;
    return (
      <Page noToolbar>
        <Navbar>
          <NavLeft>
            <Link back>
              <Icon color={"white"} f7={"chevron_left"} size={r(18)}></Icon>
            </Link>
          </NavLeft>
          <NavTitle className="trade-detail-navbar-center">
            <span>{currentSymbol?.symbol_display?.name}</span>
            <span className="stock-code">
              {currentSymbol?.product_details?.symbol}
            </span>
          </NavTitle>
          <NavRight></NavRight>
        </Navbar>
        <div className="trade-detail-stock-container">
          <div
            className={`self-select-buy-sell-block now-stock ${
              isHigh && "p-up stock-up"
            } ${!isHigh && "p-down stock-down"}`}
          >
            {selectedSymbolInfo?.sell ?? currentSymbol?.product_details?.sell}
          </div>
          <div className="spread-stock">
            <div>
              <p
                className={`self-select-buy-sell-block ${
                  isHigh && "p-up stock-up"
                } ${!isHigh && "p-down stock-down"}`}
              >
                {selectedSymbolInfo?.change ??
                  currentSymbol?.product_details?.change}
              </p>
              <p
                className={`self-select-buy-sell-block ${
                  isHigh && "p-up stock-up"
                } ${!isHigh && "p-down stock-down"}`}
              >
                {`${
                  selectedSymbolInfo?.chg ??
                  currentSymbol?.product_details?.change
                }%`}
              </p>
            </div>
          </div>
          <div className="detail-btn" onClick={this.switchTradeDetail}>
            {moreInfo ? "收起" : "查看详情"}
          </div>
        </div>
        <div className="trade-detail-price">
          <div className="price-item">
            <span className="price-item-title">卖出</span>
            <span className="price-item-content p-down">
              {selectedSymbolInfo?.sell ?? currentSymbol?.sell}
            </span>
          </div>
          <div className="price-item">
            <span className="price-item-title">买入</span>
            <span className="price-item-content p-up">
              {selectedSymbolInfo?.buy ?? currentSymbol?.buy}
            </span>
          </div>
        </div>

        <div
          className={`trade-detail-more-info-container ${
            moreInfo ? "show" : ""
          }`}
        >
          {this.renderDetail()}
          {/* <div className="trade-detail-more-info-contract">
            <div className="trade-detail-more-info-contract-title">
              合约资讯
            </div>
            <div className="trade-detail-more-info-contract-content">
              <div>
                <span>小数点位</span>
                <span>
                  {currentSymbol?.symbol_display?.decimals_place !==
                    undefined &&
                    currentSymbol?.symbol_display?.decimals_place !== null
                    ? currentSymbol?.symbol_display?.decimals_place
                    : "-"}
                </span>
              </div>
              <div>
                <span>合约大小</span>
                <span>
                  {currentSymbol?.symbol_display?.contract_size !== undefined &&
                    currentSymbol?.symbol_display?.contract_size !== null
                    ? currentSymbol?.symbol_display?.contract_size
                    : "-"}
                </span>
              </div>
              <div>
                <span>点差</span>
                <span>
                  {currentSymbol?.symbol_display?.spread !== undefined &&
                    currentSymbol?.symbol_display?.spread !== null
                    ? currentSymbol?.symbol_display?.spread
                    : "-"}
                </span>
              </div>
              <div>
                <span>预付款货币</span>
                <span>
                  {currentSymbol?.symbol_display?.margin_currency_display !==
                    undefined &&
                    currentSymbol?.symbol_display?.margin_currency_display !==
                    null
                    ? currentSymbol?.symbol_display?.margin_currency_display
                    : "-"}
                </span>
              </div>
              <div>
                <span>获利货币</span>
                <span>
                  {currentSymbol?.symbol_display?.profit_currency_display !==
                    undefined &&
                    currentSymbol?.symbol_display?.profit_currency_display !==
                    null
                    ? currentSymbol?.symbol_display?.profit_currency_display
                    : "-"}
                </span>
              </div>
              <div>
                <span>最小交易手数</span>
                <span>
                  {currentSymbol?.symbol_display?.min_lots !== undefined &&
                    currentSymbol?.symbol_display?.min_lots !== null
                    ? currentSymbol?.symbol_display?.min_lots
                    : "-"}
                </span>
              </div>
              <div>
                <span>最大交易手数</span>
                <span>
                  {currentSymbol?.symbol_display?.max_lots !== undefined &&
                    currentSymbol?.symbol_display?.max_lots !== null
                    ? currentSymbol?.symbol_display?.max_lots
                    : "-"}
                </span>
              </div>
              <div>
                <span>交易数步长</span>
                <span>
                  {currentSymbol?.symbol_display?.lots_step !== undefined &&
                    currentSymbol?.symbol_display?.lots_step !== null
                    ? currentSymbol?.symbol_display?.lots_step
                    : "-"}
                </span>
              </div>
              <div>
                <span>买入库存费</span>
                <span>
                  {currentSymbol?.symbol_display?.purchase_fee !== undefined &&
                    currentSymbol?.symbol_display?.purchase_fee !== null
                    ? currentSymbol?.symbol_display?.purchase_fee
                    : "-"}
                </span>
              </div>
              <div>
                <span>卖出库存费</span>
                <span>
                  {currentSymbol?.symbol_display?.selling_fee !== undefined &&
                    currentSymbol?.symbol_display?.selling_fee !== null
                    ? currentSymbol?.symbol_display?.selling_fee
                    : "-"}
                </span>
              </div>
            </div>
          </div> */}
          <div className="trade-detail-more-info-news">
            <Tabs
              tabs={moreInfoTabs}
              initialPage={0}
              renderTab={(tab) => <span>{tab.title}</span>}
              onChange={this.onChangeTabs}
              // onTabClick={this.onClickTabs}
              tabBarBackgroundColor="transparent"
              tabBarActiveTextColor="#F2E205"
              tabBarInactiveTextColor="#838D9E"
              tabBarUnderlineStyle={{
                border: "1px solid #F2E205",
              }}
            >
              {this.renderFundContent()}
              {this.renderNewsContent()}
            </Tabs>
          </div>
        </div>
        {utils.isEmpty(currentSymbol) ? (
          <Spin
            className="spin-icon"
            indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
          />
        ) : quoted_price !== "one_price" ? (
          this.renderForexInput()
        ) : (
          this.renderStockInput()
        )}
      </Page>
    );
  }

  getNowStockTypeOptions = (holdDay) => {
    const list = Object.assign([], stockTypeOptions);
    if (holdDay === "T+1") {
      return list.splice(0, 1);
    }

    return stockTypeOptions;
  };
}
