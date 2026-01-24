import { TwitterLogoIcon } from '@radix-ui/react-icons';
import { Fragment } from 'react';
import { FaTwitch, FaYoutube } from 'react-icons/fa';
import { Link } from 'react-router';
import metafyGradientIcon from '~/images/icons/metafy-gradient.svg';

export type PersonLink = {
  name: string;
  url?: string;
};
type PersonLinkListProps = {
  persons: PersonLink[];
};
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
  );
};

const PersonLinkComponent = ({ name, url }: PersonLink) => {
  if (url) {
    const urls = url.split('|').map((link) => link.trim());
    return (
      <div className="inline-flex items-center gap-1 text-primary underline underline-offset-2">
        <Link to={urls[0]}>{name}</Link>{' '}
        {urls.map((url) => {
          if (url.includes('twitter.com') || url.includes('x.com')) {
            return (
              <Link key="twitter" to={url}>
                <TwitterLogoIcon width="1em" height="1em" />
              </Link>
            );
          }
          if (url.includes('twitch.tv')) {
            return (
              <Link key="twitch" to={url}>
                <FaTwitch width="1em" height="1em" />
              </Link>
            );
          }
          if (url.includes('youtube.com')) {
            return (
              <Link key="youtube" to={url}>
                <FaYoutube width="1em" height="1em" />
              </Link>
            );
          }
          if (url.includes('metafy.gg')) {
            return (
              <Link key="metafy" to={`${url}?utm_source=tekkendocs`}>
                <img className="h-4 w-4" src={metafyGradientIcon} alt="" />
              </Link>
            );
          }

          return null;
        })}
      </div>
    );
  }
  return name;
};
