import { AxiosRequestConfig } from "axios";
import { moonAPI as API } from "utils/request";

const getNewStockList = async (config) => API.get("/trader/newstock", config);

// 拿使用者申购的清单
const getUserSubscribeList = async (config) =>
  API.get("/trader/newstock-participate", config);

const createSubscribeOrder = async (config) =>
  API.post("broker/newstock-participate", config);
export default {
  getNewStockList,
  getUserSubscribeList,
  createSubscribeOrder,
};
