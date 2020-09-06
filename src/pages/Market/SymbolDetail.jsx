import api from 'services';
import React from 'react';
import {
  Page, Navbar, List, ListItem, Block,
  NavTitle,
  NavLeft,
  NavRight,
  Icon,
  Link,
  Toolbar,
} from 'framework7-react';
import { Toast } from "antd-mobile";
import { Modal } from 'antd';
import { inject, observer } from "mobx-react";
import WSConnect from "components/HOC/WSConnect";
import channelConfig from "./config/trendChannelConfig"
import Trend from "./Trend";
import 'antd/dist/antd.css';
import './index.scss';
import UpArrowIcon from "assets/img/up-arrow-icon.svg";
import OrderIcon from "assets/img/order-icon.svg";

const WS_TrendContainer = WSConnect(
  channelConfig[0],
  channelConfig,
  Trend
);

@inject("market", "trend")
@observer
export default class extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      currentSymbol: this.props.currentSymbol,
      isAddSelfSelect: 0
    }
  }

  static getDerivedStateFromProps(props, state) {
    // console.log(props)
  }


  showSelfSelectModal = async () => {
    const { confirm } = Modal;
    const { isAddSelfSelect, currentSymbol } = this.state;
    const { currentSymbolType } = this.props;

    let symbolID = currentSymbolType === '自选' ? currentSymbol.symbol : currentSymbol.id;

    if (isAddSelfSelect === 0) {
      const res = await api.market.addSelfSelectSymbolList({
        symbol: [symbolID],
      });
      if (res.status === 201) {
        this.setState({ isAddSelfSelect: 1 })
        Toast.success("加入自选成功", 2)
      }

    } else {
      const that = this;
      confirm({
        title: '提示',
        content: '确认刪除自选嗎?',
        className: "trade-modal",
        centered: true,
        cancelText: "取消",
        okText: "确认",
        async onOk() {
          const res = await api.market.deleteSelfSelectSymbolList({
            data: {
              symbol: [symbolID],
            }
          });
          if (res.status === 204) {
            that.setState({ isAddSelfSelect: 0 })
            Toast.success("刪除自选成功", 2);
            let queryString = `page=${1}&page_size=${20}`
            await that.props.market.getSelfSelectSymbolList(queryString, true);
          }
        },
        onCancel() {
        },
      });
    }

  }

  render() {
    console.log(this.props)
    const { currentSymbolType } = this.props;
    const { currentSymbol, isAddSelfSelect } = this.state;
    return (
      <Page noToolbar>
        <Navbar>
          <NavLeft>
            <Link back>
              <Icon color={'white'} f7={'chevron_left'} size={r(18)}></Icon>
            </Link>
          </NavLeft>
          <NavTitle>{currentSymbol?.symbol_display?.name}</NavTitle>
          <NavRight className="transistion-text">交易中</NavRight>

        </Navbar>
        {/* {
          currentSymbol?.symbol_display?.description && (
            <Block className="symbol-display-block">
              <p>{currentSymbol?.symbol_display?.description}</p>
            </Block>
          )
        } */}
        <div className="stock-container">
          <div className="now-stock">{currentSymbol?.product_details?.sell}</div>
          <div className="arrow"><img src={UpArrowIcon} alt="UpArrowIcon" /></div>
          <div className="spread-stock">
            <div>
              <p>{currentSymbol?.product_details?.change}</p>
              <p>{`${((currentSymbol?.product_details?.change) / (currentSymbol?.product_details?.sell) * 100).toFixed(2)}%`}</p>
            </div>
          </div>
        </div>
        {/* <div className="switch-chart">
          <span>分時</span>
          <span className="active">5日</span>
          <span>日K</span>
          <span>週K</span>
          <span>月K</span>
        </div> */}
        <WS_TrendContainer nowRealID={currentSymbolType === '自选' ? currentSymbol.symbol : currentSymbol.id} unit={"1m"} />
        <div className="stock-detail">
          <div><span>小数点位</span><span>{String(currentSymbol?.symbol_display?.decimals_place)}</span></div>
          <div><span>合约大小</span><span>{String(currentSymbol?.symbol_display?.contract_size)}</span></div>
          <div><span>点差</span><span>{String(currentSymbol?.symbol_display?.spread)}</span></div>
          <div><span>预付款货币</span><span>{currentSymbol?.symbol_display?.margin_currency_display}</span></div>
          <div><span>获利货币</span><span>{currentSymbol?.symbol_display?.profit_currency_display}</span></div>
          <div><span>最小交易手数</span><span>{String(currentSymbol?.symbol_display?.min_lots)}</span></div>
          <div><span>最大交易手数</span><span>{String(currentSymbol?.symbol_display?.max_lots)}</span></div>
          <div><span>交易数步长</span><span>{String(currentSymbol?.symbol_display?.lots_step)}</span></div>
          <div><span>买入库存费</span><span>{String(currentSymbol?.symbol_display?.purchase_fee)}</span></div>
          <div><span>卖出库存费</span><span>{String(currentSymbol?.symbol_display?.selling_fee)}</span></div>
        </div>
        <Toolbar tabbar labels bottom className="app-tabbar stock-tabbar">
          <Link
            tabLinkActive
            icon="market-icon"
            text="行情"
            className="tabbar-label"
            onClick={() => {
              this.$f7router.back();
            }}
          />
          <Link
            icon={`${isAddSelfSelect === 0 ? 'self-select-icon' : 'self-select-icon-active'}`}
            text="自选"
            className="tabbar-label"
            // onClick={this.updateLastestSymbol}
            onClick={this.showSelfSelectModal}
          />
          <div className="order-btn"><img src={OrderIcon} alt="OrderIcon"
            onClick={() => {
              this.$f7router.navigate(`/trade/${currentSymbolType === '自选' ? currentSymbol.symbol : currentSymbol.id}/`, {
                props: {
                  mode: 'add',
                }
              })
            }}
          /></div>
        </Toolbar>
      </Page>
    );
  }
}
