import { type GetInTouchProvider } from './interfaces/GetInTouchProvider'

type DiscordChannel = 'invite'

const discordChannelMap: Record<DiscordChannel, string> = {
  invite: 'https://discord.gg/7AmfM5FF',
}

export class DiscordContactProvider
  implements GetInTouchProvider<DiscordChannel>
{
  public buildContactUrl(selectedChannel: DiscordChannel): string {
    return discordChannelMap[selectedChannel]
  }
}
