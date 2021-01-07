import intl from "react-intl-universal";
import React from "react";
import utils from "utils";
import { WhiteSpace } from "antd-mobile";
import { Page, Navbar, NavTitle, NavLeft, Link, Icon } from "framework7-react";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import api from "services";
import moment from "moment";
import "./index.scss";

export default class Announcement extends React.Component {
  state = {
    announcement: {},
    dataLoading: false,
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
    this.setState({ dataLoading: true }, async()=>{
      const res = await api.setting.getMessage();
      if (res.status === 200) {
        this.setState({
          announcement: res.data.results,
          dataLoading: false
        });
      }
    })
  };

  render() {
    const { announcement, dataLoading,  } = this.state;
    return (
        <div className="card-wrap">
          {dataLoading
          ?<div className="spin-container">
            <Spin
              indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
            />
          </div>
          :!utils.isEmpty(announcement) ? (
              this.renderAnnouncementCard()
            ) : (
              <div className="no-message">暂无站內公告</div>
            )
          }
        </div>
    );
  }
}
