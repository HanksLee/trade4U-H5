import api from 'services';
import React from 'react';
import {
  Page, Navbar, List, ListItem, Block,
  NavTitle,
  NavLeft,
  Icon,
  Link,
} from 'framework7-react';
import './index.scss';

export default class extends React.Component {
  constructor(props) {
    super(props)
  
    this.state = {
      symbolTypeList: [],
    }
  }

  async componentDidMount() {
    const res = await api.market.getSymbolTypeList();
    this.setState({
      symbolTypeList: res.data.results,
    })
  }
  
  render() {
    const { symbolTypeList } = this.state;
    return (
      <Page noToolbar>
        <Navbar>
          <NavLeft>
            <Link onClick={() => this.$f7router.back()}>
              <Icon color={'white'} f7={'chevron_left'} size={r(18)}></Icon>
            </Link>
          </NavLeft>
          <NavTitle>交易品种类型</NavTitle>
        </Navbar>
        <List>
          {
            symbolTypeList.map(item => {
              return (
                <ListItem
                  title={item.symbol_type_name}
                  link={`/market/symbol_type/${item.symbol_type_name}/symbol`}
                ></ListItem>
              )
            })
          }
        </List>
      </Page>
    );
  }
}
