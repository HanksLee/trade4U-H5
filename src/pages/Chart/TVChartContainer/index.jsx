import * as React from 'react';
import Datafeed from './datafeed';
import './index.scss';
import { supportedResolution } from 'constant';

export default class TVChartContainer extends React.PureComponent {
	static defaultProps = {
		libraryPath: '/assets/charting_library/',
		chartsStorageUrl: 'https://saveload.tradingview.com',
		chartsStorageApiVersion: '1.1',
		clientId: 'tradingview.com',
		userId: 'public_user_id',
		fullscreen: false,
		autosize: true,
		studiesOverrides: {},
	};

	tvWidget = null;

	componentDidMount() {
		console.log('componentDidMount', this.props.symbol);
		const widgetOptions = {
			symbol: this.props.symbol || '000',
			datafeed: Datafeed,
			interval: '1',
			container_id: 'tv_chart_container',
			library_path: '/assets/charting_library/',
			autosize: true,
			locale: 'zh',
			disabled_features: [
				'header_compare',
				'header_screenshot',
				'header_undo_redo',
				'header_screenshot'
			],
		};

		this.tvWidget = new window.TradingView.widget(widgetOptions);
	}

	componentWillReceiveProps(nextProps) {
		console.log('componentWillReceiveProps', this.props.symbol, nextProps.symbol)
    if (this.props.symbol !== nextProps.symbol) {
			this.tvWidget.onChartReady(() => {
				this.tvWidget.setSymbol(nextProps.symbol, supportedResolution);
			})
		}
	}

	componentWillUnmount() {
		if (this.tvWidget !== null) {
			this.tvWidget.remove();
			this.tvWidget = null;
		}
	}

	render() {
		return (
			<div id="tv_chart_container" className="TVChartContainer" />
		);
	}
}
