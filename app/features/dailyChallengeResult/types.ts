import { type SessionAnswer } from '~/features/frameQuiz/types';

/** Everything the share actions need about a finished daily challenge. */
export type DailyResultSummary = {
  /** Human readable date of the challenge, e.g. "14 August". */
  displayDate: string;
  score: number;
  totalQuestions: number;
  streak: number;
  answers: SessionAnswer[];
};
