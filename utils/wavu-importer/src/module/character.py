from typing import List
import os, json
from json import JSONEncoder
import re

class Character:
    def __init__(self, name: str, portrait: str, move_list: List[dict], move_list_path: str, wavu_page: str):
        self.name = name
        self.portrait = portrait,
        self.move_list = move_list
        self.move_list_path = move_list_path
        self.wavu_page = wavu_page

    def export_movelist_as_data(self):
        self.__create_move_list_file()
        with open(self.move_list_path, "w", encoding='utf-8') as outfile:
            json.dump(self.move_list, outfile, sort_keys=True, indent=4, ensure_ascii=False)

    def __create_move_list_file(self):
        if not os.path.exists(self.move_list_path):
            with open(self.move_list_path, "w"): pass


class ClassEncoder(JSONEncoder):
    def default(self, o):
        return o.__dict__


