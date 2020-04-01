import api from 'services';
import React from 'react';
import { Page, Navbar, List, ListItem, NavRight, NavLeft, NavTitle } from 'framework7-react';
import './index.scss';
import EditIcon from "assets/img/edit2.svg";
import AddIcon from "assets/img/add.svg";
import { inject, observer } from "mobx-react";

@inject("market")
@observer
export default class extends React.Component {
  componentDidMount() {
    this.props.market.getSelfSelectSymbolList();
  }

  navigateToManagePage = () => {
    this.$f7router.navigate('/market/manage-self-select');
  }

  navigateToAddPage = () => {
    this.$f7router.navigate('/market/add-self-select');
  }
  
  render() {
    const { selfSelectSymbolList, } = this.props.market;
    return (
      <Page name="market">
        <Navbar>
          <NavLeft>
            <img alt="edit" src={EditIcon} onClick={this.navigateToManagePage} />
          </NavLeft>
          <NavTitle>行情</NavTitle>
          <NavRight>
            <img alt="add" src={AddIcon} onClick={this.navigateToAddPage} />
          </NavRight>
        </Navbar>
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th className="label-cell">品种</th>
                <th className="label-cell">时间</th>
                <th className="label-cell">卖出价</th>
                <th className="label-cell">买入价</th>
              </tr>
            </thead>
            <tbody>
              {
                selfSelectSymbolList.map(item => {
                  return (
                    <tr>
                      <td className="label-cell">Frozen yogurt</td>
                      <td className="label-cell">159</td>
                      <td className="label-cell">6.0</td>
                      <td className="label-cell">24</td>
                    </tr>
                  )
                })
              }
            </tbody>
          </table>
        </div>
      </Page>
    );
  }
}
