"""Parsing of the raw move data downloaded from wavu.wiki by utils/wavu-importer.

The importer only downloads the data and cleans up the html, so a move in the
json files holds nothing but its own values plus a "parent" pointing at the move
it continues. This module joins a move with its parent chain and derives the
values which do not exist in Wavu, such as tags and short notes.
"""

import enum
import re
from typing import Dict, List


class MoveCategory(enum.Enum):
    HEAT_BURST = "Heat_burst"
    HEAT_SMASH = "Heat_smash"
    HEAT_MOVE = "Heat_move"
    RAGE_ART = "Rage_art"
    KI_CHARGE = "Ki_charge"
    NEUTRAL = "Neutral"
    FORWARD = "Forward"
    DOWN_FORWARD = "Down_forward",
    DOWN = "Down",
    DOWN_BACK = "Down_back"
    BACK = "Back",
    UP_BACK = "Up_back",
    UP = "Up"
    UP_FORWARD = "Up_forward"
    RUNNING = "Running"
    THROW = "Throw"
    WHILE_RISING = "While_rising"
    SIDESTEP = "SIDESTEP"
    STANCE = "Stance"
    FULL_CROUCH = "Full_crouch"
    OTHER = "Other"

SORT_ORDER: Dict[MoveCategory, int] = {
    MoveCategory.HEAT_BURST: 3,
    MoveCategory.HEAT_MOVE: 5,
    MoveCategory.HEAT_SMASH: 10,
    MoveCategory.RAGE_ART: 20,
    MoveCategory.NEUTRAL: 30,
    MoveCategory.FORWARD: 40,
    MoveCategory.DOWN_FORWARD : 50,
    MoveCategory.DOWN : 60,
    MoveCategory.DOWN_BACK : 70,
    MoveCategory.BACK : 80,
    MoveCategory.UP_BACK: 90,
    MoveCategory.UP : 100,
    MoveCategory.UP_FORWARD : 110,
    MoveCategory.KI_CHARGE: 115,
    MoveCategory.OTHER: 116,
    MoveCategory.RUNNING: 117,
    MoveCategory.WHILE_RISING: 118,
    MoveCategory.SIDESTEP: 119,
    MoveCategory.FULL_CROUCH: 120,
    MoveCategory.STANCE: 121,
    MoveCategory.THROW: 130,
}


# the complete value of a move is the value of all its parents followed by its own value
def get_parent_value(field: str, move_id: str, moves_by_id: dict) -> str:
    if not move_id :
        return ""

    move = moves_by_id.get(move_id)
    if move is None :
        print("warning: could not find parent move " + move_id)
        return ""

    value = ""
    parent = move.get("parent", "")
    if parent :
        if "_" in parent :
            parent = parent.split("_")[0]
        value += get_parent_value(field, parent, moves_by_id)
    return value + move.get(field, "")


# same as get_parent_value, but keeps the value of each move as its own entry
def get_parent_values(field: str, move_id: str, moves_by_id: dict) -> List[str]:
    if not move_id :
        return []

    move = moves_by_id.get(move_id)
    if move is None :
        print("warning: could not find parent move " + move_id)
        return []

    values = []
    parent = move.get("parent", "")
    if parent :
        if "_" in parent :
            parent = parent.split("_")[0]
        values += get_parent_values(field, parent, moves_by_id)

    value = move.get(field, "")
    if value :
        values.append(value)
    return values


# last entry is always the input
def create_alias(input: str) -> List[str]:
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


def parse_notes(notes: str):
    lines = notes.split("\n")
    tags = []
    short_notes = []
    interrupt_frames = []
    chip_damages = []
    for line in lines :
        tag = get_tag(line)
        chip_damage = get_chip_damage(line)
        if tag :
            tags.append(tag)
        elif not is_pure_chip_line(line) :
            short_notes.append(line)
        # unlike get_tag, keep the "Whiffs vs ..." line in the notes since it
        # carries extra context (e.g. "from 1st block")
        steppable_tag = get_steppable_tag(line)
        if steppable_tag :
            tags.append(steppable_tag)
        frames = get_interrupt_frames(line)
        if frames is not None :
            interrupt_frames.append(frames)
        if chip_damage is not None :
            chip_damages.append(chip_damage)

    if interrupt_frames :
        # a move can have one interrupt note per part of the string. Keep the
        # slowest one, since that is usually value when blocking the move
        tags.append("intr:" + str(max(interrupt_frames)))

    if chip_damages :
        known = [damage for damage in chip_damages if damage >= 0]
        # keep the lowest value, since that is the one in normal state. The
        # heat and "after absorbing an attack in power crush state" variants
        # are always higher
        tags.append("chp:" + str(min(known)) if known else "chp")

    return ("\n".join(short_notes), " ".join(tags))


