import cx from 'classix'

export type TrophyProgressProps = {
  progressPercentage: number
}
export const TrophyProgress = ({ progressPercentage }: TrophyProgressProps) => {
  const opacityClass = progressPercentage < 25 ? 'opacity-30' : ''
  let tropyIcon = '🥉'
  if (progressPercentage === 100) {
    tropyIcon = '🥇'
  } else if (progressPercentage >= 75) {
    tropyIcon = '🥈'
  }

  return <span className={cx('text-3xl', opacityClass)}>{tropyIcon}</span>
}
