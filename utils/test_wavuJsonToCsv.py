"""Tests for wavuJsonToCsv.

Run them from the root of the project with

    tekkendocs>python -m unittest discover -s utils
"""

import unittest

from wavuJsonToCsv import getTransitions


# every move below is taken from data/wavuConvertedCsv, given by the id in the
# comment. notes and recovery_state hold the Notes and Recovery state columns of
# that move, which is what getTransitions reads, and expected holds its
# Transitions column
transition_cases = [
    # a move with nowhere to go
    ("Recovers 2f faster on hit or block (t27 r17)", "", ""),                       # Jin-1

    # the destination is named by the notes and again by recovery_state, since the
    # notes usually mention the state the move recovers in as well
    ("* Transition to FC\n* High crush 6~50", "FC", "FC"),                          # Eddy-d+4
    # and once per input that reaches it on top of that
    ("* Transition to RLX\n* Cancel to RLX with D\n* High crush 6~54",
     "RLX", "RLX"),                                                                 # Eddy-SS.3

    # several destinations keep the order they are named in, with the repeat of
    # the recovery state dropped
    ("* Auto low parry ps20~79? at Mandinga Level 1\n"
     "** Transition to Ogum Mandinga on successful parry\n"
     "* Transition to HSP\n"
     "* Cannot block in stance \n"
     "** Must transition to r25 RLX with HSP.d_u to block in 25 frames\n"
     "* Floating state 14~53\n* Parry state 20~79\n* (MD1/2)",
     "HSP", "Ogum,HSP,RLX"),                                                        # Eddy-f+1+2

    # a stance qualified in parenthesis is the same destination as the bare one
    ("* Transition to UNS (Kou, d)\n"
     "* Transition to UNS (Gou) r20 with b+3\n"
     "* Transition to UNS (Kou) r18 with u+3\n"
     "* Transition to SEN r14 with f+3\n"
     "* Transition to WGS r1 with DF\n"
     "** Execute EWGF or EWGK by inputting 2 or 3 respectively exactly one frame after DF\n"
     "* Punch parry, transitions to WGS on successful parry with +13\n"
     "* Parry state 5~12",
     "UNS", "UNS,SEN,WGS"),                                                         # Reina-d+3

    # "attack throw" is not a stance and is ignored, leaving only the cancel
    ("* Transition to attack throw on CH, +22 damage\n"
     "* Cancel to r14 FC with D\n* High crush 6~", "FC", "FC"),                     # Asuka-b+1

    # a note saying the move does *not* transition is read as if it does, which
    # is a bug in the regex. it is harmless here only because DES is the state
    # the move recovers in anyway, so it must not show up twice
    ("* Heat Engager\n\n* Heat Dash +5, +43d (+35)\n\n* Homing\n* Balcony Break\n"
     "* Weapon\n* Combo from 1st hit\n* Interrupt with i6 from 1st block\n"
     "* 6 chip damage on block\n* 10 chip damage on block in Heat\n"
     "* Does not transition to DES when using Heat Dash", "DES", "DES"),            # Alisa-3,2
]


# moves whose notes say nothing about where they end up, so recovery_state is the
# only source of their destinations
recovery_only_cases = [
    ("", "BT MNT", "BT,MNT"),                                                       # Zafina-MNT.2+3
    ("* Low crush 26~54\n* Floating state 55~57", "SBT", "SBT"),                    # Alisa-f+3+4
    ("* Weapon\n* Combo from 1st hit\n* Interrupt with i4 from 1st block\n"
     "* 2 chip damage on block\n* 6 chip damage on block in Heat", "DES", "DES"),   # Alisa-3,f+2
]


class GetTransitionsTest(unittest.TestCase) :

    def test_collects_each_destination_once(self) :
        for (notes, recovery_state, expected) in transition_cases :
            move = {"notes": notes, "recovery_state": recovery_state}
            with self.subTest(notes=notes, recovery_state=recovery_state) :
                self.assertEqual(getTransitions(move), expected)

    def test_takes_the_state_a_move_recovers_in(self) :
        for (notes, recovery_state, expected) in recovery_only_cases :
            move = {"notes": notes, "recovery_state": recovery_state}
            with self.subTest(notes=notes, recovery_state=recovery_state) :
                self.assertEqual(getTransitions(move), expected)

    def test_reads_moves_without_a_recovery_state(self) :
        # throws have no recv field in wavu, so recovery_state is missing entirely
        move = {"notes": "* Transition to BT on hit"}
        self.assertEqual(getTransitions(move), "BT")
