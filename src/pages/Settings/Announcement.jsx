import intl from "react-intl-universal";
import React from "react";
import utils from "utils";
import { WhiteSpace } from "antd-mobile";
import { Page, Navbar, NavTitle, NavLeft, Link, Icon } from "framework7-react";
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
        <Navbar className="text-color-white">
          <NavLeft>
            <Link onClick={() => this.$f7router.back({ force: false })}>
              <Icon color={"white"} f7={"chevron_left"} size={r(18)}></Icon>
            </Link>
          </NavLeft>
          <NavTitle>{intl.get("settings.message.announcement")}</NavTitle>
        </Navbar>
        <div className="card-wrap">
          {!utils.isEmpty(announcement) ? (
            this.renderAnnouncementCard()
          ) : (
            <div className="no-message">暂无站內公告</div>
          )}
        </div>
      </Page>
    );
  }
}
