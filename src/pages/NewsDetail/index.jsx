import api from 'services';
import React from 'react';
import {
  Page, Navbar, NavRight, NavLeft, NavTitle, Icon, Link,
} from 'framework7-react';
import { Tabs } from "antd-mobile";
import { inject, observer } from "mobx-react";
import { Spin } from 'antd';
import { LoadingOutlined } from "@ant-design/icons";
import moment from 'moment';
import Dom7 from 'dom7';
import './index.scss';
import utils from 'utils';

export default class extends React.Component {
  state = {
  }

  componentDidMount() {
    console.log(this.props)
  }

  componentDidUpdate() {
    // this.switchActiveDot(0);
  }


  render() {
    const { newsDetail } = this.props;
    return (
      <Page className="news-detail">
        <Navbar className="news-detail-navbar">
          <NavLeft>
            <Link onClick={() => this.$f7router.back()}>
              <Icon color={'white'} f7={'chevron_left'} size={r(18)}></Icon>
            </Link>
          </NavLeft>
          <NavTitle>新闻详情</NavTitle>
          <NavRight>
          </NavRight>
        </Navbar>
        <div className="news-detail-title">
          <p class="news-detail-title-text">{newsDetail.title}</p>
          <p class="news-detail-title-time">{moment(newsDetail.pub_time * 1000).format(
            "YYYY/MM/DD HH:mm:ss"
          )}</p>
        </div>
        <div className="news-detail-content"
          dangerouslySetInnerHTML={{
            __html:
              newsDetail.content
          }}
        >

        </div>
      </Page >
    );
  }
}
