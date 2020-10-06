import api from "services";
import React from "react";
import { toJS } from "mobx";
import { Modal, Select } from "antd";
import { Toast } from "antd-mobile";
import { CURRENCY_TYPE } from "constant";
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

const loan_options_display = {
  0: "不融资",
  10: "10%",
  20: "20%",
  30: "30%",
  40: "40%",
  50: "50%",
  60: "60%",
  70: "70%",
  80: "80%",
  90: "90%",
};
@inject("subscribe", "setting", "common")
@observer
export default class extends React.Component {
  state = {
    lots: 1, // 申购手数
    loanRatio: 0, // 融资比例
    data: {},
  };
  componentDidMount() {
    const profitRule = this.props.common.profitRule;
    // console.log("profitRule :>> ", toJS(profitRule));
    const id = this.props.$f7route.params.id;
    const didUserSubscribe = this.props.subscribe.userSubscribeMap[Number(id)]
      ? true
      : false;
    if (didUserSubscribe) this.$f7router.back(); // 如果已申购直接挡掉

    const detail = this.props.subscribe.newStockMap[Number(id)];
    const data = this.mapApiDataToDisplayValue(detail);
    // console.log("data :>> ", data);
    this.setState({ data });
  }
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
    payload["public_date"] = public_date
      ? moment(public_date).format("YYYY-MM-DD")
      : "尚未公布";
    payload["subscription_date_start"] =
      subscription_date_start &&
      moment(subscription_date_start).format("YYYY-MM-DD");
    payload["subscription_date_end"] =
      subscription_date_end &&
      moment(subscription_date_end).format("YYYY-MM-DD");

    payload["draw_result_date"] = moment(draw_result_date).format("YYYY-MM-DD");

