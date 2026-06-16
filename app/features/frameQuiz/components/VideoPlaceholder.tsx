import cx from 'classix';

type VideoPlaceholderProps = {
  className?: string;
};

export const VideoPlaceholder = ({ className }: VideoPlaceholderProps) => (
  <div className={cx('relative aspect-video bg-muted/30', className)}>
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="relative flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-muted-foreground/20 animate-[spin_12s_linear_infinite]" />
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/50 ring-1 ring-muted-foreground/15">
            <span className="select-none text-4xl font-black text-muted-foreground/30">
              ?
            </span>
          </div>
        </div>
        <span className="select-none text-xs font-semibold uppercase tracking-widest text-muted-foreground/25">
          Video hidden
        </span>
      </div>
    </div>
  </div>
);
