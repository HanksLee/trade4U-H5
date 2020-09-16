import intl from "react-intl-universal";
import React from "react";
import utils from "utils";
import moment from "moment";
import { Modal } from "antd";
import api from "services";
import { MARKET_TYPE } from "constant";
import {
  Page,
  Navbar,
  NavTitle,
  NavRight,
  NavLeft,
  Icon,
  Link,
} from "framework7-react";
import { inject, observer } from "mobx-react";
import "antd/dist/antd.css";
import "./index.scss";
import cn from "classnames";
@inject("common", "message", "subscribe")
@observer
export default class Subscribe extends React.Component {
  state = { currentTab: "港股", currentList: [] };

  componentDidMount() {
    this.initEvents();
    this.fetchData();
  }

  initEvents = () => {
    this.props.common.globalEvent.on("refresh-subscribe-page", () => {
      this.setSubscribeContentHeight();
    });
  };
  fetchData = async () => {
    const newStockList = await api.subscribe.getNewStockList();
    const newStockParticipateList = await api.subscribe.getNewStockParticipateList();
    console.log("newStockList :>> ", newStockList);
    console.log("newStockParticipateList :>> ", newStockParticipateList);
    this.setState({ currentList: newStockList.data });
    this.props.subscribe.setNewStockList(newStockList.data);
  };
  setSubscribeContentHeight = () => {
    // page
    const pageHeight = document.getElementById("view-subscribe").clientHeight;
    const subscribeNavbarHeight = document.getElementsByClassName(
      "subscribe-navbar"
    )[0].clientHeight;
    const tabbarHeight = document.getElementsByClassName("app-tabbar")[0]
      .clientHeight;
    const subscribeTabsHeight = document.getElementsByClassName(
      "subscribe-tabs"
    )[0].clientHeight;
    const subscribeSelectHeight = document.getElementsByClassName(
      "subscribe-select-header"
    )[0].clientHeight;

    const subscribeContentHeight =
      pageHeight -
      subscribeNavbarHeight -
      tabbarHeight -
      subscribeTabsHeight -
      subscribeSelectHeight;

    document.getElementsByClassName(
      "subscribe-container"
    )[0].style.height = `${subscribeContentHeight}px`;
  };

  switchSubscribeTabs = (name) => {
    this.setSubscribeContentHeight();
    this.setState({ currentTab: name });
  };

  showLogoutModal = () => {
    const { confirm } = Modal;
    const that = this;
    confirm({
      title: "提示",
      content: "您確定要登出嗎",
      className: "trade-modal",
      centered: true,
      cancelText: "取消",
      okText: "确认",
      onOk() {
        that.logout();
      },
      onCancel() {},
    });
  };

  showSubscribeSelect = () => {
    const { subscribeSelectShow } = this.state;
    this.setState({
      subscribeSelectShow: !subscribeSelectShow,
    });
  };

