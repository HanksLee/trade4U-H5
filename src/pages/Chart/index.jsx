import React from 'react';
import { Page, Navbar } from 'framework7-react';
import TVChartContainer from './TVChartContainer';
import './index.scss';

export default class extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      id: this.$f7route.params.id,
    }
  }

  render() {
    const { id, } = this.state;

    return (
      <Page name="chart">
        <Navbar title="图表" />
        <TVChartContainer />
      </Page>
    );
  }
}
