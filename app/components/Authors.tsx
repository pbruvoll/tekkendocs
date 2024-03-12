import { type CreditPerson } from '~/types/CreditPerson'
import { PersonLinkList } from './PersonLinkList'

type AuthorsProps = {
  authors: CreditPerson[]
}
export const Authors = ({ authors }: AuthorsProps) => {
  return (
    <div>
      <span>Written by </span>
      <PersonLinkList persons={authors} />
    </div>
  )
}
