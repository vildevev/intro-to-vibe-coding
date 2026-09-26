# Challenge 7 — Graphs & Tries

**Mission:** Two skills with one theme: build the structure before you search it. Graph questions rarely hand you a graph — you model one (adjacency list, indegrees, edges between routes), then apply the algorithm the problem selects: topological sort for dependencies, BFS/Dijkstra for shortest paths, Union-Find for live connectivity. Tries are the same instinct for strings: pay once for shared prefixes, and every later word/prefix query becomes an O(L) walk.

**Time:** ~60 minutes

---

## 😱 The graph you have to build

A prerequisites-shaped question lands: courses, dependencies, "can you finish
them all?" Candidate A treats it as an array problem and starts inventing sort
rules. Candidate B's second sentence is "this is a directed graph —
dependencies are edges, 'can I finish' asks whether the graph has a cycle, so
Kahn's algorithm, O(V + E)." The harder half of that answer was the modeling:
naming nodes, naming edges, letting a standard algorithm fall out. The next
trap is subtler — in a bus-routes question the natural node is the *route*,
not the *stop*, and the candidate who models stops builds a graph twice as
hard to search. Interviewers weight the modeling sentences more than the code
that follows, because the code is a template and the model is a decision.

## 🧰 What you'll learn

- Building a graph from raw input: adjacency list vs matrix, and the default
- **Topological sort** via Kahn's algorithm — cycle detection falls out free
- Picking a shortest-path algorithm by edge weight: BFS, Dijkstra, Bellman-Ford
- **Union-Find**: the mental model and when it beats repeated DFS
- **Tries** — `children` dict + end-of-word flag, O(L) operations, and how
  they prune word-in-grid searches

## Pattern 1 — Graphs: build it, then sort it or search it

Model first, out loud: nodes, edges, adjacency list (`node -> neighbors`, the
default) or matrix (V×V, dense graphs only). Then the algorithm selects
itself. For dependencies — prerequisites, build order, "valid ordering" —
it's Kahn's algorithm: count indegrees, seed a queue with the zeros, pop a
node into the order, decrement its neighbors' indegrees, enqueue anything that
hits zero. If the finished order is shorter than the node count, the remainder
is stuck in a cycle — the check *is* the answer to the feasibility variant.
Need connectivity without an ordering → Union-Find: two operations (`find`
with path compression, `union` by rank), effectively O(1) amortized, and the
right tool when unions and connectivity queries interleave; one sentence to
hold onto: a union-find is a forest where each tree is one component.

