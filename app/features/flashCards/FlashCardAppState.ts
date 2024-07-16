import { z } from 'zod'

export const flashCardAppStateSchema = z.record(
  z.string(),
  z.object({
    correct: z.array(z.string()),
    wrong: z.array(z.string()),
    ignored: z.array(z.string()),
  }),
)

export type FlashCardAppState = z.infer<typeof flashCardAppStateSchema>
