import React from 'react';
import {BaseReact} from "components/baseComponent";
import {
  Page,
  Navbar,
  List,
  ListItem,
  NavRight,
  NavTitle,
  Link,
  Card,
  Icon,
  Block,
  Row,
  Col,
  BlockFooter,
  SwipeoutActions,
  SwipeoutButton,
  BlockTitle,
  Actions,
  ActionsGroup,
  ActionsLabel,
  ActionsButton,
} from 'framework7-react';
import moment from 'moment';
import { inject, observer } from "mobx-react";
import './index.scss';
import ws from 'utils/ws'
import {tradeActionMap} from 'constant';
import utils from 'utils';
import cloneDeep from 'lodash/cloneDeep';


@inject("common", 'trade')
@observer
export default class extends BaseReact {
  wsConnect = null;
  state = {
    title: '交易',
    tapIndex: -1,
    // currentTrade: null,
    loading: false,
    effect: null,
    items: [
      {
        title: 'Yellow Submarine',
        author: 'Beatles',
        cover: 'https://cdn.framework7.io/placeholder/abstract-88x88-1.jpg',
      },
      {
        title: 'Don\'t Stop Me Now',
        author: 'Queen',
        cover: 'https://cdn.framework7.io/placeholder/abstract-88x88-2.jpg',
      },
      {
        title: 'Billie Jean',
        author: 'Michael Jackson',
        cover: 'https://cdn.framework7.io/placeholder/abstract-88x88-3.jpg',
      },
    ],
    songs: ['Yellow Submarine', 'Don\'t Stop Me Now', 'Billie Jean', 'Californication'],
    authors: ['Beatles', 'Queen', 'Michael Jackson', 'Red Hot Chili Peppers'],
  };

  // constructor() {
  //   super();
  //
  // }

  componentDidMount() {
    this.initData();
    this.connectWebsocket();
  }

  initData = () => {
    if (this.state.loading) return;

    this.onRefresh();

    this.$f7.$('.media-list').on('taphold', (evt) => {
      const {tradeList} = this.props.trade;
      const dom = this.$f7.$(evt.target).parents('.media-item')[0];
      if (dom != null) {
        this.props.trade.setCurrentTrade(tradeList[dom.id]);

        this.setState({
          longTapIndex: dom.id,
        }, () => {
          this.refs.actionsGroup.open();
        })
      }
    })
  }

  connectWebsocket = () => {
    this.wsConnect = ws('order');

    const {
      setTradeInfo,
      setTradeList,
    } = this.props.trade;

    this.wsConnect.onmessage = evt => {
      const msg = JSON.parse(evt.data);

      if (msg.type == 'meta_fund') {
        setTradeInfo(msg.data);
      } else {
        let list = cloneDeep(this.props.trade?.tradeList);
        if (msg.type == 'order_open') {
          list = [msg.data, ...list];
        } else if (msg.type == 'order_profit') {
          list = list.map(item => {
            if (item.order_number == msg.data.order_number) {
              item = msg.data;
            }
            return item;
          });
        } else if (msg.type == 'order_close' || msg.type == 'pending_order_close') {
          list = list.filter(item => item.order_number != msg.data.order_number);
        }
        setTradeList(list);
      }
    }
  }

  componentWillUnmount = () => {
    if (this.wsConnect) {
      this.wsConnect.close()
    }
  }

  goToPage = (url, opts = {}) => {
    // this.$f7router.navigate(url, opts);

    this.$f7.router.app.views.main.router.navigate(url, opts);
  }

  onRefresh = async (done) => {
    this.setState({
      loading: true,
    }, async () => {
      try {
        await this.props.trade.getTradeInfo();
        const res2 = await Promise.all([
          this.$api.trade.getTradeList({
            params: {
              status: 'in_transaction',
            }
          }),
          this.$api.trade.getTradeList({
            params: {
              status: 'pending',
            }
          }),
        ]);

        const list = res2.map(item => item.data);
        this.props.trade.setTradeList([...list[0], ...list[1]]);
      } catch (e) {
        this.$f7.toast.show({
          text: e.message,
          position: 'center',
          closeTimeout: 2000,
        });
      }

      this.setState({loading: false});
      done && done();
    });
  }

