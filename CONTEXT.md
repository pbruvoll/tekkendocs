# TekkenDocs Quiz Context

This context defines the user-facing language for quiz progress and performance metrics in TekkenDocs.

## Language

### Frame Quiz Metrics

**Recent 200 Answer Window**:
A rolling window of the most recent 200 frame-quiz answers across sessions, where each new answer removes the oldest once the window is full.
_Avoid_: Session accuracy, all-time accuracy, daily accuracy

**Lifetime Answer Count**:
The total number of frame-quiz questions the player has answered across all sessions, which only resets when browser storage is cleared.
_Avoid_: Current run count, daily count

**Personal Best Streak**:
The highest consecutive-correct streak ever reached in frame quiz across all sessions.
_Avoid_: Current streak, daily best

**Personal Best Rank**:
The rank representation derived from Personal Best Streak.
_Avoid_: Current session rank, temporary rank

**Stats Baseline**:
For players without prior persisted frame-quiz stats, persisted metrics start at zero and build from the next answered question.
_Avoid_: Retroactive reconstruction, inferred history

**T8 Frame Quiz Stats Scope**:
Persisted quiz stats in this feature apply only to Tekken 8 endless frame quiz and are not shared with other quiz modes or game versions.
_Avoid_: Global quiz stats, cross-mode aggregate

**Recent 200 Accuracy**:
Accuracy for recent performance is calculated as correct answers divided by the current size of the Recent 200 Answer Window, rounded to the nearest whole percent.
_Avoid_: Fixed denominator of 200 during warmup

## Example dialogue

Dev: Should we show accuracy from only this run?

Domain expert: No. Use the Recent 200 Answer Window so the metric reflects recent performance, not just one session.

Dev: If the player answers one more question after reaching 200, what happens?

Domain expert: The oldest answer drops out and the newest answer enters, so the window always stays at 200.