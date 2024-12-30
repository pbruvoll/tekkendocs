import { type GetInTouchProvider } from './interfaces/GetInTouchProvider'

type DiscordChannel = 'invite'

const discordChannelMap: Record<DiscordChannel, string> = {
  invite: 'https://discord.gg/gKNbCRA9',
}

export class DiscordContactProvider
  implements GetInTouchProvider<DiscordChannel>
{
  public buildContactUrl(selectedChannel: DiscordChannel): string {
    return discordChannelMap[selectedChannel]
  }
}
