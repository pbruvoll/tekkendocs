import { type FrameRange } from './types';

export const isInFrameRange = (
  frameValue: number,
  { min, max }: FrameRange,
): boolean => {
  return (
    (min === undefined || frameValue >= min) &&
    (max === undefined || frameValue <= max)
  );
};

const formatFrameValue = (frameValue: number): string =>
  frameValue > 0 ? `+${frameValue}` : `${frameValue}`;

export const formatFrameRange = ({ min, max }: FrameRange): string => {
  if (min !== undefined && max !== undefined) {
    if (min === max) {
      return formatFrameValue(min);
    }
    // Start at the value closest to zero ("-12 to -14", "+1 to +3"). A range
    // across zero goes from low to high ("-2 to +3").
    const [first, last] = max <= 0 ? [max, min] : [min, max];
    return `${formatFrameValue(first)} to ${formatFrameValue(last)}`;
  }
  if (min !== undefined) {
    return `${formatFrameValue(min)} or more`;
  }
  if (max !== undefined) {
    return `${formatFrameValue(max)} or less`;
  }
  return 'Any';
};
