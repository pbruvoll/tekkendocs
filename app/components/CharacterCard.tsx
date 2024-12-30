import { Card, Inset } from '@radix-ui/themes'
import { Link } from '@remix-run/react'

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
            alt={name}
            className="h-full w-full  
              rounded object-contain"
          />
        </Inset>
        <Inset clip="padding-box" side="x">
          <div className="overflow-hidden text-ellipsis whitespace-nowrap text-center capitalize text-text-primary max-xs:text-xs">
            {name}
          </div>
        </Inset>
      </Card>
    </Link>
  )
}
