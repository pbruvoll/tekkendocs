export const stages = [
  { id: 'neutral', label: 'Neutral' },
  { id: 'pressure', label: 'Pressure' },
  { id: 'defense', label: 'Defense' },
  { id: 'whiff-punish', label: 'Whiff punishment' },
  { id: 'wall', label: 'At the wall' },
] as const;

export type Stage = (typeof stages)[number]['id'];
export type TrainingMode =
  | 'punish-basic'
  | 'punish-frames'
  | 'string-defense'
  | 'game-plan'
  | 'oki-offense'
  | 'oki-defense';

export type TrainingMove = {
  id: string;
  command: string;
  block?: string;
  hitLevel?: string;
  notes?: string;
};

export type AnswerOption = {
  id: string;
  label: string;
  correct: boolean;
  explanation?: string;
};

export type Question = {
  id: string;
  moveId?: string;
  moveCommand?: string;
  title: string;
  context: string;
  prompt: string;
  options: readonly AnswerOption[];
  selection: 'single' | 'multiple';
  explanation: string;
  source?: string;
  review?: { targetPatch: string; testedOn?: string };
};

const frameSource = 'https://tekkendocs.com/dragunov';
const spacingExceptions = new Set(['d+4,1,3', 'd+4,4', 'qcb+2']);

type BlockPunishment = {
  frames: number | null;
  context: string;
  explanation: string;
  fastestStandard: number;
  expectedBlock: string;
};

export function getBlockPunishment(
  move: TrainingMove,
): BlockPunishment | undefined {
  const block = move.block?.trim().replace(/[−–]/g, '-') ?? '';

  if (move.command === 'df+3' && block === '-6~-3') {
    return {
      frames: null,
      context: 'You block this move at a range where it reaches normally.',
      explanation:
        'The block disadvantage varies from −6 to −3. The entire window is safe against a standard i10 standing punish.',
      fastestStandard: 10,
      expectedBlock: block,
    };
  }

  const exactBlock = /^([+-]?\d+)(c)?$/i.exec(block);
  const lastHit = move.hitLevel?.split(',').at(-1)?.trim();
  const isLow = /^l(?:\s|\(|$)/i.test(lastHit ?? '');

  if (
    !exactBlock ||
    !/^[hml](?:\s|\(|$)/i.test(lastHit ?? '') ||
    spacingExceptions.has(move.command) ||
    /pushback|pushes? (?:the )?opponent back|frame advantage.*on block/i.test(
      move.notes ?? '',
    )
  ) {
    return undefined;
  }

  const blockedCrouching =
    isLow ||
    Boolean(exactBlock[2]) ||
    /opponent recovers crouching on block/i.test(move.notes ?? '');
  const fastestStandard = blockedCrouching ? 11 : 10;
  const frames = -Number(exactBlock[1]);
  const punishable = frames >= fastestStandard;
  const position = blockedCrouching ? 'while-standing' : 'standing';
  const stance = blockedCrouching
    ? 'You recover crouching.'
    : 'You recover standing.';
  const explanation = punishable
    ? `On block ${block}. A ${position} punish with i${frames} startup or faster fits if it reaches.`
    : `On block ${block}. A standard i${fastestStandard} ${position} punish is too slow.`;

  return {
    frames: punishable ? frames : null,
    context: `You block the final hit at close range. ${stance}`,
    explanation,
    fastestStandard,
    expectedBlock: block,
  };
}

function frameAnswers(
  frames: number | null,
  fastestStandard: number,
): AnswerOption[] {
  const candidates =
    frames === null
      ? [fastestStandard, fastestStandard + 2, 15]
      : [Math.max(fastestStandard, frames - 1), frames, frames + 1];
  const distinct = new Set(candidates);
  if (distinct.size < 3) distinct.add(fastestStandard + 2);

  return [
    ...Array.from(distinct, (value) => ({
      id: `i${value}`,
      label: `i${value}`,
      correct: value === frames,
    })),
    { id: 'safe', label: 'Safe', correct: frames === null },
  ];
}

export function yesNo(
  correct: boolean,
  yes = 'Yes',
  no = 'No',
): AnswerOption[] {
  return [
    { id: 'yes', label: yes, correct },
    { id: 'no', label: no, correct: !correct },
  ];
}

export function punishQuestions(
  moves: readonly TrainingMove[],
  mode: 'punish-basic' | 'punish-frames',
): Question[] {
  return moves.flatMap((move) => {
    const punishment = getBlockPunishment(move);
    if (!punishment) return [];

    const { frames, context, explanation, fastestStandard, expectedBlock } =
      punishment;
    const basic = mode === 'punish-basic';
    return [
      {
        id: `${move.id}:${expectedBlock}:${fastestStandard}`,
        moveId: move.id,
        title: move.command,
        context,
        prompt: basic
          ? 'Can you punish on block?'
          : 'What is the slowest punish that fits?',
        options: basic
          ? yesNo(frames !== null, 'Punishable', 'Safe')
          : frameAnswers(frames, fastestStandard),
        selection: 'single',
        explanation,
        source: frameSource,
      } satisfies Question,
    ];
  });
}

export function isCorrectAnswer(
  question: Question,
  selected: readonly string[],
): boolean {
  if (question.selection === 'single') {
    return (
      selected.length === 1 &&
      question.options.some(
        (option) => option.correct && option.id === selected[0],
      )
    );
  }

  const correct = question.options.filter((option) => option.correct);
  return (
    correct.length === selected.length &&
    correct.every((option) => selected.includes(option.id))
  );
}

export function shuffle<T>(items: readonly T[], random = Math.random): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    // Both indices are within the populated array.
    const current = result[index] as T;
    result[index] = result[other] as T;
    result[other] = current;
  }
  return result;
}
