import { useId } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export type QuizModifier = 'hideCommand' | 'hideVideo';

export type QuizModifiers = {
  hideCommand: boolean;
  hideVideo: boolean;
};

type QuizModifierControlsProps = {
  modifiers: QuizModifiers;
  onToggle: (modifier: QuizModifier) => void;
};

export const QuizModifierControls = ({
  modifiers,
  onToggle,
}: QuizModifierControlsProps) => {
  const id = useId();
  const hideCommandId = `${id}-hide-command`;
  const hideVideoId = `${id}-hide-video`;

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
            className="flex cursor-pointer flex-col"
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
          <Label htmlFor={hideVideoId} className="flex cursor-pointer flex-col">
            <span>Hide video</span>
            <span className="text-xs font-normal text-muted-foreground">
              Guess from command only
            </span>
          </Label>
        </div>
      </div>
    </div>
  );
};
