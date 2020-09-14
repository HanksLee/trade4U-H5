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
                    <div> <span>申購價 : </span><span>30.30</span></div>
                </div>
                <div className="subscribe-detail-content">
                    <div className="subscribe-detail-container-new">
                        <div className="subscribe-detail-title-head">新股資訊</div>
                        <div className="subscribe-detail-item">
                            <div className="subscribe-detail-title">品種</div>
                            <div className="subscribe-detail-text">港股</div>
                        </div>
                        <div className="subscribe-detail-item">
                            <div className="subscribe-detail-title">申購代碼</div>
                            <div className="subscribe-detail-text">03347</div>
                        </div>
                        <div className="subscribe-detail-item">
                            <div className="subscribe-detail-title">申購日期</div>
                            <div className="subscribe-detail-text">2020-10-10</div>
                        </div>
                        <div className="subscribe-detail-item">
                            <div className="subscribe-detail-title">截止日期</div>
                            <div className="subscribe-detail-text">2020-10-13</div>
                        </div>
                        <div className="subscribe-detail-item">
                            <div className="subscribe-detail-title">中籤公布日</div>
                            <div className="subscribe-detail-text">2020-10-19</div>
                        </div>
                        <div className="subscribe-detail-item">
                            <div className="subscribe-detail-title">上市日期</div>
                            <div className="subscribe-detail-text">2020-10-31</div>
                        </div>
                        <div className="subscribe-detail-item">
                            <div className="subscribe-detail-title">每手金额</div>
                            <div className="subscribe-detail-text">121200</div>
                        </div>
                        <div className="subscribe-detail-item">
                            <div className="subscribe-detail-title">每手股数</div>
                            <div className="subscribe-detail-text">1000</div>
                        </div>
                        <div className="subscribe-detail-item">
                            <div className="subscribe-detail-title">幣種</div>
                            <div className="subscribe-detail-text">HKD</div>
                        </div>
                    </div>
                    <div className="subscribe-detail-container-done">
                        <div className="subscribe-detail-title-head">已申购资讯</div>
                        <div className="subscribe-detail-item">
                            <div className="subscribe-detail-title">申购手数</div>
                            <div className="subscribe-detail-text">2</div>
                        </div>
                        <div className="subscribe-detail-item">
                            <div className="subscribe-detail-title">手续费</div>
                            <div className="subscribe-detail-text">20</div>
                        </div>
                        <div className="subscribe-detail-item">
                            <div className="subscribe-detail-title">入场费</div>
                            <div className="subscribe-detail-text">24501.06</div>
                        </div>
                        <div className="subscribe-detail-item">
                            <div className="subscribe-detail-title">认购金额</div>
                            <div className="subscribe-detail-text">24521.06</div>
                        </div>
                        <div className="subscribe-detail-item">  
                            <div className="subscribe-detail-title">融资比例</div>
                            <div className="subscribe-detail-text">60%</div>
                        </div>
                        <div className="subscribe-detail-item">
                            <div className="subscribe-detail-title">融资金额</div>
                            <div className="subscribe-detail-text">14712.64</div>
                        </div>
                        <div className="subscribe-detail-item">
                            <div className="subscribe-detail-title">融资利息</div>
                            <div className="subscribe-detail-text">14.1</div>
                        </div>
                        <div className="subscribe-detail-item">
                            <div className="subscribe-detail-title">利息费</div>
                            <div className="subscribe-detail-text">14.1</div>
                        </div>
                    </div>
                </div>
            </Page>
        );
    }
}