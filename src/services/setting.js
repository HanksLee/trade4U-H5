import { AxiosRequestConfig } from "axios";
import { moonAPI as API } from "utils/request";

const getAccountInfo = (config) => API.get("/trader/account", config);

const updateAccountInfo = (config) => API.patch("/trader/account", config);

const resetPassword = (config) => API.put("/trader/account/reset-pwd", config);

const getMessage = (config) => API.get("/trader/message", config);

const getNotificationmessage = (config) =>
  API.get("/trader/notificationmessage", config);

export default {
  getAccountInfo,
  updateAccountInfo,
  resetPassword,
  getMessage,
  getNotificationmessage,
};