def get_steppable_tag(noteLine: str) :
    cleanLine = noteLine.replace("*", "").strip().lower()
    match = re.match(r'whiffs vs (ssr|ssl|swr|swl|ss)\b', cleanLine)
    if match :
        return "stp:" + match.group(1).upper()
    return None


def get_interrupt_frames(noteLine: str) :
    """Reads a line like "* Interrupt with i6 from 1st block" and returns 6"""
    if noteLine.strip().startswith("**") :
        # a ** sub bullet belongs to a cancel or a variation of the move above it,
        # so its frames say nothing about the move itself
        return None

    cleanLine = noteLine.replace("*", "").strip().lower()
    if not re.match(r'interrupt(?:able|ible)?\b', cleanLine) :
        return None

    # "i6", but also "3F" in the few notes which are written that way
    match = re.search(r'\bi(\d+)', cleanLine) or re.search(r'\b(\d+)f\b', cleanLine)
    if not match :
        # notes such as "Interrupt with i? from 4th block" have no known value
        return None
    return int(match.group(1))


# "6 chip damage on block" and "Deals chip damage", but also amounts followed by
# a parenthesis such as "Deals 8 (DA:11) chip damage on block"
chip_pattern = re.compile(r'(?:deals\s+)?(?:(\d+)\s+(?:\([^)]*\)\s+)?)?chip(?:\s+damage)?\b(.*)')
# what may follow the chip damage without saying anything the chp tag misses.
# The amount is sometimes given after the words instead of before them, either
# plain as in "Chip damage 2 (22%) on block", or in brackets as in
# "Chip damage on block (7)" and "Chip on block [9]"
chip_rest_pattern = re.compile(
    r'(?:\s+(?:on\s+block|(?P<amount>\d+)(?:\s+\(\d+%\))?|[(\[](?P<bracketed>\d+)[)\]]))*\.?')


def match_chip_line(noteLine: str) :
    if noteLine.strip().startswith("**") :
        # a ** sub bullet belongs to a cancel or a variation of the move above it,
        # so its chip damage says nothing about the move itself
        return None

    # only lines starting with the chip damage itself are matched, so that
    # conditional notes such as "-9 frame advantage and 8 chip damage on block
    # after absorbing an attack in power crush state" are left alone
    return chip_pattern.match(noteLine.replace("*", "").strip().lower())


def get_chip_damage(noteLine: str) :
    """Reads a line like "* 6 chip damage on block" and returns 6.
    Returns -1 when the line tells about chip damage without giving an amount,
    and None when the line is not about chip damage on block"""
    match = match_chip_line(noteLine)
    if not match :
        return None

    (amount, rest) = match.groups()
    if "on hit" in rest and "on block" not in rest :
        return None

    # chip damage which requires absorbing an attack in power crush state, or
    # which only happens in heat, says nothing about what the move does
    # normally. Only the part before a comma is checked, since a note like
    # "9 chip damage on block, +0 block advantage on attack absorption" does
    # tell the normal chip damage
    condition = rest.split(",")[0]
    # "absor" covers both "absorbing/absorbed" and the noun "absorption"
    if "absor" in condition or "heat" in condition :
        return None

    if amount :
        return int(amount)

    # "Chip damage 2 (22%) on block", "Chip damage on block (7)" and
    # "Chip on block [9]"
    rest_match = chip_rest_pattern.fullmatch(rest)
    if rest_match :
        amount_after = rest_match.group("amount") or rest_match.group("bracketed")
        if amount_after :
            return int(amount_after)

    return -1


def is_pure_chip_line(noteLine: str) :
    """True for lines which say nothing but the chip damage on block, since the
    chp tag then carries all the information of the line"""
    match = match_chip_line(noteLine)
    return bool(match) and bool(chip_rest_pattern.fullmatch(match.group(2)))


def get_tag(noteLine: str) :
    cleanLine = noteLine.replace("*", "").strip().lower()
    match cleanLine :
        case "rage art" :
            return "ra"
        case "floor break":
            return "fbr"
        case "spike" :
            return "spk"
        case "knee" :
            return "kne"
        case "elbow" :
            return "elb"
        case "head" :
            return "hed"
        case "shoulder" :
            return "shd"
        case "hip" :
            return "hip"
        case "weapon" :
            return "wpn"
        case "tornado" :
            return "trn"
        case "homing" :
            return "hom"
        case "heat smash" :
            return "hs"
        case "heat burst" :
            return "hb"
        case "heat engager" :
            return "he"
        case "balcony break" :
            return "bbr"
        case "reversal break":
            return "rbr"


    if cleanLine.startswith("wall crush") :
        return "wc"


    return None


