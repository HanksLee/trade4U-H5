import intl from "react-intl-universal";
import React from "react";
import utils from "utils";
import {
  List,
  InputItem,
  Toast,
} from "antd-mobile";
import { createForm } from "rc-form";
import { Select } from 'antd';
import { Page, Navbar, NavRight } from "framework7-react";
import api from "services";
import moment from "moment";
import 'antd/dist/antd.css';
import "./index.scss";

const country = [
  {
    label: "HongKong",
    value: "hk",
  },
  {
    label: "China",
    value: "china",
  },
];

@createForm()
export default class extends React.Component {
  state = {
    userInfo: [],
    emailError: false,
    idCardError: false,
    mobileError: false,
    postalError: false,
  };

  componentDidMount() {
    this.getList();
  }

  getList = async () => {
    const res = await api.setting.getAccountInfo();
    if (res.status === 200) {
      this.setState({
        userInfo: res.data,
        id_card_front: res.data.id_card_front,
        id_card_back: res.data.id_card_back,
      });
    }
  };

  goBack = () => {
    this.props.history.goBack();
  };


  handleSubmit = async (evt) => {
    // const { id_card_back, id_card_front } = this.state;
    // this.props.form.validateFields(async (err, values) => {
    //   if (!err) {
    //     let payload = {
    //       last_name: values.last_name,
    //       first_name: values.first_name,
    //       birth:
    //         values.birth == "" ? "" : moment(values.birth).format("YYYY-MM-DD"),
    //       id_card: values.id_card,
    //       mobile: values.mobile,
    //       nationality:
    //         values.nationality == undefined
    //           ? ""
    //           : values.nationality.toString(),
    //       country_of_residence:
    //         values.country_of_residence == undefined
    //           ? ""
    //           : values.country_of_residence.toString(),
    //       street: values.street,
    //       city: values.city,
    //       postal: values.postal,
    //       email: values.email,
    //       id_card_back,
    //       id_card_front,
    //       inspect_status: 1,
    //     };

    //     const res = await api.setting.updateAccountInfo(payload);

    //     if (res.status === 200) {
    //       Toast.success("支付成功", 2);
    //     }
    //   } else {
    //     Toast.fail("格式有误，请再做检查", 2);
    //   }
    // });
    Toast.success("申請成功", 2);
  };

  render() {
    const { getFieldProps } = this.props.form;
    const { userInfo } = this.state
    const { Option } = Select;
    return (
      <Page>
        <Navbar
          title={"入金"}
          backLink="Back"
          class="text-color-white"
        >
          <NavRight></NavRight>
        </Navbar>
        <div className="withdraw-item-title">淨資產</div>
        <div className="remain-fund">5000.00</div>
        <div className="select-title">支付管道</div>
        <Select className="select-option withdraw-select"
          placeholder="選擇支付管道"
        >
          <Option value={"zh-CN"}>
            <span>{intl.get("settings.lang.chinese")}</span>
          </Option>
          <Option value={"en-US"}>
            <span>{intl.get("settings.lang.english")}</span>
          </Option>
        </Select>
        <List>
          <InputItem
            {...getFieldProps("name", {
              // initialValue: userInfo["name"] || "",
              initialValue: "",
            })}
            placeholder={"必填"}
          >
            {"金額 *提示：手續費0%，入金上限 200,000/ 下限 1000"}
          </InputItem>
        </List>
        <div className="withdraw-btn-container">
          <div className="withdraw-btn">清除資料</div>
          <div className="withdraw-btn" onClick={this.handleSubmit}>下一步</div>
        </div>
      </Page>
    );
  }
}
