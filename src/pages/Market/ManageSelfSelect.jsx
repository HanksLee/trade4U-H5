import api from 'services'
import React from 'react';
import { Modal } from 'antd';
import { Toast } from 'antd-mobile';
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
import utils from '../../utils';

@inject("market")
export default class extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      selfSelectSymbolList: this.props.market.selfSelectSymbolList,
      checkedItems: [],
    }
  }

  showDeleteModal = () => {
    const { confirm } = Modal;
    const that = this;
    confirm({
      title: '提示',
      content: '您確定要删除嗎',
      className: "trade-modal",
      centered: true,
      cancelText: "取消",
      okText: "确认",
      onOk() {
        that.handleDelete();
        Toast.success("删除成功", 2);
      },
      onCancel() {
      },
    });
  }

  handleDelete = async () => {
    await api.market.deleteSelfSelectSymbolList({
      data: {
        symbol: this.state.checkedItems,
      },
    })
    await this.handSort();
  }

  handSort = async () => {
    await api.market.sortSelfSelectSymbolList({
      symbol: this.state.selfSelectSymbolList.map(item => item.symbol),
    })
    let queryString = `page=${1}&page_size=${20}`;
    await this.props.market.updateSelfSelectSymbolList(queryString);
    this.setState((preState) => ({
      selfSelectSymbolList: preState.selfSelectSymbolList.filter(item => {
        return preState.checkedItems.indexOf(item.symbol) === -1
      })
    }))
  }

  handleConfirm = async () => {
    // await api.market.sortSelfSelectSymbolList({
    //   symbol: this.state.selfSelectSymbolList.map(item => item.symbol),
    // })
    // let queryString = `page=${1}&page_size=${20}`;
    // await this.props.market.updateSelfSelectSymbolList(queryString);
    await this.handSort();
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

  sortSelfSelectList = ({ from, to }) => {
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
            <Link onClick={this.handleConfirm}>
              <Icon color={'white'} f7={'chevron_left'} size={r(18)} ></Icon>
            </Link>
            {/* <span onClick={this.handleConfirm}>完成</span> */}
          </NavLeft>
          <NavRight>
            {!utils.isEmpty(checkedItems) && <span onClick={this.showDeleteModal}>删除</span>}
          </NavRight>
        </Navbar>
        <List sortable className="sortable-self-select-list sortable-enabled" onSortableSort={this.sortSelfSelectList}>
          {
            selfSelectSymbolList.map(item => {
              return (
                <ListItem
                  key={item.symbol}
                  checkbox
                  title={item.symbol_display.name}
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