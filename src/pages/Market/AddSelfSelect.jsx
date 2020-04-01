import api from 'services';
import React from 'react';
import {
  Page, Navbar, List, ListItem, Block,
  NavTitle,
  NavRight,
  NavLeft,
  Icon,
  Link,
} from 'framework7-react';
import './index.scss';

export default class extends React.Component {
  async componentDidMount() {
    const res = await api.market.getSymbolTypeList();
    console.log('res', res)
  }
  
  render() {
    return (
      <Page name="market">
        <Navbar>
          <NavLeft>
            <Link onClick={() => this.$f7router.back()}>
              <Icon color={'white'} f7={'chevron_left'} size={r(18)}></Icon>
            </Link>
          </NavLeft>
          <NavTitle>{'USDAUS'}</NavTitle>
          <NavRight>
            <Link>
              <Icon color={'white'} f7={'plus'} size={r(18)}></Icon>
            </Link>
          </NavRight>
        </Navbar>
      </Page>
    );
  }
}
