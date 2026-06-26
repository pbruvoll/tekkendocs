import { useId } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export type QuizOption = 'autoShowDetails';

export type QuizOptionValues = {
  autoShowDetails: boolean;
};

type QuizOptionsProps = {
  options: QuizOptionValues;
  onToggle: (option: QuizOption) => void;
};

export const QuizOptions = ({ options, onToggle }: QuizOptionsProps) => {
  const id = useId();
  const autoShowDetailsId = `${id}-auto-show-details`;

  return (
    <div className="mt-6 border-t border-border/60 pt-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Options
      </p>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Switch
            id={autoShowDetailsId}
            checked={options.autoShowDetails}
            onCheckedChange={() => onToggle('autoShowDetails')}
          />
          <Label
            htmlFor={autoShowDetailsId}
            className="flex cursor-pointer flex-col"
          >
            <span>Auto show move details</span>
            <span className="text-xs font-normal text-muted-foreground">
              Reveal move details automatically after you answer
            </span>
          </Label>
        </div>
      </div>
    </div>
  );
};
