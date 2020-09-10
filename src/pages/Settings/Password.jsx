import intl from "react-intl-universal";
import React from "react";
import utils from "utils";
import { List, InputItem, Toast } from "antd-mobile";
import { createForm } from "rc-form";
import {
  Page,
  Navbar,
  NavTitle,
  NavLeft,
  NavRight,
  Link,
  Icon,
} from "framework7-react";
import api from "services";
import "./index.scss";

@createForm()
export default class extends React.Component {
  state = {
    smsConfirm: false,
    smskey: undefined,
    errMsg: "",
    waitTime: 60,
    canSendSMS: true,
  };

  sendSMS = () => {
    const { waitTime, canSendSMS } = this.state;
    if (canSendSMS !== true) {
      return false;
    } else {
      this.setState({ canSendSMS: false }, async () => {
        let payload = {
          type: "reset_pwd_sms",
        };
        const res = await api.setting.sendSMS(payload);

        if (res.status === 201) {
          this.setState({ smsKey: res.data.key });
        } else {
          this.setState({ errMsg: res.data.message });
        }
        let time = waitTime;
        let timeID = setInterval(async () => {
          time--;
          if (time === 0) {
            clearInterval(timeID);
            this.setState({ waitTime: 60, canSendSMS: true });
          } else {
            this.setState({ waitTime: time });
          }
        }, 1000);
      });
    }
  };

  handleVerifySubmit = async (evt) => {
    const { smsKey } = this.state;

    this.props.form.validateFields(async (err, values) => {
      if (!err) {
        let payload = {
          code: values.SMS,
          key: smsKey,
        };

        const res = await api.setting.verifySMS(payload);

        if (res.status === 201) {
          this.setState({ verifyPass: true, smsKey: res.data.key });
        } else {
          this.setState({ errMsg: "验证码不得为空" });
        }
      }
    });
  };

  handleResetPwdSubmit = async (evt) => {
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
          placeholder={intl.get("settings.password.check-password.placeholder")}
        >
          {intl.get("settings.password.check-password")}
        </InputItem>
      </List>
    );
  };

  sendSmsComponent = () => {
    const { getFieldProps } = this.props.form;
    const { waitTime, errMsg, canSendSMS } = this.state;
    return (
      <List>
        {/* <InputItem
          {...getFieldProps("oldPassword", {
            initialValue: "",
          })}
          type="password"
          placeholder={"输入旧密码"}
        >
          {"旧密码"}
        </InputItem> */}
        <InputItem
          {...getFieldProps("SMS", {
            initialValue: "",
          })}
          type="text"
          placeholder={"输入简讯验证码"}
          className="sms-input"
        >
          {"简讯验证码"}
          <div
            className={`sms-btn ${!canSendSMS && "reject"}`}
            onClick={this.sendSMS}
          >
            {waitTime !== 60 ? `${waitTime}秒后可重新发送` : "发送简讯验证码"}
          </div>
          {/* {waitTime !== 60 && (
            <div className="sms-prompt">{waitTime}秒后可重新发送</div>
          )} */}
        </InputItem>

        {!utils.isEmpty(errMsg) && <div className="sms-error">{errMsg}</div>}
      </List>
    );
  };

  render() {
    const { smsConfirm } = this.state;
    return (
      <Page>
        <Navbar className="text-color-white">
          <NavLeft>
            <Link onClick={() => this.$f7router.back({ force: false })}>
              <Icon color={"white"} f7={"chevron_left"} size={r(18)}></Icon>
            </Link>
          </NavLeft>
          <NavTitle>{intl.get("settings.password")}</NavTitle>
          <NavRight>
            {!smsConfirm ? (
              <div onClick={this.handleVerifySubmit}>下一步</div>
            ) : (
                <div onClick={this.handleResetPwdSubmit}></div>
              )}
          </NavRight>
        </Navbar>
        {!smsConfirm ? this.sendSmsComponent() : this.resetPwdComponent()}
      </Page>
    );
  }
}
