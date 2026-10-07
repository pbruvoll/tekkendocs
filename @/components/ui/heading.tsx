import { cva, type VariantProps } from 'class-variance-authority';
import type * as React from 'react';
import { cn } from '@/lib/utils';

// Sizes mirror the Radix Themes Heading scale (font size / line height /
// letter spacing) so headings look the same after migrating away from it.
const headingVariants = cva('font-bold', {
  variants: {
    size: {
      '1': 'text-[12px]/[16px] tracking-[0.0025em]',
      '2': 'text-[14px]/[18px]',
      '3': 'text-[16px]/[22px]',
      '4': 'text-[18px]/[24px] tracking-[-0.0025em]',
      '5': 'text-[20px]/[26px] tracking-[-0.005em]',
      '6': 'text-[24px]/[30px] tracking-[-0.00625em]',
      '7': 'text-[28px]/[36px] tracking-[-0.0075em]',
      '8': 'text-[35px]/[40px] tracking-[-0.01em]',
      '9': 'text-[60px]/[60px] tracking-[-0.025em]',
    },
  },
  defaultVariants: {
    size: '6',
  },
});

type HeadingProps = React.ComponentProps<'h1'> &
  VariantProps<typeof headingVariants> & {
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  };

function Heading({ as: Tag = 'h1', size, className, ...props }: HeadingProps) {
  return (
    <Tag className={cn(headingVariants({ size }), className)} {...props} />
  );
}

export { Heading, headingVariants };
