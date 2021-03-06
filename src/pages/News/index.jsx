import api from "services";
import React from "react";
import { Page, Navbar, NavRight, NavLeft, NavTitle } from "framework7-react";
import { Tabs } from "antd-mobile";
import { inject, observer } from "mobx-react";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import moment from "moment";
import Dom7 from "dom7";
import "./index.scss";
import utils from "utils";
import Announcement from "./Announcement";
import { util } from "echarts/lib/export";

const $$ = Dom7;

@inject("common", "market")
@observer
export default class NewsPage extends React.Component {
  state = {
    symbolTypeList: [],
    currentSymbolCode: "mixed",
    error: false,
    hasMore: true,
    dataLoading: false,
    page: 1,
    newsList: [],
    newsListCount: 0,
    tabIndex: 0,
  };

  async componentDidMount() {
    await this.getSymbolTypeList();
    this.switchActiveDot(0);
    this.getList();
    this.initEvents();
    window.addEventListener("scroll", this.handleScroll, true);
  }

  componentDidUpdate() {
    // this.switchActiveDot(0);
  }

  initEvents = () => {
    // console.log(this.props.common.globalEvent)
    this.props.common.globalEvent.on("refresh-news-page", () => {
      this.getList();
    });
  };

  handleScroll = () => {
    const { error, hasMore, dataLoading, tabIndex } = this.state;

    // Bails early if:
    // * there's an error
    // * it's already loading
    // * there's nothing left to load
    if (error || dataLoading || !hasMore) return;
    let scrollTop = $$("#view-news .page-content .am-tabs-pane-wrap ")[tabIndex]
      .scrollTop;
    let scrollHeight = $$("#view-news .page-content .am-tabs-pane-wrap ")[
      tabIndex
    ].scrollHeight;

    if (scrollTop === 0 && scrollHeight === 0) return;

    // Checks that the page has scrolled to the bottom
    if (window.innerHeight + scrollTop >= scrollHeight) {
      this.getList();
    }
  };

  getList = async () => {
    this.setState({ dataLoading: true }, async () => {
      const { currentSymbolCode, page } = this.state;

      const res = await api.news.getNewsList({
        params: {
          news_class: currentSymbolCode,
          page,
        },
      });

      if (res.status === 200) {
        this.setState(
          {
            dataLoading: false,
            page: this.state.page + 1,
            newsList: [...this.state.newsList, ...res.data.results],
            newsListCount: res.data.count,
          },
          () => {
            const { newsList, newsListCount } = this.state;
            this.setState({ hasMore: newsList.length < newsListCount });
          }
        );
      }
    });
  };

  switchActiveDot = (index) => {
    const { symbolTypeList } = this.state;
    let tabItemWidth = 100 / symbolTypeList.length;
    let tabActiveLeft = `calc(${
      tabItemWidth * index + tabItemWidth / 2
      }% - 3px)`;
    if (document.getElementsByClassName("tab-active-dot")[0]) {
      document.getElementsByClassName(
        "tab-active-dot"
      )[0].style.left = tabActiveLeft;
    }
  };

  onChangeTabs = (tab, index) => {
    // console.log('onChange', index, tab);
    this.switchActiveDot(index);
    this.switchSymbolCode(tab.symbol_type_code);
    this.setState({ tabIndex: index });
  };

  onClickTabs = (tab, index) => {
    // console.log('onTabClick', index, tab);
    this.switchActiveDot(index);
    // this.switchSymbolCode(tab.symbol_type_code)
  };

  switchSymbolCode = async (code) => {
    this.setState(
      { currentSymbolCode: code, page: 1, newsList: [], newsListCount: 0 },
      () => {
        if(code !== "announcement"){
          this.getList();
        }
      }
    );
  };

  getSymbolTypeList = async () => {
    let newsType = [{
      symbol_type_name: "??????",
      symbol_type_code: "mixed",
    }];

    const res = await api.market.getSymbolTypeList();
    if (res.status == 200) {
      newsType = [...newsType, ...res.data.results];
    }

    let announcementType = [{
      symbol_type_name: "??????",
      symbol_type_code: "announcement",
    }]

    newsType = [...newsType, ...announcementType];
    this.setState({ symbolTypeList: newsType });
  };

  // navigateToSymbolDetail = () => {
  //   const { currentSymbol } = this.state;
  //   this.$f7router.navigate(`/market/symbol/${currentSymbol.id}`, {
  //     context: currentSymbol,
  //   });
  // };

  render() {
    const { symbolTypeList, newsList, dataLoading, currentSymbolCode } = this.state;
    return (
      <Page name="news">
        <Navbar className="news-navbar">
          <NavLeft></NavLeft>
          <NavTitle>??????</NavTitle>
          <NavRight></NavRight>
        </Navbar>
        {!utils.isEmpty(symbolTypeList) && (
          <div className="tab-active-bar">
            <span className="tab-active-dot"></span>
          </div>
        )}
        <Tabs
          tabs={symbolTypeList}
          initialPage={0}
          renderTab={(tab) => <span>{tab.symbol_type_name}</span>}
          onChange={this.onChangeTabs}
          // onTabClick={this.onClickTabs}
          tabBarBackgroundColor="transparent"
          tabBarActiveTextColor="#F2E205"
          tabBarInactiveTextColor="#838D9E"
          tabBarUnderlineStyle={{
            display: "none",
          }}
        >
          <div className="news-content">
            {currentSymbolCode === "announcement"
            ? <Announcement />
            : !utils.isEmpty(newsList) &&
              newsList.map((item, index) => {
                return (
                  <div
                    key={index}
                    className="news-content-item"
                    onClick={() => {
                      this.$f7router.navigate("/news/detail", {
                        props: {
                          newsDetail: item,
                        },
                      });
                    }}
                  >
                    <div className="news-content-item-text">
                      <p>{item.title}</p>
                      <p>
                        {moment(item.pub_time * 1000).format(
                          "YYYY/MM/DD HH:mm:ss"
                        )}
                      </p>
                    </div>
                    {/* {!utils.isEmpty(item.thumbnail) && (
                      <div className="news-content-item-img">
                        <img src={item.thumbnail} alt="thumbmail" />
                      </div>
                    )} */}
                  </div>
                );
              })}
            {dataLoading && (
              <div className="spin-container">
                <Spin
                  indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
                />
              </div>
            )}
          </div>
        </Tabs>
      </Page>
    );
  }
}
