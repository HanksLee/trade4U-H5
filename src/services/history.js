import { moonAPI as API } from "utils/request";

const getHistoryList = (config) => {
  return API.get(`/trader/transaction`, config);
};

export default {
  getHistoryList,
};
