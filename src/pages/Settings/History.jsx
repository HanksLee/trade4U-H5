import intl from "react-intl-universal";
import React from "react";
import utils from "utils";
import { WhiteSpace } from "antd-mobile";
import { Page, Navbar, NavRight } from "framework7-react";
import api from "services";
import moment from "moment";
import "./index.scss";

export default class extends React.Component {
  state = {
  };

  componentWillMount() {
  }

  render() {
    return (
      <Page>
        <Navbar
          title={"资金明细"}
          backLink="Back"
          className="text-color-white"
        >
          <NavRight>
            {/* <div onClick={this.handleSubmit}>確認</div> */}
          </NavRight>
        </Navbar>
        <div className="history-total">
          <div className="total-item">
            <div className="item-title">净资产</div>
            <div className="item-content">1,000.00</div>
          </div>
          <div className="total-item">
            <div className="item-title">入金总额</div>
            <div className="item-content">1,000.00</div>
          </div>
          <div className="total-item">
            <div className="item-title">出金总额</div>
            <div className="item-content">1,000.00</div>
          </div>
        </div>
        <div class="history-time-filter">
          <div>2020-01-01</div>
          <div>至</div>
          <div>2020-01-01</div>
        </div>
        <div className="history-detail">
          <div className="detail-title">
            <div>时间</div>
            <div>状态</div>
            <div>金额</div>
            <div>备注</div>
          </div>
          <div className="detail-content">
            <div className="content-item">
              <div>
                <p>2020-03-26</p>
                <p>13:00:00</p>
              </div>
              <div>打款成功</div>
              <div className="p-down">-1,000</div>
              <div>這是我賺來的</div>
            </div>
            <div className="content-item">
              <div >
                <p>2020-03-26</p>
                <p>13:00:00</p>
              </div>
              <div>財務審核中</div>
              <div className="p-up">+1,000</div>
              <div>這是我賺來的</div>
            </div>
            <div className="content-item">
              <div>
                <p>2020-03-26</p>
                <p>13:00:00</p>
              </div>
              <div>
                <p>出金駁回</p>
                <p className="p-down">(銀行帳戶錯誤)</p>
              </div>
              <div className="p-up">+1,000</div>
              <div>這是我賺來的</div>
            </div>
          </div>
        </div>
      </Page>
    );
  }
}
