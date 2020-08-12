import intl from "react-intl-universal";
import React from "react";
import utils from "utils";
import { WhiteSpace } from "antd-mobile";
import { Page, Navbar, NavRight } from "framework7-react";
import api from "services";
import moment from "moment";
import "./index.scss";

export default class extends React.Component {
  state = {
    notification: {},
  };

  componentWillMount() {
    this.getNotificationMessageList();
  }

  renderNotificationCard = () => {
    const { notification } = this.state;
    const notificationCard = [];
    for (let item in notification) {
      notificationCard.push(
        <div className="card-container">
          <div className="card-title-container">
            <p className="card-title">{notification[item].title}</p>
            <p className="card-time">
              {moment(notification[item].create_time * 1000).format(
                "YYYY/MM/DD HH:mm:ss"
              )}
            </p>
          </div>
          <div className="card-content-container">
            <p className="card-content">{notification[item].content}</p>
          </div>
        </div>
      );
    }
    return <>{notificationCard}</>;
  };

  getNotificationMessageList = async () => {
    // const tempArray = [];
    const res = await api.setting.getNotificationmessage();
    if (res.status === 200) {
      this.setState({
        notification: res.data.results,
      });
    }
  };

  render() {
    const { notification } = this.state;
    return (
      <Page>
        <Navbar
          title={intl.get("settings.message.announcement")}
          backLink="Back"
          className="text-color-white"
        >
          <NavRight>
            {/* <div onClick={this.handleSubmit}>確認</div> */}
          </NavRight>
        </Navbar>
        <div className="card-wrap">
          {utils.isEmpty(notification) === false &&
            this.renderNotificationCard()}
        </div>
      </Page>
    );
  }
}