| You see… | Think… |
|---|---|
| "Prerequisites / build order / course scheduling" | Topological sort (Kahn's) |
| "Does a valid ordering exist?" | Kahn's; short order ⇒ cycle |
| "Recover a hidden alphabet from sorted words" | Edges from adjacent word pairs, then topo sort |
| Unions + "are these connected?" interleaved | Union-Find, not a DFS per query |
| "Minimum cost/time" over weighted edges | Dijkstra — see below |

**Template — Kahn's algorithm:**

```
def topo_sort(n, edges):
    graph = defaultdict(list)
    indeg = [0] * n
    for u, v in edges:                    # directed edge u -> v
        graph[u].append(v)
        indeg[v] += 1
    queue = deque(u for u in range(n) if indeg[u] == 0)
    order = []
    while queue:
        u = queue.popleft()
        order.append(u)
        for v in graph[u]:
            indeg[v] -= 1
            if indeg[v] == 0:
                queue.append(v)
    return order if len(order) == n else []   # short = cycle exists
```

**Shortest paths: pick by edge weight.** One question decides the algorithm.
All edges equal → BFS, O(V + E) (Challenge 6). Non-negative weights →
Dijkstra, O((V + E) log V): greedily settle the cheapest unsettled node from a
min-heap, then relax its edges — push `(d + w, v)` when a cheaper route
appears, and skip stale heap entries at pop time (`if d > dist[u]: continue`).
Negative weights break that greedy guarantee → Bellman-Ford, O(V·E), mostly
discussed rather than coded. Have Dijkstra's one-liner ready: "with
non-negative weights, the cheapest unsettled node can't be improved by a
detour, so settling it is safe."

**Complexity:** Kahn's is O(V + E) time and space — every node enqueued once,
every edge relaxed once. Dijkstra adds the log factor from the heap. Drills
(easy → hard): Course Schedule → Course Schedule II (return the order) →
Network Delay Time (Dijkstra; answer = max distance) → Cheapest Flights Within
K Stops (add a stops dimension to the state).

## Pattern 2 — Tries: pay for the prefix once

A trie node is two fields: a `children` map from character to node, and an
`is_end` flag. Insert and search both walk L characters — O(L) per operation,
independent of how many words are stored. That's the value proposition: shared
prefixes stored once, "does any word start with p" answered by a walk rather
than a scan, and autocomplete as walk-to-the-prefix plus a DFS collecting
everything marked `is_end`. On a single membership query a hash set wins; the
trie earns its keep when queries are many, prefix-flavored, or need to *prune*
— the grid word hunt (Word Search II) keeps the dictionary in a trie so the
DFS abandons a cell-path the moment it stops being a prefix of any word.

| You see… | Think… |
|---|---|
| "Autocomplete / all words starting with…" | Trie: walk the prefix, DFS the subtree |
| "Search with wildcard characters" | Trie DFS branching on the wildcard |
| Word list + letter grid | Trie + backtracking from every cell (Challenge 8) |
| Many queries over one dictionary | Build the trie once — O(total characters) |
| One membership query, ever | A set; don't build infrastructure |

**Template — the trie core:**

```
class TrieNode:
    def __init__(self):
        self.children = {}               # char -> TrieNode
        self.is_end = False              # a word terminates here

def insert(root, word):
    node = root
    for ch in word:
        node = node.children.setdefault(ch, TrieNode())
    node.is_end = True

def search(root, word):                  # startsWith: delete the last line
    node = root
    for ch in word:
        if ch not in node.children:
            return False
        node = node.children[ch]
    return node.is_end
```

**Complexity:** O(L) per insert/search/delete where L is the word length;
space O(total characters) worst case — no shared prefixes means every
character gets a node. Deletion is the bonus round: unmark `is_end`, then walk
back up removing nodes that are neither word-ends nor parents. Drills (easy →
hard): Implement Trie (Prefix Tree) → Design Add and Search Words Data
Structure (the wildcard) → Search Suggestions System → Word Search II.

Go deeper: [Hello Interview's graphs chapter](https://www.hellointerview.com/learn/code/graphs/overview) — their trie chapter follows the same format.

## 🤖 Mock interview: run it

```text
You are a senior coding interviewer at a top tech company. Run one mock
interview with me on GRAPHS and TRIES: modeling graphs from raw input,
topological sort, shortest-path algorithm selection, and prefix trees.

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
   Push one follow-up on my graph modeling choice: what are the nodes,
   what are the edges, and why.
6. When time is up or I say done, grade 1-5 each: correctness, complexity
   analysis, communication, edge cases — one line of evidence per score,
   then the single highest-leverage improvement.

Start with the problem statement. No preamble.
```

## ✅ Interview-ready when

- [ ] "Let me define the graph: nodes are…, edges are…" precedes your code
- [ ] Kahn's algorithm is on paper from memory, cycle test included
- [ ] You ask "what do edges cost?" before naming any shortest-path algorithm
- [ ] The Dijkstra skeleton (heap, stale-entry skip, relax) rebuilds from notes
- [ ] The TrieNode class (children + is_end) takes under two minutes
- [ ] You can say when Union-Find beats DFS: interleaved unions and queries

## 📚 Jargon

| Term | What it means |
|---|---|
| Adjacency list / matrix | `node -> neighbors` (the default) vs a V×V grid (dense graphs only) |
| Indegree | Number of incoming edges; zero means "nothing blocks me" |
| Topological sort | An ordering of a DAG where every edge points forward |
| Dijkstra's algorithm | Greedy shortest paths on non-negative weights via a min-heap |
| Union-Find | Forest structure tracking merged components; find + union, near O(1) |
| Trie | Prefix tree; nodes hold children maps and an end-of-word flag |

## 🆘 When it goes wrong

- **Modeling the wrong node.** Bus-routes problems want routes as nodes (with
  a stop → routes map), not stops. State the choice; a wrong model poisons
  everything downstream and no algorithm fixes it.
- **Directed vs undirected confusion.** A prerequisite `[a, b]` points one
  way. Adding both directions turns a cycle detector into mush.
- **Trusting a partial topological order.** Kahn's silently returns a short
  order on a cycle. Check `len(order) == n` — that check *is* the answer to
  the feasibility variant.
- **Dijkstra on negative weights.** The greedy settlement guarantee dies and
  answers come out plausible-but-wrong. Name Bellman-Ford and move on.
- **search vs startsWith mixed up.** Only `search` checks `is_end`;
  `startsWith` succeeds whenever the walk survives. One boolean, two contracts.
- **Matrix by default.** An adjacency matrix on a sparse graph burns O(V²)
  memory and iteration. Default to the list; say the trade-off if asked.

➡️ **Next:** [Challenge 8 — Backtracking](../08-backtracking/)
