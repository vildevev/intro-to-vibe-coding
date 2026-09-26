# Challenge 6 — DFS & BFS

**Mission:** The two traversals behind roughly half of all tree and graph questions. DFS commits to one path and backs out; BFS sweeps outward one distance-layer at a time. The graded skill is the first-minute decision — "shortest path" or "level anything" means BFS, nearly everything else means DFS — followed by a clean template with the right state: a return value, a passed-down parameter, or a visited set.

**Time:** ~60 minutes

---

## 😱 The wrong traversal

Two candidates get "minimum number of moves through a maze." Candidate A
reaches for recursive DFS — the traversal they know cold — and builds
something that works but wanders every dead end, then needs a second pass to
keep the shortest route. Candidate B's first sentence is "minimum moves, every
move costs the same, so BFS: the first time I touch the exit is the answer —
O(rows × cols)." Fifteen lines later they're tracing an example. Same tool
belt, different opening sentence — and the opening sentence is what gets
scored. The fork: *any* path, all paths, or component structure → DFS;
*shortest* path or anything per-level → BFS.

## 🧰 What you'll learn

- **Tree DFS** — deciding what each recursive call returns before writing code
- **Grid DFS** — the four-direction loop, flood fill, connected components,
  the boundary trick, and in-place marking
- **BFS** — the queue, the level-size loop, multi-source seeding, and why
  first arrival is the shortest path in an unweighted graph
- The DFS-vs-BFS decision, stated out loud in one sentence

## Pattern 1 — DFS: trees, then grids

Every tree DFS question reduces to one question: *what does each call return?*
If your subtree's answer can be assembled from your children's answers, return
it (max depth: `1 + max(children)`). If the question cares about the
root-to-node path, pass that context down as parameters. When what a child can
hand you isn't what the problem asks for — diameter wants a through-path,
depth is all a child can return — keep a scoped accumulator and update it at
every node. Complexity: O(n) time, O(h) space for the call stack (O(log n)
balanced, O(n) skewed — say the distinction unprompted).

A grid is the same pattern wearing a costume: cells are nodes, edges run
up/down/left/right, and a visited marker (a set, or writing into the grid) is
mandatory. An outer scan looking for an untouched interesting cell, plus a DFS
that consumes everything reachable from it: the number of launches *is* the
number of connected components. Flip the question at the border — instead of
asking "can this cell reach the edge?" per cell, DFS *from* every edge cell
and mark what you reach.

| You see… | Think… |
|---|---|
| "Max/min/count over every subtree" | Return the subtree answer; combine children |
| Answer depends on the root-to-node path | Pass state down via parameters (helper function) |
| Question ≠ what a child can return (diameter, tilt) | Return the reusable part; track the real answer in a scoped variable |
| "Count islands / provinces / regions" | Outer scan + flood fill per unvisited cell |
| "Cells touching the border" (Surrounded Regions) | DFS inward *from* border cells; flip the rest |

**Template — tree DFS with all three channels:**

```
def solve(root):
    best = 0                             # accumulator for the real answer
    def dfs(node, state_from_root):      # path context passed DOWN
        if node is None:
            return identity              # same type as the normal return!
        left = dfs(node.left, next_state)
        right = dfs(node.right, next_state)
        here = combine(left, right, node.val)
        best = max(best, here)           # update the true answer
        return upward_value              # what the parent can reuse
    return dfs(root, initial_state)
```

**Template — the same skeleton on a grid (flood fill):**

```
def flood(r, c):                         # rows, cols, grid in scope
    if not (0 <= r < rows and 0 <= c < cols): return
    if grid[r][c] != LAND: return        # water, or already consumed
    grid[r][c] = VISITED                 # mark in place — free visited set
    for dr, dc in ((1,0),(-1,0),(0,1),(0,-1)):
        flood(r + dr, c + dc)
# count = how many times you launch flood() on an unvisited LAND cell
```

**Complexity:** O(n) over nodes, or O(rows × cols) over cells — every unit is
entered at most once. Space is the recursion depth: O(h) for trees, up to
O(rows × cols) for an all-land snake grid, where an explicit stack sidesteps
the call-stack limit. Classic bug: a base case returning `None` while
recursive cases return numbers — decide the base case's type first.

**Drills (easy → hard):** Maximum Depth of Binary Tree → Validate Binary
Search Tree (pass the (min, max) window down) → Number of Islands → Surrounded
Regions (the boundary trick).

## Pattern 2 — BFS: levels and shortest paths

