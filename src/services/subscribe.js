import { AxiosRequestConfig } from "axios";
import { moonAPI as API } from "utils/request";

const getNewStockList = (config) => API.get("/trader/newstock", config);

// 拿使用者申购的清单
const getUserSubscribeList = (config) =>
  API.get("/trader/newstock-participate", config);

export default {
  getNewStockList,
  getUserSubscribeList,
};
