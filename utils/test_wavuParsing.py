"""Tests for wavuParsing.

Run them from the root of the project with

    tekkendocs>python -m unittest discover -s utils
"""

import unittest

from wavuParsing import parse_recovery


# every recv value below is taken from a move in
# utils/wavu-importer/src/json_movelist, given by the id in the comment
recovery_cases = [
    # the plain shapes, which almost every move has
    ("r19", ("19", "")),                        # Alisa-1
    ("r29 DES", ("29", "DES")),                 # Alisa-3,2
    ("r25 BT MNT", ("25", "BT MNT")),           # Zafina-MNT.2+3
    ("32 FC", ("32", "FC")),                    # Asuka-f+1,4, which has no r prefix
    ("27", ("27", "")),                         # Alisa-SBT.1,2
    ("DES", ("", "DES")),                       # Alisa-DBT.f+1+2, a state without frames
    ("FC BT", ("", "FC BT")),                   # Xiaoyu-BT.f+3+4
    ("r FC", ("", "FC")),                       # Jack-8-2,1,2
    ("r", ("", "")),                            # Asuka-ws2,1,1, recovers in unknown frames
    ("", ("", "")),                             # Alisa-Back throw, which has no recv field

    # wavu marks a value it is unsure about with a ?. It is kept on the frames
    # and dropped from the state
    ("r24? BT JGS", ("24?", "BT JGS")),         # King-BT.3+4
    ("r25? BT FC", ("25?", "BT FC")),           # Xiaoyu-FC.db+3+4
    ("FC? r14?", ("14?", "FC")),                # Leo-BOK.n, state before frames
    ("RFF r33?", ("33?", "RFF")),               # Hwoarang-RFS.uf+4, state before frames

    # bugs in wavu, which are surfaced rather than swallowed so that they get fixed
    ("r31/33", ("31", "")),                     # King-1+3, only the first count is used
    ("r33 89", ("33", "")),                     # Yoshimitsu-f+3+4, the 89 is a stray count
    ("r101 STB or r76", ("101", "STB or")),     # Claudio-1+2,1+2,2, two branches in one value
    ("r BT/FUFT", ("", "BT/FUFT")),             # Armor King-df+3+4, states run together
    ("r FC/FDFT", ("", "FC/FDFT")),             # King-BT.d+4
    ("r (FUFT)", ("", "(FUFT)")),               # King-f,F+3+4, a state in parenthesis
    ("rFC", ("", "rFC")),                       # Jack-8-d+1, the r prefix glued to the state
    ("hFC", ("", "hFC")),                       # Lee-MS.b,n, looks like a typo for rFC
    ("js", ("", "js")),                         # Leroy-uf+3+4, jump status, not a recovery
]


class ParseRecoveryTest(unittest.TestCase) :

    def test_splits_recv_into_frames_and_state(self) :
        for (recv, expected) in recovery_cases :
            with self.subTest(recv=recv) :
                self.assertEqual(parse_recovery(recv), expected)
