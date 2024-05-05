import { z } from 'zod'

export const appStateSchema = z.object({
  reactChallenge: z.object({
    completedLowBlocks: z.array(z.string()),
  }),
})

export type AppState = z.infer<typeof appStateSchema>
