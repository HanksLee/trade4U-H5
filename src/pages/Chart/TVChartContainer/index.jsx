import * as React from 'react';
import Datafeed from './datafeed';
import './index.scss';
import { supportedResolution } from 'constant';

export default class TVChartContainer extends React.PureComponent {
	tvWidget = null;
  containerId = 'tv_chart_container_' + (new Date()).getTime()

	componentDidMount() {
		const widgetOptions = {
			symbol: this.props.symbol || '000',
			datafeed: Datafeed,
			interval: '1',
			container_id: this.containerId,
			library_path: '/assets/charting_library/',
			autosize: true,
			locale: 'zh',
			disabled_features: [
				'header_compare',
				'header_screenshot',
				'header_undo_redo',
				'header_screenshot',
				'control_bar',
				'header_symbol_search',
				'header_settings',
				'header_fullscreen_button',
				'go_to_date',
				'adaptive_logo',
				'main_series_scale_menu',
				'legend_widget',
				'timeframes_toolbar',
			],
		};
		this.tvWidget = new window.TradingView.widget(widgetOptions);
	}

	componentWillReceiveProps(nextProps) {
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
			<div id={this.containerId} className="TVChartContainer" />
		);
	}
}
