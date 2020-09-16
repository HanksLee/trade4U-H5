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
@inject("subscribe")
@observer
export default class DetailPage extends React.Component {
  state = {};
  constructor(props) {
    super(props);
  }
  // componentDidMount() {
  //   this.setSubscribeDetailContentHeight();
  // }

  // setSubscribeDetailContentHeight = () => {
  //   // page
  //   const pageHeight = document.getElementById("view-subscribe").clientHeight;
  //   const subscribeDetailNavbarHeight = document.getElementsByClassName(
  //     "subscribe-detail-navbar"
  //   )[0].clientHeight;
  //   const subscribeDetailHeaderHeight = document.getElementsByClassName(
  //     "subscribe-detail-header"
  //   )[0].clientHeight;
  //   const subscribeDetailContentHeight =
  //     pageHeight - subscribeDetailNavbarHeight - subscribeDetailHeaderHeight;

  //   document.getElementsByClassName(
  //     "subscribe-detail-content"
  //   )[0].style.height = `${subscribeDetailContentHeight}px`;
  // };
  mapApiDataToDisplayValue = (input) => {
    // 转换 api 资料为要展示的格式
    const payload = { ...input };
    const {
      market,
      subscription_date_start,
      subscription_date_end,
      draw_result_date,
      public_date,
    } = payload;
    payload["subscription_date_start"] = moment(subscription_date_start).format(
      "YYYY-MM-DD"
    );
    payload["subscription_date_end"] = moment(subscription_date_end).format(
      "YYYY-MM-DD"
    );
    payload["market_name"] = MARKET_TYPE[market]["name"];
    payload["draw_result_date"] = moment(draw_result_date).format("YYYY-MM-DD");
    payload["public_date"] = moment(public_date).format("YYYY-MM-DD");
    return payload;
  };
  render() {
    const { id } = this.$f7route.params;
    const detail = this.props.subscribe.getNewStockDetail(id);
    const subscribeDetail = this.mapApiDataToDisplayValue(detail);
    const isUserDidSubscribe = true; // 使用者是否已申购
    return (
      <Page noToolbar>
        <Navbar className="subscribe-detail-navbar">
          <NavLeft>
            <Link onClick={() => this.$f7router.back()}>
              <Icon color={"white"} f7={"chevron_left"} size={r(18)}></Icon>
            </Link>
            {/* <span onClick={this.handleConfirm}>完成</span> */}
          </NavLeft>
          <NavTitle>申购详情</NavTitle>
          <NavRight>
            {/* <span onClick={this.showDeleteModal}>删除</span> */}
          </NavRight>
        </Navbar>
        <SubscribeDetail data={subscribeDetail} />
        {isUserDidSubscribe && <SubscribeOrderInfo data={null} />}
        {!isUserDidSubscribe && (
          <div
            className={`subscribe-detail-submit-btn`}
            style={{ marginBottom: "20px" }}
            // onClick={this.onSubmit}
            onClick={() => {
              this.$f7router.navigate(`/subscribe/subscribeorder`);
            }}
          >
            申购
          </div>
        )}
      </Page>
    );
  }
}

// 申购股票资讯
function SubscribeDetail(props) {
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
  } = props.data;
  return (
    <React.Fragment>
      <div className="subscribe-detail-header">
        <span>{stock_name}</span>
        <div>
          <span>申購價 : </span>
          <span>{public_price}</span>
        </div>
      </div>
      <div className="subscribe-detail-content">
        <div className="subscribe-detail-item">
          <div className="subscribe-detail-title">品種</div>
          <div className="subscribe-detail-text">
            {market_name}
            {/* market */}
          </div>
        </div>
        <div className="subscribe-detail-item">
          <div className="subscribe-detail-title">申購代碼</div>
          <div className="subscribe-detail-text">{stock_code}</div>
        </div>
        <div className="subscribe-detail-item">
          <div className="subscribe-detail-title">起始日期</div>
          <div className="subscribe-detail-text">{subscription_date_start}</div>
        </div>
        <div className="subscribe-detail-item">
          <div className="subscribe-detail-title">截止日期</div>
          <div className="subscribe-detail-text">{subscription_date_end}</div>
        </div>
        <div className="subscribe-detail-item">
          <div className="subscribe-detail-title">中籤公布日</div>
          <div className="subscribe-detail-text">{draw_result_date}</div>
        </div>
        <div className="subscribe-detail-item">
          <div className="subscribe-detail-title">上市日期</div>
          <div className="subscribe-detail-text">{public_date}</div>
        </div>
        <div className="subscribe-detail-item">
          {/*  */}
          <div className="subscribe-detail-title">每手金额</div>
          <div className="subscribe-detail-text">{"-"}</div>
        </div>
        <div className="subscribe-detail-item">
          <div className="subscribe-detail-title">每手股数</div>
          <div className="subscribe-detail-text">{lots_size}</div>
        </div>
        <div className="subscribe-detail-item">
          <div className="subscribe-detail-title">幣種</div>
          <div className="subscribe-detail-text">{currency}</div>
        </div>
      </div>
    </React.Fragment>
  );
}
// 使用者已申购的资讯
function SubscribeOrderInfo(props) {
  return (
    <React.Fragment>
      <div className="subscribe-detail-header">
        <span>已申购资讯</span>
      </div>
      <div className="subscribe-detail-content">
        <div className="subscribe-detail-container-done">
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
    </React.Fragment>
  );
}
