import React from 'react';
import { Page, Views, View, Toolbar, Link, LoginScreen } from 'framework7-react';
import utils from 'utils';

export default class extends React.Component {
  state = {
    showToolbar: true,
  }
  componentDidMount() {
    this.$f7ready((f7) => {
      const token = utils.getLStorage('MOON_H5_TOKEN');
    });

    setTimeout(() => {
      console.log('repaint')
      document.querySelector('.page .page-current').style.height = "100%";
    }, 5000);
  }

  render() {
    return (
      <Page name="home">
        <Views tabs className="safe-areas">
          <View id="view-market" name="行情" tabActive tab  url="/market/" />
          <View id="view-chart" name="图表" tab url="/chart/" />
          <View id="view-trade" name="交易" tab url="/trade/" />
          <View id="view-history" name="历史" tab url="/history/" />
          <View id="view-settings" name="设置" tab url="/settings/" />
          <Toolbar tabbar labels bottom className="app-tabbar">
            <Link tabLink="#view-market" tabLinkActive icon="market-icon" text="行情" />
            <Link tabLink="#view-chart" icon="chart-icon" text="图表" />
            <Link tabLink="#view-trade"  icon="trade-icon" text="交易" />
            <Link tabLink="#view-history" icon="history-icon" text="历史" />
            <Link tabLink="#view-settings" icon="settings-icon" text="设置" />
          </Toolbar>
        </Views>
      </Page>
    )
  }
}
