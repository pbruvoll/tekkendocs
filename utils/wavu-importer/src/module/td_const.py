from typing import Dict
import enum

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
    OTHER = "Other"

SORT_ORDER: Dict[MoveCategory, int] = {
    MoveCategory.HEAT_BURST: -10,
    MoveCategory.HEAT_SMASH: 0,
    MoveCategory.HEAT_MOVE: 10,
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
    MoveCategory.RUNNING: 117,
    MoveCategory.WHILE_RISING: 118,
    MoveCategory.SIDESTEP: 119,
    MoveCategory.OTHER: 120,
    MoveCategory.THROW: 130,
}