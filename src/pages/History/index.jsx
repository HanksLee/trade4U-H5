import React from "react";
import api from "services";
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
  };

  componentDidMount() {
    // this.getList();
    // this.getTimes();
    this.btnClick();
    window.addEventListener("scroll", this.handleScroll, true);
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll, true);
  }

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
    // const { page_size, page, select_time_end, select_time_start } = this.state;
    // let queryString = "";

    const now = new Date();
    const nowDay = now.getDay();
    const nowTimestamp = Date.parse(now) / 1000;
    const today = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate()
    );
    const todayTimestamp = Date.parse(today) / 1000;
    const thisWeek = new Date(today.getTime() - nowDay * 60 * 60 * 24 * 1000);
    const thisWeekTimestamp = Date.parse(thisWeek) / 1000;
    const thisMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    );
    const thisMonthTimestamp = Date.parse(thisMonth) / 1000;

    $$(".select-btn").on("click", function (e) {
      // $$(this).addClass('hello').attr('title', 'world').insertAfter('.something-else');
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
              hasMore: historyList.length < res.data.count,
              dataLoading: false,
              historyList: [...historyList, ...res.data.results],
              page: page + 1,
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
    const { historyList, dataLoading, totalData } = this.state;

    return (
      <>
        <List mediaList>
          {historyList.map((item, index) => (
            <ListItem
              // dataItem={item}
              id={index}
              key={index}
              className={`history-data`}
            >
              <div className="balance-wrap">
                <div className="balance-title">
                  <div>结馀</div>
                </div>
                <div>
                  <div className="balance-date">
                    {moment(item.create_time * 1000).format(
                      "YYYY.MM.DD HH:mm:ss"
                    )}
                  </div>
                  <div className="balance-num">{item.after_balance}</div>
                </div>
              </div>
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
                    <Col width={"20"}>
                      <p>开仓</p>
                      <p className={"p-down"}>{item.order.open_price}</p>
                    </Col>
                    <Col width={"20"}>
                      <p>目前</p>
                      <p className={`p-up`}>{item.order.new_price}</p>
                    </Col>
                  </Row>
                </div>
              ) : (
                <div className={"history-data-middle"}>
                  <Row className={"align-items-center"}>
                    <Col width={"60"}></Col>
                    <Col width={"20"}>
                      <p>动作</p>
                      <p className={"p-down"}>{item.cause}</p>
                    </Col>
                    <Col width={"20"}>
                      <p>金额</p>
                      <p className={`p-up`}>{item.amount}</p>
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
              <p>利润</p>
              <p>{!utils.isEmpty(totalData) ? totalData.profit : 0}</p>
            </Col>
            <Col width="33"></Col>
            <Col width="33"></Col>
          </Row>
          <Row className={"history-stats-row"}>
            <Col width="33" className={"history-stats-col"}>
              <p>入金</p>
              <p>{!utils.isEmpty(totalData) ? totalData.topup : 0}</p>
            </Col>
            <Col width="33" className={"history-stats-col"}>
              <p>出金</p>
              <p>{!utils.isEmpty(totalData) ? totalData.withdraw : 0}</p>
            </Col>
            <Col width="33" className={"history-stats-col"}>
              <p>结余</p>
              <p>{!utils.isEmpty(totalData) ? totalData.balance : 0}</p>
            </Col>
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
    console.log(search);

    return (
      <Page name="history" className="history-page">
        <Navbar className="history-navbar">
          <Segmented strong>
            <Button className="button-outline time-select select-btn">
              <span>本日</span>
            </Button>
            <Button className="time-select select-btn">
              <span>本周</span>
            </Button>
            <Button className="time-select select-btn">
              <span>本月</span>
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
