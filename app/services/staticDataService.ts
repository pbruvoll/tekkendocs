import type { CharacterInfo } from '~/types/CharacterInfo'

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
  'asuka',
  'azucena',
  'bryan',
  'claudio',
  'devil-jin',
  'dragunov',
  'eddy',
  'feng',
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
]

const characterInfoListT7: CharacterInfo[] = charsT7.map(char => ({
  id: char.toLocaleLowerCase(),
  displayName: char.replaceAll('-', ' '),
}))

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

export const discordInviteLink = 'https://discord.gg/54uHRvzN'
export const githubLink = 'https://github.com/pbruvoll/tekkendocs'
export const twitterLink = 'https://x.com/tekkendocs'
export const facebooklink =
  'https://www.facebook.com/profile.php?id=61555959516665'
