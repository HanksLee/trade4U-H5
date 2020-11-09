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
import KLine from "../KLine";

import GreenArrowIcon from "assets/img/green-arrow-icon.svg";
import RedArrowIcon from "assets/img/red-arrow-icon.svg";
import OrderIcon from "assets/img/order-icon.svg";
import OrderIconDisabled from "assets/img/order-icon-disabled.svg";
import { SymbolInfo } from "../SymbolInfo";
const WS_TrendContainer = WSConnect(channelConfig[0], channelConfig, Trend);

import styles from "./SymbolDetail.module.scss";
import classnames from "classnames/bind";
const cx = classnames.bind(styles);

const chartMap = [
  {
    title: "分时",
    unit: "1m"
  },
  {
    title: "日K",
    unit: "1d"
  }
]

@inject("common", "market", "trend")
@observer
export default class SymbolDetail extends React.Component {
  displayName = "SymbolDetail";
  timer = null;
  constructor(props) {
    super(props);
    this.state = {
      // currentSymbol: {},
      isAddSelfSelect: 0,
    };
  }

  async componentDidMount() {
    this.setState({
      isAddSelfSelect: this.props.market.currentSymbol.is_self_select,
    });

    const { currentSymbolTypeCode } = this.props;
    const { currentSymbol } = this.props.market;
    const id = currentSymbol.id;

    const symbol = currentSymbol.product_details?.symbol ?? null;
    this.props.common.setSelectedSymbolId(currentSymbolTypeCode, {
      id,
      symbol,
    });
    // console.log(
    //   "this.props.market.currentSymbol :>> ",
    //   toJS(this.props.market.currentSymbol)
    // );
    this.timer = setInterval(() => {
      this.props.trend.fetchTrendList(id, chartMap[0].unit);
    }, 60000);
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
        className: "app-modal",
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

  handleChartTabChange = (tab,index) => {
    const { currentSymbol } = this.props.market;
    const id = currentSymbol.id;
    if(this.timer){
      clearInterval(this.timer)
    }
    this.props.trend.fetchTrendList(id, chartMap[index].unit);
    this.timer = setInterval(() => {
      this.props.trend.fetchTrendList(id, chartMap[index].unit);
    }, 60000);
  }

  renderChart = (id, unit) => {
    if (unit === '1m') {
      return <WS_TrendContainer nowRealID={id} unit={unit} />
    } else {
      return <KLine nowRealID={id} unit={unit} />
    }

  }

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
    const quoted_price = this.props.common.getKeyConfig("quoted_price");
    // const { currentSymbol, isAddSelfSelect } = this.state;
    const { trader_status } = currentSymbol;
    if (trader_status !== "in_transaction") return;
    const symbolType = currentSymbol.id;
    // this.props.common.setSelectedSymbolId(null, null);

    this.$f7router.navigate(`/trade/${symbolType}/`, {
      props: { mode: "add", quoted_price: quoted_price },
    });
  };
  render() {
    const { selectedSymbolInfo } = this.props.common;
    // console.log(selectedSymbolInfo)
    const { currentSymbol } = this.props.market;
    const { trader_status } = currentSymbol;
    const { isAddSelfSelect } = this.state;
    const colorMode = localStorage.getItem("trade4U_h5_color_mode");
    const upIcon = colorMode === "standard" ? GreenArrowIcon : RedArrowIcon;
    const downIcon = colorMode === "standard" ? RedArrowIcon : GreenArrowIcon;
    const isHigh = selectedSymbolInfo.change
      ? selectedSymbolInfo?.change > 0
      : currentSymbol?.product_details?.change > 0;
    const quoted_price = this.props.common.getKeyConfig("quoted_price");
    return (
      <Page noToolbar>
        <Navbar>
          <NavLeft>
            <Link
              back
              onClick={() => {
                this.props.common.setSelectedSymbolId(null, null);
                clearInterval(this.timer)
              }}
            >
              <Icon color={"white"} f7={"chevron_left"} size={r(18)}></Icon>
            </Link>
          </NavLeft>
          <NavTitle className="symbol-detail-navbar-center">
            <span>{currentSymbol?.symbol_display?.name}</span>
            <span className="stock-code">
              {currentSymbol?.product_details?.symbol}
            </span>
          </NavTitle>
          <NavRight>{this.renderTraderStatus(trader_status)}</NavRight>
        </Navbar>
        <div className="stock-container">
          <div
            className={`self-select-buy-sell-block now-stock ${
              isHigh && "p-up stock-up"
              } ${!isHigh && "p-down stock-down"}`}
          >
            {selectedSymbolInfo?.sell?.toFixed(3) ??
              currentSymbol?.product_details?.sell?.toFixed(3)}
          </div>
          <div className="arrow">
            {isHigh ? (
              <img src={upIcon} alt="upIcon" />
            ) : (
                <img className="deg180" src={downIcon} alt="downIcon" />
              )}
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
        </div>
        {/* <div className="switch-chart">
          <span>分時</span>
          <span className="active">5日</span>
          <span>日K</span>
          <span>週K</span>
          <span>月K</span>
        </div> */}
        {/* <WS_TrendContainer nowRealID={currentSymbolType === '自选' ? currentSymbol.symbol : currentSymbol.id} unit={"1m"} /> */}
        <div className="chart-container">
          <Tabs tabs={chartMap}
            initialPage={0}
            renderTab={tab => <span>{tab.title}</span>}
            tabBarBackgroundColor="#21212b"
            tabBarActiveTextColor="#F2E205"
            tabBarInactiveTextColor="#838D9E"
            tabBarUnderlineStyle={{ border: "1px solid #F2E205" }}
            onChange={this.handleChartTabChange}
          >
            {chartMap.map((item) => {
              return (
                <div key={item.unit}>
                  {this.renderChart(currentSymbol.id, item.unit)}
                </div>
              )
            })
            }
          </Tabs>
        </div>

        {/* <WS_TrendContainer nowRealID={currentSymbol.id} unit={"1m"} /> */}
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
