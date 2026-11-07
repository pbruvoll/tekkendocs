"""Tests for wavuJsonToCsv.

Run them from the root of the project with

    tekkendocs>python -m unittest discover -s utils
"""

import unittest

from wavuJsonToCsv import fillMissingVideosFromExtendedInput, getTransitions


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


def videosByInput(moves) :
    fillMissingVideosFromExtendedInput(moves)
    return {move["input"]: move.get("video", "") for move in moves}


class FillMissingVideosFromExtendedInputTest(unittest.TestCase) :

    def test_uses_the_extension_with_the_fewest_inputs(self) :
        # Lidia's 10-hit string comes before 2,2 in the move list
        moves = [
            {"input": "2", "target": "h"},
            {"input": "2,1", "target": "h, h"},
            {"input": "2,1,4,4,1,2,1,3,2,1", "target": "h, h, h, l, m, h, h, m, m, m", "video": "lidia-2,1,4,4,1,2,1,3,2,1.mp4"},
            {"input": "2,2", "target": "h, h", "video": "lidia-2,2.mp4"},
        ]
        self.assertEqual(videosByInput(moves), {
            "2": "lidia-2,2.mp4",
            "2,1": "lidia-2,1,4,4,1,2,1,3,2,1.mp4",
            "2,1,4,4,1,2,1,3,2,1": "lidia-2,1,4,4,1,2,1,3,2,1.mp4",
            "2,2": "lidia-2,2.mp4",
        })

    def test_counts_an_input_with_several_hits_once(self) :
        # Victor's f+2,2,2 ends in one input with three hits, f+2,2,1,1 has four inputs
        moves = [
            {"input": "f+2", "target": "h"},
            {"input": "f+2,2,1,1", "target": "h, h, m, m", "video": "f+2,2,1,1.mp4"},
            {"input": "f+2,2,2", "target": "h, h, h,m,m", "video": "f+2,2,2.mp4"},
        ]
        self.assertEqual(videosByInput(moves)["f+2"], "f+2,2,2.mp4")

    def test_counts_the_inputs_on_the_hit_level(self) :
        # Jin's d+3,4~4 comes out as one hit after d+3, so it is shorter than d+3,4,3
        moves = [
            {"input": "d+3", "target": "l"},
            {"input": "d+3,4", "target": "l, h"},
            {"input": "d+3,4,3", "target": "l, h, m", "video": "d+3,4,3.mp4"},
            {"input": "d+3,4~4", "target": "l, m", "video": "d+3,4t4.mp4"},
        ]
        self.assertEqual(videosByInput(moves)["d+3"], "d+3,4t4.mp4")

    def test_only_uses_videos_the_moves_have_of_their_own(self) :
        # 1,1 gets the video of 1,1,1, but 1 must not take it from 1,1 over 1,2
        moves = [
            {"input": "1", "target": "h"},
            {"input": "1,1", "target": "h, h"},
            {"input": "1,1,1", "target": "h, h, m", "video": "1,1,1.mp4"},
            {"input": "1,2", "target": "h, h", "video": "1,2.mp4"},
        ]
        self.assertEqual(videosByInput(moves)["1"], "1,2.mp4")

    def test_only_uses_moves_of_the_same_string(self) :
        # 1+2 starts with 1 but is not part of a string that starts with 1
        moves = [
            {"input": "1"},
            {"input": "1+2,1", "video": "1+2,1.mp4"},
        ]
        self.assertEqual(videosByInput(moves)["1"], "")

    def test_keeps_the_video_a_move_has(self) :
        moves = [
            {"input": "1", "video": "1.mp4"},
            {"input": "1,2", "video": "1,2.mp4"},
        ]
        self.assertEqual(videosByInput(moves)["1"], "1.mp4")
