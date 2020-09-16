import { AxiosRequestConfig } from "axios";
import { moonAPI as API } from "utils/request";

const getNewStockList = (config) => API.get("/trader/newstock", config);
const getNewStockParticipateList = (config) =>
  API.get("/trader/newstock-participate", config);

export default {
  getNewStockList,
  getNewStockParticipateList,
};
