import { Badge, Card } from '@radix-ui/themes'
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
      <Card className="group transform transition duration-500 hover:scale-110 hover:shadow">
        <div className="flex flex-col items-center gap-3">
          <div className="aspect-square w-full">
            <img
              src={imgUrl}
              alt=""
              className="h-full w-full  
              rounded object-contain"
            />
          </div>

          <span className="text-text-primary first-letter:uppercase">
            {name}
          </span>
        </div>
      </Card>
    </Link>
  )
}
