"""Builds the Tekken 6 frame data csv files from frame data wikis.

The move list, with the commands, hit levels, notes and throws, comes from:
- inatekken (wiki.livedoor.jp/inatekken), from the Wayback Machine, which has every character
  on a page for the basic moves, one for the character specific moves and one for the throws.
  Commands are in japanese notation (LP/RP/LK/RK, numpad directions, japanese stance names)
  and are converted to the wavu notation used for the T8 frame data, e.g. "f,F+2", "FC.df+1", "FLA.3"
- seesaawiki.jp/w/tekken_6_br, in the same notation, for Marduk, whose archived inatekken page is almost empty

The japanese wikis are for the arcade version of Tekken 6 BR, and the frames of the console version, which is
played today, are often different. So the damage and frames are taken from the sources for the console version,
in this order, for the moves they have:
- wavu.wiki, which is tested in the game
- the Avoiding the Puddle data in data/t6/atp (from scripts/convertT6AvoidingThePuddle.py). Its commands are machine
  translated from a japanese wiki, but its frames are for the console version
- the japanese wikis, for the moves the other sources do not have

Moves which can not be fully converted are printed, so they can be fixed by adding to the dictionaries below.

Values which are wrong in the sources are fixed in manualFixes, so the script can be run again.
The csv files use the same notation as the T8 frame data, except for knockdowns and launches
without frames, which are written as KND and JG as in the T7 frame data.

Usage: python scripts/buildT6FrameData.py [cache folder for the downloaded pages]
Output: data/t6/framedata/<character-id>.csv
"""

import csv
import html
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.error
import urllib.request
from html.parser import HTMLParser

CSV_SEP = ";"
HEADERS = [
    "Command",
    "Hit level",
    "Damage",
    "Start up frame",
    "Block frame",
    "Hit frame",
    "Counter hit frame",
    "Notes",
]
SEESAA_URL = "https://seesaawiki.jp/w/tekken_6_br/d/"
# inatekken is offline, so the pages are read from the Wayback Machine
INATEKKEN_PAGE = "wiki.livedoor.jp/inatekken/d/"
WAYBACK_CDX_URL = "http://web.archive.org/cdx/search/cdx"
WAYBACK_URL = "http://web.archive.org/web/"
WAVU_API_URL = "https://wavu.wiki/w/api.php"
USER_AGENT = "tekkendocs-frame-data/1.0 (https://tekkendocs.com)"

repoRoot = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
outputRoot = os.path.join(repoRoot, "data", "t6", "framedata")
# the data from Avoiding the Puddle, made by scripts/convertT6AvoidingThePuddle.py
avoidingThePuddleRoot = os.path.join(repoRoot, "data", "t6", "atp")

# character id -> japanese page name on seesaawiki. Christie and Eddy share one page
seesaaPages = {
    "anna": "アンナ・ウィリアムズ",
    "armor-king": "アーマーキング",
    "asuka": "風間　飛鳥",
    "baek": "白 頭山 (ペク・トーサン)",
    "bob": "ボブ",
    "bruce": "ブルース・アーヴィン",
    "bryan": "ブライアン・フューリー",
    "christie": "クリスティ・モンテイロ、エディ・ゴルド",
    "devil-jin": "デビル仁",
    "dragunov": "セルゲイ・ドラグノフ",
    "eddy": "クリスティ・モンテイロ、エディ・ゴルド",
    "feng": "フェン・ウェイ",
    "ganryu": "巌竜",
    "heihachi": "三島　平八",
    "hwoarang": "花郎 （ファラン)",
    "jack-6": "JACK-6",
    "julia": "ジュリア・チャン",
    "kazuya": "三島　一八",
    "king": "キング",
    "kuma": "クマ・パンダ",
    "lars": "ラース・アレクサンダーソン",
    "law": "マーシャル・ロウ",
    "lee": "李 超狼 (リー・チャオラン)",
    "lei": "雷 武龍 (レイ・ウーロン)",
    "leo": "レオ",
    "lili": "リリ",
    "marduk": "マードック",
    "miguel": "ミゲル・カバジェロ・ロホ",
    "nina": "ニーナ・ウィリアムズ",
    "paul": "ポール・フェニックス",
    "raven": "レイヴン",
    "roger-jr": "ロジャーJr.",
    "steve": "スティーブ・フォックス",
    "wang": "王 椋雷 (ワン・ジンレイ)",
    "xiaoyu": "凌 暁雨 (リン・シャオユウ)",
    "yoshimitsu": "吉光",
    "zafina": "ザフィーナ",
}
# the Tekken 6 movelists on wavu, which are being written, so they fill in more frames over time
wavuPages = {
    characterId: f"{name} movelist (Tekken 6)"
    for characterId, name in {
        "alisa": "Alisa",
        "anna": "Anna",
        "armor-king": "Armor King",
        "asuka": "Asuka",
        "baek": "Baek",
        "bob": "Bob",
        "bruce": "Bruce",
        "bryan": "Bryan",
        "christie": "Christie",
        "devil-jin": "Devil Jin",
        "dragunov": "Dragunov",
        "eddy": "Eddy",
        "feng": "Feng",
        "ganryu": "Ganryu",
        "heihachi": "Heihachi",
        "hwoarang": "Hwoarang",
        "jin": "Jin",
        "julia": "Julia",
        "kazuya": "Kazuya",
        "king": "King",
        "kuma": "Kuma",
        "lars": "Lars",
        "law": "Law",
        "lee": "Lee",
        "lei": "Lei",
        "leo": "Leo",
        "lili": "Lili",
        "marduk": "Marduk",
        "miguel": "Miguel",
        "nina": "Nina",
        "paul": "Paul",
        "raven": "Raven",
        "roger-jr": "Roger Jr.",
        "steve": "Steve",
        "wang": "Wang",
        "xiaoyu": "Xiaoyu",
        "yoshimitsu": "Yoshimitsu",
        "zafina": "Zafina",
    }.items()
}

# character id -> japanese name on inatekken. Each character has a page for the basic moves and
# one for the character specific moves, named <name>基本技TBR and <name>固有技TBR (TBR = Tekken 6 BR)
inatekkenNames = {
    "alisa": "アリサ",
    "anna": "アンナ",
    "armor-king": "アーマーキング",
    "asuka": "飛鳥",
    "baek": "ペク",
    "bob": "ボブ",
    "bruce": "ブルース",
    "bryan": "ブライアン",
    "christie": "クリスティ/エディ",
    "devil-jin": "デビル仁",
    "dragunov": "ドラグノフ",
    "eddy": "クリスティ/エディ",
    "feng": "フェン",
    "ganryu": "巌竜",
    "heihachi": "平八",
    "hwoarang": "ファラン",
    "jack-6": "ジャック6",
    "jin": "仁",
    "julia": "ジュリア",
    "kazuya": "一八",
    "king": "キング",
    "kuma": "クマ/パンダ",
    "lars": "ラース",
    "law": "ロウ",
    "lee": "リー",
    "lei": "レイ",
    "leo": "レオ",
    "lili": "リリ",
    "marduk": "マードック",
    "miguel": "ミゲル",
    "nina": "ニーナ",
    "paul": "ポール",
    "raven": "レイヴン",
    "roger-jr": "ロジャーJr.",
    "steve": "スティーブ",
    "wang": "ワン",
    "xiaoyu": "シャオユウ",
    "yoshimitsu": "吉光",
    "zafina": "ザフィーナ",
}
inatekkenSections = ("基本技", "固有技")
# the archived page with the character specific moves of Marduk is almost empty, so the seesaawiki is used
seesaaPreferred = {"marduk"}

