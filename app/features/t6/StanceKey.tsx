import { type T6Stance } from './T6Stance';

type StanceKeyProps = {
  stances: T6Stance[];
};

/** Explains the stance codes used as command prefix, e.g. MT means Muay Thai */
export const StanceKey = ({ stances }: StanceKeyProps) => {
  if (stances.length === 0) {
    return null;
  }
  return (
    <dl className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
      <span className="font-semibold">Stances:</span>
      {stances.map(({ code, name }) => (
        <div key={code} className="flex gap-1.5">
          <dt className="font-semibold text-primary">{code}</dt>
          <dd className="text-muted-foreground">{name}</dd>
        </div>
      ))}
    </dl>
  );
};