def crush_to_note(crushList: list) :
    return "* " + "\n* ".join(crushList).replace("ps", "Parry state ").replace("pc", "Power crush ").replace("js", "Low crush ").replace("cs", "High crush ").replace("fs", "Floating state ")


def get_move_category(move: dict) -> MoveCategory:
    if(move["target"].startswith("t")) :
        return MoveCategory.THROW

    command = move["input"].lower();
    splitted = command.split(",");
    first = splitted[0]
    if(first.startswith("h.2+3")) :
        return MoveCategory.HEAT_SMASH
    if(first == "2+3") :
        return MoveCategory.HEAT_BURST
    if(first.startswith("h.")) :
        return MoveCategory.HEAT_MOVE
    if(first.startswith("r.")) :
        return MoveCategory.RAGE_ART
    if(first.startswith("1+2+3+4")) :
        return MoveCategory.KI_CHARGE
    if(first[:1].isdigit()) :
        return MoveCategory.NEUTRAL
    if(first.startswith("f+")) :
        return MoveCategory.FORWARD
    if(first.startswith("df+")) :
        return MoveCategory.DOWN_FORWARD
    if(first.startswith("d+")) :
        return MoveCategory.DOWN
    if(first.startswith("db+")) :
        return MoveCategory.DOWN_BACK
    if(first.startswith("b+")) :
        return MoveCategory.BACK
    if(first.startswith("ub+")) :
        return MoveCategory.UP_BACK
    if(first.startswith("u+")) :
        return MoveCategory.UP
    if(first.startswith("uf+")) :
        return MoveCategory.UP_FORWARD
    if(first.startswith("ws")) :
        return MoveCategory.WHILE_RISING
    if(first.startswith("ss")) :
        return MoveCategory.SIDESTEP
    if(first.startswith("fc")) :
        return MoveCategory.FULL_CROUCH
    if(command.startswith("f,f,f")) :
        return MoveCategory.RUNNING
    if(command.find(".") > -1) :
        return MoveCategory.STANCE


    return MoveCategory.OTHER


def sort_moves(move_list: List[dict]) -> List[dict] :
    # a trick to generate a string for sorting frames. + is replaced by _ just to make "+" sort after ","
    return sorted(move_list, key=lambda x: f'{SORT_ORDER[get_move_category(x)]:05d}' + x["input"].replace("1+2", "5").replace("1+4", "6").replace("2+3", "7").replace("3+4", "8").replace("+", "|"))


def parse_move(move: dict, moves_by_id: dict) -> dict:
    parsed = dict(move)
    parent = move.get("parent", "")

    input = get_parent_value("input", parent, moves_by_id) + move.get("input", "")
    alias = []
    if "_" in input:
        result = create_alias(input)
        input = result[-1]
        alias = result[0:(len(result) - 1)]
    parsed["input"] = input
    # the aliases derived from the input replace the alias field of wavu, which we do not use
    parsed["alias"] = alias

    # a move can have several names, given by the importer as a "*" prefixed list
    name = move.get("name", "")
    if name.startswith("*") :
        parsed["name"] = " / ".join([part.strip() for part in name.split("*") if part.strip()])

    targetValues = get_parent_values("target", parent, moves_by_id)
    if move.get("target") :
        targetValues.append(move["target"])
    parsed["target"] = ", ".join([item.lstrip(',') for item in targetValues])

    damageValues = get_parent_values("damage", parent, moves_by_id)
    if move.get("damage") :
        damageValues.append(move["damage"])
    parsed["damage"] = ", ".join([item.lstrip(',') for item in damageValues])

    startup = move.get("startup", "")
    startupValues = get_parent_values("startup", parent, moves_by_id)
    if(len(startupValues) > 0) :
        startup = startupValues[0] + ", " + ("," if len(startupValues) > 1 else "") + (startup[1:] if startup.startswith(",") else startup)
    parsed["startup"] = startup

    # the importer normalizes crush to a space separated list, such as "js9~13 pc7~16"
    crush = move.get("crush", "")
    crushList = [part for part in crush.split(" ") if part]

    notes = move.get("notes", "")
    (short_notes, tags) = parse_notes(notes)
    parsed["tags"] = " ".join(item for item in [tags, crush] if item)
    if(crush) :
        notes = "\n".join([notes, crush_to_note(crushList)])
    parsed["notes"] = notes.strip()
    parsed["short_notes"] = short_notes

    return parsed


# joins each move with its parent chain, derives notes and tags, and sorts the
# moves the same way they are sorted on the site
def parse_movelist(move_list: List[dict]) -> List[dict]:
    moves_by_id = {}
    for move in move_list :
        moves_by_id.setdefault(move["id"], move)

    return sort_moves([parse_move(move, moves_by_id) for move in move_list])
