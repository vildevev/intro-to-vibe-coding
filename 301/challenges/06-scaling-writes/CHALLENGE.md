# Challenge 6 — Scaling Writes

**Mission:** Scale the write path the way it actually breaks — a saturated primary, a queue that never drains, a viral hot key — so the "now handle 10x writes" probe strengthens your design instead of sinking it.

**Time:** ~60 minutes

---

## 😱 War story: the queue that ate the backlog

"Design a metrics ingestion system — oh, and Black Friday quadruples writes." The candidate smiles and adds a Kafka box between the API and the database, declares the problem solved, and moves on. The reviewer leans in: "The database absorbs 2k writes/sec. Traffic is 8k and staying there. What does the queue do?" Silence, then the honest answer: it grows forever, latency climbs toward the retentions horizon, and users are waiting on writes the system already told them it accepted. A queue is a buffer for short bursts, not a throughput fix — the fix is making the write path itself faster or smaller. Every technique in this challenge exists to keep that follow-up question from ending you.

## 🧰 What you'll learn

- Why the four-strategy playbook is ordered as it is: each strategy answers a different way the write path dies
- Why log-structured engines (Cassandra, LSM trees) exist: in-place updates are the reason B-trees melt on writes — and the reason they read better
- Why Kafka's model is what it is: partitions, keys, offsets, consumer groups — and the durability each one buys
- Why load shedding exists: the queue is a buffer for bursts, not a throughput fix

## The write path, and why it breaks first

Writes hit harder than reads because they mutate state: every write touches the log, the indexes, and eventually disk. When a single database tops out (~10–20k write TPS for a tuned instance — verify with math before assuming), you have four strategies. Each one below earns its place by fixing a specific break — three breaks, three stories:

| Strategy | The move | The cost you must state |
|---|---|---|
| 1. Vertical + engine choice | Bigger box; swap to a write-optimized engine; strip read-only features (extra indexes, constraints, triggers) | Hardware ceilings exist; fast-write engines read slower |
| 2. Shard / partition | Spread writes across machines on a key (horizontal) or split data by access pattern (vertical) | Hot keys, cross-shard queries, no cross-shard transactions |
| 3. Queue + load shedding | Buffer short bursts; drop the least valuable writes when overloaded | Async semantics ("accepted" ≠ "written"); unbounded backlog if steady-state exceeds capacity |
| 4. Batching + aggregation | Amortize per-write overhead; pre-aggregate (100 likes on a post = 1 counter update per window) | Added latency; useless if traffic is too sparse to batch |

The vertical-partitioning variant is worth naming precisely: split one overloaded table by access pattern — write-once content in one store, high-frequency counter updates in another (in-memory), append-only analytics events in a third. Each store then gets the engine it deserves.

## Break 1 — the primary saturates

**The break, on the clock.** 8k writes/sec sustained against a database that absorbs 2k. Write p99 climbs past the SLA, log and index upkeep eat the disk, clients time out and retry into the storm. The read-scaling reflex from Challenge 5 does nothing here: replicas spread reads, but every write still lands on the one primary.

**The obvious fix, and why it fails:** a bigger box. Hardware ceilings exist and they're close — 10–20k TPS is a tuned instance's number, and the next box up buys a multiplier, not a law of physics. The write path needs to get faster per write and wider across machines.

**The fix: strategies 1 and 2 — engine first, then shards.** Strategy 1 is vertical + engine choice: a bigger box *and* a write-optimized engine, stripping read-only features (extra indexes, constraints, triggers). The engine choice is a write-path decision, and "Cassandra because it scales" is not the answer — the mechanism is:

| | B-tree (Postgres, MySQL) | Log-structured / LSM (Cassandra, LevelDB) |
|---|---|---|
| Write path | Update rows in place: seek, WAL, index upkeep | Sequential append to a log + in-memory table; flush later |
| Write throughput | ~1k–10k TPS, tuned | 10k+ TPS on modest hardware |
| Read path | Fast, direct indexed lookups | May consult memtable + several files, then merge |
| Sweet spot | Mixed workloads, transactions, consistency | Write-heavy ingestion, time-series, metrics |

That's the fundamental trade in one table: append-only writes buy throughput with read amplification. Same logic in other niches: time-series databases (InfluxDB, TimescaleDB) for timestamped streams, column stores (ClickHouse) for batch analytics. Whatever you pick, say the trade, not just the name. Strategy 2 is shard/partition: spread writes across machines on a key (horizontal) or split data by access pattern (vertical — the variant above).

**The cost:** fast-write engines read slower, and shards bring hot keys, cross-shard queries, and no cross-shard transactions — which is Break 3's material.

