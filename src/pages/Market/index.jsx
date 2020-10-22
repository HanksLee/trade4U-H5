import React from "react";
import {
  Page,
  Navbar,
  NavRight,
  NavLeft,
  NavTitle,
  Actions,
  ActionsLabel,
  ActionsGroup,
  ActionsButton,
} from "framework7-react";
import cloneDeep from "lodash/cloneDeep";
import EditIcon from "assets/img/edit2.svg";
import AddIcon from "assets/img/add.svg";
import SearchIcon from "assets/img/search.svg";
import { inject, observer } from "mobx-react";
import { Spin } from "antd";
import { Tabs, TabBar } from "antd-mobile";
import { LoadingOutlined } from "@ant-design/icons";
import moment from "moment";
import ws from "utils/ws";
import Dom7 from "dom7";
import "./index.scss";
import channelConfig from "./config/channelConfig";
import WSConnect from "components/HOC/WSConnect";
import ProductList from "./ProductList";
import utils from "utils";
import Item from "antd-mobile/lib/popover/Item";
import { toJS } from "mobx";

const $$ = Dom7;
const WS_ProductList = WSConnect(channelConfig[0], channelConfig, ProductList);
let topHeight = 0;
let bottomHeight = 0;
let itemHeight = 0;
let wsSubscribeAry = [];

@inject("common", "market")
@observer
export default class MarketPage extends React.Component {
  buyTimers = [];
  sellTimers = [];
  state = {
    currentSymbol: null,
    symbolTypeList: [],
    subSymbolTypeList: [],
    subCurrentSymbolType: "全部",
    currentSymbolType: {},
    showSubSymbolType: false,
    error: false,
    hasMore: true,
    dataLoading: false,
    page_size: 20,
    page: 1,
    hasData: true,
    tabIndex: 0
  };
  tabRefs = {}; // 储存 tab项目 dom 元素，key 为 SymbolType 的 id

  async componentDidMount() {
    // this.connectWebsocket();
    await this.getSymbolTypeList();
    this.props.common.getProfitRule();
    window.addEventListener("scroll", this.handleScroll, true);
    this.props.common.setSelectedSymbolTypeInfo({ code: "HK" });
    this.setTableHeight();
    // this.setState({ currentSymbolType: this.state.symbolTypeList[0] })
    // $$('.self-select-tr').on('click', (evt) => {
    //   const dom = $$(evt.target).parents('.self-select-tr')[0] || $$(evt.target)[0];
    //   console.log('dom', dom);

    //   if (dom) {
    //     const id = $$(dom).data('id')
    //     const { selfSelectSymbolList, } = this.props.market
    //     for (let i = 0; i < selfSelectSymbolList.length; i++) {
    //       if (String(selfSelectSymbolList[i].id) === id) {
    //         this.setState({
    //           currentSymbol: selfSelectSymbolList[i],
    //         })
    //         break
    //       }
    //     }
    //     this.refs.actionsGroup.open();
    //   }
    // })
  }

  componentWillUnmount = () => {
    if (this.wsConnect) {
      this.wsConnect.close();
    }
  };

  handleScroll = () => {
    const { error, hasMore, dataLoading, tabIndex } = this.state;
    const { nextSymbolIDList } = this.props.market;

    // Bails early if:
    // * there's an error
    // * it's already loading
    // * there's nothing left to load
    if (error || dataLoading || !hasMore) return;
    let scrollTop = $$("#view-market .self-select-table")[tabIndex].scrollTop;
    let scrollHeight = $$("#view-market .self-select-table")[tabIndex].scrollHeight;
    console.log(scrollTop, scrollHeight, bottomHeight)

    if (scrollTop === 0 && scrollHeight === 0) return;

    //偵測高度來決定訂閱項目
    if (scrollTop - itemHeight > 0) {
      if (scrollTop < (topHeight + itemHeight) || scrollTop > (bottomHeight - itemHeight)) {
        const currentAryIndex = parseInt(scrollTop / itemHeight);
        const subscribeStart = currentAryIndex - 20 > 0 ? currentAryIndex - 20 : 0;
        const subscribeEnd = subscribeStart === 0 ? currentAryIndex + 40 : currentAryIndex + 20;
        wsSubscribeAry = nextSymbolIDList.slice(subscribeStart, subscribeEnd)
        topHeight = scrollTop - (itemHeight * 20) < 0 ? 0 : scrollTop - (itemHeight * 20);
        bottomHeight = scrollTop + (itemHeight * (subscribeStart === 0 ? 40 : 20));
        this.subscribeWS();
      }
    }

    // Checks that the page has scrolled to the bottom
    if (window.innerHeight + scrollTop >= scrollHeight) {
      this.getList();
    }


  };

