# Challenge 5 — Heaps

**Mission:** Heaps are the drill's "track a running extreme" tool. Three shapes cover the chapter: a bounded heap for top-K, two balanced heaps for a streaming median, and a k-way heap for merging sorted streams. The structure itself is standard library — the drill is knowing which heap holds what, at what cost, and saying so.

**Time:** ~45 minutes

---

## 😱 Better than sorting

"k closest points to the origin, n is large — and yes, you can beat
sorting." Candidate A: "max-heap of size k keyed on squared distance; O(n
log k), O(k) memory, works on a stream," and never materializes the
distances. Candidate B computes all distances, sorts, slices — correct, but
O(n log n) when beating O(n log n) was the assignment, and the drill leader
had just said so. The heap's win isn't only the log factor: it declares
*bounded memory and streaming-friendly* out loud, which is exactly the
systems instinct senior loops probe for.

## 🧰 What you'll learn

- Heap operation costs: push/pop O(log n), peek O(1), heapify O(n)
- **Top-K**: a size-k min-heap for the k largest — and why the direction flips
- **Two heaps**: balanced halves for a running median
- **Merge-K**: one heap of k heads drains k sorted streams in O(N log k)
- Tuple keys, tiebreakers, and the negation trick for max-heaps

## Pattern 1 — Top-K with a bounded heap

