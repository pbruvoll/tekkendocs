import { Heading, Link as RadixLink, Table } from '@radix-ui/themes'
import { Link } from '@remix-run/react'
import { ContentContainer } from './ContentContainer'

export const ResourcesTable = ({
  rows,
  headers,
}: {
  rows: string[][]
  headers: string[]
}) => {
  return (
    <section className="mt-8">
      <ContentContainer>
        <Heading as="h2" mb="4" size="4">
          External Resources
        </Heading>
      </ContentContainer>
      <Table.Root variant="surface" style={{ width: '100%' }}>
        {headers && (
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Description</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
        )}
        <Table.Body>
          {rows.map((row, i) => {
            return (
              <Table.Row key={row[0]}>
                <Table.Cell>
                  <RadixLink asChild>
                    <a href={row[0]} target="_blank" rel="noreferrer">
                      {row[1]}
                    </a>
                  </RadixLink>
                </Table.Cell>
                <Table.Cell>{row[2]}</Table.Cell>
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table.Root>
    </section>
  )
}
