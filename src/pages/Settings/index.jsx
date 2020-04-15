import intl from "react-intl-universal";
import React from "react";
import utils from "utils";
import { Page, Navbar, List, ListItem, ListInput } from "framework7-react";
import "./index.scss";

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

  render() {
    const { currentLang } = this.state;
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
          >
            <img
              slot="media"
              src="../../../assets/img/message-center-icon.svg"
              width="30"
            />
          </ListItem>
        </List>
      </Page>
    );
  }
}
