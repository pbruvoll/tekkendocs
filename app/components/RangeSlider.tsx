import { useMemo, useState } from 'react'
import { Slider } from '@/components/ui/slider'

export type RangeSliderProps = {
  values: [number | undefined, number | undefined]
  min: number
  max: number
  onValuesCommit: (values: [number | undefined, number | undefined]) => void
}

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
  )
  const [originalValues, setOriginalValues] = useState(valuesFromPropsFixed)
  const [values, setValues] = useState(valuesFromPropsFixed)

  if (
    valuesFromPropsFixed[0] !== originalValues[0] ||
    valuesFromPropsFixed[1] !== originalValues[1]
  ) {
    setOriginalValues(valuesFromPropsFixed)
    setValues(valuesFromPropsFixed)
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
        onValueChange={value => setValues([value[0], value[1]])}
        onValueCommit={value =>
          onValuesCommit([
            value[0] === min ? undefined : value[0],
            value[1] === max ? undefined : value[1],
          ])
        }
        onLostPointerCapture={() => {
          if (
            (valuesFromPropsFixed[0] !== values[0] ||
              valuesFromProps[1] !== values[1]) &&
            values[0] === values[1]
          ) {
            onValuesCommit([
              values[0] === min ? undefined : values[0],
              values[1] === max ? undefined : values[1],
            ])
          }
        }}
      />
    </div>
  )
}
