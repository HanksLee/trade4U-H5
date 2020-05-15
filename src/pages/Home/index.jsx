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
import Framework7 from 'framework7/framework7-lite.esm.bundle.js';
import { inject, observer } from "mobx-react";


@inject("common", "message")
@observer
export default class extends React.Component {
  $event = null;
  componentDidMount() {
    this.$f7ready((f7) => {
      const token = utils.getLStorage("MOON_H5_TOKEN");
      this.$event = new Framework7.Events();
      this.props.common.setGlobalEvent(this.$event);
    });
    this.props.message.connnetNotifyWebsocket();
  }

  componentWillUnmount = () => {
    if (this.props.message.wsConnect) {
      this.props.message.wsConnect.close();
    }
  };

  updateLastestSymbol = () => {
    this.$event.emit('update-latest-symbol');
  }

  render() {
    return (
      <Page name="home">
        <Views tabs className="safe-areas">
          <View id="view-market" name="行情" tabActive tab url="/market/" />
          <View id="view-chart" name="图表" tab url="/chart/" />
          <View id="view-trade" name="交易" tab url="/trade/" />
          <View id="view-history" name="历史" tab url="/history/" />
          <View id="view-settings" name="设置" tab url="/settings/" />
          <Toolbar tabbar labels bottom className="app-tabbar">
            <Link tabLink="#view-market" tabLinkActive icon="market-icon" text="行情" />
            <Link tabLink="#view-chart" icon="chart-icon" text="图表" onClick={this.updateLastestSymbol} />
            <Link tabLink="#view-trade" icon="trade-icon" text="交易" force={true} reloadCurrent={true} reloadCurrent={true} onClick={() => {
              this.$event.emit('refresh-trade-page');
            }}/>
            <Link tabLink="#view-history" icon="history-icon" text="历史" />
            <Link tabLink="#view-settings" icon="settings-icon" text="设置" />
          </Toolbar>
        </Views>
      </Page>
    );
  }
}
