import * as React from "react";
import utils from "utils";
import { BaseReact } from "components/baseComponent";
import {
  Modal,
  Button,
  Steps
} from "antd";
import { inject, observer } from "mobx-react";
import closeModalIcon from "assets/img/close-modal-icon.svg";
import flowAccountSVG from "assets/img/flow-account.svg";
import flowAuditSVG from "assets/img/flow-audit.svg";
import flowCapitalSVG from "assets/img/flow-capital.svg";
import flowExchangeSVG from "assets/img/flow-exchange.svg";
// import stopIcon from "assets/img/stop-icon.svg";
import { PlusCircleOutlined, PlusCircleFilled } from "@ant-design/icons";

import "./index.scss";


const { Step, } = Steps;

const backBtnComponent = (self) => {
  return ([
    <Button
      onClick={() => {
        self.props.common.toggleGuideModalVisible();
      }}
    >
      返回
</Button>
  ])
}

const getDomMap = (self) => {
  const backBtn = backBtnComponent(self);
  const { configMap } = self.props.common;
  const userAuthentication = configMap["user_authentication"];
  let domMap;
  userAuthentication === 'withdraw_authentication'
    ? domMap = {
      '-1': {
        // cover: flowCapitalPng,
        cover: flowCapitalSVG,
        title: "投入资金",
        desc: "投入小笔资金·荷包赚饱饱",
        actions: [
          ...backBtn,
          <Button
            onClick={() => {
              self.props.common.toggleGuideModalVisible();
              self.clickTabBtn("view-settings-btn");
              self.goToPage("/settings/deposit");
            }}
          >
            入金
          </Button>
        ],
      },
      0: {
        // cover: flowCapitalPng,
        cover: flowCapitalSVG,
        title: "投入资金",
        desc: "投入小笔资金·荷包赚饱饱",
        actions: [
          ...backBtn,
          <Button
            onClick={() => {
              self.props.common.toggleGuideModalVisible();
              self.clickTabBtn("view-settings-btn");
              self.goToPage("/settings/deposit");
            }}
          >
            入金
          </Button>
        ],
      },
      1: {
        // cover: flowAccountPng,
        cover: flowAccountSVG,
        title: "开户去",
        desc: "一步步验证资料·立刻体验",
        actions: [
          ...backBtn,
          <Button
            onClick={() => {
              // self.props.common.toggleSettingsModalVisible();
              self.props.common.toggleGuideModalVisible();
              self.clickTabBtn("view-settings-btn");
              self.goToPage("/settings/account");
            }}
          >
            去填写
          </Button>
        ],
      },
      2: {
        // cover: flowAuditPng,
        cover: flowAuditSVG,
        title: "系统审核",
        desc: "资料审核中·请耐心等候",
        actions: [
          ...backBtn
        ],
      },
      3: {
        // cover: flowExchangePng,
        cover: flowExchangeSVG,
        title: "出金",
        desc: "您已完善资料，可开始出金",
        actions: [
          ...backBtn,
          <Button
            onClick={() => {
              self.props.common.toggleGuideModalVisible();
              self.clickTabBtn("view-settings-btn");
              self.goToPage("/settings/withdraw");
            }}
          >
            出金
          </Button>
        ],
      },
    }
    : domMap = {
      "-1": {
        // cover: flowAccountPng,
        cover: flowAccountSVG,
        title: "开户去",
        desc: "一步步验证资料·立刻体验",
        actions: [
          ...backBtn,
          <Button
            onClick={() => {
              // self.props.common.toggleSettingsModalVisible();
              self.props.common.toggleGuideModalVisible();
              self.clickTabBtn("view-settings-btn");
              self.goToPage("/settings/account");
            }}
          >
            去填写
          </Button>
        ],
      },
      0: {
        // cover: flowAccountPng,
        cover: flowAccountSVG,
        title: "开户去",
        desc: "一步步验证资料·立刻体验",
        actions: [
          ...backBtn,
          <Button
            onClick={() => {
              // self.props.common.toggleSettingsModalVisible();
              self.props.common.toggleGuideModalVisible();
              self.clickTabBtn("view-settings-btn");
              self.goToPage("/settings/account");
            }}
          >
            去填写
          </Button>
        ],
      },
      1: {
        // cover: flowAuditPng,
        cover: flowAuditSVG,
        title: "系统审核",
        desc: "资料审核中·请耐心等候",
        actions: [
          ...backBtn
        ],
      },
      2: {
        // cover: flowCapitalPng,
        cover: flowCapitalSVG,
        title: "投入资金",
        desc: "投入小笔资金·荷包赚饱饱",
        actions: [
          ...backBtn,
          <Button
            onClick={() => {
              self.props.common.toggleGuideModalVisible();
              self.clickTabBtn("view-settings-btn");
              self.goToPage("/settings/deposit");

              // self.$f7router.navigate("/market/symbol_type");
              // self.props.history.push("/dashboard/captial");
              // self.props.common.setCurrentTab("资金");
            }}
          >
            入金
          </Button>
        ],
      },
      3: {
        // cover: flowExchangePng,
        cover: flowExchangeSVG,
        title: "立马交易",
        desc: "您已成功入金·可开始下单",
        actions: [
          ...backBtn,
          <Button
            onClick={() => {
              self.props.common.toggleGuideModalVisible();
              self.goToPage("/settings/");
              self.clickTabBtn("view-market-btn");
            }}
          >
            交易去
          </Button>
        ],
      },
    };

  return domMap;
};

