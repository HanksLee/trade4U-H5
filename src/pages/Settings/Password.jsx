import intl from "react-intl-universal";
import React from "react";
import utils from "utils";
import {
  List,
  InputItem,
  DatePicker,
  WhiteSpace,
  Picker,
  Toast,
} from "antd-mobile";
import { Upload } from "antd";
import { createForm } from "rc-form";
// import { RcFile } from "antd/lib/upload";
import { Page, Navbar, NavRight } from "framework7-react";
import api from "services";
import moment from "moment";
import "./index.scss";

@createForm()
export default class extends React.Component {
  state = {};

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

  render() {
    const { getFieldProps } = this.props.form;
    return (
      <Page>
        <Navbar
          title={intl.get("settings.password")}
          backLink="Back"
          class="text-color-white"
        >
          <NavRight>
            <div onClick={this.handleSubmit}>確認</div>
          </NavRight>
        </Navbar>
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
      </Page>
    );
  }
}
