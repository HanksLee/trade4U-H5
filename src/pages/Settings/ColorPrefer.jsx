import intl from "react-intl-universal";
import React from "react";
import utils from "utils";
import { Select } from "antd";
import { f7 } from "framework7-react";
import { Page, Navbar, NavTitle, NavLeft, Link, Icon } from "framework7-react";
import { inject, observer } from "mobx-react";
import "antd/dist/antd.css";
import "./index.scss";

@inject("common")
@observer
export default class extends React.Component {
  state = {
    // currentLang: utils.getLStorage("MOON_H5_LANG"),
  };

  componentDidMount() { }

  // handleSubmit = async () => {
  //   const { currentLang } = this.state;
  //   utils.setLStorage("MOON_H5_LANG", currentLang);
  //   // f7.router.app.views.main.router.refreshPage();
  // };

  handleColorChange = (value) => {
    // this.setState({
    //   currentLang: value,
    // });
    localStorage.setItem("color_mode", value);
    this.props.common.setQuoteColor();
  };

  render() {
    const { Option } = Select;
    return (
      <Page>
        <Navbar className="text-color-white">
          <NavLeft>
            <Link onClick={() => this.$f7router.back({ force: false })}>
              <Icon color={"white"} f7={"chevron_left"} size={r(18)}></Icon>
            </Link>
          </NavLeft>
          <NavTitle>{intl.get("settings.lang")}</NavTitle>
        </Navbar>
        <div className="select-title">涨跌偏好</div>
        <Select
          className="select-option"
          defaultValue={localStorage.getItem("color_mode")}
          onChange={this.handleColorChange}
          placeholder="选择偏好"
        >
          <Option value={"standard"}>
            <span>绿涨红跌</span>
          </Option>
          <Option value={"hk_style"}>
            <span>红涨绿跌</span>
          </Option>
        </Select>
      </Page>
    );
  }
}
