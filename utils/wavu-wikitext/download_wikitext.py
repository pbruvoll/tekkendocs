# Downloads the raw wikitext of the movelist pages on wavu.wiki, ie the exact
# text you see when opening a page with "?action=edit". The MediaWiki api is
# used instead of "action=raw", because plain page requests are answered by a
# cloudflare challenge while api.php is not.

import argparse
import json
import os
import sys

import requests

WAVU_API_URL = "https://wavu.wiki/w/api.php"

# api.php accepts up to 50 titles in one query for normal users
TITLES_PER_REQUEST = 50

USER_AGENT = "tekkendocs-wikitext-downloader/1.0 (https://tekkendocs.com)"

base_path = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(base_path, "data")
CHARACTER_LIST_PATH = os.path.abspath(
    os.path.join(base_path, "..", "wavu-importer", "src", "resources", "character_list.json")
)

session = requests.Session()
session.headers.update({"User-Agent": USER_AGENT})


def character_names() -> list:
    with open(CHARACTER_LIST_PATH, encoding="utf-8") as file:
        return [character["name"] for character in json.load(file)]


# "armor king" and "armor-king" both match "Armor King"
def _match_key(name: str) -> str:
    return name.strip().lower().replace("-", " ")


# the name as the character list spells it, so the wavu page title is correct
def to_character_name(name: str) -> str:
    by_key = {_match_key(character): character for character in character_names()}
    key = _match_key(name)
    if key not in by_key:
        sys.exit("Unknown character '" + name + "'. Run without arguments to download all of them.")
    return by_key[key]


# "Armor King" -> "armor-king.txt"
def to_file_name(character: str) -> str:
    return _match_key(character).replace(" ", "-") + ".txt"


# returns a dict of character -> wikitext
def download_wikitext(characters: list) -> dict:
    title_to_character = {character + " movelist": character for character in characters}
    titles = list(title_to_character)
    wikitext_by_character = {}

    for offset in range(0, len(titles), TITLES_PER_REQUEST):
        params = {
            "action": "query",
            "prop": "revisions",
            "titles": "|".join(titles[offset:offset + TITLES_PER_REQUEST]),
            "rvslots": "main",
            "rvprop": "content",
            "format": "json",
            "formatversion": "2",
        }

        response = session.get(WAVU_API_URL, params=params, timeout=60)
        response.raise_for_status()
        content = response.json()

        if "error" in content:
            raise RuntimeError("wavu api returned an error: " + str(content["error"]))

        for page in content["query"]["pages"]:
            if page.get("missing"):
                print("  wavu has no page '" + page["title"] + "'", file=sys.stderr)
                continue
            character = title_to_character[page["title"]]
            wikitext_by_character[character] = page["revisions"][0]["slots"]["main"]["content"]

    return wikitext_by_character


parser = argparse.ArgumentParser(
    description="Download the wikitext of the movelist pages on wavu.wiki. "
                "Without arguments, every character is downloaded"
)
parser.add_argument("characters", nargs="*", help='Characters to download, for example "Anna" "Armor King"')
args = parser.parse_args()

characters = [to_character_name(name) for name in args.characters] if args.characters else character_names()
# keep the given order, but drop duplicates
characters = list(dict.fromkeys(characters))

os.makedirs(OUTPUT_DIR, exist_ok=True)

print("Downloading " + str(len(characters)) + " movelist(s) from wavu.wiki")
wikitext_by_character = download_wikitext(characters)

for character in characters:
    if character not in wikitext_by_character:
        continue
    output_file_path = os.path.join(OUTPUT_DIR, to_file_name(character))
    # newline="" keeps the "\n" line endings wavu uses, also on windows
    with open(output_file_path, "w", encoding="utf-8", newline="") as output_file:
        output_file.write(wikitext_by_character[character])
    print("  " + character + " -> " + output_file_path)
