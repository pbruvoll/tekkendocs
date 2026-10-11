import * as React from 'react';
import { cn } from '@/lib/utils';

// Styled to match the "surface" tables the site used with Radix Themes:
// a rounded, bordered panel with 12px cell padding and a hairline between rows.

const cellClassName =
  'h-11 p-3 text-left align-top shadow-[inset_0_-1px_rgb(255_255_255/0.133)]';

/** className and style apply to the scrollable container around the table */
const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, style, ...props }, ref) => (
  <div
    className={cn(
      'relative w-full overflow-x-auto rounded-[12px] border border-[oklab(0.425_0_0/0.567)] bg-panel bg-clip-padding',
      className,
    )}
    style={style}
  >
    <table
      ref={ref}
      className="w-full border-collapse text-left text-sm leading-5"
      {...props}
    />
  </div>
));
Table.displayName = 'Table';

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn('[&_th]:bg-white/[0.035]', className)}
    {...props}
  />
));
TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn('[&>tr:last-child>*]:shadow-none', className)}
    {...props}
  />
));
TableBody.displayName = 'TableBody';

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr ref={ref} className={className} {...props} />
));
TableRow.displayName = 'TableRow';

/** A header cell; column headers are bold, pass `scope="row"` for row headers */
const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, scope, ...props }, ref) => (
  <th
    ref={ref}
    scope={scope}
    className={cn(
      cellClassName,
      scope === 'row' ? 'font-normal' : 'font-bold',
      className,
    )}
    {...props}
  />
));
TableHead.displayName = 'TableHead';

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td ref={ref} className={cn(cellClassName, className)} {...props} />
));
TableCell.displayName = 'TableCell';

export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow };
