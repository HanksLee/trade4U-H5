import intl from "react-intl-universal";
import React from "react";
import utils from "utils";
import { List, InputItem, Toast } from "antd-mobile";
import { createForm } from "rc-form";
import { inject, observer } from "mobx-react";
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
@inject("setting")
@observer
export default class extends React.Component {
  state = {
    smsConfirm: false,
    // smskey: undefined,
    // errMsg: "",
    // waitTime: 60,
    // canSendSMS: true,
  };

  // sendSMS = () => {
  //   const { waitTime, canSendSMS } = this.state;
  //   if (canSendSMS !== true) {
  //     return false;
  //   } else {
  //     this.setState({ canSendSMS: false }, async () => {
  //       let payload = {
  //         type: "reset_pwd_sms",
  //       };
  //       const res = await api.setting.sendSMS(payload);

  //       if (res.status === 201) {
  //         this.setState({ smsKey: res.data.key });
  //       } else {
  //         this.setState({ errMsg: res.data.message });
  //       }
  //       let time = waitTime;
  //       let timeID = setInterval(async () => {
  //         time--;
  //         if (time === 0) {
  //           clearInterval(timeID);
  //           this.setState({ waitTime: 60, canSendSMS: true });
  //         } else {
  //           this.setState({ waitTime: time });
  //         }
  //       }, 1000);
  //     });
  //   }
  // };

  goBack = () => {
    const { setErrMsg } = this.props.setting;
    setErrMsg("");
    this.$f7router.back({ force: false });
  }

  handleVerifySubmit = async (evt) => {
    // const { smsKey } = this.state;
    const { smsKey, setErrMsg } = this.props.setting;

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
          if (res.data.error_code === 400) {
            if (utils.isEmpty(smsKey)) {
              // this.setState({ errMsg: "????????????????????????????????????" });
              setErrMsg("????????????????????????????????????")
            } else {
              // this.setState({ errMsg: "?????????????????????" });
              setErrMsg("?????????????????????")
            }

          } else if (res.data.error_code === 403) {
            setErrMsg("???????????????")
            // this.setState({ errMsg: "???????????????" });
          }

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
    // const { waitTime, errMsg, canSendSMS } = this.state;
    const { waitTime, errMsg, canSendSMS, sendSMS } = this.props.setting;
    return (
      <List>
        {/* <InputItem
          {...getFieldProps("oldPassword", {
            initialValue: "",
          })}
          type="password"
          placeholder={"???????????????"}
        >
          {"?????????"}
        </InputItem> */}
        <InputItem
          {...getFieldProps("SMS", {
            initialValue: "",
          })}
          type="text"
          placeholder={"?????????????????????"}
          className="sms-input"
        >
          {"???????????????"}
          <div
            className={`sms-btn ${!canSendSMS && "reject"}`}
            onClick={sendSMS}
          >
            {waitTime !== 60 ? `${waitTime}?????????????????????` : "?????????????????????"}
          </div>
          {/* {waitTime !== 60 && (
            <div className="sms-prompt">{waitTime}?????????????????????</div>
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
            <Link onClick={this.goBack}>
              <Icon color={"white"} f7={"chevron_left"} size={r(18)}></Icon>
            </Link>
          </NavLeft>
          <NavTitle>{intl.get("settings.password")}</NavTitle>
          <NavRight>
            {!smsConfirm ? (
              <div onClick={this.handleVerifySubmit}>?????????</div>
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