# character id -> japanese stance name, as written before 中に ("while in"), -> (stance code, stance name)
stances = {
    # the codes are the same as in the T8 frame data, where the stance is in T8
    "anna": {"CJ": ("CJM", "Chaos Judgment")},
    "baek": {"フラミンゴ": ("FLA", "Flamingo")},
    "bob": {"SB": ("SPB", "Spinner Ball")},
    "bruce": {"BS": ("MT", "Muay Thai")},
    "christie": {"逆立ち": ("HSP", "Handstand"), "座り": ("RLX", "Relax")},
    "devil-jin": {"飛空": ("FLY", "Flight")},
    "eddy": {"逆立ち": ("HSP", "Handstand"), "座り": ("RLX", "Relax")},
    "ganryu": {"股割り": ("SPL", "Splits"), "不知火型": ("SHI", "Shiranui")},
    "heihachi": {"奈落払い": ("HSW", "Hell Sweep"), "構えホールド": ("KAM", "Kamae"), "構え": ("KAM", "Kamae")},
    "hwoarang": {"LF": ("LFS", "Left Flamingo"), "RF": ("RFS", "Right Flamingo"), "右構え": ("RFF", "Right Foot Forward")},
    "jack-6": {"SD": ("SIT", "Sit Down"), "コサック": ("CSK", "Cossack")},
    "julia": {"転身歩": ("ESP", "Evasive Spin"), "背面取り": ("BKT", "Back Take")},
    "king": {"アリキック": ("ALI", "Ali Kicks"), "JSソバット": ("JSS", "Jaguar Step Sobat")},
    "kuma": {"ハンティングスタイル": ("HBS", "Hunting Bear"), "HS": ("HBS", "Hunting Bear"), "前転": ("ROL", "Roll")},
    "law": {
        "チャージドラゴン": ("DCH", "Dragon Charge"),
        "CD2": ("DCH2", "Dragon Charge 2"),
        "CD": ("DCH", "Dragon Charge"),
        "FS": ("FKS", "Fake Step"),
        "DF": ("DF", "Dragon Fake"),
    },
    "lars": {"SE": ("SEN", "Silent Entry"), "DE": ("DEN", "Dynamic Entry")},
    "lee": {
        "HMS": ("HMS", "Hitman"),
        "HS": ("HMS", "Hitman"),
        "MS": ("MS", "Mist Step"),
        "IK": ("IK", "Infinite Kicks"),
        "SW": ("SW", "Silver Whip"),
    },
    # the stances below are written with these abbreviations on inatekken
    "alisa": {
        "BT": ("SBT", "Single Boot"),
        "DF背向け": ("DES.BT", "Destructive Form, back turned"),
        "DF": ("DES", "Destructive Form"),
        "DB": ("DBT", "Dual Boot"),
        "CW": ("CLK", "Clockwork"),
    },
    "jin": {"残心･弐": ("ZEN", "Zanshin"), "三戦立ち": ("SAN", "Sanchin")},
    "lei": {
        "酔歩": ("DRU", "Drunken Walk"),
        "頭側うつ伏せ 寝構え": ("FDFA", "Play Dead, face down, feet away"),
        "足側うつ伏せ 寝構え": ("FDFT", "Play Dead, face down, feet towards"),
        # a typo of 寝構え on the wiki
        "足側うつ伏せ 寝構": ("FDFT", "Play Dead, face down, feet towards"),
        "頭側仰向け 寝構え": ("FUFA", "Play Dead, face up, feet away"),
        "足側仰向け 寝構え": ("FUFT", "Play Dead, face up, feet towards"),
        "仰向け寝構え": ("FU", "Play Dead, face up"),
        "寝構え": ("PLD", "Play Dead"),
        "寝構": ("PLD", "Play Dead"),
        "妃睡鳥": ("JAD", "Jade"),
        "蛇の構え": ("SNK", "Snake"),
        "龍の構え": ("DRG", "Dragon"),
        "豹の構え": ("PAN", "Panther"),
        "虎の構え": ("TGR", "Tiger"),
        "鶴の構え": ("CRA", "Crane"),
        "旋風連脚": ("RAZ", "Razor Rush"),
        "背刃落": ("HJR", "Haijinraku"),
    },
    "leo": {"金鶏独立": ("KNK", "Kinkei"), "金鶏": ("KNK", "Kinkei"), "仆歩": ("BOK", "Bokuho")},
    "marduk": {
        "クラウチングスタイル": ("VTS", "Vale Tudo"),
        "クラウチング": ("VTS", "Vale Tudo"),
        "マウントポジション": ("MNT", "Mount"),
    },
    "miguel": {"SS": ("SAV", "Savage")},
    "raven": {"HF": ("HAZ", "Haze")},
    "steve": {
        "WL": ("LWV", "Weaving Left"),
        "WR": ("RWV", "Weaving Right"),
        "LDK": ("LDK", "Long Ducking"),
        "LD": ("LDK", "Long Ducking"),
        "DUK": ("DCK", "Ducking"),
        "DK": ("DCK", "Ducking"),
        # "UK" is a typo of DUK on the wiki, for the ducking combos
        "UK": ("DCK", "Ducking"),
        "QT": ("QT", "Quick Turn"),
        "DR": ("DR", "Dempsey Roll"),
        "PS": ("PAB", "Peekaboo"),
        "スウェー": ("SWY", "Sway"),
        "FLKジャブ": ("FLK", "Flicker"),
        "FLK": ("FLK", "Flicker"),
    },
    "wang": {"鷂子入林": ("YSR", "Hawk Into Forest")},
    "xiaoyu": {"鳳凰の構え": ("AOP", "Art of Phoenix"), "擺歩": ("HYP", "Hypnotist")},
    "yoshimitsu": {
        "金打": ("KIN", "Kincho"),
        "無想": ("MED", "Meditation"),
        "地雷刃": ("JIR", "Jirai"),
        "地雷猛馬": ("JIR", "Jirai"),
        "千覚": ("IND", "Indian Stance"),
        "卍あぐら": ("IND", "Indian Stance"),
        "卍蜻蛉": ("DGF", "Dragonfly"),
        "無刀ノ極": ("NSS", "No Sword Stance"),
        "毒溜": ("PSN", "Poison Wind"),
    },
    "zafina": {"MT": ("TRT", "Tarantula"), "MSC": ("SCR", "Scarecrow"), "MM": ("MNT", "Mantis")},
}

# (character id, japanese command) -> (command, note), for the commands which are a description
commandOverrides = {
    ("bruce", "66RP出始めに 相手のパンチ技"): ("f,F+2", "Parries punches at the start of the move"),
    ("bryan", "ボディアッパー ヒット時4or6〜RP"): ("b~2 or f~2", "After Body Upper hits"),
    ("dragunov", "236RKヒット中 LP,LK,RK,RP"): ("qcf+4,1,3,4,2", "During qcf+4 on hit"),
    ("dragunov", "236RKヒット中 RP,RK,LK,LP"): ("qcf+4,2,4,3,1", "During qcf+4 on hit"),
    ("kazuya", "6n23〜RK, 1発目RKから 16F後にRK"): ("f,n,d,df+4,4", "The second kick 16 frames after the first"),
    ("kazuya", "6n23RK, 1発目RKから 16F後にRK"): ("f,n,d,df+4,4", "The second kick 16 frames after the first"),
    ("yoshimitsu", "卍芟2〜5発目 中に2WK"): ("d+3+4", "During the 2nd to 5th hit of Manji Kari"),
    ("yoshimitsu", "葛1発目中 4LKor4RK"): ("b+3", "During the 1st hit of Kazura\nAlt: b+4"),
    ("yoshimitsu", "葛2〜5発目中 4LKor4RK"): ("b+3", "During the 2nd to 5th hit of Kazura\nAlt: b+4"),
    ("lee", "【LK,LK】ヒット orガード時RK"): ("3~3,4", "On hit or block"),
    ("lee", "【LK,LK】ヒットorガード時にRK"): ("3~3,4", "On hit or block"),
    ("lee", "SW中nコマンド"): ("SW.n", ""),
    ("lei", "寝構え or ダウン中にRP"): ("PLD.2", "Alt: FD.2"),
    ("steve", "スウェー中にWP or+2,4,6,8方向"): ("SWY.1+2", "Then d, b, f or u"),
    ("yoshimitsu", "卍芟2〜5発目 中に6RK"): ("f+4", "During the 2nd to 5th hit of Manji Kari"),
    ("yoshimitsu", "葛1〜5発目中 LKorRK"): ("3 or 4", "During the 1st to 5th hit of Kazura"),
}

# (character id, converted command) -> {column: value}, for values which are wrong or unclear in the sources.
# Columns: 0 command, 2 damage, 3 startup, 4 block, 5 hit, 6 counter hit, 7 notes, "replaceNote": (old note, new note)
# The values which were fixed for the earlier sources are correct on inatekken, so there are no fixes now
manualFixes = {}
GROUNDED_NOTE = "Hits grounded opponent"

# phrases which start a command with a stance like prefix, for all characters
commonPrefixes = [
    (r"背向け?しゃがみ中に?", "BT.FC."),
    (r"(右構え )?背向け中に?", "BT."),
    (r"左構え ", ""),
    (r"挑発後に", "TNT."),
    (r"立ち途中に?", "ws"),
    (r"しゃがみ中に?", "FC."),
    (r"右横移動中に?", "SSR."),
    (r"左横移動中に?", "SSL."),
    (r"横?(移動|避け)中に?", "SS."),
    (r"走り中に?", "RUN"),
    (r"(うつ伏せ相手頭側|うつ伏せ) ?ダウン中に?", "FDFA."),
    (r"(仰向け相手頭側|仰向け) ?ダウン中に?", "FUFA."),
    (r"ダウン中に?", "FD."),
]
# notes for japanese phrases, which are removed from the command
commandNotes = [
    (r"相手ダウン中に?", "Hits grounded opponent"),
    (r"相手の(パンチ)?攻撃に?あわせて", "Reversal"),
    (r"ヒット&ガード時", "On hit or block"),
    (r"\(?正面ヒット時\)?", "On hit from the front"),
    (r"\(?ヒット時のみ\)?|\(?ヒット時\)?", "On hit"),
    (r"\(?(相手)?ガード時\)?", "On block"),
    (r"\(?何発目でも\)?", "From any hit"),
    (r"\(上方向以外\)", "Not up"),
    (r"何もしない", "Do nothing"),
    (r"空投", "Air throw"),
    (r"レバー任意方向", "Any direction"),
    (r"任意ボタン", "Any button"),
    (r"奇数F", "On odd frames"),
    (r"偶数F", "On even frames"),
    (r"\(?(捌き|パリング|消力)成功時に?\)?", "After a successful parry"),
    (r"成功時に?", "On success"),
    (r"\(?ジャスト\)?", "Just frame"),
    (r"最大ホールド|最大伸ばし", "Fully held"),
    (r"気合い?溜め(中|後)に?", "During charge"),
    (r"空振り時に?", "On whiff"),
    (r"\(?(\d)(〜\d)?発目\)?", r"From hit \1"),
    (r"着地際", "On landing"),
    (r"着地後", "After landing"),
    (r"\(?空中相手\)?", "Against an airborne opponent"),
    (r"特定技(から|後)", "After specific moves"),
    (r"\((\d)回転\)", r"Input rotated \1 times"),
]
# phrases which mean the command continues from the previous row
previousMovePattern = r"^(上記連携(から|中に)|各連係中)"
# alternatives which are not a command, e.g. "or various transitions"
ignoredAlternatives = r"各種(連携技?|移行技|固有技)〜?|etc,?"

buttons = {"LP": 1, "RP": 2, "LK": 3, "RK": 4, "WP": (1, 2), "WK": (3, 4)}
directions = {"1": "db", "2": "d", "3": "df", "4": "b", "6": "f", "7": "ub", "8": "u", "9": "uf", "n": "n", "5": "n"}
motions = {"236": "qcf", "214": "qcb", "41236": "hcf", "63214": "hcb", "66": "f,F", "666": "f,f,F", "6n23": "f,n,d,df"}

