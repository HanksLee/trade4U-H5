import api from "services";
import React from "react";
import { Tabs } from "antd-mobile";
import "antd/dist/antd.css";
import { toJS } from "mobx";
import { inject, observer } from "mobx-react";
import utils from "utils";
import moment from "moment";
import ReactEcharts from "echarts-for-react";
import styles from "./SymbolInfo.module.scss";
import classnames from "classnames/bind";
const cx = classnames.bind(styles);

@inject("market", "trend", "trade")
@observer
export class SymbolInfo extends React.Component {
  static displayName = "SymbolInfo";
  state = {
    fund: {},
    newsList: [],
    currentNewsPage: 1,
  };
  componentDidMount() {
    this.getFund();
    this.getNewsList();
  }
  getFund = async () => {
    const { currentSymbol } = this.props.market;
    // console.log("this.props.trade :>> ", this.props.trade);
    this.setState({ tabDataLoading: true }, async () => {
      const id = currentSymbol?.product_details?.symbol;
      const res = await api.trade.getFunds(id, {});
      // console.log("res :>> ", res);
      if (res.status === 200) {
        this.setState({ tabDataLoading: false, fund: res.data });
      } else {
        // 某些产品没有盘口资讯，会回传 404
        this.setState({ tabDataLoading: false, fund: "" });
      }
    });
  };
  getNewsList = async () => {
    const { currentSymbol } = this.props.market;
    const { currentNewsPage } = this.state;
    // console.log("this.props.market :>> ", toJS(this.props.market));
    const res = await api.news.getNewsList({
      params: {
        symbol_code: currentSymbol?.product_details?.symbol,
        page: currentNewsPage,
      },
    });
    // console.log("getNewsList res :>> ", res);
    if (res.status === 200) {
      this.setState({
        page: currentNewsPage + 1,
        newsList: [...this.state.newsList, ...res.data.results],
      });
    }
  };

  renderDetail = () => {
    const { currentSymbol } = this.props.market;
    const { symbol_display } = currentSymbol;
    const field = {
      decimals_place: { text: "小数点位", format: (val) => String(val) },
      contract_size: { text: "合约大小", format: (val) => String(val) },
      spread: { text: "点差", format: (val) => String(val) },
      margin_currency_display: { text: "预付款货币" },
      profit_currency_display: { text: "获利货币" },
      min_lots: { text: "最小交易手数", format: (val) => String(val) },
      max_lots: { text: "最大交易手数", format: (val) => String(val) },
      lots_step: { text: "交易数步长", format: (val) => String(val) },
      purchase_fee: { text: "买入库存费", format: (val) => String(val) },
      selling_fee: { text: "卖出库存费", format: (val) => String(val) },
    };
    return (
      <div className={cx("tab-body")}>
        <div className={cx("stock-detail")}>
          {Object.entries(field).map(([key, detail]) => {
            const displayValue = symbol_display[key] ?? "-";
            return (
              <div className={cx("item")}>
                <div className={cx("item-col", "item-title")}>
                  {detail.text}
                </div>
                <div className={cx("item-col")}>{displayValue}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  renderFundContent = () => {
    // 渲染盘口资讯
    const { fund } = this.state;
    const { currentSymbol } = this.props.market;
    // console.log("this.state.fund :>> ", this.state.fund);
    return (
      <div className={cx("tab-body")}>
        <div className={cx("fund-content")}>
          <div>{this.renderFundPieChart()}</div>
          <div className={cx("fund-content-title")}>主力、散户资金流向</div>
          {utils.isEmpty(fund) && (
            <div className={cx("no-content")}>此产品无资金流向显示</div>
          )}
          {!utils.isEmpty(fund) && (
            <table className={cx("fund-table")}>
              <thead>
                <tr>
                  <th className={cx("fund-table-cell")}> </th>
                  <th className={cx("fund-table-cell")}>主力买入</th>
                  <th className={cx("fund-table-cell")}>主力卖出</th>
                  <th className={cx("fund-table-cell")}>散户买入</th>
                  <th className={cx("fund-table-cell")}>散户卖出</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={cx("fund-table-cell")}>金额(元)</td>
                  <td className={cx("fund-table-cell")}>
                    {Math.round(Number(fund.major_in_amount) / 10000)}
                  </td>
                  <td className={cx("fund-table-cell")}>
                    {Math.round(Number(fund.major_out_amount) / 10000)}
                  </td>
                  <td className={cx("fund-table-cell")}>
                    {Math.round(Number(fund.major_in_amount) / 10000)}
                  </td>
                  <td className={cx("fund-table-cell")}>
                    {Math.round(Number(fund.retail_out_amount) / 10000)}
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  };
  renderFundPieChart = () => {
    const { fund } = this.state;
    if (utils.isEmpty(fund)) return null;
    return (
      <ReactEcharts
        option={{
          color: ["#b8eeb8", "#EEB8B8", "#fff798", "#9de6e2"],
          legend: {
            top: 15,
            data: ["主力买入", "主力卖出", "散户买入", "散户卖出"],
            textStyle: { color: "#838d9e", fontSize: 14 },
          },
          series: [
            {
              bottom: 0,
              top: 50,
              right: 0,
              left: 0,
              type: "pie",
              radius: "55%",
              data: [
                {
                  value: Math.round(Number(fund.major_in_amount) / 10000),
                  name: "主力买入",
                },
                {
                  value: Math.round(Number(fund.major_out_amount) / 10000),
                  name: "主力卖出",
                },
                {
                  value: Math.round(Number(fund.retail_in_amount) / 10000),
                  name: "散户买入",
                },
                {
                  value: Math.round(Number(fund.retail_out_amount) / 10000),
                  name: "散户卖出",
                },
              ],
              //   label: { fontSize: 14 },
            },
          ],
        }}
      />
    );
  };
  renderNewsContent = () => {
    // 渲染新闻资讯
    const { newsList } = this.state;
    return (
      <div className={cx("tab-body")}>
        <div className="news-content">
          {utils.isEmpty(newsList) && (
            <div className={cx("no-content")}>此产品无新聞显示</div>
          )}
          {!utils.isEmpty(newsList) &&
            newsList.map((item) => (
              <div
                className="news-content-item"
                onClick={(e) => this.handleNewsItemClick(e, item)}
              >
                <div className="news-content-item-text">
                  <p>{item.title}</p>
                  <p>
                    {moment(item.pub_time * 1000).format("YYYY/MM/DD HH:mm:ss")}
                  </p>
                </div>
                {!utils.isEmpty(item.thumbnail) && (
                  <div className="news-content-item-img">
                    <img src={item.thumbnail} alt="thumbmail" />
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    );
  };
  handleNewsItemClick = (_, item) => {
    const router = this.props.router ?? this.$f7.views.main.router;
    if (!router) return;
    router.navigate("/news/detail", {
      props: { newsDetail: item },
    });
  };
  render() {
    const { currentSymbol } = this.props.market;
    const tabs = [{ title: "详细资讯" }, { title: "盘口" }, { title: "新闻" }];
    return (
      <div className={cx("symbol-info")}>
        <Tabs
          tabs={tabs}
          renderTabBar={(props) => <Tabs.DefaultTabBar {...props} page={3} />}
          tabBarBackgroundColor="transparent"
          tabBarActiveTextColor="#F2E205"
          tabBarInactiveTextColor="#838D9E"
          tabBarUnderlineStyle={{ border: "1px solid #F2E205" }}
        >
          {this.renderDetail}
          {this.renderFundContent}
          {this.renderNewsContent}
        </Tabs>
      </div>
    );
  }
}
