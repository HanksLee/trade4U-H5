import api from 'services';
import React from 'react';
import { Page, Navbar, List, ListItem, NavRight, NavLeft, NavTitle } from 'framework7-react';
import EditIcon from "assets/img/edit2.svg";
import AddIcon from "assets/img/add.svg";
import { inject, observer } from "mobx-react";
import moment from 'moment';
import ws from 'utils/ws'
import './index.scss';

@inject("market")
@observer
export default class extends React.Component {
  async componentDidMount() {
    this.props.market.getSelfSelectSymbolList();
    this.connnetWebsocket()
  }

  connnetWebsocket = () => {
    const wsConnect = ws('self-select-symbol')
    wsConnect.onopen = () => {
      console.log('open')
    }
    wsConnect.onmessage = (event) => {
      const message = event.data;
      const data = JSON.parse(message).data
      const { selfSelectSymbolList, } = this.props.market
      const newSelfSelectSymbolList = selfSelectSymbolList.map(item => {
        if (item.symbol_display.product_display.code === data.symbol) {
          return {
            ...item,
            symbol_display: {
              ...item.symbol_display,
              ...data,
              buyTrend: data.buy - item.symbol_display.buy,
              sellTrend: data.sell - item.symbol_display.sell,
            }
          }
        }
        return item
      })
      this.props.market.setSelfSelectSymbolList(newSelfSelectSymbolList)
    };
  }

  navigateToManagePage = () => {
    this.$f7router.navigate('/market/manage-self-select');
  }

  navigateToSymbolTypePage = () => {
    this.$f7router.navigate('/market/symbol_type');
  }
  
  render() {
    const { selfSelectSymbolList, } = this.props.market;
    return (
      <Page name="market">
        <Navbar>
          <NavLeft>
            <img alt="edit" src={EditIcon} onClick={this.navigateToManagePage} />
          </NavLeft>
          <NavTitle>行情</NavTitle>
          <NavRight>
            <img alt="add" src={AddIcon} onClick={this.navigateToSymbolTypePage} />
          </NavRight>
        </Navbar>
        <div className="self-select-table">
          <div className="self-select-table-header">
            <div>品种</div>
            <div>代码</div>
            <div>卖出价</div>
            <div>买入价</div>
          </div>
          <>
            {
              selfSelectSymbolList.map(item => {
                return (
                  <div className="self-select-tr" key={item.symbol}>
                    <div>
                      <div className="self-select-time">
                        {moment(Number(item.symbol_display.timestamp)).format('HH:mm:ss')}
                      </div>
                      <div className="self-select-name">{item.symbol_display.name}</div>
                      <div className="self-select-spread">{item.symbol_display.spread}</div>
                    </div>
                    <div className="self-select-code">{item.symbol}</div>
                    <div>
                      <div className={`self-select-buy-sell-block ${item.symbol_display.buyTrend > 0 ? 'increase' : 'decrease'}`}>
                        {item.symbol_display.buy}
                      </div>
                      <div className="self-select-low">最低：{item.symbol_display.low}</div>
                    </div>
                    <div>
                      <div className={`self-select-buy-sell-block ${item.symbol_display.sellTrend > 0 ? 'increase' : 'decrease'}`}>
                        {item.symbol_display.sell}
                      </div>
                      <div className="self-select-high">最高：{item.symbol_display.high}</div>
                    </div>
                  </div>
                )
              })
            }
          </>
        </div>
      </Page>
    );
  }
}
