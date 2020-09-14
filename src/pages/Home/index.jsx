import React from "react";
import {
  Page,
  Views,
  View,
  Toolbar,
  Link,
  LoginScreen,
} from "framework7-react";
import utils from "utils";
import Framework7 from "framework7/framework7-lite.esm.bundle.js";
import { inject, observer } from "mobx-react";
import "./index.scss";

import WS_Symbol from "components/Websocket/Symbol";

@inject("common", "message")
@observer
export default class extends React.Component {
  $event = null;
  componentDidMount() {
    // this.getConfig();

    this.$f7ready(async (f7) => {
      const token = utils.getLStorage("MOON_H5_TOKEN");
      this.$event = new Framework7.Events();
      await this.props.common.setGlobalEvent(this.$event);
      await this.props.common.getSystemConfig();
      // if (token) {
      //   this.props.message.connectNotifyWebsocket();
      // }
    });
  }
  componentWillUnmount = () => {
    // const token = utils.getLStorage("MOON_H5_TOKEN");
    // if (token && this.props.message.wsConnect) {
    //   this.props.message.wsConnect.close();
    // }
  };

  updateLastestSymbol = () => {
    this.$event.emit("update-latest-symbol");
  };
  render() {
    const { hasAnnouncement, hasNotify } = this.props.message;
    // 取得系统配置参数，转换为物件，并动态渲染可见页面
    const { systemConfig } = this.props.common;
    const config = systemConfig.reduce((obj, curr) => {
      const { key, value } = curr;
      obj[key] = value;
      return obj;
    }, {});
    const isIpoVisible = utils.parseBool(config["function_ipo"]); // 申购页
    const isNewsVisible = utils.parseBool(config["function_news"]); // 新闻页
    return (
      <Page name="home">
        <WS_Symbol />
        <Views tabs className="safe-areas">
          <View id="view-market" name="行情" tabActive tab url="/market/" />
          {/* <View id="view-chart" name="图表" tab url="/chart/" /> */}
          <View id="view-subscribe" name="申购" tab url="/subscribe/" />
          <View id="view-trade" name="交易" tab url="/trade/" />
          <View id="view-news" name="新闻" tab url="/news/" />
          {/* <View id="view-history" name="历史" tab url="/history/" /> */}
          <View id="view-settings" name="设置" tab url="/settings/" />
          <Toolbar tabbar labels bottom className="app-tabbar">
            <Link
              tabLink="#view-market"
              tabLinkActive
              icon="market-icon"
              text="行情"
            />
            {/* <Link
              tabLink="#view-chart"
              icon="chart-icon"
              text="图表"
              onClick={this.updateLastestSymbol}
            /> */}
            {isIpoVisible && (
              <Link
                tabLink="#view-subscribe"
                icon="subscribe-icon"
                text="申购"
                force={true}
                reloadCurrent={true}
              />
            )}
            <Link
              tabLink="#view-trade"
              icon="trade-icon"
              text="交易"
              force={true}
              reloadCurrent={true}
              onClick={() => {
                this.$event.emit("refresh-trade-page");
              }}
            />
            {isNewsVisible && (
              <Link
                tabLink="#view-news"
                icon="news-icon"
                text="新闻"
                force={true}
                reloadCurrent={true}
                onClick={() => {
                  this.$event.emit("refresh-news-page");
                }}
              />
            )}
            <Link
              tabLink="#view-settings"
              icon="settings-icon"
              text="设置"
              className="settings-icon-container"
            >
              {(hasAnnouncement || hasNotify) && (
                <span className="has-unread-message"></span>
              )}
              {/* <span className="has-unread-message"></span> */}
            </Link>
          </Toolbar>
        </Views>
      </Page>
    );
  }
}
