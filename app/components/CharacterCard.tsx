import { cx } from 'class-variance-authority';
import { Link } from 'react-router';
import { Badge } from '~/components/ui/badge';
import { Card } from '~/components/ui/card';

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
    <Link to={url} className="block h-full cursor-pointer">
      <Card className="group relative h-full transform gap-0 pt-0 pb-3 transition duration-500 hover:scale-110 hover:shadow-sm">
        <div className={cx('relative', size === 'large' && 'pb-3')}>
          <img
            src={imgUrl}
            alt={name}
            className={cx(
              'h-full w-full rounded',
              size === 'large'
                ? 'aspect-[1.55] object-cover object-[80%_50%]'
                : 'mb-1 object-contain',
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
        </div>
        {author ? (
          <>
            <div className="overflow-hidden text-ellipsis whitespace-nowrap text-center max-xs:text-xs">
              <span className="capitalize">{name}</span> by
            </div>
            <div className="overflow-hidden text-center capitalize text-primary max-xs:text-xs">
              {author}
            </div>
          </>
        ) : (
          <div className="overflow-hidden text-ellipsis whitespace-nowrap text-center capitalize text-primary max-xs:text-xs">
            {name === 'mokujin' ? 'All Characters' : name}
          </div>
        )}
      </Card>
    </Link>
  );
};
