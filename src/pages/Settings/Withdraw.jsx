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
import { Select, Form, Input, message, Button } from "antd";
import { createForm } from "rc-form";
import GuideModal from "components/GuideModal";
// import { RcFile } from "antd/lib/upload";
import { Page, Navbar, NavTitle, NavLeft, Link, Icon } from "framework7-react";
import { inject, observer } from "mobx-react";
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

@inject("setting", "common")
@observer
export default class extends React.Component {
  formRef = React.createRef();
  state = {};

  componentDidMount() { }

  goBack = () => {
    this.props.history.goBack("/settings/", { force: true });
  };

  withdraw = async (values) => {
    const { userAuthentication, getWithdrawableBalance } = this.props.setting;
    const { toggleGuideModalVisible } = this.props.common;

    //如果沒有認證或沒入金會出現提示框
    if (userAuthentication !== 3) {
      toggleGuideModalVisible();
      return;
    }

    const res = await api.setting.withdraw(values);
    if (res.status == 201) {
      await getWithdrawableBalance();
      Toast.success("申请出金成功", 2);
      this.resetForm();
    } else {
      Toast.fail(`申请出金失败\n${res.data.message}`, 3);
    }
  };

  resetForm = () => {
    this.formRef.current.resetFields();
  };

  render() {
    // const { getFieldProps } = this.props.form;
    const { withdrawableBalance } = this.props.setting;
    const { guideModalVisible } = this.props.common;
    return (
      <Page>
        <Navbar className="text-color-white">
          <NavLeft>
            <Link
              onClick={() => this.$f7router.back("/settings/", { force: true })}
            >
              <Icon color={"white"} f7={"chevron_left"} size={r(18)}></Icon>
            </Link>
          </NavLeft>
          <NavTitle>出金</NavTitle>
        </Navbar>

        <div className="deposit-item-title">可提馀额</div>
        <div className="remain-fund">{withdrawableBalance}</div>
        <Form
          onFinish={this.withdraw}
          hideRequiredMark={true}
          ref={this.formRef}
        >
          <List>
            <Form.Item
              name="account_name"
              label="姓名"
              rules={[{ required: true, message: "请输入姓名" }]}
            >
              <Input placeholder="输入姓名" />
            </Form.Item>

            {/* <div className="select-title withdraw-select-title">{intl.get("settings.account.nationality")}</div>
            <Select className="select-option withdraw-select-option"
              defaultValue={userInfo.nationality || undefined}
              onChange={this.handleNationalityChange}
              placeholder="选择国籍"
            >
              {country.map((item) => {
                return (
                  <Option value={item.value}>
                    <span>{item.label}</span>
                  </Option>
                )
              })}
            </Select> */}
            {/* <div className="select-title withdraw-select-title">{intl.get("settings.account.country-of-residence")}</div>
            <Select className="select-option deposit-select-option"
              defaultValue={userInfo.country_of_residence || undefined}
              onChange={this.handleCountryOfResidenceChange}
              placeholder="选择居住国"
            >
              {country.map((item) => {
                return (
                  <Option value={item.value}>
                    <span>{item.label}</span>
                  </Option>
                )
              })}
            </Select> */}
            {/* <Form.Item
              name="province"
              label="省份"
              rules={[{ required: true, message: "请输入省份" }]}
            >
              <Input placeholder="输入省份" />
            </Form.Item>
            <Form.Item
              name="city"
              label="城市"
              rules={[{ required: true, message: "请输入城市" }]}
            >
              <Input placeholder="输入城市" />
            </Form.Item> */}
            <Form.Item
              name="bank"
              label="开户銀行"
              rules={[{ required: true, message: "请输入开户銀行" }]}
            >
              <Input placeholder="输入开户銀行" />
            </Form.Item>
            <Form.Item
              name="sub_branch"
              label="支行 （xx省 xx市 xx支行）"
              rules={[{ required: true, message: "请输入支行" }]}
            >
              <Input placeholder="输入支行" />
            </Form.Item>
            <Form.Item
              name="card_number"
              label="银行卡号"
              rules={[{ required: true, message: "请输入银行卡号" }]}
            >
              <Input placeholder="输入银行卡号" />
            </Form.Item>
            <Form.Item
              name="expect_amount"
              label="提取金额"
              rules={[{ required: true, message: "请输入提取金额" }]}
            >
              <Input placeholder="输入提取金额" />
            </Form.Item>
            {/* <InputItem
              {...getFieldProps("remark", {
                initialValue: userInfo["remark"] || "",
              })}
              placeholder={"請输入备注"}
            >
              {"备注"}
            </InputItem> */}
          </List>
          <div className="deposit-remind">
            <p>溫馨提示:</p>
            <p>1.出金審核時間為：週一至週五 09:00-17:00</p>
            <p>2.提款T+1到帳，法定節假日或銀行特殊原因除外</p>
            <p>
              3.禁止洗錢，信用卡套現，虛假交易等行為，一經發現並確認將終止該帳戶的使用
            </p>
          </div>
          <div className="deposit-btn-container">
            <Button className="deposit-btn" onClick={this.resetForm}>
              清除資料
            </Button>
            {/* <Button className="deposit-btn" htmlType="submit">下一步</Button> */}
            <Button className="deposit-btn" htmlType="submit">
              提取
            </Button>
          </div>
        </Form>
        {/* {guideModalVisible && <GuideModal thisRouter={this.$f7router}></GuideModal>} */}
      </Page>
    );
  }
}
