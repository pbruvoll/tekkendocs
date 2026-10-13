import { cn } from '~/lib/utils';
import { TrophyProgress } from './TrophyProgress';

export type TaskProgressProps = {
  numCompleted: number;
  total: number;
  className?: string;
};

export const TaskProgress = ({
  numCompleted,
  total,
  className,
}: TaskProgressProps) => {
  const progressPercentage = (100 * numCompleted) / total;
  return (
    <div className={cn('my-3 mb-4 flex items-center gap-3', className)}>
      <h3>Progress</h3>
      <div className="h-5 grow rounded-3xl bg-muted ">
        <div
          className="h-full rounded-3xl bg-primary/80"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      <div>
        {numCompleted} / {total}
      </div>
      <TrophyProgress progressPercentage={progressPercentage}></TrophyProgress>
    </div>
  );
};
