import type { CharacterInfo } from "~/types/CharacterInfo";

const charsT7: string[] = [
  "Akuma",
  "Alisa",
  "Anna",
  "Armor-King",
  "Asuka",
  "Bob",
  "Bryan",
  "Claudio",
  "Devil-Jin",
  "Dragunov",
  "Eddy",
  "Eliza",
  "Fahkumram",
  "Feng",
  "Ganryu",
  "Geese",
  "Gigas",
  "Heihachi",
  "Hwoarang",
  "Jack-7",
  "Jin",
  "Josie",
  "Julia",
  "Katarina",
  "Kazumi",
  "Kazuya",
  "King",
  "Kuma",
  "Kunimitsu",
  "Lars",
  "Law",
  "Lee",
  "Lei",
  "Leo",
  "Leroy",
  "Lidia",
  "Lili",
  "Lucky-Chloe",
  "Marduk",
  "Master-Raven",
  "Miguel",
  "Negan",
  "Nina",
  "Noctis",
  "Paul",
  "Shaheen",
  "Steve",
  "Xiaoyu",
  "Yoshimitsu",
  "Zafina",
];

const charsT8: string[] = [
  "Alisa",
  "Asuka",
  "Bryan",
  "Devil-Jin",
  "Feng",
  "Hwoarang",
  "Jin",
  "Kazuya",
  "Kuma",
  "Law",
  "Lee",
  "Leo",
  "Leroy",
  "Lili",
  "Nina",
  "Paul",
  "Steve",
  "Xiaoyu",
  "Yoshimitsu",
  "Zafina",
];

const characterInfoListT7: CharacterInfo[] = charsT7.map((char) => ({
  id: char.toLocaleLowerCase(),
  displayName: char.replaceAll("-", " "),
}));

export const getTekken7Characters = (): CharacterInfo[] => {
  return characterInfoListT7;
};

const characterInfoListT8: CharacterInfo[] = charsT8.map((char) => ({
  id: char.toLocaleLowerCase(),
  displayName: char.replaceAll("-", " "),
}));

export const getTekken8Characters = (): CharacterInfo[] => {
  return characterInfoListT8;
};
