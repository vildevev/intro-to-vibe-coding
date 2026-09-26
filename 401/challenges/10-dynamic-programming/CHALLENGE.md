# Challenge 10 — Dynamic Programming

**Mission:** The capstone. DP is not a collection of memorized solutions — it's a method with four steps written before any code: define the *state* as an English sentence, derive the *recurrence* from the choices it implies, pin the *base cases*, then implement top-down (memo) or bottom-up (table). Every pattern before this one funnels here: backtracking's call tree is DP's brute force, greedy's counterexamples route here, and the complexity instincts from nine challenges tell you whether the state count is survivable.

**Time:** ~90 minutes

---

## 😱 Two hundred problems, no method

Candidate A has grinded every classic DP problem on every list that exists —
Coin Change, House Robber, all of them, solutions memorized cold. Then the
interviewer asks something one degree off the canon, and A freezes: there's no
remembered solution to recall, and A never learned to *build* one. Meanwhile
Candidate B, who has done a fraction of the problems, writes four comment
lines in the first five minutes: "state: `best(i)` = answer for the first i
items; recurrence: max(skip, take); base: `best(0)` = 0; fill order:
ascending." From those four lines the code is mechanical, because every DP
solution is the same four lines wearing different clothes. The exam isn't "do
you know this problem" — it's "can you run the method on a problem you've
never seen."

## 🧰 What you'll learn

- The four-line precode: **state, recurrence, base cases, fill order**
- **Memoization** (top-down): brute force first, then two lines of cache
- **Bottom-up**: the loop version, and when it's the better default
- The **1D → 2D jump**: grids, string pairs, and constraint dimensions
- The **state template library** — knapsack, LIS, string-pair, grid-path —
  and why DP closes the course

## Pattern 1 — The method: state, recurrence, base, order

Do not write code first. Write four sentences as comments. (1) *State*: a
full English sentence with an index in it — "`best(i)` = the maximum haul
from the first i houses." Vague states are where all DP bugs are born.
(2) *Recurrence*: the choices at each state, as a max/min/sum over earlier
states — "house i: skip it (`best(i−1)`) or take it (`best(i−2) +
value[i−1]`)." (3) *Base cases*: the smallest inputs answered directly.
(4) *Fill order*: which states must exist before which.

Then top-down is mechanical: take the brute-force recursion your recurrence
describes and add two lines — check the memo before recursing, store the
result before returning. Bottom-up is the same recurrence as a loop from the
base cases: no call-stack risk, cache-friendly, and the space optimization
("keep only the last k values") reads naturally off the loop. Interview
default: top-down first, convert only if asked.

| You see… | Think… |
|---|---|
| "Maximize / minimize / count the ways" over a sequence | DP; write the four lines first |
| Brute-force recursion is exponential | Overlapping subproblems — memoize it |
| Greedy counterexample found (Challenge 9) | DP is the fallback — start at the state |
| "How many distinct ways to reach/build X" | Counting DP: sum the branches |
| Earlier choices poison later ones | The signature DP smell — no greedy fix |

**Template — top-down memo over a 1D state:**

```
def solve(items):
    memo = {}
    def dp(i):                        # dp(i) == <state sentence here>
        if i in memo:
            return memo[i]
        if i <= 1:                    # base cases: smallest states
            return base_value(i)
        take = dp(i - 2) + value_of_taking(i)
        skip = dp(i - 1)
        memo[i] = max(take, skip)     # max / min / sum — per the ask
        return memo[i]
    return dp(len(items))
```

**Complexity:** number of states × work per state — the sentence that covers
every DP problem. Here: O(n) time (n states, O(1) each) and O(n) space for
memo plus call stack; the unmemoized brute force is O(2ⁿ). Quoting both
numbers is the whole complexity story of the pattern.

**Drills (easy → hard):** Climbing Stairs → House Robber → Coin Change (min
over take-branches) → Longest Increasing Subsequence (state = best *ending
exactly at* i).

## Pattern 2 — The 1D → 2D jump, and the state template library

The real difficulty spike is dimensionality, and it comes from exactly three
sources. **Grids**: `dp[i][j]` = answer for cell (i, j); the recurrence reads
the neighbors you could have arrived from (Unique Paths: from above + from
the left; first row and column are base cases). **String pairs**: `dp[i][j]`
over prefixes of *both* strings — match moves diagonally, mismatch takes the
min over the three neighbors (Edit Distance, Longest Common Subsequence).
**Constraint dimensions**: the state needs a second coordinate to stay honest
— (item index, capacity left) for knapsacks, (node, stops remaining) for the
K-stops flight problem.

| You see… | Think… |
|---|---|
| Answer for a *position* in one sequence | 1D linear: `dp[i]` from `dp[i−1]`, `dp[i−2]` |
| Answer for a *cell* in a grid | 2D: `dp[i][j]` from arrival neighbors |
| Two strings in the problem | `dp[i][j]` = prefixes of both; diagonal on match |
| "Fewest items to total exactly x", reusable items | Unbounded knapsack: `dp[x] = 1 + min(dp[x − c])` |
| …subject to capacity w | 0/1 knapsack: `dp[i][w]`, items outer, capacity inner |
| "Best subsequence ending at i" | `dp[i]` over all j < i (LIS); O(n²) |
| Paths to cell (i, j) | `dp[i][j] = up + left`; obstacles contribute 0 |

**Template — 2D bottom-up over a grid:**

```
def grid_dp(rows, cols):
    dp = [[0] * cols for _ in range(rows)]
    dp[0][0] = seed
    for j in range(1, cols): dp[0][j] = base_from_left   # first row
    for i in range(1, rows): dp[i][0] = base_from_top    # first col
    for i in range(1, rows):
        for j in range(1, cols):
            dp[i][j] = combine(dp[i - 1][j],    # from above
                               dp[i][j - 1],    # from the left
                               dp[i - 1][j - 1])# diagonal, if the ask needs it
    return dp[rows - 1][cols - 1]
