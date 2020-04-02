import React from 'react';
import api from 'services';
import {
  Page, Navbar, List, ListItem, Block,
  NavTitle,
  NavRight,
  NavLeft,
  Icon,
  Link,
  Popup,
} from 'framework7-react';
import './index.scss';
import { inject, observer } from "mobx-react";

const pageSize = 50

@inject("market")
@observer
export default class extends React.Component {
  constructor(props) {
    super(props)

    this.symbolTypeName = this.$f7route.params.symbol_type_name
    this.state = {
      symbolTypeName: '',
      symbolList: [],
      page: 0,
      next: null,
      popupOpened: false,
      currentSymbol: null,
      selectedSymbols: [],
    }
  }
  
  componentDidMount() {
    this.getSymbolList({
      symbolTypeName: this.symbolTypeName,
      page: 1,
      pageSize,
    })
  }

  getSymbolList = async (query) => {
    const res = await api.market.getSymbolList(query)
    const { selfSelectSymbolList, } = this.props.market
    const ids = selfSelectSymbolList.map(item => item.id)
    this.setState((preState) => ({
      symbolList: res.data.results.filter(item => ids.indexOf(item.id) === -1),
      next: res.data.next,
      page: preState.page + 1,
    }))
  }

  loadMoreSymbol = async () => {
    if (this.state.next) {
      this.getSymbolList({
        symbolTypeName: this.symbolTypeName,
        page: this.state.page + 1,
        pageSize,
      })
    }
  }
  
  confirm = async () => {
    const res = await api.market.addSelfSelectSymbolList({
      symbol: this.state.selectedSymbols,
    })
    await this.props.market.updateSelfSelectSymbolList();
    this.$f7router.back();
  }

  handleItemOpened = (symbolDisplay) => {
    this.setState({
      popupOpened: true,
      currentSymbol: symbolDisplay,
    })
  }

  handleItemClosed = () => {
    this.setState({
      popupOpened: false,
    })
    setTimeout(() => {
      this.setState({
        currentSymbol: null,
      }) 
    });
  }

  handleItemSelected = (id) => {
    this.setState(prevState => ({
      selectedSymbols: [...prevState.selectedSymbols, id],
    }))
  }

  handleItemUnselected = (id) => {
    this.setState(prevState => ({
      selectedSymbols: prevState.selectedSymbols.filter(item => item !== id),
    }))
  }

  render() {
    const { currentSymbol, symbolList, symbolTypeName, selectedSymbols, } = this.state;

    return (
      <Page noToolbar ptr onPtrRefresh={this.loadMore}>
        <Navbar>
          <NavLeft>
            <Link onClick={() => this.$f7router.back()}>
              <Icon color={'white'} f7={'chevron_left'} size={r(18)}></Icon>
            </Link>
          </NavLeft>
          <NavTitle>{symbolTypeName}</NavTitle>
          <NavRight>
            <span onClick={this.confirm}>完成</span>
          </NavRight>
        </Navbar>
        <List>
          {
            symbolList.map(item => {
              return (
                <ListItem title={item.symbol_display.name}>
                  {
                    selectedSymbols.indexOf(item.symbol) === -1 ? (
                      <div onClick={() => this.handleItemSelected(item.symbol)} slot="media" className="circle-add-icon" />
                    ) : (
                      <div onClick={() => this.handleItemUnselected(item.symbol)} slot="media" className="circle-add-selected-icon" />
                    )
                  }
                  <span onClick={() => this.handleItemOpened(item.symbol_display)}>
                    <Icon slot="after" color="#c8c7cc" f7="chevron_right" size={r(18)}></Icon>
                  </span>
                </ListItem>
              )
            })
          }
        </List>
        {
          currentSymbol && (
            <Popup opened={this.state.popupOpened} onPopupClosed={this.handleItemClosed}>
              <Page>
                <Navbar>
                  <NavLeft>
                    <Link popupClose>
                      <Icon color={'white'} f7={'chevron_left'} size={r(18)}></Icon>
                    </Link>
                  </NavLeft>
                  <NavTitle>{currentSymbol.name}</NavTitle>
                </Navbar>
                <Block>
                  <p>{currentSymbol.description}</p>
                </Block>
                <List>
                  <ListItem>{currentSymbol.description}</ListItem>
                  <ListItem title="小数位" after={currentSymbol.decimals_place} />
                  <ListItem title="合约大小" after={currentSymbol.contract_size} />
                  <ListItem title="点差" after={currentSymbol.spread} />
                  <ListItem title="止盈止损位" after={currentSymbol.limit_stop_level} />
                  <ListItem title="预售货币款" after={currentSymbol.margin_currency} />
                  <ListItem title="获利货币" after={currentSymbol.profit_currency} />
                  <ListItem title="最大交易量" after={currentSymbol.max_trading_volume} />
                  <ListItem title="最小交易量" after={currentSymbol.min_trading_volume} />
                  <ListItem title="交易量步长" after={currentSymbol.volume_step} />
                  <ListItem title="价格变动最小单位" after={currentSymbol.min_unit_of_price_change} />
                  <ListItem title="成交模式" after={currentSymbol.transaction_mode} />
                  <ListItem title="买入库存费" after={currentSymbol.purchase_fee} />
                  <ListItem title="卖出库存费" after={currentSymbol.selling_fee} />
                  <ListItem title="三日库存费" after={currentSymbol.three_days_swap} />
                </List>
              </Page>
            </Popup>
          )
        }
      </Page>
    );
  }
}