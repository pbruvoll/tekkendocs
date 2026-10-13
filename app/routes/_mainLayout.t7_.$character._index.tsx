import { Filter, PencilIcon } from 'lucide-react';
import { useState } from 'react';
import {
  type HeadersFunction,
  Link,
  type MetaFunction,
  NavLink,
  useMatches,
} from 'react-router';
import { Heading } from '@/components/ui/heading';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  )?.loaderData;
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
  )?.loaderData;

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
          <Heading as="h1" className="my-2 capitalize">
            {characterName}
          </Heading>
          <a
            className="flex items-center gap-2 text-primary"
            target="_blank"
            href={editUrl}
            rel="noopener"
          >
            <PencilIcon className="size-3.5" />
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
                <Heading as="h2" size="4" className="mb-4">
                  {tableIdToDisplayName[table.name]}
                </Heading>
              </ContentContainer>
              <Table>
                {table.headers && (
                  <TableHeader>
                    <TableRow>
                      {table.headers.map((h) => (
                        <TableHead key={h}>{h}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                )}
                <TableBody>
                  {table.rows.map((row, _i) => {
                    return (
                      <TableRow key={row[0]}>
                        {columnNums.map((j) => {
                          const cell = row[j] || '';
                          if (j === 0 && table.name === 'frames_normal') {
                            //this is a command, so make it link
                            return (
                              <TableCell key={j}>
                                <Link
                                  className="text-primary"
                                  to={commandToUrlSegment(cell)}
                                >
                                  {cell}
                                </Link>
                              </TableCell>
                            );
                          }
                          return <TableCell key={j}>{cell}</TableCell>;
                        })}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </section>
          );
        })}
      </ContentContainer>
    </>
  );
}
