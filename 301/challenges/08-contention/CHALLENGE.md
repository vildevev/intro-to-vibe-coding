# Challenge 8 — Contention

**Mission:** Keep two users from winning the same resource at the same instant — conditional writes, pessimistic and optimistic locking, distributed locks with TTLs, and what to do when the whole world wants one row — the only way it sticks: by breaking a ticket-booking checkout at each collision and letting each break force the next coordination tool. Every tool arrives because the previous guard stopped covering the gap, and every tool names its cost.

**Time:** ~60 minutes

---

## 😱 War story: seat A15, sold twice

"Design a ticketing system." The candidate's booking service reads the available count, checks it's above zero, decrements, inserts a ticket, charges the card. Clean diagram, clean flow. The reviewer then fires two "buy" requests at the same millisecond and the count lands at minus one: both requests read 1, both passed the check, both wrote. That's the lost update — a read-modify-write with a gap between the read and the write, and another request slipped into the gap. It is the most predictable bug in system design design reviews. Candidates don't lose points for having it in their first design; they lose points for not having four named ways to close the gap and an opinion on which one fits.

## 🧰 What you'll learn

- Race anatomy: read-modify-write, the lost update — the gap between the read and the write is the bug
- Why a conditional write is the cheapest fix, and why it can't express every check — the coordination ladder exists for the checks it can't
- Why a 10-minute hold can't be a database transaction, and what "expiry as data" buys
- What happens when 10M users want one row: why sharding, replicas, and load balancers all stop helping — and what's left
- Why a retried checkout books twice, and the idempotency key that makes repeats harmless

## The system that works (until it doesn't)

Requirements: view events, search events, book tickets. The binding non-functionals: availability for browsing, absolute consistency for booking (a seat has one owner, ever), and 10M users descending on one event. Backbone: event and search services over a SQL database (read-heavy, cacheable — Challenge 5), a booking service with ACID transactions, a payment processor that reports back via webhook.

Day one, the checkout reads like the business: read the available count, check it's above zero, decrement, insert the ticket, charge the card. In the demo — one user, one click, no hurry — every seat sells exactly once. What the demo never contains is contention: multiple requests competing for one resource at one moment.

## Break 1 — two fans, one seat, minus one left

The moment: two "buy" requests for the last seat land in the same millisecond. Both read `available = 1`, both pass the check, both write. The count lands at minus one, seat A15 has two owners, and the logs look blameless. That's the lost update — a read-modify-write with a gap between the read and the write, and another request slipped into the gap. The most predictable bug in system design design reviews.

**The obvious fix, and why it fails:** "wrap it in a transaction." On default isolation the check still happens in app code before the write — two transactions can both pass the same check before either commits, and the gap survives. Writing the app code "faster" shrinks the window; nothing shrinks it to zero.

**The fix: stop checking in app code — make the write itself conditional.** The database evaluates your guard atomically as part of the write:

```sql
UPDATE tickets
SET status = 'sold', user_id = :user
WHERE ticket_id = :id AND status = 'available';
```

One row updated means you won; zero means somebody beat you. That's compare-and-set, and every serious store speaks it: DynamoDB ConditionExpressions, Redis `SET NX`, HTTP `If-Match`. Two disciplines travel with it. First, guard the resource people actually fight over: a counter can promise "a seat exists," not "seat A15 exists" — two buyers can both decrement a counter and both write A15. Give every ticket its own row and aim the conditional write at the row. Second, check the affected-row count: zero rows is not an error, and if you don't check, the next statement in your transaction happily runs anyway.

**The cost:** a conditional write only guards predicates the row itself can express. The moment the decision needs several rows, app logic, or a hold that outlives the request, the gap reopens somewhere new.

## Break 2 — four adjacent seats and a ten-minute hold

The moment: the product ships two features the first guard can't express. A family wants four seats together — the decision needs to read several rows, reason, then write, and no WHERE clause on one row can say it. And the countdown timer arrives: a plain book-now flow means users fill in payment details and discover the seat is gone, so each seat must be held ~10 minutes while the buyer types card numbers. Everyone has met the reservation from the consumer side.

**The obvious fix, and why it fails:** hold a `SELECT FOR UPDATE` lock across the whole 10-minute checkout. Transactions are for milliseconds, not minutes: every other buyer queues behind the lock, a crashed browser leaves the lock's fate murky, and if the payment API call happens inside the lock, every buyer serializes behind a third party's latency.

**The fix: match the tool to the shape of the check.**

