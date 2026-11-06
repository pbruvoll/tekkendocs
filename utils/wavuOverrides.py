"""Adds the YouTube videos and extra tags of the override files to the moves.

The override files are downloaded from the <character-id>-override sheets by
scripts/downloadOverrides.py, to data/t8/overrides/<character-id>-override.csv.
This used to be done by applyOverride in app/utils/frameDataUtils.ts when the page
was loaded, and the rules here are the same.
"""

import csv
import os
import re

csvSep = ";"


def loadOverrides(overrideDir, charName):
    """Returns the rows of the override file of a character as dicts with lower case
    keys, or an empty list if the character has no override file"""
    filePath = os.path.join(overrideDir, charName + "-override.csv")
    if not os.path.isfile(filePath):
        # without it the csv gets no youtube videos, so do not let it pass unnoticed
        print("warning: no override file for " + charName + ", expected " + filePath)
        return []
    with open(filePath, "r", newline="", encoding="utf-8") as file:
        rows = list(csv.reader(file, delimiter=csvSep))
    if not rows:
        return []
    header = [name.strip().lower() for name in rows[0]]
    return [dict(zip(header, row)) for row in rows[1:]]


def tagKey(tag):
    """The key of a tag, the same as tagStringToRecord in app/utils/tagUtils.ts.
    "stp:SSR" -> "stp", "pc8-11" -> "pc", "pc?~" -> "pc" """
    if ":" in tag:
        return tag.split(":", 1)[0]
    return re.split(r"(?<=[A-Za-z])(?=\d)", tag, maxsplit=1)[0].replace("~", "", 1).replace("?", "", 1)


def mergeTags(tags, overrideTags):
    """A tag of the override replaces the tag of the move with the same key"""
    tagsByKey = {}
    for tag in (tags or "").split() + overrideTags.split():
        tagsByKey[tagKey(tag)] = tag
    return " ".join(tagsByKey.values())


def applyOverrides(moves, overrides, charName=""):
    """Sets yt_video, yt_start and yt_end and merges the tags of the moves which have
    an override, matched by command or by wavu id. A video is also used for the moves
    right before it that it starts with, so the video of 1,1,2 is also used for 1,1"""
    byCommand = {}
    byWavuId = {}
    for override in overrides:
        if not override.get("yt video") and not override.get("tags"):
            continue
        if override.get("command"):
            byCommand[override["command"]] = override
        if override.get("wavu id"):
            byWavuId[override["wavu id"]] = override

    matchedCommands = set()
    matchedWavuIds = set()
    for index, move in enumerate(moves):
        override = byCommand.get(move.get("input", "")) or byWavuId.get(move.get("id", ""))
        if not override:
            continue
        matchedCommands.add(override.get("command"))
        matchedWavuIds.add(override.get("wavu id"))
        if override.get("yt video"):
            move["yt_video"] = override["yt video"]
            move["yt_start"] = override.get("yt start", "")
            move["yt_end"] = override.get("yt end", "")
            prevIndex = index - 1
            while (
                prevIndex >= 0
                and not moves[prevIndex].get("yt_video")
                and move.get("input", "").startswith(moves[prevIndex].get("input", ""))
            ):
                moves[prevIndex]["yt_video"] = move["yt_video"]
                moves[prevIndex]["yt_start"] = move["yt_start"]
                moves[prevIndex]["yt_end"] = move["yt_end"]
                prevIndex -= 1
        if override.get("tags"):
            move["tags"] = mergeTags(move.get("tags", ""), override["tags"])

    # a row can be in the sheet twice, then the last one is used and the first is not
    # an error, so they are compared by command and wavu id
    for override in overrides:
        if not override.get("yt video") and not override.get("tags"):
            continue
        command = override.get("command")
        wavuId = override.get("wavu id")
        if not (command and command in matchedCommands) and not (wavuId and wavuId in matchedWavuIds):
            print(
                "warning: " + charName + " override does not match any move: "
                + override.get("wavu id", "") + " / " + override.get("command", "")
            )
