import { AxiosRequestConfig } from "axios";
import { moonAPI as API } from "utils/request";

const getAccountInfo = (config) => API.get("/trader/account", config);

const updateAccountInfo = (config) => API.patch("/trader/account", config);

const resetPassword = (config) =>
  API.put("/trader/account/reset-pwd", config);

const sendSMS = (config) => API.post("/trader/send-sms", config);

const verifySMS = (config) => API.post("/trader/verify-sms", config);

const getMessage = (config) => API.get("/trader/message", config);

const getNotificationmessage = (config) =>
  API.get("/trader/notificationmessage", config);

const getWithdrawableBalance = (config) =>
  API.get('/trader/withdrawable_balance', config);

const withdraw = (config) =>
  API.post('/trader/withdraw', config);

const getPaymentMethods = () =>
  API.get("/trader/payment");

const deposit = (config) =>
  API.post('/trader/deposit', config);

const checkDepositStatus = (config) =>
  API.get('/trader/deposit', config);

export default {
  getAccountInfo,
  updateAccountInfo,
  resetPassword,
  sendSMS,
  verifySMS,
  getMessage,
  getNotificationmessage,
  getWithdrawableBalance,
  withdraw,
  getPaymentMethods,
  deposit,
  checkDepositStatus
};
