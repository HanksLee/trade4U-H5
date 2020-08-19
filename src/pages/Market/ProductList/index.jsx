import React from 'react';
import { inject, observer } from "mobx-react";
import { Spin } from 'antd';
import { LoadingOutlined } from "@ant-design/icons";
import moment from 'moment';
import ws from 'utils/ws'
import Dom7 from 'dom7';
import '../index.scss';
import WSConnect from "components/HOC/WSConnect";

const $$ = Dom7;

@inject("common", "market")
@observer
export default class extends React.Component {

  state = {
    dataLoading: this.props.dataLoading,
    currentSymbolType: this.props.currentSymbolType
  }

  constructor(props) {
    super(props)
  }
  componentDidMount() {
    // this.props.setReceviceMsgLinter(this.receviceMsgLinter)

  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.dataLoading !== this.state.dataLoading) {
      this.setState({ dataLoading: nextProps.dataLoading })
    }
    if (nextProps.currentSymbolType !== this.state.currentSymbolType) {
      this.setState({ currentSymbolType: nextProps.currentSymbolType })
    }
  }

  receviceMsgLinter = d => {

    console.log(d)

  }

  render() {
    console.log(this)
    console.log(this.props)
    const { thisRouter } = this.props
    const { selfSelectSymbolList, symbolList } = this.props.market;
    const { currentSymbolType, dataLoading } = this.state;
    const currentList = currentSymbolType === "自选" ? selfSelectSymbolList : symbolList;
    return (
      <>
        {
          currentList.map(item => {
            return (
              <div className="self-select-tr" key={item.symbol} data-id={item.id}
                onClick={() => {
                  thisRouter.navigate(`/market/symbol/${item.id}`, {
                    props: {
                      currentSymbol: item,
                      currentSymbolType
                    }
                  })
                }}
              >
                {/* <div>
              <div className="self-select-buy-sell-block self-select-buy-block">
                {item.product_details.buy ? this.addSpecialStyle(item.product_details.sell) : '--'}
              </div>
              <div className="self-select-low">
                最低:{item.product_details.low ? item.product_details.low : '--'}
              </div>
            </div>
            <div>
              <div className="self-select-buy-sell-block self-select-sell-block">
                {item.product_details.sell ? this.addSpecialStyle(item.product_details.buy) : '--'}
              </div>
              <div className="self-select-high">
                最高:{item.product_details.high ? item.product_details.high : '--'}
              </div>
            </div> */}
                <div className="item-main-info">
                  <div className="self-select-name">{item.symbol_display.name}</div>
                  <div className="self-select-buy-sell-block self-select-buy-block p-down">
                    {item.product_details?.buy}
                  </div>
                  <div className="self-select-buy-sell-block self-select-sell-block p-up">
                    {item.product_details?.sell}
                  </div>
                </div>
                <div className="item-sub-info">
                  <div className="self-select-code">{item.symbol_display.product_display.code}</div>
                  <div className="self-select-spread">
                    點差:{item.symbol_display.spread}
                  </div>
                </div>
              </div>
            )
          })
        }
        {/* {
      currentSymbolType !== "自选" && currentSymbolType !== "外汇" &&
      <>
        <div className="hot-stock-market">热门股票</div>
        <div className="self-select-tr">
          <div className="item-main-info">
            <div className="self-select-name">新创建集团</div>
            <div className="self-select-buy-sell-block self-select-buy-block p-down">
              6.15
              </div>
            <div className="self-select-buy-sell-block self-select-sell-block p-up">
              6.15
              </div>
          </div>
          <div className="item-sub-info">
            <div className="self-select-code">
              <span className="symbol-type-code">US</span>
              <span className="symbol-code">BILI</span>
            </div>
          </div>
        </div>
      </>
    } */}
        {
          (dataLoading && <Spin
            className="spin-icon"
            indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
          />
          )}
      </>
    );
  }
}
