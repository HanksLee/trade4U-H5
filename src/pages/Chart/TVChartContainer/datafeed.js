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
	'7D': '7d',
};
let wsConnect = null;
let lastItem = null;

export default {
	onReady: cb => {
		console.log('onReady')
    setTimeout(() => {
      cb({
        supported_resolutions: supportedResolution,
      })
    }, 0);
	},

	resolveSymbol: async (symbol, onSymbolResolvedCallback) => {
		console.log('resolveSymbol', symbol);
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
			})
		}, 0)
	},

	getBars: async function(symbolInfo, resolution, from, to, onHistoryCallback, onErrorCallback, firstDataRequest) {
		console.log('=====getBars running', symbolInfo, resolution, firstDataRequest)
		if (!symbolInfo.name) return;
		if (firstDataRequest) {
			const res = await api.trend.getSymbolTrend(symbolInfo.ticker, {
				params: {
					unit: resolutionMap[resolution],
				}
			})
			const trend = res.data.trend;
			const bars = [];
			trend.forEach(item => {
				bars.push({
					time: item[0] * 1000, //TradingView requires bar time in ms
					low: item[6],
					high: item[5],
					open: item[8],
					close: item[7],
					volume: item[4] 
				})
			});
			console.log('bars', bars)
			if (bars.length) {
				onHistoryCallback(bars, {noData: false})
			} else {
				onHistoryCallback(bars, {noData: true})
			}
		}
	},

	subscribeBars: (symbolInfo, _, onRealtimeCallback) => {
		console.log('subscribeBars');
		wsConnect = ws(`symbol/${symbolInfo.ticker}/trend`);
		wsConnect.onmessage = () => {
			const message = event.data;
			const data = JSON.parse(message).data;
			if (!lastItem) {
				lastItem = data;
			} else if (lastItem.timestamp >= data.timestamp) {
        return;
			}
			console.log('sub', data)
			onRealtimeCallback({
				time: data.timestamp * 1000, //TradingView requires bar time in ms
				low: data.low,
				high: data.high,
				open: data.open,
				close: data.close,
				volume: data.volume,
			});
		}
	},

	unsubscribeBars: () => {
		console.log('unsubscribeBars');
		wsConnect.close();
	}
}