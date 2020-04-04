import {
  moonAPI as API,
} from "utils/request";

const getTradeList = async config => API.get('/trader/order', config);
const getTradeInfo = async config => API.get('/trader/meta-fund', config);
const createTrade = async config => API.post('/trader/order', config);
const updateTrade = async (id, config) => API.patch(`/trader/order/${id}`, config);
const closeTrade = async (id, config) => API.put(`/trader/order/${id}/close`, config);

export default {
  getTradeInfo,
  getTradeList,
  createTrade,
  updateTrade,
  closeTrade,
};
