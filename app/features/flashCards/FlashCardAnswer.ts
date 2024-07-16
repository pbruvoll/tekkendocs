export const FlashCardAnswer = {
  Correct: 'correct',
  Wrong: 'wrong',
  Ignored: 'ignored',
} as const

export type FlashCardAnswerType =
  (typeof FlashCardAnswer)[keyof typeof FlashCardAnswer]