```

**Complexity:** O(rows × cols) states × O(1) each = O(rows × cols) time and
space; when the recurrence touches only the previous row, one row plus a
carry variable does the same job — offer that unprompted, it's a favorite
follow-up. The knapsack shape is the same arithmetic: O(amount × coins) time,
O(amount) space, with `dp[0] = 0` as the base and "unreachable" as infinity.

**Why DP comes last:** backtracking (Challenge 8) *is* the brute force whose
call tree you memoize — same states, repeats removed; greedy (Challenge 9)
fails its counterexample test and hands the problem here; and the recognition
reflexes from every earlier challenge tell you within a minute whether the
state space is polynomial or hopeless. The senior narration is the pipeline
itself: brute force out loud → which states repeat? → memo → bottom-up →
squeeze space.

**Drills (easy → hard):** Unique Paths → Decode Ways (counting with validity
gates) → Word Break (state = prefix length; choices = dictionary words) →
Edit Distance (the string-pair 2D).

Go deeper: [Hello Interview's dynamic programming chapter](https://www.hellointerview.com/learn/code/dynamic-programming/overview) for worked builds from brute force to optimized.

## 🤖 Mock interview: run it

```text
You are a senior coding interviewer at a top tech company. Run a DP capstone
mock: TWO back-to-back dynamic programming problems, back to back, no break.

1. Pick problem ONE at senior difficulty on an unseen-feeling DP variant
   (mix 1D, 2D, knapsack, or string-pair across the two problems).
   State it concisely: setup, input, output, one worked example, one
   constraint worth noticing. Do not name the pattern or the state.
2. Enforce a 30-minute timer PER problem. Warn me at 5 minutes left;
   stop me at zero.
3. Ask which language I'm using and hold me to it.
4. Hints only when I explicitly ask, one rung at a time, never code:
   (a) nudge — restate the constraint or point at a suspicious example;
   (b) direction — name the family of approach, not the algorithm;
   (c) structure — outline the algorithm's steps in words.
5. Interview like a senior loop: make me restate the problem, state my
   complexity unprompted, and trace one example before I call it done.
6. GRADE PATTERN-RECOGNITION SPEED explicitly: time from problem
   statement to a correct state definition, in minutes, for each problem.
7. After both problems, grade 1-5 each: correctness, complexity
   analysis, communication, edge cases, pattern-recognition speed —
   one line of evidence per score per problem, then the single
   highest-leverage improvement across the pair.

Start with problem one. No preamble.
```

## ✅ Interview-ready when

- [ ] State / recurrence / base / order exist as four comment lines before code
- [ ] "#states × work per state" is your default complexity sentence
- [ ] Brute force → memo is mechanical: check cache, store result, return
- [ ] 1D vs 2D decided in the first minute — with the second dimension named
- [ ] You offer the rolling-row / last-k-variables space cut unprompted
- [ ] Two unseen problems in 30 minutes each: state defined inside 5 minutes

## 📚 Jargon

| Term | What it means |
|---|---|
| State | The subproblem your table entry solves, defined precisely enough to index |
| Recurrence relation | The answer for one state written in terms of earlier states |
| Memoization | Caching each state's result on first computation (top-down) |
| Top-down / bottom-up | Recursion + cache, vs loop from base cases to the answer |
| Overlapping subproblems | The same states computed repeatedly — DP's reason to exist |
| Optimal substructure | The optimal answer assembles from optimal sub-answers |
| Knapsack | State = (items considered, budget remaining); the cost/value workhorse |
| Rolling row | Keeping only the previous row/last k values when the recurrence allows it |

## 🆘 When it goes wrong

- **A vague state.** "dp[i] is… the answer-ish thing" produces off-by-ones
  and wrong recurrences. Write the full English sentence with the index in
  it; if you can't, you don't have a state yet.
- **Fill order violated.** Bottom-up reads states that must already exist —
  `dp[i]` depends on `dp[i−1]`, `dp[i−2]` → loop ascending. One wrong
  direction and you read zeros.
- **Index convention drift.** "First i items" (table size n+1) and "item at
  index i" (size n) are both fine — mixed in one solution they cause most DP
  crashes. Pick one, write it in a comment, keep it.
- **Right structure, wrong combiner.** Maximize → `max`, minimize → `min`,
  count ways → `sum`. Mixing them yields plausible-looking wrong answers that
  pass eyeball tests on tiny inputs.
- **Memo never written.** Compute the value, store it… and forget to return
  it, or store after the return. The cache stays empty and the runtime stays
  exponential — check the memo is populated before declaring victory.
- **Pattern-matching instead of state-building.** "This looks like Coin
  Change, so the answer is probably—" is the trap of this challenge's war
  story. Run the four lines on THIS problem; shapes only help after the state
  is written.

➡️ **Next:** [Full system design mocks — 301 Challenge 12](../../../301/challenges/12-full-designs/)
