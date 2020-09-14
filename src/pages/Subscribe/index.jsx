import intl from "react-intl-universal";
import React from "react";
import utils from "utils";
import { Modal } from "antd";
import api from "services";
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

@inject("common","message")
@observer
export default class extends React.Component {
  
  state = { currentTab: "港股" };

  
  componentDidMount() {
    this.initEvents();
  }

  initEvents = () => {
    this.props.common.globalEvent.on("refresh-subscribe-page", () => {
      this.setSubscribeContentHeight();
    });
  };

  setSubscribeContentHeight = () => {
    // page
    const pageHeight = document.getElementById("view-subscribe").clientHeight;
    const subscribeNavbarHeight = document.getElementsByClassName("subscribe-navbar")[0].clientHeight;
    const tabbarHeight = document.getElementsByClassName("app-tabbar")[0].clientHeight;
    const subscribeTabsHeight = document.getElementsByClassName("subscribe-tabs")[0].clientHeight;
    const subscribeSelectHeight = document.getElementsByClassName("subscribe-select-header")[0].clientHeight;

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
      onCancel() { },
    });
  };

  showSubscribeSelect = () => {
    const { subscribeSelectShow } = this.state;
    this.setState({
      subscribeSelectShow: !subscribeSelectShow
    })
  };

  render() {
    const { currentTab, subscribeSelectShow = false } = this.state;
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
            <p onClick={() => { this.showSubscribeSelect() }}>可申购</p>
            {subscribeSelectShow &&
              (<ul >
                <li className="active">可申购</li>
                <li>已申购</li>
              </ul>)
            }
          </div>
        </div>
        <div className="subscribe-container">
          <div
            className="subscribe-item"
            // onClick={()=>{
            //   this.$f7router.navigate(`/subscribe-detail/${currentSymbol.symbol}`,
            //   // {
            //   //   context: currentSymbol,
            //   // }
            //   )
            // }}
            onClick={() => {
              this.$f7router.navigate(
                `/subscribe/detail`
                // {
                //   context: currentSymbol,
                // }
              );
            }}
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

          <div className="subscribe-item isSubscribe"
            onClick={() => { this.$f7router.navigate(`/subscribe/isSubscribeDetail`) }}>
            <div className="subscribe-item-left">
              <div className="date">
                <p>已截止</p>
                <p>06/20</p>
              </div>
            </div>
            <div className="subscribe-item-middle">
              <p><span className="subscribe-remark">已申购</span>泰格医药</p>
              <p>申购价：<span className="subscribe-price">30.30</span></p>
              <p>申购手数：<span className="">1</span></p>
              <p>申購金額：<span className="">121200</span></p>
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
              <p><span className="subscribe-remark">已申购</span>泰格医药</p>
              <p>申购价：<span className="subscribe-price">30.30</span></p>
              <p>申购手数：<span className="">1</span></p>
              <p>申購金額：<span className="">121200</span></p>
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
