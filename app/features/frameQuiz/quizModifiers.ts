import { type QuizModifiers } from './components/QuizModifierControls';
import {
  frameTypeParam,
  isHardModeAvailable,
  parseQuizFrameType,
} from './frameType';

export const parseQuizModifiers = (
  searchParams: URLSearchParams,
): QuizModifiers => {
  const frameType = parseQuizFrameType(searchParams.get(frameTypeParam));
  return {
    hideCommand: searchParams.has('hideCommand'),
    hideVideo: searchParams.has('hideVideo'),
    // The hard param stays in the url when switching to hit, so the quiz is
    // back in hard mode when switching back to block.
    hard: searchParams.has('hard') && isHardModeAvailable(frameType),
  };
};
