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
  render() {
    return (
      <Page name="market">
        <Navbar>
          <NavLeft>
            <span>完成</span>
          </NavLeft>
          <NavRight>
            <span>删除</span>
          </NavRight>
        </Navbar>
      </Page>
    );
  }
}