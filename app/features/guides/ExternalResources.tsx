import { type ExternalResource } from './GuideData';
import { GuideSectionHeading } from './GuideSectionHeading';

export const ExternalResources = ({
  externalResources,
}: {
  externalResources: ExternalResource[];
}) => {
  return (
    <section className="my-4 mb-8" id="external-resources">
      <GuideSectionHeading title="External Resources" />

      <ul>
        {externalResources.map((resource) => (
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
