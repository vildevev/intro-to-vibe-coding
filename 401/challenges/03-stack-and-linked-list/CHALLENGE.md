# Challenge 3 — Stack & Linked List

**Mission:** Two rounds where the data structure *is* the algorithm. Stacks handle nested and order-reversing problems — and the monotonic stack is the highest-leverage medium-tier trick there is. Linked lists test pure pointer surgery: fast/slow, in-place reversal, and the dummy node that deletes special cases from your code.

**Time:** ~60 minutes

---

## 😱 Correct, quadratic, failed

"Next greater element for every item." Candidate A: "monotonic decreasing
stack of indices — each index is pushed once and popped at most once, so
O(n) amortized," then finishes with edge cases to spare. Candidate B writes
the nested loop scanning rightward for every element: correct, untested at
scale, O(n²). At senior level, "correct but quadratic when a named linear
pattern exists" is a no-hire on coding. The stack wasn't the hard part;
recognizing that "next greater to the right" has a shape was.

## 🧰 What you'll learn

- **Stacks for nested structure** — brackets, decoding, saved parse state
- **Monotonic stacks** — next greater/smaller, spans, histograms, in O(n)
- **Fast & slow pointers** — middle, cycle detection, gap-of-n
- **In-place reversal** — the three-pointer rotation, without losing the tail
- **Dummy nodes** — making the head a non-case

## Pattern 1 — Stack: nested sequences and monotonic boundaries

Two distinct uses. *Nesting:* the most recently opened thing must close
first — LIFO is the problem's own rule, so push opens, match closes, and a
non-empty stack at the end means unclosed business. *Monotonic:* keep a
stack of "elements still waiting for their answer," sorted; when a new
element answers the top's question, pop and record. Each element enters and
leaves the stack once — that's the amortized O(n) argument, and it's the
sentence interviewers want to hear.

| You see… | Think… |
|---|---|
| Matching pairs, "well-formed", nested brackets | Stack: push opens, validate closes |
| "Next greater/smaller element to the right" | Monotonic stack of indices |
| "Largest rectangle / span bounded by shorter bars" | Monotonic stack: pop when the boundary appears |
| Parsing with nested contexts (decode `k[...]`, undo) | Stack of saved states — bookmark and restore |
| Per-element contribution (subarray minimums) | Monotonic stack gives left/right boundaries |

**Template — monotonic stack (next greater):**

```
def next_greater(nums):
    res = [-1] * len(nums)
    stack = []                         # indices; their values decrease
    for i, x in enumerate(nums):
        while stack and x > nums[stack[-1]]:
            j = stack.pop()            # x answers the question for nums[j]
            res[j] = i - j             # or res[j] = x — whatever is asked
        stack.append(i)
    return res
```

**Complexity:** O(n) amortized time — n pushes, at most n pops — and O(n)
space. Flip the comparison for next-smaller; scan right-to-left for
previous-greater; store indices, not values, whenever the answer involves
distances or spans.

**Drills (easy → hard):** Valid Parentheses → Daily Temperatures (next
warmer day, in days) → Decode String (stack of saved strings + counts) →
Largest Rectangle in Histogram (monotonic increasing stack).

## Pattern 2 — Linked list: three moves cover everything

Almost every linked-list question is a composition of three moves:
**fast & slow pointers** (middle, cycles, gap-of-n), **in-place reversal**
(the prev/curr/next rotation), and a **dummy node** (give every node — even
the head — a predecessor; build output lists with zero special cases).
Reorder List = middle + reverse second half + interleave. Palindrome = the
same, plus a value comparison. Recognize the composition, then assemble.

| You see… | Think… |
|---|---|
| "Detect a cycle" / "find the middle" | Fast & slow pointers |
| "Remove the nth node from the end" | Two pointers with an n-gap, plus a dummy |
| "Reverse all or part of the list, in place" | prev/curr/next rotation; save next before overwriting |
| "Merge / build a new list from pieces" | Dummy head + tail pointer, append by rewiring |
| Palindrome or reorder | middle + reverse second half + compare/interleave |

**Template — the two building blocks:**

```
def middle(head):                      # second middle when length is even
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
    return slow

def reverse(head):                     # in place; save next first
    prev, curr = None, head
    while curr:
        curr.next, prev, curr = prev, curr, curr.next
    return prev
```

**Complexity:** every composition is O(n) time, O(1) space — that's the
point of pointer surgery. Two cautions to volunteer: the reversal's
assignment order matters (read `curr.next` before rewiring it), and the
O(1)-space palindrome *mutates the input* — you'd re-reverse to restore it
in production code. Flagging that trade-off unprompted is a senior signal.

**Drills (easy → hard):** Linked List Cycle → Remove Nth Node From End of
List → Reorder List (all three moves at once) → Reverse Nodes in k-Group.

Go deeper: [Hello Interview's monotonic-stack chapter](https://www.hellointerview.com/learn/code/stack/monotonic-stack) for animated pop sequences.

## 🤖 Mock interview: run it

```text
You are a senior coding interviewer at a top tech company. Run one mock
interview with me on STACKS (including monotonic stacks) and LINKED LISTS.

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

- [ ] You can deliver the push-once-pop-once amortized O(n) argument
- [ ] Next-greater vs next-smaller vs previous-greater is one comparison flip each
- [ ] The reversal loop works first try, including single-node lists
- [ ] You reach for a dummy node before writing any `if head` special case
- [ ] Reorder List assembles middle + reverse + interleave without notes
- [ ] You flag that O(1)-space list tricks mutate the input

## 📚 Jargon

| Term | What it means |
|---|---|
| LIFO | Last in, first out — the stack contract |
| Monotonic stack | A stack kept sorted (values rising or falling) so each pop answers a pending question |
| Amortized O(n) | Total work bounded by n even though single steps vary — the push/pop accounting |
| Fast & slow pointers | Two cursors at 1x and 2x; meet inside a cycle, land on the middle |
| Dummy (sentinel) node | A throwaway node before the head so every real node has a predecessor |
| In-place | Rewiring with O(1) extra memory |
| Pointer surgery | Reassigning `next` references to restructure the list without copying |

## 🆘 When it goes wrong

- **Blanking.** Sort the problem by shape: does something nest (stack),
  reverse order (stack), or involve relinking (the three list moves)? Naming
  the shape out loud restarts the clock.
- **Wrong pattern.** Counting brackets instead of stacking them passes
  interleavings like `( [ ) ]` that are invalid. Counts can't see order.
- **Off-by-one on the head.** Deleting the head breaks code with no
  predecessor. That is the dummy node's entire job — use it from the start.
- **Lost tail on reversal.** Overwriting `curr.next` before reading it
  orphans the rest of the list. If your loop runs once and stops, that's it.
- **Monotonic stack feels like magic.** Trace a 6-element array by hand once
  — push, pop, record. The invariant ("waiting elements, kept sorted") is
  only believable after one trace.
- **Silence during rewiring.** Say which pointer you're reassigning and why.
  Linked lists are graded on narration as much as correctness.

➡️ **Next:** [Challenge 4 — Binary Search](../04-binary-search/)
