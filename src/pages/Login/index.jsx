import logo from "../../assets/img/Trade4U Logo.svg";
import refreshSVG from "../../assets/img/refresh-icon.svg";
import React from "react";
import { f7 } from "framework7-react";
import utils from "utils";
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
} from "framework7-react";
import { Select } from "antd";
import api from "services";
// import { inject, observer } from "mobx-react";
import "antd/dist/antd.css";
import "./index.scss";

// @inject("message")
// @observer
export default class extends React.Component {
  constructor() {
    super();

    this.state = {
      isLogin: false,
      brokerList: [],
      searchResult: [],
      codeInfo: null,
      username: "",
      password: "",
      code: "",
      errorMsg: "",
      token: "",
    };
  }

  componentDidMount() {
    const token = utils.getLStorage("MOON_H5_TOKEN");
    if (!token) {
      //   f7.router.app.views.main.router.navigate("/", {
      //     reloadCurrent: true,
      //     ignoreCache: true,
      //   });
      // } else {
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
  };

  renderLoginPanel = () => {
    const { codeInfo, errorMsg } = this.state;
    return (
      <>
        <Navbar>
          <NavTitle style={{ margin: "auto" }}>登录</NavTitle>
        </Navbar>
        <img alt="logo" className="logo" src={logo} />
        <List form className="login-list">
          <ListInput
            type="text"
            name="username"
            inlineLabel={true}
            label="手机号/信箱"
            placeholder="输入手机号/信箱"
            value={this.state.username}
            onInput={(e) => this.setState({ username: e.target.value })}
          ></ListInput>
          <ListInput
            type="password"
            name="password"
            inlineLabel={true}
            label="密码"
            placeholder="请输入密码"
            value={this.state.password}
            onInput={(e) => this.setState({ password: e.target.value })}
          ></ListInput>
          <ListInput
            type="text"
            name="code"
            inlineLabel={true}
            label="验证码"
            placeholder="请输入验证码"
            value={this.state.code}
            onInput={(e) => this.setState({ code: e.target.value })}
            className="item-code"
          >
            {codeInfo ? (
              <div className="code-info" slot="content-end">
                <img
                  src={codeInfo.image}
                  className="login-code-img"
                  alt="验证码"
                />
                <img src={refreshSVG} alt="refresh" onClick={this.getCodeImg} />
              </div>
            ) : null}
          </ListInput>
        </List>
        <div className="error-msg">{errorMsg}</div>
        <Button fill className="login-btn" onClick={this.login}>
          登录
        </Button>
      </>
    );
  };

  renderBrokerChoosePanel = () => {
    const { Option } = Select;
    const { searchResult, token } = this.state;
    return (
      <>
        <Navbar>
          <NavTitle style={{ margin: "auto" }}>登录</NavTitle>
        </Navbar>
        {/* <Searchbar
          placeholder="输入券商名"
          onChange={this.searchBroker}
          disableButton={false}
        /> */}
        <img alt="logo" className="logo" src={logo} />
        <div className="select-title">选择证券商</div>
        {/* <List className="select-option">
          {this.state.searchResult.map((item) => (
            <ListItem
              onClick={() => this.chooseBroker(item.token)}
              title={item.broker.name}
            >
              <img
                className="broker-logo"
                src={item.broker.logo}
                slot="media"
              />
            </ListItem>
          ))}
        </List> */}
        <Select
          className="select-option"
          defaultValue={token}
          onChange={this.chooseBroker}
          placeholder="选择证券商"
        >
          {this.state.searchResult.map((item, index) => (
            <Option value={item.token} key={index}>
              <img className="broker-logo" src={item.broker.logo} />
              <span>{item.broker.name}</span>
            </Option>
          ))}
        </Select>
        <Button fill className="login-btn" onClick={this.confirmBroker}>
          确认
        </Button>
      </>
    );
  };

  searchBroker = (event) => {
    const value = event.target.value;
    if (value !== "") {
      this.setState({
        searchResult: this.state.brokerList.filter(
          (item) => item.broker.name.indexOf(value) !== -1
        ),
      });
    } else {
      this.setState({
        searchResult: this.state.brokerList,
      });
    }
  };

  chooseBroker = (value) => {
    this.setState({ token: value });
  };

  confirmBroker = () => {
    const { token } = this.state;
    if (token) {
      utils.setLStorage("MOON_H5_TOKEN", token);
      // this.$f7router.navigate("/");
      f7.router.app.views.main.router.navigate("/", {
        reloadCurrent: true,
        ignoreCache: true,
      });
    }
  };

  login = async () => {
    const { username, password, code } = this.state;
    if (username === "") {
      // this.$f7.toast.show({
      //   text: "请输入用户名",
      // });
      this.setState({ errorMsg: "请输入用户名" });
      return;
    }

    if (password === "") {
      // this.$f7.toast.show({
      //   text: "请输入密码",
      // });
      this.setState({ errorMsg: "请输入密码" });
      return;
    }

    if (code === "") {
      // this.$f7.toast.show({
      //   text: "请输入验证码",
      // });
      this.setState({ errorMsg: "请输入验证码" });
      return;
    }

    const res = await api.common.login({
      username,
      password,
      code,
      key: this.state.codeInfo.key,
      platform: "client_pc",
    });

    if (res.status === 201) {
      this.setState({
        isLogin: true,
        brokerList: res.data.results,
        searchResult: res.data.results,
        token: res.data.results[0].token || "",
      });
    } else if (res.status === 400) {
      this.setState({ errorMsg: "验证码已过期" });
    } else {
      this.setState({ errorMsg: res.data.message });
    }
  };

  render() {
    const { isLogin } = this.state;
    return (
      <Page name="login">
        {isLogin ? this.renderBrokerChoosePanel() : this.renderLoginPanel()}
      </Page>
    );
  }
}