The counterintuitive part: for the k *largest*, keep a *min*-heap of size k.
The root is the weakest element you're still keeping, so it's the natural
eviction target when something better arrives. For the k smallest / k
closest, flip to a max-heap (negate values in Python's `heapq`). If asked to
beat O(n log n), this is the answer — and if the data is a stream, it's the
only answer that doesn't store everything.

| You see… | Think… |
|---|---|
| "k largest / smallest / most frequent" | Bounded heap of size k |
| "Beat O(n log n) on top-k" | O(n log k): keep the heap at exactly k |
| kth largest after each stream insert | Same bounded heap; root is the running answer |
| "k closest points" | Max-heap on distance — skip the sqrt, squares suffice |
| Ties on the primary key | Push tuples: `(key, tiebreaker)` |

**Template — kth largest via bounded min-heap:**

```
def kth_largest(nums, k):          # min-heap keeps the k largest so far
    heap = []
    for x in nums:
        if len(heap) < k:
            heapq.heappush(heap, x)
        elif x > heap[0]:
            heapq.heapreplace(heap, x)   # evict the weakest in one sift
    return heap[0]                 # weakest kept = kth largest
```

**Complexity:** O(n log k) time, O(k) space; `heapreplace` does the
pop-then-push in a single sift. For reference: push and pop are O(log n),
peek is O(1), heapify on an existing array is O(n). Those four costs,
recited cold, are half of what drill leaders check about heaps.

**Drills (easy → hard):** Kth Largest Element in an Array → Top K Frequent
Elements (counter + heap) → K Closest Points to Origin → Find K Closest
Elements (heap, or the Challenge-4 boundary search).

## Pattern 2 — Two heaps and merge-K

**Two heaps (running median).** Split the stream: a max-heap `lower` holds
the smaller half, a min-heap `upper` the larger half, sizes kept within one.
The median is the top of the bigger heap, or the average of both tops.
Insert O(log n), median O(1) — versus re-sorting, O(n log n) per query.

**Merge-K.** One min-heap holds the current head of each of the k sorted
lists, as `(value, list_id, node)`. Pop the min, append it, push that list's
next element. Every element passes through the heap exactly once: O(N log k)
for N total elements, O(k) space — the same primitive behind "smallest range
covering one element from each of k lists."

| You see… | Think… |
|---|---|
| "Median after each insertion / of a stream" | Two balanced heaps |
| "Merge k sorted lists" | Min-heap of k heads |
| Repeated min/max while the data mutates | Heap, not a rescan |
| "Smallest range covering one element per list" | k-way heap, track window bounds |
| Priority scheduling under constraints | Heap ordered by the constraint's key |

**Template — two-heap median:**

```
def push(x):                       # lower = max-heap (negated), upper = min
    if not lower or x <= -lower[0]:
        heapq.heappush(lower, -x)
    else:
        heapq.heappush(upper, x)
    if len(lower) > len(upper) + 1:
        heapq.heappush(upper, -heapq.heappop(lower))
    elif len(upper) > len(lower):
        heapq.heappush(lower, -heapq.heappop(upper))

def median():                      # sizes differ by at most 1
    return -lower[0] if len(lower) > len(upper) else (-lower[0] + upper[0]) / 2
```

**Complexity:** insert O(log n), median O(1), space O(n). The invariant to
state aloud: "`lower` is never more than one larger than `upper`." If the
rebalance order feels arbitrary, trace inserting 5, 2, 8, 3 by hand once.

**Drills (easy → hard):** Kth Smallest Element in a Sorted Matrix (heap of
list heads) → Merge k Sorted Lists → Find Median from Data Stream → Sliding
Window Median (median + lazy deletion).

## 🤖 Coding drill: run it

```text
You are a staff engineer running a timed coding drill at a top tech company. Run one drill
drill with me on HEAPS: top-K problems, two-heap medians, and merge-K.

1. Pick ONE problem that maps to these patterns at senior difficulty.
   State it concisely: setup, input, output, one worked example, one
   constraint worth noticing. Do not name the pattern it uses.
2. Enforce a 25-minute timer. Warn me at 5 minutes left; stop me at zero.
3. Ask which language I'm using and hold me to it.
4. Hints only when I explicitly ask, one rung at a time, never code:
   (a) nudge — restate the constraint or point at a suspicious example;
   (b) direction — name the family of approach, not the algorithm;
   (c) structure — outline the algorithm's steps in words.
5. Drill like a senior loop: make me restate the problem, state my
   complexity unprompted, and trace one example before I call it done.
6. When time is up or I say done, grade 1-5 each: correctness, complexity
   analysis, communication, edge cases — one line of evidence per score,
   then the single highest-leverage improvement.

Start with the problem statement. No preamble.
```

## ✅ You own it when

- [ ] You justify "k largest → min-heap" without pausing
- [ ] The four operation costs (push/pop/peek/heapify) are reflexes
- [ ] heapreplace vs heappushpop vs push-then-pop: you know which you mean
- [ ] Two-heap median: the balancing invariant is stated before coding
- [ ] Merge-K: you say O(N log k) and where each factor comes from
- [ ] Tuple keys with tiebreakers are your default, not an afterthought

## 📚 Jargon

| Term | What it means |
|---|---|
| Min-heap / max-heap | Array-backed tree whose root is the min (or max); sibling order unspecified |
| Heap property | Every node ≤ (min-heap) or ≥ (max-heap) its children |
| Heapify | Linear-time conversion of an arbitrary array into a heap |
| Bounded heap | A heap capped at size k — the top-K workhorse |
| Two heaps | Max-heap of the lower half + min-heap of the upper half, balanced to ±1 |
| k-way merge | Draining k sorted streams through one shared heap |
| Tuple key | `(key, tiebreaker)` ordering that makes comparisons total |

## 🆘 When it goes wrong

- **Blanking.** Ask what you need at every instant: the current min? the k
  best so far? the middle? Each sentence maps to one of the three shapes.
- **Wrong heap direction.** k *largest* wants a *min*-heap — the root is the
  weakest kept element, hence the eviction target. Say the reason aloud and
  the direction can't flip in your head mid-problem.
- **Off-by-one on balance.** The median breaks silently when one heap leads
  by two. Trace one even-length and one odd-length insert before saying done.
- **Forgetting to negate.** Python's `heapq` is min-only; every max-heap
  push *and* pop needs the sign flip. One missed negation produces wrong
  answers that look like logic bugs.
- **Sort as a reflex.** If the drill leader says "beat sorting" or the data
  is streaming, sorting is a reject even when correct. Lead with the heap.
- **Tuples comparing wrong.** If a tuple's second element can't be compared
  (objects), add an integer tiebreaker before it — or the push throws
  mid-solution.

➡️ **Next:** [Challenge 6 — DFS & BFS](../06-dfs-and-bfs/)
