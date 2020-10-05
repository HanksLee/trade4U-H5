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
import GuideModal from "components/GuideModal";
import WS_Symbol from "components/Websocket/Symbol";

@inject("common", "message")
@observer
export default class extends React.Component {
  $event = null;
  componentDidMount() {
    this.$f7ready(async (f7) => {
      const token = utils.getLStorage("MOON_H5_TOKEN");
      this.$event = new Framework7.Events();
      this.props.common.setGlobalEvent(this.$event);
      await this.props.common.getConfigList();
      this.getQuoteColor();
    });
  }

  // shouldComponentUpdate() {
  //   return false;
  // }

  componentWillUnmount = () => {
    // const token = utils.getLStorage("MOON_H5_TOKEN");
    // if (token && this.props.message.wsConnect) {
    //   this.props.message.wsConnect.close();
    // }
  };

  getQuoteColor = () => {
    const { configMap } = this.props.common;
    if (!localStorage.getItem("color_mode")) {
      const colorMode = configMap["color_mode"];
      localStorage.setItem("color_mode", colorMode)
    }
    this.props.common.setQuoteColor();
  }

  updateLastestSymbol = () => {
    this.$event.emit("update-latest-symbol");
  };
  render() {
    const { hasAnnouncement, hasNotify } = this.props.message;
    // 取得系统配置参数，转换为物件，并动态渲染可见页面
    const { configMap } = this.props.common;
    // console.log("configMap :>> ", configMap);
    const isSubscribePageVisible = utils.parseBool(configMap["function_ipo"]); // 申购页
    const isNewsPageVisible = utils.parseBool(configMap["function_news"]); // 新闻页
    return (
      <Page name="home">
        <WS_Symbol />
        <GuideModal />
        <Views tabs className="safe-areas">
          <View
            key="view-market"
            id="view-market"
            name="行情"
            tabActive
            tab
            url="/market/"
          />
          {isSubscribePageVisible && (
            <View
              key="view-subscribe"
              id="view-subscribe"
              name="申购"
              tab
              url="/subscribe/"
            />
          )}

          <View
            key="view-trade"
            id="view-trade"
            name="交易"
            tab
            url="/trade/"
          />
          {isNewsPageVisible && (
            <View key="view-news" id="view-news" name="新闻" tab url="/news/" />
          )}
          <View
            key="view-settings"
            id="view-settings"
            name="设置"
            tab
            url="/settings/"
          />
          <Toolbar tabbar labels bottom className="app-tabbar">
            <Link
              tabLink="#view-market"
              tabLinkActive
              icon="market-icon"
              text="行情"
              id="view-market-btn"
            />
            {isSubscribePageVisible && (
              <Link
                tabLink="#view-subscribe"
                icon="subscribe-icon"
                text="申购"
                force={true}
                reloadCurrent={true}
                id="view-subscribe-btn"
                onClick={() => this.$event.emit("refresh-subscribe-page")}
              />
            )}
            <Link
              tabLink="#view-trade"
              icon="trade-icon"
              text="交易"
              force={true}
              reloadCurrent={true}
              id="view-trade-btn"
              onClick={() => this.$event.emit("refresh-trade-page")}
            />
            {isNewsPageVisible && (
              <Link
                tabLink="#view-news"
                icon="news-icon"
                text="新闻"
                force={true}
                reloadCurrent={true}
                id="view-news-btn"
                onClick={() => this.$event.emit("refresh-news-page")}
              />
            )}
            <Link
              tabLink="#view-settings"
              icon="settings-icon"
              text="设置"
              id="view-settings-btn"
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
