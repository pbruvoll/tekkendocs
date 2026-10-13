import { useMemo, useState } from 'react';
import { Slider } from '~/components/ui/slider';

export type RangeSliderProps = {
  values: [number | undefined, number | undefined];
  min: number;
  max: number;
  onValuesCommit: (values: [number | undefined, number | undefined]) => void;
};

// the slider is always a range here, so it reports two values
const toRange = (value: number | readonly number[]): [number, number] =>
  typeof value === 'number' ? [value, value] : [value[0], value[1]];

export const RangeSlider = ({
  values: valuesFromProps,
  min,
  max,
  onValuesCommit,
}: RangeSliderProps) => {
  const valuesFromPropsFixed = useMemo(
    () => [
      valuesFromProps[0] === undefined ? min : valuesFromProps[0],
      valuesFromProps[1] === undefined ? max : valuesFromProps[1],
    ],
    [max, min, valuesFromProps],
  );
  const [originalValues, setOriginalValues] = useState(valuesFromPropsFixed);
  const [values, setValues] = useState(valuesFromPropsFixed);

  if (
    valuesFromPropsFixed[0] !== originalValues[0] ||
    valuesFromPropsFixed[1] !== originalValues[1]
  ) {
    setOriginalValues(valuesFromPropsFixed);
    setValues(valuesFromPropsFixed);
  }

  return (
    <div>
      <div className="mb-2 flex justify-between">
        <div className="opacity-55">
          {values[0] === min ? 'All' : values[0]}
        </div>
        <div className="opacity-55">
          {values[1] === max ? 'All' : values[1]}
        </div>
      </div>
      <Slider
        value={values}
        max={max}
        min={min}
        step={1}
        // let thumbs pass each other, so overlapping thumbs never get stuck
        thumbCollisionBehavior="swap"
        onValueChange={(value) => setValues(toRange(value))}
        onValueCommitted={(value) => {
          const [from, to] = toRange(value);
          onValuesCommit([
            from === min ? undefined : from,
            to === max ? undefined : to,
          ]);
        }}
      />
    </div>
  );
};
