import { cva, type VariantProps } from 'class-variance-authority';
import type * as React from 'react';
import { cn } from '~/lib/utils';

// Sizes 1-4 mirror the Radix Themes Heading scale (font size / line height /
// letter spacing) so headings look the same after migrating away from it.
// Sizes 5 and up are the h1/h2 titles drawn in the display face: they step up
// from the sm breakpoint so they hold their own on wide screens, and leave
// letter spacing to the display-heading utility.
const headingVariants = cva('font-bold', {
  variants: {
    size: {
      '1': 'text-[12px]/[16px] tracking-[0.0025em]',
      '2': 'text-[14px]/[18px]',
      '3': 'text-[16px]/[22px]',
      '4': 'text-[18px]/[24px] tracking-[-0.0025em]',
      '5': 'text-[20px]/[26px] sm:text-[24px]/[30px]',
      '6': 'text-[24px]/[30px] sm:text-[30px]/[36px]',
      '7': 'text-[26px]/[32px] sm:text-[34px]/[40px]',
      '8': 'text-[30px]/[36px] sm:text-[40px]/[44px]',
      '9': 'text-[40px]/[44px] sm:text-[60px]/[60px]',
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