# 特殊 ("special") is an input which does not hit, e.g. a stance transition, so it has no hit level as in the T8 data
hitLevels = {"上": "h", "中": "m", "下": "l", "特中": "sm", "特殊": "", "特": "", "ガ不": "!", "投げ": "t", "投": "t", "P": "", "捌き": "", "捌": ""}
hitLevelNotes = {
    "CS": "High crush",
    "JS": "Low crush",
    "打投": "Hit throw",
    "捌き": "Parry",
    "捌": "Parry",
    "ガ崩": "Guard break",
    "ダウン攻撃": "Hits grounded opponent",
    "返し技": "Reversal",
    "返し": "Reversal",
}
# letters after the startup frame, which describe the state after the move
recoveryNotes = {
    "BS": "Recovers back turned crouching",
    "S": "Recovers crouching",
    "B": "Recovers back turned",
    "D": "Recovers grounded",
    "G": "Can block during recovery",
    "J": "Low crush",
    "JS": "Low crush",
}
# reaction codes in the block, hit and counter hit columns -> wavu suffix
knockdownSuffix = "d"
launchSuffix = "a"
reactionSuffixes = {"G": "g", "S": "c", "GS": "cg", "SG": "cg", "CG": "cg", "Y": "s", "YG": "sg", "ND": "s", "SM": "d", "B": "d"}
# the values without a frame number, the same as in the T7 frame data
noFrameValues = {knockdownSuffix: "KND", launchSuffix: "JG"}


def toNoFrameValue(value):
    """Writes knockdowns and launches without frames the same way, e.g. "KD" => "KND", "+?a" => "JG"."""
    return re.sub(r"^\+\?a$", "JG", re.sub(r"\bKD\b", "KND", value))

problems = []
# throws which can not be written as a command, see convertThrowRows
skippedThrows = []


def fail(message):
    print("ERROR: " + message)
    sys.exit(1)


def download(url, cachePath):
    if cachePath and os.path.isfile(cachePath):
        with open(cachePath, "rb") as file:
            return file.read()
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    # the Wayback Machine is sometimes slow or refuses connections for a while after many requests,
    # so a failed connection is tried again after waiting longer each time
    attempts = 6
    for attempt in range(attempts):
        try:
            content = urllib.request.urlopen(request, timeout=120).read()
            break
        except urllib.error.HTTPError:
            raise
        except OSError:
            if attempt == attempts - 1:
                raise
            time.sleep(15 * (attempt + 1))
    time.sleep(0.5)
    if cachePath:
        with open(cachePath, "wb") as file:
            file.write(content)
    return content


class TableParser(HTMLParser):
    """Collects the rows of every table, with the heading above the table."""

    def __init__(self):
        super().__init__()
        self.tables = []
        self.row = None
        self.cell = None
        self.inHeading = False
        self.heading = ""

    def handle_starttag(self, tag, attrs):
        if tag == "table":
            self.tables.append({"heading": self.heading, "rows": []})
        elif tag == "tr" and self.tables:
            self.row = []
        elif tag in ("td", "th") and self.row is not None:
            self.cell = ""
        elif tag in ("h2", "h3", "h4", "h5"):
            self.inHeading = True
            self.heading = ""
        elif tag == "br" and self.cell is not None:
            self.cell += " "

    def handle_endtag(self, tag):
        if tag in ("td", "th") and self.cell is not None:
            self.row.append(re.sub(r"\s+", " ", self.cell).strip())
            self.cell = None
        elif tag == "tr" and self.row is not None:
            if any(self.row):
                self.tables[-1]["rows"].append(self.row)
            self.row = None
        elif tag in ("h2", "h3", "h4", "h5"):
            self.inHeading = False

    def handle_data(self, data):
        if self.cell is not None:
            self.cell += data
        elif self.inHeading:
            self.heading += data.strip()


def seesaaMoveRows(pageHtml):
    """Returns the move rows and the section titles, e.g. "レフトフラミンゴ（LF）"."""
    parser = TableParser()
    parser.feed(pageHtml)
    rows = []
    sectionTitles = []
    for table in parser.tables:
        if "固有技" not in table["heading"]:
            continue
        rows += [row for row in table["rows"] if len(row) >= 9 and row[1] not in ("コマンド", "")]
        sectionTitles += [row[0] for row in table["rows"] if len(row) == 1]
    return rows, sectionTitles


def inatekkenPage(name, cacheFolder):
    """Returns (snapshot timestamp, html) of the latest snapshot of an inatekken page on the Wayback Machine,
    which is usually the most complete, or None when the page is not archived."""
    path = urllib.parse.quote(name.encode("euc-jp"))
    cacheKey = name.encode("euc-jp").hex()
    # the page name must stay encoded as EUC-JP, so the url is not built with urlencode
    cdxUrl = f"{WAYBACK_CDX_URL}?url={INATEKKEN_PAGE}{path}&filter=statuscode:200&fl=timestamp,original"
    cdxCache = os.path.join(cacheFolder, f"inatekken-cdx-{cacheKey}.txt") if cacheFolder else None
    snapshots = [line.split() for line in download(cdxUrl, cdxCache).decode().splitlines() if line.strip()]
    pageCache = os.path.join(cacheFolder, f"inatekken-{cacheKey}.html") if cacheFolder else None
    # some snapshots are listed but can not be loaded, so the next newest is tried
    for timestamp, original in sorted(snapshots, reverse=True):
        # the archived url is used as it is, as some include the port, e.g. "wiki.livedoor.jp:80".
        # A "/" in the page name, e.g. "クマ/パンダ", is part of the name and not the path
        host, _, pagePath = original.partition("/inatekken/d/")
        pageUrl = f"{WAYBACK_URL}{timestamp}id_/{host}/inatekken/d/{pagePath.replace('/', '%2F')}"
        try:
            return timestamp, download(pageUrl, pageCache).decode("euc-jp", errors="replace")
        except urllib.error.HTTPError as error:
            print(f"  {name} snapshot {timestamp}: {error}")
    return None


def inatekkenPages(characterId, cacheFolder):
    """Returns (section, snapshot timestamp, move rows, section titles) for the pages with the basic and the
    character specific moves on inatekken."""
    pages = []
    for section in inatekkenSections:
        page = inatekkenPage(inatekkenNames[characterId] + section + "TBR", cacheFolder)
        if page is None:
            continue
        timestamp, pageHtml = page
        parser = TableParser()
        parser.feed(pageHtml)
        rows = []
        sectionTitles = []
        for table in parser.tables:
            rows += [row for row in table["rows"] if len(row) >= 9 and row[1] not in ("コマンド", "")]
            sectionTitles += [row[0] for row in table["rows"] if len(row) == 1]
        pages.append((section, timestamp, rows, sectionTitles))
    return pages


def addFullStanceNames(characterId, sectionTitles):
    """Adds the full stance names from the section titles, which are used in the move names."""
    characterStances = stances.setdefault(characterId, {})
    for title in sectionTitles:
        match = re.fullmatch(r"(.+?)\s*[（(](\w+)[）)]", normalize(title))
        if match and match.group(2) in characterStances and match.group(1) not in characterStances:
            characterStances[match.group(1)] = characterStances[match.group(2)]


def normalize(text):
    text = text.replace("±", "+").replace("〜", "~").replace("～", "~").replace("、", ",").replace("　", " ")
    # full width ascii, e.g. "ＬＰ"
    text = "".join(chr(ord(c) - 0xFEE0) if "！" <= c <= "～" else c for c in text)
    return re.sub(r"\s+", " ", text).strip()


def convertButtons(match):
    numbers = set()
    for button in match.group(0).split("+"):
        value = buttons[button]
        numbers.update(value if isinstance(value, tuple) else (value,))
    return "<" + "+".join(str(n) for n in sorted(numbers)) + ">"


def convertDirections(run):
    if run in motions:
        return motions[run]
    return ",".join(directions[c] for c in run)


def convertInput(text):
    """Converts japanese notation without stance names, e.g. "6n23RP,LK" => "f,n,d,df+2,3"."""
    # a quick input right after another input is the next input, e.g. "3LP【RP,LP】" => "df+1,2~1"
    text = re.sub(r"(?<=[A-Za-z0-9])【", ",【", text)
    text = re.sub(r"【([^】]*)】", lambda m: m.group(1).replace(",", "~"), text)
    # buttons written next to each other are pressed one after the other, e.g. "LPRP" => "1,2"
    text = re.sub(r"(LP|RP|LK|RK|WP|WK)(?=LP|RP|LK|RK|WP|WK)", r"\1,", text)
    text = re.sub(r"(?<=[0-9n])\s+(?=LP|RP|LK|RK|WP|WK)", "", text)
    text = re.sub(r"(?<![A-Z])(LP|RP|LK|RK|WP|WK)(\+(LP|RP|LK|RK|WP|WK))*", convertButtons, text)
    # a direction right after a button is the next input, e.g. "LK4〜" => "3,b"
    text = re.sub(r">(?=[1-9n])", ">,", text)
    # a held button or direction
    text = re.sub(r"(<[\d+]+>|[1-9]) ?ホールド", lambda m: (m.group(1)[:-1] + "*>") if m.group(1).startswith("<") else m.group(1) + "H", text)

    def convertRun(match):
        run, held, button = match.group(1), match.group(2), match.group(3)
        result = convertDirections(run) if run else ""
        if held:
            result = result[:-1] + result[-1].upper() if result else result
        if button:
            result = f"{result}+{button[1:-1]}" if result else button[1:-1]
        return result

    text = re.sub(r"(?<![A-Za-z0-9_<+])([1-9n]+)(H)?(<[\d+*]+>)?|(<[\d+*]+>)", lambda m: convertRun(m) if m.group(4) is None else m.group(4)[1:-1], text)
    text = re.sub(r"\s*,\s*", ",", text)
    text = re.sub(r"\s*~\s*", "~", text)
    text = text.replace("~,", ",")
    return text.strip(" ~")


