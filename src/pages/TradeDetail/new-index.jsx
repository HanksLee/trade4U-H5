import api from 'services';
import React from 'react';
import {
  Page, Navbar, List, ListItem, Block,
  NavTitle,
  NavLeft,
  NavRight,
  Icon,
  Link,
  Toolbar,
  Input
} from 'framework7-react';
import { Toast } from "antd-mobile";
import { Modal, Spin } from 'antd';
import { LoadingOutlined } from "@ant-design/icons";
import {
  tradeTypeOptions,
  tradeActionMap,
  pendingOrderOptions,
  executeOptions,
  executeMotionMap,
  stockTypeOptions
} from 'constant';
import { inject, observer } from "mobx-react";
import utils from 'utils';
import 'antd/dist/antd.css';
import './index.scss';


const tradeActions = [
  '买入', '卖出', 'Buy Limit', 'Sell Limit', 'Buy Stop', 'Sell Stop'
]

@inject("common", 'trade', 'market')
@observer
export default class extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      // symbolDisplay: this.$f7route.context.symbol_display,
      moreInfo: false,
      tradeType: tradeTypeOptions[0].id,
      params: {
        lots: 1,
        open_price: undefined,
        action: 0,
        take_profit: undefined,
        stop_loss: undefined
      },
      stockParams: {
        holdDays: "",
        action: 0,
        funds: 10000,
        unitFunds: 100,
        leverage: 5
      },
      positionTypeMap: [],
      leverageMap: []
    }
  }

  async componentDidMount() {

    await this.initSymbolList();

    const { mode, currentTradeTab } = this.props;
    const { currentTrade } = this.props.trade;
    const { currentSymbol } = this.props.market;



    this.getFunds(currentSymbol.id);

    if (mode === 'add') {
      this.setState({
        params: {
          ...this.state.params,
          open_price: currentSymbol?.sell,
        },
        positionTypeMap: currentSymbol?.symbol_display?.position_type[0].split(", "),
        leverageMap: currentSymbol?.symbol_display?.leverage.split(","),
        stockParams: {
          ...this.state.stockParams,
          holdDays: currentSymbol?.symbol_display?.position_type[0].split(", ")[0],
          leverage: currentSymbol?.symbol_display?.leverage.split(",")[0],
        },
      });
    } else {
      this.setState({
        params: {
          lots: currentTrade.lots,
          open_price: currentTrade.open_price,
          take_profit: currentTrade.take_profit,
          stop_loss: currentTrade.stop_loss
        }
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {

  }

  getFunds = async (id) => {
    console.log(this)
    const res = await api.trade.getFunds(id, {});
    if (res.status === 200) {
      console.log(res)
    }
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
      mode == 'add' && (id == null || id == 0)
        ? this.props.market.symbolList[0]?.id
        : id,
    );
  }

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
      market: {
        currentShowSymbol,
      }
    } = this.props;

    val = Number(val);
    val = Number(this.state.params.lots || 0) + (val);
    val = Number(val.toFixed(2));


    if (val < currentShowSymbol?.symbol_display?.min_lots) {
      return
    }

    this.setState({
      params: {
        ...params,
        lots: val,
      }
    })
  }

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
    if (currentTradeTab === '持仓') {
      resTradeList = await this.props.common.$api.trade.getTradeList({
        params: {
          status: "in_transaction"
        }
      })

      this.props.trade.setTradeList(resTradeList.data);
    }

    if (currentTradeTab === '挂单') {
      resTradeList = await this.props.common.$api.trade.getTradeList({
        params: {
          status: "pending"
        }
      })

      this.props.trade.setTradeList(resTradeList.data, "future");
    }

    if (currentTradeTab === '历史') {
      resTradeList = await this.$api.trade.getFinishTradeList({});

      this.props.trade.setTradeList(resTradeList.data.results, "finish");
      this.props.trade.setFinishTradeInfo(resTradeList.data.total_data);
    }

    this.updateTradeInfo(tradeInfo);
  }

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
    const {
      currentSymbol
    } = this.props.market;
    const { params } = this.state;
    const limit = currentSymbol?.symbol_display?.decimals_place ?? 1;

    let fieldValue = this.state.params[field];

    if (!fieldValue) {
      if (field == 'stop_loss') {
        fieldValue = +currentSymbol.sell + change;
      } else {
        fieldValue = +currentSymbol.buy + change;
      }
    } else {
      fieldValue += change;
    }

    fieldValue = +(fieldValue).toFixed(limit);

    this.setState({
      params: {
        ...params,
        [field]: fieldValue,
      }

    });
  }

  onFundsChanged = (change, field) => {
    const { stockParams } = this.state;

    let fieldValue = stockParams[field];

    if (!utils.isEmpty(fieldValue)) {
      fieldValue += change;
    } else {
      fieldValue = 10000
    }

    this.setState({
      stockParams: {
        ...stockParams,
        [field]: fieldValue,
      }

    });
  }

  switchLever = (leverage) => {
    const { stockParams } = this.state;
    this.setState({
      stockParams: {
        ...stockParams,
        leverage: leverage
      }
    })
  }

  switchHoldDays = (days) => {
    const { stockParams } = this.state;
    this.setState({
      stockParams: {
        ...stockParams,
        holdDays: days
      }
    })
  }

  switchStockType = (id) => {
    const { stockParams } = this.state;
    this.setState({
      stockParams: {
        ...stockParams,
        action: id
      }
    })
  }

  switchTradeOptions = (id) => {
    const { params } = this.state;
    const {
      currentSymbol
    } = this.props.market;

    if (id === 2 || id === 4) {
      this.setState({
        params: {
          ...params,
          open_price: currentSymbol?.buy,
          action: id
        }
      })
    } else if (id === 3 || id === 5) {
      this.setState({
        params: {
          ...params,
          open_price: currentSymbol?.sell,
          action: id
        }
      })
    } else {
      this.setState({
        params: {
          ...params,
          open_price: undefined,
          action: id
        }
      })
    }

  }

  switchTradeType = (name) => {
    const { params } = this.state;
    if (name === 'instance') {
      // this.setState({
      //   params: {
      //     ...params,
      //     action: executeOptions[0].id
      //   }
      // })
      this.switchTradeOptions(executeOptions[0].id)
    }
    if (name === 'future') {
      // this.setState({
      //   params: {
      //     ...params,
      //     action: pendingOrderOptions[0].id
      //   }
      // })
      this.switchTradeOptions(pendingOrderOptions[0].id)
    }
    this.setState({ tradeType: name })
  }

  switchTradeDetail = () => {
    const { moreInfo } = this.state
    this.setState({ moreInfo: !moreInfo })
  }


  onSubmit = async () => {
    const { params } = this.state;
    const {
      mode,
      market: {
        currentSymbol,
      },
      trade: {
        currentTrade
      }
    } = this.props;

    const lots = params.lots;

    try {
      if (mode == "add") {

        const decimals_place = currentSymbol?.symbol_display?.decimals_place;

        const payload = {
          trading_volume: (Number(lots) * Number(currentSymbol?.symbol_display?.contract_size)).toFixed(decimals_place),
          lots,
          symbol: currentSymbol.id,
          action: params.action,
        };
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
          return false
        }

        const res = await this.props.common.$api.trade.createTrade(payload);
        const that = this;

        if (res.status == 201) {
          const { success } = Modal;
          success({
            title: '提示',
            content: '下单成功',
            className: "trade-modal success-modal",
            centered: true,
            // cancelText: "取消",
            okText: "确认",
            onOk() {
              that.$f7router.back('/trade/', {
                force: false,
              });
            },
            // onCancel() {
            // },
          });
        }
      } else if (mode === "update") {
        const payload = params;
        const res = await this.props.common.$api.trade.updateTrade(currentTrade.order_number, payload);
        const that = this;

        if (res.status == 200) {
          const { success } = Modal;
          success({
            title: '提示',
            content: '修改成功',
            className: "trade-modal success-modal",
            centered: true,
            // cancelText: "取消",
            okText: "确认",
            onOk() {
              that.onTradeListPageRefresh();
              that.$f7router.back('/trade/', {
                force: false,
              });
            },
            // onCancel() {
            // },
          });
        }
      } else if (mode === "delete") {
        const res = await this.props.common.$api.trade.closeTrade(currentTrade.order_number);
        const that = this;

        if (res.status == 200) {
          const { success } = Modal;
          success({
            title: '提示',
            content: '平倉成功',
            className: "trade-modal success-modal",
            centered: true,
            // cancelText: "取消",
            okText: "确认",
            onOk() {
              that.onTradeListPageRefresh();
              that.$f7router.back('/trade/', {
                force: false,
              });
            },
            // onCancel() {
            // },
          });
        }
      }
    } catch (err) {

      // this.$msg.error(err?.response?.data?.message);
    }
  };

  renderStockInput = () => {

    const { mode, currentTradeTab } = this.props;
    const { currentTrade } = this.props.trade;
    const { currentSymbol, currentShowSymbol } = this.props.market;
    // console.log(this.state)
    const { tradeType, params, stockParams, positionTypeMap, leverageMap } = this.state;
    // console.log(positionTypeMap)
    return (
      <>
        <div className="trade-detail-input-container">
          <div className="trade-detail-input-item">
            <div className="trade-detail-input-item-title">类型</div>
            <div className="trade-detail-input-item-btn-group">
              {mode === 'add' &&
                <>
                  {
                    positionTypeMap.map(item => {
                      return (
                        <div
                          onClick={() => { this.switchHoldDays(item) }}
                          className={`trade-detail-input-item-btn ${stockParams.holdDays === item && 'btn-active'}`}>
                          {item}
                        </div>
                      )
                    })
                  }
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
              }
              {
                (mode === 'update' || mode === 'delete') &&
                <div className={`trade-detail-input-item-text`}>
                  {stockParams.holdDays}
                </div>
              }
            </div>
          </div>

          {mode === 'add' &&
            <div className="trade-detail-input-item">
              <div className="trade-detail-input-item-title">类型</div>
              <div className="trade-detail-input-item-btn-group">

                {
                  stockTypeOptions.map((item) => {
                    return (
                      <div
                        onClick={() => { this.switchStockType(item.id) }}
                        className={`trade-detail-input-item-btn ${stockParams.action === item.id && 'btn-active'}`}>
                        {item.name}
                      </div>)
                  })
                }
              </div>
            </div>}

          {
            mode !== "add" &&
            <div className="trade-detail-input-item">
              <div className="trade-detail-input-item-title">方向</div>
              <div className="trade-detail-input-item-btn-group">
                <div className={`trade-detail-input-item-text`}>
                  {(tradeActions[Number(stockParams.action)])}
                </div>
              </div>
            </div>
          }

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


          <div className="trade-detail-input-item">
            <div className="trade-detail-input-item-title">价格</div>
            <div className="trade-detail-input-item-btn-group">
              <div className="trade-detail-input-item-less-btn"
                onClick={() => {
                  this.onFundsChanged(-stockParams.unitFunds, 'funds');
                }}>－</div>
              <div className="trade-detail-input-item-input">
                <Input
                  type="number"
                  min={100}
                  value={stockParams.funds}
                  onChange={(evt) => {
                    this.setState({
                      stockParams: {
                        ...stockParams,
                        funds: evt.target.value,
                      }

                    });
                  }}
                />
              </div>
              <div className="trade-detail-input-item-add-btn"
                onClick={() => {
                  this.onFundsChanged(stockParams.unitFunds, 'funds');
                }}>＋</div>
            </div>
          </div>

          <div className="trade-detail-input-item">
            <div className="trade-detail-input-item-title">槓桿倍數</div>
            <div className="trade-detail-input-item-btn-group">
              {mode === 'add' &&
                <>
                  {
                    leverageMap.map(item => {
                      return (
                        <div
                          onClick={() => { this.switchLever(item) }}
                          className={`trade-detail-input-item-btn-small ${stockParams.leverage === item && 'btn-active'}`}>
                          {item}
                        </div>
                      )
                    })
                  }
                </>
              }
              {
                (mode === 'update' || mode === 'delete') &&
                <div className={`trade-detail-input-item-text`}>
                  {stockParams.leverage}
                </div>
              }
            </div>
          </div>

          <div className="trade-detail-input-item">
            <div className="trade-detail-input-item-title">操盤資金</div>
            <div className="trade-detail-input-item-btn-group">
              <div className={`trade-detail-input-item-text`}>
                {"50000"}
              </div>
            </div>
          </div>

          <div className="trade-detail-input-item">
            <div className="trade-detail-input-item-title">買入數量</div>
            <div className="trade-detail-input-item-btn-group">
              <div className={`trade-detail-input-item-text`}>
                {"10300"}
              </div>
            </div>
          </div>

        </div>
        <div className={`trade-detail-submit-btn 
                        ${(tradeType !== "instance" && utils.isEmpty(params.open_price) || utils.isEmpty(params.lots)) ? 'reject' : ""}
                        ${mode === 'add' ? 'add' : 'modify'}`}
          style={{ marginBottom: '20px' }}
          onClick={this.onSubmit}>
          {mode === 'add' ? '下单' : mode === 'update' ? '修改' : '平仓'}
        </div>

        <div className="trade-detail-remarks-container">
          <div className="trade-detail-remarks-item">
            <div className="trade-detail-remarks-item-title">服務費</div>
            <div className="trade-detail-remarks-item-content">HK$100.00(手續費)</div>
          </div>
          <div className="trade-detail-remarks-item">
            <div className="trade-detail-remarks-item-title">遞延費</div>
            <div className="trade-detail-remarks-item-content">$100.00(港元/交易日)</div>
          </div>
          <div className="trade-detail-remarks-item">
            <div className="trade-detail-remarks-item-title">參考匯率</div>
            <div className="trade-detail-remarks-item-content">$100.00</div>
          </div>
          <div className="trade-detail-remarks-item">
            <div className="trade-detail-remarks-item-title">總計</div>
            <div className="trade-detail-remarks-item-content">￥100.00元</div>
          </div>
          <div className="trade-detail-remarks-placeholder">
            *總計=操作資金+服務費
          </div>
        </div>
      </>
    )
  }

  renderForexInput = () => {
    const { mode, currentTradeTab } = this.props;
    const { currentTrade } = this.props.trade;
    const { currentSymbol, currentShowSymbol } = this.props.market;
    const { tradeType, params } = this.state;
    const stepLevel = currentSymbol?.symbol_display?.decimals_place ? (
      1 / 10 ** (currentSymbol?.symbol_display?.decimals_place)
    ) : 0.001;
    return (
      <>
        <div className="trade-detail-input-container">
          <div className="trade-detail-input-item">
            <div className="trade-detail-input-item-title">类型</div>
            <div className="trade-detail-input-item-btn-group">
              {mode === 'add' &&
                tradeTypeOptions.map((item) => {
                  return (
                    <div className={`trade-detail-input-item-btn ${tradeType === item.id && 'btn-active'}`}
                      onClick={() => { this.switchTradeType(item.id) }}
                    >
                      {item.name}
                    </div>
                  )
                })
              }
              {
                (mode === 'update' || mode === 'delete') &&
                <div className={`trade-detail-input-item-text`}>
                  {(Number(currentTrade.action) === 0 || Number(currentTrade.action) === 1) ? "立即执行" : "挂单"}
                </div>
              }
              {/* <div className="trade-detail-input-item-btn">立即执行</div>
          <div className="trade-detail-input-item-btn">挂单</div> */}
            </div>
          </div>

          {
            mode !== "add" &&
            <div className="trade-detail-input-item">
              <div className="trade-detail-input-item-title">方向</div>
              <div className="trade-detail-input-item-btn-group">
                <div className={`trade-detail-input-item-text`}>
                  {(tradeActions[Number(currentTrade.action)])}
                </div>
              </div>
            </div>
          }

          {mode === 'add'
            && <div className="trade-detail-input-item">
              <div className="trade-detail-input-item-title">类型</div>
              <div className="trade-detail-input-item-btn-group">

                {
                  tradeType === 'future' && pendingOrderOptions.map((item) => {
                    return (
                      <div
                        onClick={() => { this.switchTradeOptions(item.id) }}
                        className={`trade-detail-input-item-btn ${params.action === item.id && 'btn-active'}`}>
                        {item.name}
                      </div>)
                  })
                }
                {
                  tradeType === 'instance' && executeOptions.map((item) => {
                    return (
                      <div
                        onClick={() => { this.switchTradeOptions(item.id) }}
                        className={`trade-detail-input-item-btn ${params.action === item.id && 'btn-active'}`}>
                        {item.name}
                      </div>
                    )
                  })
                }

              </div>
            </div>
          }

          {(currentTradeTab === '挂单' || tradeType === 'future') &&
            <div className="trade-detail-input-item">
              <div className="trade-detail-input-item-title">价格</div>
              <div className="trade-detail-input-item-btn-group">
                <div className="trade-detail-input-item-less-btn"
                  onClick={() => {
                    this.onFieldChanged(-stepLevel, 'open_price');
                  }}>－</div>
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
                        }

                      });
                    }}
                  />
                </div>
                <div className="trade-detail-input-item-add-btn"
                  onClick={() => {
                    this.onFieldChanged(stepLevel, 'open_price');
                  }}>＋</div>
              </div>
            </div>}

          <div className="trade-detail-input-item">
            <div className="trade-detail-input-item-title">数量</div>
            {(mode !== 'delete' && currentTradeTab !== '持仓')
              ? <div className="trade-detail-input-item-btn-group">
                <div className="trade-detail-input-item-less-btn"
                  onClick={() => {
                    this.onLotsChanged(0 - currentShowSymbol?.symbol_display?.lots_step);
                  }}
                >－</div>
                <div className="trade-detail-input-item-input">
                  <Input
                    type="number"
                    min={0.01}
                    placeholder={'未设置'}
                    value={params.lots || undefined}
                    onChange={(evt) => {

                      if (evt.target.value < currentShowSymbol?.symbol_display?.min_lots) return;
                      this.setState({
                        params: {
                          ...params,
                          lots: evt.target.value,
                        }
                      });
                    }}
                  />
                </div>
                <div className="trade-detail-input-item-add-btn"
                  onClick={() => {
                    this.onLotsChanged(currentShowSymbol?.symbol_display?.lots_step);
                  }}>＋</div>
              </div>
              : <div className="trade-detail-input-item-btn-group">
                <div className={`trade-detail-input-item-text`}>{params.lots}</div>
              </div>
            }
          </div>

          <div className="trade-detail-input-item">
            <div className="trade-detail-input-item-title">止盈</div>
            <div className="trade-detail-input-item-btn-group">
              {mode !== "delete" ?
                <>
                  <div className="trade-detail-input-item-less-btn"
                    onClick={() => {
                      this.onFieldChanged(-stepLevel, 'take_profit');
                    }}>－</div>
                  <div className="trade-detail-input-item-input">
                    <Input
                      type="number"
                      min={0.01}
                      placeholder={'未设置'}
                      value={params.take_profit || undefined}
                      onChange={(evt) => {
                        this.setState({
                          params: {
                            ...params,
                            take_profit: Number(evt.target.value),
                          }
                        });
                      }}
                    />
                  </div>
                  <div className="trade-detail-input-item-add-btn"
                    onClick={() => {
                      this.onFieldChanged(stepLevel, 'take_profit');
                    }}>＋</div>
                </>
                : <div className={`trade-detail-input-item-text`}>
                  {params.stop_loss}
                </div>
              }
            </div>
          </div>

          <div className="trade-detail-input-item">
            <div className="trade-detail-input-item-title">止损</div>
            <div className="trade-detail-input-item-btn-group">
              {mode !== "delete" ?
                <>
                  <div className="trade-detail-input-item-less-btn"
                    onClick={() => {
                      this.onFieldChanged(-stepLevel, 'stop_loss');
                    }}>－</div>
                  <div className="trade-detail-input-item-input">
                    <Input
                      type="number"
                      min={0.01}
                      placeholder={'未设置'}
                      value={params.stop_loss || undefined}
                      onChange={(evt) => {
                        this.setState({
                          params: {
                            ...params,
                            stop_loss: Number(evt.target.value),
                          }
                        });
                      }}
                    />
                  </div>
                  <div className="trade-detail-input-item-add-btn"
                    onClick={() => {
                      this.onFieldChanged(stepLevel, 'stop_loss');
                    }}>＋</div>
                </>
                :
                <div className={`trade-detail-input-item-text`}>
                  {params.stop_loss}
                </div>}
            </div>
          </div>
        </div>
        <div className={`trade-detail-submit-btn 
                        ${(tradeType !== "instance" && utils.isEmpty(params.open_price) || utils.isEmpty(params.lots)) ? 'reject' : ""}
                        ${mode === 'add' ? 'add' : 'modify'}`}
          style={{ marginBottom: '30px' }}
          onClick={this.onSubmit}>
          {mode === 'add' ? '下单' : mode === 'update' ? '修改' : '平仓'}
        </div>
      </>
    )
  }

  render() {
    const { mode, } = this.props;
    const { currentSymbol } = this.props.market;
    const { moreInfo, tradeType, params } = this.state;
    return (
      <Page noToolbar>
        <Navbar>
          <NavLeft>
            <Link back>
              <Icon color={'white'} f7={'chevron_left'} size={r(18)}></Icon>
            </Link>
          </NavLeft>
          <NavTitle>{currentSymbol?.symbol_display?.name}</NavTitle>
          <NavRight></NavRight>

        </Navbar>
        <div className="trade-detail-stock-container">
          <div className="now-stock">{currentSymbol?.product_details?.sell}</div>
          <div className="spread-stock">
            <div>
              <p>{currentSymbol?.product_details?.change}</p>
              <p>{`${((currentSymbol?.product_details?.change) / (currentSymbol?.product_details?.sell) * 100).toFixed(2)}%`}</p>
            </div>
          </div>
          <div className="detail-btn" onClick={this.switchTradeDetail}>{moreInfo ? "收起" : "查看详情"}</div>
        </div>
        <div className="trade-detail-price">
          <div className="price-item">
            <span className="price-item-title">卖出</span>
            <span className="price-item-content p-down">{currentSymbol?.sell}</span>
          </div>
          <div className="price-item">
            <span className="price-item-title">买入</span>
            <span className="price-item-content p-up">{currentSymbol?.buy}</span>
          </div>
        </div>

        <div className={`trade-detail-more-info-container ${moreInfo ? "show" : ""}`}>
          <div className="trade-detail-more-info-contract">
            <div className="trade-detail-more-info-contract-title">合约资讯</div>
            <div className="trade-detail-more-info-contract-content">
              <div><span>小数点位</span><span>{String(currentSymbol?.symbol_display?.decimals_place)}</span></div>
              <div><span>合约大小</span><span>{String(currentSymbol?.symbol_display?.contract_size)}</span></div>
              <div><span>点差</span><span>{String(currentSymbol?.symbol_display?.spread)}</span></div>
              <div><span>预付款货币</span><span>{currentSymbol?.symbol_display?.margin_currency_display}</span></div>
              <div><span>获利货币</span><span>{currentSymbol?.symbol_display?.profit_currency_display}</span></div>
              <div><span>最小交易手数</span><span>{String(currentSymbol?.symbol_display?.min_lots)}</span></div>
              <div><span>最大交易手数</span><span>{String(currentSymbol?.symbol_display?.max_lots)}</span></div>
              <div><span>交易数步长</span><span>{String(currentSymbol?.symbol_display?.lots_step)}</span></div>
              <div><span>买入库存费</span><span>{String(currentSymbol?.symbol_display?.purchase_fee)}</span></div>
              <div><span>卖出库存费</span><span>{String(currentSymbol?.symbol_display?.selling_fee)}</span></div>
            </div>
          </div>
          <div className="trade-detail-more-info-news">
            <div className="trade-detail-more-info-news-tabs">
              <p className="active">盘口</p>
              <p>资讯</p>
            </div>
            <div className="trade-detail-more-info-news-content">
              <div>
                <p>气温回暖 深夜变天！一张图揭清明连假天气</p>
                <p>2020 03/31 13:00</p>
                <span></span>
              </div>
              <div>
                <p>气温回暖 深夜变天！一张图揭清明连假天气</p>
                <p>2020 03/31 13:00</p>
              </div>
            </div>
          </div>
        </div>
        {utils.isEmpty(currentSymbol)
          ?
          <Spin
            className="spin-icon"
            indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
          />
          : currentSymbol?.symbol_display?.type_display === "外汇" ? this.renderForexInput() : this.renderStockInput()}
      </Page>
    );
  }
}