BFS is a queue plus one discipline: mark visited **when enqueuing**, never at
pop time — otherwise cells re-enter the queue and every level count lies. The
level trick is one line: snapshot `len(queue)` at the top of the while loop
and process exactly that many. That snapshot buys two families of answers:
per-level results (right side view = last node of each level) and shortest
paths in unweighted graphs — BFS finishes every node at distance d before any
node at d+1, so the first time the target appears, its level is its distance.
Multi-source variant: seed the queue with *every* source at distance 0 first
(everything rotten, every zero cell) and the same loop measures distance from
the *set* rather than one point.

| You see… | Think… |
|---|---|
| "Minimum number of moves/steps" (unweighted) | BFS; first arrival is optimal |
| "Level by level / right side view / zigzag" | Level-size for-loop inside the while |
| "Time until everything is infected/rotten" | Multi-source BFS — seed all sources |
| "Distance from each cell to the nearest X" | Multi-source BFS from all X, fill a distance grid |
| Any path / all paths / component structure | DFS (Pattern 1), not BFS |

**Template — BFS with levels and early exit:**

```
def shortest_steps(grid, start, target):
    queue = deque([start])
    visited = {start}                    # mark HERE, not at pop time
    dist = 0
    while queue:
        for _ in range(len(queue)):      # exactly one level per sweep
            node = queue.popleft()
            if node == target:
                return dist              # first touch = shortest, guaranteed
            for nxt in neighbors(node):
                if nxt not in visited:
                    visited.add(nxt)
                    queue.append(nxt)
        dist += 1                        # finished a level = one step farther
    return -1                            # queue drained, target unreachable
```

**Complexity:** O(V + E) time, O(V) space for queue and visited set — O(rows ×
cols) on a grid. Have the one-sentence proof ready ("first arrival is shortest
because levels complete in order"); it's the favorite follow-up.

**Drills (easy → hard):** Binary Tree Level Order Traversal → Binary Tree
Right Side View → Rotting Oranges (multi-source) → Word Ladder.

Go deeper: [Hello Interview's DFS chapter](https://www.hellointerview.com/learn/code/depth-first-search/overview) — their BFS chapter continues from it with animated traversals of both.

## 🤖 Mock interview: run it

```text
You are a senior coding interviewer at a top tech company. Run one mock
interview with me on DFS and BFS: binary trees, grids, connected components,
level-order traversal, and shortest paths in unweighted graphs.

1. Pick ONE problem that maps to these patterns at senior difficulty.
   State it concisely: setup, input, output, one worked example, one
   constraint worth noticing. Do not name the pattern it uses.
2. Enforce a 25-minute timer. Warn me at 5 minutes left; stop me at zero.
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

- [ ] "What does each call return?" is your first question on any tree problem
- [ ] You choose DFS vs BFS in under 60 seconds and say the reason out loud
- [ ] The flood-fill skeleton is on paper from memory, bounds check included
- [ ] The level-size for-loop appears unprompted when a question says "level"
- [ ] You mark visited at enqueue time and can say what breaks otherwise
- [ ] You state O(V + E) / O(rows × cols) and name the space (stack vs queue)

## 📚 Jargon

| Term | What it means |
|---|---|
| DFS / BFS | Depth-first (go deep, back out) vs breadth-first (one layer at a time) |
| Return value | The answer a recursive call hands its parent; choose it before coding |
| Flood fill | DFS/BFS that consumes an entire connected region from one start cell |
| Connected component | A maximal group of cells/nodes reachable from each other |
| Level-size loop | Snapshot of `len(queue)` that processes exactly one BFS layer |
| Multi-source BFS | Seeding the queue with several starts at distance 0 |

## 🆘 When it goes wrong

- **Recursion limit blows up.** A big all-land grid can outgrow the default
  call stack. Don't debug it live — rewrite the flood fill iteratively with an
  explicit stack and say why.
- **Visited set forgotten.** Trees can't cycle; graphs and grids can. Say
  "graph, not tree — adding visited" the moment you spot it.
- **Base-case type mismatch.** The base case must return the same type as the
  recursive case (`-inf`, not `None`). This bug survives every small test.
- **Marking visited at pop time.** Duplicates pile into the queue and level
  counts and distances quietly go wrong.
- **DFS on a shortest-path question.** It explores *a* path, not *the* path.
  Catch it in the first minute: "minimum/shortest" + unweighted → BFS.
- **Bounds checked after use.** Check `0 <= r < rows and 0 <= c < cols`
  *before* touching `grid[r][c]` — the four-direction loop makes out-of-range
  the chapter's most common crash.

➡️ **Next:** [Challenge 7 — Graphs & Tries](../07-graphs-and-tries/)
