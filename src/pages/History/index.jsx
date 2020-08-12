import React from "react";
import api from "services";
import { inject, observer } from "mobx-react";
import axios from "axios";
import {
  Page,
  Navbar,
  List,
  ListItem,
  Row,
  Col,
  Block,
  Subnavbar,
  Segmented,
  Button,
  Tab,
  Tabs,
} from "framework7-react";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { Toast, SearchBar } from "antd-mobile";
import DatePicker from "react-mobile-datepicker";
import Dom7 from "dom7";
import { tradeActionMap } from "constant";
import utils from "utils";
import moment from "moment";
import "./index.scss";

const $$ = Dom7;
let CancelToken = axios.CancelToken;
let cancel;

@inject("common")
@observer
export default class extends React.Component {
  state = {
    initcalLoading: true,
    error: false,
    hasMore: true,
    dataLoading: false,
    historyList: [],
    totalData: {},
    page_size: 20,
    page: 1,
    create_time_start: "",
    create_time_end: "",
    datePickerBar: false,
    datePickerShow: false,
    select_time_start: "",
    select_time_end: "",
    currentDatePicker: "",
    search: "",
    tapIndex: -1,
  };

  componentDidMount() {
    this.initEvents();
    window.addEventListener("scroll", this.handleScroll, true);
  }

  initEvents = () => {
    this.props.common.globalEvent.on("refresh-history-page", () => {
      this.btnClick();
    });
  };

  handleScroll = () => {
    const { error, hasMore, dataLoading } = this.state;

    // Bails early if:
    // * there's an error
    // * it's already loading
    // * there's nothing left to load
    if (error || dataLoading || !hasMore) return;
    let scrollTop = $$(".history-page .page-content")[0].scrollTop;
    let scrollHeight = $$(".history-page .page-content")[0].scrollHeight;

    // Checks that the page has scrolled to the bottom
    if (window.innerHeight + scrollTop >= scrollHeight) {
      this.getList();
    }
  };

  setPaddingTop() {
    const { initcalLoading } = this.state;
    if (!initcalLoading) {
      const navbar_height = $$(".history-navbar")[0].offsetHeight;
      const subnavbar_height = $$(".history-navbar .subnavbar")[0].offsetHeight;
      const padding_top = navbar_height + subnavbar_height + 7;
      $$(".history-page .page-content").css("padding-top", `${padding_top}px`);
    }
    this.setState({ initcalLoading: false });
  }

