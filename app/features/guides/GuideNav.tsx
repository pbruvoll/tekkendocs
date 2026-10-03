import { Link } from 'react-router';
import {
  type GuideSectionKey,
  getGuideSectionId,
} from '~/features/guideLanguage/texts/guideTexts';
import { useGuideContext } from './GuideContext';
import { type GuideData } from './GuideData';

type GuideNavProps = {
  guideData: Partial<GuideData>;
};

export const GuideNav = ({ guideData }: GuideNavProps) => {
  const { texts } = useGuideContext();
  const navItems = [
    !!guideData.introduction && 'introduction',
    !!guideData.strengths && 'strengths',
    !!guideData.weaknesses && 'weaknesses',
    !!guideData.heatSystem && 'heatSystem',
    !!guideData.gamePlan?.length && 'gamePlan',
    !!guideData.installments && 'installments',
    !!guideData.keyMoves && 'topMoves',
    !!guideData.standingPunishers && 'punishers',
    !!guideData.combos && 'combos',
    !!guideData.keyMoves && guideData.keyMoves.length > 10 && 'notableMoves',
    !!guideData.stances && 'stances',
    !!guideData.panicMoves && 'panicMoves',
    !!guideData.frameTraps && 'frameTraps',
    !!guideData.knowledgeChecks && 'knowledgeChecks',
    !!(guideData.defensiveTips || guideData.defensiveMoves) && 'defensiveTips',
    !!(guideData.goodMatchups?.length || guideData.badMatchups?.length) &&
      'matchups',
    !!guideData.externalResources && 'externalResources',
  ].filter(Boolean) as GuideSectionKey[];

  if (!navItems.length) return null;

  return (
    <nav className="mt-4">
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {texts.inThisGuide}
      </p>
      <div className="flex flex-wrap gap-1">
        {navItems.map((section) => (
          <Link
            key={section}
            to={`#${getGuideSectionId(section)}`}
            className="rounded-e-full border border-border border-s-2 border-s-primary bg-muted/50 py-px ps-1.5 pe-2 text-sm text-primary transition-colors hover:bg-muted"
          >
            {texts.sections[section]}
          </Link>
        ))}
      </div>
    </nav>
  );
};
