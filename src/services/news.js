import { moonAPI as API } from "utils/request";

const getNewsList = (config) => {
  return API.get("/trader/news_feed", config);
}


export default {
  getNewsList,
};
