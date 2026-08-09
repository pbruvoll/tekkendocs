import {
  BookOpen,
  CalendarCheck,
  type LucideIcon,
  Table2,
  Zap,
} from 'lucide-react';
import { href, Link } from 'react-router';

type MainFeature = {
  name: string;
  description: string;
  url: string;
  icon: LucideIcon;
};

const mainFeatures: MainFeature[] = [
  {
    name: 'Frame data',
    description:
      'Full move lists with frame advantage, in-depth details and videos',
    url: href('/t8/framedata'),
    icon: Table2,
  },
  {
    name: 'Character guides',
    description:
      'Key moves, combos, punishers and defensive tips, written by high level players',
    url: href('/t8/guides'),
    icon: BookOpen,
  },
  {
    name: 'Daily challenge',
    description: 'Ten moves a day. Guess the block frames and keep your streak',
    url: href('/t8/dailychallenge'),
    icon: CalendarCheck,
  },
  {
    name: 'Frame quiz',
    description: 'See how many block frames you can guess correctly in a row',
    url: href('/t8/framequiz'),
    icon: Zap,
  },
];

export const MainFeatureCards = () => {
  return (
    <ul className="grid grid-cols-2 gap-2 xs:gap-3 lg:grid-cols-4">
      {mainFeatures.map(({ name, description, url, icon: Icon }, index) => (
        <li
          key={name}
          className="h-full translate-y-0 opacity-100 transition-[opacity,translate] duration-500 ease-out motion-reduce:transition-none starting:translate-y-3 starting:opacity-0"
          style={{ transitionDelay: `${index * 75}ms` }}
        >
          <Link to={url} className="group block h-full">
            <div className="relative flex h-full flex-col gap-2 overflow-hidden rounded-lg border border-border bg-card p-3 transition duration-300 xs:p-4 hover:-translate-y-1 hover:border-primary hover:shadow-lg">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary transition duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon size={20} aria-hidden />
                </span>
                <h3 className="text-base font-semibold leading-tight tracking-tight">
                  {name}
                </h3>
              </div>
              <p className="text-sm leading-snug text-muted-foreground">
                {description}
              </p>
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
};
