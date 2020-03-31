import React from 'react';
import { Page, Navbar, List, ListItem, NavRight, NavTitle, Link } from 'framework7-react';
import './index.scss';

export default class extends React.Component {
  state = {};

  // constructor() {
  //   super();
  //
  // }
  render() {
    return (
      <Page name="trade">
        <Navbar>
          <NavTitle>My App</NavTitle>
          <NavRight>
            <Link>Right Link</Link>
          </NavRight>
        </Navbar>
      </Page>
    );
  }
}
