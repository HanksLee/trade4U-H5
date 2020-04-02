import api from 'services';
import React from 'react';
import { Page, Navbar, List, ListItem, NavRight, NavLeft, NavTitle } from 'framework7-react';
import EditIcon from "assets/img/edit2.svg";
import AddIcon from "assets/img/add.svg";
import { inject, observer } from "mobx-react";
import moment from 'moment';
import './index.scss';

@inject("market")
@observer
export default class extends React.Component {
  componentDidMount() {
    this.props.market.getSelfSelectSymbolList();
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
                  <div className="self-select-tr">
                    <div>
                      <div className="self-select-time">
                        {moment(item.timestamp).format('HH:mm:ss')}
                      </div>
                      <div className="self-select-name">{item.name}</div>
                      <div className="self-select-spread">{item.spread}</div>
                    </div>
                    <div className="self-select-code">{item.symbol}</div>
                    <div>
                      <div className="self-select-buy-sell-block">{item.buy}</div>
                      <div className="self-select-low">最低：{item.low}</div>
                    </div>
                    <div>
                      <div className="self-select-buy-sell-block">{item.sell}</div>
                      <div className="self-select-high">最高：{item.high}</div>
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