  render() {
    const { currentTab, currentList, subscribeSelectShow = false } = this.state;
    console.log("currentList :>> ", currentList);
    return (
      <Page name="subscribe" className="subscribe-page">
        <Navbar className="subscribe-navbar">
          <NavLeft></NavLeft>
          <NavTitle>申购</NavTitle>
          <NavRight></NavRight>
        </Navbar>
        <div className="subscribe-tabs">
          {/* {
            tradeTabOptions.map((item) => {
              return (
                <div
                  onClick={() => { this.switchTradeTabs(item.name) }}
                  className={`market-navbar-item ${currentTradeTab === item.name && 'active'}`}>
                  {item.name}
                </div>)
            })
          } */}
          <div
            className={`subscirbe-tab-item ${
              currentTab === "港股" && "active"
            }`}
            onClick={() => {
              this.switchSubscribeTabs("港股");
            }}
          >
            港股
          </div>
          <div
            className={`subscirbe-tab-item ${
              currentTab === "沪深" && "active"
            }`}
            onClick={() => {
              this.switchSubscribeTabs("沪深");
            }}
          >
            沪深
          </div>
        </div>
        <div className="subscribe-select-header">
          <div className="subscribe-type">
            <p
              onClick={() => {
                this.showSubscribeSelect();
              }}
            >
              可申购
            </p>
            {subscribeSelectShow && (
              <ul>
                <li className="active">可申购</li>
                <li>已申购</li>
              </ul>
            )}
          </div>
        </div>

        {/*  */}
        <div className="subscribe-container">
          {currentList.map((data) => {
            return <SubscribeItem data={data} router={this.$f7router} />;
          })}
          <div
            className="subscribe-item"
            onClick={() => this.$f7router.navigate(`/subscribe/detail/${214}`)}
          >
            <div className="subscribe-item-left">
              <div className="date">
                <p>截止日</p>
                <p>06/20</p>
              </div>
            </div>
            <div className="subscribe-item-middle">
              <p>
                <span className="subscribe-remark">可申购</span>泰格医药
              </p>
              <p>
                申购价：<span className="subscribe-price">30.30</span>
              </p>
            </div>
            <div className="subscribe-item-right">
              <i className="icon icon-forward"></i>
            </div>
          </div>
          <div className="subscribe-item noSubscribe">
            <div className="subscribe-item-left">
              <div className="date">
                <p>已截止</p>
              </div>
            </div>
            <div className="subscribe-item-middle">
              <p>
                <span className="subscribe-remark">未申购</span>泰格医药
              </p>
              <p>
                申购价：<span className="subscribe-price">30.30</span>
              </p>
            </div>
            <div className="subscribe-item-right">
              <i className="icon icon-forward"></i>
            </div>
          </div>

          <div
            className="subscribe-item isSubscribe"
            onClick={() => {
              this.$f7router.navigate(`/subscribe/isSubscribeDetail`);
            }}
          >
            <div className="subscribe-item-left">
              <div className="date">
                <p>已截止</p>
                <p>06/20</p>
              </div>
            </div>
            <div className="subscribe-item-middle">
              <p>
                <span className="subscribe-remark">已申购</span>泰格医药
              </p>
              <p>
                申购价：<span className="subscribe-price">30.30</span>
              </p>
              <p>
                申购手数：<span className="">1</span>
              </p>
              <p>
                申購金額：<span className="">121200</span>
              </p>
            </div>
            <div className="subscribe-item-right">
              <i className="icon icon-forward"></i>
            </div>
          </div>
        </div>
      </Page>
    );
  }
}

function mapApiDataToDisplayValue(input) {
  // 转换 api 资料为要展示的格式
  const payload = { ...input };
  const {
    market,
    subscription_date_start,
    subscription_date_end,
    draw_result_date,
    public_date,
  } = payload;
  payload["subscription_date_end"] = moment(subscription_date_end).format(
    "MM-DD"
  );
  payload["market_name"] = MARKET_TYPE[market]["name"];
  payload["draw_result_date"] = moment(draw_result_date).format("YYYY-MM-DD");
  payload["public_date"] = moment(public_date).format("YYYY-MM-DD");
  return payload;
}
function SubscribeItem(props) {
  const { data, router } = props;
  const {
    id,
    stock_name,
    public_price,
    subscription_date_end,
  } = mapApiDataToDisplayValue(data);
  const isUserDidSubscribe = true;
  const isExpired = true;
  return (
    <div
      className={cn("subscribe-item", { isSubscribe: isUserDidSubscribe })}
      onClick={() => router.navigate(`/subscribe/detail/${id}`)}
    >
      <div className="subscribe-item-left">
        <div className="date">
          <p>{isExpired ? "已截止" : "截止日"}</p>
          <p>{subscription_date_end}</p>
        </div>
      </div>
      <div className="subscribe-item-middle">
        <p>
          {/* 申购状态: 已申购, 可申购 */}
          <span className="subscribe-remark">
            {isUserDidSubscribe ? "已申购" : "可申购"}
          </span>
          {stock_name}
        </p>
        <p>
          申购价：<span className="subscribe-price">{public_price}</span>
        </p>
        {isUserDidSubscribe && (
          <React.Fragment>
            <p>
              申购手数：<span className="">{"-"}</span>
            </p>
            <p>
              申購金額：<span className="">{"-"}</span>
            </p>
          </React.Fragment>
        )}
      </div>
      <div className="subscribe-item-right">
        <i className="icon icon-forward"></i>
      </div>
    </div>
  );
}
