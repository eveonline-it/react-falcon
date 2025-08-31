import React from 'react';
import world from 'assets/json/world.json';
import { MapChart } from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  VisualMapComponent
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { rgbaColor } from 'helpers/utils';
import { useAppContext } from 'providers/AppProvider';
import ReactEchart from 'components/common/ReactEchart';

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  MapChart,
  CanvasRenderer,
  ToolboxComponent,
  LegendComponent,
  VisualMapComponent
]);

echarts.registerMap('world', world as any);

const total = 6961500;

interface MapDataItem {
  name: string;
  value: number;
}

interface TooltipParams {
  data?: MapDataItem;
}

const getOptions = (
  getThemeColor: (color: string) => string,
  data: MapDataItem[],
  maxZoomLevel: number,
  minZoomLevel: number
) => ({
  tooltip: {
    trigger: 'item',
    padding: [7, 10],
    backgroundColor: getThemeColor('gray-100'),
    borderColor: getThemeColor('gray-300'),
    textStyle: { color: getThemeColor('gray-1100') },
    borderWidth: 1,
    transitionDuration: 0,
    formatter: (params: TooltipParams) =>
      `<strong>${params.data?.name || 'Unknown'} :</strong> ${(
        ((params.data?.value || 0) / total) *
        100
      ).toFixed(2)}%`
  },
  toolbox: {
    show: false,
    feature: {
      restore: {}
    }
  },
  visualMap: {
    show: false,
    min: 800,
    max: 50000,
    inRange: {
      color: [
        getThemeColor('primary'),
        rgbaColor(getThemeColor('primary'), 0.8),
        rgbaColor(getThemeColor('primary'), 0.6),
        rgbaColor(getThemeColor('primary'), 0.4),
        rgbaColor(getThemeColor('primary'), 0.2)
      ].reverse()
    }
  },
  series: [
    {
      type: 'map',
      map: 'world',
      data,
      roam: true,
      scaleLimit: {
        min: minZoomLevel,
        max: maxZoomLevel
      },
      left: 0,
      right: 0,
      label: {
        show: false
      },
      itemStyle: {
        borderColor: getThemeColor('gray-300')
      },
      emphasis: {
        label: {
          show: false
        },
        itemStyle: {
          areaColor: getThemeColor('warning')
        }
      }
    }
  ]
});

interface WorldMapProps {
  data: MapDataItem[];
  style?: React.CSSProperties;
  minZoomLevel?: number;
  maxZoomLevel?: number;
  ref?: React.Ref<any>;
}

const WorldMap: React.FC<WorldMapProps> = ({
  data,
  style,
  minZoomLevel = 1,
  maxZoomLevel = 5,
  ref
}) => {
  const { getThemeColor } = useAppContext();
  return (
    <ReactEchart
      ref={ref}
      echarts={echarts}
      option={getOptions(getThemeColor, data, maxZoomLevel, minZoomLevel)}
      style={style}
    />
  );
};

export default WorldMap;
