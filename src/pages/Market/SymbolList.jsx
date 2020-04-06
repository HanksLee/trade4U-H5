import api from 'services';
import React from 'react';
import { Page, Navbar, List, ListItem, NavTitle, NavRight, NavLeft, Icon, Link } from 'framework7-react';
import './index.scss';
import { inject, observer } from "mobx-react";

const pageSize = 20

@inject("market")
@observer
export default class extends React.Component {
  constructor(props) {
    super(props)

    this.symbolTypeName = this.$f7route.params.symbol_type_name
    this.isLoading = false
    this.state = {
      symbolTypeName: '',
      symbolList: [],
      page: 0,
      next: null,
      selectedSymbols: [],
    }
  }
  
  componentDidMount() {
    this.getSymbolList({
      type__name: this.symbolTypeName,
      page: 1,
      pageSize,
    })
  }

  getSymbolList = async (query) => {
    const res = await api.market.getSymbolList({ params: query, })
    const { selfSelectSymbolList, } = this.props.market
    const ids = selfSelectSymbolList.map(item => item.id)
    this.setState((preState) => ({
      type__name: [...this.state.symbolList, ...res.data.results.filter(item => ids.indexOf(item.id) === -1)],
      next: res.data.next,
      page: preState.page + 1,
    }))
    this.isLoading = false
  }

  loadMoreSymbol = async () => {
    if (this.state.next && !this.isLoading) {
      this.isLoading = true
      this.getSymbolList({
        type__name: this.symbolTypeName,
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

  render() {
    const { symbolList, symbolTypeName, selectedSymbols, } = this.state;

    return (
      <Page noToolbar infinite infiniteDistance={50} onInfinite={this.loadMoreSymbol} infinitePreloader={this.state.next}>
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