# 🧮 Coding Patterns — 401

*A senior-engineer track: the 16 patterns behind nearly every coding problem,
drilled to recognition speed.*

**Who this is for:** engineers who want to stop memorizing solutions and start
*seeing structure*. The insight this track is built on: the problems you meet —
in code reviews, system bottlenecks, technical assessments — are instances of a
small number of *patterns*, and mastery is recognition speed: seeing the
problem, naming the pattern, executing the template.

**How it works:** 10 challenges covering all 16 patterns (related patterns are
paired). Each challenge gives you the recognition cues, a template you can
rebuild from memory, complexity bounds, and drills — including a copy-paste
prompt that turns any AI chat into a **timed coding drill**: it picks the
problem, enforces the clock, and hints only when you're stuck.

---

## The course map

| # | Challenge | The patterns | Time |
|---|-----------|--------------|------|
| 1 | [Two Pointers & Sliding Window](challenges/01-two-pointers-and-sliding-window/) | Pairs, palindromes, subarrays with a window that grows and shrinks | 60 min |
| 2 | [Prefix Sum & Intervals](challenges/02-prefix-sum-and-intervals/) | Running totals, range queries, merge-and-sort intervals | 60 min |
| 3 | [Stack & Linked List](challenges/03-stack-and-linked-list/) | Monotonic stacks, fast/slow pointers, reversal in place | 60 min |
| 4 | [Binary Search](challenges/04-binary-search/) | Sorted space, boundary-finding, search-on-answer | 60 min |
| 5 | [Heaps](challenges/05-heaps/) | Top-K, streaming medians, scheduling by priority | 45 min |
| 6 | [DFS & BFS](challenges/06-dfs-and-bfs/) | Grids, trees, level-order, connected components | 60 min |
| 7 | [Graphs & Tries](challenges/07-graphs-and-tries/) | Representations, shortest paths, prefix trees, word search | 60 min |
| 8 | [Backtracking](challenges/08-backtracking/) | Choose-explore-unchoose: subsets, permutations, combinations | 60 min |
| 9 | [Greedy & Matrices](challenges/09-greedy-and-matrices/) | Exchange arguments, sorting proofs, spiral and rotate tricks | 45 min |
| 10 | [Dynamic Programming](challenges/10-dynamic-programming/) | The state, the recurrence, the memo — 1D to 2D | 90 min |

## The Rules

1. **Recognition first.** 80% of the battle is the first 60 seconds: restate
   the problem, spot the pattern, say it out loud before you write anything.
2. **Templates, not memorized solutions.** For each pattern you own one
   skeleton you can rebuild under pressure — problems are variations; the
   skeleton is constant.
3. **Complexity is part of the answer.** Every solution gets its time/space
   stated unprompted, with the "why."
4. **Think out loud, always.** Silence reads as being stuck. Narrate the
   brute force, then improve it — a verbal brute force is a working start;
   silent genius is unreadable and rare.
5. **Tests are free points.** Trace a small example before saying "done."
   The check is a senior signal anywhere code gets reviewed.

## Before you start

- [ ] An AI chat for the timed drills (any strong model works)
- [ ] A language you'll drill in, picked once and kept (usually the one you
      know best, *not* the trendiest)
- [ ] A plain editor or scratchpad — no autocomplete during drills

## FAQ

**Why patterns instead of grinding problems?**
Because ~40 problems *owned* (pattern named, template reproduced, complexity
stated, edges handled) beat 500 skimmed. The drills reference ~40 classics by
name, deliberately small.

**Order matters?** Mostly. DP last on purpose — it's the pattern that pays off
from everything before it.

**How does this fit the rest of the campus?**
The [201 track](../../201/) has you shipping real features; this track sharpens
the computational thinking underneath them — the same "spot the shape of the
problem first" instinct, pointed at code.

---

*Start here → [Challenge 1: Two Pointers & Sliding Window](challenges/01-two-pointers-and-sliding-window/)*
