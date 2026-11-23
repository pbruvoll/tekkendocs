import { useId } from 'react';
import { Label } from '~/components/ui/label';
import { Switch } from '~/components/ui/switch';
import { isHardModeAvailable } from '~/features/frameQuiz/frameType';
import { type QuizFrameType } from '~/features/frameQuiz/types';

export type QuizModifier = 'hideCommand' | 'hideVideo' | 'hard';

export type QuizModifiers = {
  hideCommand: boolean;
  hideVideo: boolean;
  hard: boolean;
};

type QuizModifierControlsProps = {
  modifiers: QuizModifiers;
  onToggle: (modifier: QuizModifier) => void;
  frameType: QuizFrameType;
  onFrameTypeChange: (frameType: QuizFrameType) => void;
};

export const QuizModifierControls = ({
  modifiers,
  onToggle,
  frameType,
  onFrameTypeChange,
}: QuizModifierControlsProps) => {
  const id = useId();
  const hideCommandId = `${id}-hide-command`;
  const hideVideoId = `${id}-hide-video`;
  const onHitId = `${id}-on-hit`;
  const hardId = `${id}-hard`;
  const isHardAvailable = isHardModeAvailable(frameType);

  return (
    <div className="mt-6 border-t border-border/60 pt-4">
      <p className="text-xs font-semibold uppercase tracking-wide mb-3 text-muted-foreground">
        Modifiers
      </p>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Switch
            id={hideCommandId}
            checked={modifiers.hideCommand}
            onCheckedChange={() => onToggle('hideCommand')}
          />
          <Label
            htmlFor={hideCommandId}
            className="cursor-pointer flex-col items-start"
          >
            <span>Hide command</span>
            <span className="text-xs font-normal text-muted-foreground">
              Guess from video only
            </span>
          </Label>
        </div>
        <div className="flex items-center gap-3">
          <Switch
            id={hideVideoId}
            checked={modifiers.hideVideo}
            onCheckedChange={() => onToggle('hideVideo')}
          />
          <Label
            htmlFor={hideVideoId}
            className="cursor-pointer flex-col items-start"
          >
            <span>Hide video</span>
            <span className="text-xs font-normal text-muted-foreground">
              Guess from command only
            </span>
          </Label>
        </div>
        <div className="flex items-center gap-3">
          <Switch
            id={onHitId}
            checked={frameType === 'hit'}
            onCheckedChange={(checked) =>
              onFrameTypeChange(checked ? 'hit' : 'block')
            }
          />
          <Label
            htmlFor={onHitId}
            className="cursor-pointer flex-col items-start"
          >
            <span>On hit</span>
            <span className="text-xs font-normal text-muted-foreground">
              Guess frames on hit instead of on block
            </span>
          </Label>
        </div>
        <div className="flex items-center gap-3">
          <Switch
            id={hardId}
            checked={isHardAvailable && modifiers.hard}
            disabled={!isHardAvailable}
            onCheckedChange={() => onToggle('hard')}
          />
          <Label
            htmlFor={hardId}
            className="cursor-pointer flex-col items-start peer-data-disabled:cursor-not-allowed peer-data-disabled:opacity-50"
          >
            <span>Hard mode</span>
            <span className="text-xs font-normal text-muted-foreground">
              {isHardAvailable
                ? 'Smaller frame ranges to choose from'
                : 'Hard mode is only available on block'}
            </span>
          </Label>
        </div>
      </div>
    </div>
  );
};