def convertCommand(characterId, command, previousCommand):
    """Converts a japanese command to wavu notation. Returns the command and notes."""
    override = commandOverrides.get((characterId, command))
    if override:
        return override[0], [override[1]] if override[1] else []
    notes = []
    command = normalize(command)
    # "後に" and "直後" mean the input continues, e.g. "6nLP後に8" => "f,n+1,u"
    command = re.sub(r"(?<=[A-Za-z0-9)~])\s*(直後|後に?)\s*(?=[A-Za-z0-9])", ",", command)
    # a choice between two directions before a button, e.g. "1or2LP" => "1LP or 2LP"
    command = re.sub(r"\b([1-9])or([1-9])((?:LP|RP|LK|RK|WP|WK)\S*)", r"\1\3 or \2\3", command)
    # alternatives are separated by "or", or by a space before a second command in japanese
    alternatives = re.split(r"\s*or\s*|(?<=[A-Z0-9~】])\s+(?=[^\x00-\x7f])(?!ホールド)", command)
    alternatives = [a.strip() for a in alternatives if a and a.strip()]
    alternatives = [a for a in alternatives if not re.fullmatch(ignoredAlternatives, a)] or alternatives
    converted = []
    for alternative in alternatives:
        for pattern, note in commandNotes:
            match = re.search(pattern, alternative)
            if match:
                notes.append(match.expand(note) if "\\" in note else note)
                alternative = re.sub(pattern, " ", alternative)
        alternative = re.sub(ignoredAlternatives, " ", alternative)
        if re.match(previousMovePattern, alternative) and previousCommand:
            alternative = re.sub(previousMovePattern, "", alternative).strip()
            converted.append(f"{previousCommand},{convertInput(alternative)}")
            continue
        # the prefixes are applied until none match, e.g. "右構え 背向け中に" => "RFF.BT."
        prefix = ""
        prefixPatterns = [
            (rf"{re.escape(name)}(の構え)?(中に|中|後に?|(?=\s))", f"{code}.")
            for name, (code, _) in sorted(stances.get(characterId, {}).items(), key=lambda item: -len(item[0]))
        ] + commonPrefixes
        matched = True
        while matched:
            matched = False
            for pattern, replacement in prefixPatterns:
                match = re.match(rf"\s*{pattern}\s*", alternative)
                if match:
                    prefix, alternative = prefix + replacement, alternative[match.end():]
                    matched = True
                    break
        value = convertInput(alternative)
        if prefix.endswith("RUN"):
            prefix, value = prefix[:-3], f"f,f,F+{value}"
        converted.append(prefix + value)
    result = converted[0]
    if len(converted) > 1:
        notes.append("Alt: " + " or ".join(converted[1:]))
    return result, notes


def convertHitLevel(text):
    notes = []
    levels = []
    for part in normalize(text).split(","):
        part = part.strip()
        for code, note in hitLevelNotes.items():
            if code in part:
                notes.append(note)
                part = part.replace(code, "")
        level = ""
        while part:
            for code in sorted(hitLevels, key=len, reverse=True):
                if part.startswith(code):
                    level += ("," if level and hitLevels[code] else "") + hitLevels[code]
                    part = part[len(code):]
                    break
            else:
                part = part[1:]
        # an unblockable hit is written with its hit level as in the T8 data, e.g. "上ガ不" => "h!",
        # and a throw has a single hit level, e.g. "上投" => "t"
        if "!" in level:
            heights = [h for h in level.split(",") if h in ("h", "m", "l")]
            level = (heights[0] if heights else "") + "!"
        elif "t" in level:
            level = "t"
        levels.append(level)
    return formatHitLevel(",".join(levels)), notes


def formatHitLevel(hitLevel):
    """Separates the hits with a comma and a space, the same as the T7 and T8 data, e.g. "h, h, m"."""
    return ", ".join(level for level in re.split(r"\s*,\s*", hitLevel) if level)


def convertStartup(text):
    text = normalize(text)
    notes = []
    match = re.match(r"^\(?([\d?~+]*)\)?\s*([A-Z]*)", text)
    frames, letters = (match.group(1), match.group(2)) if match else ("", "")
    if letters in recoveryNotes:
        notes.append(recoveryNotes[letters])
    return frames.strip("~"), notes


def convertReaction(code):
    if code in reactionSuffixes:
        return reactionSuffixes[code]
    if code.endswith("U"):
        return launchSuffix
    if code.endswith("D"):
        return knockdownSuffix
    return None


def convertFrame(text):
    """Converts a japanese block, hit or counter hit value, e.g. "+12G" => "+12g", "KZD" => "KD"."""
    # uncertain values are marked with "?", sometimes inside a code, e.g. "TK?U"
    text = re.sub(r"\s*\(\s*\)", "", normalize(text).replace("?", ""))
    # a frame count after the value, e.g. "YRD(+2) 18t" or "KND (+13~+14t)"
    text = re.sub(r"\s*\(?\s*[+-]?\d+(?:~[+-]?\d+)?t\)?(?=\s|$)", "", text)
    notes = []
    if "打投" in text:
        notes.append("Hit throw")
        text = text.replace("(打投)", "").replace("打投", "")
    if "投げ" in text:
        return "Throw", notes
    # the attacker is knocked down, e.g. "-23 (自分D)"
    if "自分" in text:
        notes.append("Recovers grounded")
        text = re.sub(r"\(?自分[A-Z]*\)?", "", text)
    values = []
    # a range is also written with a comma, e.g. "-15,16" => "-15~-16"
    text = re.sub(r",(?![^(]*\))", "~", text)
    # the range is split outside of brackets, e.g. "U (-8~-7)" is one value
    previousSign = ""
    for part in re.split(r"(~)(?![^(]*\))", text):
        if part == "~":
            values.append(part)
            continue
        match = re.fullmatch(r"\s*([+-]?)(\d*)(\?)?\s*([A-Z]*)(\?)?\s*\+?(\([^)]*\))?\s*", part)
        if not match:
            values.append(part)
            continue
        sign, number, question, code, question2, extra = match.groups()
        # the second value of a range has the sign of the first, e.g. "-15~16" => "-15~-16"
        sign = sign or previousSign
        previousSign = sign
        suffix = convertReaction(code) if code else ""
        # a few codes are not used anywhere else and are not known, e.g. "+4F" or "(NZ)", so only the number is used
        if suffix is None:
            suffix = ""
            if not number and not sign:
                continue
        unknown = "?" if question or question2 else ""
        if number:
            value = f"{sign or '+'}{number}{unknown}{suffix}"
        elif suffix in noFrameValues:
            value = noFrameValues[suffix] + unknown
        elif suffix:
            value = f"{sign or '+'}?{suffix}"
        else:
            value = f"{sign}{unknown}" if sign else ""
        # a value in brackets is another reaction, e.g. "+ (SM)" => "+ (KND)"
        if extra:
            inner, _ = convertFrame(extra[1:-1])
            extra = f"({inner})" if inner else ""
        values.append(" ".join(filter(None, [value, extra])))
    return "".join(values).strip(), notes


def hasJapanese(text):
    return re.search(r"[^\x00-\x7f]", text) is not None


# qualifiers in the move names which tell the versions of a move apart, e.g. "ジャイアントスイング(遠距離)"
moveNameQualifiers = [
    (r"近距離", "At close range"),
    (r"遠距離", "At long range"),
    (r"先端", "At the tip of the range"),
    (r"密着", "Point blank"),
    (r"(\d)回転〜", r"Input rotated \1 or more times"),
    (r"(\d)回転", r"Input rotated \1 times"),
    (r"(\d)歩", r"\1 steps"),
    (r"(\d)発目のみ", r"Hit \1 only"),
    (r"(\d)発目スカ[りリ]", r"When hit \1 whiffs"),
    (r"最大(ホールド|ため|溜め)|[(（]最大[)）]", "Fully charged"),
    (r"ホールド", "Held"),
    (r"単発", "Single hit"),
    (r"派生せず", "Without the follow up"),
    (r"[(（]奥[)）]", "To the far side"),
    (r"[(（]手前[)）]", "To the near side"),
    (r"[(（]前方[)）]", "Forward"),
    (r"[(（]後方[)）]", "Backward"),
    (r"[(（]垂直[)）]", "Straight up"),
    (r"[(（]小[)）]", "Small version"),
    (r"[(（]大[)）]", "Large version"),
    (r"背面", "On back hit"),
    (r"伸ばし", "Delayed"),
    (r"(\d)発目入力時", r"When hit \1 is input"),
    (r"ディレイなし", "Without delay"),
]


def moveNameNotes(moveName):
    """Notes from the qualifiers in a move name, which tell the versions of a move apart."""
    notes = []
    for pattern, note in moveNameQualifiers:
        match = re.search(pattern, moveName)
        if match:
            notes.append(match.expand(note) if "\\" in note else note)
            if note == "Fully charged":
                # "最大ホールド" contains "ホールド", which is the same as fully charged here
                moveName = re.sub(r"ホールド", "", moveName)
    return notes


def transitionCode(characterId, moveName):
    """The stance a move ends in, from the move name, e.g. "ライトジャブ〜LF" => "LFS"."""
    match = re.search(r"〜\s*([^\s(（]+)", moveName)
    if not match:
        return None
    target = match.group(1)
    names = {name: code for name, (code, _) in stances.get(characterId, {}).items()}
    names.update({"背向け": "BT", "しゃがみ": "FC"})
    for name in sorted(names, key=len, reverse=True):
        if target.startswith(name):
            return names[name]
    return None


def convertSeesaaCharacter(characterId, rows):
    moves = []
    previousCommand = ""
    for row in rows:
        name, command, hitLevel, damage, startup, block, hit, counterHit, extra = row[:9]
        command, notes = convertCommand(characterId, command, previousCommand)
        hitLevel, hitLevelNotes = convertHitLevel(hitLevel)
        startup, startupNotes = convertStartup(startup)
        block, blockNotes = convertFrame(block)
        hit, hitNotes = convertFrame(hit)
        counterHit, counterHitNotes = convertFrame(counterHit)
        notes += hitLevelNotes + startupNotes + blockNotes + hitNotes + counterHitNotes
        # the notes column marks a homing move with H and a bound with B, e.g. "H,B"
        markers = re.split(r"[,、]", extra.strip())
        if "H" in markers:
            notes.append("Homing")
        if "B" in markers:
            notes.append("Bound")
        transition = transitionCode(characterId, name)
        if transition:
            notes.append(f"Transitions to {transition}")
        notes += moveNameNotes(name)
        notes = list(dict.fromkeys(notes))
        move = [command, hitLevel, normalize(damage), startup, block, hit, counterHit, "\n".join(notes)]
        if any(hasJapanese(value) for value in move):
            problems.append(f"{characterId}: {name} | {row[1]} => {' | '.join(move)}")
        moves.append(move)
        previousCommand = command
    return moves


