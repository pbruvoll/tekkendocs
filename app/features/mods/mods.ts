import irony from '~/images/t8/mods/irony.webp';
import opendojo from '~/images/t8/mods/opendojo.webp';
import potatoStages from '~/images/t8/mods/potato-stages.webp';

export type ModLink = { label: string; url: string };

export type Mod = {
  name: string;
  description: string;
  imageUrl: string;
  links: ModLink[];
};

export const mods: Mod[] = [
  {
    name: 'OpenDojo',
    description:
      'Save, share and reload practice mode recordings as portable drill files. Adds an in game overlay menu for exporting your own recordings, importing drills from other players and auto saving recordings per character.',
    imageUrl: opendojo,
    links: [
      { label: 'GitHub', url: 'https://github.com/sirmammingtonham/opendojo' },
      {
        label: 'Download',
        url: 'https://tekkenmods.com/mod/7135/opendojo-tekken-8-practice-mode-recording-import-export-mod',
      },
    ],
  },
  {
    name: 'Irony',
    description:
      'A forensic analysis tool for the PC versions of Tekken 8 and Tekken 7. Record gameplay from different modes and step through it frame by frame to measure move properties, hitboxes and collision.',
    imageUrl: irony,
    links: [
      {
        label: 'Download',
        url: 'https://github.com/tomislav-ivankovic/Irony/releases',
      },
    ],
  },
  {
    name: 'Great, Another Potato Mod',
    description:
      'Strips the stages down to just the floor and the walls, DLC stages included. Useful for better performance and fewer distractions. It ships as one pack, so it applies to every supported stage at once rather than letting you pick and choose.',
    imageUrl: potatoStages,
    links: [
      {
        label: 'Download',
        url: 'https://tekkenmods.com/mod/4452/great-another-potato-mod',
      },
    ],
  },
];
