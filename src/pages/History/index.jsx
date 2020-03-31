import React from 'react';
import { Page, Navbar, List, ListItem } from 'framework7-react';
import './index.scss';

export default class extends React.Component {
  constructor() {
    super();

    this.state = {
      products: this.$f7.data.products,
    }
  }
  render() {
    return (
      <Page name="history">
        <Navbar title="History" />
        <List>
          {this.state.products.map((product) => (
            <ListItem
              key={product.id}
              title={product.title}
              link={`/product/${product.id}/`}
            />
          ))}
        </List>
      </Page>
    );
  }
}
