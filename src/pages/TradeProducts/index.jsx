import React from 'react';
import { Page, Navbar, List, ListItem,
  NavLeft,
  Icon,
  Link,
} from 'framework7-react';
import './index.scss';

export default class extends React.Component {
  state = {
    products: [
      {
        id: 1,
        name: 'ACUDS',
      },
      {
        id: 2,
        name: 'DDDD',
      }
    ],
  }

  componentDidMount() {
    this.onRefresh();
  }

  onRefresh = async (done) => {
    // @todo
  }


  render() {
    const {selectedId, mode} = this.props;

    return (
      <Page name="trade-products" className={'trade-products'}
      onPtrRefresh={this.onRefresh}
      >
        <Navbar>
          <NavLeft>
            <Link onClick={() => this.$f7router.back()}>
              <Icon color={'white'} f7={'chevron_left'} size={r(18)}></Icon>
            </Link>
          </NavLeft>
        </Navbar>

        <List >
          {this.state.products.map((product) => (
            <ListItem
              onClick={() => {
                this.$f7router.back(`/trade/${product.id}/`, {
                  props: {
                    id: product.id,
                    mode,
                  }
                });
              }}
              key={product.id}
              title={product.name}
              after={
                product.id == selectedId
                  ? <Icon style={{ color: '#007aff' }} f7={'checkmark_alt'} size={r(18)}></Icon>
                  : null
              }
            />
          ))}
        </List>
      </Page>
    );
  }
}
