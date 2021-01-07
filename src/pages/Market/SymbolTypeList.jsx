import api from "services";
import React from "react";
import {
  Page,
  Navbar,
  List,
  ListItem,
  Block,
  NavTitle,
  NavLeft,
  Icon,
  Link,
} from "framework7-react";
import { inject, observer } from "mobx-react";
import "./index.scss";

@inject("market")
export default class extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      symbolTypeList: [],
    };
  }

  async componentDidMount() {
    const res = await api.market.getSymbolTypeList();
    this.setState({
      symbolTypeList: res.data.results,
    });
  }

  goBack = async() =>{
    await this.props.market.updateSelfSelectSymbolList(`page=1&page_size=100`);
    this.$f7router.back();
  }

  render() {
    const { symbolTypeList } = this.state;
    return (
      <Page noToolbar>
        <Navbar>
          <NavLeft>
            <Link onClick={() => {this.goBack()} }>
              <Icon color={"white"} f7={"chevron_left"} size={r(18)}></Icon>
            </Link>
          </NavLeft>
          <NavTitle>交易品种类型</NavTitle>
        </Navbar>
        <List>
          {symbolTypeList.map((item, index) => {
            return (
              <ListItem
                key={index}
                title={item.symbol_type_name}
                link={`/market/symbol_type/${item.symbol_type_name}/symbol`}
              ></ListItem>
            );
          })}
        </List>
      </Page>
    );
  }
}
