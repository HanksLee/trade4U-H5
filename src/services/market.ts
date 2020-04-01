import { AxiosRequestConfig } from "axios";
import { moonAPI as API } from "utils/request";

const getSelfSelectSymbolList = (config: AxiosRequestConfig): Promise<any> =>
  API.get("/trader/self_select_symbol", config);

const getSymbolTypeList = (config: AxiosRequestConfig): Promise<any> =>
  API.get("/trader/symbol_type", config);

const getSymbolList = (config: AxiosRequestConfig): Promise<any> =>
  API.get("/trader/symbol_type", config);

export default {
  getSelfSelectSymbolList,
  getSymbolTypeList,
  getSymbolList,
};
