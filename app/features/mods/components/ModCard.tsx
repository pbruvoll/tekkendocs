import { ExternalLinkIcon } from '@radix-ui/react-icons';
import { PaperCard } from '~/components/PaperCard';
import { type Mod } from '~/features/mods/mods';

type ModCardProps = { mod: Mod };

export const ModCard = ({ mod }: ModCardProps) => (
  <PaperCard className="flex flex-col">
    <div className="mb-4 aspect-video w-full overflow-hidden rounded-md border border-border">
      <img
        src={mod.imageUrl}
        alt={`Screenshot of ${mod.name}`}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
    </div>
    <h2 className="text-lg font-semibold tracking-tight">{mod.name}</h2>
    <p className="mt-2 grow leading-relaxed text-muted-foreground">
      {mod.description}
    </p>
    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
      {mod.links.map(({ label, url }) => (
        <a
          key={url}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-primary underline underline-offset-2"
        >
          {label}
          <ExternalLinkIcon aria-hidden />
        </a>
      ))}
    </div>
  </PaperCard>
);
