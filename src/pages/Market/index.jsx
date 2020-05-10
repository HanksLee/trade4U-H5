import api from 'services';
import React from 'react';
import { Page, Navbar, List, NavRight, NavLeft, NavTitle,
  Actions, ActionsLabel, ActionsGroup, ActionsButton } from 'framework7-react';
import EditIcon from "assets/img/edit2.svg";
import AddIcon from "assets/img/add.svg";
import { inject, observer } from "mobx-react";
import moment from 'moment';
import ws from 'utils/ws'
import Dom7 from 'dom7';
import './index.scss';

const $$ = Dom7;

@inject("market")
@observer
export default class extends React.Component {
  wsConnect = null
  buyTimers = []
  sellTimers = []
  state = {
    currentSymbol: null,
  }

  async componentDidMount() {
    await this.props.market.getSelfSelectSymbolList();
    this.connnetWebsocket()

    $$('.self-select-tr').on('taphold', (evt) => {
      const dom = $$(evt.target).parents('.self-select-tr')[0] || $$(evt.target)[0];
      if (dom) {
        const id = $$(dom).data('id')
        const { selfSelectSymbolList, } = this.props.market
        for (let i = 0; i < selfSelectSymbolList.length; i++) {
          if (String(selfSelectSymbolList[i].id) === id) {
            this.setState({
              currentSymbol: selfSelectSymbolList[i],
            })
            break
          }
        }
        this.refs.actionsGroup.open();
      }
    })
  }

  componentWillUnmount = () => {
    if (this.wsConnect) {
      this.wsConnect.close()
    }
  }

  connnetWebsocket = () => {
    this.wsConnect = ws('self-select-symbol')
    this.wsConnect.onmessage = (event) => {
      const message = event.data;
      const data = JSON.parse(message).data
      const { selfSelectSymbolList, } = this.props.market
      const newSelfSelectSymbolList = selfSelectSymbolList.map((item, index) => {
        if (item.symbol_display.product_display.code === data.symbol &&
          Number(item.product_details.timestamp) < Number(data.timestamp)) {
          const buyItemDom = $$($$('.self-select-buy-block')[index])
          const sellItemDom = $$($$('.self-select-sell-block')[index])
          if (data.buy > item.product_details.buy) {
            clearTimeout(this.buyTimers[index])
            buyItemDom.removeClass('decrease')
            buyItemDom.addClass('increase')
            this.buyTimers[index] = setTimeout(() => {
              buyItemDom && buyItemDom.removeClass('increase')
            }, 2000);
          } else if (data.buy < item.product_details.buy) {
            clearTimeout(this.buyTimers[index])
            buyItemDom.removeClass('increase')
            buyItemDom.addClass('decrease')
            this.buyTimers[index] = setTimeout(() => {
              buyItemDom && buyItemDom.removeClass('decrease')
            }, 2000);
          }

          if (data.sell > item.product_details.sell) {
            clearTimeout(this.sellTimers[index])
            sellItemDom.removeClass('decrease')
            sellItemDom.addClass('increase')
            this.sellTimers[index] = setTimeout(() => {
              sellItemDom && sellItemDom.removeClass('increase')
            }, 2000);
          } else if (data.sell < item.product_details.sell) {
            clearTimeout(this.sellTimers[index])
            sellItemDom.removeClass('increase')
            sellItemDom.addClass('decrease')
            this.sellTimers[index] = setTimeout(() => {
              sellItemDom && sellItemDom.removeClass('decrease')
            }, 2000);
          }

          return {
            ...item,
            product_details: {
              ...item.product_details,
              ...data,
            }
          }
        }
        return item
      })
      this.props.market.setSelfSelectSymbolList(newSelfSelectSymbolList)
    };
  }

  navigateToManagePage = () => {
    this.$f7router.navigate('/market/manage-self-select')
  }

  navigateToSymbolTypePage = () => {
    this.$f7router.navigate('/market/symbol_type')
  }

  navigateToChart = () => {
    const { currentSymbol } = this.state
    this.$f7router.navigate(`/chart/${currentSymbol.symbol}`, {
      context: currentSymbol,
    })
  }

  navigateToSymbolDetail = () => {
    const { currentSymbol } = this.state
    this.$f7router.navigate(`/market/symbol/${currentSymbol.id}`, {
      context: currentSymbol,
    })
  }

  addSpecialStyle = (num) => {
    const strs = String(num).split('.')
    if (strs.length > 1) {
      if (strs[1].length > 0) {
        if (strs[1].length < 2) {
          return (
            <>
              <span>{strs[0]}.</span>
              <span className="large-number">{strs[1][0]}</span>
            </>
          )
        } else {
          const last = strs[1].substr(4)
          return (
            <>
              <span>{strs[0]}.</span>
              <span className="large-number">{strs[1][0]}{strs[1][1]}</span>
              {last}
            </>
          )
        }

      } else {
        return <span>{num}</span>
      }
    }
    return strs[0]
  }

  render() {
    const { selfSelectSymbolList, } = this.props.market;
    const { currentSymbol, } = this.state;

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
                  <div className="self-select-tr" key={item.symbol} data-id={item.id}>
                    <div>
                      <div className="self-select-time">
                        {
                          item.product_details.timestamp ?
                            moment(Number(item.product_details.timestamp) * 1000).format('HH:mm:ss')
                            : '--:--:--'
                        }
                      </div>
                      <div className="self-select-name">{item.symbol_display.name}</div>
                      <div className="self-select-spread">{item.symbol_display.spread}</div>
                    </div>
                    <div className="self-select-code">{item.symbol_display.product_display.code}</div>
                    <div>
                      <div className="self-select-buy-sell-block self-select-buy-block">
                        {item.product_details.buy ? this.addSpecialStyle(item.product_details.buy) : '--'}
                      </div>
                      <div className="self-select-low">
                        最低：{item.product_details.low ? item.product_details.low : '--'}
                      </div>
                    </div>
                    <div>
                      <div className="self-select-buy-sell-block self-select-sell-block">
                        {item.product_details.sell ? this.addSpecialStyle(item.product_details.sell) : '--'}
                      </div>
                      <div className="self-select-high">
                        最高：{item.product_details.high ? item.product_details.high : '--'}
                      </div>
                    </div>
                  </div>
                )
              })
            }
          </>
        </div>
        <Actions ref="actionsGroup">
          <ActionsGroup>
            {
              currentSymbol && currentSymbol.symbol_display.description && (
                <ActionsLabel>{currentSymbol.symbol_display.description}</ActionsLabel>
              )
            }
            <ActionsButton onClick={() => {
              this.$f7router.navigate(`/trade/${currentSymbol.symbol}/`, {
                props: {
                  mode: 'add',
                }
              })
            }}>交易</ActionsButton>
            <ActionsButton onClick={this.navigateToChart}>图表</ActionsButton>
            <ActionsButton onClick={this.navigateToSymbolDetail}>详细情况</ActionsButton>
          </ActionsGroup>
          <ActionsGroup>
            <ActionsButton>取消</ActionsButton>
          </ActionsGroup>
        </Actions>
      </Page>
    );
  }
}
