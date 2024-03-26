import json, datetime, logging, os, sys
from typing import List

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

def create_json_movelists(character_list_path: str) -> List[character.Character]:
    with open(character_list_path) as file:
        all_characters = json.load(file)
        cha_list = []

        for character_meta in all_characters:
            if(character_meta["name"] != "nina") :
                continue
            print("importing " + character_meta["name"])
            cha = wavu_importer.import_character(character_meta)
            cha.export_movelist_as_json()
            cha_list.append(cha)

    return cha_list


try:
    character_list = create_json_movelists(CHARACTER_LIST_PATH)
    print("Character jsons are successfully created")


except Exception as e:
    time_now = datetime.datetime.now().strftime("%Y-%m-%d  %H:%M:%S")
    logger.error(f'{time_now} \n Error: {e}')