@inject("common", "setting")
@observer
export default class GuideModal extends BaseReact {
  state = {};

  componentDidMount() { }

  clickTabBtn = btn => {
    document.getElementById(btn).click();
    console.log(`${btn} click`)
  }

  goToPage = path => {
    const { thisRouter } = this.props.common;
    return thisRouter.navigate(path, {
      animate: false,
      reloadAll: true
    })
  }

  renderSteps = () => {
    const { configMap, } = this.props.common;
    const { userInfo, userAuthentication } = this.props.setting;
    const userAuth = configMap["user_authentication"];

    const customDot = (dot, { status, index, }) =>
      status == "finish" ? (
        <div className={"progress-circle"}></div>
      ) : (
          <PlusCircleFilled />
        );

    return (
      <Steps
        className={"guide-modal-steps"}
        size={"small"}
        current={userAuthentication}
        progressDot={customDot}
      >
        {userAuth === 'withdraw_authentication' && <Step title="入金" />}
        <Step title="完善资料" />
        <Step title="审核" />
        {(userAuth === 'not_required' || userAuth === 'deposit_authentication') && <Step title="入金" />}
        <Step title={userAuth === 'withdraw_authentication' ? '出金' : '交易'} />
      </Steps>
    );
  };

  renderTip = () => {
    // const { computedUserInfo, } = this.props.common;
    const { userAuthentication } = this.props.setting;
    const domMap = getDomMap(this);
    const domInfo = domMap[userAuthentication] || {};
    // const domInfo = domMap[STATUS] || {};

    return (
      <div className={"guide-content"}>
        <img src={domInfo?.cover} alt="" />
        <h3>{domInfo?.title}</h3>
        <p>{domInfo?.desc}</p>
        <div className={"guide-content-actions"}>
          {domInfo?.actions.map((item, index) => {
            return <span key={index}>{item}</span>;
          })}
        </div>
      </div>
    );

    return domMap[computedUserInfo?.user_status] || null;
  };

  render() {
    const { currentTab, modelTitle, currentItem, } = this.state;
    const { userAuthentication } = this.props.setting;
    const {
      onCancel,
      common: { computedUserInfo, guideModalVisible },
    } = this.props;
    const domMap = getDomMap(this);
    const domInfo = domMap[userAuthentication] || {};
    // const domInfo = domMap[STATUS] || {};
    return (
      <>
        {guideModalVisible && <Modal
          visible={true}
          title={domInfo?.title || modelTitle}
          className={"guide-modal"}
          width="100%"
          // closeIcon={<img src={closeModalIcon} alt="close-modal-icon" />}
          footer={null}
          centered
          onCancel={onCancel}
          closable={false}
        >
          <div>
            {this.renderSteps()}
            {this.renderTip()}
          </div>
        </Modal>}
      </>
    );
  }
}
