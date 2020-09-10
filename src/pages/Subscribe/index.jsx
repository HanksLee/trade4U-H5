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

@inject("message")
@observer
export default class extends React.Component {
  state = { currentTab: "港股" };

  componentDidMount() {}

  switchSubscribeTabs = (name) => {
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

  render() {
    const { currentTab } = this.state;
    return (
      <Page name="subscirbe" className="subscribe-page">
        <Navbar>
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
        </div>
      </Page>
    );
  }
}
