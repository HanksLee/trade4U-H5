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
} from "framework7-react";
import { Toast, Tabs } from "antd-mobile";
import { Modal } from "antd";
import "antd/dist/antd.css";
import { toJS } from "mobx";
import { inject, observer } from "mobx-react";
import WSConnect from "components/HOC/WSConnect";
import channelConfig from "../config/trendChannelConfig";
import Trend from "../Trend";

import GreenArrowIcon from "assets/img/green-arrow-icon.svg";
import RedArrowIcon from "assets/img/red-arrow-icon.svg";
import OrderIcon from "assets/img/order-icon.svg";
import OrderIconDisabled from "assets/img/order-icon-disabled.svg";
import { SymbolInfo } from "../SymbolInfo";
const WS_TrendContainer = WSConnect(channelConfig[0], channelConfig, Trend);

import styles from "./SymbolDetail.module.scss";
import classnames from "classnames/bind";
const cx = classnames.bind(styles);

@inject("common", "market", "trend")
@observer
export default class SymbolDetail extends React.Component {
  displayName = "SymbolDetail";
  constructor(props) {
    super(props);
    this.state = {
      // currentSymbol: {},
      isAddSelfSelect: 0,
    };
  }

  componentDidMount() {
    this.setState({
      isAddSelfSelect: this.props.market.currentSymbol.is_self_select,
    });
    
    const {currentSymbolTypeCode} = this.props;
    const { currentSymbol } = this.props.market;
    const id = currentSymbol.id;

    const symbol = currentSymbol.product_details?.symbol ?? null;
    this.props.common.setSelectedSymbolId(currentSymbolTypeCode, {
      id,
      symbol
    });
    // console.log(
    //   "this.props.market.currentSymbol :>> ",
    //   toJS(this.props.market.currentSymbol)
    // );
  }

  static getDerivedStateFromProps(props, state) {
    // console.log(props)
    // console.log(this)
    // this.setState({ currentSymbol: props.market.currentSymbol })
  }

