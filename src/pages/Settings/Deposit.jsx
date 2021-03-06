import intl from "react-intl-universal";
import React from "react";
import utils from "utils";
import { List, InputItem, Toast } from "antd-mobile";
import { createForm } from "rc-form";
import { Select, Form, InputNumber, Button, Spin } from "antd";
import { Page, Navbar, NavTitle, NavLeft, Link, Icon } from "framework7-react";
import { inject, observer } from "mobx-react";
import GuideModal from "components/GuideModal";
import api from "services";
import moment from "moment";
import { LoadingOutlined } from "@ant-design/icons";
import "antd/dist/antd.css";
import "./index.scss";


@createForm()
@inject("setting", "common")
@observer
export default class extends React.Component {
  // paymentWindow = null;
  formRef = React.createRef();
  state = {
    paymentMethods: [],
    // isPaying: false,
    // orderNumber: "",
    // showLoading: false,
    currentPayment: undefined,
  };

  componentDidMount() {
    this.getPaymentMethods();
  }

  getPaymentMethods = async () => {
    const res = await api.setting.getPaymentMethods();
    this.setState({
      paymentMethods: res.data,
    });
  };

  goBack = () => {
    this.props.history.goBack();
  };

  selectCurrentPayment = (value) => {
    const { paymentMethods } = this.state;

    {
      paymentMethods.map((item) => {
        if (item.id == value) {
          this.setState({ currentPayment: item });
        }
      });
    }
  };

  deposit = async (values) => {
    const { userAuthentication } = this.props.setting;
    const { toggleGuideModalVisible, configMap } = this.props.common;
    const userAuth = configMap["user_authentication"];

    //如果沒有認證或沒入金會出現提示框
    if (userAuth !== 'withdraw_authentication' && userAuthentication < 2) {
      toggleGuideModalVisible()
      return;
    }

    // if (!this.state.isPaying) {
    // try {
    const res = await api.setting.deposit({
      payment: values.payment,
      expect_amount: Number(values.expect_amount),
    });
    if (res.status === 201 && res.data.gopayurl) {
      // this.setState(
      //   {
      //     isPaying: true,
      //     orderNumber: res.data.order_number,
      //     showLoading: true,
      //   },
      //   () => {
      // this.paymentWindow = window.open(res.data.gopayurl);
      window.location.href = res.data.gopayurl;
      // this.resetForm();
      // this.checkDepositStatus();
      //   }
      // );
    } else {
      // throw new Error();
      Toast.fail("跳转支付失败，请联繫客服", 2);
    }
    // } catch (error) {
    //   Toast.fail("支付失败", 2);
    // }
    // } else {
    //   Toast.fail("请完成支付", 2);
    // }
  };

  // checkDepositStatus = async () => {
  //   if (!this.state.showLoading) return;
  //   const res = await api.setting.checkDepositStatus({
  //     params: { order_number: this.state.orderNumber },
  //   });
  //   if (res.data.status === 200) {
  //     this.getWithdrawableBalance();
  //     this.paymentWindow.close();
  //     Toast.success("充值成功", 2);
  //     this.setState({
  //       isPaying: false,
  //       orderNumber: "",
  //       showLoading: false,
  //     });
  //     this.resetForm();
  //   } else {
  //     // this.checkDepositStatus();
  //     Toast.fail("充值失败", 2);
  //   }
  // };

  resetForm = () => {
    this.formRef.current.resetFields();
    this.setState({ currentPayment: undefined })
  };

  // hideLoading = () => {
  //   this.setState({
  //     showLoading: false,
  //   });
  // };

  render() {
    // const { getFieldProps } = this.props.form;
    const { withdrawableBalance } = this.props.setting;
    const { paymentMethods, currentPayment } = this.state;
    // const { guideModalVisible } = this.props.common;
    // const { Option } = Select;
    return (
      <Page>
        <Navbar className="text-color-white">
          <NavLeft>
            <Link onClick={() => this.$f7router.back("/settings/", { force: true })}>
              <Icon color={"white"} f7={"chevron_left"} size={r(18)}></Icon>
            </Link>
          </NavLeft>
          <NavTitle>入金</NavTitle>
        </Navbar>
        <div className="withdraw-item-title">淨資產</div>
        <div className="remain-fund">{withdrawableBalance}</div>
        <Form
          // layout="vertical"
          onFinish={this.deposit}
          hideRequiredMark={true}
          ref={this.formRef}
        >
          <List>
            <div className="select-title">支付管道</div>

            <Form.Item
              name="payment"
              rules={[{ required: true, message: "请输入支付通道" }]}
              className="deposit-select"
            >
              <Select
                className="select-option deposit-select-option"
                placeholder="選擇支付管道"
                onChange={this.selectCurrentPayment}
              >
                {paymentMethods.map((item) => {
                  return (
                    <Select.Option key={item.id} value={item.id}>
                      {item.name}
                    </Select.Option>
                  );
                })}
              </Select>
            </Form.Item>
            {currentPayment && (
              <Form.Item
                className="expect-amount-text"
                name="expect_amount"
                label={
                  <>
                    <p>金额</p>
                    <p className="expect-amount-tips">
                      ＊提示：手续费{currentPayment.fee}%，入金上限{" "}
                      {currentPayment.max_deposit} / 下限{" "}
                      {currentPayment.min_deposit} ＊
                    </p>
                  </>
                }
                rules={[{ required: true, message: "请输入金额" }]}
              >
                <InputNumber
                  min={currentPayment.min_deposit}
                  max={currentPayment.max_deposit}
                  className="line-input"
                  placeholder="输入金额"
                />
              </Form.Item>
            )}
            <div className="deposit-btn-container">
              <Button className="deposit-btn" onClick={this.resetForm}>
                清除資料
              </Button>
              <Button className="deposit-btn" htmlType="submit">
                下一步
              </Button>
            </div>
          </List>
        </Form>
        {/* {guideModalVisible && <GuideModal thisRouter={this.$f7router}></GuideModal>} */}
      </Page>
    );
  }
}
