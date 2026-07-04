import { Fragment } from 'react';

type ComboSequenceProps = {
  combo: string;
};

/** Renders a combo string like "UF3 > D4,1 > B4" as a sequence of step chips */
export const ComboSequence = ({ combo }: ComboSequenceProps) => {
  const steps = combo
    .split('>')
    .map((step) => step.trim())
    .filter(Boolean);
  return (
    <span className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-1.5">
      {steps.map((step, index) => (
        <Fragment key={`${step}-${index}`}>
          {index > 0 && (
            <span aria-hidden className="text-muted-foreground/70">
              →
            </span>
          )}
          <span className="rounded-md bg-muted px-2 py-0.5 text-sm">
            {step}
          </span>
        </Fragment>
      ))}
    </span>
  );
};
