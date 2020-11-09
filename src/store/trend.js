import api from "services";
import { action, observable, computed, autorun, toJS, runInAction } from "mobx";
import BaseStore from "store/base";
// import axios from "axios";
import moment from "moment";

// let CancelToken = axios.CancelToken;
// let cancel;

class TrendStore extends BaseStore {
  @observable
  trendList = [];
  @observable
  KLine = {} ;



  @action
  fetchTrendList = async (id, unit) => {
    // if (cancel != undefined) {
    //   cancel();
    // }
    const res = await api.trend.getSymbolTrend(id, {
      params: {
        unit: unit
      },
      // cancelToken: new CancelToken(function executor(c) {
      //   // An executor function receives a cancel function as a parameter
      //   cancel = c;
      // }),
    });
    if (res.status === 200) {
      if (unit === "1m") {
        this.setTrendList(res.data.trend);
      } else {
        this.setKLineList(res.data.trend);
      }
    }
  }

  @action
  setTrendList = (list) => {
    const newList = this.converTrendList(list, 0, 1);
    this.trendList = [...newList];
  }

  @action
  setKLineList = (list) => {
    const DateList = list.map(item => { return moment(Number(item[0]) * 1000).format("YYYY/MM/DD") });
    this.KLine.dates = DateList.reverse();

    const DataList = list.map(item=>{
      const itemLen = item.length
      return [item[itemLen-1],item[itemLen-2],item[itemLen-3],item[itemLen-4]]
    })
    this.KLine.data = DataList.reverse();

    const volumeList = list.map(item=>{ return item[4] })
    this.KLine.volume = volumeList.reverse();
  }


  @observable
  trendUpdateList = [];

  @action
  setTrendUpdateList = (list) => {
    const newList = this.converTrendList(list, "time", "sell");
    this.trendUpdateList = [...newList];
  };


  converTrendList = (list, key1, key2) => {
    return list.map(item => {
      const date = item[key1];
      const sell = item[key2];
      return {
        time: date,
        value: sell
      };
    });
  };


}

export default new TrendStore();
