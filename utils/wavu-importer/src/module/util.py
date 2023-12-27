from src.resources import const
from src.module import character


def correct_character_name(alias: str):
    # check if input in dictionary or in dictionary values
    if alias in const.CHARACTER_ALIAS:
        return alias

    for key, value in const.CHARACTER_ALIAS.items():
        if alias in value:
            return key

    return None

def get_character_by_name(name :str, character_list :[]) -> character.Character:
    for character in character_list:
        if character.name == name:
            return character

def get_move_type(original_move: str):
    for k in const.MOVE_TYPES.keys():
        if original_move in const.MOVE_TYPES[k]:
            return k


