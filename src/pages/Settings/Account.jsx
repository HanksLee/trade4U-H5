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
    id_card_front: "",
    id_card_back: "",
    emailError: false,
    idCardError: false,
    mobileError: false,
    postalError: false,
    isDiasble: true
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
        isDiasble: (res.data.inspect_status === 1 || res.data.inspect_status === 2) ? true : false
      });
    }
  };

  goBack = () => {
    this.props.history.goBack();
  };

  beforeIdCardFrontUpload = (file) => {
    this.uploadFile(file, "id_card_front");
    return false;
  };

  beforeIdCardBackUpload = (file) => {
    this.uploadFile(file, "id_card_back");
    return false;
  };

  uploadFile = async (file, name) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.common.uploadFile(formData);
    this.setState({
      [name]: res.data.file_path,
    });
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

  onMobileBlur = (value) => {
    if (/^[0-9]*$/.test(value) == false) {
      this.setState({
        idCardError: true,
      });
    } else {
      this.setState({
        idCardError: false,
      });
    }
  };

  onPostalBlur = (value) => {
    if (/^[0-9]*$/.test(value) == false) {
      this.setState({
        idCardError: true,
      });
    } else {
      this.setState({
        idCardError: false,
      });
    }
  };

  onIDCardBlur = (value) => {
    if (/^[0-9]*$/.test(value) == false) {
      this.setState({
        idCardError: true,
      });
    } else {
      this.setState({
        idCardError: false,
      });
    }
  };

  onEmailBlur = (value) => {
    if (
      /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/.test(
        value
      ) === false
    ) {
      this.setState({
        emailError: true,
      });
    } else {
      this.setState({
        emailError: false,
      });
    }
  };

  handleSubmit = async (evt) => {
    const { id_card_back, id_card_front } = this.state;
    this.props.form.validateFields(async (err, values) => {
      if (!err) {
        let payload = {
          last_name: values.last_name,
          first_name: values.first_name,
          birth:
            values.birth == "" ? "" : moment(values.birth).format("YYYY-MM-DD"),
          id_card: values.id_card,
          mobile: values.mobile,
          nationality:
            values.nationality == undefined
              ? ""
              : values.nationality.toString(),
          country_of_residence:
            values.country_of_residence == undefined
              ? ""
              : values.country_of_residence.toString(),
          street: values.street,
          city: values.city,
          postal: values.postal,
          email: values.email,
          id_card_back,
          id_card_front,
          inspect_status: 1,
        };

        const res = await api.setting.updateAccountInfo(payload);

        if (res.status === 200) {
          Toast.success("帐号资料更新成功", 1);
          this.getList();
        }
      } else {
        Toast.fail("格式有误，请再做检查", 2);
      }
    });
  };

  render() {
    const { userInfo, id_card_back, id_card_front, isDiasble } = this.state;
    const { getFieldProps } = this.props.form;
    return (
      <Page>
        <Navbar
          title={intl.get("settings.account")}
          backLink="Back"
          className="text-color-white"
        >
          {(userInfo["inspect_status"] !== 0 &&
            userInfo["inspect_status"] !== 3)
            ? <NavRight></NavRight>
            : (
              <NavRight>
                <div onClick={this.handleSubmit}>
                  {intl.get("settings.confirm")}
                </div>
              </NavRight>
            )}
        </Navbar>
        <div className="info-status-wrap">
          <div className="info-status-line"></div>
          {userInfo["inspect_status"] === 0 && (
            <div className="info-status">
              <img
                src="../../../assets/img/unfinished.svg"
                alt="unfinished.svg"
              />
              <p className="ant-upload-text">
                {intl.get("settings.account.fill-out-a-form")}
              </p>
            </div>
          )}
          {userInfo["inspect_status"] !== 0 && (
            <div className="info-status">
              <img src="../../../assets/img/success.svg" alt="success.svg" />
              <p className="ant-upload-text" style={{ color: "#4a93f4" }}>
                {intl.get("settings.account.fill-out-a-form")}
              </p>
            </div>
          )}
          {userInfo["inspect_status"] === 0 && (
            <div className="info-status">
              <img
                src="../../../assets/img/unfinished.svg"
                alt="unfinished.svg"
              />
              <p className="ant-upload-text">
                {intl.get("settings.account.verifying-form")}
              </p>
            </div>
          )}
          {userInfo["inspect_status"] === 1 && (
            <div className="info-status">
              <img src="../../../assets/img/finished.svg" alt="finished.svg" />
              <p className="ant-upload-text" style={{ color: "#6dd400" }}>
                {intl.get("settings.account.verifying-form")}
              </p>
            </div>
          )}
          {(userInfo["inspect_status"] === 2 ||
            userInfo["inspect_status"] === 3) && (
              <div className="info-status">
                <img src="../../../assets/img/success.svg" alt="success.svg" />
                <p className="ant-upload-text" style={{ color: "#4a93f4" }}>
                  {intl.get("settings.account.verifying-form")}
                </p>
              </div>
            )}
          {(userInfo["inspect_status"] === 0 ||
            userInfo["inspect_status"] === 1) && (
              <div className="info-status">
                <img
                  src="../../../assets/img/unfinished.svg"
                  alt="unfinished.svg"
                />
                <p className="ant-upload-text">
                  {intl.get("settings.account.wait")}
                </p>
              </div>
            )}
          {userInfo["inspect_status"] === 2 && (
            <div className="info-status">
              <img src="../../../assets/img/success.svg" alt="success.svg" />
              <p className="ant-upload-text" style={{ color: "#4a93f4" }}>
                {intl.get("settings.account.success")}
              </p>
            </div>
          )}
          {userInfo["inspect_status"] === 3 && (
            <div className="info-status">
              <img src="../../../assets/img/reject.svg" alt="reject.svg" />
              <p className="ant-upload-text" style={{ color: "#ff3b30" }}>
                {intl.get("settings.account.failed")}
              </p>
            </div>
          )}
        </div>
        {!utils.isEmpty(userInfo["reason"]) &&
          userInfo["inspect_status"] === 3 && (
            <div className="error-msg">{`未通过信息：${userInfo["reason"]}`}</div>
          )}
        <List>
          <InputItem disabled={isDiasble}
            {...getFieldProps("first_name", {
              initialValue: userInfo["first_name"] || "",
            })}
            placeholder={intl.get("settings.account.firstname.placeholder")}
          >
            {intl.get("settings.account.firstname")}
          </InputItem>
          <InputItem disabled={isDiasble}
            {...getFieldProps("last_name", {
              initialValue: userInfo["last_name"] || "",
            })}
            placeholder={intl.get("settings.account.lastname.placeholder")}
          >
            {intl.get("settings.account.lastname")}
          </InputItem>
          <DatePicker disabled={isDiasble}
            {...getFieldProps("birth", {
              initialValue: new Date(userInfo["birth"]) || undefined,
            })}
            mode="date"
            title={intl.get("settings.account.birth")}
            minDate={new Date(1900, 1, 1, 0, 0, 0)}
            extra={intl.get("settings.account.birth.extra")}
            format="YYYY-MM-DD"
          >
            <List.Item arrow="horizontal" className="select-item">
              {intl.get("settings.account.birth")}
            </List.Item>
          </DatePicker>
          <InputItem disabled={isDiasble}
            {...getFieldProps("id_card", {
              initialValue: userInfo["id_card"] || "",
              validateTrigger: "onBlur",
            })}
            error={this.state.idCardError}
            onBlur={this.onIDCardBlur}
            onErrorClick={this.onErrorClick}
            placeholder={intl.get("settings.account.id-card.placeholder")}
          >
            {intl.get("settings.account.id-card")}
          </InputItem>
        </List>

        {/* <WhiteSpace size="xl" /> */}

        <div className="id-card-title">
          {intl.get("settings.account.id-card-photo")}
        </div>
        <div className="id-card-form">
          <Upload disabled={isDiasble}
            accept="image/*"
            listType="picture-card"
            showUploadList={false}
            beforeUpload={this.beforeIdCardFrontUpload}
          >
            {id_card_front ? (
              <div className="upload-image-preview">
                <img
                  src={id_card_front}
                  alt="id-card-front"
                // style={{ height: "100%" }}
                />
              </div>
            ) : (
                <div className="upload-image-preview">
                  <div>
                    <img src="../../../assets/img/camera.svg" alt="camera" />
                    <p className="ant-upload-text">
                      {intl.get("settings.account.id-card-front.placeholder")}
                    </p>
                  </div>
                </div>
              )}
          </Upload>
          <Upload disabled={isDiasble}
            accept="image/*"
            listType="picture-card"
            showUploadList={false}
            beforeUpload={this.beforeIdCardBackUpload}
          >
            {id_card_back ? (
              <div className="upload-image-preview">
                <img
                  src={id_card_back}
                  alt="id-card-back"
                // style={{ height: "100%" }}
                />
              </div>
            ) : (
                <div className="upload-image-preview">
                  <div>
                    <img src="../../../assets/img/camera.svg" alt="camera" />
                    <p className="ant-upload-text">
                      {intl.get("settings.account.id-card-back.placeholder")}
                    </p>
                  </div>
                </div>
              )}
          </Upload>
        </div>

        {/* <WhiteSpace size="xl" /> */}

        <List>
          <InputItem disabled={isDiasble}
            {...getFieldProps("mobile", {
              initialValue: userInfo["mobile"] || "",
              validateTrigger: "onBlur",
            })}
            type="number"
            error={this.state.mobileError}
            onBlur={this.onMobileBlur}
            onErrorClick={this.onErrorClick}
            placeholder={intl.get("settings.account.mobile.placeholder")}
          >
            {intl.get("settings.account.mobile")}
          </InputItem>
          <Picker disabled={isDiasble}
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
          <Picker disabled={isDiasble}
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
          <InputItem disabled={isDiasble}
            {...getFieldProps("street", {
              initialValue: userInfo["street"] || "",
            })}
            placeholder={intl.get("settings.account.street.placeholder")}
          >
            {intl.get("settings.account.street")}
          </InputItem>
        </List>

        {/* <WhiteSpace size="xl" /> */}

        <List>
          <InputItem disabled={isDiasble}
            {...getFieldProps("city", {
              initialValue: userInfo["city"] || "",
            })}
            placeholder={intl.get("settings.account.city.placeholder")}
          >
            {intl.get("settings.account.city")}
          </InputItem>
          <InputItem disabled={isDiasble}
            {...getFieldProps("postal", {
              initialValue: userInfo["postal"] || "",
              validateTrigger: "onBlur",
            })}
            type="number"
            error={this.state.postalError}
            onBlur={this.onPostalBlur}
            onErrorClick={this.onErrorClick}
            placeholder={intl.get("settings.account.postal-code.placeholder")}
          >
            {intl.get("settings.account.postal-code")}
          </InputItem>
        </List>

        {/* <WhiteSpace size="xl" /> */}

        <List>
          <InputItem disabled={isDiasble}
            {...getFieldProps("email", {
              initialValue: userInfo["email"] || "",
              validateTrigger: "onBlur",
            })}
            placeholder={intl.get("settings.account.email.placeholder")}
            error={this.state.emailError}
            onBlur={this.onEmailBlur}
            onErrorClick={this.onErrorClick}
          >
            {intl.get("settings.account.email")}
          </InputItem>
        </List>

        {/* <WhiteSpace size="xl" /> */}
      </Page>
    );
  }
}
