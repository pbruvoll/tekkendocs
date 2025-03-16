import { Card, Inset } from '@radix-ui/themes'
import { Link } from '@remix-run/react'
import { cx } from 'class-variance-authority'

export type CharacterCard2Props = {
  size?: 'medium' | 'large'
  url: string
  name: string
  author?: string
  imgUrl?: string
}

export const CharacterCard2 = ({
  url,
  name,
  size,
  imgUrl,
  author,
}: CharacterCard2Props) => {
  return (
    <Link to={url} className="cursor-pointer">
      <Card className="group transform transition duration-500 hover:scale-110 hover:border-b-2 hover:border-b-gray-700 hover:shadow">
        <Inset clip="padding-box" side="top" pb="current">
          <img
            src={imgUrl}
            alt={name}
            className={cx(
              'h-full w-full rounded',
              size === 'large'
                ? 'aspect-[1.4] object-cover object-[80%_50%]'
                : 'object-contain',
            )}
          />
        </Inset>
        <Inset clip="padding-box" side="x">
          {author ? (
            <>
              <div className="overflow-hidden text-ellipsis whitespace-nowrap text-center max-xs:text-xs">
                <span className="capitalize">{name}</span> by
              </div>
              <div className="overflow-hidden text-ellipsis whitespace-nowrap text-center capitalize text-text-primary max-xs:text-xs">
                {author}
              </div>
            </>
          ) : (
            <div className="overflow-hidden text-ellipsis whitespace-nowrap text-center capitalize text-text-primary max-xs:text-xs">
              {name}
            </div>
          )}
        </Inset>
      </Card>
    </Link>
  )
}
