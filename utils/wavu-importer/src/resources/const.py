import os

WAVU_API_URL="https://wavu.wiki/w/api.php"

CHARACTER_ALIAS = {
    'alisa': ['ali', 'als'],
    'asuka': ['asu'],
    'azucena' :['azu'],
    'bryan': ['bry'],
    'claudio': ['cld', 'cla'],
    'devil_jin': ['dj', 'deviljin', 'dvj'],
    'dragunov': ['drag', 'sergei', 'dragu'],
    'jun': [],
    'feng': ['fen'],
    'hwoarang': ['hwo'],
    'jack8': ['j8', 'jack-8', 'jack'],
    'jin': ['jim'],
    'kazuya': ['kaz', 'kazze', 'masku'],
    'king': ['kin'],
    'kuma': ['panda', 'karhu', 'bear'],
    'lars': ['lar'],
    'law': ['marshall'],
    'lee': ['violet'],
    'leo': [],
    'lili': ['lil'],
    'raven': ['masterraven', 'mraven', 'maven', 'mrv', 'raven', 'mr'],
    'nina': ['nin'],
    'paul': [],
    'shaheen': ['sha'],
    'steve': ['stv', 'ste', 'fox'],
    'yoshimitsu': ['yoshi', 'manji', 'yos'],
    'xiaoyu': ['xiao', 'ling'],
    'zafina': ['zaffy', 'zaf'],
    "leroy": ['ler'],
    "generic": []
}

MOVE_TYPES = {
    "Rage Art": ["ra", "rage_art", "rageart", "rage art"],
    "Tornado": ["screw", "t!", "t", "screws","tor"],
    "Homing": ["homing", "homari"],
    "Power Crush": ["armor", "armori", "pc", "power", "power_crush", "powercrush", "power crush"],
    "Throw": ["throw", "grab", "throws", "grabs"],
    "Heat Engager":["he", "engager"],
    "Heat Smash" : ["hs", "smash"]
}

SORT_ORDER = {"Rage Art": 0, "Heat Engager": 1, "Heat Smash": 2, "Tornado": 3, "Homing": 4, "Power Crush": 5,
              "Throw": 6}

REPLACE = {
    ' ': '',
    ',': '',
    '/': '',
    'd+': 'd',
    'f+': 'f',
    'u+': 'u',
    'b+': 'b',
    'n+': 'n',
    'ws+': 'ws',
    'fc+': 'fc',
    'cd+': 'cd',
    'wr+': 'wr',
    'ra+': 'ra',
    'ss+': 'ss',
    '(': '',
    ')': '',
    '*+': '*',
    '.' : "",
    'ws.': 'ws',
    'fc.': 'fc',
}

BLACKLIST = ['ImVeryBad#5231', 'Nape Brasslers#1131', 'Sleepii#1337', 'iaa ibb beb ib#0000', 'ГЕНИЙ#5448', 'Beeno#6524',
             'Gigass-7#6960', 'nickname#0000', 'Sleepii#6666', 'scrotum buster#6919', 'Woozle#6308', 'Iam#1001',
             'ImVeryBad#5231']
ID_BLACKLIST = [1006234003893915679,240521686531702784]

EMOJI_LIST = ['1\ufe0f\u20e3', '2\ufe0f\u20e3', '3\ufe0f\u20e3', '4\ufe0f\u20e3', '5\ufe0f\u20e3']
