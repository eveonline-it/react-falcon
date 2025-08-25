import React from 'react';
import dayjs from 'dayjs';
import { LineChart } from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  TooltipComponent
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { getDates } from 'helpers/utils';
import { useAppContext } from 'providers/AppProvider';
import ReactEchart from 'components/common/ReactEchart';

echarts.use([LineChart, TooltipComponent, GridComponent, LegendComponent]);

const months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
];

const dates = month => {
  return getDates(
    dayjs().month(months.indexOf(month)).date(1).toDate(),
    dayjs()
      .month(Number(months.indexOf(month)) + 1)
      .date(0)
      .toDate(),
    1000 * 60 * 60 * 24 * 3
  );
};

const tooltipFormatter = (params, selectedMonth, previousMonth) => {
  let tooltipItem = ``;
  params.forEach(el => {
    const currentDate = dayjs(el.axisValue);
    tooltipItem =
      tooltipItem +
      `<h6 class="fs-10 text-700 d-flex align-items-center">
        <div class="dot me-2" style="background-color:${el.borderColor}"></div>
        ${
          el.seriesName === 'prevMonth' ? previousMonth : selectedMonth
        } ${currentDate.format('DD')} : ${el.value}
      </h6>`;
  });
  return `<div class='ms-1'>
            ${tooltipItem}
          </div>`;
};

const getOption = (getThemeColor, data, selectedMonth, previousMonth) => ({
  title: {
    text: 'Sales over time',
    textStyle: {
      fontWeight: 500,
      fontSize: 13,
      fontFamily: 'poppins'
    }
  },
  color: getThemeColor('white'),
  tooltip: {
    trigger: 'axis',
    padding: [7, 10],
    backgroundColor: getThemeColor('gray-100'),
    borderColor: getThemeColor('gray-300'),
    textStyle: { color: getThemeColor('gray-1100') },
    borderWidth: 1,
    formatter: params => tooltipFormatter(params, selectedMonth, previousMonth),
    transitionDuration: 0
  },
  legend: {
    show: false,
    data: ['currentMonth', 'prevMonth']
  },
  xAxis: {
    type: 'category',
    data: dates(selectedMonth),
    boundaryGap: false,
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
      color: getThemeColor('gray-400'),
      margin: 15,
      formatter: value => dayjs(value).format('MMM DD')
    },
    splitLine: {
      show: true,
      lineStyle: {
        color: getThemeColor('gray-300'),
        type: 'dashed'
      }
    }
  },
  yAxis: {
    type: 'value',
    axisPointer: { show: false },
    splitLine: {
      lineStyle: {
        color: getThemeColor('gray-300')
      }
    },
    boundaryGap: false,
    axisLabel: {
      show: true,
      color: getThemeColor('gray-400'),
      margin: 15
    },
    axisTick: { show: false },
    axisLine: { show: false }
  },
  series: [
    {
      name: 'prevMonth',
      type: 'line',
      data: data[previousMonth],
      lineStyle: { color: getThemeColor('gray-300') },
      itemStyle: {
        borderColor: getThemeColor('gray-300'),
        borderWidth: 2
      },
      symbol: 'none',
      smooth: false,
      emphasis: {
        scale: true
      }
    },
    {
      name: 'currentMonth',
      type: 'line',
      data: data[selectedMonth],
      lineStyle: { color: getThemeColor('primary') },
      itemStyle: {
        borderColor: getThemeColor('primary'),
        borderWidth: 2
      },
      symbol: 'none',
      smooth: false,
      emphasis: {
        scale: true
      }
    }
  ],
  grid: { right: '8px', left: '40px', bottom: '15%', top: '20%' }
});

const GrossRevenueChart = (
  { data, selectedMonth, previousMonth, ref, ...rest }
) => {
  const { getThemeColor } = useAppContext();
  return (
    <ReactEchart
      echarts={echarts}
      ref={ref}
      option={getOption(getThemeColor, data, selectedMonth, previousMonth)}
      {...rest}
    />
  );
}

export default GrossRevenueChart;
