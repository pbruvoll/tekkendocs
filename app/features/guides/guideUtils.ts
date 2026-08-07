import { type GuideData } from './GuideData';

export const formatCombo = (value: string) => value.replace(/>/g, '→');

export type GuideNavItem = {
  name: string;
  id: string;
};

const toId = (name: string) => name.toLowerCase().replace(/ /g, '-');

/** Sections available in the guide, in the order they appear on the page */
export const getGuideNavItems = (
  guideData: Partial<GuideData>,
): GuideNavItem[] => {
  const names = [
    !!guideData.aboutAuthor?.length && 'About the Author',
    !!guideData.introduction?.length && 'Introduction',
    !!guideData.strengths?.length && 'Strengths',
    !!guideData.weaknesses?.length && 'Weaknesses',
    !!guideData.heatSystem?.length && 'Heat System',
    !!guideData.installments?.length && 'Installments',
    !!guideData.keyMoves?.length && 'Top 10 Moves',
    !!(
      guideData.standingPunishers?.length ||
      guideData.crouchingPunishers?.length ||
      guideData.whiffPunishers?.length
    ) && 'Punishers',
    !!guideData.combos?.length && 'Combos',
    !!guideData.combosBeginner?.length && 'Beginner Combos',
    !!guideData.comboEnders?.length && 'Combo Enders',
    !!guideData.wallCombos?.length && 'Wall Combos',
    !!guideData.smallCombos?.length && 'Small Combos',
    !!guideData.keyMoves && guideData.keyMoves.length > 10 && 'Notable Moves',
    !!guideData.stances?.length && 'Stances',
    !!guideData.panicMoves?.length && 'Panic Moves',
    !!guideData.frameTraps?.length && 'Frame Traps',
    !!guideData.knowledgeChecks?.length && 'Knowledge Checks',
    !!guideData.defensiveTips?.length && 'Defensive Tips',
    !!guideData.defensiveMoves?.length && 'Defensive Move Handling',
    !!guideData.externalResources?.length && 'External Resources',
  ].filter(Boolean) as string[];

  return names.map((name) => ({ name, id: toId(name) }));
};
