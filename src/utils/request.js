import axios from "axios";
import NProgress from "nprogress";
import utils from "utils";
import { f7 } from "framework7-react";

export default class API {
  created(config) {
    this.api = axios.create(config);
  }

  handleInterceptors() {
    this.api.interceptors.request.use(
      (config) => {
        const token = utils.getLStorage("MOON_H5_TOKEN");
        if (token) {
          config["headers"]["Authorization"] = `Token ${token}`;
        }

        NProgress.start();
        return config;
      },
      (err) => {
        NProgress.done();
        return Promise.reject(err);
      }
    );

    this.api.interceptors.response.use(
      async (res) => {
        NProgress.done();
        return res;
      },
      (err) => {
        console.log(err);
        if (err && err.data) {
          const {
            response: { data, status },
          } = err;
          if (status == 400) {
            f7.toast.show({
              text: data.message,
              position: "center",
              closeTimeout: 2000,
            });
          } else if (status == 401) {
            localStorage.removeItem("MOON_H5_TOKEN");
            f7.router.app.views.main.router.navigate("/login");
          }
        }

        NProgress.done();
        return Promise.reject(err);
      }
    );
  }

  constructor(config) {
    this.created(config);
    this.handleInterceptors();
  }

  getInstance() {
    return this.api;
  }
}

const apiMap = {
  dev: "/api/moon/api",
  qa: "http://api.cangshu360.com/api",
  prod: "http://api.cangshu360.com/api",
};

export const moonAPI = new API({
  baseURL: apiMap[process.env.MODE],
}).getInstance();
