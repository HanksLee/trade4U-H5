import React from "react";
import { Page, Navbar, NavTitle, NavLeft, Link, Icon, NavRight } from "framework7-react";
import "antd/dist/antd.css";
import "./index.scss";

export default class extends React.Component {
  state = {
  };

  componentDidMount() {}

  render() {
    return (
      <Page>
        <Navbar className="text-color-white">
          <NavLeft>
            <Link onClick={() => this.$f7router.back({ force: false })}>
              <Icon color={"white"} f7={"chevron_left"} size={r(18)}></Icon>
            </Link>
          </NavLeft>
          <NavTitle>联繫我们</NavTitle>
          <NavRight>
          </NavRight>
        </Navbar>

        <div className="card-wrap">
          <span className="select-title QQ">ＱＱ号：676952317</span>
        </div>
      </Page>
    );
  }
}
