import type { CharacterInfo } from '~/types/CharacterInfo'
import { type Game } from '~/types/Game'

const charsT7: string[] = [
  'Akuma',
  'Alisa',
  'Anna',
  'Armor-King',
  'Asuka',
  'Bob',
  'Bryan',
  'Claudio',
  'Devil-Jin',
  'Dragunov',
  'Eddy',
  'Eliza',
  'Fahkumram',
  'Feng',
  'Ganryu',
  'Geese',
  'Gigas',
  'Heihachi',
  'Hwoarang',
  'Jack-7',
  'Jin',
  'Josie',
  'Julia',
  'Katarina',
  'Kazumi',
  'Kazuya',
  'King',
  'Kuma',
  'Kunimitsu',
  'Lars',
  'Law',
  'Lee',
  'Lei',
  'Leo',
  'Leroy',
  'Lidia',
  'Lili',
  'Lucky-Chloe',
  'Marduk',
  'Master-Raven',
  'Miguel',
  'Negan',
  'Nina',
  'Noctis',
  'Paul',
  'Shaheen',
  'Steve',
  'Xiaoyu',
  'Yoshimitsu',
  'Zafina',
]

const charsT8: string[] = [
  'alisa',
  'anna',
  'asuka',
  'azucena',
  'bryan',
  'claudio',
  'clive',
  'devil-jin',
  'dragunov',
  'eddy',
  'fahkumram',
  'feng',
  'heihachi',
  'hwoarang',
  'jack-8',
  'jin',
  'jun',
  'kazuya',
  'king',
  'kuma',
  'lars',
  'law',
  'lee',
  'leo',
  'leroy',
  'lidia',
  'lili',
  'nina',
  'panda',
  'paul',
  'raven',
  'reina',
  'shaheen',
  'steve',
  'victor',
  'xiaoyu',
  'yoshimitsu',
  'zafina',
  'mokujin',
]

const characterInfoListT7: CharacterInfo[] = charsT7.map(char => ({
  id: char.toLocaleLowerCase(),
  displayName: char.replaceAll('-', ' '),
}))

export type GuideMetaData = {
  author: string
  version?: string
}
export const characterGuideAuthors: Record<
  Game,
  Record<string, GuideMetaData>
> = {
  T8: {
    asuka: { author: 'Fergus', version: 'S2' },
    azucena: { author: 'Koenji' },
    bryan: { author: 'Ty' },
    claudio: { author: 'Tetsu', version: 'S2' },
    'devil-jin': { author: 'Vermilion', version: 'S2' },
    dragunov: { author: 'Fear of Silence', version: 'S2' },
    eddy: { author: 'Ace', version: 'S2' },
    hwoarang: { author: 'Kicking Macine', version: 'S2' },
    jin: { author: 'Bok Dibi', version: 'S2' },
    jun: { author: 'Pagani', version: 'S2' },
    lee: { author: 'Super Akouma', version: 'S2' },
    lidia: { author: 'Leemishima', version: 'S2' },
    lili: { author: 'DewGlider', version: 'S2' },
    raven: { author: 'JacobKaas', version: 'S2' },
    yoshimitsu: { author: 'Trizzy the Rapper', version: 'S2' },
    xiaoyu: { author: 'Kanda', version: 'S2' },
  },
  T7: {},
  TT2: {},
}

export const getTekken7Characters = (): CharacterInfo[] => {
  return characterInfoListT7
}

const characterInfoListT8: CharacterInfo[] = charsT8.map(char => ({
  id: char.toLocaleLowerCase(),
  displayName: char.replaceAll('-', ' '),
}))

export const getTekken8Characters = (): CharacterInfo[] => {
  return characterInfoListT8
}

export const githubLink = 'https://github.com/pbruvoll/tekkendocs'
export const rbNorwayLink = 'https://rbnorway.org'
export const twitterLink = 'https://x.com/tekkendocs'
export const facebooklink =
  'https://www.facebook.com/profile.php?id=61555959516665'