  showSelfSelectModal = async () => {
    const { confirm } = Modal;
    const { isAddSelfSelect } = this.state;
    const { currentSymbol } = this.props.market;
    const { currentSymbolType } = this.props;

    // let symbolID = currentSymbolType === '自选' ? currentSymbol.symbol : currentSymbol.id;
    let symbolID = currentSymbol.id;

    if (isAddSelfSelect === 0) {
      const res = await api.market.addSelfSelectSymbolList({
        symbol: [symbolID],
      });
      if (res.status === 201) {
        this.setState({ isAddSelfSelect: 1 });
        Toast.success("加入自选成功", 2);
      }
    } else {
      const that = this;
      confirm({
        title: "提示",
        content: "确认刪除自选嗎?",
        className: "trade-modal",
        centered: true,
        cancelText: "取消",
        okText: "确认",
        async onOk() {
          const res = await api.market.deleteSelfSelectSymbolList({
            data: {
              symbol: [symbolID],
            },
          });
          if (res.status === 204) {
            that.setState({ isAddSelfSelect: 0 });
            Toast.success("刪除自选成功", 2);
            let queryString = `page=${1}&page_size=${20}`;
            await that.props.market.getSelfSelectSymbolList(queryString, true);
          }
        },
        onCancel() { },
      });
    }
  };
  renderTraderStatus = (status) => {
    // 渲染是否交易中的状态
    const configs = {
      in_transaction: { text: "交易中", color: "#f2e205" },
      closed: { text: "休市中", color: "#ccc" },
    };
    const config = configs[status];
    if (!config) return;
    return (
      <div
        className="trader-status"
        style={{ "--trader-status-color": `${config.color}` }}
      >
        {config.text}
      </div>
    );
  };
  handleOrderButtonClick = () => {
    const { currentSymbolType } = this.props;
    const { isAddSelfSelect } = this.state;
    const { currentSymbol } = this.props.market;
    // const { currentSymbol, isAddSelfSelect } = this.state;
    const { trader_status } = currentSymbol;
    // 非交易时段点击不做反应
    // 应测试方便要求先一律打開
    // if (trader_status !== "in_transaction") return;
    const symbolType = currentSymbol.id;

    this.$f7router.navigate(`/trade/${symbolType}/`, {
      props: { mode: "add" },
    });
  };
  render() {
    const { selectedSymbolInfo } = this.props.common;
    const { currentSymbol } = this.props.market;
    const { trader_status } = currentSymbol;
    const { isAddSelfSelect } = this.state;
    const isHigh = selectedSymbolInfo.change ? selectedSymbolInfo?.change > 0 : currentSymbol?.product_details?.change  > 0 ;
    const quoted_price = this.props.common.getKeyConfig("quoted_price");
    return (
      <Page noToolbar>
        <Navbar>
          <NavLeft>
            <Link back onClick={()=>{this.props.common.setSelectedSymbolId(null ,null)}} >
              <Icon color={"white"} f7={"chevron_left"} size={r(18)}></Icon>
            </Link>
          </NavLeft>
          <NavTitle className="symbol-detail-navbar-center">
            <span>{currentSymbol?.symbol_display?.name}</span>
            <span className="stock-code">{currentSymbol?.product_details?.symbol}</span>
          </NavTitle>
          <NavRight>{this.renderTraderStatus(trader_status)}</NavRight>
        </Navbar>
        <div className="stock-container">
          <div
            className={`self-select-buy-sell-block now-stock ${
              isHigh && "p-up stock-up"
            } ${
             !isHigh &&
              "p-down stock-down"
            }`}
          >
            { selectedSymbolInfo?.sell ?? currentSymbol?.product_details?.sell}
          </div>
          <div className="arrow">
            {isHigh ? (
              <img src={GreenArrowIcon} alt="GreenArrowIcon" />
            ) : (
                <img class="deg180" src={RedArrowIcon} alt="RedArrowIcon" />
              )}
          </div>
          <div className="spread-stock">
            <div>
              <p
                className={`self-select-buy-sell-block ${
                  isHigh &&
                  "p-up stock-up"
                } ${
                 !isHigh &&
                  "p-down stock-down"
                }`}
              >
                {selectedSymbolInfo?.change ??  currentSymbol?.product_details?.change}
              </p>
              <p
                className={`self-select-buy-sell-block ${
                  isHigh &&
                  "p-up stock-up"
                } ${
                 !isHigh &&
                  "p-down stock-down"
                }`}
              >
                {`${selectedSymbolInfo?.chg ?? currentSymbol?.product_details?.change}%`}
              </p>
            </div>
          </div>

        </div>
        {/* <div className="switch-chart">
          <span>分時</span>
          <span className="active">5日</span>
          <span>日K</span>
          <span>週K</span>
          <span>月K</span>
        </div> */}
        {/* <WS_TrendContainer nowRealID={currentSymbolType === '自选' ? currentSymbol.symbol : currentSymbol.id} unit={"1m"} /> */}
        <WS_TrendContainer nowRealID={currentSymbol.id} unit={"1m"} />
        <SymbolInfo quoted_price={quoted_price} router={this.$f7router} />
        <Toolbar tabbar labels bottom className="app-tabbar stock-tabbar">
          <Link
            tabLinkActive
            icon="market-icon"
            text="行情"
            className="tabbar-label"
            onClick={() => this.$f7router.back()}
          />
          <Link
            icon={`${
              isAddSelfSelect === 0
                ? "self-select-icon"
                : "self-select-icon-active"
              }`}
            text="自选"
            className="tabbar-label"
            onClick={this.showSelfSelectModal}
          />
          <div className="order-btn" onClick={this.handleOrderButtonClick}>
            {trader_status === "in_transaction" ? (
              <img src={OrderIcon} alt="OrderIcon" />
            ) : (
                <img src={OrderIconDisabled} alt="OrderIconDisabled" />
              )}
          </div>
        </Toolbar>
      </Page>
    );
  }
}
