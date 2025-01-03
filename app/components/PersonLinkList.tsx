import { Fragment } from 'react'
import { TwitterLogoIcon } from '@radix-ui/react-icons'
import { Link } from '@remix-run/react'

export type PersonLink = {
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
        <Fragment key={p.name}>
          <PersonLinkComponent name={p.name} url={p.url} />
          {persons.length && index === persons.length - 2 ? (
            <span> and </span>
          ) : undefined}
          {persons.length && index < persons.length - 2 ? (
            <span>, </span>
          ) : undefined}
        </Fragment>
      ))}
    </>
  )
}

const PersonLinkComponent = ({ name, url }: PersonLink) => {
  if (url) {
    return (
      <Link
        to={url}
        className="inline-flex items-center gap-1 text-text-primary underline underline-offset-2"
      >
        {name}{' '}
        {url.includes('x.com') ? (
          <TwitterLogoIcon width="1em" height="1em" />
        ) : null}
      </Link>
    )
  }
  return name
}
