import { Heading } from '@/components/ui/heading';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ContentContainer } from './ContentContainer';

export const ResourcesTable = ({
  rows,
  headers,
}: {
  rows: string[][];
  headers: string[];
}) => {
  return (
    <section className="mt-8">
      <ContentContainer>
        <Heading as="h2" size="4" className="mb-4">
          External Resources
        </Heading>
      </ContentContainer>
      <Table style={{ width: '100%' }}>
        {headers && (
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
        )}
        <TableBody>
          {rows.map((row, _i) => {
            return (
              <TableRow key={row[0]}>
                <TableCell>
                  <a
                    className="text-primary decoration-primary/25 underline-offset-2 hover:underline"
                    href={row[0]}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {row[1]}
                  </a>
                </TableCell>
                <TableCell>{row[2]}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </section>
  );
};
