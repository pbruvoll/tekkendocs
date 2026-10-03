import cx from 'classix';

export type ContentContainerProps = React.PropsWithChildren<{
  disableXPadding?: boolean;
  disableMaxWidth?: boolean;
  enableTopPadding?: boolean;
  enableBottomPadding?: boolean;
  className?: string;
  /** Set when the content is in another language than the rest of the page */
  lang?: string;
  /** With rtl, each paragraph still gets the direction of its own text, so ltr notation like "df+1,4" is not reordered */
  dir?: 'ltr' | 'rtl';
}>;

export const ContentContainer = ({
  disableXPadding: disableXMargin,
  enableTopPadding,
  enableBottomPadding,
  disableMaxWidth,
  className,
  lang,
  dir,
  children,
}: ContentContainerProps) => {
  return (
    <div
      lang={lang}
      dir={dir}
      className={cx(
        dir === 'rtl' && '[&_*]:[unicode-bidi:plaintext]',
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
