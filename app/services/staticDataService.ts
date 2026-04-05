import { type CharacterInfo } from '~/types/CharacterInfo';
import { type Game } from '~/types/Game';

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
];

const charsT8: string[] = [
  'alisa',
  'anna',
  'armor-king',
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
  'miary-zo',
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
];

export const charsTag2 = [
  'Alex',
  'Alisa',
  'Ancient-Ogre',
  'Angel',
  'Anna',
  'Armor-King',
  'Asuka',
  'Baek',
  'Bob',
  'Bruce',
  'Bryan',
  'Devil-Jin',
  'Dragunov',
  'Dr-B',
  'Eddy',
  'Feng',
  'Forest-Law',
  'Ganryu',
  'Heihachi',
  'Hwoarang',
  'Jack6',
  'JayCee',
  'Jinpachi',
  'Jin',
  'Jun',
  'Kazuya',
  'King',
  'Kuma',
  'Kunimitsu',
  'Lars',
  'Lee',
  'Lei',
  'Leo',
  'Lili',
  'Marduk',
  'Marshall-Law',
  'Michelle',
  'Miguel',
  'Miharu',
  'Nina-Williams',
  'Ogre',
  'Paul',
  'P-Jack',
  'Raven',
  'RogerJr',
  'Sebastian',
  'Slim-Bob',
  'Steve',
  'Tiger',
  'Unknown',
  'Violet',
  'Wang',
  'Xiaoyu',
  'Yoshimitsu',
  'Zafina',
];

const characterInfoListT7: CharacterInfo[] = charsT7.map((char) => ({
  id: char.toLocaleLowerCase(),
  displayName: char.replaceAll('-', ' '),
}));

export type GuideMetaData = {
  author: string;
  version?: string;
};
export const characterGuideAuthors: Record<
  Game,
  Record<string, GuideMetaData>
> = {
  T8: {
    'armor-king': { author: 'ArmorKingTV21', version: 'S2' },
    alisa: { author: 'Nick RM', version: 'S3' },
    asuka: { author: 'Fergus', version: 'S2' },
    anna: { author: 'Joi', version: 'S2' },
    azucena: { author: 'Koenji', version: 'S2' },
    bryan: { author: 'Ty', version: 'S2' },
    claudio: { author: 'Tetsu', version: 'S2' },
    'devil-jin': { author: 'Vermilion', version: 'S2' },
    dragunov: { author: 'Fear of Silence', version: 'S2' },
    eddy: { author: 'Ace', version: 'S2' },
    fahkumram: { author: 'Leemishima', version: 'S2' },
    hwoarang: { author: 'Kicking Macine', version: 'S2' },
    heihachi: { author: 'Trunkiez', version: 'S2' },
    jin: { author: 'Bok Dibi', version: 'S2' },
    jun: { author: 'Pagani', version: 'S2' },
    kuma: { author: 'Nino', version: 'S2' },
    lars: { author: 'KayDash', version: 'S2' },
    law: { author: 'Landon D', version: 'S2' },
    lee: { author: 'Super Akouma', version: 'S2' },
    leroy: { author: 'SYRAXSLAYER', version: 'S2' },
    lidia: { author: 'Leemishima', version: 'S2' },
    lili: { author: 'DewGlider', version: 'S2' },
    nina: { author: 'Lalo', version: 'S3' },
    raven: { author: 'JacobKaas', version: 'S2' },
    steve: { author: 'Seagerr', version: 'S2' },
    victor: { author: 'Yung_P', version: 'S2' },
    yoshimitsu: { author: 'Trizzy the Rapper', version: 'S2' },
    xiaoyu: { author: 'Kanda', version: 'S3' },
  },
  T7: {},
  TT2: {},
};

export const siteUrl = 'https://tekkendocs.com';

export const cdnUrl = 'https://tekkendocs.b-cdn.net';

export const charVideoInfoT8: Record<
  string,
  { videoPostFix?: string; gifs?: true; autoGenerateFileName?: boolean }
> = {
  asuka: {
    videoPostFix: '-640',
  },
  jun: {
    videoPostFix: '',
  },
  reina: {
    videoPostFix: '',
    gifs: true,
  },
  'miary-zo': {
    autoGenerateFileName: true,
  },
};

export const newMovesT8s3: Set<string> = new Set([
  'Asuka-ub+1+2',
  'Alisa-ub+1',
  'Anna-1,2,uf+1+2',
  'Anna-2,uf+1+2',
  'Anna-d+1+2',
  'Anna-df+3,2,uf+1+2',
  'Armor King-db+3+4',
  'Azucena-SS.4',
  'Claudio-ub+2',
  'Clive-uf+2,2',
  'Clive-uf+2',
  'Devil Jin-ws1,4',
  'Dragunov-ub+1',
  'Eddy-RLX.4,3+4',
  'Fahkumram-uf+3+4',
  'Heihachi-ub+1+2',
  'Heihachi-ub+1+2*',
  'Hwoarang-LFS.1+2,4',
  'Hwoarang-LFS.1+2',
  'Jack-8-b+3+4',
  'Jin-df+2,H.1+2',
  'Jun-3,1',
  'Kazuya-1,1,2,DVK.D',
  'King-qcb+1+3',
  'Kuma-db+4,H.1',
  'Lars-uf+1',
  'Law-ub+1+2',
  'Lee-ws1:4',
  'Nina-d,DF+2',
  'Panda-db+4,H.1',
  'Paul-f+3,2',
  'Raven-SZN.3+4',
  'Reina-UNS.2',
  'Shaheen-3+4',
  'Steve-LWV.1+2',
  'Victor-ub+2',
  'Victor-ub+2*',
]);

export const getTekken7Characters = (): CharacterInfo[] => {
  return characterInfoListT7;
};

const characterInfoListT8: CharacterInfo[] = charsT8.map((char) => ({
  id: char.toLocaleLowerCase(),
  displayName: char.replaceAll('-', ' '),
}));

export const getTekken8Characters = (): CharacterInfo[] => {
  return characterInfoListT8;
};

export const githubLink = 'https://github.com/pbruvoll/tekkendocs';
export const rbNorwayLink = 'https://rbnorway.org';
export const twitterLink = 'https://x.com/tekkendocs';
export const facebooklink =
  'https://www.facebook.com/profile.php?id=61555959516665';
