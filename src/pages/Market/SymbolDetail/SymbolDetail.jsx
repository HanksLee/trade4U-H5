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

@inject("market", "trend")
@observer
export default class SymbolDetail extends React.Component {
  displayName = "SymbolDetail";
  constructor(props) {
    super(props);
    this.state = {
      // currentSymbol: {},
      // isAddSelfSelect: 0    };
  }

  componentDidMount() {
    // this.setState({ currentSymbol: this.props.market.currentSymbol });
    // console.log(
    //   "this.props.market.currentSymbol :>> ",
    //   toJS(this.props.market.currentSymbol)
    // );
    // console.log(this.$f7router, this.$f7.router);
    // console.log(this.$f7router === this.$f7.router);
  }

  static getDerivedStateFromProps(props, state) {
    // console.log(props)
    // console.log(this)
    // this.setState({ currentSymbol: props.market.currentSymbol })
  }

  showSelfSelectModal = async () => {
    const { confirm } = Modal;
    // const { isAddSelfSelect } = this.state;
    const { currentSymbol } = this.props.market;
    const { currentSymbolType } = this.props;

    // let symbolID = currentSymbolType === '自选' ? currentSymbol.symbol : currentSymbol.id;
    let symbolID = currentSymbol.id;

    if (currentSymbol.is_self_select === 0) {
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
        onCancel() {},
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
    const { currentSymbol } = this.props.market;
    const { trader_status } = currentSymbol;
    return (
      <Page noToolbar>
        <Navbar>
          <NavLeft>
            <Link back>
              <Icon color={"white"} f7={"chevron_left"} size={r(18)}></Icon>
            </Link>
          </NavLeft>
          <NavTitle>{currentSymbol?.symbol_display?.name}</NavTitle>
          <NavRight>{this.renderTraderStatus(trader_status)}</NavRight>
        </Navbar>
        <div className="stock-container">
          <div
            className={`self-select-buy-sell-block now-stock ${
              currentSymbol?.product_details?.change > 0 && "p-up stock-green"
            } ${
              currentSymbol?.product_details?.change < 0 &&
              "p-down stock-red-gif"
            }`}
          >
            {currentSymbol?.product_details?.sell}
          </div>
          <div className="arrow">
            {currentSymbol?.product_details?.change >= 0 ? (
              <img src={GreenArrowIcon} alt="GreenArrowIcon" />
            ) : (
              <img class="deg180" src={RedArrowIcon} alt="RedArrowIcon" />
            )}
          </div>
          <div className="spread-stock">
            <div>
              <p
                className={`self-select-buy-sell-block ${
                  currentSymbol?.product_details?.change > 0 &&
                  "p-up stock-green"
                } ${
                  currentSymbol?.product_details?.change < 0 &&
                  "p-down stock-red-gif"
                }`}
              >
                {currentSymbol?.product_details?.change}
              </p>
              <p
                className={`self-select-buy-sell-block ${
                  currentSymbol?.product_details?.change > 0 &&
                  "p-up stock-green"
                } ${
                  currentSymbol?.product_details?.change < 0 &&
                  "p-down stock-red-gif"
                }`}
              >
                {`${currentSymbol?.product_details?.chg}%`}
              </p>
            </div>
          </div>
        </div>

        <WS_TrendContainer nowRealID={currentSymbol.symbol} unit={"1m"} />
        <SymbolInfo />
        <Toolbar tabbar labels bottom className="app-tabbar stock-tabbar">
          <Link
            tabLinkActive
            icon="market-icon"
            text="行情"
            className="tabbar-label"
            onClick={() => {
              this.$f7router.back();
            }}
          />
          <Link
            icon={`${
              currentSymbol.is_self_select === 0
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
