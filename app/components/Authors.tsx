import { type PersonLink, PersonLinkList } from './PersonLinkList';

type AuthorsProps = {
  authors: PersonLink[];
  /** Text before the authors, for pages in another language */
  label?: string;
};
export const Authors = ({ authors, label = 'Written by' }: AuthorsProps) => {
  return (
    <div>
      {/* plain text, so it sets the line's direction in rtl guides */}
      {label} <PersonLinkList persons={authors} />
    </div>
  );
};
