import json, requests, re, html

from typing import List
from mediawiki import MediaWiki
from src.module.character import Move
from src.resources import const
from bs4 import BeautifulSoup

wavuwiki = MediaWiki(url=const.WAVU_API_URL)
session = requests.Session()


def _upper_first_letter(input: str) -> str:
    if input:
        parts = input.split('_')
        res = '_'.join(word.capitalize() for word in parts)
        return res

    else:
        return input


def get_wavu_character_movelist(character_name: str) -> List[Move]:
    params = {
        "action": "cargoquery",
        "tables": "Move",
        "fields": "id,name,input,parent,target,damage,startup, recv, tot, crush, block,hit,ch,notes,_pageNamespace=ns",
        "join_on": "",
        "group_by": "",
        "where": "id LIKE '" + _upper_first_letter(character_name) + "%'",
        "having": "",
        "order_by": "id",
        "offset": "0",
        "limit": "500",
        "format": "json"
    }

    response = session.get(const.WAVU_API_URL, params=params)
    content = json.loads(response.content)
    move_list_json = content["cargoquery"]
    move_list = _convert_json_movelist(move_list_json)
    return move_list


def get_move(move_id: str, move_list: List[Move]) -> Move:
    result = [move for move in move_list if move.id == move_id]
    return result[0]


def _get_all_parent_values_of(field: str, move_id: str, move_list_json: list) -> str:
    complete_input = ""
    if move_id:
        for move in move_list_json:
            if move["title"]["id"] == move_id:
                if move["title"]["parent"]:
                    original_move = move["title"]["parent"]
                    if "_" in original_move:
                        original_move = original_move.split("_")[0]
                    complete_input += _get_all_parent_values_of(field, original_move, move_list_json)
                return complete_input + _normalize_data(move["title"][field])
    else:
        return ""


def _normalize_data(data):
    if data:
        # remove non-ascii stuff
        return re.sub(r'[^\x00-\x7F]+', '', data).replace('&amp;#58;', ':')
    else:
        return ""


# last entry is always the input
def _create_alias(input: str) -> List[str]:
    parts = input.split("_")
    input = parts[0]
    aliases = parts[1:]
    result = []
    for entry in aliases:
        num_characters = len(entry)
        x = len(input) - num_characters
        if x < 0:
            x = 0
        original_input = input[0:x]
        alias = original_input + entry
        if len(alias) > len(input):
            input = input + entry[len(input):]

        result.append(alias)
    result.append(input)
    return result

def _empty_value_if_none(value):
    if not value:
        return ""
    else:
        return value

def _convert_json_movelist(move_list_json: list) -> List[Move]:
    move_list = []
    for move in move_list_json:
        if move["title"]["ns"] == "0":
            alias = []
            id = _normalize_data(move["title"]["id"])
            name = _normalize_data(move["title"]["name"])
            input = _normalize_data(
                _get_all_parent_values_of("input", _normalize_data(move["title"]["parent"]), move_list_json)
                + _normalize_data(move["title"]["input"]))
            if "_" in input:
                result = _create_alias(input)
                input = result[-1]
                alias = result[0:(len(result) - 1)]

            target = _normalize_data(
                _get_all_parent_values_of("target", _normalize_data(move["title"]["parent"]),
                                          move_list_json) + _normalize_data(move["title"]["target"]))
            damage = _normalize_data(
                _get_all_parent_values_of("damage", _normalize_data(move["title"]["parent"]),
                                          move_list_json) + _normalize_data(move["title"]["damage"]))

            on_block = _normalize_data(move["title"]["block"])
            on_hit = _normalize_data(_normalize_hit_ch_input(move["title"]["hit"]))
            on_ch = _normalize_data(_normalize_hit_ch_input(move["title"]["ch"]))
            startup = _normalize_data(move["title"]["startup"])
            recovery = _normalize_data(move["title"]["recv"])

            notes = html.unescape(_normalize_data(move["title"]["notes"]))
            notes = BeautifulSoup(notes, features="lxml").get_text()
            notes = notes.replace("* \n", "* ")

            move = Move(id, name, input, target, damage, on_block, on_hit, on_ch, startup, recovery, notes, "", alias)
            move_list.append(move)
    return move_list


def _normalize_hit_ch_input(entry: str) -> str:
    entry = _empty_value_if_none(entry)
    if "|" in entry:
        pattern = r'\|([^|]+)\]\]'
        match = re.search(pattern, entry)
        if match:
            return match.group(1)
        return entry
    else:
        return entry
