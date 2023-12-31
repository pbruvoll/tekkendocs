from difflib import SequenceMatcher
from heapq import nlargest as _nlargest

from src.resources import const
import os, json

base_path = os.path.dirname(__file__)


def get_movelist(character_name: str) -> dict:
    os.path.abspath(os.path.join(base_path, "..", "json_movelist", character_name + ".json"))
    filepath = os.path.abspath(os.path.join(base_path, "..", "json_movelist", character_name + ".json"))
    with open(filepath, encoding='utf-8') as move_file:
        move_file_contents = json.loads(move_file.read())
        return move_file_contents


def _simplify_input(input: str) -> str:
    """Removes bells and whistles from the move_input"""
    input = input.strip().lower()
    input = input.replace("rage", "r.")
    input = input.replace("heat", "h.")

    for old, new in const.REPLACE.items():
        input = input.replace(old, new)

    # cd works, ewgf doesn't, for some reason
    if input[:2].lower() == 'cd' and input[:3].lower() != 'cds':
        input = input.lower().replace('cd', 'fnddf')
    if input[:2].lower() == 'wr':
        input = input.lower().replace('wr', 'fff')
    return input


def _is_command_in_alias(command: str, item: dict) -> bool:
    if 'alias' in item:
        aliases = item['alias']
        for alias in aliases:
            if _simplify_input(command) == _simplify_input(alias):
                return True
    return False


def get_move(input: str, character_movelist: dict):
    result = [entry for entry in character_movelist if _simplify_input(entry["input"]) == _simplify_input(input)]
    if result:
        result[0]['input'] = result[0]['input'].replace("\\", "")
        return result[0]
    else:
        result = list(filter(lambda x: (_is_command_in_alias(input, x)), character_movelist))
        if result:
            result[0]['input'] = result[0]['input'].replace("\\", "")
            return result[0]
        return {}


def _correct_move_type(move_type: str) -> str:
    for k in const.MOVE_TYPES.keys():
        if move_type in const.MOVE_TYPES[k]:
            return k


def get_by_move_type(move_type: str, move_list: dict) -> list:
    """Gets a list of moves that match move_type from local_json
    returns a list of move Commands if finds match(es), else empty list"""
    move_type = _correct_move_type(move_type.lower()).lower()
    moves = list(filter(lambda x: (move_type in x["notes"].lower()), move_list))

    if moves:
        result = []
        for move in moves:
            result.append(move['input'])
        return list(set(result))
    else:
        return []


def _get_close_matches_indexes(word, possibilities, n=3, cutoff=0.6):
    """Use SequenceMatcher to return a list of the indexes of the best
    "good enough" matches. word is a sequence for which close matches
    are desired (typically a string).
    possibilities is a list of sequences against which to match word
    (typically a list of strings).
    Optional arg n (default 3) is the maximum number of close matches to
    return.  n must be > 0.
    Optional arg cutoff (default 0.6) is a float in [0, 1].  Possibilities
    that don't score at least that similar to word are ignored.
    """

    if not n > 0:
        raise ValueError("n must be > 0: %r" % (n,))
    if not 0.0 <= cutoff <= 1.0:
        raise ValueError("cutoff must be in [0.0, 1.0]: %r" % (cutoff,))
    result = []
    s = SequenceMatcher()
    s.set_seq2(word)
    for idx, x in enumerate(possibilities):
        s.set_seq1(x)
        if s.real_quick_ratio() >= cutoff and \
                s.quick_ratio() >= cutoff and \
                s.ratio() >= cutoff:
            result.append((s.ratio(), idx))

    # Move the best scorers to head of list
    result = _nlargest(n, result)

    # Strip scores for the best n matches
    return [x for score, x in result]


def get_similar_moves(input: str, move_list: dict) -> list[str]:
    command_list = []
    for entry in move_list:
        command_list.append(entry["input"])

    moves_indexes = _get_close_matches_indexes(_simplify_input(input), map(_simplify_input, command_list), 5, 0.7)

    result = []
    for index in moves_indexes:
        result.append(move_list[index])

    return result
