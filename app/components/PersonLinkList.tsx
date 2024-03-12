import { Link } from '@remix-run/react'

type PersonLink = {
  name: string
  url?: string
}
type PersonLinkListProps = {
  persons: PersonLink[]
}
export const PersonLinkList = ({ persons }: PersonLinkListProps) => {
  return (
    <>
      {persons.map((p, index) => (
        <>
          <PersonLinkComponent key={p.name} name={p.name} url={p.url} />
          {persons.length && index === persons.length - 2 ? (
            <span> and </span>
          ) : undefined}
          {persons.length && index < persons.length - 2 ? (
            <span>, </span>
          ) : undefined}
        </>
      ))}
    </>
  )
}

const PersonLinkComponent = ({ name, url }: PersonLink) => {
  if (url) {
    return (
      <Link to={url} className="text-text-primary underline underline-offset-2">
        {name}
      </Link>
    )
  }
  return name
}