def convertWavuCharacter(wikitext):
    """Converts the Move6 templates of a wavu T6 movelist."""
    moves = []
    byId = {}
    # the notes of a template contain "}}", so the templates are split on their start
    # the japanese wiki has the regular throws in a separate table, which is not used, so they are left out here too
    wikitext = re.sub(r"^=== Regular Throws ===.*?(?=^==)", "", wikitext, flags=re.S | re.M)
    for template in wikitext.split("{{Move6")[1:]:
        # the last move of a section is followed by the next section heading and table header
        template = re.split(r"\n(?:==|\{\{(?!Plainlist))", template)[0]
        fields = {}
        for match in re.finditer(r"^\|(\w+)=(.*?)(?=^\|\w+=|\Z)", template, flags=re.S | re.M):
            fields[match.group(1)] = match.group(2).strip()
        parent = byId.get(fields.get("parent", ""))
        command = fields.get("input", "")
        hitLevel = fields.get("target", "")
        damage = fields.get("damage", "")
        if parent and command.startswith(","):
            command = parent["command"] + command
            # the hit level and damage of a follow up usually start with a comma, but not always
            hitLevel = parent["hitLevel"] + ("" if hitLevel.startswith(",") or not hitLevel else ",") + hitLevel
            damage = parent["damage"] + ("" if damage.startswith(",") or not damage else ",") + damage
        elif not parent:
            # a follow up without its parent on the page, e.g. damage ",26"
            command, hitLevel, damage = command.lstrip(","), hitLevel.lstrip(","), damage.lstrip(",")
        notes = [re.sub(r"\{\{(\w+)\}\}", r"\1", line.strip("* ").strip()) for line in fields.get("notes", "").splitlines()]
        notes = [re.sub(r"\[\[(?:[^|\]]*\|)?([^\]]*)\]\]", r"\1", n) for n in notes if n and not n.startswith("{{Plainlist") and n != "}}"]
        if fields.get("alt"):
            notes.insert(0, "Alt: " + fields["alt"])
        if fields.get("crush"):
            notes.append({"cs": "High crush", "js": "Low crush", "ps": "Parry"}.get(fields["crush"].strip("?"), fields["crush"]))
        move = {"command": command, "hitLevel": hitLevel, "damage": damage}
        byId[fields.get("id", "")] = move
        startup = fields.get("startup", "").lstrip("i")
        frames = [toNoFrameValue(fields.get(name, "")) for name in ("block", "hit", "ch")]
        command, commandNote = wavuCommandToNotation(command)
        if commandNote:
            notes.insert(0, commandNote)
        # an unbreakable throw is a throw for the other characters, e.g. "t!" => "t"
        hitLevel = ",".join(level.replace("!", "") if "t" in level else level for level in hitLevel.split(","))
        moves.append([command, formatHitLevel(hitLevel), damage, startup, *frames, "\n".join(notes)])
    return moves


def wavuCommandToNotation(command):
    """Writes the commands which wavu describes in words in the same notation as the other characters."""
    command = re.sub(r"^Run more than 3 steps ", "f,f,F+", command)
    match = re.match(r"^CLK\(Two spins\)\.", command)
    if match:
        return "CLK." + command[match.end():], "After two spins"
    return command, ""


# the stance codes in the Avoiding the Puddle csv files -> the codes of the T8 frame data, which are used now
avoidingThePuddleStanceCodes = {
    "anna": {"CHJ": "CJM"},
    "steve": {"LSW": "LWV", "RSW": "RWV", "WR": "RWV", "WL": "LWV", "PKB": "PAB"},
}


def toMatchingCommand(characterId, command):
    """Writes an Avoiding the Puddle command the same way as the converted commands, so the moves can be matched,
    e.g. "f,f,F+3 or WR 3" => "f,f,F+3", "4,f ~ 3" => "4,f~3", "bb+4" => "b,b+4", "LSW.1" => "LWV.1"."""
    command = command.split(" or ")[0].strip().rstrip(";")
    command, _ = cleanCommandSpacing(command)
    command = re.sub(r"\b(b|f|d)\1(?=\+|,|$)", r"\1,\1", command)
    code, dot, rest = command.partition(".")
    codes = avoidingThePuddleStanceCodes.get(characterId, {})
    if dot and code in codes:
        command = codes[code] + "." + rest
    return command


def readAvoidingThePuddle(characterId):
    """Reads the data from Avoiding the Puddle, in the notation of the other sources.
    Returns the moves and the stances, or empty lists when there is no data for the character."""
    path = os.path.join(avoidingThePuddleRoot, characterId + ".csv")
    if not os.path.isfile(path):
        return [], {}
    with open(path, encoding="utf-8") as file:
        rows = list(csv.reader(file, delimiter=CSV_SEP))
    moves = []
    atpStances = {}
    section = None
    for row in rows:
        if row and row[0].startswith("#"):
            section = row[0]
            continue
        if not row or row[0] in ("Command", "Code"):
            continue
        if section == "#stances":
            atpStances[row[0]] = row[1]
            continue
        command = re.sub(r"\s*,\s*", ",", row[0])
        command = re.sub(r"^([A-Z]{2,4}) ", r"\1.", command)
        command = re.sub(r"^WS\s*", "ws", command)
        command = re.sub(r"\bfff\b", "f,f,F", command)
        command = re.sub(r"\bff\b", "f,F", command)
        command = toMatchingCommand(characterId, command)
        values = []
        for value in row[3:7]:
            value = re.sub(r"(\d)\s*CR\b", r"\1c", value)
            value = re.sub(r"(\d)\s*NG\b", r"\1g", value)
            values.append(toNoFrameValue(value))
        moves.append([command, row[1], row[2], *values, row[7] if len(row) > 7 else ""])
    return moves, atpStances


def isMissingFrame(value):
    return value.strip() in ("", "+", "-", "+?", "-?", "?", "~")


def hasFrame(value):
    return re.search(r"\d|KND|JG", value) is not None


validFrame = re.compile(r"^(?:[+-]\d+[acdgs]{0,2}(?:~[+-]\d+[acdgs]{0,2})?(?: \(.*\))?|KND(?: \(.*\))?|JG(?: \(.*\))?)$")


def isPlausibleFill(column, mainValue, value):
    """A frame from another source is only used when it is a valid value for the column, and it does not
    contradict the main source, which sometimes only says if the frames are plus or minus."""
    value = re.sub(r"\s*~\s*", "~", value.replace("?", "").strip())
    # the startup is checked before cleanFrame, which would add a sign, e.g. "17" => "+17"
    if column == 3:
        return re.fullmatch(r"i?\d+(~\d+)?", value) is not None
    value = cleanFrame(value)
    if not validFrame.match(value):
        return False
    if mainValue.strip() == "-":
        return value.startswith("-")
    if mainValue.strip() == "+":
        return value.startswith("+") or value.startswith(("KND", "JG"))
    return True


def isValidValue(column, value):
    """If a value from another source is a valid damage, startup or frame value."""
    value = re.sub(r"\s*~\s*", "~", value.replace("?", "").strip())
    if column == 2:
        return re.search(r"\d", value) is not None
    # the startup is checked before cleanFrame, which would add a sign, e.g. "17" => "+17"
    if column == 3:
        return re.fullmatch(r"i?\d+(~\d+)?", value) is not None
    return validFrame.match(cleanFrame(value)) is not None


def damageCount(damage):
    """The number of hits in a damage value, e.g. "12, 30 (5)" => 2."""
    damage = cleanDamage(re.sub(r"\([^)]*\)", "", damage))
    return len([part for part in re.split(r"\s*,\s*", damage) if part.strip()])


def replaceFrames(moves, otherMoves, emptyCounterHitIsHit=False):
    """Replaces the damage and frames of the moves with the values of another source, which is for the
    console version of the game. The commands, hit levels and notes are kept.
    Only moves with a command which is unique in both sources are replaced, and only with valid values.
    On wavu an empty counter hit is the same as the hit, which is set with emptyCounterHitIsHit.
    Returns the number of moves where a value was replaced."""

    def unique(rows):
        counts = {}
        for row in rows:
            counts[row[0]] = counts.get(row[0], 0) + 1
        return {row[0]: row for row in rows if counts[row[0]] == 1}

    other = unique(otherMoves)
    replaced = 0
    for command, move in unique(moves).items():
        otherMove = other.get(command)
        if not otherMove:
            continue
        columns = [i for i in range(2, 7) if otherMove[i].strip() and isValidValue(i, otherMove[i])]
        # the damage is only used when it has a value for each hit, as some sources give the total damage
        if 2 in columns and damageCount(otherMove[2]) != damageCount(move[2]):
            columns.remove(2)
        changed = [i for i in columns if move[i] != otherMove[i]]
        for i in columns:
            move[i] = otherMove[i]
        if emptyCounterHitIsHit and 5 in columns and not otherMove[6].strip():
            changed += [6] if move[6] else []
            move[6] = ""
        if changed:
            replaced += 1
    return replaced


def addHomingNotes(moves, wavuMoves):
    """Adds the homing note to the moves which wavu marks as homing, as the japanese wikis miss some of them."""
    homing = {move[0] for move in wavuMoves if "Homing" in move[7].split("\n")}
    for move in moves:
        notes = [note for note in move[7].split("\n") if note]
        if move[0] in homing and "Homing" not in notes:
            move[7] = "\n".join(notes + ["Homing"])


