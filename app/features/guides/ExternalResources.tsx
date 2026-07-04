import { ExternalLink } from 'lucide-react';
import { type ExternalResource } from './GuideData';
import { GuideSectionHeading } from './GuideSectionHeading';

export const ExternalResources = ({
  externalResources,
}: {
  externalResources: ExternalResource[];
}) => {
  return (
    <section className="my-10" id="external-resources">
      <GuideSectionHeading title="External Resources" />

      <ul className="grid gap-2 sm:grid-cols-2">
        {externalResources.map((resource) => (
          <li key={resource.name}>
            <a
              className="flex items-center gap-2 rounded-lg border border-border bg-card/50 px-3 py-2 text-primary transition-colors hover:bg-muted/60"
              target="_blank"
              href={resource.url}
              rel="noreferrer"
            >
              <ExternalLink aria-hidden className="size-4 shrink-0" />
              {resource.name}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
};
