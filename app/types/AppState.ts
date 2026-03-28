import { z } from 'zod';

const dailyFrameChallengeResultSchema = z.object({
  score: z.number().int().min(0),
  totalQuestions: z.number().int().positive(),
});

const answerBucketSchema = z.enum([
  'plus',
  'zeroToMinusNine',
  'minusTenToMinusEleven',
  'minusTwelveToMinusFourteen',
  'minusFifteenOrLess',
]);

const dailyFrameChallengeAnswerSchema = z.object({
  moveId: z.string(),
  characterName: z.string().default(''),
  command: z.string(),
  rawBlock: z.string(),
  selectedBucket: answerBucketSchema,
  correctBucket: answerBucketSchema,
  selectedLabel: z.string(),
  correctLabel: z.string(),
  isCorrect: z.boolean(),
});

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
        .default(null),
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
        .default(null),
    })
    .default({}),
});

export type AppState = z.infer<typeof appStateSchema>;
