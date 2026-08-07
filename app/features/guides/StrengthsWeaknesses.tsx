import cx from 'classix';
import { CircleCheck, CircleMinus } from 'lucide-react';
import { TextWithCommand } from '~/components/TextWithCommand';
import { useGuideContext } from './GuideContext';

type CoreProps = {
  section: string[];
  type: 'strengths' | 'weaknesses';
};
const Core = ({ section, type }: CoreProps) => {
  const { charUrl, compressedCommandMap } = useGuideContext();
  const isStrengths = type === 'strengths';
  const Icon = isStrengths ? CircleCheck : CircleMinus;
  return (
    <section
      id={type}
      className={cx(
        'overflow-hidden rounded-xl border',
        isStrengths ? 'border-success/40' : 'border-destructive/40',
      )}
    >
      <h2
        className={cx(
          'flex items-center gap-2 px-4 py-2.5 text-lg font-bold',
          isStrengths
            ? 'bg-success/15 text-foreground-success'
            : 'bg-destructive/15 text-foreground-destructive',
        )}
      >
        <Icon aria-hidden className="size-5 shrink-0" />
        {isStrengths ? 'Strengths' : 'Weaknesses'}
      </h2>
      <ul className="space-y-2.5 p-4">
        {section.map((text, index) => (
          <li key={`${text.slice(0, 40)}-${index}`} className="flex gap-2.5">
            <Icon
              aria-hidden
              className={cx(
                'mt-1 size-4 shrink-0',
                isStrengths
                  ? 'text-foreground-success'
                  : 'text-foreground-destructive',
              )}
            />
            <span className="leading-relaxed">
              <TextWithCommand
                text={text}
                charUrl={charUrl}
                compressedCommandMap={compressedCommandMap}
              />
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
};

type StrengthsWeaknessesProps = {
  strengths?: string[];
  weaknesses?: string[];
};

export const StrengthsWeaknesses = ({
  strengths,
  weaknesses,
}: StrengthsWeaknessesProps) => {
  return (
    <section className="my-10 grid items-start gap-4 md:grid-cols-2">
      {!!strengths?.length && <Core section={strengths} type="strengths" />}
      {!!weaknesses?.length && <Core section={weaknesses} type="weaknesses" />}
    </section>
  );
};
