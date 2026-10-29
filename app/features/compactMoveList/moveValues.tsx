import { Fragment } from 'react';

import { type Move } from '~/types/Move';
import {
  getBlockFrameColorClasses,
  getHitFrameColorClasses,
  simplifyFrameValue,
} from '~/utils/frameDataViewUtils';

export const moveKey = (move: Move) => move.id || move.command;

/** Missing values are faint, so the real values stand out */
export const Faint = () => <span className="text-muted-foreground/30">—</span>;

export const StartupValue = ({ move }: { move: Move }) => {
  const v = simplifyFrameValue(move.startup || '');
  return v ? <span>{v}</span> : <Faint />;
};

export const BlockValue = ({ move }: { move: Move }) => {
  const v = simplifyFrameValue(move.block || '');
  return v ? (
    <span className={getBlockFrameColorClasses(v)}>{v}</span>
  ) : (
    <Faint />
  );
};

export const HitValue = ({ move }: { move: Move }) => {
  const v = simplifyFrameValue(move.hit || '');
  return v ? (
    <span className={getHitFrameColorClasses(v)}>{v}</span>
  ) : (
    <Faint />
  );
};

/** Counter hit is only shown when it differs from hit */
export const CounterHitValue = ({ move }: { move: Move }) => {
  if (!move.counterHit || move.counterHit === move.hit) return <Faint />;
  const v = simplifyFrameValue(move.counterHit);
  return <span className={getHitFrameColorClasses(v)}>{v}</span>;
};

/** Keeps the text as is, but lets it wrap after commas, also when there is no space after them */
export const WrapAtCommas = ({ text }: { text: string }) =>
  text.split(',').map((part, index, array) => (
    // biome-ignore lint/suspicious/noArrayIndexKey: Static list
    <Fragment key={index}>
      {part}
      {index < array.length - 1 && (
        <>
          ,<wbr />
        </>
      )}
    </Fragment>
  ));
