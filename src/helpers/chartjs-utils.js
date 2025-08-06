import { getRandomNumber } from './utils';

export const chartJsDefaultTooltip = getThemeColor => ({
  backgroundColor: getThemeColor('gray-100'),
  borderColor: getThemeColor('gray-300'),
  borderWidth: 1,
  titleColor: getThemeColor('gray-1100'),
  callbacks: {
    labelTextColor() {
      return getThemeColor('gray-1100');
    }
  }
});

export const getBubbleDataset = (count, rmin, rmax, min, max) => {
  const arr = Array.from(Array(count).keys());
  return arr.map(() => ({
    x: getRandomNumber(min, max),
    y: getRandomNumber(min, max),
    r: getRandomNumber(rmin, rmax)
  }));
};