def fillMissingFrames(moves, otherMoves):
    """Fills in the frames which the main source is missing, from another source.
    Only moves with a command which is unique in both sources are filled."""
    def unique(rows):
        counts = {}
        for row in rows:
            counts[row[0]] = counts.get(row[0], 0) + 1
        return {row[0]: row for row in rows if counts[row[0]] == 1}

    other = unique(otherMoves)
    filled = 0
    for command, move in unique(moves).items():
        otherMove = other.get(command)
        if not otherMove:
            continue
        columns = [
            i
            for i in range(3, 7)
            if isMissingFrame(move[i]) and hasFrame(otherMove[i]) and isPlausibleFill(i, move[i], otherMove[i])
        ]
        # the startup is only given for the first hit of a string, so it is only filled alone for single hits
        hitCount = len([level for level in re.split(r"\s*,\s*", move[1]) if level and level != "sp"])
        if columns == [3] and hitCount != 1:
            continue
        for i in columns:
            move[i] = otherMove[i]
        if columns:
            filled += 1
    return filled


def toT8Format(move):
    """Writes a move the same way as the T8 frame data, e.g. damage "5, 10", startup "i10" and notes as a list."""
    command, hitLevel, damage, startup, block, hit, counterHit, notes = move
    damage = ", ".join(part for part in re.split(r"\s*,\s*", damage)) if damage else ""
    # damage without any number, e.g. "," or ", S", is left out
    if not re.search(r"\d", damage):
        damage = ""
    # the sources mark uncertain values with "?", which is left out, e.g. "JG?" => "JG"
    damage, startup, block, hit, counterHit = [
        re.sub(r"\s*~\s*", "~", value.replace("?", "").strip()) for value in (damage, startup, block, hit, counterHit)
    ]
    damage = cleanDamage(damage)
    startup = cleanStartup(startup)
    block, hit, counterHit = [cleanFrame(value) for value in (block, hit, counterHit)]
    command, commandAlternative = cleanCommandSpacing(command)
    # the counter hit is left empty when it is the same as the hit
    if counterHit == hit:
        counterHit = ""
    noteLines = [line[2:] if line.startswith("* ") else line for line in notes.split("\n") if line]
    noteLines = [re.sub(r"^Alt: ", "Alternate input: ", re.sub(r"^Transitions to ", "Transition to ", line)) for line in noteLines]
    if commandAlternative:
        noteLines.insert(0, "Alternate input: " + commandAlternative)
    # a move which only hits a grounded opponent has the OTG prefix and capital hit levels
    if GROUNDED_NOTE in noteLines:
        noteLines.remove(GROUNDED_NOTE)
        command = command if command.startswith("OTG.") else "OTG." + command
        # a throw stays "t", as in the T8 data
        hitLevel = re.sub(r"[hml]", lambda match: match.group(0).upper(), hitLevel)
    # alternative inputs in the command, e.g. "3 or 4" => "3" with "Alternate input: 4"
    if " or " in command:
        command, alternatives = command.split(" or ", 1)
        noteLines.insert(0, "Alternate input: " + alternatives)
    notes = "\n".join(f"* {line}" for line in noteLines) if len(noteLines) > 1 else "".join(noteLines)
    return [command, formatHitLevel(hitLevel), damage, startup, block, hit, counterHit, notes]


def cleanDamage(damage):
    """e.g. "25(37)" => "25 (37)", "30(, 5)" => "30 (5)"."""
    damage = re.sub(r"\s*\(\s*,?\s*", " (", damage)
    damage = re.sub(r"(\d)or(\d)", r"\1 or \2", damage)
    # repeated hits written with an x in the Avoiding the Puddle data, e.g. "6 x 5" => "6*5"
    damage = re.sub(r"(?<=\d)\s*x\s*(?=\d)", "*", damage)
    # extra damage written as a separate value, e.g. "30, (44)" => "30 (44)"
    damage = re.sub(r",\s*\(", " (", damage)
    # a missing comma between two hits, e.g. "12 12"
    damage = re.sub(r"(?<=\d) (?=\d)", ", ", damage)
    # damage which can be higher is written as in the T8 data, e.g. "21~" => "21+"
    damage = re.sub(r"(\d)~(?=,|$)", r"\1+", damage)
    # "~" between the hits in the Avoiding the Puddle data, e.g. "12, ~ ~ 12" => "12, 12"
    damage = re.sub(r"[\s,]*~[\s~]*", ", ", damage)
    # an unknown damage of the last hit, e.g. "22,"
    return re.sub(r"[,\s]+$", "", damage.strip())


def cleanStartup(startup):
    """e.g. "20~" => "i20", "21 KND" => "i21", "19c" => "i19", "29,i41" => "i29, i41"."""
    parts = []
    for part in re.split(r"\s*,\s*", startup):
        match = re.match(r"^i?(\d+(?:~\d+)?)", part)
        if match:
            parts.append("i" + match.group(1))
    return ", ".join(parts)


def cleanFrame(value):
    """Writes the values which the sources write in other ways like the T8 frame data,
    e.g. "0" => "+0", "-23~" => "-23", "(KND)" => "KND", "KND (+)" => "KND"."""
    value = re.sub(r"\s+", " ", value).strip()
    value = value.replace("--", "-")
    # machine translated text in the Avoiding the Puddle data, e.g. "Investment par KND" or "-16 (One KND )"
    value = re.sub(r"^[A-Za-z ]+ (KND|JG)$", r"\1", value)
    value = re.sub(r"\((?:[A-Za-z]+ )+(KND|JG)\s*\)", r"(\1)", value)
    value = re.sub(r"\(\s*(.*?)\s*\)", r"(\1)", value)
    # a range written with a comma in the Avoiding the Puddle data, e.g. "-8,9" => "-8~-9"
    value = re.sub(r"^([+-])(\d+),(\d+)$", r"\1\2~\1\3", value)
    # junk after a value, e.g. "+13~+14 -" or "(+17 A)" or "(~+23c)"
    value = re.sub(r" [+-]$", "", value)
    value = re.sub(r" A(\)|$)", r"\1", value)
    # a letter O for zero, and a stagger written as Y, e.g. "+O" => "+0", "+0 Y" => "+0s"
    value = re.sub(r"^([+-])O$", r"\g<1>0", value)
    value = re.sub(r"(\d) Y$", r"\1s", value)
    value = re.sub(r"\(~", "(", value)
    # "_" means "or", e.g. "-12~-11 _ KND" => "-12~-11 (KND)"
    value = re.sub(r"^(\S+) _ (KND|JG)$", r"\1 (\2)", value)
    # a sign followed by a space, e.g. "+ 8"
    value = re.sub(r"^([+-]) (\d)", r"\1\2", value)
    # junk letters which are not a reaction, e.g. "-14A" or "(5t)"
    value = re.sub(r"(?<=\d)A\b", "", value)
    value = re.sub(r"\s*\((?:[+-]?\d*A|\d+t)\)", "", value)
    # an open range, e.g. "-23~", "+5~-" or "-15 (-20~)"
    value = re.sub(r"~[+-]?$", "", value)
    value = re.sub(r"~[+-]?\)", ")", value)
    # a number without a sign, e.g. "0" or "4~+6"
    value = re.sub(r"(^|~|\()(\d)", r"\1+\2", value)
    # a value only in brackets, e.g. "(KND)"
    value = re.sub(r"^\((.*)\)$", r"\1", value)
    # brackets which add nothing, e.g. "KND (+)", "KND (KND)" or "JG (+)"
    value = re.sub(r"^(KND|JG) \((?:[+-]|KND|JG)\)$", r"\1", value)
    # a bound written after the value on wavu, e.g. "+5 B"
    value = re.sub(r" B$", "", value)
    # two values without brackets, e.g. "+5 KND" or "KND _ +14"
    value = re.sub(r"^([+-]\d+\w*) (KND|JG)$", r"\1 (\2)", value)
    value = re.sub(r"^(KND|JG) _ ([+-]\d+)$", r"\1 (\2)", value)
    return value


def cleanCommandSpacing(command):
    """Removes the spaces left in a command, e.g. "SS.2 u" => "SS.2,u".
    Returns the command and an alternative input written in brackets, e.g. "b,db,d,df+2 (db,df+2)"."""
    alternative = ""
    # the names of the throws from the side or behind have a space, e.g. "Left throw"
    if command in sideThrows.values():
        return command, alternative
    # uncertain inputs are marked with "?", e.g. "f?1+4", and an open input with "~-"
    command = re.sub(r"~-$", "", command.replace("?", "+").replace("++", "+"))
    match = re.match(r"^(.*?)\s*\(([^)]*)\)$", command)
    if match and match.group(1):
        command, alternative = match.group(1), match.group(2)
    command = re.sub(r"\s*~\s*(~\s*)*", "~", command)
    command = re.sub(r"~,", ",", command)
    command = re.sub(r",\+", ",", command).replace(";", ",")
    # " or " separates alternative inputs, so its spaces are kept
    command = ",".join(re.split(r"\s+", command.strip().replace(" or ", "\0"))).replace("\0", " or ")
    return command, alternative


def applyManualFixes(characterId, moves):
    """Applies the fixes for moves where the sources are wrong or unclear."""
    for move in moves:
        fix = manualFixes.get((characterId, move[0]))
        if fix:
            for column, value in fix.items():
                if column == "replaceNote":
                    old, new = value
                    move[7] = "\n".join(new if line == old else line for line in move[7].split("\n"))
                else:
                    move[column] = value


def removeDuplicates(moves):
    """Removes moves which are listed more than once with exactly the same data."""
    seen = set()
    unique = []
    for move in moves:
        key = tuple(move)
        if key not in seen:
            seen.add(key)
            unique.append(move)
    return unique


