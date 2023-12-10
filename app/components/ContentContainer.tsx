import cx from 'classix'

export type ContentContainerProps = React.PropsWithChildren<{
  disableXPadding?: boolean
  enableTopPadding?: boolean
  enableBottomPadding?: boolean
}>

export const ContentContainer = ({
  disableXPadding: disableXMargin,
  enableTopPadding,
  enableBottomPadding,
  children,
}: ContentContainerProps) => {
  return (
    <div
      className={cx(
        !disableXMargin && 'px-2 sm:px-4',
        enableTopPadding && 'pt-2 sm:pt-4',
        enableBottomPadding && 'pb-2 sm:pb-4',
        'mx-auto max-w-5xl',
      )}
    >
      {children}
    </div>
  )
}