| Tool | Use when | Avoid when |
|---|---|---|
| Conditional write | the check is a predicate on the row you're writing | the decision needs app logic between read and write |
| Pessimistic lock (`SELECT FOR UPDATE`) | read-decide-write a WHERE clause can't express (find 4 adjacent seats); high contention | conflicts rare — every non-conflicting request pays the lock tax |
| Optimistic (version column) | same read-decide-write, collisions rare | hot paths where losers retry in a loop and pile up |
| Serializable isolation | the invariant spans rows that never collide (write skew) | hot paths — aborts throw away work; mostly relational-only |
| Distributed lock with TTL | the hold must outlive one transaction — a wait, an external call | a plain transaction guard already covers it |

Details worth saying out loud. Optimistic: read the version, write `WHERE version = :seen`, zero rows means retry — and use a dedicated incrementing counter, because business values can change and change back without your check noticing. Pessimistic: lock the smallest scope for the shortest time, and never do slow I/O inside the lock (a payment call held open serializes every buyer behind a third party's latency). Deadlocks come from inconsistent lock ordering — sort resources by a global key before locking, and treat the database's deadlock error as retryable. Write skew is the trap none of the row tools catch: two transactions each read the other's state, both decide validly, both commit, invariant broken — that needs SERIALIZABLE or folding the invariant onto a single row a guard can protect.

For the reservation itself, three ways to build it:

| Approach | Mechanism | Verdict |
|---|---|---|
| Long-running DB lock | `SELECT FOR UPDATE` held across the whole checkout | Bad: transactions are for milliseconds, not minutes; other buyers queue; a crash leaves the lock's fate murky |
| Status + expiry + cron | ticket flips to `reserved` with an `expires_at`; a cron flips stale ones back | Works, but laggy: expired seats stay invisible until the cron runs — expensive at high demand |
| Expiry as data | reserve only if `available` OR (`reserved` AND expired), in one short transaction — or a Redis lock `SET NX EX 600` | Great: a lapsed hold reads as free inside the query itself; correctness needs no cleanup job |

The Redis variant: `SET ticket:A15 :userId NX EX 600` is atomic and self-expiring, any web server can see it, and the database stays the final authority — if the lock double-grants (a holder stalls past TTL), the losing database write fails and an automatic refund follows. One subtlety reviewers love: the seat map must show held seats as taken. A Redis set of locked IDs leaks ghosts (set members don't expire when the lock keys do); a sorted set scored by expiry time fixes it — filter scores still in the future.

**The cost:** a TTL reservation can double-grant when a holder stalls past expiry. That's why the database stays the final authority — the lock is a UX reservation; the database's version check or row lock is what makes double-booking impossible. Say both.

## Break 3 — 10M users, one seat map, one moment

The moment: the on-sale. 10:00:00, ten million users hit one event. Every booking request queues on the same rows, the seat map times out, and social media declares the sale broken before the first ticket confirms.

**The obvious fix, and why it fails:** scale out. Sharding splits load across keys — there's one key. Replicas spread reads — the fight is writes. Load balancers spread servers that all queue on the same row. Your usual knobs don't apply, because the contention is concentrated on a single resource by definition.

**The fix: sequence the crowd instead of fighting it.** The honest ladder: first ask whether the requirement can bend (likes and follows can be eventually consistent; ten identical items can be ten separate contests), then queue-based serialization — route all requests for that resource through a single worker, converting contention into ordering and capping throughput at one worker's pace, which beats a collapsed system. For the user-facing layer, a virtual waiting room meters admission out of a sorted queue so the seat map never sees the stampede.

**The cost:** throughput is capped by design — the queue is honest about what one row can absorb, and the waiting room trades seconds of admission delay for the sale surviving at all.

## Break 4 — the retry that books twice

The moment: a checkout request times out at the client mid-payment. The client SDK retries; the impatient user double-clicks. Two booking requests for one logical purchase — and the first charge already went through. Two seats, two charges, one buyer.

**The obvious fix, and why it fails:** "check whether this booking already exists, then charge." That's check-then-act again — Break 1's gap, now spanning client, server, and a payment network: two retries can both look, both find nothing, and both book. Retrying "carefully" is not a mechanism.

**The fix: idempotency keys.** The client sends a key per logical operation; the server stores it and returns the original result on repeats. The check-then-act still has a crack — record `IN_PROGRESS` before the side effect and `COMPLETED` after, and route the ambiguous middle to reconciliation rather than blind retry. (Challenge 9 owns this deep dive; here, know the shape: the webhook that reports payment results is a re-delivery machine, and your booking side must treat repeats as replays, not new purchases.)

**The cost:** every mutating endpoint grows a key, a store, and an in-progress state — and the ambiguous middle is a permanent reconciliation surface.

## 🤖 Design-review drill: run it

```text
You are a senior engineer leading my design review. This session is a CONTENTION-heavy
design: the core difficulty must be many clients racing for the same
resources, and I must defend my coordination choices under fire.

SETUP
Offer one of: "Design a ticket booking system", "Design an online auction
system", "Design a flash-sale inventory system", or "Design ride matching
for a small driver pool" — or take the problem I name if it's contention-
heavy. Confirm, then run 45 minutes in real time with phase clocks
(Requirements ~5, Entities ~2, API ~5, High-Level ~10-15, Deep Dives ~10).

MANDATORY DEEP DIVES — pull me into at least two:
1. "Two users hit 'buy' on the last item in the same millisecond. Trace
   it through your design, line by line." (Push until the lost update is
   impossible: conditional write, version check, or lock — and I check
   affected-row counts.)
2. "You used [my chosen mechanism]. When is it the wrong choice?" (Expect
   the full ladder and the contention level that flips each one.)
3. "Design the seat hold / reservation. Why not just hold a database lock
   for 10 minutes?" (Expect TTL or expiry-as-data, and what the seat map
   shows meanwhile.)
4. "10 million users descend on one event at 10:00:00. Walk me through
   the first 60 seconds." (Expect hot-partition reasoning: relax the
   requirement, serialize through a queue, or a waiting room.)
5. If I lock multiple rows: "Two transfers lock A then B; two others lock
   B then A. What happens?" (Expect ordered locking and deadlock-retry.)
RULES
Stay in character. If I add a component without naming the break it
fixes, stop me: "What breaks without it?" If I reach for a distributed
lock when a conditional write would do, stop me: "What gap does this
lock close that the database couldn't?" If I never state what two
concurrent winners looks like, make me trace it. Hints only on request,
smallest nudge possible.

SCORING
After 45 minutes or "end review": score 1-4 on Problem Navigation,
Solution Design, Technical Excellence, Communication — one quoted moment
each. Then report: did I guard the contended resource itself (not a
counter), did I match the tool to the contention level, and did I state
what happens to the loser of every race. Assign me one drill to repeat.

Ask me to pick a problem to start.
```

## ✅ You own it when

- [ ] You can trace a lost update out loud, close it with a conditional write, and check the affected-row count
- [ ] You pick pessimistic vs optimistic from one fact: how often writers actually collide
- [ ] You can build a 10-minute reservation without holding a database transaction open
- [ ] You know expiry-as-data beats expiry-as-cron-job and can say why
- [ ] Your answer to "everyone hits the same row at once" is not "add more servers"

## 📚 Jargon

| Term | What it means |
|---|---|
| Contention | Multiple requests competing for the same resource at the same time |
| Lost update | Two read-modify-writes interleave and one silently overwrites the other |
| Compare-and-set | A write conditional on the old value still holding — the atom behind every fix here |
| Pessimistic locking | Lock rows upfront and decide while holding them; pay the lock on every request |
| Optimistic concurrency | Read a version, write only if unchanged, retry on conflict; cheap when collisions are rare |
| Version column | A counter bumped on every write — the value the optimistic check compares against |
| Write skew | Two transactions each valid against what they read, jointly breaking an invariant that spans rows |
| Distributed lock | Exclusive access held as data with a TTL, outliving any single transaction |
| Hot partition | Contention concentrated on one key, where sharding and replicas can't help |
| Virtual waiting room | A queue that meters admission to the booking flow ahead of the stampede |

## 🆘 When it goes wrong

- **You hold a lock across a payment API call.** Slow external I/O inside a lock serializes everyone behind a third party's latency. Reserve fast, pay outside the lock, confirm after.
- **Your guard protects a counter, not the seat.** Two buyers pass `seats > 0` and both claim A15. Give every contended thing its own row and guard that row.
- **You reach for Redis locks by default.** If a conditional write or version check in the database you already run covers the gap, the lock is a new failure mode for nothing. Say why the hold outlives a transaction before introducing one.
- **A cron flips your expired reservations.** Fine as cleanup, wrong as the mechanism: between expiry and the cron, seats show as taken. Put expiry in the read/write condition so a lapsed hold reads as free.
- **You claim the distributed lock makes double-booking impossible.** TTL locks can double-grant when a holder stalls past expiry. The database's version check or row lock is what makes double-booking impossible; the lock is a UX reservation. Say both.

➡️ **Next:** [Challenge 9 — Multi-Step Processes](../09-multi-step-processes/)
