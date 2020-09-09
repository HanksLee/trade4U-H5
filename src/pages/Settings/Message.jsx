import intl from "react-intl-universal";
import React from "react";
import utils from "utils";
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
import moment from "moment";
// import ws from "utils/ws";
import { inject, observer } from "mobx-react";
import "./index.scss";

@inject("message")
@observer
export default class extends React.Component {
  wsConnect = null;
  state = {
    announcement: {},
    notification: {},
  };

  componentWillMount() {
    this.getNotificationMessageList();
    this.getMessageList();
    // this.connnetWebsocket();
  }

  // componentWillUnmount = () => {
  //   if (this.wsConnect) {
  //     this.wsConnect.close();
  //   }
  // };

  // connnetWebsocket = () => {
  //   this.wsConnect = ws("notify");
  //   console.log(this.wsConnect);
  //   this.wsConnect.onmessage = (event) => {
  //     console.log(event);
  //     const message = event.data;

  //     const type = JSON.parse(message).type;
  //     if (type == "notify") {
  //       this.setState({ hasNotify: true });
  //     }
  //     if (type == "announcement") {
  //       this.setState({ hasAnnouncement: true });
  //     }
  //   };
  // };

  goAnnouncement = () => {
    this.props.message.switchHasAnnouncementStatus(false);
    this.$f7router.navigate("/settings/message/announcement");
  };

  goNotification = () => {
    this.props.message.switchHasNotifyStatus(false);
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
  };

  render() {
    const { announcement, notification } = this.state;
    const { hasNotify, hasAnnouncement } = this.props.message;
    return (
      <Page>
        <Navbar className="text-color-white">
          <NavLeft>
            <Link onClick={() => this.$f7router.back({ force: false })}>
              <Icon color={"white"} f7={"chevron_left"} size={r(18)}></Icon>
            </Link>
          </NavLeft>
          <NavTitle>{intl.get("settings.message")}</NavTitle>
          <NavRight></NavRight>
        </Navbar>

        {announcement && (
          <div
            className="message-wrap announcement"
            onClick={this.goAnnouncement}
          >
            <div className="message-icon-container">
              {hasAnnouncement && <span className="has-unread-message"></span>}
              <div className="message-icon announcement-icon">
                <img
                  src="../../../assets/img/announcement-icon.svg"
                  alt="announcement-icon.svg"
                />
              </div>
            </div>
            <div className="message-content-container">
              <p className="message-content-title">站內公告</p>
              <p className="message-content-time">
                <span className="message-date">
                  {moment(announcement["create_time"] * 1000).format(
                    "YYYY/MM/DD"
                  )}
                </span>
                <span>
                  {moment(announcement["create_time"] * 1000).format(
                    "HH:mm:ss"
                  )}
                </span>
              </p>
              <p
                className="message-content-content"
                dangerouslySetInnerHTML={{
                  __html:
                    announcement["content"] &&
                    announcement["content"].length > 20
                      ? `${announcement["content"].substr(0, 20)}...`
                      : announcement["content"],
                }}
              ></p>
            </div>
            <div className="message-goto-container">
              <i className="icon icon-forward"></i>
            </div>
          </div>
        )}
        {notification && (
          <div className="message-wrap" onClick={this.goNotification}>
            <div className="message-icon-container">
              {hasNotify && <span className="has-unread-message"></span>}
              <div className="message-icon notice-icon">
                <img
                  src="../../../assets/img/notice-icon.svg"
                  alt="notice-icon.svg"
                />
              </div>
            </div>
            <div className="message-content-container">
              <p className="message-content-title">服务消息</p>
              <p className="message-content-time">
                <span className="message-date">
                  {moment(notification["create_time"] * 1000).format(
                    "YYYY/MM/DD"
                  )}
                </span>
                <span>
                  {moment(notification["create_time"] * 1000).format(
                    "HH:mm:ss"
                  )}
                </span>
              </p>
              <p className="message-content-content">
                {notification["title"]}
                ...
              </p>
            </div>
            <div className="message-goto-container">
              <i className="icon icon-forward"></i>
            </div>
          </div>
        )}
      </Page>
    );
  }
}
