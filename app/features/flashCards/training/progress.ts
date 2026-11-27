import { type Stage, type TrainingMode } from './domain';

export const progressStorageKey = 't8_flashCardTrainingProgress:v1';

export type DeckProgress = Record<string, boolean>;

export function deckProgressId(
  character: string,
  mode: TrainingMode,
  stage?: Stage,
): string {
  return [character, mode, stage].filter(Boolean).join('/');
}

function readProgress(storage: Storage): Record<string, unknown> {
  try {
    const raw = storage.getItem(progressStorageKey);
    const data: unknown = raw ? JSON.parse(raw) : null;
    return data && typeof data === 'object' && !Array.isArray(data)
      ? (data as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

function parseDeckProgress(deck: unknown): DeckProgress {
  if (!deck || typeof deck !== 'object' || Array.isArray(deck)) return {};

  return Object.fromEntries(
    Object.entries(deck).filter(
      (entry): entry is [string, boolean] => typeof entry[1] === 'boolean',
    ),
  );
}

export function readDeckProgress(
  storage: Storage,
  deckId: string,
): DeckProgress {
  return parseDeckProgress(readProgress(storage)[deckId]);
}

export function saveAnswer(
  storage: Storage,
  deckId: string,
  questionId: string,
  correct: boolean,
) {
  const progress = readProgress(storage);
  const deck = parseDeckProgress(progress[deckId]);
  try {
    storage.setItem(
      progressStorageKey,
      JSON.stringify({
        ...progress,
        [deckId]: { ...deck, [questionId]: correct },
      }),
    );
  } catch {
    // Private browsing and storage quotas should not interrupt a session.
  }
}
