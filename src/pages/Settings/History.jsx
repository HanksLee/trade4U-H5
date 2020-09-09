import intl from "react-intl-universal";
import React from "react";
import { inject, observer } from "mobx-react";
import axios from "axios";
import { Pagination, DatePicker } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import utils from "utils";
import { Page, Navbar, NavTitle, NavLeft, Link, Icon } from "framework7-react";
import api from "services";
import moment from "moment";
import locale from "antd/lib/date-picker/locale/zh_CN";
import "moment/locale/zh-cn";
import "./index.scss";

let CancelToken = axios.CancelToken;
let cancel;

export default class extends React.Component {
  state = {
    historyList: [],
    totalData: {},
    page_size: 20,
    page: 1,
    create_time_start: moment(),
    create_time_end: moment(),
    total_count: 0,
  };

  componentDidMount() {
    this.getList();
  }

  onCreateTimeStartChange = (moment) => {
    this.setState({ create_time_start: moment }, () => this.getList());
  };

  onCreateTimeEndChange = (moment) => {
    this.setState({ create_time_end: moment }, () => this.getList());
  };

  paginationChange = (page) => {
    this.setState({ page }, () => this.getList());
  };

  getList = async () => {
    if (cancel != undefined) {
      cancel();
    }
    const { page, page_size, create_time_start, create_time_end } = this.state;
    console.log("this.state :>> ", this.state);
    // 送出 api querystring 前，将 moment 转为 timestamp
    const res = await api.history.getHistoryList({
      params: {
        page,
        page_size,
        create_time_start: create_time_start.unix(),
        create_time_end: create_time_end.unix(),
        type: "deposit_and_withdraw",
      },
    });
    if (res.status === 200) {
      this.setState({
        historyList: res.data.results,
        totalData: res.data.total_data,
        total_count: res.data.count,
      });
    }
  };

  render() {
    const {
      historyList,
      totalData,
      total_count,
      page,
      create_time_end,
      create_time_start,
    } = this.state;
    return (
      <Page>
        <Navbar className="text-color-white">
          <NavLeft>
            <Link onClick={() => this.$f7router.back({ force: false })}>
              <Icon color={"white"} f7={"chevron_left"} size={r(18)}></Icon>
            </Link>
          </NavLeft>
          <NavTitle>资金明细</NavTitle>
        </Navbar>
        <div className="history-total">
          <div className="total-item">
            <div className="item-title">净资产</div>
            <div className="item-content">{totalData?.balance}</div>
          </div>
          <div className="total-item">
            <div className="item-title">入金总额</div>
            <div className="item-content">{totalData?.topup}</div>
          </div>
          <div className="total-item">
            <div className="item-title">出金总额</div>
            <div className="item-content">{totalData?.withdraw}</div>
          </div>
        </div>
        <div className="history-time-filter">
          <DatePicker
            onChange={this.onCreateTimeStartChange}
            value={this.create_time_start}
            locale={locale}
            showToday={false}
            bordered={false}
            allowClear={false}
            defaultValue={moment()}
            disabledDate={(val) => {
              // 开始时间晚于结束时间
              return val.isAfter(create_time_end);
            }}
          ></DatePicker>
          <div>至</div>
          <DatePicker
            onChange={this.onCreateTimeEndChange}
            value={this.create_time_end}
            locale={locale}
            showToday={false}
            bordered={false}
            allowClear={false}
            defaultValue={moment()}
            disabledDate={(val) => {
              // 结束时间大于开始时间 or 结束时间超过今日
              return val.isBefore(create_time_start) || val.isAfter(moment());
            }}
          ></DatePicker>
        </div>
        <div className="history-detail">
          <div className="detail-title">
            <div>时间</div>
            <div>状态</div>
            <div>金额</div>
            <div>备注</div>
          </div>
          <div className="detail-content">
            {historyList.map((item, index) => (
              <div className="content-item" key={item.id} data-id={item.id}>
                <div>
                  <p>{moment(item.create_time * 1000).format("YYYY-MM-DD")}</p>
                  <p>{moment(item.create_time * 1000).format("HH:mm:ss")}</p>
                </div>
                <div>
                  <p>{item.cause_name}</p>
                  {/* {!utils.isEmpty(item.remarks) && <p className="p-down">{`(${item.remarks})`}</p>} */}
                </div>
                <div
                  className={`${
                    item.after_balance - item.before_balance > 0
                      ? "p-up"
                      : "p-down"
                  }`}
                >
                  {item.after_balance - item.before_balance > 0 ? "+" : "-"}
                  {item.amount}
                </div>
                <div>{!utils.isEmpty(item.remarks) && item.remarks}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="pagination">
          <Pagination
            pageSize={20}
            total={total_count}
            current={page}
            hideOnSinglePage={true}
            showSizeChanger={false}
            onChange={this.paginationChange}
          ></Pagination>
        </div>
      </Page>
    );
  }
}
