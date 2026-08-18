import cx from 'classix';

export type PaperCardProps = React.PropsWithChildren<{
  className?: string;
}>;

/** Card with the cut-paper edges, used for content cards across the site. */
export const PaperCard = ({ className, children }: PaperCardProps) => (
  <div
    className={cx(
      'paper-card group px-5 py-5 text-card-foreground drop-shadow-lg transition-all duration-200 hover:-translate-y-1 hover:drop-shadow-2xl',
      className,
    )}
  >
    {children}
  </div>
);