def writeCsv(characterId, moves, usedStances):
    applyManualFixes(characterId, moves)
    # moves without a command are descriptions, e.g. "after specific moves"
    moves = removeDuplicates([toT8Format(move) for move in moves if move[0]])
    os.makedirs(outputRoot, exist_ok=True)
    with open(os.path.join(outputRoot, characterId + ".csv"), "w", encoding="utf-8", newline="") as file:
        writer = csv.writer(file, delimiter=CSV_SEP, lineterminator="\n")
        writer.writerow(["#frames_normal"])
        writer.writerow(HEADERS)
        writer.writerows(moves)
        if usedStances:
            writer.writerow(["#stances"])
            writer.writerow(["Code", "Stance"])
            writer.writerows(usedStances.items())


def stancesUsed(characterId, moves):
    known = {code: name for code, name in stances.get(characterId, {}).values()}
    if characterId == "bryan":
        known["TNT"] = "Taunt"
    used = {}
    for move in moves:
        code = move[0].split(".")[0]
        if code in known:
            used.setdefault(code, known[code])
    return used


def seesaaMoves(characterId, cacheFolder):
    page = seesaaPages.get(characterId)
    if not page:
        return []
    url = SEESAA_URL + urllib.parse.quote(page.encode("euc-jp"))
    cachePath = os.path.join(cacheFolder, f"seesaa-{page.encode('euc-jp').hex()}.html") if cacheFolder else None
    rows, sectionTitles = seesaaMoveRows(download(url, cachePath).decode("euc-jp", errors="replace"))
    addFullStanceNames(characterId, sectionTitles)
    return convertSeesaaCharacter(characterId, rows)


THROWS_SECTION = "投げ技ほか"
# the throw types on the throws pages -> (hit level, note)
throwTypes = {
    "上投": ("t", ""),
    "下投": ("t", "Low throw"),
    "連携": ("t", ""),
    "ダ投": ("t", GROUNDED_NOTE),
    "空投": ("t", "Against an airborne opponent"),
    "壁投": ("t", "Wall throw"),
    "し投": ("t", "Against a crouching opponent"),
    "ガ不投": ("t", "Unblockable"),
    "返投": ("t", "Reversal"),
}
# the side the opponent lies on after a throw -> the code used for the grounded positions
lyingPositions = {"頭側仰向け": "FUFA", "足側仰向け": "FUFT", "頭側うつ伏せ": "FDFA", "足側うつ伏せ": "FDFT"}
# conditions written around the command on the throws page -> note
throwConditions = [
    (r"(相手の?)?\s*上段攻撃に\s*(あわせて?|合わせて?)", "Against high attacks"),
    (r"(相手の?)?\s*下段攻撃に\s*(あわせて?|合わせて?)", "Against low attacks"),
    (r"(相手の?)?\s*左P攻撃に\s*(あわせて?|合わせて?)", "Against left punches"),
    (r"(相手の?)?\s*右P攻撃に\s*(あわせて?|合わせて?)", "Against right punches"),
    (r"(相手の?)?\s*(パンチ|P)攻撃に\s*(あわせて?|合わせて?)", "Against punches"),
    (r"(相手の?)?\s*(キック|K)攻撃に\s*(あわせて?|合わせて?)", "Against kicks"),
    (r"相手LP技に\s*(あわせて?|合わせて?)", "Against 1 attacks"),
    (r"相手RP技に\s*(あわせて?|合わせて?)", "Against 2 attacks"),
    (r"相手LK技に\s*(あわせて?|合わせて?)", "Against 3 attacks"),
    (r"相手RK技に\s*(あわせて?|合わせて?)", "Against 4 attacks"),
    (r"(相手の?)?\s*ガード不能に\s*(あわせて?|合わせて?)", "Against unblockable attacks"),
    (r"単発攻撃に\s*(あわせて?|合わせて?)", "Against single attacks"),
    (r"連携攻撃に\s*(あわせて?|合わせて?)", "Against strings"),
    (r"相手の?\s*(攻撃|技)に\s*(あわせて?|合わせて?)", "Reversal"),
    (r"(正面)?\s*カウンター(ヒット|時)", "On counter hit"),
    (r"持ち上げ中", "While lifting"),
    (r"壁やられ中の相手に|相手壁やられ中", "Against an opponent in wall stun"),
    (r"(相手の?)?\s*上段パンチ\s*攻撃に\s*(あわせて?|合わせて?)", "Against high punches"),
    (r"相手(ダウン中の|仰向け|うつ伏せ)\s*\S*?(側|側面)で", GROUNDED_NOTE),
    (r"\s*正面\s*近距離\s*ヒット時", "On hit from the front"),
    (r"捌き成功(?=後)", "After a successful parry"),
    (r"\s*\(相手の背後左右\)", "From behind the opponent"),
    (r"相手が投げ", "Against throws"),
    (r"出始めに\s*相手P攻撃", "Parries punches at the start of the move"),
    (r"(しゃがんでいる|しゃがみ中の)相手に|相手しゃがみ中に", "Against a crouching opponent"),
    (r"空中の?相手に", "Against an airborne opponent"),
    (r"(仰向け|うつ伏せ|うつぶせ)ダウン\s*相手(の|に)\s*(足側|頭側|横側?|左側面|右側面)で", GROUNDED_NOTE),
    (r"\s*(近距離)?\s*正面\s*(立ち)?\s*CH(時|後)", "On counter hit from the front"),
    (r"\s*(近距離)?\s*正面\s*(立ち)?\s*ヒット(時|後)", "On hit from the front"),
    (r"任意ボタン", "Any button"),
]

# throws which are done from the side or behind, which T8 writes as a name
sideThrows = {"左側から": "Left throw", "右側から": "Right throw", "背後から": "Back throw", "左側に": "Left throw", "右側に": "Right throw"}


def throwCell(row, header, *names):
    """The cell of a throws table, found by the column name as the columns are not the same on every page."""
    for name in names:
        for i, title in enumerate(header):
            if title.startswith(name) and i < len(row):
                return row[i]
    return ""


def throwPosition(text):
    """The notes for the state after a throw, e.g. "位置逆転 近距離頭側仰向け" => "Side switch", "Opponent recovers FUFA"."""
    notes = []
    if re.search(r"位置(逆転|入れ替え)", text):
        notes.append("Side switch")
    for name, code in lyingPositions.items():
        if name in text:
            notes.append(f"Opponent recovers {code}")
    if re.search(r"側面(仰向け|うつ伏せ)", text) or re.search(r"(左|右)側(仰向け|うつ伏せ)", text):
        face = "face up" if "仰向け" in text else "face down"
        notes.append(f"Opponent recovers {face} sideways")
    if re.search(r"背向け", text):
        notes.append("Recovers BT")
    if "相手しゃがみ" in text:
        notes.append("Opponent recovers crouching")
    if "お互い立ち" in text:
        notes.append("Both recover standing")
    if "バウンド" in text:
        notes.append("Bound")
    return notes


def throwFrames(text):
    """The frames in a state after a throw or a break, e.g. "-6 位置逆転" => "-6", "五分" => "+0"."""
    text = normalize(text).replace("?", "")
    match = re.search(r"[+-]?\d+(?:~[+-]?\d+)?", text)
    if match:
        return cleanFrame(match.group(0))
    return "+0" if "五分" in text else ""


def throwBreak(text):
    """The break of a throw, e.g. "LP" => "Throw break 1", "LPorRP" => "Throw break 1 or 2", "×" => "Unbreakable"."""
    text = normalize(text).replace("?", "")
    if text in ("×", ""):
        return "Unbreakable" if text else ""
    if "ガード可能" in text:
        return "Can be blocked"
    parts = [convertInput(part) for part in re.split(r"\s*or\s*", text) if re.fullmatch(r"[0-9LRPKW+,]+", part.strip())]
    return "Throw break " + " or ".join(dict.fromkeys(parts)) if parts else ""


def throwCommand(characterId, command, previousThrows, previousCommand):
    """Converts the command of a throw. Returns the command and notes.
    A chain throw is written as "during <throw name>", e.g. "居反中にLP,RP,LP", and continues the earlier throw."""
    command = normalize(command)
    notes = []
    for japanese, name in sideThrows.items():
        if command.startswith(japanese):
            rest = re.sub(r"^接近して\s*", "", command[len(japanese):].strip())
            # the generic throw from the side, with any of the throw buttons
            if re.fullmatch(r"(投げ掴み|LP\+LK|RP\+RK|LP\+LK\s*or\s*RP\+RK|RP\+RK\s*or\s*LP\+LK)", rest):
                return name, notes
            converted, restNotes = convertCommand(characterId, rest, previousCommand)
            return converted, [f"{name} only"] + restNotes
    command = command.replace("投げ掴み", "LP+LK or RP+RK")
    for pattern, note in throwConditions:
        match = re.search(pattern, command)
        if match:
            notes.append(match.expand(note) if "\\" in note else note)
            command = (command[: match.start()] + " " + command[match.end():]).strip()
    command = re.sub(r"\s*接近して\s*", "", command)
    # the input which enters a stance is sometimes written in brackets, e.g. "HS(WK)中に", and the stance name
    # is sometimes followed by a space, e.g. "ハンティングスタイル 中に"
    command = re.sub(r"\s*\([^)]*\)\s*(?=中)", "", command)
    command = re.sub(r"\s+(?=中に?)", "", command)
    match = re.match(r"^(.+?)(?:中に?|後に?)\s*(?=[A-Z0-9])", command)
    if match and not hasJapanese(command[match.end():]):
        # the names are compared without spaces, as they are not always written the same way
        throwName = match.group(1).replace(" ", "")
        parent = next((cmd for name, cmd in reversed(previousThrows) if throwName in name.replace(" ", "")), None)
        if parent:
            converted, restNotes = convertCommand(characterId, command[match.end():], previousCommand)
            return f"{parent},{converted}", notes + restNotes
    converted, restNotes = convertCommand(characterId, command, previousCommand)
    return converted, notes + restNotes


