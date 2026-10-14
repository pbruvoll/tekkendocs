import { cdnUrl } from '~/services/staticDataService';
import { type CharacterInfo } from '~/types/CharacterInfo';

/** The frame data and avatars are made by scripts/convertT6FrameData.py and uploaded to the cdn */
export const t6CdnUrl = `${cdnUrl}/t6`;

export const t6Characters: CharacterInfo[] = [
  { id: 'alisa', displayName: 'Alisa' },
  { id: 'anna', displayName: 'Anna' },
  { id: 'armor-king', displayName: 'Armor King' },
  { id: 'asuka', displayName: 'Asuka' },
  { id: 'baek', displayName: 'Baek' },
  { id: 'bob', displayName: 'Bob' },
  { id: 'bruce', displayName: 'Bruce' },
  { id: 'bryan', displayName: 'Bryan' },
  { id: 'christie', displayName: 'Christie' },
  { id: 'devil-jin', displayName: 'Devil Jin' },
  { id: 'dragunov', displayName: 'Dragunov' },
  { id: 'eddy', displayName: 'Eddy' },
  { id: 'feng', displayName: 'Feng' },
  { id: 'ganryu', displayName: 'Ganryu' },
  { id: 'heihachi', displayName: 'Heihachi' },
  { id: 'hwoarang', displayName: 'Hwoarang' },
  { id: 'jack-6', displayName: 'Jack-6' },
  { id: 'jin', displayName: 'Jin' },
  { id: 'julia', displayName: 'Julia' },
  { id: 'kazuya', displayName: 'Kazuya' },
  { id: 'king', displayName: 'King' },
  { id: 'kuma', displayName: 'Kuma' },
  { id: 'lars', displayName: 'Lars' },
  { id: 'law', displayName: 'Law' },
  { id: 'lee', displayName: 'Lee' },
  { id: 'lei', displayName: 'Lei' },
  { id: 'leo', displayName: 'Leo' },
  { id: 'lili', displayName: 'Lili' },
  { id: 'marduk', displayName: 'Marduk' },
  { id: 'miguel', displayName: 'Miguel' },
  { id: 'nina', displayName: 'Nina' },
  { id: 'paul', displayName: 'Paul' },
  { id: 'raven', displayName: 'Raven' },
  { id: 'roger-jr', displayName: 'Roger Jr.' },
  { id: 'steve', displayName: 'Steve' },
  { id: 'wang', displayName: 'Wang' },
  { id: 'xiaoyu', displayName: 'Xiaoyu' },
  { id: 'yoshimitsu', displayName: 'Yoshimitsu' },
  { id: 'zafina', displayName: 'Zafina' },
];

export const getT6Character = (id: string): CharacterInfo | undefined =>
  t6Characters.find((character) => character.id === id);

export const t6AvatarUrl = (characterId: string) =>
  `${t6CdnUrl}/avatars/${characterId}.webp`;
