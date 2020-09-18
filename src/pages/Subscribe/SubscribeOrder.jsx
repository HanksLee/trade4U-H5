import api from "services";
import React from "react";
import { toJS } from "mobx";
import { Modal, Select } from "antd";
import { Toast } from "antd-mobile";
import { MARKET_TYPE } from "constant";
import moment from "moment";
import utils from "utils";
import * as math from "mathjs";
import {
  Page,
  Navbar,
  List,
  ListItem,
  Block,
  NavTitle,
  NavRight,
  NavLeft,
  Icon,
  Link,
  Input,
} from "framework7-react";
import { inject, observer } from "mobx-react";
import "./index.scss";
//import 'antd/dist/antd.css';

@inject("market", "subscribe")
export default class extends React.Component {
  state = {
    lots: 1, // 申购手数
    marginRatio: 0, // 融资比率 0 or 0.6
  };
  constructor(props) {
    super(props);
  }
  handleLotsChange = (e) => {
    const val = Number(e.target.value);
    this.setState({ lots: val });
  };
  incrementLots = () => {
    this.setState({ lots: this.state.lots + 1 });
  };
  decrementLots = () => {
    if (this.state.lots <= 0) return;
    this.setState({ lots: this.state.lots - 1 });
  };
  handleMarginRatioChange = (val) => {
    this.setState({ marginRatio: Number(val) });
  };
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
      onOk() {},
      onCancel() {},
    });
  };
  mapApiDataToDisplayValue = (input) => {
    // 转换 api 资料为要展示的格式
    const payload = { ...input };
    const {
      market,
      subscription_date_start,
      subscription_date_end,
      draw_result_date,
      public_date,
      public_price,
      lots_size,
    } = payload;
    const [minPublicPrice, maxPublicPrice] = utils.parseRange(public_price);
    payload["subscription_date_start"] = moment(subscription_date_start).format(
      "YYYY-MM-DD"
    );
    payload["subscription_date_end"] = moment(subscription_date_end).format(
      "YYYY-MM-DD"
    );
    payload["market_name"] = MARKET_TYPE[market]["name"];
    payload["draw_result_date"] = moment(draw_result_date).format("YYYY-MM-DD");
    payload["public_date"] = moment(public_date).format("YYYY-MM-DD");
    payload["amount_per_lot"] = (
      Number(lots_size) * Number(maxPublicPrice)
    ).toFixed(2);
    return payload;
  };
  handleSubmit = () => {
    // TODO: 判断可用资金 > 认购金额 + 手续费 + 融资利息费
  };
  render() {
    const { lots, marginRatio } = this.state;
    const id = this.props.$f7route.params.id;
    const detail = this.props.subscribe.getNewStockDetail(id);
    // console.log("detail :>> ", toJS(this.mapApiDataToDisplayValue(detail)));
    const {
      stock_name,
      public_price,
      lots_size,
      amount_per_lot,
    } = this.mapApiDataToDisplayValue(detail);

    // amount 认购金额 = lots 认购手数 * 每手金额
    // marginFee 融资金额 = amount 认购金额 * 融资比例
    // entranceFee 入场费 = amount 认购金额 - marginFee 融资金额
    const amount = (Number(lots) * Number(amount_per_lot)).toFixed(2);
    const marginFee = (Number(amount) * Number(marginRatio)).toFixed(2);
    const entranceFee = (amount - marginFee).toFixed(2);

    const marginInterest = (Number(marginFee) * Number(0.0)).toFixed(2); // 融资利息费
    const handlingFee = Number(0.0).toFixed(2); // 手续费
    const requiredFund = (
      Number(entranceFee) +
      Number(marginInterest) +
      Number(handlingFee)
    ).toFixed(2);
    const availableFund = 888888888;
    return (
      <Page noToolbar>
        <Navbar>
          <NavLeft>
            <div onClick={() => this.$f7router.back()}>
              <Icon color={"white"} f7={"chevron_left"} size={r(18)}></Icon>
            </div>
          </NavLeft>
          <NavTitle>{stock_name}</NavTitle>
          <NavRight></NavRight>
        </Navbar>
        <div className="subscribe-order-header">
          <div className="subscribe-order-detail">
            <div className="order-item">
              <span>申购价：</span>
              <span className="order-item-price">{public_price}</span>
            </div>
            <div className="order-item">
              <span>每手股数：</span>
              <span>{lots_size}</span>
            </div>
          </div>
        </div>
        <div className="subscribe-order-content">
          <div className="order-container-top">
            <div className="order-input-item">
              <div className="order-input-item-title">选择手数</div>
              <div className="order-input-item-btn-group">
                <div
                  className="order-input-item-less-btn"
                  onClick={this.decrementLots}
                >
                  -
                </div>
                <div className="order-input-item-input">
                  <Input
                    type="number"
                    min={0}
                    value={lots}
                    onChange={this.handleLotsChange}
                  />
                </div>
                <div
                  className="order-input-item-add-btn"
                  onClick={this.incrementLots}
                >
                  +
                </div>
              </div>
            </div>
            <div className="order-input-item">
              <div className="order-input-item-title">手续费</div>
              <div className="order-input-item-text">{handlingFee}</div>
            </div>
            <div className="order-input-item">
              <div className="order-input-item-title">入场费</div>
              <div className="order-input-item-text">{entranceFee}</div>
            </div>
            <div className="order-input-item">
              <div className="order-input-item-title">认购金额</div>
              <div className="order-input-item-text">{amount}</div>
            </div>
          </div>
          <div className="order-container-bottom">
            <div className="order-input-item">
              <div className="order-input-item-title">融资比例</div>
              <Select
                className="select-option"
                defaultValue={0}
                onChange={this.handleMarginRatioChange}
              >
                <Select.Option value={0}>
                  <span>不融资</span>
                </Select.Option>
                <Select.Option value={0.6}>
                  <span>60%</span>
                </Select.Option>
              </Select>
            </div>
            <div className="order-input-item">
              <div className="order-input-item-title">融资金额</div>
              <div className="order-input-item-text">{marginFee}</div>
            </div>
            <div className="order-input-item">
              <div className="order-input-item-title">融资利息</div>
              <div className="order-input-item-text">{marginInterest}</div>
            </div>
            <div className="order-input-item">
              <div className="order-input-item-title">需本金</div>
              <div className="order-input-item-text">{requiredFund}</div>
            </div>
            <div className="order-input-item">
              <div className="order-input-item-title">可用资金</div>
              <div className="order-input-item-text">{availableFund}</div>
            </div>
          </div>
        </div>

        <div
          className={`subscribe-order-submit-btn`}
          style={{ marginBottom: "20px" }}
          onClick={this.orderSubmitConfirm}
        >
          {"申购"}
        </div>
      </Page>
    );
  }
}

function SubscribeRule(props) {
  return (
    <div className="subscribe-order-remarks-container">
      <div className="order-remarks-item">
        <div className="order-remarks-item-title">备注说明</div>
        <div className="order-remarks-item-content">
          <li> 1. 中签者将收取： 入场费 + 程序费 + 孖仔费 </li>
          <li> 2. 未中签者将收取： 程序费 + 孖仔费</li>
        </div>
      </div>
      <div className="order-remarks-item">
        <div className="order-remarks-item-title">入场费</div>
        <div className="order-remarks-item-content">
          <p>
            1.0077% 为 「 1% 的经纪佣金 + 0.0027% 証监会征费 + 0.005%
            联交所交易费 」
          </p>
        </div>
      </div>
      <div className="order-remarks-item">
        <div className="order-remarks-item-title">孖仔费</div>
        <div className="order-remarks-item-content">
          <p> 融资额 * 年利率 / 365 * 佔用资金天数</p>
        </div>
      </div>
    </div>
  );
}
