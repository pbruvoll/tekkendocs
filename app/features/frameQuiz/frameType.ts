import { type Move } from '~/types/Move';
import { blockAnswerOptions, hitAnswerOptions } from './constants';
import { type FrameRange, type QuizFrameType } from './types';

export const frameTypeParam = 'frameType';

export const parseQuizFrameType = (value: string | null): QuizFrameType =>
  value === 'hit' ? 'hit' : 'block';

export const getAnswerOptions = (frameType: QuizFrameType): FrameRange[] =>
  frameType === 'hit' ? hitAnswerOptions : blockAnswerOptions;

/** The frames as listed in the frame data, shown after answering. */
export const getCorrectFrames = (
  move: Move,
  frameType: QuizFrameType,
): string => (frameType === 'hit' ? move.hit : move.block);
