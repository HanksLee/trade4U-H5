import intl from "react-intl-universal";
import React from "react";
import utils from "utils";
import moment from "moment";
import { Modal } from "antd";
import api from "services";
import { toJS } from "mobx";
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
  state = { subscribeFilter: false, isFilterMenuOpen: false };

  componentDidMount() {
    this.initEvents();
    this.props.subscribe.getNewStockList();
    this.props.subscribe.getUserSubscribeList();
  }

  initEvents = () => {
    this.props.common.globalEvent.on("refresh-subscribe-page", () => {
      this.setSubscribeContentHeight();
    });
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

  showSubscribeSelect = () => {
    const { subscribeSelectShow } = this.state;
    this.setState({
      subscribeSelectShow: !subscribeSelectShow,
    });
  };
  toggleFilterMenu = () => {
    this.setState({ isFilterMenuOpen: !this.state.isFilterMenuOpen });
  };
  setSubscribeFilter = (type) => {
    this.setState({ subscribeFilter: type });
    this.toggleFilterMenu();
  };
  renderNewStockList = () => {
    const { subscribeFilter } = this.state;
    const newStockList = this.props.subscribe.newStockList;
    const userSubscribeList = this.props.subscribe.userSubscribeList;
    // console.log("newStockList :>> ", toJS(newStockList));
    // console.log("userSubscribeList :>> ", toJS(userSubscribeList));
    const userSubscribeMap = this.props.subscribe.userSubscribeMap;
    return newStockList.map((data) => {
      const stockId = data.id;
      const didUserSubscribe = userSubscribeMap[stockId] ? true : false; // 使用者是否已申购
      const orderInfo = userSubscribeMap[stockId]; // 申购资讯
      if (subscribeFilter !== didUserSubscribe) return null; // 与筛选状态不同时不渲染
      return (
        <SubscribeItem
          router={this.$f7router}
          key={stockId}
          data={data}
          didUserSubscribe={didUserSubscribe}
          orderInfo={orderInfo}
        />
      );
    });
  };
  render() {
    const { subscribeFilter, isFilterMenuOpen } = this.state;

    return (
      <Page name="subscribe" className="subscribe-page">
        <Navbar className="subscribe-navbar">
          <NavLeft></NavLeft>
          <NavTitle>申购</NavTitle>
          <NavRight></NavRight>
        </Navbar>
        <div className="subscribe-tabs">
          <div>港股</div>
          <div>沪深</div>
        </div>
        <div className="subscribe-select-header">
          <div className="subscribe-type">
            <p onClick={() => this.toggleFilterMenu()}>
              {subscribeFilter ? "已申购" : "可申购"}
            </p>
            {isFilterMenuOpen && (
              <ul>
                <li onClick={() => this.setSubscribeFilter(false)}>可申购</li>
                <li onClick={() => this.setSubscribeFilter(true)}>已申购</li>
              </ul>
            )}
          </div>
        </div>
        <div className="subscribe-container">{this.renderNewStockList()}</div>
      </Page>
    );
  }
}

class SubscribeItem extends React.Component {
  state = {};
  mapApiDataToDisplayValue = (input) => {
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
  };
  render() {
    const { data, router, didUserSubscribe } = this.props;
    const {
      id,
      stock_name,
      public_price,
      subscription_date_end,
    } = this.mapApiDataToDisplayValue(data);
    return (
      <div
        className={cn("subscribe-item", { isSubscribe: didUserSubscribe })}
        onClick={() => router.navigate(`/subscribe/detail/${id}`)}
      >
        <div className="subscribe-item-left">
          <div className="date">
            <p>截止日</p>
            <p>{subscription_date_end}</p>
          </div>
        </div>
        <div className="subscribe-item-middle">
          <p>
            <span className="subscribe-remark">
              {didUserSubscribe ? "已申购" : "可申购"}
            </span>
            {stock_name}
          </p>
          <p>
            申购价：<span className="subscribe-price">{public_price}</span>
          </p>
          {didUserSubscribe && (
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
}

function FakeList(props) {
  return (
    <React.Fragment>
      <div className="subscribe-item">
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

      <div className="subscribe-item isSubscribe">
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
    </React.Fragment>
  );
}