## Break 2 — the queue that never drains

**The break, on the clock.** The war story, continued: Kafka goes between the API and the database, the problem is declared solved — and the reviewer leans in: "The database absorbs 2k writes/sec. Traffic is 8k and staying there. What does the queue do?" It grows forever, latency climbs toward the retention horizon, and users are waiting on writes the system already told them it accepted. An 8k-against-2k gap is not a burst; it's the steady state, and no buffer holds a steady state.

**The obvious fix, and why it fails:** "the queue absorbs the load." Buffers delay; they don't remove. If steady-state demand exceeds what drains out the far end, the backlog is unbounded and the "accepted" ack was a lie the system told its users. Scaling a database isn't instant either — the queue buys minutes, not capacity.

**The fix: buffer the bursts, shed the rest (strategy 3).** A 4x Black Friday spike is a legitimate buffer job: queue it, drain it behind. The steady 8k-against-2k gap is not — that's a shedding decision: drop the writes the business can afford to lose. A driver re-sends location in 3 seconds, so yesterday's ping is expendable; keep clicks over impressions when forced to choose. Deciding *what may be dropped* is a requirements-stage decision — surface it there, not during the outage.

Kafka is the default tool when writes need buffering, ordering, or multiple readers — a distributed append-only log that doubles as a message queue and an event stream:

| Concept | What it is |
|---|---|
| Broker | One Kafka server; ~1M msgs/sec and ~TB-class storage apiece |
| Topic | A named stream — the logical category producers write, consumers read |
| Partition | An ordered, immutable, append-only log; the unit of parallelism |
| Key | Hashed to choose a partition — the only ordering guarantee you get |
| Offset | A message's position in its partition; consumers commit progress against it |
| Consumer group | Partitions spread across the group's consumers: parallel reads, each message handled once per group |

The rules that decide designs:

- **Ordering exists only within a partition.** Pick a key so related messages (same game, same user, same ad) land together — and accept that the key choice creates hot partitions when one key goes viral. Fixes, in order of preference: drop the key (no ordering needed), salt it (append a random suffix, aggregate on read), or compound it (key + region/user segment).
- **Durability is configuration.** Replication factor 3 (1 leader + 2 followers), `acks=all` so a write is acknowledged only after every in-sync replica has it. Don't push blobs through it — messages should stay ~1MB or less; store the video in S3 and send the pointer.
- **Delivery is at-least-once by default.** A consumer that dies after processing but before committing its offset will reprocess. Exactly-once requires idempotent producers plus transactional consumers; practical retry hygiene is a retry topic plus a dead-letter queue for the hopeless messages.
- **Retention, not deletion.** Messages persist (default ~7 days) and any consumer group can replay from any offset — that's what makes Kafka a stream, not just a queue. Consumers pull at their own pace; a slow consumer just grows its lag, visibly.

**The cost:** async semantics — "accepted" ≠ "written" — and the default delivery guarantee is at-least-once, so consumers must tolerate reprocessing unless you pay for exactly-once.

## Break 3 — the viral key that drowns its shard

**The break, on the clock.** Perfect key selection, even hashing, sharding done right — and one post goes viral at 100k likes/sec. Its key hashes to exactly one partition; that shard drowns while fifteen idle. And the fix that worked last quarter, resharding from 8 shards to 16, re-maps nearly everything under naive hashing — done live, that's an outage you scheduled yourself.

**The obvious fix, and why it fails:** add more shards. Re-mapping keys doesn't move a hot key: it still hashes to exactly one partition. And taking the system down to reshard trades a write problem for an availability problem.

**The fix: split the hot key, batch the aggregate, dual-write the migration.** For the viral key: write the count across k sub-keys (`post1Likes-0..k-1`), read them all and sum. Cost: k times the reads and k times the storage — acceptable for aggregatable data (likes, views, balances), impossible for data that must stay atomic (a user profile, which is rarely this hot anyway). Strategy 4 helps upstream: batching and aggregation amortize per-write overhead — 100 likes on a post = 1 counter update per window — at the price of added latency, and it's useless if traffic is too sparse to batch. On the Kafka side, the hot-partition fixes are the ones from Break 2's ordering rule, in order of preference: drop the key, salt it, or compound it. And resharding: never take the system down for it — dual-write to old and new shards, read from the new one, backfill, then cut over. Consistent hashing makes the eventual next reshard a fraction-sized move instead of a full migration.

**The cost:** k copies of hot data, read-side aggregation logic, batching latency — every one a price paid so no single component ever sees the whole storm.

The unifying principle: write scaling is the art of reducing throughput demanded of any single component — spread it, buffer it, shrink it, or drop it.

