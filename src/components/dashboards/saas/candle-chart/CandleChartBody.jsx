import React from 'react';
import dayjs from 'dayjs';
import { CandlestickChart } from 'echarts/charts';
import {
  DataZoomComponent,
  DataZoomInsideComponent,
  GridComponent,
  TooltipComponent
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { useAppContext } from 'providers/AppProvider';
import ReactEchart from 'components/common/ReactEchart';

echarts.use([
  CandlestickChart,
  TooltipComponent,
  GridComponent,
  DataZoomComponent,
  DataZoomInsideComponent
]);

const splitData = rawData => {
  let categoryData = [];
  let values = [];

  rawData.forEach(item => {
    categoryData.push(item.slice(0, 1)[0]);
    values.push(item.slice(1));
  });
  return { categoryData, values };
};

const getOptions = (getThemeColor, data, zoomStart, zoomEnd) => ({
  tooltip: {
    trigger: 'axis',
    padding: [7, 10],
    backgroundColor: getThemeColor('gray-100'),
    borderColor: getThemeColor('gray-300'),
    textStyle: { color: getThemeColor('gray-1100') },
    borderWidth: 1
  },
  xAxis: {
    type: 'category',
    data: data.categoryData,
    scale: true,
    splitLine: { show: false },
    splitNumber: 10,
    min: 'dataMin',
    max: 'dataMax',
    boundaryGap: true,
    axisPointer: {
      lineStyle: {
        color: getThemeColor('gray-300'),
        type: 'dashed'
      }
    },
    axisLine: {
      lineStyle: {
        color: getThemeColor('gray-300'),
        type: 'solid'
      }
    },
    axisTick: { show: false },
    axisLabel: {
      color: getThemeColor('gray-600'),
      formatter: value => dayjs(value).format('MMM D'),
      margin: 15,
      fontWeight: 500
    }
  },
  yAxis: {
    scale: true,
    position: 'right',
    axisPointer: { show: false },
    splitLine: {
      lineStyle: {
        color: getThemeColor('gray-200'),
        type: 'dashed'
      }
    },
    boundaryGap: false,
    axisLabel: {
      show: true,
      color: getThemeColor('gray-600'),
      margin: 15,
      fontWeight: 500
    },
    axisTick: { show: false },
    axisLine: { show: false }
  },
  dataZoom: [
    {
      type: 'inside',
      start: zoomStart,
      end: zoomEnd
    }
  ],

  series: [
    {
      name: 'candlestick',
      type: 'candlestick',
      data: data.values,
      itemStyle: {
        color: getThemeColor('warning'),
        color0: getThemeColor('primary'),
        borderColor: getThemeColor('warning'),
        borderColor0: getThemeColor('primary')
      }
    }
  ],
  grid: {
    right: 23,
    left: 12,
    bottom: 0,
    top: '20px',
    containLabel: true
  }
});

const CandleChartBody = (
  { data, zoomStart, zoomEnd, ref, ...rest }
) => {
  const { getThemeColor } = useAppContext();
  const chartData = splitData(data);

  return (
    <ReactEchart
      ref={ref}
      echarts={echarts}
      option={getOptions(getThemeColor, chartData, zoomStart, zoomEnd)}
      {...rest}
    />
  );
};

export default CandleChartBody;
