import React from 'react';
import { PageContent, Navbar, NavLeft, NavTitle, Link, Icon, NavRight } from 'framework7-react';
import { inject, observer } from "mobx-react";
import TVChartContainer from './TVChartContainer';
import utils from 'utils';
import './index.scss';

@inject("common")
@observer
export default class extends React.Component {
  constructor(props) {
    super(props)
    const id = this.$f7route.params.id;
    this.state = {
      id,
      lastSymbol: id,
    }
    if (id) {
      utils.setLStorage("LATEST_SYMBOL", id);
    }
  }

  componentDidMount() {
    this.initEvents();
  }

  initEvents = () => {
    this.props.common.globalEvent.on('update-latest-symbol', () => {
      this.updateLatestSymbol();
    });
  }

  updateLatestSymbol = () => {
    this.setState({
      lastSymbol: utils.getLStorage("LATEST_SYMBOL"),
    })
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
    const { id, lastSymbol, } = this.state;

    return (
      <PageContent name="chart" noToolbar={!!id}>
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
        <TVChartContainer symbol={id || lastSymbol} />
      </PageContent>
    );
  }
}
