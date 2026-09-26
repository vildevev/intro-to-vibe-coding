# Challenge 8 — Backtracking

**Mission:** Systematic enumeration: a DFS over an implicit *solution-space tree*, where every call chooses an option, explores what that choice makes possible, and un-chooses it on the way out. Backtracking is exponential by nature — the interview grades three things: how fast you draw the tree, whether you mutate one shared path instead of copying at every step, and whether you prune branches that provably cannot succeed.

**Time:** ~60 minutes

---

## 😱 The copy you didn't need

Two candidates enumerate subsets of a 25-element array. Candidate A builds
each candidate as `path + [x]` — a fresh list at every call. Correct output,
but thousands of throwaway lists per second, and the follow-up ("walk me
through your memory profile?") has no good answer. Candidate B keeps *one*
path list, appends on the way down, pops on the way up, and copies only when
recording a finished solution — then says "time is output-sized anyway: 2²⁵
subsets, each up to 25 elements; the shared path keeps the constant down."
Same outputs, opposite engineering. And the third failure mode is silent:
skip the `pop()` and the path never shrinks — results come back duplicated
and garbage-padded, a bug no two-element test input will ever catch.

## 🧰 What you'll learn

- **Solution-space trees** — nodes are partial solutions, edges are decisions
- The **choose → explore → un-choose** skeleton with one shared mutable path
- The three canonical shapes — subsets, permutations, combinations — and the
  one-line difference (record-at-entry vs used-set vs start index)
- **Pruning**: validity filters before recursing, sort-then-break, mark-and-restore
- Complexity as output size — saying O(n·2ⁿ) with the "why" attached

## Pattern 1 — The skeleton, and its three canonical shapes

Almost no backtracking problem gives you a tree; you build it as you go. Each
recursive call is one node, each loop iteration is one edge, and the
parameters are exactly the state needed to know which options remain. The
discipline that holds under pressure: one shared path list; append is
*choose*, the loop of recursive calls is *explore*, pop is *un-choose*; every
recorded answer is a copy (`path[:]`), because the shared path keeps mutating
after you record it.

The shapes differ in exactly two decisions: *when to record* and *what limits
the loop*. Subsets: every node is an answer, so record at entry — no base case
beyond "keep walking." Permutations: order matters and there's no natural
"later" index, so the loop scans everything and a `used` set excludes what's
already on the path. Combinations of size k: subsets' start-index loop, but
record only when `len(path) == k`. Reuse allowed (Combination Sum)? Recurse
with `i`, not `i + 1`. Duplicates in the input? Sort first, then skip
`nums[i] == nums[i-1]` when `i > start` — that skips duplicate *siblings*
without killing legitimate duplicate *depths*.

| You see… | Think… |
|---|---|
| "Return ALL valid X" | Backtracking; "count/best X only" is probably DP (Challenge 10) |
| "All subsets / the power set" | Record at every node; loop from `start` |
| "All permutations / orderings" | `used` set, loop over everything |
| "All combinations of size k" | Start-index loop; record at `len(path) == k` |
| Elements reusable | Recurse with `i` (not `i + 1`) |
| Duplicate inputs, unique outputs required | Sort; skip equal values at the same level |

**Template — subsets via the start-index loop (the canonical shape):**

```
def subsets(nums):
    result, path = [], []
    def dfs(start):
        result.append(path[:])           # EVERY node is a valid subset
        for i in range(start, len(nums)):
            path.append(nums[i])         # choose
            dfs(i + 1)                   # explore — i+1: never look back
            path.pop()                   # un-choose
    dfs(0)
    return result
```

Swap the record point and the loop bounds and the same skeleton becomes every
other shape: record only at `len(path) == k` for combinations; drop `start`,
loop over everything with a `used` set for permutations.

**Complexity:** subsets O(n·2ⁿ) — 2ⁿ subsets, each copied at O(n);
permutations O(n·n!); combinations O(k·C(n,k)). The senior sentence: "this is
optimal up to constants because the output itself has that size" —
output-size bounds are the complexity argument interviewers actually probe
here.

**Drills (easy → hard):** Subsets → Permutations → Combinations → Subsets II
(sort + sibling-skip).

## Pattern 2 — Pruning: cut the tree before you grow it

The exponential tree is only the worst case; constraint checks applied at the
loop level shrink it in practice, and naming them is the difference between
"brute force" and "exhaustive search with pruning." Three moves cover most
problems. Validity as loop filters: Generate Parentheses admits "(" while
`open < n` and ")" while `close < open` — each rule an `if` that never
recurses into a doomed subtree. Sort-then-break: Combination Sum sorts so the
first candidate exceeding the remaining target lets you `break` — everything
after is worse. Mark-and-restore on grids: writing `#` into the cell is
*choose*, restoring it is *un-choose*, and the grid doubles as the visited
set. Pair a grid hunt with a trie (Challenge 7) and the prune becomes "no
dictionary word shares this prefix" — whole subtrees die on the first dead
letter.

| You see… | Think… |
|---|---|
| "Well-formed / valid X only" | Encode validity as loop filters |
| Grid + word, no cell reused | Mark cell, recurse 4 ways, restore |
| "Sum to target", positive inputs | Sort; break when the option overshoots |
| Matching a dictionary while walking | Trie-backed pruning on the prefix |

**Template — mark-and-restore grid word search:**

```
def exists(board, word):
    rows, cols = len(board), len(board[0])
    def dfs(r, c, i):
        if i == len(word): return True
        if not (0 <= r < rows and 0 <= c < cols): return False
        if board[r][c] != word[i]: return False
        board[r][c] = "#"                # choose: mark (grid = visited set)
        found = any(dfs(r + dr, c + dc, i + 1)
                    for dr, dc in ((1,0),(-1,0),(0,1),(0,-1)))
        board[r][c] = word[i]            # un-choose: restore, win or lose
        return found
    return any(dfs(r, c, 0)
               for r in range(rows) for c in range(cols))
```

**Complexity:** O(rows·cols · 3^L) — 3, not 4, because the mark prevents
stepping back onto the cell you came from (the very first step has 4 options).
Restoring the cell on *both* branches keeps that bound honest; a missing
restore turns "no reuse on this path" into "no reuse ever," which silently
rejects valid answers.

**Drills (easy → hard):** Word Search → Generate Parentheses (two filter
rules) → Combination Sum (sort + break + reuse) → N-Queens (diagonal sets).

Go deeper: [Hello Interview's backtracking chapter](https://www.hellointerview.com/learn/code/backtracking/overview) for animated solution-space trees.

## 🤖 Mock interview: run it

```text
You are a senior coding interviewer at a top tech company. Run one mock
interview with me on BACKTRACKING: subsets, permutations, combinations,
constrained generation, and grid word search.

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
   complexity unprompted (attribute the exponent to the output size), and
   trace one example before I call it done.
6. When time is up or I say done, grade 1-5 each: correctness, complexity
   analysis, communication, edge cases — one line of evidence per score,
   then the single highest-leverage improvement.

Start with the problem statement. No preamble.
```

## ✅ Interview-ready when

- [ ] You sketch two levels of the solution-space tree before writing code
- [ ] One shared path + pop; `path[:]` copies appear only when recording
- [ ] Subsets vs permutations vs combinations is a one-line answer each
- [ ] You say O(n·2ⁿ) / O(n·n!) unprompted and credit the output size
- [ ] Mark-and-restore happens on every branch, including failures
- [ ] Sort + skip-equal-siblings is reflex the moment inputs repeat

## 📚 Jargon

| Term | What it means |
|---|---|
| Backtracking | DFS over implicit candidate solutions; undo each choice on the way out |
| Solution-space tree | The tree of partial solutions; nodes = calls, edges = decisions |
| Choose / explore / un-choose | Mutate state, recurse, exactly reverse the mutation |
| Pruning | Refusing to recurse into subtrees that provably can't succeed |
| Start index | Loop lower bound that stops combinations from reordering earlier picks |
| Mark-and-restore | Temporarily overwriting a cell as the visited marker, then restoring it |
| Sibling skip | Skipping a duplicate value at one tree level to avoid duplicate outputs |

## 🆘 When it goes wrong

- **A choose without its un-choose.** Every mutation needs an exact inverse on
  the way out. Missing pops leave the path growing forever and results full of
  junk — test with input size 3, not 1.
- **Recording a reference instead of a copy.** `results.append(path)` stores
  the one shared list; by the end it's dozens of copies of the final state.
  `path[:]`, every time.
- **Wrong loop start.** `i + 1` = each element once; `i` = reuse allowed; full
  loop + `used` set = permutations. Say which you picked and why — the
  interviewer is checking whether `i + 1` was a choice or a guess.
- **Pruned too late.** Validating inside the recursion wastes a whole level
  per doomed path; filter in the for-loop so the branch never spawns.
- **Backtracking where counting was asked.** "How many valid X?" doesn't need
  the X's — enumerating them is exponential work a DP table (Challenge 10)
  does in polynomial time. Listen for "count" vs "list."
- **Exponential presented as an apology.** Lead with "the output has 2ⁿ
  elements, so exponential is the floor" — that framing turns the scary bound
  into evidence you know what you're doing.

➡️ **Next:** [Challenge 9 — Greedy & Matrices](../09-greedy-and-matrices/)
