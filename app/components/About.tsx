import { guideAbout } from '~/constants/guideAbout'

type AboutProps = {
  about: Record<string, string>
}
export const About = ({ about }: AboutProps) => {
  const lastUpdated = about[guideAbout.lastUpdated]
  const gameVersion = about[guideAbout.gameVersion]
  if (!lastUpdated && !gameVersion) {
    return null
  }
  return (
    <div className="flex flex-wrap gap-2 py-2 text-sm opacity-90">
      {lastUpdated && (
        <span>
          Last updated{' '}
          {new Date(lastUpdated).toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
          })}
          {', '}
        </span>
      )}
      {gameVersion && <span>Game version {gameVersion}</span>}
    </div>
  )
}
