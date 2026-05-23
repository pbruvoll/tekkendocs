import { type AnswerBucket, type AnswerOption } from '~/features/frameQuiz/types';

export const answerOptions: AnswerOption[] = [
  { bucket: 'plus', label: '+1 or more' },
  { bucket: 'zeroToMinusNine', label: '0 to -9' },
  { bucket: 'minusTenToMinusEleven', label: '-10 to -11' },
  { bucket: 'minusTwelveToMinusFourteen', label: '-12 to -14' },
  { bucket: 'minusFifteenOrLess', label: '-15 or more' },
];

export const answerLabelByBucket =
  answerOptions.reduce<Record<AnswerBucket, string>>(
    (current, option) => {
      current[option.bucket] = option.label;
      return current;
    },
    {
      plus: '',
      zeroToMinusNine: '',
      minusTenToMinusEleven: '',
      minusTwelveToMinusFourteen: '',
      minusFifteenOrLess: '',
    },
  );
