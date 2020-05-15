import React from 'react';
import { Page, Navbar, NavLeft, NavTitle, Link, Icon, NavRight } from 'framework7-react';
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

  navigateToTradePage = () => {
    const { id, } = this.state;
    this.$f7router.navigate(`/trade/${id}/`, {
      props: {
        mode: 'add',
      }
    });
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
          {
            id && (
              <NavRight>
                <span onClick={this.navigateToTradePage}>交易</span>
              </NavRight>
            )
          }
        </Navbar>
        <TVChartContainer symbol={id || lastChartSymbol} />
      </Page>
    );
  }
}
