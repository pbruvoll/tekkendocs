from typing import List
import json


class Character:
    def __init__(self, name: str, move_list: List[dict], move_list_path: str):
        self.name = name
        self.move_list = move_list
        self.move_list_path = move_list_path

    def export_movelist_as_data(self):
        with open(self.move_list_path, "w", encoding='utf-8') as outfile:
            json.dump(self.move_list, outfile, sort_keys=True, indent=4, ensure_ascii=False)
