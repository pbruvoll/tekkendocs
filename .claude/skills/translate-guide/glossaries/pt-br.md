# Brazilian Portuguese Tekken glossary

Terminology for translating tekkendocs character guides into Brazilian Portuguese (`pt-br`). Taken
from Brazilian Tekken sources, not invented. **Append to this file** whenever a run needs a term that
is not here, and record where it came from.

## Approach

The Brazilian gaming press and Brazilian players keep the competitive jargon in English (combo,
frames, timing, Block Punish, Whiff Punish, juggle) and use Portuguese for the general vocabulary
around it (golpe, parede, dano, oponente, bloquear). Follow that: an over-translated term
("malabarismo" for juggle, "lançador" for launcher) reads as unnatural to the audience. Use
Brazilian forms, not European Portuguese ones: "você" (never "tu"/"vós"), "time" not "equipa",
"tela" not "ecrã", gerund "está bloqueando" not "está a bloquear".

## Kept in English

launcher, poke, jab, string, juggle, combo, counter hit (CH), frame data, frames, timing, hitbox,
hurtbox, backdash, crouch dash, sidestep, tracking, homing, wall splat, knockdown (KND), clean hit,
mixup, 50/50, frame trap, whiff, rushdown, chip, sabaki, parry, reversal, Power Crush, While
Standing, Sneak (SNK), knowledge check, matchup, and all Heat / Rage names (Heat, Heat Engager, Heat
Smash, Heat Burst, Heat Dash, Rage, Rage Art).

## Translated

| English | Brazilian Portuguese | Note |
| --- | --- | --- |
| move / attack | golpe / ataque | "golpe" for a single move |
| high / mid / low | alto / médio / baixo | high/mid/low also seen in English; prefer Portuguese in prose |
| punish | punição / punir | [CounterHit, Kenjiro, jogodeluta.com.br]; "Punições" is the section heading in texts/ptBr.ts |
| plus / minus frames | vantagem / desvantagem de frames | "fica -3", "+6 no bloqueio" |
| on block / on hit | no bloqueio / ao acertar | jogodeluta.com.br writes "no block / no hit"; both are understood, keep the Portuguese for consistency |
| block | bloquear / defesa | |
| guaranteed | garantido | |
| throw / grab | agarrão | Olhar Digital, CounterHit, Tekken Senshu, Kenjiro; break → quebrar |
| crouch | agachado | "a partir de agachado" |
| wall | parede | |
| floor | chão | |
| damage | dano | |
| range | alcance | |
| opponent | oponente / adversário | |
| character | personagem | masculine: "o personagem" |
| recovery | recuperação | |
| stance | postura | "Posturas" is the section heading |
| combo ender | finalização de combo | |
| tip | dica | |
| launch / launch punish | dar launcher / punir com launcher | "launcher" kept in English everywhere [CounterHit, Kenjiro]; no source found for the verb, "lançar" avoided (reads as throw) |
| whiff / whiff punish | errar, no whiff / punição de whiff, punir o whiff | "whiff" kept, slang verb "whiffar" [CounterHit, Kenjiro]; "Whiff Punish" [Olhar Digital] |
| hit confirm | confirmar (no hit / no CH) | "confirmável" for hit-confirmable |
| duck | se abaixar | "abaixar (Duck)" [CounterHit], "abaixado" [Tekken Senshu, Kenjiro]; "dá para se abaixar no 2º golpe" for duckable |
| crouch / full crouch | agachado / a partir de agachado | "agachado" [CounterHit, jogodeluta.com.br]; FC kept as notation |
| sidewalk | andar de lado | SSL/SSR/SWL/SWR kept |
| backturn (BT) | de costas | [CounterHit, Critical Hits]; "fica de costas", "mixup de costas" |
| high crush / low crush | passa por golpes altos / baixos | CounterHit describes crush moves as "passam por baixo ou por cima" |
| down jab | jab agachado | |
| trade | trocar golpes | "na troca" |
| keep-out, okizeme, frame trap, fuzzy guard, low parry, sabaki, tech roll, chip, stagger, tailspin, tornado | kept in English | |
| shoulder (move) | ombrada | |
| elbow / knee / headbutt | cotovelada / joelhada / cabeçada | |
| cane (Leroy) | bengala | |
| bazooka (Anna) | bazuca | |
| stomp | pisão | |
| chainsaws (Alisa) | motosserras | |
| hail mary | (golpe/launcher) de desespero | |
| turtle player / turtling | jogadores turtle / fazer turtle | kept in English [GameBlast, Kenjiro]; "tartaruga" was replaced |
| round ender | fechamento de round | |
| mental stack / mental frames | carga mental / frames mentais | |
| pancake flip | vira o oponente como uma panqueca | |
| "Jack of all trades, master of none" | faz de tudo um pouco, mas não é mestre em nada | |

## Quotes in prose

