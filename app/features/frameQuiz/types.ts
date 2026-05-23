import { type Move } from '~/types/Move';

export type QuizMove = {
  id: string;
  move: Move;
  blockValue: number;
};

export type AnswerBucket =
  | 'plus'
  | 'zeroToMinusNine'
  | 'minusTenToMinusEleven'
  | 'minusTwelveToMinusFourteen'
  | 'minusFifteenOrLess';

export type AnswerOption = {
  bucket: AnswerBucket;
  label: string;
};

export type SessionAnswer = {
  moveId: string;
  characterName: string;
  command: string;
  rawBlock: string;
  selectedBucket: AnswerBucket;
  correctBucket: AnswerBucket;
  selectedLabel: string;
  correctLabel: string;
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