  setTableHeight = () => {
    const { tabIndex } = this.state;
    // page
    const pageHeight = document.getElementById("view-market").clientHeight;
    const marketNavbarHeight = document.getElementsByClassName("market-navbar")[0]
      .clientHeight;
    const tabbarHeight = document.getElementsByClassName("app-tabbar")[0]
      .clientHeight;
    const tableHeaderHeight = document.querySelectorAll("#view-market .self-select-header")[tabIndex]
      .clientHeight;

    const marketTableHeight =
      pageHeight -
      marketNavbarHeight -
      tableHeaderHeight -
      tabbarHeight;

    document.querySelectorAll(
      "#view-market .self-select-table"
    )[tabIndex].style.height = `${marketTableHeight}px`;
  }

  //訂閱ws
  subscribeWS = () => {
    const {
      moveSymbolIDList,
      nextSymbolIDList,
      prevSymbolIDList,
    } = this.props.market;
    if (!utils.isEmpty(wsSubscribeAry)) {
      moveSymbolIDList(cloneDeep(nextSymbolIDList));
      this.props.common.setUnSubscribeSymbol({ list: prevSymbolIDList });
      // console.log(prevSymbolIDList);
      // this.trackSymbol(prevSymbolIDList, "unsubscribe");
    }
    this.props.common.setSubscribeSymbol({ list: wsSubscribeAry });
    // console.log(nextSymbolIDList);
    // this.trackSymbol(nextSymbolIDList, "subscribe");
  }

  getList = async () => {
    const {
      currentSymbolType,
      subCurrentSymbolType,
      page,
      page_size,
      tabIndex
    } = this.state;
    const {
      moveSymbolIDList,
      nextSymbolIDList,
      prevSymbolIDList,
    } = this.props.market;
    if (currentSymbolType.symbol_type_name === "自选") {
      if (subCurrentSymbolType === "全部") {
        this.setState({ dataLoading: true }, async () => {
          let queryString = `page=${page}&page_size=${page_size}`;
          await this.props.market.getSelfSelectSymbolList(
            queryString,
            page === 1 ? true : false
          );
          this.setState({ dataLoading: false, page: page + 1 }, () => {
            const {
              selfSelectSymbolList,
              selfSelectSymbolListCount,
            } = this.props.market;
            this.setState({
              hasMore: selfSelectSymbolList.length < selfSelectSymbolListCount,
              hasData: selfSelectSymbolList.length > 0 ? true : false,
            });
          });
        });
      } else {
        this.setState({ dataLoading: true }, async () => {
          let queryString = `type__name=${subCurrentSymbolType}&page=${page}&page_size=${page_size}`;
          await this.props.market.getSelfSelectSymbolList(
            queryString,
            page === 1 ? true : false
          );
          this.setState({ dataLoading: false, page: page + 1 }, () => {
            const {
              selfSelectSymbolList,
              selfSelectSymbolListCount,
            } = this.props.market;
            this.setState({
              hasMore: selfSelectSymbolList.length < selfSelectSymbolListCount,
              hasData: selfSelectSymbolList.length > 0 ? true : false,
            });
          });
        });
      }
    } else {
      this.setState({ dataLoading: true }, async () => {
        let queryString = `type__name=${currentSymbolType.symbol_type_name}&page=${page}&page_size=${page_size}`;
        await this.props.market.getSymbolList(
          queryString,
          page === 1 ? true : false
        );
        this.setState({ dataLoading: false, page: page + 1 }, () => {
          const { symbolList, symbolListCount } = this.props.market;
          this.setState({
            hasMore: symbolList.length < symbolListCount,
            hasData: symbolList.length > 0 ? true : false,
          });
        });

        //訂閱ws的動作，包含偵測最低高度、最高高度、訂閱數
        nextSymbolIDList.length > 40 ? wsSubscribeAry = nextSymbolIDList.slice(-40) : wsSubscribeAry = nextSymbolIDList;
        itemHeight = $$("#view-market .self-select-table")[tabIndex].scrollHeight / nextSymbolIDList.length;
        bottomHeight = nextSymbolIDList.length * itemHeight;
        topHeight = nextSymbolIDList.length > 40 ? bottomHeight - itemHeight * 40 : 0;
        this.subscribeWS()
      });
    }
  };

  switchSymbolType = async (item, index) => {
    // console.log("item :>> ", item);
    this.tabRefs[item.id].scrollIntoView(); // 将目前选中的 tab 卷动至可见
    this.setState({ currentSymbolType: item, page: 1, page_size: 20, tabIndex: index }, () => {
      this.getList();
      this.setTableHeight()
    });
  };

  switchShowSubSymbolType = () => {
    const { showSubSymbolType } = this.state;
    this.setState({ showSubSymbolType: !showSubSymbolType });
  };

