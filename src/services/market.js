import { AxiosRequestConfig } from "axios";
import { moonAPI as API } from "utils/request";

const getSelfSelectSymbolList = (queryString, config) => {
  return API.get(`/trader/self_select_symbol?${queryString}`, config);
}

const addSelfSelectSymbolList = (config) =>
  API.post("/trader/self_select_symbol", config);

const deleteSelfSelectSymbolList = (config) =>
  API.delete("/trader/self_select_symbol", config);

const sortSelfSelectSymbolList = (config) =>
  API.post("/trader/symbol_sort", config);

const getSymbolTypeList = (config) =>
  API.get("/trader/symbol_type", config);

const getSymbolList = (config) =>
  API.get("/trader/symbol", config);

const getCurrentSymbol = (id, config = {}) => API.get(`/trader/symbol/${id}`, config);

export default {
  getSelfSelectSymbolList,
  addSelfSelectSymbolList,
  deleteSelfSelectSymbolList,
  sortSelfSelectSymbolList,
  getSymbolTypeList,
  getSymbolList,
  getCurrentSymbol,
};
