import React from 'react';
import { Page, Navbar, List, ListItem, NavRight, NavTitle, Link } from 'framework7-react';
import './index.scss';

export default class extends React.Component {
  state = {
    title: '交易'
  };

  // constructor() {
  //   super();
  //
  // }
  render() {
    const {title} = this.state;

    return (
      <Page name="trade">
        <Navbar sliding={false}>
          <NavTitle>{title}</NavTitle>
          <NavRight>
            <Link>

            </Link>
          </NavRight>
        </Navbar>
      </Page>
    );
  }
}
