import { z } from 'zod';

const dailyFrameChallengeResultSchema = z.object({
  score: z.number().int().min(0),
  totalQuestions: z.number().int().positive(),
});

// LEGACY-ANSWER-BUCKET (remove after 2026-11-28): answers saved before
// November 2026 have a `selectedBucket` name instead of `selectedRange`. Only
// today's answers are shown, so after a couple of days nothing is lost by
// dropping them. To clean up, delete the marked code and use
// `dailyFrameChallengeAnswerObjectSchema` in place of
// `dailyFrameChallengeAnswerSchema`.
const legacyRangeByAnswerBucket: Record<
  string,
  { min?: number; max?: number }
> = {
  plus: { min: 1 },
  zeroToMinusNine: { min: -9, max: 0 },
  minusTenToMinusEleven: { min: -11, max: -10 },
  minusTwelveToMinusFourteen: { min: -14, max: -12 },
  minusFifteenOrLess: { max: -15 },
};

const convertLegacyAnswer = (answer: unknown): unknown => {
  if (
    typeof answer !== 'object' ||
    answer === null ||
    'selectedRange' in answer ||
    !('selectedBucket' in answer) ||
    typeof answer.selectedBucket !== 'string'
  ) {
    return answer;
  }
  return {
    ...answer,
    selectedRange: legacyRangeByAnswerBucket[answer.selectedBucket],
  };
};
// END LEGACY-ANSWER-BUCKET

const dailyFrameChallengeAnswerObjectSchema = z.object({
  moveId: z.string(),
  characterName: z.string().default(''),
  command: z.string(),
  rawBlock: z.string(),
  selectedRange: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
  }),
  isCorrect: z.boolean(),
});

// LEGACY-ANSWER-BUCKET (remove after 2026-11-28)
const dailyFrameChallengeAnswerSchema = z.preprocess(
  convertLegacyAnswer,
  dailyFrameChallengeAnswerObjectSchema,
);

// Answers that can not be parsed are dropped. Letting them fail the whole
// app state would reset the streak.
const dropInvalidAnswers = ({ issues }: z.core.$ZodCatchCtx) => {
  console.warn(
    'Dropping daily challenge answers that can not be parsed',
    issues,
  );
  return null;
};

export const appStateSchema = z.object({
  reactChallenge: z.object({
    completedLowBlocks: z.array(z.string()).default([]),
  }),
  dailyChallenge: z
    .object({
      dailyResultsByDate: z
        .record(z.string(), dailyFrameChallengeResultSchema)
        .default({}),
      currentCompletedAnswers: z
        .object({
          dateKey: z.string(),
          answers: z.array(dailyFrameChallengeAnswerSchema).default([]),
        })
        .nullable()
        .default(null)
        .catch(dropInvalidAnswers),
      currentStreak: z.number().int().nonnegative().default(0),
      lastCompletedDate: z.string().nullable().default(null),
      inProgress: z
        .object({
          dateKey: z.string(),
          currentQuestionIndex: z.number().int().min(0),
          score: z.number().int().min(0),
          sessionAnswers: z.array(dailyFrameChallengeAnswerSchema).default([]),
        })
        .nullable()
        .default(null)
        .catch(dropInvalidAnswers),
    })
    .prefault({}),
});

export type AppState = z.infer<typeof appStateSchema>;
