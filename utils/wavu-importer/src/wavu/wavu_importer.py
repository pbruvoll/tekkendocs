import os

from src.module import character
from src.wavu import wavu_reader

base_path = os.path.dirname(__file__)


def import_character(character_meta: dict) -> character.Character:
    name = character_meta["name"]

    move_list = wavu_reader.get_wavu_character_movelist(name)
    move_list_path = os.path.abspath(os.path.join(base_path, "..", "json_movelist", name.replace("_", "-") + ".json"))
    return character.Character(name, move_list, move_list_path)
