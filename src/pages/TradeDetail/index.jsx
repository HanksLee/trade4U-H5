import React from 'react';
import {
  Page, Navbar, List, ListItem,
  NavTitle,
  NavRight,
  NavLeft,
  Icon,
  Link,
  Block,
  AccordionItem,
  AccordionToggle,
  AccordionContent,
  Stepper,
  Row,
  Col,
} from 'framework7-react';
import {tradeTypeOptions} from 'constant';
import { createChart } from 'lightweight-charts';
import echarts from 'echarts';
import moment from 'moment';

import './index.scss';

function randomData() {
  now = new Date(+now + oneDay);
  value = value + Math.random() * 21 - 10;
  return {
    name: now.toString(),
    value: [
      [now.getFullYear(), now.getMonth() + 1, now.getDate()].join('/'),
      Math.round(value)
    ]
  };
}

var data = [];
var now = +new Date(1997, 9, 3);
var oneDay = 24 * 3600 * 1000;
var value = Math.random() * 1000;
for (var i = 0; i < 1000; i++) {
  data.push(randomData());
}


var data2 = [];
var now = +new Date(1997, 9, 3);
var oneDay = 24 * 3600 * 1000;
var value = Math.random() * 1000;
for (var i = 0; i < 1000; i++) {
  data2.push(randomData());
}

export default class extends React.Component {
  state = {
    currentTradeType: tradeTypeOptions[0],
    opened: false,

    chartOption: {
      title: {
        text: ''
      },
      backgroundColor: 'white',
      grid: {
        right: '14s%',
      },
      tooltip: {
        trigger: 'axis',
        formatter: function (params) {
          params = params[0];
          var date = new Date(params.name);
          // return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' : ' + params.value[1];

          return moment(date).foramt('YYYY.MM.DD HH:mm:ss')
        },
        axisPointer: {
          animation: false
        }
      },
      xAxis: {
        show: false,
        type: 'time',
        splitLine: {
          show: false
        }
      },
      yAxis: {
        position: 'right',

        type: 'value',
        boundaryGap: [0, '100%'],
        splitLine: {
          show: true,
          lineStyle:{
            type:'dashed'
          }

        }
      },
    },
  }

  componentDidMount() {
    this.initChart();

  }

  initChart = () => {
    var myChart = echarts.init(document.querySelector('.chart'));
// 绘制图表
    const {chartOption } = this.state;
    myChart.setOption({
      ...chartOption,
      series: [{
        name: '模拟数据',
        type: 'line',
        showSymbol: false,
        hoverAnimation: false,
        data: data,
        lineStyle: {
          color: '#44d7b6',
        }
      }, {
        name: '模拟数据',
        type: 'line',
        showSymbol: false,
        hoverAnimation: false,
        data: data2,
        lineStyle: {
          color: '#e94a39',
        },
      }]
    });
  }

  onTradeTypeChanged = (currentTradeType) => {
    this.setState({
      currentTradeType,
    });
    this.toggleTypePanel();
  }

  toggleTypePanel = () => {
    this.setState({
      opened: !this.state.opened,
    })
  }


  render() {
    console.log(this.props);
    const {id, mode} = this.props;
    const {currentTradeType, opened} = this.state;


    return (
      <Page name="trade-detail" className={'trade-detail'}>
        <Navbar>
          <NavLeft>
            <Link onClick={() => this.$f7router.back()}>
              <Icon color={'white'} f7={'chevron_left'} size={r(18)}></Icon>
            </Link>
          </NavLeft>
          <NavTitle>
            <span style={{marginRight: r(8)}} onClick={
              () => {
                this.$f7router.navigate('/products/', {
                  props: {
                    selectedId: id,
                    mode,
                  }
                });
              }
            }>
              {'USDAUS'}
            </span>
            <Icon color={'white'} f7={'arrowtriangle_down_fill'} size={r(10)}></Icon>
          </NavTitle>
        </Navbar>
        <section>
          <div className={`trade-detail-title ${currentTradeType.color}`} onClick={this.toggleTypePanel}>
            {currentTradeType.name}
          </div>
          <div className={`trade-detail-type ${opened ? 'active' : ''}`}>
            {
              tradeTypeOptions.map((item) => {
                return (
                    <div className={`trade-detail-type-item ${item.color}`} style={{
                      display: currentTradeType.id == item.id ? 'none' : 'block',

                    }} key={item.id} onClick={() => this.onTradeTypeChanged(item)}>
                      {item.name}
                    </div>
                )
              })
            }
          </div>
        </section>
          <List simple-list>
            <ListItem title='价格' style={{
              display: currentTradeType.id != 1 ? 'block' : 'none',
            }}>
              <Stepper step={1} small onStepperChange={(evt) => {
                console.log('evt', evt);

              }}></Stepper>
            </ListItem>
            <ListItem title="止损">
              <Stepper step={1} small onStepperChange={(evt) => {
                console.log('evt', evt);

              }}></Stepper>
            </ListItem>
            <ListItem title="获利">
              <Stepper step={1} small onStepperChange={(evt) => {
                console.log('evt', evt);

              }}></Stepper>
            </ListItem>
          </List>
          <Row noGap className={'trade-detail-price'}>
            <Col width={'50'} className={'p-down'}>
              1.22
              <strong>33</strong>
              0
            </Col>
            <Col width={'50'} className={`p-up`}>
              22.
              <strong>21</strong>
              3
            </Col>
          </Row>
          <Row noGap className={'trade-detail-actions'}>
            <Col width={'50'} className={'bg-down trade-detail-action'}>
              <span>
                Sell
              </span>
            </Col>
            <Col width={'50'} className={`bg-up trade-detail-action`}>
              <span>
                Buy
               </span>
            </Col>
          </Row>
        <div className={'chart'}></div>
      </Page>
    );
  }
}
