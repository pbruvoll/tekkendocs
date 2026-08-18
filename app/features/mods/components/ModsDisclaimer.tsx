import { ExclamationTriangleIcon } from '@radix-ui/react-icons';

export const ModsDisclaimer = () => (
  <div className="flex gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
    <ExclamationTriangleIcon
      className="mt-0.5 size-5 shrink-0 text-primary"
      aria-hidden
    />
    <p>
      These mods are made by the community, not by TekkenDocs. We do not host,
      maintain or verify them, so use them at your own risk. Modding is
      generally only possible on PC, and mods can stop working or break the game
      after a patch. Always read the instructions from the mod itself before
      installing.
    </p>
  </div>
);
