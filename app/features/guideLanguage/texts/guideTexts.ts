import { type GuideLanguage } from '../guideLanguage';
import { en } from './en';
import { es } from './es';
import { ja } from './ja';
import { ko } from './ko';
import { ru } from './ru';
import { ur } from './ur';

export type GuideSectionKey =
  | 'aboutTheAuthor'
  | 'introduction'
  | 'strengths'
  | 'weaknesses'
  | 'heatSystem'
  | 'gamePlan'
  | 'installments'
  | 'topMoves'
  | 'punishers'
  | 'combos'
  | 'beginnerCombos'
  | 'comboEnders'
  | 'wallCombos'
  | 'smallCombos'
  | 'notableMoves'
  | 'stances'
  | 'panicMoves'
  | 'frameTraps'
  | 'knowledgeChecks'
  | 'defensiveTips'
  | 'defensiveMoveHandling'
  | 'matchups'
  | 'externalResources';

type GuideTitleParams = {
  /** Display name, e.g. "Dragunov" */
  character: string;
  season: number;
  author?: string;
};

/** The static (non csv) texts of a guide page. Commands are never translated */
export type GuideTexts = {
  metaTitle: (params: GuideTitleParams) => string;
  metaDescription: (params: { character: string }) => string;
  /** Visually hidden h1 of the page */
  pageHeading: (params: Omit<GuideTitleParams, 'author'>) => string;
  /** Shown above translated guides, undefined for the original language */
  translationNotice: string | undefined;
  sections: Record<GuideSectionKey, string>;
  inThisGuide: string;
  writtenBy: string;
  contributors: string;
  lastUpdated: string;
  gameVersion: string;
  showVideo: string;
  hideVideo: string;
  /** Accessible labels of the read-aloud button */
  audio: { play: string; stop: string; notSupported: string };
  standingPunishers: string;
  crouchingPunishers: string;
  whiffPunishers: string;
  carryEnders: string;
  floorBreakEnders: string;
  wallBreakEnders: string;
  normalWallCombos: string;
  tornadoWallCombos: string;
  goodMatchups: string;
  badMatchups: string;
  /** Link text for the character's replays on replaydatabase.com */
  replayDatabaseLink: (params: { character: string }) => string;
};

export const guideTexts: Record<GuideLanguage, GuideTexts> = {
  en,
  ko,
  ja,
  es,
  ur,
  ru,
};

/** Anchor id of a section. Built from the english title in every language, so links keep working */
export const getGuideSectionId = (section: GuideSectionKey) =>
  en.sections[section].toLowerCase().replace(/ /g, '-');
