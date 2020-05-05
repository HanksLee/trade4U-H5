import React from 'react';
import { Page, Navbar, List, ListItem } from 'framework7-react';
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
        {
          id ? <span>敬请期待</span> : <span>暂无图表数据</span>
        }
      </Page>
    );
  }
}
