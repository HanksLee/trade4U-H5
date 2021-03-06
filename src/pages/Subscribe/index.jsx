import intl from "react-intl-universal";
import React from "react";
import utils from "utils";
import moment from "moment";
import { toJS } from "mobx";
import { Page, Navbar, NavTitle, NavRight, NavLeft } from "framework7-react";
import { Tabs } from "antd-mobile";
import { inject, observer } from "mobx-react";
import "antd/dist/antd.css";
import "./index.scss";
import cn from "classnames";
import { SYMBOL_TYPE } from "../../constant";

@inject("common", "message", "subscribe")
@observer
export default class SubscribePage extends React.Component {
  state = { subscribeFilter: false, isFilterMenuOpen: false };

  componentDidMount() {
    // this.initEvents();
    this.props.subscribe.getNewStockList();
    this.props.subscribe.getUserSubscribeList();
  }

  toggleFilterMenu = () => {
    this.setState({ isFilterMenuOpen: !this.state.isFilterMenuOpen });
  };
  setSubscribeFilter = (isSubscribed) => {
    this.setState({ subscribeFilter: isSubscribed });
    this.toggleFilterMenu();
  };
  renderNewStockList = (symbolTypeFilter = {}) => {
    // symbolTypeFilter 指定要显示的 symbol_type 分类，例如 HK, ASHARES...
    // console.log("symbolTypeFilter :>> ", symbolTypeFilter);
    const { subscribeFilter } = this.state;
    const { sortedNewStockList } = this.props.subscribe;
    const userSubscribeMap = this.props.subscribe.userSubscribeMap;
    // console.log("sortedNewStockList :>> ", toJS(sortedNewStockList));
    return sortedNewStockList.map((data) => {
      const { id, symbol_type } = data;
      if (!symbolTypeFilter[symbol_type]) return; // 品种类型筛选
      const didUserSubscribe = userSubscribeMap[id] ? true : false; // 使用者是否已申购
      const orderInfo = userSubscribeMap[id] ?? {}; // 申购资讯
      if (subscribeFilter !== didUserSubscribe) return null; // 是否为已申购筛选
      return (
        <SubscribeItem
          router={this.$f7router}
          key={id}
          data={data}
          didUserSubscribe={didUserSubscribe}
          orderInfo={orderInfo}
        />
      );
    });
  };

