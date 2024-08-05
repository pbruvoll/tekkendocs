import { useEffect, useMemo, useState } from 'react'
import { VideoIcon } from '@radix-ui/react-icons'
import { type MetaFunction } from '@remix-run/node'
import { Link, useFetcher, useNavigate } from '@remix-run/react'
import { getTekken8Characters } from '~/services/staticDataService'
import { type CharacterFrameDataPage } from '~/types/CharacterFrameDataPage'
import { type Move } from '~/types/Move'
import { commandToUrlSegment } from '~/utils/moveUtils'
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

/** A function which removes "+", but only if it is not between two digits, e.g d+2 => d2 and 1+2 => 1+2 */

const cleanCommand = (move: string): string => {
  return move
    .replace(/,|\//g, '')
    .replace(/([A-Za-z])\+/g, '$1')
    .toLowerCase()
}

export default function () {
  const [searchQuery, setSearchQuery] = useState('')
  const [characterQuery, moveQuery] = useMemo(() => {
    if (!searchQuery) {
      return ['', '']
    }
    const splitted = searchQuery.split(' ')
    if (splitted.length === 1) {
      return [searchQuery.toLowerCase(), '']
    }
    if (splitted.length === 2) {
      return [splitted[0].toLowerCase(), splitted[1].toLowerCase()]
    }
    return [splitted[0].toLowerCase(), splitted.slice(1).join('').toLowerCase()]
  }, [searchQuery])

  const navigate = useNavigate()

  const includeCharNameInFrames = useMemo(() => !moveQuery, [moveQuery])

  const charList = getTekken8Characters()

  const filteredCharList = charList.filter(char =>
    char.id
      .replace('-', '')
      .replace(' ', '')
      .toLowerCase()
      .startsWith(characterQuery.replace('-', '')),
  )

  const selectedCharacter =
    filteredCharList.length === 1 ? filteredCharList[0] : undefined
  const selectedCharId = useMemo(() => {
    return selectedCharacter?.id
  }, [selectedCharacter?.id])

  const { load, state, data } = useFetcher<CharacterFrameDataPage>({
    key: selectedCharId,
  })

  const filteredMoves = useMemo(() => {
    if (
      filteredCharList.length === 1 &&
      data &&
      data.characterName === selectedCharId
    ) {
      const cleanMoveQuery = cleanCommand(moveQuery)
      return data.moves.filter(move =>
        cleanCommand(move.command).startsWith(cleanMoveQuery),
      )
    }
    return []
  }, [data, filteredCharList, moveQuery, selectedCharId])

  useEffect(() => {
    if (
      selectedCharId &&
      state === 'idle' &&
      data?.characterName !== selectedCharId
    ) {
      load('/t8/' + selectedCharId)
    }
  }, [selectedCharId, state, load, data?.characterName])

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value
    setSearchQuery(searchValue)
  }

  const handleOnKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      if (characterQuery && !moveQuery) {
        navigate(`/t8/${filteredCharList[0].id}`)
        return
      }
      if (moveQuery && filteredMoves.length > 0) {
        navigate(
          `/t8/${selectedCharId}/${commandToUrlSegment(filteredMoves[0].command)}`,
        )
      }
    }
  }

  return (
    <>
      <h1 className="text-2xl">Search</h1>
      <div>Move query {moveQuery}</div>
      <input
        onChange={e => handleOnChange(e)}
        onKeyDown={handleOnKeyDown}
      ></input>
      {filteredCharList.length === 0 && (
        <div>No characters matches the search query</div>
      )}
      {filteredCharList.length > 1 &&
        filteredCharList.map(char => (
          <li key={char.id}>
            <Link
              className="text-text-primary no-underline"
              to={`/t8/${char.id}`}
            >
              {char.id}
            </Link>
          </li>
        ))}

      {selectedCharId && state === 'idle' && filteredMoves.length === 0 && (
        <div>
          No moves for {selectedCharacter?.displayName} matches the query
        </div>
      )}

      {selectedCharId && state !== 'idle' && <div>Loading...</div>}

      {filteredMoves.length > 0 &&
        selectedCharId &&
        filteredMoves.map(move => {
          return (
            <li key={move.moveNumber}>
              <MoveItem
                charId={selectedCharId}
                move={move}
                showCharId={includeCharNameInFrames}
              />
            </li>
          )
        })}
      <h2>Characters</h2>
    </>
  )
}

const MoveItem = ({
  move,
  charId,
  showCharId,
}: {
  move: Move
  charId: string
  showCharId: boolean
}) => {
  const prefix = showCharId ? charId + ' ' : ''

  return (
    <Link
      className="inline-flex gap-2"
      to={`/t8/${charId}/${commandToUrlSegment(move.command)}`}
    >
      <div className="inline-flex items-center gap-2 text-text-primary no-underline">
        {prefix}
        {move.command} {(move.video || move.ytVideo) && <VideoIcon />}
      </div>
      <div> | </div>
      {[
        move.hitLevel,
        move.startup,
        move.block,
        move.hit,
        move.counterHit || move.hit,
      ].join(' | ')}
    </Link>
  )
}
