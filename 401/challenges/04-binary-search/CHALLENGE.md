# Challenge 4 — Binary Search

**Mission:** Binary search is not "find a number in a sorted array." It is a boundary-finder over any *monotone* space: sorted arrays, rotated arrays, ranges of candidate answers, even the value space of a matrix. Senior loops mostly ask the last two — the input looks unsorted, and the sorted thing is the answer space.

**Time:** ~60 minutes

---

## 😱 The phrase that pays

"Split the array into k contiguous parts, minimizing the largest part-sum."
Candidate A locks onto "minimize the maximum": feasibility of a candidate
answer is monotone, so binary search the answer range [max, sum] with a
greedy O(n) check — done in 15 minutes with a traced example. Candidate B
suspects DP, starts building a recurrence over (index, parts), and runs out
of time mid-table. "Minimize the maximum" / "maximize the minimum" is a
two-word flag for search-on-answer. Missing the flag costs the whole round.

## 🧰 What you'll learn

- **Classic search** — the `left <= right` equality shape
- **Boundary search** — first-true with `left < right` and `hi = mid`
- **Rotated arrays** — one half is always sorted; test the target against it
- **Search on answer** — binary searching a monotone predicate over a value range
- Feasibility checks: greedy, O(n) per probe, monotonicity proven aloud

## Pattern 1 — Sorted-space binary search: equality and boundaries

Two loop shapes, and mixing them is where off-by-ones breed. Equality
search: `while left <= right`, `mid ± 1` on both exits, return on hit.
Boundary search: `while left < right`, feasible → `hi = mid` (mid might *be*
the answer), infeasible → `lo = mid + 1`, return `lo`. Rotated arrays use
the equality shape plus one extra test: compare `nums[left]` to `nums[mid]`
to find which half is sorted, then check the target against that half's
range before discarding the other.

| You see… | Think… |
|---|---|
| Sorted array, find target or insertion point | Classic equality search |
| "First/last occurrence", "first element ≥ x" | Boundary search on a predicate |
| "Sorted array, rotated at an unknown pivot" | Find the sorted half; discard the other |
| O(log n) demanded on an array problem | Binary search in disguise |
| "Peak element", bitonic shape | Compare mid to mid+1; keep the rising side |

**Template — boundary search (first index where predicate is true):**

```
def first_true(lo, hi, ok):        # ok: F F F T T T over [lo..hi]
    while lo < hi:
        mid = (lo + hi) // 2
        if ok(mid):
            hi = mid               # mid works — keep it, search left
        else:
            lo = mid + 1           # mid fails — discard it
    return lo                      # first True; caller validates empties
```

**Complexity:** O(log n) time, O(1) space. The discipline: pick one shape
per problem, define `ok` precisely, and state the invariant — "everything
left of `lo` is false, everything right of `hi` is true." That sentence makes
the terminating state obvious and the off-by-ones checkable.

**Drills (easy → hard):** Binary Search → Find First and Last Position of
Element in Sorted Array (two boundary runs) → Find Minimum in Rotated Sorted
Array → Search in Rotated Sorted Array.

## Pattern 2 — Search on answer: binary search where nothing is sorted

The upgrade. If a candidate answer's feasibility is monotone — false below
the optimum, true at and above it — the *answer space* is sorted, and binary
search applies to any space with that shape: harvest rates, shipping
capacities, subarray-sum ceilings, even the kth-smallest value in a matrix
with sorted rows and columns (count elements ≤ mid in O(n) with a staircase
walk from the bottom-left). The feasibility check is usually greedy and
O(n); total cost is O(n log(hi − lo)).

| You see… | Think… |
|---|---|
| "Minimize the maximum / maximize the minimum" | Search on answer |
| "Minimum speed/capacity/rate to finish within a limit" | Monotone feasibility over a value range |
| Brute force would be O(range × n) | Compress the range factor to log |
| kth smallest with sorted rows/columns | Binary search the value; count ≤ mid fast |
| "Can we do X within budget Y?" | Feasibility predicate + binary search |

**Template — minimize the maximum split:**

```
def minimize_max_split(nums, k):
    def feasible(cap):                 # monotone in cap
        chunks, running = 1, 0
        for x in nums:
            if running + x > cap:
                chunks, running = chunks + 1, x
            else:
                running += x
        return chunks <= k
    lo, hi = max(nums), sum(nums)      # tight bounds — justify aloud
    while lo < hi:
        mid = (lo + hi) // 2
        if feasible(mid): hi = mid
        else: lo = mid + 1
    return lo
```

**Complexity:** O(n log(hi − lo)) time, O(1) extra space. The bounds are
part of the answer: `lo = max(nums)` because no split can dodge the largest
element, `hi = sum(nums)` because one chunk is always legal. Deriving those
two lines aloud is worth more than the binary search itself.

**Drills (easy → hard):** Koko Eating Bananas (min speed) → Capacity to Ship
Packages Within D Days (min weight) → Split Array Largest Sum (the template,
verbatim) → Kth Smallest Element in a Sorted Matrix (count-based feasibility).

Go deeper: [Hello Interview's binary-search chapter](https://www.hellointerview.com/learn/code/binary-search/overview) for rotated-array and search-on-answer walkthroughs.

## 🤖 Mock interview: run it

```text
You are a senior coding interviewer at a top tech company. Run one mock
interview with me on BINARY SEARCH, including search-on-answer problems
where the input is not sorted but a feasibility predicate is monotone.

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
6. When time is up or I say done, grade 1-5 each: correctness, complexity
   analysis, communication, edge cases — one line of evidence per score,
   then the single highest-leverage improvement.

Start with the problem statement. No preamble.
```

## ✅ Interview-ready when

- [ ] You keep the two loop shapes separate and can say when each applies
- [ ] You state the invariant ("left of lo false, right of hi true") before coding
- [ ] Rotated arrays: the sorted-half test is a reflex
- [ ] "Minimize the maximum" triggers search-on-answer in under a minute
- [ ] You derive lo/hi bounds aloud instead of defaulting to 0 and infinity
- [ ] You state O(n log(range)) and name where each factor comes from

## 📚 Jargon

| Term | What it means |
|---|---|
| Search space | The candidates still possible — your pointers bound it |
| Boundary search | Finding the first/last index where a predicate flips |
| Predicate (`ok`) | A yes/no feasibility test; binary search needs it monotone |
| Monotone | Once true, stays true (or vice versa) as the candidate grows — the precondition |
| Search on answer | Binary searching candidate *values* rather than array positions |
| Feasibility check | The greedy O(n) probe deciding which half survives |

## 🆘 When it goes wrong

- **Blanking.** Ask: is any quantity here monotone? If yes, you can binary
  search *it* even when the array is chaos. Saying that aloud is half the
  answer.
- **Wrong shape.** Mixing `left <= right` with `hi = mid` loops forever or
  skips the answer. Pick the shape, write the invariant next to it.
- **Off-by-one on mid.** `hi = mid` pairs with `while lo < hi` and no
  `mid ± 1`; `while left <= right` pairs with `mid ± 1` on both branches.
  The pairs go together — write them as a pair.
- **Non-monotone predicate.** If `ok` isn't monotone, binary search returns
  garbage silently. Verify the monotonicity claim out loud before coding.
- **Bounds too loose.** `lo = 0, hi = 10**18` works but signals guesswork.
  Tight bounds (`max`, `sum`) show you understood the problem's physics.
- **Skipping the trace.** Binary search bugs are invisible until you trace
  one 5-element example by hand. Do it before saying done.

➡️ **Next:** [Challenge 5 — Heaps](../05-heaps/)
