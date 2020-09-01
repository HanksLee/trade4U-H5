import React from 'react';
import {
  Page, Navbar, NavRight, NavLeft, NavTitle,
} from 'framework7-react';
import { Tabs } from "antd-mobile";
import { inject, observer } from "mobx-react";
import { Spin } from 'antd';
import { LoadingOutlined } from "@ant-design/icons";
import moment from 'moment';
import Dom7 from 'dom7';
import './index.scss';
import utils from 'utils';

@inject("common", "market")
@observer
export default class extends React.Component {
  state = {
    symbolTypeList: [],
    currentSymbolType: "",
    error: false,
    hasMore: true,
    dataLoading: false,
    page_size: 20,
    page: 1,
  }

  async componentDidMount() {
    this.getSymbolTypeList();
    // this.switchActiveDot(0);
    // window.addEventListener("scroll", this.handleScroll, true);
  }

  componentDidUpdate() {
    this.switchActiveDot(0);
  }

  handleScroll = () => {
    const { error, hasMore, dataLoading } = this.state;

    // Bails early if:
    // * there's an error
    // * it's already loading
    // * there's nothing left to load
    if (error || dataLoading || !hasMore) return;
    let scrollTop = $$("#view-market .page-content")[0].scrollTop;
    let scrollHeight = $$("#view-market .page-content")[0].scrollHeight;

    // Checks that the page has scrolled to the bottom
    if (window.innerHeight + scrollTop >= scrollHeight) {
      this.getList();
    }
  };

  getList = async () => {
    const { currentSymbolType, subCurrentSymbolType, page, page_size } = this.state;
    const { moveSymbolIDList, nextSymbolIDList } = this.props.market;
    if (currentSymbolType.symbol_type_name === "自选") {
      if (subCurrentSymbolType === "全部") {
        this.setState({ dataLoading: true }, async () => {
          let queryString = `page=${page}&page_size=${page_size}`
          await this.props.market.getSelfSelectSymbolList(queryString, page === 1 ? true : false);
          this.setState({ dataLoading: false, page: page + 1 }, () => {
            const { selfSelectSymbolList, selfSelectSymbolListCount } = this.props.market;
            this.setState({ hasMore: selfSelectSymbolList.length < selfSelectSymbolListCount })
          })
        })
      } else {
        this.setState({ dataLoading: true }, async () => {
          let queryString = `type__name=${subCurrentSymbolType}&page=${page}&page_size=${page_size}`;
          await this.props.market.getSelfSelectSymbolList(queryString, page === 1 ? true : false);
          this.setState({ dataLoading: false, page: page + 1 }, () => {
            const { selfSelectSymbolList, selfSelectSymbolListCount } = this.props.market;
            this.setState({ hasMore: selfSelectSymbolList.length < selfSelectSymbolListCount })
          })
        })
      }
    } else {
      this.setState({ dataLoading: true }, async () => {

        let queryString = `type__name=${currentSymbolType.symbol_type_name}&page=${page}&page_size=${page_size}`;
        await this.props.market.getSymbolList(queryString, page === 1 ? true : false)
        this.setState({ dataLoading: false, page: page + 1 }, () => {
          const { symbolList, symbolListCount } = this.props.market;
          this.setState({ hasMore: symbolList.length < symbolListCount })
        })

        if (!utils.isEmpty(nextSymbolIDList)) {
          moveSymbolIDList(nextSymbolIDList)
        }

      })
    }
  }

  switchActiveDot = (index) => {
    const { symbolTypeList } = this.state;
    let tabItemWidth = 100 / symbolTypeList.length;
    let tabActiveLeft = `calc(${tabItemWidth * index + tabItemWidth / 2}% - 3px)`;
    if (document.getElementsByClassName("tab-active-dot")[0]) {
      document.getElementsByClassName("tab-active-dot")[0].style.left = tabActiveLeft;
    }

  }

  onChangeTabs = (tab, index) => {
    // console.log('onChange', index, tab);
    this.switchActiveDot(index);
  }

  onClickTabs = (tab, index) => {
    // console.log('onTabClick', index, tab);
    this.switchActiveDot(index);
  }

  switchSymbolType = async (item) => {
    this.setState({ currentSymbolType: item, page: 1, page_size: 20 }, () => {
      this.getList();
    })
  }

  getSymbolTypeList = async () => {
    const res = await this.props.common.$api.market.getSymbolTypeList();

    if (res.status == 200) {
      this.setState({
        symbolTypeList: [
          {
            id: 0,
            symbol_type_name: "推荐",
            symbol_type_code: "all"
          },
          ...res.data.results
        ]
      }, () => {
        this.setState({ currentSymbolType: this.state.symbolTypeList[0] }, () => {
          // this.switchActiveDot(0);
          // this.getList()

        })
      });
    }
  };

  navigateToSymbolDetail = () => {
    const { currentSymbol } = this.state
    this.$f7router.navigate(`/market/symbol/${currentSymbol.id}`, {
      context: currentSymbol,
    })
  }

  render() {
    const { symbolTypeList, currentSymbolType, dataLoading } = this.state;
    console.log(symbolTypeList)
    return (
      <Page name="news">
        <Navbar className="news-navbar">
          <NavLeft>
          </NavLeft>
          <NavTitle>新闻</NavTitle>
          <NavRight>
          </NavRight>
        </Navbar>
        {!utils.isEmpty(symbolTypeList) && <div className="tab-active-bar">
          <span className="tab-active-dot"></span>
        </div>}
        <Tabs tabs={symbolTypeList}
          initialPage={0}
          renderTab={tab => <span>{tab.symbol_type_name}</span>}
          onChange={this.onChangeTabs}
          onTabClick={this.onClickTabs}
          tabBarBackgroundColor="transparent"
          tabBarActiveTextColor="#F2E205"
          tabBarInactiveTextColor="#838D9E"
          tabBarUnderlineStyle={{
            display: "none"
          }}
        >
          <div className="news-content">
            <div class="news-content-item">
              <div className="news-content-item-text">
                <p>港股异动︱中天国际(02379)涨超142% 与水发民生订立战略合作框架协议</p>
                <p>2020/2/20 13:00:00</p>
              </div>
              <div className="news-content-item-img"></div>
            </div>
          </div>
        </Tabs>
      </Page >
    );
  }
}
