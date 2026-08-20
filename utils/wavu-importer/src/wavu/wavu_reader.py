import json, requests, re, html

from typing import List
from src.resources import const
from bs4 import BeautifulSoup

session = requests.Session()


def _upper_first_letter(input: str) -> str:
    if input:
        parts = input.split('_')
        res = '_'.join(word.capitalize() for word in parts)
        return res

    else:
        return input


def get_wavu_character_movelist(character_name: str) -> List[dict]:
    params = {
        "action": "cargoquery",
        "tables": "Move",
        "fields": "id, name, input, alias, alt, num, parent, image, video, target, damage, reach, tracksLeft, tracksRight, startup, recv, tot, crush, block, hit, ch, notes, _pageNamespace=ns",
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
    return _convert_json_movelist(content["cargoquery"])


def _normalize_data(data):
    if data:
        # remove non-ascii stuff
        return re.sub(r'[^\x00-\x7F]+', '', data).replace('&amp;#58;', ':')
    else:
        return ""


def _none_to_empty(data):
    return '' if data is None else data


def _empty_value_if_none(value):
    if not value:
        return ""
    else:
        return value


def _normalize_crush(data: str) -> str:
    crush = html.unescape(html.unescape(_normalize_data(data)))
    crush = BeautifulSoup(crush, features="lxml").get_text()

    # remove new lines and *. Replace "," with space
    crush = crush.replace("\n", "").replace("*", "").replace(",", " ")
    # split on spaces, but dont keep empty entries
    return " ".join([part for part in crush.split(" ") if part])


# Some names are html lists holding several alternate names for the same move.
# Only the markup is removed, leaving a "*" prefixed list like for alt.
# Non-ascii characters are kept, since names contain accented letters.
def _normalize_name(data: str) -> str:
    name = html.unescape(_none_to_empty(data))
    if "<" not in name:
        return name

    name = BeautifulSoup(name, features="lxml").get_text()
    return re.sub(r"(\n)+", "\n", name).strip()


def _normalize_notes(data: str) -> str:
    notes = html.unescape(_normalize_data(data))
    notes = BeautifulSoup(notes, features="lxml").get_text()
    return notes.replace("* \n", "* ").strip()


# wavu has no value for the field, so there is no reason to store one
def _without_empty_values(move: dict) -> dict:
    return {field: value for field, value in move.items() if value}


# The values are stored as they are given by wavu, meaning that a move only
# holds its own values and points to the move it continues through "parent".
# Joining a move with its parent, and everything else which interprets the data,
# is done by utils/wavuParsing.py
def _convert_json_movelist(move_list_json: list) -> List[dict]:
    move_list = []
    for move in move_list_json:
        if move["title"]["ns"] == "0":
            title = move["title"]
            move_list.append(_without_empty_values({
                "id": _normalize_data(title["id"]),
                "parent": _normalize_data(title["parent"]),
                "name": _normalize_name(title["name"]),
                "input": _normalize_data(title["input"]).replace("#", ":"),
                # both are lists of alternate commands wrapped in html
                "alias": _remove_html_tags(_normalize_data(title["alias"])),
                "alt": _remove_html_tags(_normalize_data(title["alt"])),
                "num": _normalize_data(title["num"]),
                "image": _normalize_data(title["image"]),
                "video": _normalize_data(title["video"]),
                "target": _normalize_data(title["target"]),
                "damage": _normalize_data(title["damage"]),
                "reach": _normalize_data(title["reach"]),
                "tracksLeft": _normalize_data(title["tracksLeft"]),
                "tracksRight": _normalize_data(title["tracksRight"]),
                "startup": _normalize_data(title["startup"]),
                "recv": _normalize_data(title["recv"]),
                "tot": _normalize_data(title["tot"]),
                "crush": _normalize_crush(title["crush"]),
                "block": _remove_html_tags(_normalize_data(title["block"])),
                "hit": _remove_html_tags(_normalize_data(_normalize_hit_ch_input(title["hit"]))),
                "ch": _remove_html_tags(_normalize_data(_normalize_hit_ch_input(title["ch"]))),
                "notes": _normalize_notes(title["notes"]),
            }))
    return move_list


def _remove_html_tags(data: str) -> str:
    "Process HTML content in JSON response to remove tags and unescape characters"

    result = html.unescape(_normalize_data(data))
    result = BeautifulSoup(result, features="lxml").get_text()
    result = result.replace("* \n", "* ")
    result = re.sub(r"(\n)+", "\n", result)
    result = result.replace("'''", "")
    result = result.replace("**", " *")  # hack/fix for nested Plainlists
    result = result.strip()
    return result


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
