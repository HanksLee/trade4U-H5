import intl from "react-intl-universal";
import React from "react";
import utils from "utils";
import { Select } from "antd";
import { f7 } from "framework7-react";
import { Page, Navbar, NavTitle, NavLeft, Link, Icon } from "framework7-react";
import "antd/dist/antd.css";
import "./index.scss";

export default class extends React.Component {
  state = {
    currentLang: utils.getLStorage("MOON_H5_LANG"),
  };

  componentDidMount() {}

  handleSubmit = async () => {
    const { currentLang } = this.state;
    utils.setLStorage("MOON_H5_LANG", currentLang);
    // f7.router.app.views.main.router.refreshPage();
  };

  handleLangChange = (value) => {
    this.setState({
      currentLang: value,
    });
  };

  render() {
    const { Option } = Select;
    const { currentLang } = this.state;
    return (
      <Page>
        <Navbar className="text-color-white">
          <NavLeft>
            <Link onClick={() => this.$f7router.back({ force: false })}>
              <Icon color={"white"} f7={"chevron_left"} size={r(18)}></Icon>
            </Link>
          </NavLeft>
          <NavTitle>{intl.get("settings.lang")}</NavTitle>
          <NavRight>
            <div onClick={this.handleSubmit}>确认</div>
          </NavRight>
        </Navbar>

        <div className="select-title">语言</div>
        <Select
          className="select-option"
          defaultValue={currentLang}
          onChange={this.handleLangChange}
          placeholder="选择语言"
        >
          <Option value={"zh-CN"}>
            <span>{intl.get("settings.lang.chinese")}</span>
          </Option>
          <Option value={"en-US"}>
            <span>{intl.get("settings.lang.english")}</span>
          </Option>
        </Select>
        {/* <List>
          <select
            name="lang"
            value={currentLang}
            onChange={this.handleLangChange}
          >
            <option value="zh-CN">{intl.get("settings.lang.chinese")}</option>
            <option value="en-US">{intl.get("settings.lang.english")}</option>
          </select>
        </List> */}
      </Page>
    );
  }
}
