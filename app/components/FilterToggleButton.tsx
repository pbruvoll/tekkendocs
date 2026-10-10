import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type FilterToggleButtonProps = Omit<ButtonProps, 'variant'> & {
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
        'bg-transparent text-primary shadow-[inset_0_0_0_1px_rgb(255_174_53/0.53)] hover:bg-primary/5',
      className,
    )}
    {...props}
  />
);
