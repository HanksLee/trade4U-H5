import intl from "react-intl-universal";
import React from "react";
import utils from "utils";
import { f7 } from "framework7-react";
import { Page, Navbar, List, ListItem, ListInput } from "framework7-react";
import { inject, observer } from "mobx-react";
import "./index.scss";

@inject("message")
@observer
export default class extends React.Component {
  state = {
    currentLang: utils.getLStorage("MOON_H5_LANG"),
  };

  handleLangChange = (e) => {
    const value = e.target.value;
    this.setState({
      currentLang: value,
    });
    utils.setLStorage("MOON_H5_LANG", value);
  };

  logout = () => {
    localStorage.removeItem("MOON_H5_TOKEN");
    f7.router.app.views.main.router.navigate("/login", {
      reloadCurrent: true,
      ignoreCache: true,
    });
  }

  render() {
    const { currentLang } = this.state;
    const { hasNotify, hasAnnouncement } = this.props.message;
    return (
      <Page name="settings">
        <Navbar title={intl.get("settings.setting")} />
        <List>
          <ListItem
            title={intl.get("settings.account")}
            link={`/settings/account`}
          >
            <img
              slot="media"
              src="../../../assets/img/account-manage-icon.svg"
              width="30"
            />
          </ListItem>
        </List>
        <List>
          <ListItem title={intl.get("settings.lang")} smartSelect>
            <img
              slot="media"
              src="../../../assets/img/language-icon.svg"
              width="30"
            />
            <select
              name="lang"
              value={currentLang}
              onChange={this.handleLangChange}
            >
              <option value="zh-CN">{intl.get("settings.lang.chinese")}</option>
              <option value="en-US">{intl.get("settings.lang.english")}</option>
            </select>
          </ListItem>
        </List>
        <List>
          <ListItem
            title={intl.get("settings.password")}
            link={`/settings/password`}
          >
            <img
              slot="media"
              src="../../../assets/img/setting-password-icon.svg"
              width="30"
            />
          </ListItem>
        </List>
        <List>
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
        </List>
        {/* <List
          className="logout">
          <ListItem
            title={intl.get("settings.logout")}
            onClick={this.logout}
          >
            <div slot="media" className="message-icon-container">
              {hasAnnouncement ||
                (hasNotify && <span className="has-unread-message"></span>)}
              <img
                src="../../../assets/img/logout.svg"
                width="30"
              />
            </div>
          </ListItem>
        </List> */}
      </Page>
    );
  }
}
