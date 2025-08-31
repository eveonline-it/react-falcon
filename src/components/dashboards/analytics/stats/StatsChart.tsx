import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  TitleComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import BasicECharts from 'components/common/BasicEChart';
import { useAppContext } from 'providers/AppProvider';

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LineChart,
  CanvasRenderer
]);

const getOptions = (getThemeColor: (color: string) => string, data: number[], grid: any) => ({
  tooltip: {
    show: false
  },
  series: [
    {
      type: 'bar',
      data,
      symbol: 'none',
      itemStyle: {
        color: getThemeColor('primary'),
        borderRadius: [5, 5, 0, 0]
      }
    }
  ],
  grid
});

interface StatsChartProps {
  data: number[];
  grid: any;
}

const StatsChart: React.FC<StatsChartProps> = ({ data, grid }) => {
  const { getThemeColor } = useAppContext();
  return (
    <BasicECharts
      echarts={echarts}
      options={getOptions(getThemeColor, data, grid)}
      style={{ height: '1.875rem' }}
    />
  );
};

export default StatsChart;
