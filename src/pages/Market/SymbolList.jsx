import api from 'services';
import React from 'react';
import { Page, Navbar, List, ListItem, NavTitle, NavRight, NavLeft, Icon, Link } from 'framework7-react';
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

  handleItemOpened = (item) => {
    this.$f7router.navigate(`/market/symbol/${item.id}`)
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