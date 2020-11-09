import * as React from "react";
import { observer, inject } from "mobx-react";
import moment from "moment";
import { BaseReact } from "components/baseComponent";
import utils from "utils";
import { reaction } from "mobx";
import echarts from 'echarts';
import KLineConfig from "./config";

@inject("trend")
@observer
export default class extends BaseReact {
  state = {
    nowRealID: null
  };


  trend = null;
  chartRef = null;
  constructor(props) {
    super(props);
    this.trend = props.trend;
    this.chartRef = React.createRef();
    this.updateChart();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    return {
      ...prevState,
      ...nextProps
    };
  }

  setChart = (KLine) => {
    const kLineConfig = KLineConfig(KLine);
    const kLineChart = echarts.init(this.chartRef);
    kLineChart.setOption(kLineConfig);
  }

  updateChart = () => {
    reaction(
      () => this.props.trend.KLine.data,
      () => {
        this.setChart(this.props.trend.KLine);
      }
    );
  };


  async componentDidMount() {
    const { nowRealID } = this.state;
    const { unit } = this.props;
    const { KLine } = this.props.trend;

    await this.props.trend.fetchTrendList(nowRealID, unit);
    this.setChart(KLine)
  }

  render() {
    return (
      <div
        ref={ref => (this.chartRef = ref)}
        className="symbol-chart-container"
      ></div>
    );
  }
}