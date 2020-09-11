import React from "react";
import { BaseReact } from "components/baseComponent";
import { Page, Navbar, NavRight, Block, Row, Col } from "framework7-react";
import AddIcon from "assets/img/add.svg";
import moment from "moment";
import { inject, observer } from "mobx-react";
import "./index.scss";
import ws from "utils/ws";
import { tradeActionMap, tradeTabOptions } from "constant";
import utils from "utils";
import cloneDeep from "lodash/cloneDeep";
import WSConnect from "components/HOC/WSConnect";
import channelConfig from "./config/channelConfig";
import Dom7 from "dom7";
import TradeList from "./TradeList";

const $$ = Dom7;
const WS_TradeList = WSConnect(channelConfig[0], channelConfig, TradeList);

@inject("common", "trade")
@observer
export default class extends BaseReact {
  wsConnect = null;
  $event = null;
  state = {
    title: "持仓盈亏",
    tapIndex: -1,
    // currentTrade: null,
    loading: false,
    effect: null,
    activeItem: false,
    currentTradeTab: tradeTabOptions[0].name,
  };

  // constructor() {
  //   super();
  //
  // }

  componentDidMount() {
    // this.initEvents();
    // this.initData();
    // this.connectWebsocket();
  }

  initEvents = () => {
    this.props.common.globalEvent.on("refresh-trade-page", () => {
      this.onRefresh();
    });
  };

  initData = () => {
    if (this.state.loading) return;

    this.onRefresh();
  };

  switchTradeTabs = (name) => {
    this.setState({ currentTradeTab: name });
    if (name === "历史") {
      this.setState({ title: "净盈亏" });
    } else {
      this.setState({ title: "持仓盈亏" });
    }
  };

  render() {
    const {
      title,
      tapIndex,
      loading,
      currentTradeTab,
      activeItem,
    } = this.state;
    const {
      tradeInfo,
      tradeList,
      futureTradeList,
      computedTradeList,
      currentTrade,
      finishTradeInfo,
    } = this.props.trade;
    const initSymbol = utils.isEmpty(tradeList) ? 0 : tradeList[0]?.symbol;
    return (
      <Page
        name="trade"
        className="trade-page"
        // ptr
        // onPtrRefresh={this.onRefresh}
      >
        <Navbar title={title} className="trade-navbar">
          <NavRight>
            {/* <div onClick={this.handleSubmit}>確認</div> */}
          </NavRight>
        </Navbar>
        {currentTradeTab !== "历史" && (
          // <Block
          //   strong
          //   className={`trade-stats ${
          //     loading ? "skeleton-text skeleton-effect-blink" : ""
          //     }`}
          // >
          <Block strong className={`trade-stats `}>
            {/* <div className="trade-title">持仓盈亏</div> */}
            <Row className={"trade-stats-row"}>
              <Col width="25" className={"trade-stats-col"}>
                <p>结余</p>
                <p>{tradeInfo?.balance?.toFixed(2)}</p>
              </Col>
              <Col width="50" className={"trade-stats-col"}>
                <p
                  className={`trade-total-number ${
                    tradeInfo?.profit?.toFixed(2) > 0 ? "p-up" : "p-down"
                  }`}
                >
                  {tradeInfo?.profit?.toFixed(2)}
                </p>
              </Col>
              <Col width="25" className={"trade-stats-col"}>
                <p>净值</p>
                <p>{tradeInfo?.equity?.toFixed(2)}</p>
              </Col>
            </Row>
            <Row className={"trade-stats-row"}>
              <Col width="25" className={"trade-stats-col"}>
                <p>预付款</p>
                <p>{+tradeInfo?.margin?.toFixed(2)}</p>
              </Col>
              <Col width="50" className={"trade-stats-col"}>
                <p>可用预付款</p>
                <p>{tradeInfo?.free_margin?.toFixed(2)}</p>
              </Col>
              <Col width="25" className={"trade-stats-col"}>
                <p>预付款比率</p>
                <p>
                  {tradeInfo.margin == 0
                    ? "-"
                    : `${tradeInfo?.margin_level?.toFixed(2)}%`}
                </p>
              </Col>
            </Row>
          </Block>
        )}
        {currentTradeTab === "历史" && (
          // <Block
          //   strong
          //   className={`trade-stats
          //   ${loading ? "skeleton-text skeleton-effect-blink" : ""}
          //     `}
          // >
          <Block
            strong
            className={`trade-stats 
              `}
          >
            <Row className={"trade-stats-row"}>
              <Col width="25" className={"trade-stats-col"}>
                <p>盈利</p>
                <p>{finishTradeInfo?.profit?.toFixed(2)}</p>
              </Col>
              <Col width="50" className={"trade-stats-col"}>
                <p
                  className={`trade-total-number ${
                    finishTradeInfo?.balance?.toFixed(2) > 0 ? "p-up" : "p-down"
                  }`}
                >
                  {finishTradeInfo?.balance?.toFixed(2)}
                </p>
              </Col>
              <Col width="25" className={"trade-stats-col"}>
                <p>亏损</p>
                <p>{finishTradeInfo?.loss?.toFixed(2)}</p>
              </Col>
            </Row>
          </Block>
        )}
        <div className="trade-tabs">
          {tradeTabOptions.map((item) => {
            return (
              <div
                onClick={() => {
                  this.switchTradeTabs(item.name);
                }}
                className={`market-navbar-item ${
                  currentTradeTab === item.name && "active"
                }`}
              >
                {item.name}
              </div>
            );
          })}
        </div>

        <div className="trade-content-title">
          <div>品种｜代码</div>
          <div>现价</div>
          <div>方向｜手数</div>
          <div>盈亏</div>
        </div>
        <WS_TradeList
          currentTradeTab={currentTradeTab}
          thisRouter={this.$f7router}
        ></WS_TradeList>
      </Page>
    );
  }
}
