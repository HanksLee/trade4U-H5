import { toJS } from "mobx";

const kLineConfig = (kLine) => {
  // console.log(kLine)
  // const kLine = toJS(self.trend.KLine);
  const dates = kLine.dates;
  const data = kLine.data;
  const volume = kLine.volume;
  const calculateMA = (dayCount, data)=>{
    let result = [];
    for (let i = 0, len = data.length; i < len; i++) {
      if (i < dayCount) {
        result.push("-");
        continue;
      }
      let sum = 0;
      for (let j = 0; j < dayCount; j++) {
        sum += data[i - j][1];
      }
      result.push((sum / dayCount).toFixed(2));
    }
    return result;
  }
  const option = {
    backgroundColor: '#21202D',
    legend: {
        data: ['日K', 'MA5', 'MA10', 'MA20', 'MA30'],
        inactiveColor: '#777',
        textStyle: {
            color: '#fff'
        }
    },
    tooltip: {
        trigger: 'axis',
        // axisPointer: {
        //     animation: false,
        //     type: 'cross',
        //     lineStyle: {
        //         color: '#376df4',
        //         width: 2,
        //         opacity: 1
        //     }
        // },
        
      position: function (point, params, dom, rect, size) {

        dom.style.transform = 'translateZ(0)'  //处理ios,不显示tooltip

        // 鼠标坐标和提示框位置的参考坐标系是：以外层div的左上角那一点为原点，x轴向右，y轴向下
        // 提示框位置
        var x = 0; // x坐标位置
        var y = 0; // y坐标位置
      
        // 当前鼠标位置
        var pointX = point[0];
        var pointY = point[1];
      
        // 外层div大小
        var viewWidth = size.viewSize[0];
        var viewHeight = size.viewSize[1];
      
        // 提示框大小
        var boxWidth = size.contentSize[0];
        var boxHeight = size.contentSize[1];
      
        // boxWidth > pointX 说明鼠标左边放不下提示框
        if (boxWidth > pointX) {
          x = pointX ;
        } else { // 左边放的下
          x = pointX - boxWidth;
        }
      
        // boxHeight > pointY 说明鼠标上边放不下提示框
        if (boxHeight > pointY) {
          y = pointY;
        } else { // 上边放得下
          y = pointY - boxHeight;
        }

        if (boxHeight + pointY > viewHeight) {
          y = viewHeight - boxHeight;
        }
        return [x, y];
      }
    },
    xAxis: {
        type: 'category',
        data: dates,
        axisLine: { lineStyle: { color: '#8392A5' } }
    },
    yAxis: {
        scale: true,
        axisLine: { lineStyle: { color: '#8392A5' } },
        splitLine: { show: false }
    },
    grid: {
        bottom: 80
    },
    // dataZoom: [{
    //     textStyle: {
    //         color: '#8392A5'
    //     },
    //     handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
    //     handleSize: '80%',
    //     dataBackground: {
    //         areaStyle: {
    //             color: '#8392A5'
    //         },
    //         lineStyle: {
    //             opacity: 0.8,
    //             color: '#8392A5'
    //         }
    //     },
    //     handleStyle: {
    //         color: '#fff',
    //         shadowBlur: 3,
    //         shadowColor: 'rgba(0, 0, 0, 0.6)',
    //         shadowOffsetX: 2,
    //         shadowOffsetY: 2
    //     }
    // }, {
    //     type: 'inside'
    // }],
    animation: false,
    series: [
        {
            type: 'candlestick',
            name: '日K',
            data: data,
            itemStyle: {
                color: '#FD1050',
                color0: '#0CF49B',
                borderColor: '#FD1050',
                borderColor0: '#0CF49B'
            }
        },
        {
            name: 'MA5',
            type: 'line',
            data: calculateMA(5, data),
            smooth: true,
            showSymbol: false,
            lineStyle: {
                width: 1
            }
        },
        {
            name: 'MA10',
            type: 'line',
            data: calculateMA(10, data),
            smooth: true,
            showSymbol: false,
            lineStyle: {
                width: 1
            }
        },
        {
            name: 'MA20',
            type: 'line',
            data: calculateMA(20, data),
            smooth: true,
            showSymbol: false,
            lineStyle: {
                width: 1
            }
        },
        {
            name: 'MA30',
            type: 'line',
            data: calculateMA(30, data),
            smooth: true,
            showSymbol: false,
            lineStyle: {
                width: 1
            }
        }
    ]
  };

  return option;
}

export default kLineConfig;