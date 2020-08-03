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

  onErrorClick = () => {
    if (this.state.emailError) {
      Toast.info("信箱格式有误");
    }

    if (this.state.idCardError) {
      Toast.info("身分证只能有数字");
    }

    if (this.state.mobileError) {
      Toast.info("手机号只能有数字");
    }

    if (this.state.postalError) {
      Toast.info("邮递区号只能有数字");
    }
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
    return (
      <Page>
        <Navbar
          title={"入金"}
          backLink="Back"
          class="text-color-white"
        >
          <NavRight></NavRight>
        </Navbar>
        <List>
          <InputItem
            {...getFieldProps("name", {
              // initialValue: userInfo["name"] || "",
              initialValue: "",
            })}
            placeholder={"请输入姓名"}
          >
            {"姓名"}
          </InputItem>
          <Picker
            cols={1}
            extra={intl.get("settings.account.nationality.placeholder")}
            data={country}
            title={intl.get("settings.account.nationality")}
            {...getFieldProps("nationality", {
              initialValue: [userInfo["nationality"]] || undefined,
            })}
          >
            <List.Item arrow="horizontal" className="select-item">
              {intl.get("settings.account.nationality")}
            </List.Item>
          </Picker>
          <Picker
            cols={1}
            extra={intl.get(
              "settings.account.country-of-residence.placeholder"
            )}
            data={country}
            title={intl.get("settings.account.country-of-residence")}
            {...getFieldProps("country_of_residence", {
              initialValue: [userInfo["country_of_residence"]] || undefined,
            })}
          >
            <List.Item arrow="horizontal" className="select-item">
              {intl.get("settings.account.country-of-residence")}
            </List.Item>
          </Picker>
          <InputItem
            {...getFieldProps("bank", {
              initialValue: "",
            })}
            placeholder={"请输入开户行"}
          >
            {"开户行"}
          </InputItem>
          <InputItem
            {...getFieldProps("branch", {
              initialValue: userInfo["branch"] || "",
            })}
            placeholder={"请输入分行"}
          >
            {"分行"}
          </InputItem>
          <InputItem
            {...getFieldProps("bank_card", {
              initialValue: userInfo["bank_card"] || "",
            })}
            placeholder={"請输入银行卡"}
          >
            {"银行卡"}
          </InputItem>
          <InputItem
            {...getFieldProps("money", {
              initialValue: userInfo["money"] || "",
            })}
            placeholder={"請输入金额"}
          >
            {"金额"}
          </InputItem>
          <InputItem
            {...getFieldProps("remark", {
              initialValue: userInfo["remark"] || "",
            })}
            placeholder={"請输入备注"}
          >
            {"备注"}
          </InputItem>
        </List>
        <div className="deposit-remind">
          <p>溫馨提示:</p>
          <p>1.出金審核時間為：週一至週五 09:00-17:00</p>
          <p>2.提款T+1到帳，法定節假日或銀行特殊原因除外</p>
          <p>3.禁止洗錢，信用卡套現，虛假交易等行為，一經發現並確認將終止該帳戶的使用</p>
        </div>
        <div className="deposit-btn-container">
          <div className="deposit-btn">清除資料</div>
          <div className="deposit-btn" onClick={this.handleSubmit}>下一步</div>
        </div>
      </Page>
    );
  }
}
