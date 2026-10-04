import { characterInfoT8List } from '~/constants/characterInfoListT8';
import { getReplayDatabaseUrl } from '~/features/replayDatabase/replayDatabaseUrl';
import { useGuideContext } from './GuideContext';
import { type ExternalResource } from './GuideData';
import { GuideSectionHeading } from './GuideSectionHeading';

export const ExternalResources = ({
  externalResources,
  characterId,
}: {
  externalResources: ExternalResource[];
  characterId: string;
}) => {
  const { texts } = useGuideContext();
  const character =
    characterInfoT8List.find((c) => c.id === characterId)?.displayName ??
    characterId;
  const resources: ExternalResource[] = [
    ...externalResources,
    {
      name: texts.replayDatabaseLink({ character }),
      url: getReplayDatabaseUrl(characterId),
    },
  ];
  return (
    <section className="my-4 mb-8" id="external-resources">
      <GuideSectionHeading section="externalResources" />

      <ul>
        {resources.map((resource) => (
          <li key={resource.name}>
            <a
              className="block py-1 text-primary"
              target="_blank"
              href={resource.url}
              rel="noreferrer"
            >
              {resource.name}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
};
