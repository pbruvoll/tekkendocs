import { type Move } from '~/types/Move';
import {
  blockAnswerOptions,
  hardBlockAnswerOptions,
  hitAnswerOptions,
} from './constants';
import { type FrameRange, type QuizFrameType } from './types';

export const frameTypeParam = 'frameType';

export const parseQuizFrameType = (value: string | null): QuizFrameType =>
  value === 'hit' ? 'hit' : 'block';

/** There are no smaller ranges on hit yet. */
export const isHardModeAvailable = (frameType: QuizFrameType): boolean =>
  frameType === 'block';

export const getAnswerOptions = (
  frameType: QuizFrameType,
  hard = false,
): FrameRange[] => {
  if (frameType === 'hit') {
    return hitAnswerOptions;
  }
  return hard ? hardBlockAnswerOptions : blockAnswerOptions;
};

/** The frames as listed in the frame data, shown after answering. */
export const getCorrectFrames = (
  move: Move,
  frameType: QuizFrameType,
): string => (frameType === 'hit' ? move.hit : move.block);
