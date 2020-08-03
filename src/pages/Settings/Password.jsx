import intl from "react-intl-universal";
import React from "react";
import utils from "utils";
import {
  List,
  InputItem,
  Toast,
} from "antd-mobile";
import { createForm } from "rc-form";
import { Page, Navbar, NavRight } from "framework7-react";
import api from "services";
import "./index.scss";

@createForm()
export default class extends React.Component {
  state = {
    smsConfirm: false,
  };


  sendSms = () => {
    this.setState({ smsConfirm: true })
  }

  handleSubmit = async (evt) => {
    this.props.form.validateFields(async (err, values) => {
      if (!err) {
        if (utils.isEmpty(values.password)) {
          Toast.fail(intl.get("settings.password.empty-password"), 1);
          return false;
        }

        if (values.checkPassword !== values.password) {
          Toast.fail(intl.get("settings.password.different-password"), 2);
          return false;
        }

        let payload = {
          password: values.password,
        };

        const res = await api.setting.resetPassword(payload);

        if (res.status === 200) {
          Toast.success(intl.get("settings.password.reset-success"), 2);
        }
      }
    });
  };

  resetPwdComponent = () => {
    const { getFieldProps } = this.props.form;
    return (
      <List>
        <InputItem
          {...getFieldProps("password", {
            initialValue: "",
          })}
          type="password"
          placeholder={intl.get("settings.password.password.placeholder")}
        >
          {intl.get("settings.password.password")}
        </InputItem>
        <InputItem
          {...getFieldProps("checkPassword", {
            initialValue: "",
          })}
          type="password"
          placeholder={intl.get(
            "settings.password.check-password.placeholder"
          )}
        >
          {intl.get("settings.password.check-password")}
        </InputItem>
      </List>
    )
  }

  sendSmsComponent = () => {
    const { getFieldProps } = this.props.form;
    return (
      <List>
        <InputItem
          {...getFieldProps("oldPassword", {
            initialValue: "",
          })}
          type="password"
          placeholder={"输入旧密码"}
        >
          {"旧密码"}
        </InputItem>
        <InputItem
          {...getFieldProps("SMS", {
            initialValue: "",
          })}
          type="text"
          placeholder={"输入简讯验证码"}
          className="sms-input"
        >
          {"简讯验证码"}
          <div className="sms-btn">发送简讯验证码</div>
          <div className="sms-prompt">60秒后重新发送</div>
        </InputItem>

        <div class="sms-error">*验证码已过期</div>
      </List>
    )
  }

  render() {
    const { smsConfirm } = this.state;
    return (
      <Page>
        <Navbar
          title={intl.get("settings.password")}
          backLink="Back"
          class="text-color-white"
        >
          <NavRight>
            {!smsConfirm ? <div onClick={this.sendSms}>下一步</div> : <div onClick={this.handleSubmit}></div>}

          </NavRight>
        </Navbar>
        {!smsConfirm ? this.sendSmsComponent() : this.resetPwdComponent()}
      </Page>
    );
  }
}
