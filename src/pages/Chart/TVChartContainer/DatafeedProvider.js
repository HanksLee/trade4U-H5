import api from 'services';
import ws from 'utils/ws';
import { supportedResolution } from 'constant';

const resolutionMap = {
  '1': '1m',
  '5': '5m',
  '15': '15m',
  '30': '30m',
  '60': '1h',
  '240': '4h',
  'D': '1d',
  '1D': '1d',
  '7D': '7d',
};

export default class DatafeedProvider {
  wsConnect = null;
  lastItem = null;
  interval = null;
  subscriberList = [];
  kChartData = [];

  onReady = cb => {
    setTimeout(() => {
      cb({
        supported_resolutions: supportedResolution,
      })
    }, 0);
  }

  resolveSymbol = async (symbol, onSymbolResolvedCallback) => {
    if (symbol === '000') return;
    const res = await api.trend.getSymbolTrend(symbol);
    const res2 = await api.market.getCurrentSymbol(symbol);
    const data = res.data;
    setTimeout(function() {
      onSymbolResolvedCallback({
        name: data.name,
        ticker: symbol,
        type: res2.data.product_details.type,
        description: res2.data.symbol_display.description,
        supported_resolutions: supportedResolution,
        timezone: 'Asia/Hong_Kong',
        session: '24x7',
        minmov: 1,
        pricescale: Math.pow(10, res2.data.symbol_display.decimals_place),
        minmove2: 0,
        has_intraday: true,
        // intraday_multipliers: ['1', '60'],
      })
    }, 0)
  }

  getChartData = (trend) => {
    return trend.map(item => ({
      time: item[0] * 1000, //TradingView requires bar time in ms
      low: item[6],
      high: item[5],
      open: item[8],
      close: item[7],
      volume: item[4],
    }));
  }

  getBars = async function(symbolInfo, resolution, from, to, onHistoryCallback, onErrorCallback, firstDataRequest) {
    if (!symbolInfo.name) return;

    const existingData = this.kChartData || [];
    if (existingData.length) {
      return;
    }

    const res = await api.trend.getSymbolTrend(symbolInfo.ticker, {
      params: {
        unit: resolutionMap[resolution],
      }
    })

    const bars = this.getChartData(res.data.trend);
    this.kChartData = bars;
    onHistoryCallback(bars, { noData: !bars.length, });
  
    this.wsConnect = ws(`symbol/${symbolInfo.ticker}/trend`);
    this.wsConnect.onmessage = (event) => {
      const message = event.data;
      const data = JSON.parse(message).data;
      const formatData = {
        time: data.timestamp * 1000, //TradingView requires bar time in ms
        low: data.low,
        high: data.high,
        open: data.open,
        close: data.close,
        volume: data.volume,
      };

      this.subscriberList = this.subscriberList || [];
      for (const sub of this.subscriberList) {
        if (sub.symbol !== this.symbol || sub.resolution !== resolution) {
          this.kChartData = [];
          return;
        }
        if (typeof sub.callback !== 'function') return;
        sub.callback(formatData);
      }
    }
  }

  subscribeBars = (symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback) => {
    this.subscriberList = this.subscriberList || [];
    const found = this.subscriberList.some(n => n.uid === subscriberUID);
    if (found) return;

    this.subscriberList.push({
      symbol: symbolInfo,
      resolution: resolution,
      uid: subscriberUID,
      callback: onRealtimeCallback,
    });
  }

  unsubscribeBars = (subscriberUID) => {
    this.subscriberList = this.subscriberList || [];
    const idx = this.subscriberList.findIndex(n => n.uid === subscriberUID);
    if (idx < 0) return;
    this.subscriberList.splice(idx, 1);
  }
}