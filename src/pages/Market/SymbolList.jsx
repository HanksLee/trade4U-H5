import api from 'services';
import React from 'react';
import { Page, Navbar, List, ListItem, NavTitle, NavRight, NavLeft, Icon, Link, Searchbar } from 'framework7-react';
import './index.scss';
import { inject, observer } from "mobx-react";

const pageSize = 60

@inject("market")
@observer
export default class extends React.Component {
  constructor(props) {
    super(props)

    this.symbolTypeName = this.$f7route.params.symbol_type_name
    this.state = {
      symbolList: [],
      page: 0,
      next: false,
      selectedSymbols: [],
      isLoading: true,
    }
  }

  componentDidMount() {
    this.getSymbolList({
      type__name: this.symbolTypeName,
      page: 1,
      page_size: pageSize,
    })
  }

  getSymbolList = async (query, init = true) => {
    this.setState({
      isLoading: true,
    })
    const res = await api.market.getSymbolList({ params: query, })
    const { selfSelectSymbolList, } = this.props.market
    const ids = selfSelectSymbolList.map(item => item.symbol_display.id)

    if (init) {
      this.setState((preState) => ({
        symbolList: [...res.data.results.filter(item => {
          return ids.indexOf(item.symbol_display.id) === -1
        })],
        next: !!res.data.next,
        page: 1,
      }))
    } else {
      this.setState((preState) => ({
        symbolList: [...this.state.symbolList, ...res.data.results.filter(item => ids.indexOf(item.id) === -1)],
        next: !!res.data.next,
        page: preState.page + 1,
      }))
    }
    this.setState({
      isLoading: false,
    })
  }

  loadMoreSymbol = async () => {
    if (this.state.next && !this.state.isLoading) {
      this.getSymbolList({
        type__name: this.symbolTypeName,
        page: this.state.page + 1,
        page_size: pageSize,
      }, false)
    }
  }

  confirm = async () => {
    const res = await api.market.addSelfSelectSymbolList({
      symbol: this.state.selectedSymbols,
    })
    await this.props.market.updateSelfSelectSymbolList();
    this.$f7router.back();
  }

  handleItemOpened = (item) => {
    this.$f7router.navigate(`/market/symbol/${item.id}`, {
      context: item,
    })
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

  handleSearch = (e) => {
    this.getSymbolList({
      type__name: this.symbolTypeName,
      search: e.target.value,
      page: 1,
      page_size: pageSize,
    })
  }

  handleClearSearch = () => {
    this.getSymbolList({
      type__name: this.symbolTypeName,
      page: 1,
      page_size: pageSize,
    })
  }

  render() {
    const { symbolList, selectedSymbols, isLoading, } = this.state;

    return (
      <Page noToolbar infinite infiniteDistance={50} onInfinite={this.loadMoreSymbol} infinitePreloader={this.state.next}>
        <Navbar>
          <NavLeft>
            <Link onClick={() => this.$f7router.back()}>
              <Icon color={'white'} f7={'chevron_left'} size={r(18)}></Icon>
            </Link>
          </NavLeft>
          <NavTitle>{this.symbolTypeName}</NavTitle>
          <NavRight>
            <span onClick={this.confirm}>完成</span>
          </NavRight>
        </Navbar>
        <div className="symbol-searchbar">
          <Searchbar
            customSearch={true}
            disableButton={false}
            placeholder="搜索交易产品"
            clearButton={true}
            onChange={this.handleSearch}
            onClickClear={this.handleClearSearch}
          />
        </div>
        <List>
          {
            symbolList.length === 0 && (
              <ListItem title={isLoading ? '加载中...' : '暂无数据'}></ListItem>
            )
          }
          {
            symbolList.map(item => {
              return (
                <ListItem title={item.symbol_display.name}>
                  {
                    selectedSymbols.indexOf(item.id) === -1 ? (
                      <div onClick={() => this.handleItemSelected(item.id)} slot="media" className="circle-add-icon" />
                    ) : (
                        <div onClick={() => this.handleItemUnselected(item.id)} slot="media" className="circle-add-selected-icon" />
                      )
                  }
                  <span onClick={() => this.handleItemOpened(item)}>
                    <Icon slot="after" color="#c8c7cc" f7="chevron_right" size={r(18)}></Icon>
                  </span>
                </ListItem>
              )
            })
          }
        </List>
      </Page>
    );
  }
}