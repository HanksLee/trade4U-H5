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
    const { selfSelectSymbolList, } = this.props.market;
    this.id = this.$f7route.params.id
    for (let i = 0; i < selfSelectSymbolList.length; i++) {
      debugger
      if (String(selfSelectSymbolList[i].id) === this.id) {
        this.state = {
          symbolDisplay: selfSelectSymbolList[i].symbol_display,
        }
        break
      }
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
          <ListItem title="小数位" after={symbolDisplay.decimals_place} />
          <ListItem title="合约大小" after={symbolDisplay.contract_size} />
          <ListItem title="点差" after={symbolDisplay.spread} />
          <ListItem title="止盈止损位" after={symbolDisplay.limit_stop_level} />
          <ListItem title="预售货币款" after={symbolDisplay.margin_currency} />
          <ListItem title="获利货币" after={symbolDisplay.profit_currency} />
          <ListItem title="最大交易量" after={symbolDisplay.max_trading_volume} />
          <ListItem title="最小交易量" after={symbolDisplay.min_trading_volume} />
          <ListItem title="交易量步长" after={symbolDisplay.volume_step} />
          <ListItem title="价格变动最小单位" after={symbolDisplay.min_unit_of_price_change} />
          <ListItem title="成交模式" after={symbolDisplay.transaction_mode} />
          <ListItem title="买入库存费" after={symbolDisplay.purchase_fee} />
          <ListItem title="卖出库存费" after={symbolDisplay.selling_fee} />
          <ListItem title="三日库存费" after={symbolDisplay.three_days_swap} />
        </List>
      </Page>
    );
  }
}