  renderFilterMenu = () => {
    const { subscribeFilter, isFilterMenuOpen } = this.state;
    return (
      <div className="subscribe-filter-menu">
        <p onClick={() => this.toggleFilterMenu()}>
          {subscribeFilter ? "已申购" : "未申购"}
        </p>
        {isFilterMenuOpen && (
          <ul className="subscribe-filter-menu-list">
            <li onClick={() => this.setSubscribeFilter(false)}>未申购</li>
            <li onClick={() => this.setSubscribeFilter(true)}>已申购</li>
          </ul>
        )}
      </div>
    );
  };
  render() {
    const newStockList = this.props.subscribe.newStockList; // 要读取 newStockList，@observer 才能响应
    const configMap = this.props.common.configMap;
    const isHkPageVisible = utils.parseBool(configMap["hk_new_stock_switch"]);
    const isAsharesVisible = utils.parseBool(
      configMap["ashares_new_stock_switch"]
    );
    const pageMap = {
      HK: isHkPageVisible && {
        title: "港股",
        render: () => (
          <div className="subscribe-tab-page">
            <div className="subscribe-list-header">
              {this.renderFilterMenu()}
            </div>
            <div className="subscribe-list">
              {this.renderNewStockList({ HK: true })}
            </div>
          </div>
        ),
      },
      ASHARES: isAsharesVisible && {
        title: "A股",
        render: () => (
          <div className="subscribe-tab-page">
            <div className="subscribe-list-header">
              {this.renderFilterMenu()}
            </div>
            <div className="subscribe-list">
              {this.renderNewStockList({ ASHARES: true })}
            </div>
          </div>
        ),
      },
    };
    const pageList = Object.values(pageMap).filter((v) => v);
    const tabs = pageList;

    return (
      <Page name="subscribe" className="subscribe-page">
        <Navbar className="subscribe-navbar">
          <NavLeft></NavLeft>
          <NavTitle>申购</NavTitle>
          <NavRight></NavRight>
        </Navbar>
        <Tabs
          tabs={tabs}
          renderTabBar={(props) => (
            <Tabs.DefaultTabBar {...props} page={tabs.length} />
          )}
          initialPage={0}
          tabBarBackgroundColor="#21212b"
          tabBarActiveTextColor="#F2E205"
          tabBarInactiveTextColor="#838D9E"
          tabBarUnderlineStyle={{ border: "1px solid #F2E205" }}
        >
          {pageList.map((each) => each.render)}
        </Tabs>
      </Page>
    );
  }
}
const tags = {
  1: { id: "1", name: "未开始" },
  2: { id: "2", name: "进行中" },
  3: { id: "3", name: "已截止" },
  11: { id: "11", name: "已申购" },
  12: { id: "12", name: "可申购" },
  21: { id: "21", name: "已中签" },
  22: { id: "22", name: "未中签" },
};
class SubscribeItem extends React.Component {
  state = {};
  mapApiDataToDisplayValue = (input) => {
    // 转换 api 资料为要展示的格式
    const payload = { ...input };
    const {
      symbol_type,
      subscription_date_start,
      subscription_date_end,
      draw_result_date,
      public_date,
    } = payload;
    payload["public_date"] = public_date
      ? moment(public_date).format("MM-DD")
      : "尚未公布";
    payload["subscription_date_start"] = moment(subscription_date_start).format(
      "MM-DD"
    );
    payload["subscription_date_end"] = moment(subscription_date_end).format(
      "MM-DD"
    );
    payload["symbol_type_name"] = SYMBOL_TYPE[symbol_type];
    payload["draw_result_date"] = moment(draw_result_date).format("YYYY-MM-DD");
    return payload;
  };
  getTag = () => {
    const { data, didUserSubscribe, orderInfo } = this.props;
    const { isNotStarted, isExpired, isDrawn } = data;
    const { drawing_of_lots_status } = orderInfo ?? {};
    const isWinning = drawing_of_lots_status === "1";
    if (didUserSubscribe) {
      if (isDrawn) {
        if (isWinning) return tags[21];
        if (!isWinning) return tags[22];
      } else {
        return tags[11];
      }
    } else {
      if (isExpired) {
        return tags[3];
      } else if (isNotStarted) {
        return tags[1];
      } else {
        return tags[12];
      }
    }
    return { id: "-1", name: "" };
  };
  render() {
    const { data, router, didUserSubscribe, orderInfo } = this.props;
    const {
      id,
      stock_name,
      public_price,
      subscription_date_start,
      subscription_date_end,
    } = this.mapApiDataToDisplayValue(data);
    const { wanted_lots, total_subscription_amount } = orderInfo;
    const tag = this.getTag();
    return (
      <div
        className={cn("subscribe-item", {
          "green-tag": tag.id === "11",
          "yellow-tag": tag.id === "12",
          "orange-tag": tag.id === "21",
        })}
        onClick={() => router.navigate(`/subscribe/detail/${id}`)}
      >
        <div className="subscribe-item-left">
          <div className="date">
            <div>{subscription_date_start}</div>
            <div>&#8942;</div>
            <div>{subscription_date_end}</div>
          </div>
        </div>
        <div className="subscribe-item-middle">
          <p>
            <span className="subscribe-remark">{tag.name}</span>
            {stock_name}
          </p>
          <p>
            申购价：<span className="subscribe-price">{public_price}</span>
          </p>
          {didUserSubscribe && (
            <React.Fragment>
              <p>申购手数：{wanted_lots}</p>
              <p>申购金额：{total_subscription_amount}</p>
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
            申购金额：<span className="">121200</span>
          </p>
        </div>
        <div className="subscribe-item-right">
          <i className="icon icon-forward"></i>
        </div>
      </div>
    </React.Fragment>
  );
}
