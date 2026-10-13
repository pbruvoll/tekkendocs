import type * as React from 'react';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';

type FilterToggleButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  'variant'
> & {
  active?: boolean;
};

/** A pill shaped on/off button used to toggle a single frame data filter */
export const FilterToggleButton = ({
  active = false,
  className,
  ...props
}: FilterToggleButtonProps) => (
  <Button
    type="button"
    aria-pressed={active}
    className={cn(
      'h-8 rounded-full px-3 font-semibold',
      !active &&
        'bg-transparent text-primary inset-ring inset-ring-primary/50 hover:bg-primary/5',
      className,
    )}
    {...props}
  />
);
