import React from 'react';
import {
  Page, Navbar, List, ListItem,
  NavLeft,
  Icon,
  Link,
} from 'framework7-react';
import './index.scss';
import {inject, observer} from "mobx-react";

@inject("common", 'trade', 'market')
@observer
export default class extends React.Component {
  state = {
  }

  componentDidMount() {
    this.onRefresh();
  }

  onRefresh = async (done) => {
    this.props.market.getSymbolList();
  }


  render() {
    const {
      selectedId, mode,
      market: {
        symbolList,
      }
    } = this.props;
    console.log('props', this.props);


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

        <List>
          {symbolList.map((product) => {
            const id = product?.id;
            const name = product?.symbol_display?.name;

              return (
                <ListItem
                  onClick={() => {
                    this.props.market.setCurrentSymbol(product);
                    this.$f7router.back(`/trade/${id}/`, {
                      force: true,
                      props: {
                        mode,
                        id,
                      }
                    });
                  }}
                  key={id}
                  title={name}
                  after={
                    id == selectedId
                      ? <Icon style={{color: '#007aff'}} f7={'checkmark_alt'} size={r(18)}></Icon>
                      : null
                  }
                />
              );
            }
          )}
        </List>
      </Page>
    );
  }
}
