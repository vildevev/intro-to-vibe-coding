# Challenge 9 — Greedy & Matrices

**Mission:** Two short, sharp topics. Greedy algorithms make one locally-optimal choice and never reconsider — legitimate only when provable, and the proof is either a one-sentence exchange argument or a counterexample that sends you to DP. Matrix problems are the opposite of data-structure-heavy: pure index manipulation — spiral bounds, transpose-plus-reverse rotations, in-place markers — where the difficulty is off-by-ones, not ideas.

**Time:** ~45 minutes

---

## 😱 Greedy, unproven

"Longest increasing subsequence — you can just walk it, right? Extend whenever
the next number is bigger." Candidate A's greedy works on the sample input,
and then the interviewer writes five numbers where the best subsequence starts
with a *smaller* value than A's opening pick — and A's answer collapses. Asked
to defend the approach, A has nothing: no argument, no counterexample test,
just a gut feeling that survived one example. Candidate B opens differently:
"my greedy choice is — give the smallest sufficient resource first. Proof
sketch: exchange argument — take any optimal solution, swap my choice in, and
the objective can only stay equal or improve." Same algorithm family, but B
has a defense, and a defense is what separates a greedy solution from a lucky
one. When the defense fails, that's not the end — it's the diagnosis:
counterexample found means DP (Challenge 10).

## 🧰 What you'll learn

- The greedy shape: sort by a key, sweep with O(1) running state, decide once
- The **exchange argument** — your one-sentence proof kit for greedy choices
- The **counterexample test**: how to disprove a greedy in five numbers, and
  why a found counterexample routes you to DP
- **Spiral order** with four shrinking bounds and two guards
- **Rotate 90°** = transpose + reverse; in-place zero-marking with row/col sentinels

## Pattern 1 — Greedy: the shape, the proof, the fork

Nearly every interview greedy is the same three moves: sort by some key so
the "best next choice" is always at the front, sweep once carrying one or two
running variables (min price so far, farthest reach, current interval end),
and commit to each choice immediately. The running variables ARE the state —
if you need the whole history, it isn't greedy anymore.

Then defend it, before coding. The **exchange argument**: take any optimal
solution, swap its first choice for yours, and show the objective can't get
worse — repeat, and greedy is optimal. It's usually one sentence keyed to the
sort key: "sorting by earliest end time can never hurt, because any solution
using a later-ending interval can swap in the earlier one and free up *more*
room." No argument comes? Run the **counterexample test**: hand-craft five
items that break the rule. Found one? Stop — that's a DP problem wearing a
greedy costume; Longest Increasing Subsequence is the canonical kill. The
litmus question: does my choice constrain the future *structurally* (options
change shape) or only additively (a budget ticks down)? Additive-only → greedy
plausible; structural → DP.

| You see… | Think… |
|---|---|
| "Maximize count / minimize cost", one pass feels enough | Sort + sweep + exchange argument |
| "Best single transaction" (buy low, sell high) | Running min; best = max(price − min so far) |
| "Can/fewest jumps to the end" with per-position reach | Track max reach; stuck when `i > max_reach` |
| "Start over when the tank runs dry" (circular route) | Greedy reset: every earlier start is dead too |
| An early choice changes what's possible later | DP (Challenge 10), not a patched greedy |

**Template — the running-extreme sweep:**

```
def best_single_transaction(prices):
    min_so_far = inf                     # cheapest buy up to today
    best = 0                             # best profit found so far
    for price in prices:
        min_so_far = min(min_so_far, price)
        best = max(best, price - min_so_far)
    return best
```

**Complexity:** O(n) time, O(1) space — or O(n log n) when a sort leads,
which is still a dramatic win over the O(n²) DP the same problem often has.
The proof sentence for this template: "for every sell day, the optimal
partner is the cheapest earlier day, and the running min is exactly that."

**Drills (easy → hard):** Best Time to Buy and Sell Stock → Jump Game
(max-reach) → Non-overlapping Intervals (earliest-end exchange argument) →
Gas Station (greedy reset).

## Pattern 2 — Matrix tricks: no data structure, just indices

