import * as React from "react";
import { createChart } from "lightweight-charts";
import defaultChartOption from "./config/option";

export default class BasicChart extends React.Component {
  state = {
    chart: null,
    chartOption: null
  };
  containerRef = null;
  chartStyle = {
    width: "100%",
    height: "100%"
  };

  constructor(props) {
    super(props);
    this.containerRef = React.createRef();
  }
  static getDerivedStateFromProps(nextProps, prevState) {
    return {
      ...prevState,
      ...nextProps
    };
  }
  shouldComponentUpdate(nextProps, nextState) {
    const { chartOption } = this.state;
    const nextChartOption = nextState.chartOption;
    if (
      nextChartOption &&
      (chartOption.width !== nextChartOption.width ||
        chartOption.height !== nextChartOption.height)
    ) {
      nextState.chart.applyOptions(nextChartOption);
    }
    return true;
  }

  render() {
    const { chartStyle } = this;
    const { chart } = this.state;
    const { children } = this.props;
    return (
      <div
        ref={ref => {
          this.containerRef = ref;
        }}
        style={chartStyle}
      >
        {React.Children.map(children, child => {
          return React.cloneElement(child, { chart });
        })}
      </div>
    );
  }

  componentDidMount() {
    const { clientWidth, clientHeight } = this.containerRef;

    const chartOption = {
      ...defaultChartOption,
      width: clientWidth,
      height: clientHeight
    };

    const chart = createChart(this.containerRef, chartOption);
    this.setState({
      chart
    });
  }
  componentDidUpdate(prevProps, prevState) {
    const { chartOption } = this.state;
    const prevChartOption = prevState.chartOption;
    if (
      chartOption &&
      (chartOption.width !== prevChartOption.width ||
        chartOption.height !== prevChartOption.height)
    ) {
      this.state.chart.applyOptions(chartOption);
    }
  }

  //function
  createChartOption = (defaultOption, option) => {
    for (let key in defaultOption) {
      const value = option[key];

      if (value) {
        defaultOption[key] = value;
      }
    }

    return defaultOption;
  };
}
