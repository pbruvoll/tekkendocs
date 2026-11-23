import { type FrameRange, type QuizFrameType } from './types';

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

/**
 * Block answers are listed from high to low and hit answers from low to high,
 * so each range is written in the same direction as its list. An open range
 * says "or more" in both directions, meaning that value or further from zero
 * ("-15 or more").
 */
export const formatFrameRange = (
  { min, max }: FrameRange,
  frameType: QuizFrameType,
): string => {
  if (min !== undefined && max !== undefined) {
    if (min === max) {
      return formatFrameValue(min);
    }
    const [first, last] = frameType === 'block' ? [max, min] : [min, max];
    return `${formatFrameValue(first)} to ${formatFrameValue(last)}`;
  }
  const bound = min ?? max;
  return bound === undefined ? 'Any' : `${formatFrameValue(bound)} or more`;
};
