import { type FrameRange } from '~/features/frameQuiz/types';

export const blockAnswerOptions: FrameRange[] = [
  { min: 1 },
  { min: -9, max: 0 },
  { min: -11, max: -10 },
  { min: -14, max: -12 },
  { max: -15 },
];

export const hitAnswerOptions: FrameRange[] = [
  { max: -1 },
  { min: 0, max: 3 },
  { min: 4, max: 7 },
  { min: 8 },
];