  btnClick = () => {
    const that = this;

    $$(".select-btn").on("click", function (e) {
      e.preventDefault();
      $$(this)
        .addClass("button-active")
        .siblings()
        .removeClass("button-active");
      if ($$(this).index() === 3) {
        that.setState({ datePickerBar: true });
      } else {
        that.setState({ datePickerBar: false });
      }
      that.setPaddingTop();
    });

    $$(".time-select").on("click", function (e) {
      let now = new Date();
      // let nowDay = now.getDay();
      let nowTimestamp = Date.parse(now) / 1000;
      const today = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate()
      );
      let todayTimestamp = Date.parse(today) / 1000;
      // let thisWeek = new Date(today.getTime() - nowDay * 60 * 60 * 24 * 1000);
      let thisWeek = new Date(today.getTime() - 7 * 60 * 60 * 24 * 1000);
      let thisWeekTimestamp = Date.parse(thisWeek) / 1000;
      // let thisMonth = new Date(
      //   new Date().getFullYear(),
      //   new Date().getMonth(),
      //   1
      // );
      let thisMonth = new Date(today.getTime() - 30 * 60 * 60 * 24 * 1000);
      const thisMonthTimestamp = Date.parse(thisMonth) / 1000;
      switch ($$(this).index()) {
        case 0:
          if (
            that.state.create_time_start == todayTimestamp &&
            that.state.create_time_end == nowTimestamp
          ) {
            return false;
          } else {
            that.setState(
              {
                create_time_start: todayTimestamp,
                create_time_end: nowTimestamp,
                search: "",
                page: 1,
                historyList: [],
              },
              that.getList
            );
            // queryString = `page_size=${page_size}&page=${page}&create_time_start=${todayTimestamp}&create_time_end=${nowTimestamp}`;
          }

          break;
        case 1:
          if (
            that.state.create_time_start == thisWeekTimestamp &&
            that.state.create_time_end == nowTimestamp
          ) {
            return false;
          } else {
            that.setState(
              {
                create_time_start: thisWeekTimestamp,
                create_time_end: nowTimestamp,
                search: "",
                page: 1,
                historyList: [],
              },
              that.getList
            );
            // queryString = `page_size=${page_size}&page=${page}&create_time_start=${thisWeekTimestamp}&create_time_end=${nowTimestamp}`;
          }

          break;
        case 2:
          if (
            that.state.create_time_start == thisMonthTimestamp &&
            that.state.create_time_end == nowTimestamp
          ) {
            return false;
          } else {
            that.setState(
              {
                create_time_start: thisMonthTimestamp,
                create_time_end: nowTimestamp,
                search: "",
                page: 1,
                historyList: [],
              },
              that.getList
            );
            // queryString = `page_size=${page_size}&page=${page}&create_time_start=${thisMonthTimestamp}&create_time_end=${nowTimestamp}`;
          }

          break;
      }
    });
    $$(".time-select")[0].click();
  };

  showDatePicker = (e, currentPicker) => {
    e.preventDefault();
    this.setState({ currentDatePicker: currentPicker, datePickerShow: true });
  };

  handleCancel = () => {
    this.setState({ datePickerShow: false });
  };

  handelSelectTime = (time) => {
    const { currentDatePicker } = this.state;
    if (currentDatePicker == "select_time_start") {
      const AdjustmentTime = new Date(
        time.getFullYear(),
        time.getMonth(),
        time.getDate()
      );
      this.setState({
        [currentDatePicker]: Date.parse(AdjustmentTime),
        datePickerShow: false,
      });
    } else {
      this.setState({
        [currentDatePicker]: Date.parse(time),
        datePickerShow: false,
      });
    }
  };

  submitSelectTime = () => {
    const {
      page,
      page_size,
      select_time_start,
      select_time_end,
      create_time_end,
      create_time_start,
    } = this.state;

    if (utils.isEmpty(select_time_start)) {
      return Toast.fail("请选择起始时间", 1);
    }

    if (utils.isEmpty(select_time_end)) {
      return Toast.fail("请选择结束时间", 1);
    }

    if (select_time_end < select_time_start) {
      return Toast.fail("结束时间要大于起始时间", 1);
    }

    if (
      create_time_start === select_time_start / 1000 &&
      create_time_end === select_time_end / 1000
    ) {
      return false;
    }

    // const queryString = `page_size=${page_size}&page=${page}&create_time_start=${
    //   select_time_start / 1000
    // }&create_time_end=${select_time_end / 1000}`;

    this.setState(
      {
        create_time_start: select_time_start / 1000,
        create_time_end: select_time_end / 1000,
        search: "",
        page: 1,
        historyList: [],
      },
      () => {
        this.setPaddingTop();
        this.getList();
      }
    );
  };

  SearchBarSubmit = (value) => {
    const { search } = this.state;
    if (value === search) {
      return false;
    }

    this.setState(
      {
        search: value,
        page: 1,
        historyList: [],
      },
      this.getList
    );
  };

  getList = () => {
    if (cancel != undefined) {
      cancel();
    }
    const {
      page,
      page_size,
      create_time_start,
      create_time_end,
      search,
      historyList,
    } = this.state;

    if (page === 1) {
      this.setState({ totalData: "" });
    }

    this.setState({ dataLoading: true }, async () => {
      await api.history
        .getHistoryList(
          `page_size=${page_size}&page=${page}&create_time_start=${create_time_start}&create_time_end=${create_time_end}&search=${search}`,
          {
            cancelToken: new CancelToken(function executor(c) {
              // An executor function receives a cancel function as a parameter
              cancel = c;
            }),
          }
        )
        .then((res) => {
          if (res.status === 200) {
            this.setState({
              dataLoading: false,
              historyList: [...historyList, ...res.data.results],
              page: page + 1,
            }, () => {
              this.setState({ hasMore: this.state.historyList.length < res.data.count, })
            });
            if (page == 1) {
              this.setState({ totalData: res.data.total_data });
            }
          }
        })
        .catch((error) => {
          console.log(error);
        });
    });
  };

  renderHistoryList = () => {
    const { historyList, dataLoading, totalData, tapIndex } = this.state;

    return (
      <>
        <List mediaList>
          {historyList.map((item, index) => (
            <ListItem
              // dataItem={item}
              id={index}
              key={index}
              className={`history-data`}
              onClick={() => {
                this.setState({
                  tapIndex: tapIndex == index ? -1 : index,
                });
              }}
            >
              {!utils.isEmpty(item.order) ? (
                <div className={"history-data-top"}>
                  <strong>{item.order.symbol_name},</strong>
                  <span className={`p-down`}>
                    {tradeActionMap[item.order.action]} {item.order.lots}
                  </span>
                </div>
              ) : (
                  <div className={"history-data-top"}></div>
                )}
              {!utils.isEmpty(item.order) ? (
                <div className={"history-data-middle"}>
                  <Row className={"align-items-center"}>
                    <Col
                      width={"60"}
                      className={`${
                        item.order.profit > 0
                          ? "p-up"
                          : item.order.profit < 0
                            ? "p-down"
                            : "p-grey"
                        } history-data-middle-current`}
                    >
                      <p>
                        {item.order.profit > 0
                          ? `+${item.order.profit}`
                          : item.order.profit}
                      </p>
                    </Col>
                    <Col width={"20"} style={{ textAlign: "right" }}>
                      <p>开仓</p>
                      <p className="value-text">{item.order.open_price}</p>
                    </Col>
                    <Col width={"20"} style={{ textAlign: "right" }}>
                      <p>平仓</p>
                      <p className="value-text">{item.order.close_price}</p>
                    </Col>
                  </Row>
                </div>
              ) : (
                  <div className={"history-data-middle"}>
                    <Row className={"align-items-center"}>
                      <Col width={"60"}>
                        <Row>
                          <Col width={"50"} className="data-cause">
                            <strong>{item.cause_name}</strong>
                          </Col>
                          <Col width={"50"} className="data-amount">
                            <strong
                              className={item.in_or_out === 0 ? `p-down` : `p-up`}
                            >
                              {item.in_or_out === 0 ? "-" : "+"}
                              {item.amount}
                            </strong>
                          </Col>
                          {item.remarks && <Col width={"100"}><p className="p-down" style={{ 'margin-top': '5px' }}> 备注：{item.remarks} </p></Col>}
                        </Row>
                      </Col>

                      <Col width={"40"} className="data-time">
                        <p>
                          {moment(item.create_time * 1000).format("YYYY/MM/DD")}
                        </p>
                        <p>
                          {moment(item.create_time * 1000).format("HH:mm:ss")}
                        </p>
                        <p>{item.create_time}</p>
                      </Col>
                    </Row>
                  </div>
                )}
              {!utils.isEmpty(item.order) && (
                <div
                  className={`history-data-bottom ${
                    tapIndex == index ? "active" : ""
                    }`}
                >
                  <Row>
                    <Col width={"50"}>
                      <Row className={"justify-content-space-between"}>
                        <span>止损：</span>
                        <span className="value-text">
                          {item.order.stop_loss || "-"}
                        </span>
                      </Row>
                    </Col>
                    <Col width={"50"}>
                      <Row className={"justify-content-space-between"}>
                        <span>库存费：</span>
                        <span className="value-text">
                          {item.order.swaps || "-"}
                        </span>
                      </Row>
                    </Col>
                  </Row>
                  <Row>
                    <Col width={"50"}>
                      <Row className={"justify-content-space-between"}>
                        <span>止盈：</span>
                        <span className="value-text">
                          {item.order.take_profit || "-"}
                        </span>
                      </Row>
                    </Col>
                    <Col width={"50"}>
                      <Row className={"justify-content-space-between"}>
                        <span>税费：</span>
                        <span className="value-text">
                          {item.order.taxes || "-"}
                        </span>
                      </Row>
                    </Col>
                  </Row>
                  <Row>
                    <Col width={"50"}>
                      <Row className={"justify-content-space-between"}>
                        <span>订单号：</span>
                        <span className="value-text">
                          {item.order.order_number.substr(-11)}
                        </span>
                      </Row>
                    </Col>
                    <Col width={"50"}>
                      <Row className={"justify-content-space-between"}>
                        <span>手续费：</span>
                        <span className="value-text">
                          {item.order.fee || "-"}
                        </span>
                      </Row>
                    </Col>
                    <Col width={"50"}>
                      <Row>
                        <span>平仓时间：</span>
                        <span style={{ textAlign: "right" }}>
                          <p className="value-text">
                            {moment(item.order.close_time * 1000).format(
                              "YYYY/MM/DD"
                            )}
                          </p>
                          <p className="value-text">
                            {moment(item.order.close_time * 1000).format(
                              "HH:mm:ss"
                            )}
                          </p>
                        </span>
                      </Row>
                    </Col>
                    <Col width={"50"}>
                      <Row>
                        <span>开仓时间：</span>
                        <span style={{ textAlign: "right" }}>
                          <p className="value-text">
                            {moment(item.order.create_time * 1000).format(
                              "YYYY/MM/DD"
                            )}
                          </p>
                          <p className="value-text">
                            {moment(item.order.create_time * 1000).format(
                              "HH:mm:ss"
                            )}
                          </p>
                        </span>
                      </Row>
                    </Col>
                  </Row>
                </div>
              )}
            </ListItem>
          ))}
          {dataLoading && (
            <Spin
              indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
            />
          )}
        </List>
        <Block strong className={`history-stats `}>
          <Row className={"history-stats-row"}>
            <Col width="33" className={"history-stats-col"}>
              <p>入金</p>
              <p>{!utils.isEmpty(totalData) ? totalData.topup : 0}</p>
            </Col>
            <Col width="33" className={"history-stats-col"}>
              <p>利润</p>
              <p>{!utils.isEmpty(totalData) ? totalData.profit : 0}</p>
            </Col>
            <Col width="33"></Col>
          </Row>
          <Row className={"history-stats-row"}>
            <Col width="33" className={"history-stats-col"}>
              <p>出金</p>
              <p>{!utils.isEmpty(totalData) ? totalData.withdraw : 0}</p>
            </Col>
            <Col width="33" className={"history-stats-col"}>
              <p>结余</p>
              <p>{!utils.isEmpty(totalData) ? totalData.balance : 0}</p>
            </Col>
            <Col width="33"></Col>
          </Row>
        </Block>
      </>
    );
  };

  render() {
    // console.log(this.state);

    const {
      select_time_start,
      select_time_end,
      datePickerBar,
      currentDatePicker,
      search,
    } = this.state;

    return (
      <Page name="history" className="history-page">
        <Navbar className="history-navbar">
          <Segmented strong>
            <Button className="button-outline time-select select-btn">
              <span>本日</span>
            </Button>
            <Button className="time-select select-btn">
              <span>近7天</span>
            </Button>
            <Button className="time-select select-btn">
              <span>近30天</span>
            </Button>
            <Button className="select-btn">
              <span>自定义</span>
            </Button>
          </Segmented>

          <Subnavbar>
            {datePickerBar && (
              <div className="date-picker-bar">
                <input
                  type="text"
                  placeholder="起始时间"
                  onClick={(e) => {
                    this.showDatePicker(e, "select_time_start");
                  }}
                  value={
                    select_time_start
                      ? moment(select_time_start).format("YYYY-MM-DD")
                      : ""
                  }
                />
                <input
                  type="text"
                  placeholder="结束时间"
                  onClick={(e) => {
                    this.showDatePicker(e, "select_time_end");
                  }}
                  value={
                    select_time_end
                      ? moment(select_time_end).format("YYYY-MM-DD")
                      : ""
                  }
                />
                <div onClick={this.submitSelectTime}>确认</div>
              </div>
            )}
            <SearchBar
              placeholder="交易品种或代码进行搜索"
              onSubmit={this.SearchBarSubmit}
              defaultValue={!utils.isEmpty(search) ? search : ""}
            />
          </Subnavbar>
        </Navbar>
        <DatePicker
          value={
            (currentDatePicker == "select_time_start" &&
              select_time_start != "") ||
              (currentDatePicker == "select_time_end" && select_time_end != "")
              ? currentDatePicker == "select_time_start"
                ? new Date(select_time_start)
                : new Date(select_time_end)
              : new Date()
          }
          isOpen={this.state.datePickerShow}
          onSelect={this.handelSelectTime}
          onCancel={this.handleCancel}
          theme={"ios"}
          max={new Date()}
        />
        {this.renderHistoryList()}
      </Page>
    );
  }
}
