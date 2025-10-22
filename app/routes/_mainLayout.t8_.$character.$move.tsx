import { Heading, Table, Text } from '@radix-ui/themes';
import { Link, type MetaFunction, useMatches, useParams } from 'react-router';
import { ContentContainer } from '~/components/ContentContainer';
import { MoveVideo } from '~/components/MoveVideo';
import { type Move } from '~/types/Move';
import {
  getCharacterFrameData,
  getCharacterFrameDataMoves,
} from '~/utils/characterPageUtils';
import { getCacheControlHeaders } from '~/utils/headerUtils';
import { commandToUrlSegment } from '~/utils/moveUtils';

export const headers = () => getCacheControlHeaders({ seconds: 60 * 5 });

export const meta: MetaFunction = ({ params, matches }) => {
  const character = params.character;
  const command = params.move;
  const frameData = getCharacterFrameData(matches);

  if (!frameData || !command || !character || !frameData.headers) {
    return [
      {
        title: 'TekkenDocs - Uknown character',
      },
      {
        description: `There is no character with the ID of ${params.character}.`,
      },
    ];
  }
  const characterId = character?.toLocaleLowerCase();
  const characterTitle = character[0].toUpperCase() + character.substring(1);
  let title = `${command} - ${characterTitle} Tekken8 Frame Data | TekkenDocs`;

  const data = findMoveRow(command, frameData.rows);
  if (!data) {
    return [
      {
        title,
      },
      {
        description: `Frame data for ${params.move}.`,
      },
    ];
  }

  const { headers: dataHeaders, rows } = frameData;
  const moveRow = findMoveRow(command, rows) || [];

  const moves = getCharacterFrameDataMoves(matches);
  const move: Move | undefined = moves ? findMove(command, moves) : undefined;

  if (move) {
    title = `${move.command} - ${characterTitle} Tekken8 Frame Data | TekkenDocs`;
  }

  const description = dataHeaders
    .slice(0, 8)
    .map((header, index) => `${header}:   ${moveRow[index] || ''}`)
    .join('\n');

  let image = move?.image?.startsWith('File:')
    ? `https://wavu.wiki/t/Special:Redirect/file/${move?.image}`
    : `/t8/avatars/${characterId}-512.png`;

  if (move?.wavuId === 'Paul-CS.2') {
    image = `/t8/moves/${characterId}/Paul_CS.2.gif`;
  }

  return [
    { title },
    { description },
    { property: 'og:title', content: title },
    { property: 'description', content: description },
    { property: 'og:description', content: description },
    { property: 'og:image', content: image },
    {
      tagName: 'link',
      rel: 'canonical',
      href: `https://tekkendocs.com/t8/${characterId}/${command}`,
    },
  ];
};

const findMoveRow = (
  command: string,
  rows: string[][],
): string[] | undefined => {
  return rows.find((row) => row[0] && commandToUrlSegment(row[0]) === command);
};

const findMove = (command: string, moves: Move[]): Move | undefined => {
  return moves.find((move) => commandToUrlSegment(move.command) === command);
};

export default function MoveRoute() {
  const params = useParams();
  const command = params.move;
  const characterName = params.character;

  const matches = useMatches();
  const moves = getCharacterFrameDataMoves(matches);
  if (!characterName || !command || !moves || moves.length === 0) {
    return <div>Missing character, move, frame data or headers</div>;
  }

  const move: Move | undefined = moves ? findMove(command, moves) : undefined;
  if (!move) {
    return <div>Not able to find frame data for the move {command}</div>;
  }

  return (
    <ContentContainer enableTopPadding enableBottomPadding>
      <Text size="7" mr="6" as="span" className="sr-only">
        Tekken 8
      </Text>
      <Heading mt="2" mb="4" as="h1" className="flex flex-wrap gap-2">
        <Link to={`/${characterName}`} className="capitalize text-text-primary">
          {characterName}
        </Link>
        {move.command}
        {move.name ? ` - ${move.name}` : ''}
      </Heading>
      <div className="mt-4 max-w-[600px]">
        <MoveVideo move={move} />
      </div>

      <Table.Root variant="surface" className="mt-4" style={{ width: '100%' }}>
        <Table.Body>
          <Table.Row>
            <Table.RowHeaderCell>Hit level</Table.RowHeaderCell>
            <Table.Cell>{move.hitLevel}</Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.RowHeaderCell>Damage</Table.RowHeaderCell>
            <Table.Cell>{move.damage}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.RowHeaderCell>Startup</Table.RowHeaderCell>
            <Table.Cell>{move.startup}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.RowHeaderCell>Block</Table.RowHeaderCell>
            <Table.Cell>{move.block}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.RowHeaderCell>Hit</Table.RowHeaderCell>
            <Table.Cell>{move.hit}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.RowHeaderCell>Counter hit</Table.RowHeaderCell>
            <Table.Cell>{move.counterHit}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.RowHeaderCell>Notes</Table.RowHeaderCell>
            <Table.Cell>{move.notes}</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>
    </ContentContainer>
  );
}
