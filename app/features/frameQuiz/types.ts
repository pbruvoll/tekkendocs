import { type Move } from '~/types/Move';

export type QuizMove = {
  id: string;
  move: Move;
  blockValue: number;
};

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
  correctBlockValue: string;
};

export type PendingAdvance = {
  score: number;
  answers: SessionAnswer[];
};
