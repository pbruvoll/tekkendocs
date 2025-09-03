import { useEffect, useMemo, useState } from 'react'
import { VideoIcon } from '@radix-ui/react-icons'
import { type MetaFunction } from '@remix-run/node'
import { Link, useFetcher, useNavigate } from '@remix-run/react'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ContentContainer } from '~/components/ContentContainer'
import { getTekken8Characters } from '~/services/staticDataService'
import { type CharacterFrameDataPage } from '~/types/CharacterFrameDataPage'
import { type Move, type MoveT8 } from '~/types/Move'
import { cleanCommand } from '~/utils/filterUtils'
import { charIdFromMove, commandToUrlSegmentEncoded } from '~/utils/moveUtils'
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

const maxMovesToShow = 400

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

  const charList = getTekken8Characters()

  const filteredCharList =
    characterQuery === '?'
      ? charList.filter(char => char.id === 'mokujin')
      : charList.filter(char =>
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

  const showsMultipleChars = selectedCharId === 'mokujin'

  const includeCharNameInFrames = useMemo(
    () => showsMultipleChars || (!moveQuery && !searchQuery.endsWith(' ')),
    [moveQuery, searchQuery, showsMultipleChars],
  )

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

      let filteredByCommand: Move[] = []
      if (cleanMoveQuery.includes('?')) {
        // filter by wildcard, so "1?2", matches "1,2,3".
        // we use ? as wildcard instead of *, since som move have * in them (it means hold button)
        let w = cleanMoveQuery.replace(/[*.+^${}()|[\]\\]/g, '\\$&') // regexp escape
        const re = new RegExp(
          `^${w.replace(/\?/g, '.*')}${searchQuery.endsWith(' ') ? '' : '.*'}$`,
        )
        filteredByCommand = data.moves.filter(move => re.test(move.command))
      } else if (!!cleanMoveQuery && searchQuery.endsWith(' ')) {
        filteredByCommand = data.moves.filter(
          move => cleanCommand(move.command) === cleanMoveQuery,
        )
      } else {
        filteredByCommand = data.moves.filter(move =>
          cleanCommand(move.command).startsWith(cleanMoveQuery),
        )
      }
      if (filteredByCommand.length > 0) {
        return filteredByCommand
      }
      if (moveQuery.length > 2) {
        const filteredByName = data.moves.filter(move =>
          move.name
            ?.toLowerCase()
            .replace(' ', '')
            .includes(moveQuery.toLowerCase()),
        )
        if (filteredByName.length > 0) {
          return filteredByName
        }
      }
      return []
    }
    return []
  }, [data, filteredCharList.length, moveQuery, searchQuery, selectedCharId])

  const paginatedMoves = useMemo(() => {
    if (filteredMoves.length > maxMovesToShow) {
      return filteredMoves.slice(0, maxMovesToShow)
    }
    return filteredMoves
  }, [filteredMoves])

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
      if (moveQuery && paginatedMoves.length > 0) {
        navigate(
          `/t8/${selectedCharId}/${commandToUrlSegmentEncoded(paginatedMoves[0].command)}`,
        )
      }
    }
  }

  return (
    <ContentContainer enableBottomPadding enableTopPadding className="min-h-96">
      <h1 className="pb-2 text-2xl">Search</h1>
      <p className="py-2">Enter a character, followed by a command</p>
      <Input
        onChange={e => handleOnChange(e)}
        onKeyDown={handleOnKeyDown}
        placeholder="drag fff2"
        className="mb-4"
        autoFocus
      ></Input>
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

      {paginatedMoves.length > 0 && selectedCharId && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Move</TableHead>
              <TableHead>Hit Level</TableHead>
              <TableHead>Startup</TableHead>
              <TableHead>Block</TableHead>
              <TableHead>Hit</TableHead>
              <TableHead>Counter Hit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedMoves.map(move => (
              <TableRow key={move.moveNumber}>
                <TableCell>
                  <Link
                    className="inline-flex items-center gap-2 text-primary hover:underline"
                    to={`/t8/${
                      showsMultipleChars
                        ? charIdFromMove(move as MoveT8)
                        : selectedCharId
                    }/${commandToUrlSegmentEncoded(move.command)}`}
                  >
                    {includeCharNameInFrames && (
                      <span className="text-muted-foreground">
                        {showsMultipleChars
                          ? charIdFromMove(move as MoveT8)
                          : selectedCharId}{' '}
                      </span>
                    )}
                    {move.command}
                    {(move.video || move.ytVideo) && <VideoIcon />}
                  </Link>
                </TableCell>
                <TableCell>{move.hitLevel}</TableCell>
                <TableCell>{move.startup}</TableCell>
                <TableCell>{move.block}</TableCell>
                <TableCell>{move.hit}</TableCell>
                <TableCell>{move.counterHit || move.hit}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {paginatedMoves.length < filteredMoves.length && (
        <p className="my-2">
          Showing {paginatedMoves.length} of {filteredMoves.length}
        </p>
      )}
    </ContentContainer>
  )
}
