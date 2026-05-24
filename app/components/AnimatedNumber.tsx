import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';

type AnimatedNumberProps = {
  value: number;
  className?: string;
  duration?: number;
  ease?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
  decimals?: number;
  locale?: string;
  animateOnMount?: boolean;
  animateOnDecrease?: boolean;
  formatter?: (value: number) => string;
};

const clampDecimals = (decimals: number): number => {
  return Math.min(6, Math.max(0, Math.floor(decimals)));
};

const roundTo = (value: number, decimals: number): number => {
  const safeDecimals = clampDecimals(decimals);
  const factor = 10 ** safeDecimals;
  return Math.round(value * factor) / factor;
};

export const AnimatedNumber = ({
  value,
  className,
  duration = 0.3,
  ease = 'easeOut',
  decimals = 0,
  locale,
  animateOnMount = false,
  animateOnDecrease = true,
  formatter,
}: AnimatedNumberProps) => {
  const safeDecimals = clampDecimals(decimals);
  const roundedValue = roundTo(value, safeDecimals);
  const [displayValue, setDisplayValue] = useState<number>(roundedValue);
  const [animationKey, setAnimationKey] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const previousValueRef = useRef<number>(roundedValue);
  const hasMountedRef = useRef(false);
  const shouldReduceMotion = useReducedMotion();

  const numberFormatter = useMemo(() => {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: safeDecimals,
      maximumFractionDigits: safeDecimals,
    });
  }, [safeDecimals, locale]);

  useEffect(() => {
    const from = previousValueRef.current;
    const to = roundedValue;
    const isDecrease = to < from;
    const canAnimateDecrease = animateOnDecrease || !isDecrease;
    const canAnimate = canAnimateDecrease && !shouldReduceMotion;

    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      previousValueRef.current = to;
      if (!animateOnMount || !canAnimate) {
        setDisplayValue(to);
        return;
      }

      setDirection(1);
      setDisplayValue(to);
      setAnimationKey((current) => current + 1);
      return;
    }

    if (!canAnimate) {
      previousValueRef.current = to;
      setDisplayValue(to);
      return;
    }

    if (to === from) {
      return;
    }

    setDirection(isDecrease ? -1 : 1);
    setDisplayValue(to);
    setAnimationKey((current) => current + 1);

    previousValueRef.current = to;
  }, [roundedValue, animateOnMount, animateOnDecrease, shouldReduceMotion]);

  const renderedValue = formatter
    ? formatter(displayValue)
    : numberFormatter.format(displayValue);

  return (
    <span className={className}>
      <span
        style={{
          display: 'inline-grid',
          overflow: 'hidden',
          verticalAlign: 'bottom',
        }}
      >
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={animationKey}
            style={{ gridArea: '1 / 1', display: 'inline-block' }}
            initial={
              shouldReduceMotion
                ? false
                : { y: direction === 1 ? '100%' : '-100%', opacity: 0 }
            }
            animate={shouldReduceMotion ? undefined : { y: '0%', opacity: 1 }}
            exit={
              shouldReduceMotion
                ? undefined
                : { y: direction === 1 ? '-100%' : '100%', opacity: 0 }
            }
            transition={{ duration, ease }}
          >
            {renderedValue}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
};
