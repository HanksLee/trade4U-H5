import logo from '../../assets/img/logo.svg';
import React from 'react';
import utils from 'utils';
import {
  Page,
  Navbar,
  List,
  ListItem,
  Searchbar,
  ListInput,
  Button,
  NavTitle,
  Icon,
} from 'framework7-react';
import api from 'services'
import './index.scss';

export default class extends React.Component {
  constructor() {
    super();

    this.state = {
      isLogin: false,
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
    const res = await api.common.getCodeImg();

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
        <Navbar>
          <NavTitle style={{ margin: 'auto' }}>登录</NavTitle>
        </Navbar>
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
        <Button fill className="login-btn" onClick={this.login}>登录</Button>
      </>
    );
  }

  renderBrokerChoosePanel = () => {
    return (
      <>
        <Navbar>
          <NavTitle style={{ margin: 'auto' }}>证券商</NavTitle>
        </Navbar>
        <Searchbar placeholder="输入券商名" onChange={this.searchBroker} disableButton={false} />
        <img alt="logo" className="logo" src={logo} />
        <List>
          {
            this.state.searchResult.map(item => (
              <ListItem onClick={() => this.chooseBroker(item.token)} title={item.broker.name}>
                <img
                  className="broker-logo"
                  src={item.broker.logo}
                  slot="media"
                />
              </ListItem>
            ))
          }
        </List>
      </>
    );
  }

  searchBroker = (event) => {
    const value = event.target.value;
    if (value !== '') {
      this.setState({
        searchResult: this.state.brokerList.filter(item => item.broker.name.indexOf(value) !== -1),
      });
    } else {
      this.setState({
        searchResult: this.state.brokerList,
      });
    }
  }

  chooseBroker = (token) => {
    utils.setLStorage('MOON_H5_TOKEN', token);
    this.$f7router.navigate('/');
  }

  login = async () => {
    const { username, password, code, } = this.state;
    if (username === '') {
      this.$f7.toast.show({
        text: '请输入用户名',
      });
      return;
    }

    if (password === '') {
      this.$f7.toast.show({
        text: '请输入密码',
      });
      return;
    }

    if (code === '') {
      this.$f7.toast.show({
        text: '请输入验证码',
      });
      return;
    }

    const res = await api.common.login({
      username,
      password,
      code,
      key: this.state.codeInfo.key,
    });

    if (res.status === 201) {
      this.setState({
        isLogin: true,
        brokerList: res.data.results,
        searchResult: res.data.results,
      });
    }
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