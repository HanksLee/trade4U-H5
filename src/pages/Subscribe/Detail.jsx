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

@inject("market")
export default class extends React.Component {
  state = {

  }
  constructor(props) {
    super(props)
  }

  render() {
    const { selfSelectSymbolList, checkedItems } = this.state;

    return (
      <Page noToolbar>
        <Navbar>
          <NavLeft>
            <Link onClick={() => { this.$f7router.back(); }}>
              <Icon color={'white'} f7={'chevron_left'} size={r(18)} ></Icon>
            </Link>
            {/* <span onClick={this.handleConfirm}>完成</span> */}
          </NavLeft>
          <NavTitle>申购详情</NavTitle>
          <NavRight>
            {/* <span onClick={this.showDeleteModal}>删除</span> */}
          </NavRight>
        </Navbar>
        <div className="subscribe-detail-header">
          <span>泰格医药0857</span>
          <span>30.30</span>
        </div>
        <div className="subscribe-detail-content">
          <div>
            <span>申购日期</span>
            <span>2020-12-31</span>
          </div>
          <div>
            <span>截止日期</span>
            <span>2020-12-31</span>
          </div>
          <div>
            <span>上市日期</span>
            <span>2020-12-31</span>
          </div>
          <div>
            <span>每手金额</span>
            <span>2662.00</span>
          </div>
          <div>
            <span>每手股数</span>
            <span>1000</span>
          </div>
          <div>
            <span>发行总数(万股)</span>
            <span>13333.44</span>
          </div>
          <div>
            <span>香港发行(万股)</span>
            <span>5000</span>
          </div>
          <div>
            <span>国际发行(万股)</span>
            <span>13333.44</span>
          </div>
        </div>
        <div className={`subscribe-detail-submit-btn`}
          style={{ marginBottom: '20px' }}
        // onClick={this.onSubmit}
        >
          {"申购"}
        </div>
      </Page>
    );
  }
}