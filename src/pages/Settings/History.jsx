import intl from "react-intl-universal";
import React from "react";
import { inject, observer } from "mobx-react";
import axios from "axios";
import { Pagination, DatePicker } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import utils from "utils";
import { Page, Navbar, NavRight } from "framework7-react";
import api from "services";
import moment from "moment";
import locale from 'antd/lib/date-picker/locale/zh_CN';
import 'moment/locale/zh-cn';
import "./index.scss";

let CancelToken = axios.CancelToken;
let cancel;

export default class extends React.Component {
  state = {
    search: "",
    historyList: [],
    totalData: {},
    page_size: 20,
    page: 1,
    create_time_start: "",
    create_time_end: "",
    total_count: 0
  };

  componentDidMount() {
    // console.log(moment.format('YYYY/MM/DD'))
    this.setState({
      create_time_start: Date.parse(`${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`) / 1000,
      create_time_end: Date.parse(`${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`) / 1000 + 86399
    }, () => {
      this.getList()
    })
  }

  onCreateTimeStartChange = (date, dateString) => {
    this.setState({
      create_time_start: Date.parse(date) / 1000
    }, () => { this.getList() })
  }

  onCreateTimeEndChange = (date, dateString) => {
    this.setState({
      create_time_end: Date.parse(date) / 1000 + 86399
    }, () => { this.getList() })
  }

  paginationChange = (page) => {
    this.setState({ page }, () => { this.getList() })
  }

  getList = () => {
    if (cancel != undefined) {
      cancel();
    }
    const {
      page,
      page_size,
      create_time_start,
      create_time_end,
    } = this.state;

    this.setState({ dataLoading: true }, async () => {
      await api.history
        .getHistoryList(
          `page_size=${page_size}&page=${page}&create_time_start=${create_time_start}&create_time_end=${create_time_end}`, {
          params: {
            type: 'deposit_and_withdraw',
          },
        })
        .then((res) => {
          if (res.status === 200) {
            this.setState({
              historyList: res.data.results,
              totalData: res.data.total_data,
              total_count: res.data.count
            });
          }
        })
        .catch((error) => {
          // console.log(error);
        });
    });
  };

  render() {
    const { historyList, dataLoading, totalData, total_count, page, create_time_end, create_time_start } = this.state;
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
            locale={locale}
            showToday={false}
            bordered={false}
            allowClear={false}
            defaultValue={moment(`'${moment().format('L')}'`)}
            disabledDate={
              current => {
                return current && current > moment((create_time_end * 1000));
              }}
          ></DatePicker>
          <div>至</div>
          <DatePicker
            onChange={this.onCreateTimeEndChange}
            locale={locale}
            showToday={false}
            bordered={false}
            allowClear={false}
            defaultValue={moment(`'${moment().format('L')}'`)}
            disabledDate={
              current => {
                return current && (current > moment().add('days') || current < moment((create_time_start * 1000)))
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
              <div className="content-item">
                <div>
                  <p>
                    {moment(item.create_time * 1000).format(
                      "YYYY/MM/DD"
                    )}</p>
                  <p>
                    {moment(item.create_time * 1000).format(
                      "HH:mm:ss"
                    )}
                  </p>
                </div>
                <div>
                  <p>{item.cause_name}</p>
                  {/* {!utils.isEmpty(item.remarks) && <p className="p-down">{`(${item.remarks})`}</p>} */}
                </div>
                <div className={`${item.after_balance - item.before_balance > 0 ? "p-up" : "p-down"}`}>{item.after_balance - item.before_balance > 0 ? "+" : "-"}{item.amount}</div>
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
            onChange={this.paginationChange}>
          </Pagination>
        </div>
      </Page>
    );
  }
}
