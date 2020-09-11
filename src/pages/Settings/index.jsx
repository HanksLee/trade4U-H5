import intl from "react-intl-universal";
import React from "react";
import utils from "utils";
import { Modal } from "antd";
import { f7 } from "framework7-react";
import api from "services";
import {
  Page,
  Navbar,
  List,
  ListItem,
  ListInput,
  NavRight,
  NavLeft,
  NavTitle,
} from "framework7-react";
import { inject, observer } from "mobx-react";
import "antd/dist/antd.css";
import "./index.scss";

@inject("message", "setting")
@observer
export default class extends React.Component {
  // state = { withdrawableBalance: 0 };

  async componentDidMount() {
    await this.props.setting.getWithdrawableBalance();
    await this.props.setting.getUserInfo();
  }

  // getWithdrawableBalance = async () => {
  //   const res = await api.setting.getWithdrawableBalance();
  //   this.setState({
  //     withdrawableBalance: res.data.withdrawable_balance,
  //   });
  // };

  logout = () => {
    localStorage.removeItem("MOON_H5_TOKEN");
    f7.router.app.views.main.router.navigate("/login", {
      reloadCurrent: true,
      ignoreCache: true,
    });
  };

  showLogoutModal = () => {
    const { confirm } = Modal;
    const that = this;
    confirm({
      title: "提示",
      content: "您確定要登出嗎",
      className: "trade-modal",
      centered: true,
      cancelText: "取消",
      okText: "确认",
      onOk() {
        that.logout();
      },
      onCancel() { },
    });
  };

  render() {
    const { userInfo, withdrawableBalance } = this.props.setting;
    const { hasNotify, hasAnnouncement } = this.props.message;
    return (
      <Page name="settings">
        <Navbar>
          <NavLeft></NavLeft>
          <NavTitle>{intl.get("settings.setting")} </NavTitle>
          <NavRight>
            <List className="message-entry">
              <ListItem link={`/settings/message`}>
                <div>
                  {(hasAnnouncement || hasNotify) && (
                    <span className="has-unread-message"></span>
                  )}
                  <img src="../../../assets/img/message-center-icon.svg" />
                </div>
              </ListItem>
            </List>
          </NavRight>
        </Navbar>
        <div className="user-name">{userInfo["first_name"]}{userInfo["last_name"]}</div>
        <div className="withdraw-item-title">可提馀额(元)</div>
        <div className="remain-fund">{withdrawableBalance}</div>
        <div className="fund-btn-container">
          <div className="fund-btn">
            <List>
              <ListItem title={"入金"} link={`/settings/deposit`}></ListItem>
            </List>
            <List className="btn-reverse">
              <ListItem title={"出金"} link={`/settings/withdraw`}></ListItem>
            </List>
          </div>
        </div>
        <div className="setting-item-title">资金明细</div>
        <List>
          <ListItem title={"资金明细"} link={`/settings/history`}>
            <div slot="media" style={{ backgroundColor: "#E02020" }}>
              <img src="../../../assets/img/funds-icon.svg" />
            </div>
          </ListItem>
        </List>

        <div className="setting-item-title">我的帐户</div>
        <List>
          <ListItem
            title={intl.get("settings.account")}
            link={`/settings/account`}
          >
            <div slot="media" style={{ backgroundColor: "#FA6400" }}>
              <img src="../../../assets/img/account-manage-icon.svg" />
            </div>
          </ListItem>
        </List>
        <List>
          <ListItem
            title={intl.get("settings.password")}
            link={`/settings/password`}
          >
            <div slot="media" style={{ backgroundColor: "#F7B500" }}>
              <img src="../../../assets/img/setting-password-icon.svg" />
            </div>
          </ListItem>
        </List>
        {/* <List>
          <ListItem title={intl.get("settings.lang")} link={`/settings/lang`}>
            <div slot="media" style={{ backgroundColor: "#6DD400" }}>
              <img src="../../../assets/img/language-icon.svg" />
            </div>
          </ListItem>
        </List> */}
        {/* <List>
          <ListItem
            title={"图表"}
            link={`/settings/chart`}
          >
            <div
              slot="media"
              style={{ backgroundColor: "#44D7B6" }}>
              <img
                src="../../../assets/img/chart-icon.svg"
              />
            </div>
          </ListItem>
        </List> */}
        {/* <List>
          <ListItem
            title={"新闻"}
            link={`/settings/news`}
          >
            <div
              slot="media"
              style={{ backgroundColor: "#32C5FF" }}>
              <img
                src="../../../assets/img/news-icon.svg"
              />
            </div>
          </ListItem>
        </List> */}
        <List>
          <ListItem
            title={"涨跌偏好"}
            link={`/settings/color-prefer`}
          >
            <div
              slot="media"
              style={{ backgroundColor: "#0091FF" }}>
              <img
                src="../../../assets/img/up-down-icon.svg"
              />
            </div>
          </ListItem>
        </List>
        {/* <List>
          <ListItem
            title={"客服"}
            link={`/`}
          >
            <div
              slot="media"
              style={{ backgroundColor: "#6236FF" }}>
              <img
                src="../../../assets/img/service-icon.svg"
              />
            </div>
          </ListItem>
        </List> */}
        {/* <List>
          <ListItem
            title={intl.get("settings.message")}
            link={`/settings/message`}
            className="message-entry"
          >
            <div slot="media" className="message-icon-container">
              {hasAnnouncement ||
                (hasNotify && <span className="has-unread-message"></span>)}
              <img
                src="../../../assets/img/message-center-icon.svg"
                width="30"
              />
            </div>
          </ListItem>
        </List> */}
        <List className="logout">
          <ListItem
            title={intl.get("settings.logout")}
            onClick={this.showLogoutModal}
            className="logout-item"
          >
            <div slot="media">
              <img src="../../../assets/img/logout.svg" />
            </div>
          </ListItem>
        </List>
      </Page>
    );
  }
}
