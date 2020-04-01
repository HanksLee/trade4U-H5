import React from 'react';
import { Page, Views, View, Toolbar, Link, LoginScreen } from 'framework7-react';
import utils from 'utils';

export default class extends React.Component {
  componentDidMount() {
    this.$f7ready((f7) => {
      const token = utils.getLStorage('MOON_H5_TOKEN');
      if (!token) {
        this.$f7router.navigate('/login');
      }
    });
  }

  render() {
    return (
      <Page name="home">
        <Views tabs className="safe-areas">
          <Toolbar tabbar labels bottom className="app-tabbar">
            <Link tabLink="#view-market" icon="market-icon" text="行情" />
            <Link tabLink="#view-chart" icon="chart-icon" text="图表" />
            <Link tabLink="#view-trade" icon="trade-icon" text="交易" />
            <Link tabLink="#view-history" icon="history-icon" text="历史" />
            <Link tabLink="#view-settings" icon="settings-icon" text="设置" />
          </Toolbar>

          <View id="view-market" name="行情" main tab  url="/market/" />
          <View id="view-chart" name="图表" tab url="/chart/" />
          <View id="view-trade" name="交易" tabActive tab url="/trade/" />
          <View id="view-history" name="历史" tab url="/history/" />
          <View id="view-settings" name="设置" tab url="/settings/" />
        </Views>
      </Page>
    )
  }
}
