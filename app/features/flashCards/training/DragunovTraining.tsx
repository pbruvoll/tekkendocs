import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { ContentContainer } from '~/components/ContentContainer';
import { MoveVideo } from '~/components/MoveVideo';
import { Button, buttonVariants } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { filterKey } from '~/constants/filterConstants';
import { type Move } from '~/types/Move';
import {
  isCorrectAnswer,
  type Question,
  type Stage,
  shuffle,
  stages,
  type TrainingMode,
} from './domain';
import { getQuestionDeck } from './dragunovDecks';
import {
  type DeckProgress,
  deckProgressId,
  readDeckProgress,
  saveAnswer,
} from './progress';

const modes = {
  'punish-basic': 'Beginner: Punishable or safe',
  'punish-frames': 'Advanced: Punish frames',
  'string-defense': 'Expert: Defend against strings',
  'game-plan': 'Game Plan',
  'oki-offense': 'Oki: Attacking',
  'oki-defense': 'Oki: Getting up',
} satisfies Record<TrainingMode, string>;

function searchFor(mode?: TrainingMode | 'classic', stage?: Stage) {
  if (!mode) return { search: '' };
  const params = new URLSearchParams({ mode });
  if (stage) params.set('stage', stage);
  return { search: `?${params}` };
}

export function resolveFlashCardMode(
  characterName: string,
  params: URLSearchParams,
): TrainingMode | 'classic' | 'menu' {
  if (characterName.toLowerCase() !== 'dragunov') return 'classic';

  const mode = params.get('mode');
  if (mode === 'classic') return mode;
  if (mode && Object.hasOwn(modes, mode)) return mode as TrainingMode;
  if (!mode && Object.values(filterKey).some((key) => params.has(key)))
    return 'classic';
  return 'menu';
}

export function BackToFlashCardModes() {
  return (
    <Link
      to={searchFor()}
      className={buttonVariants({ variant: 'ghost', size: 'sm' })}
    >
      Back to flash card modes
    </Link>
  );
}

function ModeLink({ mode }: { mode: TrainingMode | 'classic' }) {
  return (
    <Link
      to={searchFor(mode)}
      className={buttonVariants({
        variant: 'outline',
        className: 'w-full justify-start whitespace-normal',
      })}
    >
      {mode === 'classic' ? 'Open classic flash cards' : modes[mode]}
    </Link>
  );
}

