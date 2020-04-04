import api from 'services';
import React from 'react';
import {
  Page, Navbar, List, ListItem, Block,
  NavTitle,
  NavLeft,
  Icon,
  Link,
} from 'framework7-react';
import { inject, observer } from "mobx-react";
import './index.scss';

@inject("market")
@observer
export default class extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      symbolDisplay: this.$f7route.context.symbol_display,
    }
  }
  
  render() {
    const { symbolDisplay } = this.state;
    return (
      <Page noToolbar>
        <Navbar>
          <NavLeft>
            <Link back>
              <Icon color={'white'} f7={'chevron_left'} size={r(18)}></Icon>
            </Link>
          </NavLeft>
          <NavTitle>{symbolDisplay.name}</NavTitle>
        </Navbar>
        {
          symbolDisplay.description && (
            <Block className="symbol-display-block">
              <p>{symbolDisplay.description}</p>
            </Block>
          )
        }
        <List>
          <ListItem title="点差" after={symbolDisplay.spread} />
          <ListItem title="小数点位" after={symbolDisplay.decimals_place} />
          <ListItem title="合约数量" after={symbolDisplay.contract_size} />
        </List>
      </Page>
    );
  }
}
