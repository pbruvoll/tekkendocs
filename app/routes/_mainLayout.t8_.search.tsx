import { useState } from 'react'
import { type MetaFunction } from '@remix-run/node'
import { getTekken8Characters } from '~/services/staticDataService'
import { generateMetaTags } from '~/utils/seoUtils'

export const meta: MetaFunction = ({ matches }) => {
  const title = 'Tekken 8 Frame data search page | TekkenDocs'
  const description = `Search for any move in the game to see its's frame data. Exampel: "Drag fff2"`

  return generateMetaTags({
    matches,
    title,
    description,
    image: { url: '/images/tekkendocs-og-image-v2.png' },
    url: `/t8/challenge`,
  })
}

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
