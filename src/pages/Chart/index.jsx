import React from 'react';
import { Page, Navbar, NavLeft, NavTitle, Link, Icon } from 'framework7-react';
import { inject, observer } from "mobx-react";
import TVChartContainer from './TVChartContainer';
import './index.scss';

@inject("common")
@observer
export default class extends React.Component {
  constructor(props) {
    super(props)
    console.log('this.$f7route', this.$f7route);
    const id = this.$f7route.params.id;
    this.state = {
      id,
    }
    if (this.$f7route.params.id) {
      this.props.common.setLastChartSymbol(id);
    }
  }
  
  componentDidMount() {
    setInterval(() => {
      // console.log(this.state.id, this.props.common.lastChartSymbol)
      // if (!this.state.id && this.props.common.lastChartSymbol) {
      // }
    }, 1000);
  }
  

  render() {
    const { id, } = this.state;
    const { lastChartSymbol, } = this.props.common;

    return (
      <Page name="chart" noToolbar={!!id}>
        <Navbar>
          {
            id && (
              <NavLeft>
                <Link back>
                  <Icon color={'white'} f7={'chevron_left'} size={r(18)}></Icon>
                </Link>
              </NavLeft>
            )
          }
          <NavTitle>图表</NavTitle>
        </Navbar>
        <TVChartContainer symbol={id || lastChartSymbol} />
      </Page>
    );
  }
}
