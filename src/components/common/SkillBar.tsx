import React, { useRef, useEffect } from 'react';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import {
  GridComponent,
  TitleComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { useAppContext } from 'providers/AppProvider';

// Add CSS styles for skill bar
const skillBarStyles = `
  .skill-bar-container,
  .skill-bar-container *,
  .skill-bar-container canvas,
  .skill-bar-container svg {
    cursor: pointer !important;
  }
`;

// Inject styles if not already present
if (typeof document !== 'undefined' && !document.getElementById('skill-bar-styles')) {
  const styleElement = document.createElement('style');
  styleElement.id = 'skill-bar-styles';
  styleElement.textContent = skillBarStyles;
  document.head.appendChild(styleElement);
}

// Register the required components
echarts.use([
  GridComponent,
  TitleComponent,
  BarChart,
  CanvasRenderer
]);

interface SkillBarProps {
  name: string;
  sp?: number;
  maxsp?: number;
  level?: number;
  open?: (name: string) => void;
}

const getOptions = (name: string, level: number, getThemeColor: (color: string) => string) => ({
  // Disable ECharts default interactions that might interfere with cursor
  animation: false,
  silent: true,
  // Disable all hover effects
  tooltip: {
    show: false
  },
  // Disable all interactions that could hide text
  brush: {
    toolbox: ['']
  },
  yAxis: [
    {
      data: [name],
      axisLabel: {
        inside: true,
        color: '#ffffff',
        fontWeight: 500,
        fontSize: 12,
        fontFamily: 'system-ui'
      },
      axisTick: {
        show: false
      },
      axisLine: {
        show: false
      },
      silent: true,
      z: 20
    },
    {
      data: [`${level}%`],
      axisLabel: {
        inside: false,
        color: getThemeColor('primary'),
        fontWeight: 500,
        fontSize: 11,
        fontFamily: 'system-ui',
        borderRadius: 5,
        backgroundColor: getThemeColor('gray-200'),
        padding: [6, 16, 6, 16],
        width: 115
      },
      axisTick: {
        show: false
      },
      axisLine: {
        show: false
      },
      silent: true,
      z: 15
    }
  ],
  xAxis: {
    type: 'value',
    min: 0,
    max: 100,
    axisLine: {
      show: false
    },
    splitLine: {
      show: false
    },
    inverse: false,
    axisTick: {
      show: false
    },
    axisLabel: {
      show: false
    },
    silent: true
  },
  series: [
    {
      type: 'bar',
      showBackground: true,
      barWidth: 24,
      label: {
        show: false
      },
      backgroundStyle: {
        color: getThemeColor('gray-300'),
        borderRadius: 3,
        opacity: 0.8
      },
      itemStyle: {
        color: getThemeColor('primary'),
        borderRadius: 3
      },
      emphasis: {
        disabled: true
      },
      select: {
        disabled: true
      },
      blur: {
        disabled: true
      },
      silent: true,
      data: [Math.min(Math.max(level, 0), 100)],
      z: 5
    }
  ],
  grid: { right: '65px', left: '5px', bottom: '2px', top: '2px', height: 'auto' }
});

const SkillBar: React.FC<SkillBarProps> = ({ name, sp = 0, maxsp = 1, level = 0, open }) => {
  const { getThemeColor } = useAppContext();
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  // Use the provided level prop if available, otherwise calculate from sp/maxsp
  const percentageFulfilled = level > 0 ? level : (maxsp > 0 ? ((sp / maxsp) * 100) : 0);
  const displayPercentage = Math.round(percentageFulfilled);

  useEffect(() => {
    if (chartRef.current) {
      chartInstance.current = echarts.init(chartRef.current);
      chartInstance.current.setOption(getOptions(name, displayPercentage, getThemeColor));
      
      // Completely disable ECharts event handling
      chartInstance.current.getZr().off();
      
      // Ensure cursor pointer shows over entire chart area
      const chartDom = chartRef.current.querySelector('canvas');
      if (chartDom) {
        chartDom.style.cursor = 'pointer';
        chartDom.style.pointerEvents = 'none'; // Disable canvas interactions
      }

      return () => {
        if (chartInstance.current) {
          chartInstance.current.dispose();
        }
      };
    }
  }, [name, displayPercentage, getThemeColor]);

  const handleClick = () => {
    if (open) {
      open(name);
    }
  };

  return (
    <div 
      ref={chartRef} 
      style={{ 
        height: '3rem', 
        cursor: 'pointer',
        userSelect: 'none',
        // Ensure pointer cursor over entire area
        position: 'relative'
      }} 
      className="skill-bar-container"
      onClick={handleClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.cursor = 'pointer';
        // Also set cursor on any canvas elements
        const canvas = e.currentTarget.querySelector('canvas');
        if (canvas) canvas.style.cursor = 'pointer';
      }}
    />
  );
};

export default SkillBar;