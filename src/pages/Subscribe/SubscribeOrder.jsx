import api from 'services'
import React from 'react';

import { Modal, Select } from 'antd';
import { Toast } from 'antd-mobile';
import {
    Page, Navbar, List, ListItem, Block,
    NavTitle,
    NavRight,
    NavLeft,
    Icon,
    Link,
    Input
} from 'framework7-react';
import { inject, observer } from "mobx-react";
import './index.scss';
//import 'antd/dist/antd.css';

@inject("market")
export default class extends React.Component {
    state = {

    }
    constructor(props) {
        super(props)
    }

    onLotsChanged = (val) => {
        const { params } = this.state;
        val = Number(val);
        val = Number(this.state.params || 1) + val;
        val = Number(val.toFixed(2));

        this.setState({
            params: val
        });
    };


    onFinancingChange = (value) => {
        const { isFinancingShow } = this.state;
        this.setState({
            isFinancingShow: value == '0' ? 'none' : ''
        });
    }

    orderSubmitConfirm = () => {
        const { confirm } = Modal;
        const that = this;
        confirm({
          title: "提示",
          content: "确定送出吗",
          className: "trade-modal",
          centered: true,
          cancelText: "取消",
          okText: "确认",
          onOk() {
            
          },
          onCancel() {},
        });
      };
    
    render() {
        const { params, isFinancingShow = "none" } = this.state;

        return (
            <Page noToolbar>
                <Navbar>
                    <NavLeft>
                        {/* <Link onClick={() => { this.$f7router.back(); }}>
                            <Icon color={'white'} f7={'chevron_left'} size={r(18)} ></Icon>
                        </Link> */}
                        {/* <span onClick={this.handleConfirm}>完成</span> */}
                    </NavLeft>
                    <NavTitle>泰格医药</NavTitle>
                    <NavRight>
                        <span onClick={() => { this.$f7router.back(); }}>x</span>
                    </NavRight>
                </Navbar>
                <div className="subscribe-order-header">
                    <div className="subscribe-order-detail">
                        <div className="order-item"> <span>申购价 : </span><span className="order-item-price">30.30</span></div>
                        <div className="order-item"> <span>每手股数 : </span><span>400</span></div>
                    </div>
                </div>
                <div className="subscribe-order-content">
                    <div className="order-container-top">
                        <div className="order-input-item">
                            <div className="order-input-item-title">选择手数</div>
                            <div className="order-input-item-btn-group">
                                <div className="order-input-item-less-btn"
                                    onClick={() => { this.onLotsChanged(-1); }}
                                >-</div>
                                <div className="order-input-item-input">
                                    <Input type="number"
                                        min={1}
                                        placeholder={"未设置"}
                                        value={params || 1}
                                    />
                                </div>
                                <div className="order-input-item-add-btn"
                                    onClick={() => { this.onLotsChanged(1) }}
                                >+</div>
                            </div>
                        </div>
                        <div className="order-input-item">
                            <div className="order-input-item-title">手续费</div>
                            <div className="order-input-item-text">10</div>
                        </div>
                        <div className="order-input-item">
                            <div className="order-input-item-title">入场费</div>
                            <div className="order-input-item-text">12250.53</div>
                        </div>
                        <div className="order-input-item">
                            <div className="order-input-item-title">认购金额</div>
                            <div className="order-input-item-text">12260.53</div>
                        </div>
                    </div>
                    <div className="order-container-bottom">
                        <div className="order-input-item">
                            <div className="order-input-item-title">融资比例</div>
                            <Select className="select-option" defaultValue={"0"}
                                onChange={this.onFinancingChange} >
                                <Option value="0"><span>不融资</span></Option>
                                <Option value="1"><span>60%</span></Option>
                            </Select>
                        </div>
                        <div style={{ display: isFinancingShow }} className="order-input-item">
                            <div className="order-input-item-title">融资金额</div>
                            <div className="order-input-item-text">9808.42</div>
                        </div>
                        <div style={{ display: isFinancingShow }} className="order-input-item">
                            <div className="order-input-item-title">融资利息</div>
                            <div className="order-input-item-text">14.1</div>
                        </div>
                        <div className="order-input-item">
                            <div className="order-input-item-title">需本金</div>
                            <div className="order-input-item-text">12250.53</div>
                        </div>
                        <div className="order-input-item">
                            <div className="order-input-item-title">可用资金</div>
                            <div className="order-input-item-text">
                                <div>1000000</div>
                                {/* <div className="msg-error">* 资金不足 无法申请</div> */}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={`subscribe-order-submit-btn`}
                    style={{ marginBottom: '20px' }}
                    onClick={this.orderSubmitConfirm}
                >
                    {"申购"}
                </div>

                <div className="subscribe-order-remarks-container">
                    <div className="order-remarks-item">
                        <div className="order-remarks-item-title">备注说明</div>
                        <div className="order-remarks-item-content">
                            <p> 1.中籤者将接受：</p>
                            <p>「入场费」＋「程序费」＋「孖仔费」</p>
                            <p> 2.未中籤者采取「程序费」＋「孖仔费」</p>
                        </div>
                    </div>
                    <div className="order-remarks-item">
                        <div className="order-remarks-item-title">入场费</div>
                        <div className="order-remarks-item-content">
                            <p>「1.0077%为：</p>
                            <p>1%的经纪佣金+0.0027%証监会征费</p>
                            <p>0.005%联交所交易费」</p>
                        </div>
                    </div>
                    <div className="order-remarks-item">
                        <div className="order-remarks-item-title">利息费</div>
                        <div className="order-remarks-item-content">
                            <p> 融资额*年利率/365*佔用资金天数</p>
                        </div>
                    </div>
                </div>
            </Page>
        );
    }
}