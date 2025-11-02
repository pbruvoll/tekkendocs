import { characterInfoT8List } from "~/constants/characterInfoListT8"

export const loader = () => {
  const data = characterInfoT8List.map(({ id, displayName, wavuName, aliasList }) => ({
    id,
    displayName,
    wavuName,
    aliasList,
    images: {
      largePng: `https://tekkendocs.com/t8/avatars/${id}-brand-512.png`,
      officialLargePng: `https://tekkendocs.com/t8/avatars/${id}-512.png`,
    }
  }))
  return {characters: data}
}