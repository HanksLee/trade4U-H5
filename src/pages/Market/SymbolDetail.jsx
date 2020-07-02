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
          <ListItem title="小数点位" after={String(symbolDisplay.decimals_place)} />
          <ListItem title="合约大小" after={String(symbolDisplay.contract_size)} />
          <ListItem title="点差" after={String(symbolDisplay.spread)} />
          <ListItem title="预付款货币" after={symbolDisplay.margin_currency_display} />
          <ListItem title="获利货币" after={symbolDisplay.profit_currency_display} />
          <ListItem title="最小交易手数" after={String(symbolDisplay.min_lots)} />
          <ListItem title="最大交易手数" after={String(symbolDisplay.max_lots)} />
          <ListItem title="交易数步长" after={String(symbolDisplay.lots_step)} />
          <ListItem title="买入库存费" after={String(symbolDisplay.purchase_fee)} />
          <ListItem title="卖出库存费" after={String(symbolDisplay.selling_fee)} />
        </List>
      </Page>
    );
  }
}
