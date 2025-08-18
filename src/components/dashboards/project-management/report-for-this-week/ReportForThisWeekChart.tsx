import React from 'react';
import { BarChart } from 'echarts/charts';
import {
  DatasetComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { useAppContext } from 'providers/AppProvider';
import ReactEchart from 'components/common/ReactEchart';

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  BarChart,
  CanvasRenderer,
  LegendComponent,
  DatasetComponent
]);

const getOption = (getThemeColor, data) => ({
  color: [getThemeColor('primary'), getThemeColor('gray-300')],
  dataset: { source: data },
  tooltip: {
    trigger: 'item',
    padding: [7, 10],
    backgroundColor: getThemeColor('gray-100'),
    borderColor: getThemeColor('gray-300'),
    textStyle: { color: getThemeColor('gray-1100') },
    borderWidth: 1,
    transitionDuration: 0,
    formatter: function (params) {
      return `<div className="fw-semibold">${
        params.seriesName
      }</div><div className="fs-10 text-600"><strong>${params.name}:</strong> ${
        params.value[params.componentIndex + 1]
      }</div>`;
    }
  },
  legend: {
    show: false
  },
  xAxis: {
    type: 'category',
    axisLabel: { color: getThemeColor('gray-400') },
    axisLine: {
      lineStyle: {
        color: getThemeColor('gray-300'),
        type: 'dashed'
      }
    },
    axisTick: false,
    boundaryGap: true
  },
  yAxis: {
    axisPointer: { type: 'none' },
    axisTick: 'none',
    splitLine: {
      lineStyle: {
        color: getThemeColor('gray-300'),
        type: 'dashed'
      }
    },
    axisLine: { show: false },
    axisLabel: {
      color: getThemeColor('gray-400'),
      formatter: value => `${value} hr`
    }
  },
  series: [
    {
      type: 'bar',
      barWidth: '12%',
      barGap: '30%',
      label: { show: false },
      z: 10,
      itemStyle: {
        borderRadius: [10, 10, 0, 0],
        color: getThemeColor('primary')
      }
    },
    {
      type: 'bar',
      barWidth: '12%',
      barGap: '30%',
      label: { show: false },
      itemStyle: {
        borderRadius: [4, 4, 0, 0],
        color: getThemeColor('gray-300')
      }
    }
  ],
  grid: { right: '0', left: '40px', bottom: '10%', top: '15%' }
});

const ReportForThisWeekChart = ({ data, ref }) => {
  const { getThemeColor } = useAppContext();
  return (
    <ReactEchart
      echarts={echarts}
      ref={ref}
      option={getOption(getThemeColor, data)}
      style={{ height: '17.625rem' }}
    />
  );
};

export default ReportForThisWeekChart;
