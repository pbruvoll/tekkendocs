import { Pencil1Icon } from '@radix-ui/react-icons'
import { Heading, Table } from '@radix-ui/themes'
import { Link, useLoaderData } from '@remix-run/react'
import { ContentContainer } from '~/components/ContentContainer'
import { tableIdToDisplayName } from '~/constants/tableIdToDisplayName'
import { commandToUrlSegment } from '~/utils/moveUtils'
import type { loader } from './_mainLayout.t7_.$character.meta'

export default function Index() {
  const { characterName, editUrl, tables } = useLoaderData<typeof loader>()

  if (tables.length === 0) {
    return <div>Invalid or no data</div>
  }
  return (
    <>
      <ContentContainer enableTopPadding>
        <div className="flex items-center justify-between">
          <Heading as="h1" my="2" className="capitalize">
            {characterName}
          </Heading>
          <a
            className="flex items-center gap-2"
            style={{ color: 'var(--accent-a11' }}
            target="blank"
            href={editUrl}
          >
            <Pencil1Icon />
            Edit
          </a>
        </div>
      </ContentContainer>
      <ContentContainer disableXPadding>
        {tables.map(table => {
          const columnNums = (table.headers || table.rows[0]).map(
            (_, index) => index,
          )
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
                      {table.headers.map(h => (
                        <Table.ColumnHeaderCell key={h}>
                          {h}
                        </Table.ColumnHeaderCell>
                      ))}
                    </Table.Row>
                  </Table.Header>
                )}
                <Table.Body>
                  {table.rows.map((row, i) => {
                    return (
                      <Table.Row key={row[0]}>
                        {columnNums.map(j => {
                          const cell = row[j] || ''
                          if (j === 0 && table.name === 'frames_normal') {
                            //this is a command, so make it link
                            return (
                              <Table.Cell key={j}>
                                <Link
                                  className="text-[#ab6400]"
                                  style={{ textDecoration: 'none' }}
                                  to={commandToUrlSegment(cell)}
                                >
                                  {cell}
                                </Link>
                              </Table.Cell>
                            )
                          }
                          return <Table.Cell key={j}>{cell}</Table.Cell>
                        })}
                      </Table.Row>
                    )
                  })}
                </Table.Body>
              </Table.Root>
            </section>
          )
        })}
      </ContentContainer>
    </>
  )
}
