import { Link } from 'react-router';
import { type GuideData } from './GuideData';
import { getGuideNavItems } from './guideUtils';

type GuideNavProps = {
  guideData: Partial<GuideData>;
};

/** Chip based section navigation, used on screens without room for the sidebar */
export const GuideNav = ({ guideData }: GuideNavProps) => {
  const navItems = getGuideNavItems(guideData);

  if (!navItems.length) return null;

  return (
    <nav className="mt-4">
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        In this guide
      </p>
      <div className="flex flex-wrap gap-1">
        {navItems.map(({ name, id }) => (
          <Link
            key={id}
            to={`#${id}`}
            className="rounded-r-full border border-border border-l-2 border-l-primary bg-muted/50 py-px pl-1.5 pr-2 text-xs text-primary transition-colors hover:bg-muted"
          >
            {name}
          </Link>
        ))}
      </div>
    </nav>
  );
};