    payload["amount_per_lot"] = (
      Number(lots_size) * Number(maxPublicPrice)
    ).toFixed(2);
    return payload;
  };
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
  handleLoanRatioChange = (val) => {
    this.setState({ loanRatio: Number(val) });
  };
  handleSubmit = async () => {
    const {
      loan,
      entranceFee,
      withdrawableBalance,
      requiredBalance,
    } = this.calculateOrder();
    const { userAuthentication } = this.props.setting;
    const { toggleGuideModalVisible, setThisRouter, configMap } = this.props.common;
    const userAuth = configMap["user_authentication"];

    //如果沒有認證或沒入金會出現提示框
    if ((userAuth === 'withdraw_authentication' && userAuthentication === 0) ||
      (userAuth !== 'withdraw_authentication' && userAuthentication !== 3)) {
      await setThisRouter(this.$f7router)
      toggleGuideModalVisible()
      return;
    }

    // console.log("order :>> ", this.calculateOrder());
    // * 判断可用资金 > 认购金额 + 手续费 + 融资利息费
    if (Number(withdrawableBalance) < Number(requiredBalance)) {
      Modal.confirm({
        title: "提示",
        content: "可用资金不足",
        className: "app-modal",
        centered: true,
        cancelText: "取消",
        okText: "确认",
      });
      return;
    }

    const { lots } = this.state;
    const { id } = this.state.data;
    const payload = {
      new_stock: id,
      entrance_fee: entranceFee,
      wanted_lots: lots,
      loan,
    };
    // console.log("payload :>> ", payload);
    Modal.confirm({
      title: "提示",
      content: "确认送出申请 ?",
      className: "app-modal",
      centered: true,
      cancelText: "取消",
      okText: "确认",
      onOk: async () => {
        const res = await api.subscribe.createSubscribeOrder(payload);
        // console.log("res :>> ", res);
        if (res.status >= 200 && res.status <= 299) {
          this.$f7router.back();
        } else {
          Modal.confirm({
            title: "提示",
            className: "app-modal",
            content: "下单失败",
            centered: true,
            okText: "确认",
            cancelText: "取消",
          });
        }
      },
    });
  };
  calculateOrder = () => {
    // 回传值皆为 2位小数字串
    const profitRule = this.props.common.profitRule;

    const {
      amount_per_lot,
      interest_mul_days,
      new_stock_hand_fee,
      tax_rate = "0.010077",
    } = this.state.data;
    const { lots, loanRatio } = this.state;
    // totalAmount 认购金额 = lots 认购手数 * 每手金额 * (1 + tax_rate) 税率
    // loan 融资金额 = totalAmount 认购金额 * 融资比例
    // entranceFee 入场费 = totalAmount 认购金额 - loan 融资金额
    const totalAmount = (
      Number(lots) *
      Number(amount_per_lot) *
      (1 + Number(tax_rate))
    ).toFixed(2);
    const loan = (Number(totalAmount) * Number(loanRatio)).toFixed(2);
    const entranceFee = (Number(totalAmount) - Number(loan)).toFixed(2);
    const handFeeFormula = profitRule["new_stock_hands_fee"];
    const loanInterestFormula = profitRule["new_stock_interest"];
    const loanInterest = math
      .evaluate(loanInterestFormula, {
        loan: Number(loan),
        interest_mul_days: Number(interest_mul_days),
      })
      .toFixed(2); // 融资利息费
    const handFee = math
      .evaluate(handFeeFormula, {
        hand_fee_base: Number(new_stock_hand_fee),
        wanted_lots: Number(lots),
      })
      .toFixed(2); // 手续费
    const requiredBalance = (
      Number(entranceFee) +
      Number(loanInterest) +
      Number(handFee)
    ).toFixed(2);
    const withdrawableBalance = this.props.setting.withdrawableBalance;
    return {
      totalAmount,
      loan,
      entranceFee,
      loanInterest,
      handFee,
      requiredBalance,
      withdrawableBalance,
    };
  };
  renderCurrencyType = (currency) => {
    return <div className="order-input-item-text">（ {currency} ）</div>;
  };
  render() {
    const { loan_options, platform_currency } = this.props.common.configMap;
    const loanOptions = loan_options?.split(",") ?? [0];
    const platformCurrency =
      CURRENCY_TYPE[platform_currency] &&
      CURRENCY_TYPE[platform_currency]["zh-cn"];
    const { stock_name, public_price, lots_size, currency } = this.state.data;
    const { lots, loanRatio } = this.state;
    const {
      totalAmount,
      loan,
      entranceFee,
      loanInterest,
      handFee,
      requiredBalance,
      withdrawableBalance,
    } = this.calculateOrder();

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
              <div className="order-input-item-text">{handFee}</div>
              {this.renderCurrencyType(currency)}
            </div>

            <div className="order-input-item">
              <div className="order-input-item-title">认购金额</div>
              <div className="order-input-item-text">{totalAmount}</div>
              {this.renderCurrencyType(currency)}
            </div>
          </div>
          <div className="order-container-bottom">
            <div className="order-input-item">
              <div className="order-input-item-title">融资比例</div>
              <Select
                className="select-option"
                optionLabelProp={"label"}
                onChange={this.handleLoanRatioChange}
                value={loanRatio}
              >
                {loanOptions.map((each) => {
                  const displayValue = loan_options_display[each];
                  return (
                    <Select.Option
                      key={each}
                      value={Number(each) / 100}
                      label={displayValue}
                    >
                      {displayValue}
                    </Select.Option>
                  );
                })}
              </Select>
            </div>
            <div className="order-input-item">
              <div className="order-input-item-title">融资金额</div>
              <div className="order-input-item-text">{loan}</div>
              {this.renderCurrencyType(currency)}
            </div>
            <div className="order-input-item">
              <div className="order-input-item-title">融资利息</div>
              <div className="order-input-item-text">{loanInterest}</div>
              {this.renderCurrencyType(currency)}
            </div>
            <div className="order-input-item">
              <div className="order-input-item-title">入场费</div>
              <div className="order-input-item-text">{entranceFee}</div>
              {this.renderCurrencyType(currency)}
            </div>
          </div>
          <div className="order-container-bottom">
            <div className="order-input-item">
              <div className="order-input-item-title">所需本金</div>
              <div className="order-input-item-text">{requiredBalance}</div>
              {this.renderCurrencyType(currency)}
            </div>
            <div className="order-input-item">
              <div className="order-input-item-title">可用资金</div>
              <div className="order-input-item-text">{withdrawableBalance}</div>
              {this.renderCurrencyType(platformCurrency)}
            </div>
          </div>
        </div>
        <SubscribeRule />
        <div
          className={`subscribe-order-submit-btn`}
          style={{ marginBottom: "20px" }}
          onClick={this.handleSubmit}
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
        <div className="order-remarks-item-title">认购金额</div>
        <div className="order-remarks-item-content">
          <p>认购金额为： 申购手数 * 每手股数 * 申购价格 * (1 + 1.0077%)</p>
          <p>
            1.0077% 为 「 1% 的经纪佣金 + 0.0027% 証监会征费 + 0.005%
            联交所交易费 」
          </p>
        </div>
      </div>
      <div className="order-remarks-item">
        <div className="order-remarks-item-title">融资利息</div>
        <div className="order-remarks-item-content">
          <p> 融资额 * 年利率 / 365 * 佔用资金天数</p>
        </div>
      </div>
    </div>
  );
}
