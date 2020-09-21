import api from "services";
import React from "react";
import { toJS } from "mobx";
import { Modal } from "antd";
import { Toast } from "antd-mobile";
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
} from "framework7-react";
import { inject, observer } from "mobx-react";
import "./index.scss";
import { MARKET_TYPE } from "constant";
import moment from "moment";
import utils from "utils";
import * as math from "mathjs";

@inject("subscribe")
@observer
export default class DetailPage extends React.Component {
  state = {};
  constructor(props) {
    super(props);
  }

  render() {
    const { id } = this.$f7route.params;
    const detail = this.props.subscribe.newStockMap[Number(id)];
    const userSubscribeMap = this.props.subscribe.userSubscribeMap;
    // console.log("newStockMap :>> ", toJS(newStockMap));
    // console.log("userSubscribeMap :>> ", toJS(userSubscribeMap));
    const didUserSubscribe = userSubscribeMap[id] ? true : false; // 使用者是否已申购
    const { isExpired, isNotStarted } = detail;
    const orderInfo = userSubscribeMap[id]; // 申购资讯
    return (
      <Page noToolbar>
        <Navbar className="subscribe-detail-navbar">
          <NavLeft>
            <Link onClick={() => this.$f7router.back()}>
              <Icon color={"white"} f7={"chevron_left"} size={r(18)}></Icon>
            </Link>
          </NavLeft>
          <NavTitle>申购详情</NavTitle>
          <NavRight></NavRight>
        </Navbar>
        <SubscribeDetail data={detail} />
        {didUserSubscribe && <SubscribeOrderInfo data={orderInfo} />}
        {!didUserSubscribe && !isExpired && !isNotStarted && (
          <div
            className={`subscribe-detail-submit-btn`}
            style={{ marginBottom: "20px" }}
            onClick={() => this.$f7router.navigate(`/subscribe/order/${id}`)}
          >
            申购
          </div>
        )}
      </Page>
    );
  }
}

// 申购股票资讯
class SubscribeDetail extends React.Component {
  state = {};
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
  render() {
    const {
      stock_name,
      public_price,
      market_name,
      stock_code,
      subscription_date_start,
      subscription_date_end,
      draw_result_date,
      public_date,
      lots_size,
      currency,
      amount_per_lot,
    } = this.mapApiDataToDisplayValue(this.props.data);

    return (
      <React.Fragment>
        <div className="subscribe-detail-header">
          <span>{stock_name}</span>
          <div>
            <span>申购价：</span>
            <span>{public_price}</span>
          </div>
        </div>
        <div className="subscribe-detail-content">
          <div className="subscribe-detail-item">
            <div className="subscribe-detail-title">品种</div>
            <div className="subscribe-detail-text">{market_name}</div>
          </div>
          <div className="subscribe-detail-item">
            <div className="subscribe-detail-title">申购代码</div>
            <div className="subscribe-detail-text">{stock_code}</div>
          </div>
          <div className="subscribe-detail-item">
            <div className="subscribe-detail-title">起始日</div>
            <div className="subscribe-detail-text">
              {subscription_date_start}
            </div>
          </div>
          <div className="subscribe-detail-item">
            <div className="subscribe-detail-title">截止日</div>
            <div className="subscribe-detail-text">{subscription_date_end}</div>
          </div>
          <div className="subscribe-detail-item">
            <div className="subscribe-detail-title">中签公布日</div>
            <div className="subscribe-detail-text">{draw_result_date}</div>
          </div>
          <div className="subscribe-detail-item">
            <div className="subscribe-detail-title">上市日</div>
            <div className="subscribe-detail-text">{public_date}</div>
          </div>
          <div className="subscribe-detail-item">
            <div className="subscribe-detail-title">每手金额</div>
            <div className="subscribe-detail-text">{amount_per_lot}</div>
          </div>
          <div className="subscribe-detail-item">
            <div className="subscribe-detail-title">每手股数</div>
            <div className="subscribe-detail-text">{lots_size}</div>
          </div>
          <div className="subscribe-detail-item">
            <div className="subscribe-detail-title">币种</div>
            <div className="subscribe-detail-text">{currency}</div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

// 使用者已申购的资讯
class SubscribeOrderInfo extends React.Component {
  state = {};
  mapApiDataToDisplayValue = (raw) => {
    const payload = { ...raw };
    return payload;
  };

  render() {
    const { wanted_lots, entrance_fee, loan } = this.mapApiDataToDisplayValue(
      this.props.data
    );
    return (
      <React.Fragment>
        <div className="subscribe-detail-header">
          <span>已申购资讯</span>
        </div>
        <div className="subscribe-detail-content">
          <div className="subscribe-detail-container-done">
            <div className="subscribe-detail-item">
              <div className="subscribe-detail-title">申购手数</div>
              <div className="subscribe-detail-text">{wanted_lots}</div>
            </div>
            <div className="subscribe-detail-item">
              <div className="subscribe-detail-title">手续费</div>
              <div className="subscribe-detail-text">{"-"}</div>
            </div>
            <div className="subscribe-detail-item">
              <div className="subscribe-detail-title">入场费</div>
              <div className="subscribe-detail-text">{entrance_fee}</div>
            </div>
            <div className="subscribe-detail-item">
              <div className="subscribe-detail-title">认购金额</div>
              <div className="subscribe-detail-text">{"-"}</div>
            </div>
            <div className="subscribe-detail-item">
              <div className="subscribe-detail-title">融资比例</div>
              <div className="subscribe-detail-text">{"-%"}</div>
            </div>
            <div className="subscribe-detail-item">
              <div className="subscribe-detail-title">融资金额</div>
              <div className="subscribe-detail-text">{loan}</div>
            </div>
            <div className="subscribe-detail-item">
              <div className="subscribe-detail-title">融资利息率</div>
              <div className="subscribe-detail-text">{"-%"}</div>
            </div>
            <div className="subscribe-detail-item">
              <div className="subscribe-detail-title">利息费</div>
              <div className="subscribe-detail-text">{"-"}</div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
