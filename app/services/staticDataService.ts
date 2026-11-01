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
  'bob',
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
  'kunimitsu',
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
  /** Not used for the main guide. Used in the url, /t8/<character>/guide/<authorSlug>,
   * and in the sheet name, <character>-<authorSlug>-guide */
  authorSlug?: string;
  /** Translated to every guide language. Set it once the translations are on the cdn */
  translated?: boolean;
};
/** The guides for each character. The first one is the main guide at /t8/<character>/guide */
export const characterGuideAuthors: Record<
  Game,
  Record<string, GuideMetaData[]>
> = {
  T8: {
    'armor-king': [
      { author: 'ArmorKingTV21', version: 'S2', translated: true },
    ],
    alisa: [{ author: 'Nick RM', version: 'S3', translated: true }],
    asuka: [{ author: 'Fergus', version: 'S3', translated: true }],
    anna: [{ author: 'Joi', version: 'S3', translated: true }],
    azucena: [{ author: 'Koenji', version: 'S3', translated: true }],
    bryan: [{ author: 'Ty', version: 'S2', translated: true }],
    claudio: [{ author: 'Tetsu', version: 'S2', translated: true }],
    clive: [{ author: 'Kwstakis', version: 'S3', translated: true }],
    'devil-jin': [{ author: 'Vermilion', version: 'S2', translated: true }],
    dragunov: [{ author: 'Fear of Silence', version: 'S2', translated: true }],
    eddy: [{ author: 'Ace', version: 'S3', translated: true }],
    fahkumram: [{ author: 'Leemishima', version: 'S3', translated: true }],
    feng: [{ author: 'Weak Akuma', version: 'S3', translated: true }],
    hwoarang: [{ author: 'Kicking Macine', version: 'S3', translated: true }],
    heihachi: [{ author: 'Trunkiez', version: 'S2', translated: true }],
    'jack-8': [{ author: 'Fisherboat', version: 'S3', translated: true }],
    jin: [{ author: 'Bok Dibi', version: 'S2', translated: true }],
    jun: [{ author: 'Pagani', version: 'S2', translated: true }],
    kazuya: [{ author: 'Ishan', version: 'S3', translated: true }],
    kuma: [{ author: 'Nino', version: 'S2', translated: true }],
    kunimitsu: [{ author: 'Koenji', version: 'S3', translated: true }],
    lars: [{ author: 'KayDash', version: 'S2', translated: true }],
    law: [{ author: 'Landon D', version: 'S2', translated: true }],
    lee: [{ author: 'Super Akouma', version: 'S2', translated: true }],
    leo: [
      { author: 'AyoRichie & StrikeMist', version: 'S3', translated: true },
    ],
    leroy: [{ author: 'SYRAXSLAYER', version: 'S2', translated: true }],
    lidia: [{ author: 'Leemishima', version: 'S3', translated: true }],
    lili: [{ author: 'DewGlider', version: 'S3', translated: true }],
    'miary-zo': [{ author: 'Koenji', version: 'S3', translated: true }],
    nina: [{ author: 'Lalo', version: 'S3', translated: true }],
    paul: [{ author: 'Romanjelly', version: 'S3', translated: true }],
    raven: [{ author: 'JacobKaas', version: 'S3', translated: true }],
    reina: [{ author: 'Heavenly', version: 'S3', translated: true }],
    shaheen: [{ author: 'Alihandal', version: 'S3', translated: true }],
    steve: [{ author: 'Seagerr', version: 'S2', translated: true }],
    victor: [{ author: 'Yung_P', version: 'S3', translated: true }],
    yoshimitsu: [
      { author: 'Trizzy the Rapper', version: 'S3', translated: true },
    ],
    xiaoyu: [{ author: 'Kanda', version: 'S3', translated: true }],
  },
  T7: {},
  TT2: {},
};

/** The start of a guide's file names, like lee or lee-stack. The sheet is <id>-guide,
 * the images <id>-1200.webp and <id>-600.webp */
export const getGuideFileId = (characterId: string, authorSlug?: string) =>
  authorSlug ? `${characterId}-${authorSlug}` : characterId;

export const getGuideUrl = (characterId: string, authorSlug?: string) =>
  authorSlug
    ? `/t8/${characterId}/guide/${authorSlug}`
    : `/t8/${characterId}/guide`;

export const siteUrl = 'https://tekkendocs.com';

export const cdnUrl = 'https://tekkendocs.b-cdn.net';

export const charVideoInfoT8: Record<
  string,
  {
    videoPostFix?: string;
    gifs?: true;
    autoGenerateFileName?: boolean;
    // use localVidoeFolder to load viodes based on a locally served folder (in /public).
    // Primarly for testing that recorded vidoes are correct and have correct name. Should not be used in production
    localVideoFolder?: string;
  }
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
