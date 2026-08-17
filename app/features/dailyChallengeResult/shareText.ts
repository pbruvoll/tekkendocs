import { siteUrl } from '~/services/staticDataService';

export type DailyShareInput = {
  /** Human readable date of the challenge, e.g. "14 August". */
  displayDate: string;
  score: number;
  totalQuestions: number;
  /** Empty string leaves the rank out of the score line. */
  rankName: string;
  /** Zero leaves the streak line out. */
  streak: number;
  /** One entry per question, in the order they were answered. */
  results: boolean[];
};

const correctEmoji = '🟩';
const wrongEmoji = '🟥';
const emojisPerRow = 5;

export const dailyChallengeShareUrl = `${siteUrl}/t8/dailychallenge`;

const buildEmojiGrid = (results: boolean[]): string => {
  const rows: string[] = [];
  for (let index = 0; index < results.length; index += emojisPerRow) {
    rows.push(
      results
        .slice(index, index + emojisPerRow)
        .map((isCorrect) => (isCorrect ? correctEmoji : wrongEmoji))
        .join(''),
    );
  }
  return rows.join('\n');
};

export const buildDailyShareText = ({
  displayDate,
  score,
  totalQuestions,
  rankName,
  streak,
  results,
}: DailyShareInput): string => {
  const lines = [
    `TekkenDocs Daily Challenge - ${displayDate}`,
    `Score: ${score}/${totalQuestions}${rankName ? ` - ${rankName}` : ''}`,
  ];

  if (streak > 0) {
    lines.push(`Streak: ${streak} day${streak === 1 ? '' : 's'} 🔥`);
  }

  const emojiGrid = buildEmojiGrid(results);
  if (emojiGrid) {
    lines.push('', emojiGrid);
  }

  lines.push('', dailyChallengeShareUrl);

  return lines.join('\n');
};
