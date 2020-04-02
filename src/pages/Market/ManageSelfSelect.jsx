import React from 'react';
import {
  Page, Navbar, List, ListItem, Block,
  NavTitle,
  NavRight,
  NavLeft,
  Icon,
  Link,
} from 'framework7-react';
import { inject, observer } from "mobx-react";
import './index.scss';

@inject("market")
export default class extends React.Component {
  constructor(props) {
    super(props)
  
    this.state = {
      selfSelectSymbolList: this.props.market.selfSelectSymbolList,
      checkedItems: [],
    }
  }

  handleDelete = async () => {
    await api.market.deleteSelfSelectSymbolList({
      symbol: this.state.checkedItems,
    })
    await this.props.market.getSelfSelectSymbolList();
    this.$f7router.back();
  }
  
  handleConfirm = async () => {
    await this.props.market.getSelfSelectSymbolList();
    this.$f7router.back();
  }

  handleCheck = (item) => {
    const { checkedItems } = this.state;
    if (checkedItems.indexOf(item.symbol) !== -1) {
      this.setState(preState => ({
        checkedItems: preState.checkedItems.filter(i => i !== item.symbol),
      }))
    } else {
      this.setState(preState => ({
        checkedItems: [...preState.checkedItems, item.symbol]
      }))
    }
  }

  handleSort = ({from, to}) => {
    const sortedSelfSelectSymbolList = [...this.state.selfSelectSymbolList]
    const temp = sortedSelfSelectSymbolList[from]
    sortedSelfSelectSymbolList[from] = sortedSelfSelectSymbolList[to]
    sortedSelfSelectSymbolList[to] = temp
    this.setState({
      selfSelectSymbolList: sortedSelfSelectSymbolList,
    })
  }

  render() {
    const { selfSelectSymbolList, checkedItems } = this.state;

    return (
      <Page noToolbar>
        <Navbar>
          <NavLeft>
            <span onClick={this.handleConfirm}>完成</span>
          </NavLeft>
          <NavRight>
            <span onClick={this.handleDelete}>删除</span>
          </NavRight>
        </Navbar>
        <List sortable className="sortable-enabled" onSortableSort={this.handleSort}>
          {
            selfSelectSymbolList.map(item => {
              return (
                <ListItem
                  key={item.symbol}
                  checkbox
                  title={item.name}
                  className="self-select-list-item"
                  checked={checkedItems.indexOf(item.symbol) !== -1}
                  onChange={() => this.handleCheck(item)}
                  value={item.symbol}
                >
                </ListItem>
              )
            })
          }
        </List>
      </Page>
    );
  }
}