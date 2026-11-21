import { type Move } from '~/types/Move';

export type QuizMove = {
  id: string;
  move: Move;
  /** The block or hit frames, whichever the quiz asks for. */
  frameValue: number;
};

/** Which frames the quiz asks for. */
export type QuizFrameType = 'block' | 'hit';

/** Inclusive frame range. A missing bound leaves that side open. */
export type FrameRange = {
  min?: number;
  max?: number;
};

export type SessionAnswer = {
  moveId: string;
  characterName: string;
  command: string;
  rawBlock: string;
  selectedRange: FrameRange;
  isCorrect: boolean;
};

export type QuestionFeedback = {
  isCorrect: boolean;
  selectedLabel: string;
  correctFrames: string;
};

export type PendingAdvance = {
  score: number;
  answers: SessionAnswer[];
};
