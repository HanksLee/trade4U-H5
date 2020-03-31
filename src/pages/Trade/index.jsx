import React from 'react';
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
import './index.scss';

import Dom7 from 'dom7';

const $$ = Dom7;

export default class extends React.Component {
  state = {
    title: '交易',
    tapIndex: -1,
    longTapIndex: -1,
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
    console.log('mounted')

    this.initData();
  }

  initData = () => {
    if (this.state.loading) return;

    this.setState({
      loading: true,
    }, () => {
      setTimeout(() => {
        this.setState({loading: false});
      }, 3000);
    });

    $$('.media-list').on('taphold', (evt) => {
      // console.log('target', evt.target);
      const dom = $$(evt.target).parents('.media-item')[0];
      console.log('dom', dom.id)

      if (dom != null) {
        this.setState({
          longTapIndex: dom.id,
        }, () => {
          this.refs.actionsGroup.open();
        })
      }

    })
  }

  renderStats = () => {
    return 'hello';
  }

  onTrade = () => {

  }

  onModify = () => {

  }

  onCreate = () => {

  }

  viewChart = () => {

  }

  loadMore = (done) => {
    const self = this;
    setTimeout(() => {
      const { items, songs, authors } = self.state;
      const picURL = `https://cdn.framework7.io/placeholder/abstract-88x88-${(Math.floor(Math.random() * 10) + 1)}.jpg`;
      const song = songs[Math.floor(Math.random() * songs.length)];
      const author = authors[Math.floor(Math.random() * authors.length)];
      items.push({
        title: song,
        author,
        cover: picURL,
      });
      self.setState({ items });

      done();
    }, 1000);
  }

  render() {
    const {title, tapIndex, loading} = this.state;

    return (
      <Page name="trade" className='trade-page' ptr onPtrRefresh={this.loadMore}>
        <Navbar>
          <NavTitle>{title}</NavTitle>
          <NavRight>
            <Link>
              <Icon color={'white'} f7={'plus'} size={r(16)}></Icon>
            </Link>
          </NavRight>
        </Navbar>
        <Block strong className={`trade-stats ${loading ? 'skeleton-text skeleton-effect-blink' : ''}`}>
          <Row className={'trade-stats-row'}>
            <Col width="33" className={'trade-stats-col'}>
              <p>结余</p>
              <p>{123}</p>
            </Col>
            <Col width="33" className={'trade-stats-col'}>
              <p>净值</p>
              <p>{123}</p>
            </Col>
            <Col width="33"></Col>
          </Row>
          <Row className={'trade-stats-row'}>
            <Col width="33" className={'trade-stats-col'}>
              <p>预付款</p>
              <p>{123}</p>
            </Col>
            <Col width="33" className={'trade-stats-col'}>
              <p>可用预付款</p>
              <p>{123}</p>
            </Col>
            <Col width="33" className={'trade-stats-col'}>
              <p>预付款比率(%)</p>
              <p>{123}</p>
            </Col>
          </Row>

        </Block>
        <List mediaList>
          {this.state.items.map((item, index) => (
            <ListItem
              // dataItem={item}
              id={index}
              key={index}
              swipeout
              className={`trade-data ${loading ? 'skeleton-text skeleton-effect-blink' : ''}`}
              onTapHold={
                () => {
                  this.$f7.dialog.alert('Tap hold fired!');
                }
              }
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
                <strong>EURUSD,</strong>
                <span className={`p-down`}>sell 0.001</span>
              </div>
              <div slot={'subtitle'} className={'trade-data-middle'}>
                <Row className={'align-items-center'}>
                  <Col width={'60'} className={`p-down trade-data-middle-current`}>
                    -0.50
                  </Col>
                  <Col width={'20'}>
                    <p>开盘</p>
                    <p className={'p-down'}>110.232</p>
                  </Col>
                  <Col width={'20'}>
                    <p>目前</p>
                    <p className={`p-up`}>12321</p>
                  </Col>
                </Row>
              </div>
              <div slot={'footer'} className={`trade-data-bottom ${tapIndex == index ? 'active' : ''}`}>
                <Row>
                  <Col width={'100'}>
                    {moment().format('YYYY.MM.DD HH:mm:ss')}
                  </Col>
                </Row>
                <Row>
                  <Col width={'50'}>
                    <span>止损：</span>
                    <span>-</span>
                  </Col>
                  <Col width={'50'}>
                    <span>库存费：</span>
                    <span>-</span>
                  </Col>
                </Row>
                <Row>
                  <Col width={'50'}>
                    <span>获利：</span>
                    <span>-</span>
                  </Col>
                  <Col width={'50'}>
                    <span>税费：</span>
                    <span>-</span>
                  </Col>
                </Row>
                <Row>
                  <Col width={'50'}>
                    <span>ID：</span>
                    <span>-</span>
                  </Col>
                  <Col width={'50'}>
                    <span>手续费：</span>
                    <span>-</span>
                  </Col>
                </Row>
              </div>
              <SwipeoutActions right>
                <SwipeoutButton bgColor={'primary'} onClick={this.onTrade}>
                  <Icon f7={'checkmark_alt_circle'} size={r(16)}></Icon>
                </SwipeoutButton>
                <SwipeoutButton bgColor={'primary'} onClick={this.onModify}>
                  <Icon f7={'pencil'} size={r(16)}></Icon>
                </SwipeoutButton>
                <SwipeoutButton bgColor={'primary'} onClick={this.onCreate}>
                  <Icon f7={'plus'} size={r(16)}></Icon>
                </SwipeoutButton>
                <SwipeoutButton bgColor={'primary'} onClick={this.viewChart}>
                  <Icon f7={'chart_bar_alt_fill'} size={r(16)}></Icon>
                </SwipeoutButton>
              </SwipeoutActions>
            </ListItem>
          ))}
        </List>
        <Actions ref="actionsGroup">
          <ActionsGroup>
            <ActionsLabel>Do something</ActionsLabel>
            <ActionsButton bold>Button 1</ActionsButton>
            <ActionsButton>Button 2</ActionsButton>
          </ActionsGroup>
          <ActionsGroup>
            <ActionsButton color="red">Cancel</ActionsButton>
          </ActionsGroup>
        </Actions>
      </Page>
    );
  }
}
