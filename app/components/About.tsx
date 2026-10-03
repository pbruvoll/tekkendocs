import { guideAbout } from '~/constants/guideAbout';

type AboutProps = {
  about: Record<string, string>;
  /** For pages in another language. The date is formatted for the locale */
  labels?: { lastUpdated: string; gameVersion: string; locale: string };
};
export const About = ({
  about,
  labels = {
    lastUpdated: 'Last updated',
    gameVersion: 'Game version',
    locale: 'en-US',
  },
}: AboutProps) => {
  const lastUpdated = about[guideAbout.lastUpdated];
  const gameVersion = about[guideAbout.gameVersion];
  if (!lastUpdated && !gameVersion) {
    return null;
  }
  return (
    <div className="flex flex-wrap gap-2 py-2 text-sm opacity-90">
      {lastUpdated && (
        <span>
          {labels.lastUpdated}{' '}
          {new Date(lastUpdated).toLocaleDateString(labels.locale, {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
          })}
          {', '}
        </span>
      )}
      {gameVersion && (
        <span>
          {labels.gameVersion} {gameVersion}
        </span>
      )}
    </div>
  );
};
