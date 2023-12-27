import os, sys

from src.module import character
from src.wavu import wavu_reader

sys.path.insert(1, (os.path.dirname(os.path.dirname(__file__))))
base_path = os.path.dirname(__file__)


def import_character(character_meta: dict) -> character.Character:
    name = character_meta["name"]
    portrait = character_meta["portrait"]
    wavu_page = character_meta["wavu_page"]

    move_list = wavu_reader.get_wavu_character_movelist(name)
    move_list_path = os.path.abspath(os.path.join(base_path, "..", "json_movelist", name + ".json"))
    cha = character.Character(name, portrait, move_list, move_list_path,wavu_page)
    return cha
