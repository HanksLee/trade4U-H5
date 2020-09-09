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
    // currentLang: utils.getLStorage("MOON_H5_LANG"),
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
        </Navbar>

        <div className="select-title">图表</div>
        <Select
          className="select-option"
          defaultValue={0}
          // onChange={this.handleLangChange}
          placeholder="选择图表"
        >
          <Option value={0}>
            <span>折线图</span>
          </Option>
          <Option value={1}>
            <span>柱状图</span>
          </Option>
        </Select>
      </Page>
    );
  }
}
