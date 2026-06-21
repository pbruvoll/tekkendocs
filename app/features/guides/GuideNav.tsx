import { Link } from 'react-router';
import { type GuideData } from './GuideData';

type GuideNavProps = {
  guideData: Partial<GuideData>;
};

export const GuideNav = ({ guideData }: GuideNavProps) => {
  const navItems = [
    !!guideData.introduction && 'Introduction',
    !!guideData.strengths && 'Strengths',
    !!guideData.weaknesses && 'Weaknesses',
    !!guideData.heatSystem && 'Heat System',
    !!guideData.installments && 'Installments',
    !!guideData.keyMoves && 'Top 10 Moves',
    !!guideData.standingPunishers && 'Punishers',
    !!guideData.combos && 'Combos',
    !!guideData.keyMoves && guideData.keyMoves.length > 10 && 'Notable Moves',
    !!guideData.stances && 'Stances',
    !!guideData.panicMoves && 'Panic Moves',
    !!guideData.frameTraps && 'Frame Traps',
    !!guideData.knowledgeChecks && 'Knowledge Checks',
    !!(guideData.defensiveTips || guideData.defensiveMoves) && 'Defensive Tips',
    !!guideData.externalResources && 'External Resources',
  ].filter(Boolean) as string[];

  if (!navItems.length) return null;

  return (
    <nav className="mt-4">
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        In this guide
      </p>
      <div className="flex flex-wrap gap-1">
        {navItems.map((name) => (
          <Link
            key={name}
            to={`#${name.toLowerCase().replace(/ /g, '-')}`}
            className="rounded-r-full border border-border border-l-2 border-l-primary bg-muted/50 py-px pl-1.5 pr-2 text-xs text-primary transition-colors hover:bg-muted"
          >
            {name}
          </Link>
        ))}
      </div>
    </nav>
  );
};