  switchSubSelfSelctList = (name) => {
    this.setState(
      {
        subCurrentSymbolType: name,
        showSubSymbolType: false,
        name,
        page: 1,
        page_size: 20,
      },
      () => {
        this.getList();
      }
    );
  };

  getSymbolTypeList = async () => {
    const res = await this.props.common.$api.market.getSymbolTypeList();

    if (res.status == 200) {
      this.setState(
        {
          symbolTypeList: [
            ...res.data.results,
            {
              id: 0,
              symbol_type_name: "自选",
              symbol_type_code: "self",
            },
          ],
          subSymbolTypeList: [
            {
              symbol_type_name: "全部",
            },
            ...res.data.results,
          ],
        },
        () => {
          this.setState(
            { currentSymbolType: this.state.symbolTypeList[0] },
            () => {
              this.getList();
            }
          );
        }
      );
    }
  };

  connectWebsocket = () => {
    const that = this;
    this.wsConnect = ws("self-select-symbol");

    // setInterval(function () {
    //   that.wsConnect.send(`{"type":"ping"}`);
    // }, 3000)

    this.wsConnect.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const data = message.data;
      if (message.type === "pong") {
        clearInterval(this.interval);

        // 如果一定时间没有调用clearInterval，则执行重连
        this.interval = setInterval(function () {
          that.connectWebsocket();
        }, 1000);
      }
      if (message.type && message.type !== "pong") {
        // 消息推送
        // code ...
        const { selfSelectSymbolList } = this.props.market;
        const newSelfSelectSymbolList = selfSelectSymbolList.map(
          (item, index) => {
            if (
              item.symbol_display.product_display.code === data.symbol &&
              Number(item.product_details.timestamp) < Number(data.timestamp)
            ) {
              const buyItemDom = $$($$(".self-select-buy-block")[index]);
              const sellItemDom = $$($$(".self-select-sell-block")[index]);
              if (data.buy > item.product_details.buy) {
                clearTimeout(this.buyTimers[index]);
                buyItemDom.removeClass("decrease");
                buyItemDom.addClass("increase");
                this.buyTimers[index] = setTimeout(() => {
                  buyItemDom && buyItemDom.removeClass("increase");
                }, 2000);
              } else if (data.buy < item.product_details.buy) {
                clearTimeout(this.buyTimers[index]);
                buyItemDom.removeClass("increase");
                buyItemDom.addClass("decrease");
                this.buyTimers[index] = setTimeout(() => {
                  buyItemDom && buyItemDom.removeClass("decrease");
                }, 2000);
              }

              if (data.sell > item.product_details.sell) {
                clearTimeout(this.sellTimers[index]);
                sellItemDom.removeClass("decrease");
                sellItemDom.addClass("increase");
                this.sellTimers[index] = setTimeout(() => {
                  sellItemDom && sellItemDom.removeClass("increase");
                }, 2000);
              } else if (data.sell < item.product_details.sell) {
                clearTimeout(this.sellTimers[index]);
                sellItemDom.removeClass("increase");
                sellItemDom.addClass("decrease");
                this.sellTimers[index] = setTimeout(() => {
                  sellItemDom && sellItemDom.removeClass("decrease");
                }, 2000);
              }

              return {
                ...item,
                product_details: {
                  ...item.product_details,
                  ...data,
                },
              };
            }
            return item;
          }
        );
        this.props.market.setSelfSelectSymbolList(newSelfSelectSymbolList);
      }
    };

