import cx from 'classix';

export type ContentContainerProps = React.PropsWithChildren<{
  disableXPadding?: boolean;
  disableMaxWidth?: boolean;
  enableTopPadding?: boolean;
  enableBottomPadding?: boolean;
  className?: string;
  /** Set when the content is in another language than the rest of the page */
  lang?: string;
}>;

export const ContentContainer = ({
  disableXPadding: disableXMargin,
  enableTopPadding,
  enableBottomPadding,
  disableMaxWidth,
  className,
  lang,
  children,
}: ContentContainerProps) => {
  return (
    <div
      lang={lang}
      className={cx(
        !disableXMargin && 'px-2 sm:px-4',
        enableTopPadding && 'pt-2 sm:pt-4',
        enableBottomPadding && 'pb-2 sm:pb-4',
        !disableMaxWidth && 'max-w-5xl',
        className,
        'mx-auto',
      )}
    >
      {children}
    </div>
  );
};