ASCII `"…"` is parsed as a command link, so never add ASCII quotes around Portuguese words; use
curly “ ”. When the source quotes an English word (`"electric"`, `"Keep away"`, `"get-off-me"`,
`"mix-up"`, `"Back"`), keep it verbatim and put the Portuguese gloss in parentheses after it. Keep
every occurrence of a repeated quoted command; the build fails on a merged sentence that drops one.

## Character names

Same as English (Dragunov, Hwoarang, Bryan, Zafina, Lili, Kuma/Panda).

## Register

Informal "você", direct coaching voice ("Aprenda o jab punish", "não fique apertando esse golpe").
Characters take the article: "o Kazuya", "a Lili". Female characters: Lidia, Asuka, Alisa, Azucena,
Reina, Nina, Anna, Lili, Jun, Xiaoyu, Kunimitsu, Miary Zo, Panda.

Who is male, female or unknown is listed in SKILL.md. In Portuguese: a male author gets "o" and
masculine forms ("o Koenji", "sou mais conhecido"); an author of unknown gender gets neutral wording
("feito por mim", "Jogo Tekken…"); Leo gets no article and no gendered adjectives.

## Per-character terms

Stance and move names stay in English, as in the Spanish glossary: KNK/BOK/LTG (Leo), MOR/BAO (Miary
Zo), ZEN/OMEN (Jin), SEN/DEN/LEN (Lars), SZN (Raven), HRM (Leroy), IZU/GEN/MIA (Jun), HAM/CJM/TOM
(Anna), DEW/Feisty Rabbit (Lili), SET/KAT (Kunimitsu), BAD (Armor King), GMH/GMC (Jack-8), PHX
(Clive), RAI/FUJ (Heihachi), MCR (Devil Jin), STC/KNP (Feng), IAI/PRF (Victor), LNH/FLK/PAB (Steve).
Raven: escape parry → parry de fuga, attack parry → parry de ataque, purple/gold clones → clones
roxos/dourados. Clive: Torgal → o cachorro (Torgal). Jack-8: red bubble → bolha vermelha. Miary Zo:
silver bullet → bala de prata, situation confirm → confirmar a situação. Victor: refined violence →
“violência refinada”.

## Research notes (2026-10-31)

Brazilian written Tekken material is thin: the community talks in videos, streams and Discord. The
sources below agree with the choices above; the only change the research forced was "tartaruga" →
"turtle". Also confirmed: safe/unsafe → seguro/inseguro, punível [jogodeluta.com.br, Kenjiro];
sidestep kept in English (CounterHit also says "esquiva"); counter hit, frame trap, fuzzy guard,
mixup, okizeme, hit confirm, poke, chip, juggle, Power Crush kept in English [CounterHit, Kenjiro,
jogodeluta.com.br]. Not confirmed by any source: the verb for launching, "fechamento de round"
(round ender), "jab agachado". A Brazilian player's review is still the best check.

## Sources

- [Olhar Digital — Tekken 8: Dicas para iniciantes](https://olhardigital.com.br/2024/02/12/dicas-e-tutoriais/tekken-8-dicas-para-iniciantes/) (combos, frames, timing, Block Punish, Whiff Punish kept in English; golpe, agarrões, parede, dano, oponente, bloquear, recuperação in Portuguese; reader addressed as "você")
- [CounterHit fórum — Tekken 7: Guia básico por Flunders](https://counterhit.com.br/forum/topic/3725-tekken-7-guia-b%C3%A1sico-por-flunders/) (Brazilian FGC forum: "abaixar (Duck)", "agachado" for FC, "agarrão", "quebrar", "punir/punição", "de costas" (BT), "whiffar"; launcher, backdash, juggle, poke, okizeme, Power Crush, counter hit kept in English)
- [Tekken Senshu — Dicionário do command list](https://tekkensenshu.blogspot.com/2010/01/tekken-dicionario-do-command-list.html) and [Legenda internacional dos golpes](http://tekkensenshu.blogspot.com/2010/02/legenda-internacional-dos-golpes-de.html) (Brazilian Tekken blog, 2010: "agarrão", "abaixando", "parede", WS "em pé", SS "esquivando"; uses the old "malabarismo" for juggle, which current sources no longer do)
- [Kenjiro (THE ZUERA) — Glossário de Street Fighter](https://kenjiro.blogspot.com/2016/) (Brazilian FGC glossary: launcher, whiff/"whiffar", fuzzy guard, frame trap, mixup, okizeme, hit confirm, turtle, juggle kept in English; punir, seguro, punível, agarrão, abaixado)
- [jogodeluta.com.br — Frame Data para iniciantes](https://jogodeluta.com.br/blog/frame-data-para-iniciantes) (punish/punição, seguro/inseguro, "agachado", frame trap, startup, recovery, counter-hit kept in English; "no block / no hit")
- [GameBlast — Arquétipos dos jogos de luta](https://www.gameblast.com.br/2023/08/jogos-luta-arquetipos-grappler-rushdown-zoner-fighting.html) (Brazilian outlet: turtler/turtling, rushdown, zoner, grappler kept in English; "agarrões")
