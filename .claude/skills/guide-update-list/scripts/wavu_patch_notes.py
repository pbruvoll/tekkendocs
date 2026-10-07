"""Prints the Tekken 8 patch notes from wavu.wiki that apply to one character.

Usage: python wavu_patch_notes.py <character-id> [--since <version>]

  <character-id>  tekkendocs id, e.g. claudio, jack-8, devil-jin
  --since         only patches newer than this version, e.g. 2.03 or 03.02.01
                  (the guide's GameVersion; ',' is accepted as separator)

For every Tekken 8 patch newer than --since (oldest first) it prints the
character's own section and the patch's Common section (system changes).

wavu's normal pages are behind a Cloudflare challenge, but the MediaWiki API
is not, so everything is read through api.php.
"""

import json
import re
import sys
import urllib.parse
import urllib.request

API = "https://wavu.wiki/w/api.php"
T8_CHRONOLOGY = "chronology=Patches (Tekken 8)"


def api(params):
    params = {**params, "format": "json"}
    request = urllib.request.Request(
        API + "?" + urllib.parse.urlencode(params),
        headers={"User-Agent": "tekkendocs-guide-update-list"},
    )
    with urllib.request.urlopen(request) as response:
        return json.load(response)


def versionTuple(text):
    parts = [int(p) for p in re.findall(r"\d+", text.replace(",", "."))]
    return tuple((parts + [0, 0, 0])[:3])


def normalize(name):
    return re.sub(r"[^a-z0-9]", "", name.lower())


def patchPages():
    titles = []
    params = {"action": "query", "list": "allpages", "apprefix": "Version_", "aplimit": "500"}
    while True:
        data = api(params)
        titles += [p["title"] for p in data["query"]["allpages"]]
        if "continue" not in data:
            break
        params.update(data["continue"])
    return titles


def pageContents(titles):
    contents = {}
    for i in range(0, len(titles), 50):
        data = api({
            "action": "query",
            "prop": "revisions",
            "rvprop": "content",
            "rvslots": "main",
            "titles": "|".join(titles[i:i + 50]),
        })
        for page in data["query"]["pages"].values():
            contents[page["title"]] = page["revisions"][0]["slots"]["main"]["*"]
    return contents


def sections(content):
    """Yields (heading, text) for every level-2 section."""
    parts = re.split(r"^==([^=].*?)=*\s*$", content, flags=re.M)
    for i in range(1, len(parts), 2):
        yield parts[i].strip(" []"), parts[i + 1].strip()


def matchesCharacter(heading, characterId):
    target = normalize(characterId)
    return any(normalize(name) == target for name in heading.split("/"))


def main():
    args = sys.argv[1:]
    if not args or args[0].startswith("-"):
        print(__doc__)
        sys.exit(1)
    characterId = args[0]
    since = versionTuple(args[args.index("--since") + 1]) if "--since" in args else (0, 0, 0)

    titles = [t for t in patchPages() if versionTuple(t) > since]
    contents = pageContents(titles)
    patches = sorted(
        (t for t in titles if T8_CHRONOLOGY in contents.get(t, "")),
        key=versionTuple,
    )

    print(f"Tekken 8 patches newer than {'.'.join(map(str, since))}: {', '.join(patches) or 'none'}\n")
    for title in patches:
        url = "https://wavu.wiki/t/" + title.replace(" ", "_")
        own = [text for heading, text in sections(contents[title]) if matchesCharacter(heading, characterId)]
        common = [text for heading, text in sections(contents[title]) if normalize(heading) in ("common", "general", "generalchanges")]
        print(f"########## {title}  ({url})")
        print(f"--- {characterId} ---")
        print("\n\n".join(own) if own else "(no changes)")
        if common:
            print("--- Common ---")
            print("\n\n".join(common))
        print()


if __name__ == "__main__":
    main()
