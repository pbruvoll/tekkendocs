import { Pencil1Icon } from '@radix-ui/react-icons';
import { Heading, Link as RadixLink, Table } from '@radix-ui/themes';
import { Filter } from 'lucide-react';
import { useState } from 'react';
import {
  type HeadersFunction,
  Link,
  type MetaFunction,
  NavLink,
  useMatches,
} from 'react-router';
import { Input } from '@/components/ui/input';
import { ContentContainer } from '~/components/ContentContainer';
import { FrameDataTable } from '~/components/FrameDataTable';
import { tableIdToDisplayName } from '~/constants/tableIdToDisplayName';
import { type CharacterFrameData } from '~/types/CharacterFrameData';
import { type RouteHandle } from '~/types/RouteHandle';
import { type TableDataWithHeader } from '~/types/TableData';
import { cleanCommand } from '~/utils/filterUtils';
import { getCacheControlHeaders } from '~/utils/headerUtils';
import { commandToUrlSegment } from '~/utils/moveUtils';

export const headers: HeadersFunction = (args) => ({
  ...getCacheControlHeaders({ seconds: 60 * 5 }),
  'X-Td-Cachecontext': args.loaderHeaders.get('X-Td-Cachecontext') || 'none',
});

export const meta: MetaFunction = ({ params, matches }) => {
  const frameData = matches.find(
    (m) => (m.handle as RouteHandle)?.type === 'frameData',
  )?.data;
  if (!frameData) {
    return [
      {
        title: 'TekkenDocs - Uknown character',
      },
      {
        description: `There is no character with the ID of ${params.character}.`,
      },
    ];
  }
  const { characterName } = frameData as CharacterFrameData;
  const characterId = characterName.toLocaleLowerCase();
  const characterTitle =
    characterName[0].toUpperCase() + characterName.substring(1);
  const title = `${characterTitle} Tekken 7 Frame Data | TekkenDocs`;
  const description = `Frame data for ${characterTitle} in Tekken 7`;

  return [
    { title },
    { description },
    { property: 'og:title', content: title },
    { property: 'description', content: description },
    { property: 'og:description', content: description },
    { property: 'og:image', content: `/t7/avatars/${characterTitle}.jpg` },
    {
      tagName: 'link',
      rel: 'canonical',
      href: `https://tekkendocs.com/t7/${characterId}`,
    },
  ];
};

export default function Index() {
  const matches = useMatches();
  const frameData = matches.find(
    (m) => (m.handle as RouteHandle)?.type === 'frameData',
  )?.data;

  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!frameData) {
    return <div>Could not load data</div>;
  }
  const { tables, editUrl, characterName } = frameData as CharacterFrameData;
  if (tables.length === 0) {
    return <div>Invalid or no data</div>;
  }

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value;
    setSearchQuery(searchValue);
  };

  return (
    <>
      <ContentContainer enableTopPadding>
        <div className="flex items-center justify-between">
          <Heading as="h1" my="2" className="capitalize">
            {characterName}
          </Heading>
          <a
            className="flex items-center gap-2"
            style={{ color: 'var(--accent-a11)' }}
            target="blank"
            href={editUrl}
          >
            <Pencil1Icon />
            Edit
          </a>
        </div>
        <nav className="flex gap-3">
          <NavLink to="">Frame data</NavLink>
          <NavLink to="meta">Guide</NavLink>
          <NavLink to="antistrat">Anti strats</NavLink>
        </nav>
        <div className="mb-3 flex items-center gap-2">
          <Filter />
          <Input
            onChange={(e) => handleOnChange(e)}
            placeholder="ff2,1+2"
          ></Input>
        </div>
      </ContentContainer>
      <ContentContainer disableXPadding>
        {tables.map((table) => {
          const columnNums = (table.headers || table.rows[0]).map(
            (_, index) => index,
          );
          if (table.headers && table.name === 'frames_normal') {
            let filteredRows = table.rows;
            if (searchQuery) {
              const cleanedSearchQuery = cleanCommand(
                searchQuery.replace(/ /g, ''),
              );
              filteredRows = table.rows.filter((row) => {
                return cleanCommand(row[0] || '')
                  .replace(/ /g, '')
                  .includes(cleanedSearchQuery);
              });
            }
            return (
              <FrameDataTable
                key={table.name}
                table={{ ...table, rows: filteredRows } as TableDataWithHeader}
              />
            );
          }
          return (
            <section key={table.name} className="mt-8">
              <ContentContainer>
                <Heading as="h2" mb="4" size="4">
                  {tableIdToDisplayName[table.name]}
                </Heading>
              </ContentContainer>
              <Table.Root variant="surface" style={{ width: '100%' }}>
                {table.headers && (
                  <Table.Header>
                    <Table.Row>
                      {table.headers.map((h) => (
                        <Table.ColumnHeaderCell key={h}>
                          {h}
                        </Table.ColumnHeaderCell>
                      ))}
                    </Table.Row>
                  </Table.Header>
                )}
                <Table.Body>
                  {table.rows.map((row, _i) => {
                    return (
                      <Table.Row key={row[0]}>
                        {columnNums.map((j) => {
                          const cell = row[j] || '';
                          if (j === 0 && table.name === 'frames_normal') {
                            //this is a command, so make it link
                            return (
                              <Table.Cell key={j}>
                                <RadixLink asChild>
                                  <Link
                                    className="text-[#ab6400]"
                                    style={{ textDecoration: 'none' }}
                                    to={commandToUrlSegment(cell)}
                                  >
                                    {cell}
                                  </Link>
                                </RadixLink>
                              </Table.Cell>
                            );
                          }
                          return <Table.Cell key={j}>{cell}</Table.Cell>;
                        })}
                      </Table.Row>
                    );
                  })}
                </Table.Body>
              </Table.Root>
            </section>
          );
        })}
      </ContentContainer>
    </>
  );
}
