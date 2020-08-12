import intl from "react-intl-universal";
import React from "react";
import utils from "utils";
import { Select } from 'antd';
import { f7 } from "framework7-react";
import { Page, Navbar, NavRight } from "framework7-react";
import 'antd/dist/antd.css';
import "./index.scss";

export default class extends React.Component {
  state = {
    // currentLang: utils.getLStorage("MOON_H5_LANG"),
  };

  componentDidMount() {
  }

  handleSubmit = async () => {
    const { currentLang } = this.state;
    utils.setLStorage("MOON_H5_LANG", currentLang)
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
        <Navbar
          title={intl.get("settings.lang")}
          backLink="Back"
          className="text-color-white"
        >
          <NavRight>
            {/* <div onClick={this.handleSubmit}>确认</div> */}
          </NavRight>
        </Navbar>
        <div className="select-title">涨跌偏好</div>
        <Select className="select-option"
          defaultValue={0}
          // onChange={this.handleLangChange}
          placeholder="选择偏好"
        >
          <Option value={0}>
            <span>绿涨红跌</span>
          </Option>
          <Option value={1}>
            <span>红涨绿跌</span>
          </Option>
        </Select>

      </Page>
    );
  }
}
