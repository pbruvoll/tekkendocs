import { type PersonLink, PersonLinkList } from './PersonLinkList';

type AuthorsProps = {
  authors: PersonLink[];
};
export const Authors = ({ authors }: AuthorsProps) => {
  return (
    <div>
      <span>Written by </span>
      <PersonLinkList persons={authors} />
    </div>
  );
};
