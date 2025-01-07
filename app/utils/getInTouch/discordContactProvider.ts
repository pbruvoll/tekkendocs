import { type GetInTouchProvider } from './interfaces/GetInTouchProvider'

type DiscordChannel = 'invite'

const discordChannelMap: Record<DiscordChannel, string> = {
  invite: 'https://discord.gg/T39G6MB2',
}

export class DiscordContactProvider
  implements GetInTouchProvider<DiscordChannel>
{
  public buildContactUrl(selectedChannel: DiscordChannel): string {
    return discordChannelMap[selectedChannel]
  }
}
