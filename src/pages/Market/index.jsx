import React from 'react';
import {
  Page, Navbar, NavRight, NavLeft, NavTitle,
  Actions, ActionsLabel, ActionsGroup, ActionsButton
} from 'framework7-react';
import EditIcon from "assets/img/edit2.svg";
import AddIcon from "assets/img/add.svg";
import SearchIcon from "assets/img/search.svg";
import { inject, observer } from "mobx-react";
import { Spin } from 'antd';
import { LoadingOutlined } from "@ant-design/icons";
import moment from 'moment';
import ws from 'utils/ws'
import Dom7 from 'dom7';
import './index.scss';
import channelConfig from "./config/channelConfig";
import WSConnect from "components/HOC/WSConnect";
import ProductList from './ProductList';
import utils from 'utils';

const $$ = Dom7;
const WS_ProductList = WSConnect(channelConfig[0], channelConfig, ProductList);
@inject("common", "market")
@observer
export default class extends React.Component {
  buyTimers = []
  sellTimers = []
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
  }

  async componentDidMount() {
    // this.connectWebsocket();
    this.getSymbolTypeList();
    window.addEventListener("scroll", this.handleScroll, true);

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
      this.wsConnect.close()
    }
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

  switchSymbolType = async (item) => {
    this.setState({ currentSymbolType: item, page: 1, page_size: 20 }, () => {
      this.getList();
    })
  }

  switchShowSubSymbolType = () => {
    const { showSubSymbolType } = this.state;
    this.setState({ showSubSymbolType: !showSubSymbolType })
  }

  switchSubSelfSelctList = (name) => {
    this.setState({ subCurrentSymbolType: name, showSubSymbolType: false, name, page: 1, page_size: 20 }, () => {
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
            symbol_type_name: "自选",
            symbol_type_code: "self"
          },
          ...res.data.results
        ],
        subSymbolTypeList: [
          {
            symbol_type_name: "全部",
          },
          ...res.data.results
        ]
      }, () => {
        this.setState({ currentSymbolType: this.state.symbolTypeList[0] }, () => {
          this.getList()
        })
      });
    }
  };

  connectWebsocket = () => {
    const that = this;
    this.wsConnect = ws('self-select-symbol');

    // setInterval(function () {
    //   that.wsConnect.send(`{"type":"ping"}`);
    // }, 3000)

    this.wsConnect.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const data = message.data
      if (message.type === 'pong') {
        clearInterval(this.interval);

        // 如果一定时间没有调用clearInterval，则执行重连
        this.interval = setInterval(function () {
          that.connectWebsocket();
        }, 1000);
      }
      if (message.type && message.type !== 'pong') { // 消息推送
        // code ...   
        const { selfSelectSymbolList, } = this.props.market
        const newSelfSelectSymbolList = selfSelectSymbolList.map((item, index) => {
          if (item.symbol_display.product_display.code === data.symbol &&
            Number(item.product_details.timestamp) < Number(data.timestamp)) {
            const buyItemDom = $$($$('.self-select-buy-block')[index])
            const sellItemDom = $$($$('.self-select-sell-block')[index])
            if (data.buy > item.product_details.buy) {
              clearTimeout(this.buyTimers[index])
              buyItemDom.removeClass('decrease')
              buyItemDom.addClass('increase')
              this.buyTimers[index] = setTimeout(() => {
                buyItemDom && buyItemDom.removeClass('increase')
              }, 2000);
            } else if (data.buy < item.product_details.buy) {
              clearTimeout(this.buyTimers[index])
              buyItemDom.removeClass('increase')
              buyItemDom.addClass('decrease')
              this.buyTimers[index] = setTimeout(() => {
                buyItemDom && buyItemDom.removeClass('decrease')
              }, 2000);
            }

            if (data.sell > item.product_details.sell) {
              clearTimeout(this.sellTimers[index])
              sellItemDom.removeClass('decrease')
              sellItemDom.addClass('increase')
              this.sellTimers[index] = setTimeout(() => {
                sellItemDom && sellItemDom.removeClass('increase')
              }, 2000);
            } else if (data.sell < item.product_details.sell) {
              clearTimeout(this.sellTimers[index])
              sellItemDom.removeClass('increase')
              sellItemDom.addClass('decrease')
              this.sellTimers[index] = setTimeout(() => {
                sellItemDom && sellItemDom.removeClass('decrease')
              }, 2000);
            }

            return {
              ...item,
              product_details: {
                ...item.product_details,
                ...data,
              }
            }
          }
          return item
        })
        this.props.market.setSelfSelectSymbolList(newSelfSelectSymbolList)
      }

    };

    //this.wsConnect.onclose = (evt) => {
    //setInterval(function () { that.connectWebsocket() }, 3000)
    //}
  }

  navigateToManagePage = () => {
    this.$f7router.navigate('/market/manage-self-select')
  }

  navigateToSymbolTypePage = () => {
    this.$f7router.navigate('/market/symbol_type')
  }

  navigateToChart = () => {
    const { currentSymbol } = this.state
    this.$f7router.navigate(`/chart/${currentSymbol.symbol}`, {
      context: currentSymbol,
    })
  }

  navigateToSymbolDetail = () => {
    const { currentSymbol } = this.state
    this.$f7router.navigate(`/market/symbol/${currentSymbol.id}`, {
      context: currentSymbol,
    })
  }

  addSpecialStyle = (num) => {
    const strs = String(num).split('.')
    if (strs.length > 1) {
      if (strs[1].length > 0) {
        if (strs[1].length < 2) {
          return (
            <>
              <span>{strs[0]}.</span>
              <span className="large-number">{strs[1][0]}</span>
            </>
          )
        } else {
          const last = strs[1].substr(2)
          return (
            <>
              <span>{strs[0]}.</span>
              <span className="large-number">{strs[1][0]}{strs[1][1]}</span>
              {last}
            </>
          )
        }

      } else {
        return <span>{num}</span>
      }
    }
    return strs[0]
  }

  render() {
    // const { selfSelectSymbolList, symbolList } = this.props.market;
    const { currentSymbol, symbolTypeList, currentSymbolType, subSymbolTypeList, subCurrentSymbolType, showSubSymbolType, dataLoading } = this.state;
    // const currentList = currentSymbolType === "自选" ? selfSelectSymbolList : symbolList;
    return (
      <Page name="market">
        <Navbar className="market-navbar">
          <NavLeft>
            {/* <img className="nav-icon" alt="edit" src={EditIcon} onClick={this.navigateToManagePage} /> */}
            {
              symbolTypeList.map((item) => {
                return (
                  <div
                    onClick={() => { this.switchSymbolType(item) }}
                    className={`market-navbar-item ${currentSymbolType.symbol_type_name === item.symbol_type_name && 'active'}`}>
                    {item.symbol_type_name}
                  </div>)
              })
            }
          </NavLeft>
          {/* <NavTitle>行情</NavTitle> */}
          <NavRight>
            <img className="nav-icon" alt="search" src={SearchIcon} onClick={this.navigateToSymbolTypePage} />
            {currentSymbolType.symbol_type_name === "自选" && <img className="nav-icon" alt="edit" src={EditIcon} onClick={this.navigateToManagePage} />}
          </NavRight>
        </Navbar>
        <div className="self-select-table">
          {
            <div className="self-select-table-header">
              {currentSymbolType.symbol_type_name === "自选" ?
                <div className="market-type">
                  <p onClick={this.switchShowSubSymbolType}>{subCurrentSymbolType}</p>
                  {showSubSymbolType &&
                    <ul>
                      {subSymbolTypeList.map((item, index) => (
                        <li
                          className={subCurrentSymbolType === item.symbol_type_name && "active"}
                          onClick={() => { this.switchSubSelfSelctList(item.symbol_type_name) }}>
                          {item.symbol_type_name}
                        </li>
                      ))}
                    </ul>}
                </div>
                : <div></div>}
              <div>卖出价</div>
              <div>买入价</div>
            </div>
          }
          <WS_ProductList
            currentSymbolType={currentSymbolType.symbol_type_name}
            symbol_type_code={currentSymbolType.symbol_type_code}
            dataLoading={dataLoading}
            channelCode={currentSymbolType.symbol_type_code === "self" ? "SELF" : "NONE"}
            thisRouter={this.$f7router}
          >

          </WS_ProductList>
        </div>
      </Page>
    );
  }
}
