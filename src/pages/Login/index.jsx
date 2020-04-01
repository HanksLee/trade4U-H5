import logo from '../../assets/img/logo.svg';
import React from 'react';
import utils from 'utils';
import { Page, Navbar, List, ListItem, Searchbar, ListInput, Button, ListItem } from 'framework7-react';
import './index.scss';

export default class extends React.Component {
  constructor() {
    super();

    this.state = {
      isLogin: true,
      brokerList: [],
      searchResult: [],
      codeInfo: null,
      username: '',
      password: '',
      code: '',
    }
  }

  componentDidMount() {
    const token = utils.getLStorage('MOON_H5_TOKEN');
    if (token) {
      this.props.history.push('/app');
    } else {
      this.getCodeImg();
    }
  }

  getCodeImg = async () => {
    const res = await this.$api.common.getCodeImg();

    if (res.status == 200) {
      this.setState({
        codeInfo: res.data,
      });
    }
  }

  renderLoginPanel = () => {
    const { codeInfo, } = this.state;
    return (
      <>
        <Navbar title="登录" />
        <img alt="logo" className="logo" src={logo} />
        <List form>
          <ListInput
            type="text"
            name="username"
            inlineLabel={true}
            label="用户名"
            placeholder="111111"
            value={this.state.username}
            onInput={(e) => this.setState({username: e.target.value})}
          ></ListInput>
          <ListInput
            type="password"
            name="password"
            inlineLabel={true}
            label="密码"
            placeholder="123123"
            value={this.state.password}
            onInput={(e) => this.setState({password: e.target.value})}
          ></ListInput>
          <ListInput
            type="text"
            name="code"
            inlineLabel={true}
            label="验证码"
            placeholder="请输入验证码"
            value={this.state.code}
            onInput={(e) => this.setState({code: e.target.value})}
          >
            {
              codeInfo ? (
                <img
                  src={codeInfo.image}
                  className="login-code-img"
                  onClick={this.getCodeImg}
                  alt="验证码"
                  slot="content-end"
                />
              ) : null
            }
          </ListInput>
        </List>
        <Button fill>登录</Button>
      </>
    );
  }

  renderBrokerChoosePanel = () => {
    return (
      <>
        <Navbar title="券商" />
        <Searchbar placeholder="输入券商名" onChange={this.searchBroker} clearButton={false} />
        <img alt="logo" className="logo" src={logo} />
        <List>
          {
            this.state.searchResult.map(item => (
              <ListItem thumb={item.broker.logo} onClick={() => this.chooseBroker(item.token)}>
                {item.broker.name}
              </ListItem>
            ))
          }
        </List>
      </>
    );
  }

  render() {
    const { isLogin, } = this.state;
    return (
      <Page name="login">
        {
          isLogin ? this.renderBrokerChoosePanel() :  this.renderLoginPanel()
        }
      </Page>
    );
  }
}