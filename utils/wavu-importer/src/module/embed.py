import discord
from src.module import character

MOVE_NOT_FOUND_TITLE = 'Move not found'
SUCCESS_COLOR = discord.Colour.from_rgb(50, 168, 82)
WARNING_COLOR = discord.Colour.from_rgb(253, 218, 13)
ERROR_COLOR = discord.Colour.from_rgb(220, 20, 60)


def _upper_first_letter(input: str) -> str:
    if input:
        result_string = input[0].capitalize() + input[1:]
        return result_string
    else:
        return input


def similar_moves_embed(similar_moves, character_name):
    command_list = []
    for i in range(len(similar_moves)):
        command_list.append(f'**{i + 1}**. {similar_moves[i]["input"]}')

    embed = discord.Embed(title=MOVE_NOT_FOUND_TITLE, colour=WARNING_COLOR,
                          description='Similar moves from {}\n{}'
                          .format(character_name, '\n'.join(command_list)))
    return embed


def move_list_embed(character, moves, move_type):
    """Returns the embed message for a list of moves matching to a special move type"""
    desc_string = ''
    moves.sort()
    for move in moves:
        desc_string += move + '\n'

    embed = discord.Embed(title=character.name + ' ' + move_type.lower() + ':',
                          colour=SUCCESS_COLOR,
                          description=desc_string)
    return embed


def error_embed(message):
    embed = discord.Embed(title='Error',
                          colour=ERROR_COLOR,
                          description=message)
    return embed

def success_embed(message):
    embed = discord.Embed(title='Success',
                          colour=SUCCESS_COLOR,
                          description=message)
    return embed


def move_embed(character: character, move: dict):
    """Returns the embed message for character and move"""
    embed = discord.Embed(title='**' + move['input'] + '**',
                          colour=SUCCESS_COLOR,
                          description=move['name'],
                          url=character.wavu_page,
                          )

    embed.set_thumbnail(url=character.portrait[0])
    embed.set_footer(text="Wavu.wiki", icon_url="https://i.imgur.com/xfdEUee.png")
    embed.set_author(name=_upper_first_letter(character.name), url=character.wavu_page)

    embed.add_field(name='Target', value=move['target'])
    embed.add_field(name='Damage', value=move['damage'])

    embed.add_field(name='Startup', value=move['startup'])

    embed.add_field(name="Block", value=move['on_block'])
    embed.add_field(name='Hit', value=move['on_hit'])
    embed.add_field(name="CH", value=move['on_ch'])
    if move['notes']:
        embed.add_field(name="Notes", value=move['notes'])

    return embed
