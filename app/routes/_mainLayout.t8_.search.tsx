import { useState } from 'react'
import { getTekken8Characters } from '~/services/staticDataService'

// export const meta: MetaFunction = ({ matches }) => {
//   const title = 'Tekken 8 Challenges | TekkenDocs'
//   const description = `A set of challenges to test your skills at Tekken 8. See how many low moves you can block on reaction`

//   return generateMetaTags({
//     matches,
//     title,
//     description,
//     image: { url: `/t8/pages/challenge.png` },
//     url: `/t8/challenge`,
//   })
// }

export default function () {
  const [searchQuery, setSearchQuery] = useState('')

  const charList = getTekken8Characters()

  const filteredCharList = charList.filter(char =>
    char.id
      .replace('-', '')
      .replace(' ', '')
      .toLowerCase()
      .startsWith(searchQuery.replace('-', '').replace(' ', '').toLowerCase()),
  )

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value
    console.log(searchValue)
    setSearchQuery(searchValue)
  }
  return (
    <>
      <h1 className="text-2xl">Search</h1>
      <input onChange={e => handleOnChange(e)}></input>
      {filteredCharList.map(char => (
        <li key={char.id}>{char.id}</li>
      ))}
      <h2>Characters</h2>
      <ul></ul>
    </>
  )
}
