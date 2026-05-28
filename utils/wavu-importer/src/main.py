import argparse
import json, datetime, logging, os, sys
from typing import List, Optional

sys.path.append('./')

from src.wavu import wavu_importer
from src.module import json_movelist_reader
from src.module import character
from src.resources import const

sys.path.insert(0, (os.path.dirname(os.path.dirname(__file__))))

logger = logging.getLogger(__name__)
logger.setLevel(logging.WARNING)

base_path = os.path.dirname(__file__)
CHARACTER_LIST_PATH = os.path.abspath(os.path.join(base_path, "resources", "character_list.json"))


character_list = []


def normalize_character_name(name: str) -> str:
    return name.strip().lower().replace(" ", "_")


def create_json_movelists(character_list_path: str, only_character: Optional[str] = None) -> List[character.Character]:
    with open(character_list_path) as file:
        all_characters = json.load(file)

        cha_list = []

        normalized_filter = normalize_character_name(only_character) if only_character else None
        if normalized_filter:
            all_characters = [
                c for c in all_characters
                if normalize_character_name(c["name"]) == normalized_filter
            ]
            if not all_characters:
                raise ValueError(f"Character '{only_character}' not found in character list")

        for character_meta in all_characters:
            print("importing " + character_meta["name"])
            # if(character_meta["name"] != "azucena") :
            #     continue
            character_meta["name"] = normalize_character_name(character_meta["name"])
            cha = wavu_importer.import_character(character_meta)
            cha.export_movelist_as_data()
            cha_list.append(cha)

    return cha_list



parser = argparse.ArgumentParser(description="Download and export Wavu movelist data")
parser.add_argument(
    "--character",
    help="Only import the specified character (case-insensitive, spaces allowed)",
)
args = parser.parse_args()

character_list = create_json_movelists(CHARACTER_LIST_PATH, args.character)
print("Character jsons are successfully created")


