# Challenge 1 — Two Pointers & Sliding Window

**Mission:** Two patterns that turn O(n²) scans into O(n) passes: converging pointers that eliminate candidates provably, and a sliding window whose state is updated incrementally instead of recomputed. Both are recognizable in the first 60 seconds of a problem — and at senior level, that recognition *is* the signal being graded.

**Time:** ~60 minutes

---

## 😱 The 60-second fork

Two candidates get "longest substring with at most K distinct characters."
Candidate A hears *contiguous* + *constraint* and says "variable sliding
window, count-dict state, O(n) time, O(k) space" — then spends the round
arguing whether the shrink loop is amortized constant. Candidate B starts a
nested loop generating subarrays, stays silent for ten minutes, and offers
"maybe there's a smarter way" at minute 18. Identical knowledge, opposite
outcomes: A narrated a pattern and its complexity; B narrated a CPU burning.
The interviewer can only grade what's spoken.

## 🧰 What you'll learn

- **Converging pointers** — sorted pairs, palindromes, and the "move the
  worse side" elimination argument
- **Region pointers** — same-direction indices that partition an array in place
- **Fixed-length windows** — add one element, drop one, O(1) per position
- **Variable-length windows** — grow until invalid, shrink until valid
- Choosing window *state* (sum, counts, last-seen) that supports O(1) updates
- Why the shrink loop is amortized O(1) — and saying so unprompted

## Pattern 1 — Two pointers: eliminate, don't enumerate

The technique is two indices into one array where every move provably
discards candidates you'll never need again. Sorted input → converge from
both ends (Two Sum II, palindromes). Unsorted but with a "worse side" →
still converge (move the shorter wall). Reordering in place → same-direction
pointers carving regions with an invariant (Move Zeroes, Sort Colors).

| You see… | Think… |
|---|---|
| Sorted array, "pair that sums / compares to target" | Converge `left`/`right` from both ends |
| "Valid/longest palindrome" in a string or list | Converging pointers comparing ends inward |
| "Triplets with a sum property" | Sort once, fix outer element, two-pointer the rest |
| "Maximize width × min(height) between two lines" | Start widest; always move the shorter side |
| In-place partition / reorder (zeroes, colors) | Same-direction pointers + swap, regions by invariant |

**Template — converging pointers:**

```
def two_pointer(nums):                 # sorted, or sort first
    left, right = 0, len(nums) - 1
    best = 0
    while left < right:
        if pair_hits_target(nums[left], nums[right]):
            return True                # or record and keep going
        if too_small(nums[left], nums[right]):
            left += 1                  # need a bigger value
        else:
            right -= 1                 # need a smaller value
    return best
```

**Complexity:** O(n) after an optional O(n log n) sort, O(1) space. The
correctness argument is always one sentence: "moving this pointer can only
discard pairs that were already worse." Practice saying it — that sentence is
what interviewers probe.

**Drills (easy → hard):** Two Sum II (sorted input) → Valid Palindrome →
3Sum (sort, fix, dedupe) → Trapping Rain Water (process the side with the
smaller running max).

## Pattern 2 — Sliding window: incremental state, not re-scanning

For *contiguous* subarrays/substrings. Fixed-length when the size is given;
variable when a constraint defines validity. The state must support add,
remove, and validity-check in O(1): a running sum, counter dict, set, or
last-seen indices. If your first draft is a nested loop over subarrays,
you're one refactor away from this pattern.

| You see… | Think… |
|---|---|
| "Max/min over every subarray of size k" | Fixed window: add `nums[end]`, drop `nums[start]` |
| "Longest/shortest substring with a constraint" | Variable window, count-dict state |
| Nested loop over all subarrays | Incremental state, then window |
| "Pick k cards from the ends" | Reframe as a min/max window of size n − k |
| Validity depends on counts (distinct, anagram) | Counter dict; delete keys when count hits 0 |

**Template — variable window:**

```
def variable_window(s):
    state = {}                         # counts / sum / last-seen indices
    start, best = 0, 0
    for end in range(len(s)):
        add(s[end], state)             # extend right, O(1)
        while invalid(state):          # shrink left until valid again
            remove(s[start], state)
            start += 1
        best = max(best, end - start + 1)   # invariant: window valid here
    return best
```

**Complexity:** O(n) time — `end` moves n times, `start` moves at most n
times, so the shrink loop is amortized O(1), not O(n) per step. Space O(k)
for the state (alphabet size for strings). The state choice is the real
difficulty: Character Replacement needs `max_freq`; no-repeats can jump
`start` directly with last-seen indices instead of shrinking one-by-one.

**Drills (easy → hard):** Maximum Sum Subarray of Size K → Longest Substring
Without Repeating Characters → Longest Repeating Character Replacement
(`k + max_freq >= len(window)`) → Minimum Window Substring.

Go deeper: [Hello Interview's sliding-window chapter](https://www.hellointerview.com/learn/code/sliding-window/overview) for animated traces of both variants.

## 🤖 Mock interview: run it

```text
You are a senior coding interviewer at a top tech company. Run one mock
interview with me on TWO POINTERS and SLIDING WINDOW.

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

- [ ] You state the elimination argument for converging pointers in one sentence
- [ ] Fixed vs variable window — you choose in seconds and say why out loud
- [ ] The variable-window skeleton is on paper from memory in under 2 minutes
- [ ] You explain the amortized O(1) shrink loop without being asked
- [ ] 3Sum duplicate-skipping works on the first try
- [ ] You volunteer "O(n) time, O(k) space" before the interviewer asks

## 📚 Jargon

| Term | What it means |
|---|---|
| Two pointers | Two indices moving under rules that provably discard candidates |
| Converging pointers | One index at each end, moving inward |
| Window state | The O(1)-updatable summary of the current window (sum, counts, last-seen) |
| Invariant | A property true before and after every iteration — name it and off-by-ones die |
| Amortized O(1) | Cheap on average across the run, even if individual steps cost more |
| In-place | Rearranging the input itself with O(1) extra space |

## 🆘 When it goes wrong

- **Blanking on the opener.** Say the brute force aloud: "all pairs, O(n²) —
  the waste is pairs that a sorted order eliminates." The improvement writes
  itself out of that sentence.
- **Wrong pattern.** "Max subarray sum" with *negatives* and no fixed size is
  not a window — that's prefix sums (Challenge 2). Contiguous + constraint →
  window; any subarray → prefix.
- **Off-by-one at the edges.** Fixed window: record only when
  `end - start + 1 == k`, after adding. Variable: record *after* the shrink
  loop, never before.
- **State leaks.** A count that hits 0 must be deleted from the dict, or any
  `len(state)`-based validity check silently lies.
- **Silent coding.** Narrate every pointer move: "sum is 9 < 13, so left
  advances." Commentary is the senior signal; silence reads as stuck.

➡️ **Next:** [Challenge 2 — Prefix Sum & Intervals](../02-prefix-sum-and-intervals/)