    //this.wsConnect.onclose = (evt) => {
    //setInterval(function () { that.connectWebsocket() }, 3000)
    //}
  };

  navigateToManagePage = () => {
    this.$f7router.navigate("/market/manage-self-select");
  };

  navigateToSymbolTypePage = () => {
    this.$f7router.navigate("/market/symbol_type");
  };

  navigateToChart = () => {
    const { currentSymbol } = this.state;
    this.$f7router.navigate(`/chart/${currentSymbol.symbol}`, {
      context: currentSymbol,
    });
  };

  navigateToSymbolDetail = () => {
    const { currentSymbol } = this.state;
    this.$f7router.navigate(`/market/symbol/${currentSymbol.id}`, {
      context: currentSymbol,
    });
  };

  addSpecialStyle = (num) => {
    const strs = String(num).split(".");
    if (strs.length > 1) {
      if (strs[1].length > 0) {
        if (strs[1].length < 2) {
          return (
            <>
              <span>{strs[0]}.</span>
              <span className="large-number">{strs[1][0]}</span>
            </>
          );
        } else {
          const last = strs[1].substr(2);
          return (
            <>
              <span>{strs[0]}.</span>
              <span className="large-number">
                {strs[1][0]}
                {strs[1][1]}
              </span>
              {last}
            </>
          );
        }
      } else {
        return <span>{num}</span>;
      }
    }
    return strs[0];
  };
  gotoSelectedTab = (tabBar, id, symbol_type_name, symbol_type_code) => {
    tabBar.goToTab(id);
    if (this.state.subCurrentSymbolType !== symbol_type_name) {
      this.props.common.setSelectedSymbolTypeInfo({ code: symbol_type_code });
    }
  };
  render() {
    // const { selfSelectSymbolList, symbolList } = this.props.market;
    const {
      currentSymbol,
      symbolTypeList,
      currentSymbolType,
      subSymbolTypeList,
      subCurrentSymbolType,
      showSubSymbolType,
      dataLoading,
      hasData,
    } = this.state;
    const { common } = this.props;
    // console.log("symbolTypeList :>> ", symbolTypeList);
    // console.log("currentSymbolType :>> ", currentSymbolType);
    // console.log("this.tabRefs :>> ", this.tabRefs);
    const quoted_price = common.getKeyConfig("quoted_price");
    const price_title = this.getPriceTitle(quoted_price);
    // const currentList = currentSymbolType === "自选" ? selfSelectSymbolList : symbolList;

    const renderTabBar = (tabBar) => {
      // console.log("tabBar :>> ", tabBar);
      return (
        <Navbar className="market-navbar">
          <NavLeft>
            {/* <img className="nav-icon" alt="edit" src={EditIcon} onClick={this.navigateToManagePage} /> */}

            {symbolTypeList.map((item, idx) => {
              return (
                <div
                  key={item.id}
                  ref={(el) => (this.tabRefs[item.id] = el)}
                  onClick={() =>
                    this.gotoSelectedTab(
                      tabBar,
                      idx,
                      item.symbol_type_name,
                      item.symbol_type_code
                    )
                  }
                  className={`market-navbar-item ${
                    currentSymbolType.symbol_type_name ===
                    item.symbol_type_name && "active"
                    }`}
                >
                  {item.symbol_type_name}
                </div>
              );
            })}
          </NavLeft>
          {/* <NavTitle>行情</NavTitle> */}
          <NavRight>
            <img
              className="nav-icon"
              alt="search"
              src={SearchIcon}
              onClick={this.navigateToSymbolTypePage}
            />
            {currentSymbolType.symbol_type_name === "自选" && (
              <img
                className="nav-icon"
                alt="edit"
                src={EditIcon}
                onClick={this.navigateToManagePage}
              />
            )}
          </NavRight>
        </Navbar>
      );
    };
    return (
      <Page noNavbar>
        <Tabs
          initialPage={0}
          tabs={symbolTypeList}
          renderTabBar={renderTabBar}
          // renderTab={(tab) => <span>{tab.symbol_type_name}</span>}
          onChange={this.switchSymbolType}
          tabBarBackgroundColor="transparent"
          tabBarActiveTextColor="#F2E205"
          tabBarInactiveTextColor="#838D9E"
          tabBarUnderlineStyle={{ display: "none" }}
        >
          {symbolTypeList.map((symbolType, idx) => {
            return (
              <React.Fragment key={idx}>
                <div className="self-select-header">
                  {symbolType.symbol_type_name === "自选" ? (
                    <div className="market-type">
                      <p onClick={this.switchShowSubSymbolType}>
                        {subCurrentSymbolType}
                      </p>
                      {showSubSymbolType && (
                        <ul>
                          {subSymbolTypeList.map((item, index) => (
                            <li
                              key={index}
                              className={
                                subCurrentSymbolType ===
                                item.symbol_type_name && "active"
                              }
                              onClick={() => {
                                this.switchSubSelfSelctList(
                                  item.symbol_type_name
                                );
                              }}
                            >
                              {item.symbol_type_name}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                      <div></div>
                    )}
                  {price_title}
                </div>
                <div className="self-select-table">
                  <ProductList
                    currentSymbolType={currentSymbolType.symbol_type_name}
                    symbol_type_code={currentSymbolType.symbol_type_code}
                    dataLoading={dataLoading}
                    channelCode={
                      currentSymbolType.symbol_type_code === "self"
                        ? "SELF"
                        : "NONE"
                    }
                    quoted_price={quoted_price}
                    thisRouter={this.$f7router}
                    thisStore={this.props.market}
                  ></ProductList>
                </div>
              </React.Fragment>
            );
          })}
        </Tabs>
      </Page>
    );
  }

  getPriceTitle = (priceType) => {
    let ret = null;
    if (priceType === "one_price") {
      return (
        <>
          <div>成交价</div>
          <div>涨跌幅</div>
        </>
      );
    } else {
      return (
        <>
          <div>卖出价</div>
          <div>买入价</div>
        </>
      );
    }
  };
}
