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
import { Page, Navbar } from "framework7-react";
import api from "services";
import moment from "moment";
import "./index.scss";

export default class extends React.Component {
  state = {
    announcement: {},
    notification: {},
  };

  componentWillMount() {
    this.getNotificationMessageList();
    this.getMessageList();
  }

  goAnnouncement = () => {
    this.$f7router.navigate("/settings/message/announcement");
  };

  goNotification = () => {
    this.$f7router.navigate("/settings/message/notification");
  };

  getNotificationMessageList = async () => {
    const res = await api.setting.getNotificationmessage();
    if (res.status === 200) {
      this.setState({
        notification: res.data.results[0],
      });
    }
  };

  getMessageList = async () => {
    // const tempArray = [];
    const res = await api.setting.getMessage();
    if (res.status === 200) {
      this.setState({
        announcement: res.data.results[0],
      });
    }

    // res.data.results.forEach(function(item, index, array) {
    //   if (tempArray.indexOf(item.message_type_title) < 0) {
    //     tempArray.push(item.message_type_title);
    //   }
    // });

    // const announcement = res.data.results.find(function(item, index, array) {
    //   return item.message_type_title == tempArray[0];
    // });

    // const notice = res.data.results.find(function(item, index, array) {
    //   return item.message_type_title == tempArray[1];
    // });

    // this.setState({
    //   announcement: announcement,
    //   notice: notice
    // });
  };

  render() {
    const { announcement, notification } = this.state;
    return (
      <Page>
        <Navbar
          title={intl.get("settings.message")}
          backLink="Back"
          class="text-color-white"
        >
          {/* <NavRight>
            <div onClick={this.handleSubmit}>確認</div>
          </NavRight> */}
        </Navbar>
        {announcement && (
          <div
            className="message-wrap announcement"
            onClick={this.goAnnouncement}
          >
            <div className="message-icon-container">
              <img
                src="../../../assets/img/announcement-icon.svg"
                alt="announcement-icon.svg"
              />
            </div>
            <div className="message-content-container">
              <p className="message-content-title">
                {announcement["message_type_title"]}
              </p>
              <p className="message-content-time">
                <span className="message-date">
                  {moment(announcement["create_time"]).format("YYYY/MM/DD")}
                </span>
                <span>
                  {moment(announcement["create_time"]).format("hh:mm:ss")}
                </span>
              </p>
              <p className="message-content-content">
                {announcement["content"] && announcement["content"].length > 20
                  ? announcement["content"].substr(0, 20)
                  : announcement["content"]}
                ...
              </p>
            </div>
            <div className="message-goto-container">
              <span>></span>
            </div>
          </div>
        )}
        {/* <WhiteSpace size="xs" /> */}
        {notification && (
          <div className="message-wrap" onClick={this.goNotification}>
            <div className="message-icon-container">
              <img
                src="../../../assets/img/notice-icon.svg"
                alt="notice-icon.svg"
              />
            </div>
            <div className="message-content-container">
              <p className="message-content-title">服务消息</p>
              <p className="message-content-time">
                <span className="message-date">
                  {moment(notification["create_time"]).format("YYYY/MM/DD")}
                </span>
                <span>
                  {moment(notification["create_time"]).format("hh:mm:ss")}
                </span>
              </p>
              <p className="message-content-content">
                {notification["title"]}
                ...
              </p>
            </div>
            <div className="message-goto-container">
              <span>></span>
            </div>
          </div>
        )}
      </Page>
    );
  }
}
