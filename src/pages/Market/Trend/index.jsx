import * as React from "react";
import { observer, inject } from "mobx-react";
import { autorun, reaction, toJS } from "mobx";

import { Row, Col } from "antd";

import moment from "moment";

import { BaseReact } from "components/baseComponent";
import { BasicChart, AreaSeries } from "components/Chart";
import {
  URLREPLACE, // Url 切換
} from "utils/WebSocketControl/status";

import utils from "utils";

@inject("trend")
@observer
export default class extends BaseReact {
  state = {
    nowRealID: null
  };

  initDate = null;
  trend = null;
  chartRef = null;
  chartOption = {
    width: 0,
    height: 500
  };
  constructor(props) {
    super(props);

    this.trend = props.trend;
    this.chartRef = React.createRef();
    this.initDate =  this.getDateString();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    return {
      ...prevState,
      ...nextProps
    };
  }

  render() {
    const { trendList, trendUpdateList } = this.trend;
    const { nowRealID } = this.state;
    return (
      <div
        ref={ref => (this.chartRef = ref)}
        className="symbol-chart-container"
      >
        <BasicChart chartOption={this.chartOption}>
          <AreaSeries symbol={nowRealID} initList={trendList} updateList={trendUpdateList} />
        </BasicChart>
      </div>
    );
  }

  componentDidMount() {
    const { nowRealID } = this.state;
    const { unit } = this.props;
    this.chartOption = {
      width: this.chartRef.clientWidth,
      height: this.chartRef.clientHeight - 50
    };
    this.props.trend.fetchTrendList(nowRealID, unit);
    const { setReceviceMsgLinter, setStatusChangeListener, } = this.props;
    setReceviceMsgLinter(this.receviceMsgLinter);
    setStatusChangeListener(this.statusChangListener);
  }

  componentDidUpdate(prevProps, prevState) {
    // console.log("test")
    const { nowRealID } = this.state;
    // console.log(nowRealID)
    // console.log("new new test")
    if (!nowRealID || nowRealID === prevState.nowRealID) return;
    this.chartOption = {
      width: this.chartRef.clientWidth,
      height: this.chartRef.clientHeight - 50
    };
    // console.log("new test")
    const { unit } = this.props;
    this.clearBuffer();
    // console.log("old trend")
    this.trend.fetchTrendList(nowRealID, unit);
    // console.log("trend")
  }

  //function

  receviceMsgLinter = list => {
    // console.log(d)
    const { unit } = this.props;
    const {nowRealID} = this.state;

    const newList = this.sortList(list);

    const lastDate = this.getDateString();

    if(this.initDate === lastDate){
      this.trend.setTrendUpdateList(newList);
    }
    else{
      this.props.trend.fetchTrendList(nowRealID, unit);
      this.initDate = this.getDateString();
    }

 
  };

  statusChangListener = (before, next) => {

  };



  sortList = list => {
    const tmp = Object.assign([], list);

    tmp.sort((a, b) => {
      if (a.timestamp > b.timestamp) {
        return 1;
      }

      if (a.timestamp < b.timestamp) {
        return -1;
      }

      if (a.timestamp === b.timestamp) {
        return 0;
      }
    });

    return tmp;
  };


  getDateString = ()=>{
    return moment().format("YYYY/MM/d");
  }
}
