import { Heading } from '@radix-ui/themes';
import cx from 'classix';
import { Link } from 'react-router';
import { TextWithCommand } from '~/components/TextWithCommand';
import { characterInfoT8List } from '~/constants/characterInfoListT8';
import { t8AvatarMap } from '~/utils/t8AvatarMap';
import { useGuideContext } from './GuideContext';
import { type Matchup } from './GuideData';
import { GuideSectionHeading } from './GuideSectionHeading';

/** The sheet names characters by their display name, so map back from that. */
const characterIdByName = characterInfoT8List.reduce<Record<string, string>>(
  (current, { id, displayName }) => {
    current[displayName.toLowerCase()] = id;
    return current;
  },
  {},
);

const getCharacterId = (characterName: string): string | undefined =>
  characterIdByName[characterName.toLowerCase()];

type CharacterHeadingProps = {
  characters: string[];
  gameUrl: string;
};
const CharacterHeading = ({ characters, gameUrl }: CharacterHeadingProps) => (
  <Heading as="h4" size="3" className="flex items-center gap-2">
    {characters.map((name, index) => {
      const characterId = getCharacterId(name);
      const avatarSrc = characterId ? t8AvatarMap[characterId] : undefined;
      return (
        <span key={name} className="flex items-center gap-2">
          {index > 0 && (
            <span aria-hidden className="text-muted-foreground">
              /
            </span>
          )}
          {avatarSrc && (
            <img className="aspect-square w-8" src={avatarSrc} alt="" />
          )}
          {characterId ? (
            <Link className="text-primary" to={`${gameUrl}/${characterId}`}>
              {name}
            </Link>
          ) : (
            name
          )}
        </span>
      );
    })}
  </Heading>
);

type MatchupListProps = {
  matchups: Matchup[];
  type: 'good' | 'bad';
};
const MatchupList = ({ matchups, type }: MatchupListProps) => {
  const { charUrl, compressedCommandMap } = useGuideContext();
  // charUrl is "/<game>/<character>", the character links need just the game
  const gameUrl = charUrl.slice(0, charUrl.lastIndexOf('/'));
  return (
    <section className="mb-4">
      <Heading
        as="h3"
        size="4"
        className={cx(
          type === 'good'
            ? 'border-l-4 border-success bg-success/20 text-foreground-success'
            : 'border-l-4 border-destructive bg-destructive/20 text-foreground-destructive',
          'p-2',
        )}
      >
        {type === 'good' ? 'Good matchups' : 'Bad matchups'}
      </Heading>
      {matchups.map(({ characters, description }) => (
        <section key={characters.join('|')} className="my-4">
          <CharacterHeading characters={characters} gameUrl={gameUrl} />
          <div className="mt-1">
            <TextWithCommand
              text={description}
              charUrl={charUrl}
              compressedCommandMap={compressedCommandMap}
            />
          </div>
        </section>
      ))}
    </section>
  );
};

type MatchupsProps = {
  good?: Matchup[];
  bad?: Matchup[];
};
export const Matchups = ({ good, bad }: MatchupsProps) => {
  return (
    <section className="my-6 mb-10" id="matchups">
      <GuideSectionHeading title="Matchups" />
      <div className="grid-cols-2 gap-6 md:grid">
        {!!good?.length && <MatchupList matchups={good} type="good" />}
        {!!bad?.length && <MatchupList matchups={bad} type="bad" />}
      </div>
    </section>
  );
};