## 🤖 Design-review drill: run it

```text
You are a senior engineer leading my design review for a WRITE-HEAVY problem. Your goal is
to find out whether I can scale ingestion, not just draw boxes.

SETUP
Offer one of: "Design an ad click aggregator", "Design a metrics ingestion
system", or "Design a live event voting service". Confirm, then run 45
minutes in real time with phase clocks (Requirements ~5, Entities ~2, API
~5, High-Level ~10-15, Deep Dives ~10).

INJECT THESE CONSTRAINTS AND PROBES AT THE NATURAL MOMENTS
- Requirements: "Writes spike 10x during the Super Bowl. Still fine? What
  may we drop, if anything?"
- After my first database box: "That's 50k writes/sec sustained. Engine, and
  why?" (Push until I contrast an append-only/LSM engine with a B-tree one,
  with numbers.)
- When Kafka or a queue appears: "Partition key? What happens when one key
  goes viral?" (Push on hot partitions, salting, compound keys, ordering.)
- On durability: "A consumer dies mid-batch. At-least-once, exactly-once, or
  at-most-once — and what did you configure to get it?"
- On bursts: "The queue grows 5k msgs/sec faster than it drains. Now what?"
  (Look for: a queue is a buffer, not a fix — shed load or scale behind it.)
- If I put large payloads through the queue: challenge it — object storage
  plus a pointer message, not blobs in the log.

RULES
Stay in character. If I add a component without naming the break it fixes,
stop me: "What breaks without it?" Do not accept "we'll use Kafka" without
a partition key and a failure story attached. Hints only if I ask; smallest
nudge possible. At 45 minutes or "end review", stop.

SCORING
Score 1-4 on Problem Navigation, Solution Design, Technical Excellence,
Communication — one quoted moment each. Then report: did I do write-throughput
math before choosing an engine, is my partition key defensible, and did I
confuse queues with throughput. Name the weakest strategy in my playbook and
assign me a problem to re-run.

Ask me to pick a problem to start.
```

## ✅ You own it when

- [ ] You can name all four write-scaling strategies with one stated cost each
- [ ] You can explain, mechanism-level, why LSM writes beat B-trees and what it costs reads
- [ ] You can sketch Kafka's model and derive a partition key for any given stream
- [ ] You know at-least-once is the default and what exactly-once costs to get
- [ ] You can catch yourself (or a drill partner) using a queue as a throughput band-aid

## 📚 Jargon

| Term | What it means |
|---|---|
| Write TPS | Write transactions per second; the number that decides your storage engine |
| LSM / log-structured | Storage that appends sequentially instead of updating in place; fast writes, merged reads |
| B-tree | The default indexed storage of SQL databases; fast point reads, costlier in-place writes |
| Vertical partitioning | Splitting by columns/access pattern (content vs counters vs analytics), not by rows |
| Load shedding | Deliberately dropping the least valuable writes under overload instead of failing everything |
| Partition key | The message field hashed to pick a Kafka partition; controls ordering and load balance |
| Offset | A consumer's position in a partition's log; committed to resume after failure |
| Consumer group | A set of consumers splitting a topic's partitions; each message handled once per group |
| Dead-letter queue | Where messages go after failed retries, for later inspection |
| Hot partition / hot key | One key or partition absorbing disproportionate traffic despite even hashing |

## 🆘 When it goes wrong

- **You proposed a queue and the reviewer asks "then what?"** Own the physics: the queue delays but never absorbs steady overload. Answer with the pairing: "buffer for bursts, and behind it either a sharded write path or load shedding."
- **You picked Cassandra and can't say why it's fast.** Rebuild from the mechanism: sequential appends vs in-place updates. If you can't, downgrade to "a write-optimized engine — I'd validate with the actual workload" rather than bluffing internals.
- **Your partition key fragments under a viral event.** Don't redesign live. Add salting for that key: "we salt only keys our per-key metrics flag as hot — readers aggregate across the salted copies."
- **You promised exactly-once delivery casually.** Walk it back precisely: default is at-least-once; exactly-once needs idempotent producers plus transactional consumers — or design the consumer's writes to be idempotent instead, which is usually simpler.
- **The reviewer says "writes are only 5k/sec, why Kafka?"** Concede gracefully — that fits one tuned database. Do the math out loud (Challenge 4's numbers), then justify the queue only for ordering, decoupling, or genuine bursts.
- **You shard by created_at and every write lands on one shard.** Catch it before they do: time keys route all current writes to the newest shard. Prefer hashing a stable high-cardinality key; keep time as a column, not a distribution key.

➡️ **Next:** [Challenge 7 — Real-Time Updates](../07-real-time-updates/)
