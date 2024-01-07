import { Badge, Card, Inset } from '@radix-ui/themes'
import { Link } from '@remix-run/react'

export type CharacterCardProps = {
  url: string
  name: string
  imgSrc?: string
}

export const CharacterCard = ({ url, name }: CharacterCardProps) => {
  return (
    <Link to={url} className="cursor-pointer">
      <Badge size="2" style={{ cursor: 'pointer' }} variant="outline">
        <span className="first-letter:uppercase">{name}</span>
      </Badge>
    </Link>
  )
}

export type CharacterCard2Props = {
  url: string
  name: string
  imgUrl?: string
}

export const CharacterCard2 = ({ url, name, imgUrl }: CharacterCard2Props) => {
  return (
    <Link to={url} className="cursor-pointer">
      <Card className="group transform transition duration-500 hover:scale-110 hover:border-b-2 hover:border-b-gray-700 hover:shadow">
        <Inset clip="padding-box" side="top" pb="current">
          <img
            src={imgUrl}
            alt=""
            className="h-full w-full  
              rounded object-contain"
          />
        </Inset>
        <Inset clip="padding-box" side="x">
          <div className="text-text-primary overflow-hidden text-ellipsis whitespace-nowrap text-center first-letter:uppercase">
            {name}
          </div>
        </Inset>
      </Card>
    </Link>
  )
}