Three templates cover the classic matrix round. **Spiral order:** four
boundaries (`top, bottom, left, right`), peel top row → right column → bottom
row → left column, shrinking a boundary after each peel, with two guards so a
single leftover row or column isn't walked twice. **Rotate 90° clockwise in
place:** transpose (swap across the main diagonal), then reverse each row —
counter-clockwise is transpose + reverse each *column*. **Set Matrix Zeroes in
O(1) space:** the first row and first column double as markers ("this row/col
must be zeroed"), which forces sequencing discipline — snapshot whether they
originally held zeros, mark the interior using them, zero the interior from
the markers, and zero the markers themselves last.

| You see… | Think… |
|---|---|
| "Traverse in spiral / boundary order" | Four shrinking bounds, four peels per loop |
| "Rotate 90° in place" | Transpose + reverse rows (CW) or columns (CCW) |
| "Zero rows/cols in place, O(1) extra space" | First row/col as markers; snapshot them first |
| "Diagonal traverse / anti-diagonals" | Cells on one diagonal share `r − c` (or `r + c`) |
| Grid + reachability/regions | It's a graph — flood fill (Challenge 6) |

**Template — spiral via boundary shrink:**

```
def spiral(matrix):
    top, bottom, left, right = 0, len(matrix) - 1, 0, len(matrix[0]) - 1
    out = []
    while top <= bottom and left <= right:
        out += matrix[top][left:right + 1]              # top row, →
        top += 1
        out += [r[right] for r in matrix[top:bottom + 1]]  # right col, ↓
        right -= 1
        if top <= bottom:                               # guard: row remains?
            out += matrix[bottom][left:right + 1][::-1] # bottom row, ←
            bottom -= 1
        if left <= right:                               # guard: col remains?
            out += [r[left] for r in matrix[top:bottom + 1]][::-1]
            left += 1
    return out
```

**Complexity:** all three tricks are O(m·n) time; spiral uses O(1) extra
space beyond the output, and rotate and set-zeroes are O(1) extra space
outright — the constraint the problem statement usually makes explicit.
Before saying "done," trace a 1×n, an n×1, and a 3×3; the guards exist
precisely for those.

**Drills (easy → hard):** Spiral Matrix → Rotate Image → Set Matrix Zeroes →
Diagonal Traverse.

Go deeper: [Hello Interview's greedy chapter](https://www.hellointerview.com/learn/code/greedy/overview) — their matrices chapter lives alongside it.

## 🤖 Mock interview: run it

```text
You are a senior coding interviewer at a top tech company. Run one mock
interview with me on GREEDY ALGORITHMS and MATRIX manipulation: exchange
arguments, greedy resets, in-place matrix transforms.

1. Pick ONE problem that maps to these patterns at senior difficulty.
   State it concisely: setup, input, output, one worked example, one
   constraint worth noticing. Do not name the pattern it uses.
2. Enforce a 30-minute timer. Warn me at 5 minutes left; stop me at zero.
3. Ask which language I'm using and hold me to it.
4. Hints only when I explicitly ask, one rung at a time, never code:
   (a) nudge — restate the constraint or point at a suspicious example;
   (b) direction — name the family of approach, not the algorithm;
   (c) structure — outline the algorithm's steps in words.
5. Interview like a senior loop: make me restate the problem, state my
   complexity unprompted, and trace one example before I call it done.
   If I propose a greedy, demand my proof or my counterexample test
   before accepting it.
6. When time is up or I say done, grade 1-5 each: correctness, complexity
   analysis, communication, edge cases — one line of evidence per score,
   then the single highest-leverage improvement.

Start with the problem statement. No preamble.
```

## ✅ Interview-ready when

- [ ] Every greedy claim arrives with an exchange argument or a counterexample
- [ ] "Counterexample found" instantly routes you to DP, not to patching
- [ ] The running-extreme sweep (min-so-far / max-reach) is reflexive
- [ ] Spiral bounds + both guards reproduce from memory
- [ ] Rotate direction (CW = transpose + reverse rows) needs no pause
- [ ] Set-zeroes sequencing — snapshot, mark, zero interior, zero markers — survives 3×3 and 1×n traces

## 📚 Jargon

| Term | What it means |
|---|---|
| Greedy choice | The locally-best option, committed to without revisiting |
| Exchange argument | Proof by swapping any alternative in and showing no improvement |
| Counterexample | A small input where the greedy pick demonstrably loses |
| Running extreme | One variable tracking min/max-so-far; the greedy sweep's whole state |
| Transpose | Reflect across the main diagonal: `m[i][j] ↔ m[j][i]` |
| Sentinel / marker | Repurposing existing cells (first row/col) to store metadata |

## 🆘 When it goes wrong

- **Greedy without a defense.** "It works on the example" is not an argument.
  Produce the exchange sentence or run the counterexample test — out loud,
  before coding.
- **Wrong sort key.** Scheduling intervals: sort by start vs by end changes
  the whole algorithm; earliest-end is the one with the clean exchange
  argument.
- **Spiral double-counts the middle.** On odd shapes the leftover single row
  or column gets walked twice without the two guards. Trace 3×3 and 1×5.
- **Rotated into a mirror.** Clockwise is transpose + reverse each row; if
  you reversed columns instead, you produced the counter-clockwise image.
- **Set-zeroes destroys its own evidence.** Zeroing the first row before
  scanning the interior wipes the markers you're about to read. The order is
  load-bearing: snapshot → mark → zero interior → zero markers.
- **Mutating while scanning without a plan.** In-place tricks all interact
  with iteration order; decide what "already processed" looks like before the
  first loop, and test the corner shapes.

➡️ **Next:** [Challenge 10 — Dynamic Programming](../10-dynamic-programming/)
