import { DiscordLogoIcon, TwitterLogoIcon } from '@radix-ui/react-icons';
import { twitterLink } from '~/services/staticDataService';
import { DiscordContactProvider } from '~/utils/getInTouch';

const linkClass =
  'inline-flex items-center gap-1 text-primary underline underline-offset-2';

export const SuggestModNote = () => {
  const contactByDiscord = new DiscordContactProvider();
  return (
    <p className="text-muted-foreground">
      Do you know about a mod that should be on this list? Let us know on{' '}
      <a
        className={linkClass}
        href={twitterLink}
        target="_blank"
        rel="noopener noreferrer"
        title="TekkenDocs on Twitter (X)"
      >
        X <TwitterLogoIcon aria-hidden />
      </a>{' '}
      or{' '}
      <a
        className={linkClass}
        href={contactByDiscord.buildContactUrl('invite')}
        target="_blank"
        rel="noopener noreferrer"
        title="Invite to Tekkendocs Discord server"
      >
        Discord <DiscordLogoIcon aria-hidden />
      </a>
      .
    </p>
  );
};