def convertThrowRows(characterId, tables):
    """Converts the tables of a throws page to moves in the same layout as the other moves."""
    moves = []
    previousThrows = []
    previousCommand = ""
    for header, rows in tables:
        for row in rows:
            name = re.sub(r"\s*\(.*?\)", "", row[0]).strip()
            command, notes = throwCommand(characterId, throwCell(row, header, "コマンド"), previousThrows, previousCommand)
            throwType = normalize(throwCell(row, header, "種類"))
            if throwType in throwTypes:
                hitLevel, typeNote = throwTypes[throwType]
                notes += [typeNote] if typeNote else []
            else:
                hitLevel, typeNotes = convertHitLevel(throwType)
                notes += typeNotes
            breakNote = throwBreak(throwCell(row, header, "抜け"))
            notes += [breakNote] if breakNote else []
            afterBreak = throwCell(row, header, "抜け後")
            if re.search(r"位置(逆転|入れ替え)", afterBreak):
                notes.append("Side switch when broken")
            afterThrow = throwCell(row, header, "投げ後")
            notes += throwPosition(afterThrow)
            notes += moveNameNotes(row[0])
            startup, startupNotes = convertStartup(throwCell(row, header, "発生"))
            # an alternative input which names another move, e.g. "Alt: スウェー中に1+4", is left out
            notes = [note for note in notes if not hasJapanese(note)]
            # damage which can be higher is written "25+α", which is "25+" as in the T8 data
            damage = normalize(throwCell(row, header, "ダメージ")).replace("α", "")
            # a footnote mark after the damage, e.g. "25※"
            damage = re.sub(r"\s*(※|\*)\d*$", "", damage)
            move = [command, hitLevel, damage, startup,
                    throwFrames(afterBreak), throwFrames(afterThrow), "", "\n".join(dict.fromkeys(notes + startupNotes))]
            previousThrows.append((name, command))
            previousCommand = command
            # a throw which is done after another move, which is only named, e.g. "トゥーキック ヒット時に",
            # can not be written as a command, so it is left out
            if hasJapanese(command):
                skippedThrows.append(f"{characterId}: {row[0]} | {row[1]} => {command}")
                continue
            if any(hasJapanese(value) for value in move):
                problems.append(f"{characterId}: {row[0]} | {row[1]} => {' | '.join(move)}")
            moves.append(move)
    return moves


def inatekkenThrows(characterId, cacheFolder):
    """The throws of a character from the throws page on inatekken."""
    page = inatekkenPage(inatekkenNames[characterId] + THROWS_SECTION + "TBR", cacheFolder)
    if page is None:
        return []
    parser = TableParser()
    parser.feed(page[1])
    tables = []
    for table in parser.tables:
        header = next((row for row in table["rows"] if row and row[0] == "技名"), None)
        if header and "抜け" in header:
            tables.append((header, [row for row in table["rows"] if len(row) >= 7 and row is not header and row[0] != "技名"]))
    return convertThrowRows(characterId, tables)


# the order of the kinds of inputs, the same as in the T8 frame data, e.g. "f+" are the moves like "f+1"
inputKindOrder = ["", "f+", "df+", "d+", "db+", "b+", "ub+", "u+", "uf+", "f,F+", "f,f,F+", "ws", "FC.", "SS."]


def inputKind(command):
    """The kind of input of a move, e.g. "f+" for "f+1,2", "ws" for "ws3" and "FC." for "FC.df+3".
    A move without a button is the same kind as the direction with a button, e.g. "ub" is "ub+"."""
    if not re.search(r"\d", command):
        return re.sub(r"^((?:[A-Z]{2,4}\.)*[a-zA-Z,]*).*$", r"\1+", command)
    match = re.match(r"^((?:[A-Z]{2,4}\.)*(?:ws|(?:[fbud]{1,2},?)+(?:F,?)?\+|[a-zA-Z,]*\+)?)", command)
    return match.group(1) if match else ""


def firstInputOrder(command):
    """The order of the first input within a kind of input, as in the T8 frame data: single buttons
    first, then buttons pressed together, e.g. "df+1" < "df+4" < "df+1+2" < "df+3+4".
    An input with "~" is two inputs after each other like with ",", so "1~2" starts with "1"."""
    firstInput = re.split(r"[,~]", command[len(inputKind(command)):])[0]
    buttons = tuple(int(b) for b in re.findall(r"\d", firstInput))
    return (len(buttons) > 1, buttons)


def insertInNaturalOrder(moves, move):
    """Inserts a move next to the moves with the same kind of input, ordered by the first input,
    e.g. "df+4" after the "df+3" strings and before "df+1+2", or else after the moves with the kind of
    input before it."""
    kind, order = inputKind(move[0]), firstInputOrder(move[0])
    sameKind = [i for i, other in enumerate(moves) if inputKind(other[0]) == kind]
    if sameKind:
        later = [i for i in sameKind if firstInputOrder(moves[i][0]) > order]
        index = later[0] if later else sameKind[-1] + 1
    else:
        order = inputKindOrder.index(kind) if kind in inputKindOrder else len(inputKindOrder)
        earlier = [i for i, other in enumerate(moves) if inputKind(other[0]) in inputKindOrder[:order]]
        index = earlier[-1] + 1 if earlier else 0
    moves.insert(index, move)


def inatekkenMoves(characterId, cacheFolder):
    """The moves from the basic and character specific moves pages. The character specific moves page
    has the moves in the natural order, so it is used for the order, and the basic moves missing from it
    are inserted where they belong. A move on both pages has the values of the page with the newest
    snapshot, as the pages were not always updated at the same time."""
    pages = inatekkenPages(characterId, cacheFolder)
    for _, _, _, sectionTitles in pages:
        addFullStanceNames(characterId, sectionTitles)
    converted = {section: (timestamp, convertSeesaaCharacter(characterId, rows)) for section, timestamp, rows, _ in pages}
    characterTimestamp, moves = converted.get("固有技", ("", []))
    basicTimestamp, basicMoves = converted.get("基本技", ("", []))

    def unique(rows):
        counts = {}
        for row in rows:
            counts[row[0]] = counts.get(row[0], 0) + 1
        return {row[0]: row for row in rows if counts[row[0]] == 1}

    commands = {move[0] for move in moves}
    if basicTimestamp > characterTimestamp:
        newerBasic = unique(basicMoves)
        for i, move in enumerate(moves):
            if move[0] in newerBasic and move[0] in unique(moves):
                moves[i] = newerBasic[move[0]]
    for move in basicMoves:
        if move[0] not in commands:
            insertInNaturalOrder(moves, move)
    return moves


def wavuMoves(characterId, cacheFolder):
    title = wavuPages.get(characterId)
    if not title:
        return []
    url = WAVU_API_URL + "?" + urllib.parse.urlencode(
        {"action": "query", "prop": "revisions", "rvprop": "content", "rvslots": "main", "titles": title, "format": "json"}
    )
    cachePath = os.path.join(cacheFolder, f"wavu-{characterId}.json") if cacheFolder else None
    page = next(iter(json.loads(download(url, cachePath))["query"]["pages"].values()))
    # a page which does not exist yet has no revisions
    if "revisions" not in page:
        return []
    return convertWavuCharacter(html.unescape(page["revisions"][0]["slots"]["main"]["*"]))


def withoutProblems(getMoves):
    """Gets the moves of a source which is only used to fill in missing frames, so its problems are not reported."""
    count = len(problems)
    moves = getMoves()
    del problems[count:]
    return moves


def main():
    cacheFolder = sys.argv[1] if len(sys.argv) > 1 else None
    if cacheFolder:
        os.makedirs(cacheFolder, exist_ok=True)

    for characterId in sorted(set(inatekkenNames) | set(seesaaPages)):
        # inatekken has the most complete move list, with the commands, hit levels and notes
        if characterId in inatekkenNames and characterId not in seesaaPreferred:
            source = "inatekken"
            moves = inatekkenMoves(characterId, cacheFolder)
        else:
            source = "seesaawiki"
            moves = seesaaMoves(characterId, cacheFolder)
        if not moves:
            fail(f"No moves found for {characterId}")
        # the throws are added after the other moves, as in the T8 frame data. Hit throws and command throws
        # can also be in the move list, so only the throws which are not already there are added
        commands = {move[0] for move in moves}
        throws = [move for move in inatekkenThrows(characterId, cacheFolder) if move[0] not in commands]
        moves += throws

        # The japanese wikis are for the arcade version of Tekken 6 BR, and the frames of the console version,
        # which is played today, are often different. So the damage and frames are taken from the sources for the
        # console version where they have the move: wavu, which is tested in the game, and then Avoiding the Puddle
        wavu = withoutProblems(lambda: wavuMoves(characterId, cacheFolder))
        avoidingThePuddle = readAvoidingThePuddle(characterId)[0]
        replacedFrom = []
        for name, otherMoves in (("Avoiding the Puddle", avoidingThePuddle), ("wavu", wavu)):
            replaced = replaceFrames(moves, otherMoves, emptyCounterHitIsHit=name == "wavu") if otherMoves else 0
            if replaced:
                replacedFrom.append(f"{replaced} from {name}")
        addHomingNotes(moves, wavu or [])

        filledFrom = []
        fillSources = [("seesaawiki", withoutProblems(lambda: seesaaMoves(characterId, cacheFolder)))] if source == "inatekken" else []
        for name, fillMoves in fillSources:
            filled = fillMissingFrames(moves, fillMoves) if fillMoves else 0
            if filled:
                filledFrom.append(f"{filled} from {name}")
        writeCsv(characterId, moves, stancesUsed(characterId, moves))
        print(
            f"{characterId}: {len(moves)} moves from {source} with {len(throws)} throws, "
            f"frames from {', '.join(replacedFrom) or 'none'}, filled {', '.join(filledFrom) or 'none'}"
        )

    print(f"{len(skippedThrows)} throws left out, as they are done after a move which is only named:")
    for skipped in skippedThrows:
        print("  " + skipped)
    print(f"{len(problems)} moves with japanese text left:")
    for problem in problems:
        print("  " + problem)


if __name__ == "__main__":
    main()
