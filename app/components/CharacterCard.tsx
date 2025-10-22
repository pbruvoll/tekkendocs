import { Card, Inset } from '@radix-ui/themes';
import { Link } from 'react-router';
import { cx } from 'class-variance-authority';
import { Badge } from '@/components/ui/badge';

export type CharacterCard2Props = {
  size?: 'medium' | 'large';
  url: string;
  name: string;
  badge?: string;
  author?: string;
  imgUrl?: string;
};

export const CharacterCard2 = ({
  url,
  name,
  badge,
  size,
  imgUrl,
  author,
}: CharacterCard2Props) => {
  return (
    <Link to={url} className="cursor-pointer">
      <Card className="group transform transition duration-500 hover:scale-110 hover:border-b-gray-700 hover:shadow">
        <Inset clip="padding-box" className="relative" side="top" pb="current">
          <img
            src={imgUrl}
            alt={name}
            className={cx(
              'h-full w-full rounded',
              size === 'large'
                ? 'aspect-[1.55] object-cover object-[80%_50%]'
                : 'object-contain',
            )}
          />
          {badge && (
            <Badge
              variant="secondary"
              className="absolute bottom-4 left-0.5 border border-black/60"
            >
              {badge}
            </Badge>
          )}
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
  );
};
