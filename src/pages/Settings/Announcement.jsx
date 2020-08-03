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
    announcement: {},
  };

  componentWillMount() {
    this.getMessageList();
  }

  renderAnnouncementCard = () => {
    const { announcement } = this.state;
    const announcementCard = [];
    for (let item in announcement) {
      announcementCard.push(
        <div className="card-container">
          <div className="card-title-container">
            <p className="card-title">{announcement[item].title}</p>
            <p className="card-time">
              {moment(announcement[item].create_time * 1000).format(
                "YYYY/MM/DD HH:mm:ss"
              )}
            </p>
          </div>
          <div className="card-content-container">
            <p
              className="card-content"
              dangerouslySetInnerHTML={{ __html: announcement[item].content }}
            ></p>
          </div>
        </div>
      );
    }
    return <>{announcementCard}</>;
  };

  getMessageList = async () => {
    // const tempArray = [];
    const res = await api.setting.getMessage();
    if (res.status === 200) {
      this.setState({
        announcement: res.data.results,
      });
    }
  };

  render() {
    const { announcement } = this.state;
    return (
      <Page>
        <Navbar
          title={intl.get("settings.message.announcement")}
          backLink="Back"
          class="text-color-white"
        >
          <NavRight>
            {/* <div onClick={this.handleSubmit}>確認</div> */}
          </NavRight>
        </Navbar>
        <div className="card-wrap">
          {utils.isEmpty(announcement) === false &&
            this.renderAnnouncementCard()}
        </div>
      </Page>
    );
  }
}
