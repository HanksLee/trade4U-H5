import { moonAPI as API } from "utils/request";

const getHistoryList = (queryString, config) => {
  // API.get("/trader/transaction?page_size=50");
  return API.get(`/trader/transaction?${queryString}`, config);
};

export default {
  getHistoryList,
};
