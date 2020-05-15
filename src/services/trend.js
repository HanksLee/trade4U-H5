import { moonAPI as API } from "utils/request";

const getSymbolTrend = (id, config) =>
  API.get(`/trader/symbol/${id}/trend`, config);

export default {
  getSymbolTrend,
};