  render() {
    const {title, tapIndex, loading} = this.state;
    const {tradeInfo, tradeList, computedTradeList, currentTrade} = this.props.trade;
    const initSymbol = utils.isEmpty(tradeList) ? 0 : tradeList[0]?.symbol;

    return (
      <Page name="trade" className='trade-page' ptr onPtrRefresh={this.onRefresh}>
        <Navbar>
          <NavTitle>{title}</NavTitle>
          <NavRight>
            <Link  onClick={ () => this.goToPage(`/trade/${initSymbol}/`, {
              props: {
                mode: 'add'
              }
            })}>
              <Icon color={'white'} f7={'plus'} size={r(18)}></Icon>
            </Link>
          </NavRight>
        </Navbar>
        <Block strong className={`trade-stats ${loading ? 'skeleton-text skeleton-effect-blink' : ''}`}>
          <Row className={'trade-stats-row'}>
            <Col width="33" className={'trade-stats-col'}>
              <p>结余</p>
              <p>{tradeInfo.balance}</p>
            </Col>
            <Col width="33" className={'trade-stats-col'}>
              <p>净值</p>
              <p>{tradeInfo.equity}</p>
            </Col>
            <Col width="33"></Col>
          </Row>
          <Row className={'trade-stats-row'}>
            <Col width="33" className={'trade-stats-col'}>
              <p>预付款</p>
              <p>{tradeInfo.margin}</p>
            </Col>
            <Col width="33" className={'trade-stats-col'}>
              <p>可用预付款</p>
              <p>{tradeInfo.free_margin}</p>
            </Col>
            <Col width="33" className={'trade-stats-col'}>
              <p>预付款比率(%)</p>
              <p>{tradeInfo.margin_level}</p>
            </Col>
          </Row>

        </Block>
        <List mediaList>
          {computedTradeList.map((item, index) => (
            <ListItem
              // dataItem={item}
              id={index}
              key={index}
              swipeout
              className={`trade-data ${loading ? 'skeleton-text skeleton-effect-blink' : ''}`}
              onSwipeoutOpen={() => {
                this.props.trade.setCurrentTrade(item);
              }}
              // onSwipeoutClose={() => {
              //   debugger
              //   this.props.trade.setCurrentTrade({});
              // }}
              onClick={
                () => {
                  this.setState({
                    tapIndex: tapIndex == index ? -1 : index,
                  })
                }
              }
            >
              {/*<img slot="media" src={item.cover} width="44" />*/}
              <div slot={'title'} className={'trade-data-top'}>
                <strong>{item.symbol_name},</strong>
                <span className={`p-down`}>{tradeActionMap[item.action]} {item.lots}</span>
              </div>
              <div slot={'subtitle'} className={'trade-data-middle'}>
                <Row className={'align-items-center'}>
                  <Col width={'60'} className={`${item.profit > 0 ? 'p-up' : item.profit < 0 ? 'p-down' : 'p-grey'} trade-data-middle-current`}>
                    <p>{item.profit}</p>
                  </Col>
                  <Col width={'20'}>
                    <p>开盘</p>
                    <p className={'p-down'}>{item.open_price}</p>
                  </Col>
                  <Col width={'20'}>
                    <p>目前</p>
                    <p className={`p-up`}>{item.new_price}</p>
                  </Col>
                </Row>
              </div>
              <div slot={'footer'} className={`trade-data-bottom ${tapIndex == index ? 'active' : ''}`}>
                <Row>
                  <Col width={'100'}>
                    {moment(item.create_time * 1000).format('YYYY.MM.DD HH:mm:ss')}
                  </Col>
                </Row>
                <Row>
                  <Col width={'50'}>
                    <span>止损：</span>
                    <span>{item.stop_loss || '-'}</span>
                  </Col>
                  <Col width={'50'}>
                    <span>库存费：</span>
                    <span>{item.swaps || '-'}</span>
                  </Col>
                </Row>
                <Row>
                  <Col width={'50'}>
                    <span>止盈：</span>
                    <span>{item.take_profit || '-'}</span>
                  </Col>
                  <Col width={'50'}>
                    <span>税费：</span>
                    <span>{item.taxes || '-'}</span>
                  </Col>
                </Row>
                <Row>
                  <Col width={'50'}>
                    <span>ID：</span>
                    <span>{item.symbol}</span>
                  </Col>
                  <Col width={'50'}>
                    <span>手续费：</span>
                    <span>{item.fee || '-'}</span>
                  </Col>
                </Row>
              </div>
              <SwipeoutActions right>
                <SwipeoutButton bgColor={'primary'} onClick={() => this.goToPage(`/trade/${item.symbol}/`, {
                  props: {
                    mode: 'close'
                  }
                })}>
                  <Icon f7={'checkmark_alt_circle'} size={r(16)}></Icon>
                </SwipeoutButton>
                <SwipeoutButton bgColor={'primary'} onClick={
                  () => this.goToPage(`/trade/${item.symbol}/`, {props: {
                    mode: 'update',
                  }})
                }>
                  <Icon f7={'pencil'} size={r(16)}></Icon>
                </SwipeoutButton>
                <SwipeoutButton bgColor={'primary'} onClick={ () => this.goToPage(`/trade/${item.symbol}/`, {
                  props: {
                    mode: 'add'
                  }
                })}>
                  <Icon f7={'plus'} size={r(16)}></Icon>
                </SwipeoutButton>
                <SwipeoutButton bgColor={'primary'} onClick={() => this.goToPage(`/chart/${item.symbol}/`)}>
                  <Icon f7={'chart_bar_alt_fill'} size={r(16)}></Icon>
                </SwipeoutButton>
              </SwipeoutActions>
            </ListItem>
          ))}
        </List>
        <Actions ref="actionsGroup" onActionsClose={() => {
          this.props.trade.setCurrentTrade(currentTrade);
        }}>
          <ActionsGroup>
            <ActionsLabel>
              {
                `交易：${currentTrade?.symbol_name}, ${tradeActionMap[currentTrade?.action]} ${currentTrade?.profit}`
              }
            </ActionsLabel>
            <ActionsButton color={'red'}>
              <span onClick={() => this.goToPage(`/trade/${currentTrade?.symbol}/`, {
                props: {
                  mode: 'close'
                }
              })}>
                平仓
              </span>
            </ActionsButton>
            <ActionsButton>
              <span onClick={ () => this.goToPage(`/trade/${currentTrade?.symbol}/`, {props: {
                mode: 'update',
                }})}>修改</span>
            </ActionsButton>
            <ActionsButton>
              <span onClick={ () => this.goToPage(`/trade/${currentTrade?.symbol}/`, {
                props: {
                  mode: 'add'
                }
              })}>交易</span>
            </ActionsButton>
            <ActionsButton>
              <span onClick={() => this.goToPage(`/chart/${currentTrade?.symbol}/`)}>图表</span>
            </ActionsButton>
          </ActionsGroup>
          <ActionsGroup>
            <ActionsButton>取消</ActionsButton>
          </ActionsGroup>
        </Actions>
      </Page>
    );
  }
}