function TrainingMenu() {
  return (
    <>
      <h1 className="text-2xl font-semibold">Dragunov Flash Cards</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              <h2>Classic</h2>
            </CardTitle>
            <CardDescription>
              Flip the card to check the move’s frame data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ModeLink mode="classic" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>
              <h2>Punishment</h2>
            </CardTitle>
            <CardDescription>
              Learn what to do after a block or during a string.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <ModeLink mode="punish-basic" />
            <ModeLink mode="punish-frames" />
            <ModeLink mode="string-defense" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>
              <h2>Game Plan</h2>
            </CardTitle>
            <CardDescription>
              Pick the right move for a situation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ModeLink mode="game-plan" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>
              <h2>Oki</h2>
            </CardTitle>
            <CardDescription>
              Practice both sides of a knockdown.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <ModeLink mode="oki-offense" />
            <ModeLink mode="oki-defense" />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

type Session = { questions: Question[]; index: number; results: boolean[] };

function browserStorage(): Storage | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

function QuestionCard({
  question,
  move,
  position,
  total,
  result,
  onAnswer,
  onNext,
}: {
  question: Question;
  move?: Move;
  position: number;
  total: number;
  result: boolean | undefined;
  onAnswer: (answer: readonly string[]) => void;
  onNext: () => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [showVideo, setShowVideo] = useState(false);
  const title = useRef<HTMLHeadingElement>(null);
  const nextButton = useRef<HTMLButtonElement>(null);
  const multiple = question.selection === 'multiple';
  const answered = result !== undefined;

  useEffect(() => {
    title.current?.focus();
  }, []);

  useEffect(() => {
    if (answered) nextButton.current?.focus();
  }, [answered]);

  return (
    <Card>
      <CardHeader>
        <CardDescription>
          Card {position} of {total}
        </CardDescription>
        <CardTitle>
          <h2 ref={title} tabIndex={-1} className="text-xl">
            {question.title}
          </h2>
        </CardTitle>
        <p className="text-sm">{question.context}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {move &&
          (move.video || move.ytVideo) &&
          (showVideo ? (
            <MoveVideo move={move} hideFrameData />
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowVideo(true)}
            >
              Show move video
            </Button>
          ))}
        {answered ? (
          <>
            <div role="status" className="space-y-2 rounded-lg border p-3">
              <p className="font-semibold">
                {result ? 'Correct' : 'Incorrect'}
              </p>
              <p>{question.explanation}</p>
              <ul className="space-y-1 text-sm">
                {question.options
                  .filter((option) => multiple || option.correct)
                  .map((option) => (
                    <li key={option.id}>
                      <strong>{option.label}</strong>
                      {multiple && (option.correct ? ' works' : ' fails')}
                      {option.explanation && ` · ${option.explanation}`}
                    </li>
                  ))}
              </ul>
              {question.review && (
                <p className="text-sm text-muted-foreground">
                  {question.review.testedOn
                    ? `Tested in game on ${question.review.testedOn}`
                    : `Source-reviewed · Practice Mode check pending for ${question.review.targetPatch}`}
                </p>
              )}
              {question.source && (
                <a
                  href={question.source}
                  className="text-sm underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  Source
                </a>
              )}
            </div>
            <Button ref={nextButton} type="button" onClick={onNext}>
              {position === total ? 'See results' : 'Next card'}
            </Button>
          </>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (selected.length) onAnswer(selected);
            }}
          >
            <fieldset className="space-y-2">
              <legend className="mb-2 font-medium">{question.prompt}</legend>
              {question.options.map((option) => (
                <label
                  key={option.id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 has-checked:border-primary"
                >
                  <input
                    type={multiple ? 'checkbox' : 'radio'}
                    name="answer"
                    checked={selected.includes(option.id)}
                    onChange={(event) => {
                      const checked = event.currentTarget.checked;
                      setSelected((previous) =>
                        !multiple
                          ? [option.id]
                          : checked
                            ? [...previous, option.id]
                            : previous.filter((value) => value !== option.id),
                      );
                    }}
                    className="size-4 shrink-0 accent-primary"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </fieldset>
            <Button type="submit" disabled={selected.length === 0}>
              Check answer
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

function TrainingDeck({
  mode,
  stage,
  moves,
}: {
  mode: TrainingMode;
  stage?: Stage;
  moves: readonly Move[];
}) {
  const deckId = deckProgressId('dragunov', mode, stage);
  const questions = getQuestionDeck(mode, moves, stage);
  const [progress, setProgress] = useState<DeckProgress>({});
  const [session, setSession] = useState<Session>();
  const [round, setRound] = useState(0);

  useEffect(() => {
    const storage = browserStorage();
    if (storage) setProgress(readDeckProgress(storage, deckId));
  }, [deckId]);

  function start(cards: readonly Question[]) {
    setRound((round) => round + 1);
    setSession({
      questions: shuffle(cards).map((card) => ({
        ...card,
        options: shuffle(card.options),
      })),
      index: 0,
      results: [],
    });
  }

  if (!session) {
    const missed = questions.filter(
      (question) => progress[question.id] === false,
    );
    const correct = questions.filter(
      (question) => progress[question.id] === true,
    ).length;

    return (
      <Card>
        <CardHeader>
          <CardDescription>
            {questions.length} cards · {correct} correct on last attempt
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {questions.length > 0 ? (
            <Button onClick={() => start(questions)}>Start practice</Button>
          ) : (
            <p>There are no cards available for this mode.</p>
          )}
          {missed.length > 0 && (
            <Button variant="outline" onClick={() => start(missed)}>
              Review mistakes ({missed.length})
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const current = session.questions[session.index];
  if (!current) {
    const missed = session.questions.filter(
      (_, index) => !session.results[index],
    );
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Practice complete</h2>
          </CardTitle>
          <CardDescription>
            {session.results.filter(Boolean).length} /{' '}
            {session.questions.length} correct
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {missed.length > 0 && (
            <Button onClick={() => start(missed)}>
              Review mistakes ({missed.length})
            </Button>
          )}
          <Button variant="outline" onClick={() => setSession(undefined)}>
            Back to deck
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <QuestionCard
      key={`${round}:${current.id}`}
      question={current}
      move={moves.find(
        (move) =>
          move.id === current.moveId || move.command === current.moveCommand,
      )}
      position={session.index + 1}
      total={session.questions.length}
      result={session.results[session.index]}
      onNext={() => setSession({ ...session, index: session.index + 1 })}
      onAnswer={(selected) => {
        if (session.results[session.index] !== undefined) return;
        const correct = isCorrectAnswer(current, selected);
        const storage = browserStorage();
        if (storage) saveAnswer(storage, deckId, current.id, correct);
        setProgress((previous) => ({ ...previous, [current.id]: correct }));
        setSession({ ...session, results: [...session.results, correct] });
      }}
    />
  );
}

export function DragunovTraining({
  mode,
  moves,
  params,
}: {
  mode: TrainingMode | 'menu';
  moves: readonly Move[];
  params: URLSearchParams;
}) {
  const stage =
    mode === 'game-plan'
      ? stages.find((stage) => stage.id === params.get('stage'))
      : undefined;

  return (
    <ContentContainer
      enableTopPadding
      enableBottomPadding
      className="flex justify-center"
    >
      <div className="w-full max-w-2xl space-y-4 px-2">
        {mode === 'menu' ? (
          <TrainingMenu />
        ) : (
          <>
            <BackToFlashCardModes />
            <h1 className="text-2xl font-semibold">{modes[mode]}</h1>
            {mode === 'game-plan' && (
              <nav aria-label="Game situation" className="flex flex-wrap gap-2">
                {stages.map(({ id, label }) => (
                  <Link
                    key={id}
                    to={searchFor(mode, id)}
                    aria-current={stage?.id === id ? 'page' : undefined}
                    className={buttonVariants({
                      variant: stage?.id === id ? 'default' : 'outline',
                    })}
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            )}
            {(mode !== 'game-plan' || stage) && (
              <TrainingDeck
                key={deckProgressId('dragunov', mode, stage?.id)}
                mode={mode}
                stage={stage?.id}
                moves={moves}
              />
            )}
          </>
        )}
      </div>
    </ContentContainer>
  );
}
