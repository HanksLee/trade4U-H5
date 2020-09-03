import {
  moonAPI as API,
} from "utils/request";

const getTradeList = async config => API.get('/trader/order', config);
const getCurrentTrade = async (id, config) => API.get(`/trader/order/${id}`, config);
const getTradeInfo = async config => API.get('/trader/meta-fund', config);
const createTrade = async config => API.post('/trader/order', config);
const updateTrade = async (id, config) => API.patch(`/trader/order/${id}`, config);
const closeTrade = async (id, config) => API.put(`/trader/order/${id}/close`, config);
const deleteTrade = async (id, config) => API.delete(`/trader/order/${id}/delete`, config);
const getFinishTradeList = async (queryString, config) => API.get(`/trader/finish-order?${queryString}`, config);
const getProfitrule = async () => API.get(`/trader/profitrule`, {});
const getFunds = async (id, config) => API.get(`/trader/symbol/${id}/funds`, config);

export default {
  getTradeInfo,
  getTradeList,
  getCurrentTrade,
  createTrade,
  updateTrade,
  closeTrade,
  deleteTrade,
  getFinishTradeList,
  getProfitrule,
  getFunds
};
