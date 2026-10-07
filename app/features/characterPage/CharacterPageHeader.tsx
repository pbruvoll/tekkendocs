import { Pencil1Icon } from '@radix-ui/react-icons';
import { headingVariants } from '@/components/ui/heading';
import { cn } from '@/lib/utils';
import { ContentContainer } from '~/components/ContentContainer';
import { t8AvatarMap } from '~/utils/t8AvatarMap';
import { getCharacterDisplayName } from './characterDisplayName';
import { getCharacterNavData } from './characterNavData';
import Nav from './Nav';

type CharacterPageHeaderProps = {
  characterName: string;
  editUrl?: string;
};

export const CharacterPageHeader = ({
  characterName,
  editUrl,
}: CharacterPageHeaderProps) => {
  return (
    <ContentContainer enableTopPadding>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            className="aspect-square w-12"
            src={t8AvatarMap[characterName]}
            alt={characterName}
          />
          {/* the character name is shared chrome, not the title of the page
              below it, so each sub page renders its own h1 */}
          <p className={cn(headingVariants({ size: '6' }), 'my-2 capitalize')}>
            {getCharacterDisplayName(characterName)}
          </p>
        </div>
        {editUrl && (
          <a
            className="flex items-center gap-2 text-primary"
            target="_blank"
            rel="noopener"
            href={editUrl}
          >
            <Pencil1Icon />
            Edit
          </a>
        )}
      </div>

      <Nav navData={getCharacterNavData(characterName)} />
    </ContentContainer>
  );
};
