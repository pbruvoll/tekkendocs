import { ModCard } from '~/features/mods/components/ModCard';
import { mods } from '~/features/mods/mods';

export const ModList = () => (
  <div className="grid gap-6 sm:grid-cols-2">
    {mods.map((mod) => (
      <ModCard key={mod.name} mod={mod} />
    ))}
  </div>
);
