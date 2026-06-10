import assaliant from '~/images/t8/ranks/assaliant.png';
import battleRuler from '~/images/t8/ranks/battle-ruler.png';
import beginner from '~/images/t8/ranks/beginner.png';
import brawler from '~/images/t8/ranks/brawler.png';
import bushin from '~/images/t8/ranks/bushin.png';
import cavalry from '~/images/t8/ranks/cavalry.png';
import combatant from '~/images/t8/ranks/combatant.png';
import destroyer from '~/images/t8/ranks/destroyer.png';
import dominator from '~/images/t8/ranks/dominator.png';
import eliminator from '~/images/t8/ranks/eliminator.png';
import fighter from '~/images/t8/ranks/fighter.png';
import firstDan from '~/images/t8/ranks/first-dan.png';
import flameRuler from '~/images/t8/ranks/flame-ruler.png';
import fujin from '~/images/t8/ranks/fujin.png';
import ganryu from '~/images/t8/ranks/ganryu.png';
import godOfDestruction from '~/images/t8/ranks/god-of-destruction.png';
import godOfDestruction1 from '~/images/t8/ranks/god-of-destruction-1.png';
import godOfDestruction2 from '~/images/t8/ranks/god-of-destruction-2.png';
import godOfDestruction3 from '~/images/t8/ranks/god-of-destruction-3.png';
import godOfDestruction4 from '~/images/t8/ranks/god-of-destruction-4.png';
import godOfDestruction5 from '~/images/t8/ranks/god-of-destruction-5.png';
import godOfDestruction6 from '~/images/t8/ranks/god-of-destruction-6.png';
import godOfDestruction7 from '~/images/t8/ranks/god-of-destruction-7.png';
import godOfDestructionInf from '~/images/t8/ranks/god-of-destruction-inf.png';
import kisin from '~/images/t8/ranks/kishin.png';
import mightyRuler from '~/images/t8/ranks/mighty-ruler.png';
import raijin from '~/images/t8/ranks/raijin.png';
import ranger from '~/images/t8/ranks/ranger.png';
import secondDan from '~/images/t8/ranks/second-dan.png';
import shinryu from '~/images/t8/ranks/shinryu.png';
import strategist from '~/images/t8/ranks/strategist.png';
import tekkenEmperor from '~/images/t8/ranks/tekken-emperor.png';
import tekkenGod from '~/images/t8/ranks/tekken-god.png';
import tekkenGodSupreme from '~/images/t8/ranks/tekken-god-supreme.png';
import tekkenKing from '~/images/t8/ranks/tekken-king.png';
import tenryu from '~/images/t8/ranks/tenryu.png';
import vanquisher from '~/images/t8/ranks/vanquisher.png';
import warrior from '~/images/t8/ranks/warrior.png';

export type T8Rank = {
  group: string;
  name: string;
  image: string;
  points: number | undefined;
};

export const t8Ranks = [
  { group: 'Silver', name: 'Beginner', points: 0, image: beginner },
  { group: 'Silver', name: '1st Dan', points: 4000, image: firstDan },
  { group: 'Silver', name: '2nd Dan', points: 8000, image: secondDan },
  { group: 'Light blue', name: 'Fighter', points: 12000, image: fighter },
  {
    group: 'Light blue',
    name: 'Strategist',
    points: 17000,
    image: strategist,
  },
  {
    group: 'Light blue',
    name: 'Combatant',
    points: 22000,
    image: combatant,
  },
  { group: 'Green', name: 'Brawler', points: 27000, image: brawler },
  { group: 'Green', name: 'Ranger', points: 33000, image: ranger },
  { group: 'Green', name: 'Cavalry', points: 39000, image: cavalry },
  { group: 'Yellow', name: 'Warrior', points: 45000, image: warrior },
  { group: 'Yellow', name: 'Assailant', points: 51000, image: assaliant },
  { group: 'Yellow', name: 'Dominator', points: 57000, image: dominator },
  { group: 'Orange', name: 'Vanquisher', points: 63000, image: vanquisher },
  { group: 'Orange', name: 'Destroyer', points: 70000, image: destroyer },
  { group: 'Orange', name: 'Eliminator', points: 77000, image: eliminator },
  { group: 'Red', name: 'Garyu', points: 84000, image: ganryu },
  { group: 'Red', name: 'Shinryu', points: 94000, image: shinryu },
  { group: 'Red', name: 'Tenryu', points: 104000, image: tenryu },
  {
    group: 'Purple',
    name: 'Mighty Ruler',
    points: 114000,
    image: mightyRuler,
  },
  {
    group: 'Purple',
    name: 'Flame Ruler',
    points: 125000,
    image: flameRuler,
  },
  {
    group: 'Purple',
    name: 'Battle Ruler',
    points: 136000,
    image: battleRuler,
  },
  { group: 'Blue', name: 'Fujin', points: 147000, image: fujin },
  { group: 'Blue', name: 'Raijin', points: 159000, image: raijin },
  { group: 'Blue', name: 'Kishin', points: 171000, image: kisin },
  { group: 'Blue', name: 'Bushin', points: 183000, image: bushin },
  {
    group: 'Gold (Purple)',
    name: 'Tekken King',
    points: 195000,
    image: tekkenKing,
  },
  {
    group: 'Gold (Purple)',
    name: 'Tekken Emperor',
    points: 208000,
    image: tekkenEmperor,
  },
  { group: 'Gold', name: 'Tekken God', points: 222000, image: tekkenGod },
  {
    group: 'Gold',
    name: 'Tekken God Supreme',
    points: 237000,
    image: tekkenGodSupreme,
  },
  {
    group: 'God of Destruction',
    name: 'God of Destruction',
    points: 253000,
    image: godOfDestruction,
  },
  {
    group: 'God of Destruction',
    name: 'God of Destruction I',
    points: 275000,
    image: godOfDestruction1,
  },
  {
    group: 'God of Destruction',
    name: 'God of Destruction II',
    points: 295000,
    image: godOfDestruction2,
  },
  {
    group: 'God of Destruction',
    name: 'God of Destruction III',
    points: 315000,
    image: godOfDestruction3,
  },
  {
    group: 'God of Destruction',
    name: 'God of Destruction IV',
    points: 335000,
    image: godOfDestruction4,
  },
  {
    group: 'God of Destruction',
    name: 'God of Destruction V',
    points: 355000,
    image: godOfDestruction5,
  },
  {
    group: 'God of Destruction',
    name: 'God of Destruction VI',
    points: 375000,
    image: godOfDestruction6,
  },
  {
    group: 'God of Destruction',
    name: 'God of Destruction VII',
    points: 400000,
    image: godOfDestruction7,
  },
  {
    group: 'God of Destruction',
    name: 'God of Destruction ∞',
    points: 430000,
    image: godOfDestructionInf,
  },
] as const satisfies T8Rank[];
