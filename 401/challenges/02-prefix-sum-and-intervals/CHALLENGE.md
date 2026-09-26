# Challenge 2 — Prefix Sum & Intervals

**Mission:** Two patterns about ranges. Prefix sum converts "aggregate over nums[i..j]" into one subtraction — and, with a hash map, counts subarrays by their sum. Intervals convert scheduling chaos into sort-then-compare-neighbors. Shared instinct: preprocess so every query or comparison is O(1).

**Time:** ~60 minutes

---

## 😱 The wrong-tool giveaway

"Count the subarrays that sum to k" — with negative numbers in the input.
Candidate A says immediately: "prefix sums with a running total and a map of
prefix counts; the negatives rule out a sliding window." Candidate B reached
for the window because it worked last round, and spent twenty minutes
fighting shrink conditions that cannot work. Pattern recognition is also
pattern *exclusion*: knowing the window needs validity that's monotone as it
grows, and that sums with negatives aren't, is the entire diagnosis. A
finished with tests traced; B never got a working answer.

## 🧰 What you'll learn

- **Prefix sums** — O(1) range aggregates from one linear preprocessing pass
- **Prefix + hash map** — counting subarrays by sum, negatives and all
- **Sorting intervals by start** — merge, detect conflicts, insert
- **Sorting intervals by end** — the greedy that keeps the most non-overlapping
- Boundary discipline: touching endpoints, empty inputs, the `{0: 1}` seed

## Pattern 1 — Prefix sum: pay once, query free

`prefix[i]` = sum of the first i elements, with `prefix[0] = 0`. Then
sum(nums[i..j]) = prefix[j+1] − prefix[i]. Anything additive works: vowel
counts, parity counts, balance deltas. The interview-classic variant counts
subarrays summing to k with a hash map from prefix value → times seen: a
subarray ending at `i` sums to k iff `total − k` appeared as an earlier
prefix, and the map tells you how many times.

| You see… | Think… |
|---|---|
| Many "sum/count over range [l, r]" queries, static array | Build prefix once; each query is O(1) |
| "Count subarrays with sum exactly k" (negatives allowed) | Running prefix + hash map of prior prefix counts |
| Range property is additive (vowels, parity, balance) | Binary prefix: 1 where the property holds, else 0 |
| Nested loops recomputing range totals | One prefix pass kills the inner loop |
| Tried a window but values go negative | Prefix + map, not a window |

**Template — subarray sum equals k:**

```
def subarray_sum_k(nums, k):
    count = total = 0
    seen = {0: 1}                      # empty prefix sums to 0 — seed it
    for x in nums:
        total += x                     # prefix sum through x
        count += seen.get(total - k, 0)  # subarrays ending here with sum k
        seen[total] = seen.get(total, 0) + 1
    return count
```

**Complexity:** O(n) to build, O(1) per range query, O(n) space. For the
counting variant: O(n) time and space, and the `{0: 1}` seed is what makes
subarrays starting at index 0 count. In fixed-width languages, ask about
magnitudes — prefix sums overflow.

**Drills (easy → hard):** Range Sum Query — Immutable → Subarray Sum Equals
K → Count Vowels in Substrings (batched range queries) → Contiguous Array
(equal-count balance as prefix + first-seen map).

## Pattern 2 — Intervals: sort, then compare neighbors

The whole game is the sort key. Sort by **start** to merge or detect
conflicts — after start-sorting, an interval can only collide with the block
before it. Sort by **end** to *keep* the maximum number of non-overlapping
intervals: the earliest-ending interval is always a safe first pick, because
it frees the timeline soonest. Sorting by end when the problem says
"minimum removals" is the tell of someone who drilled this.

| You see… | Think… |
|---|---|
| "[start, end] pairs — merge overlapping" | Sort by start; extend or append into an output block |
| "Can a person attend all meetings?" | Sort by start; any `curr.start < prev.end` → no |
| "Minimum removals so none overlap" / "max non-overlapping" | Sort by END; greedy keep |
| "Insert one interval into a sorted, disjoint list" | Three phases: before, merge-overlaps, after |
| "Free time / common gaps across schedules" | Merge everything, then report gaps between blocks |

**Template — merge intervals:**

```
def merge_intervals(intervals):
    intervals.sort(key=lambda iv: iv[0])
    merged = []
    for start, end in intervals:
        if not merged or start > merged[-1][1]:
            merged.append([start, end])              # disjoint: new block
        else:
            merged[-1][1] = max(merged[-1][1], end)  # overlap: extend
    return merged
```

**Complexity:** O(n log n) — the sort dominates; the merge pass is O(n) with
O(n) output space. Two boundary questions to ask out loud every time: do
touching endpoints overlap (`[1,4]` and `[4,7]`)? Does the problem want
`start > prev_end` or `>=`? Half of all interval bugs live in that one
comparison.

**Drills (easy → hard):** Can Attend Meetings → Merge Intervals →
Non-Overlapping Intervals (sort by end) → Employee Free Time (merge across
schedules, then take the gaps).

Go deeper: [Hello Interview's intervals chapter](https://www.hellointerview.com/learn/code/intervals/overview) for animated merge and greedy traces.

## 🤖 Mock interview: run it

```text
You are a senior coding interviewer at a top tech company. Run one mock
interview with me on PREFIX SUM and INTERVALS.

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

- [ ] You derive `prefix[j+1] − prefix[i]` on paper without hesitating
- [ ] The `{0: 1}` seed and why it exists is a sentence you can say
- [ ] You switch to prefix+map, not a window, the moment negatives appear
- [ ] Start-sort vs end-sort is an automatic choice, justified aloud
- [ ] You ask whether touching endpoints overlap before coding intervals
- [ ] You state O(n log n) for interval problems and attribute it to the sort

## 📚 Jargon

| Term | What it means |
|---|---|
| Prefix sum | Running-total array; any range aggregate becomes a subtraction |
| Seed value | The `{0: 1}` map entry standing in for the empty prefix |
| Range query | An aggregate question over `[l, r]` — what prefixes make O(1) |
| Sort key | The field intervals sort on: start for merging, end for greedy keeping |
| Greedy | Take the locally best pick (earliest end) and never reconsider |
| Overlap predicate | The comparison deciding collision — including whether touching counts |

## 🆘 When it goes wrong

- **Blanking.** Restate, then enumerate the brute force: "recompute each
  range, O(n·q) — the repeated work is re-adding the same leading elements."
  Prefix sums fall straight out of that sentence.
- **Wrong pattern.** A window over negatives is broken by design. If
  validity isn't monotone as the window grows, stop — prefix+map territory.
- **Off-by-one in indexing.** Pick one convention — `prefix[0] = 0`, so
  `sum(i..j) = prefix[j+1] − prefix[i]` — and write it down before coding.
  Convention drift is the classic interval bug.
- **Sort key mismatch.** Sorting by start for "max non-overlapping" fails
  silently when one long early interval blocks the rest. Keeping intervals →
  sort by end. Merging → sort by start.
- **No boundary questions.** Not asking about touching endpoints or empty
  input reads as inexperience. Ask, then code.

➡️ **Next:** [Challenge 3 — Stack & Linked List](../03-stack-and-linked-list/)
