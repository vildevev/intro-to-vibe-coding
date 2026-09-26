# Challenge 6 — Scaling Writes

**Mission:** Learn the four-strategy playbook for write-heavy systems — write-optimized storage engines, partitioning, queues with load shedding, and batching — plus Kafka's model, so a "now handle 10x writes" probe strengthens your design instead of sinking it.

**Time:** ~60 minutes

---

## 😱 War story: the queue that ate the backlog

"Design a metrics ingestion system — oh, and Black Friday quadruples writes." The candidate smiles and adds a Kafka box between the API and the database, declares the problem solved, and moves on. The interviewer leans in: "The database absorbs 2k writes/sec. Traffic is 8k and staying there. What does the queue do?" Silence, then the honest answer: it grows forever, latency climbs toward the retentions horizon, and users are waiting on writes the system already told them it accepted. A queue is a buffer for short bursts, not a throughput fix — the fix is making the write path itself faster or smaller. Every technique in this challenge exists to keep that follow-up question from ending you.

## 🧰 What you'll learn

- The four-strategy write-scaling playbook and the cost of each strategy
- Why log-structured engines (Cassandra, LSM trees) write 10x faster than B-trees — and read worse
- Kafka's model in five minutes: partitions, keys, offsets, consumer groups, durability
- The three moments writes bite: bursts, hot keys, resharding

## The write-scaling playbook

Writes hit harder than reads because they mutate state: every write touches the log, the indexes, and eventually disk. When a single database tops out (~10–20k write TPS for a tuned instance — verify with math before assuming), four strategies, in combination:

| Strategy | The move | The cost you must state |
|---|---|---|
| 1. Vertical + engine choice | Bigger box; swap to a write-optimized engine; strip read-only features (extra indexes, constraints, triggers) | Hardware ceilings exist; fast-write engines read slower |
| 2. Shard / partition | Spread writes across machines on a key (horizontal) or split data by access pattern (vertical) | Hot keys, cross-shard queries, no cross-shard transactions |
| 3. Queue + load shedding | Buffer short bursts; drop the least valuable writes when overloaded | Async semantics ("accepted" ≠ "written"); unbounded backlog if steady-state exceeds capacity |
| 4. Batching + aggregation | Amortize per-write overhead; pre-aggregate (100 likes on a post = 1 counter update per window) | Added latency; useless if traffic is too sparse to batch |

The vertical-partitioning variant is worth naming precisely: split one overloaded table by access pattern — write-once content in one store, high-frequency counter updates in another (in-memory), append-only analytics events in a third. Each store then gets the engine it deserves.

## Storage engines that love writes

The engine choice is a write-path decision, and "Cassandra because it scales" is not the answer — the mechanism is:

| | B-tree (Postgres, MySQL) | Log-structured / LSM (Cassandra, LevelDB) |
|---|---|---|
| Write path | Update rows in place: seek, WAL, index upkeep | Sequential append to a log + in-memory table; flush later |
| Write throughput | ~1k–10k TPS, tuned | 10k+ TPS on modest hardware |
| Read path | Fast, direct indexed lookups | May consult memtable + several files, then merge |
| Sweet spot | Mixed workloads, transactions, consistency | Write-heavy ingestion, time-series, metrics |

That's the fundamental trade in one table: append-only writes buy throughput with read amplification. Same logic in other niches: time-series databases (InfluxDB, TimescaleDB) for timestamped streams, column stores (ClickHouse) for batch analytics. Whatever you pick, say the trade, not just the name.

## Kafka in five minutes

Kafka is a distributed append-only log that doubles as a message queue and an event stream — the default answer when writes need buffering, ordering, or multiple readers.

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

## When writes bite

Three moments where write-heavy designs actually fail, and the standard plays:

- **Bursts.** A 4x spike either gets buffered (queue — fine for short bursts, fatal as a steady-state band-aid; scaling a database isn't instant either) or shed (drop writes the business can afford to lose: a driver re-sends location in 3 seconds, so yesterday's ping is expendable; keep clicks over impressions when forced to choose). Deciding *what may be dropped* is a requirements-stage decision — surface it there.
- **Hot keys.** A viral post takes 100k likes/sec and its single shard drowns even after perfect key selection. Split it: write the count across k sub-keys (`post1Likes-0..k-1`), read them all and sum. Cost: k times the reads and k times the storage — acceptable for aggregatable data (likes, views, balances), impossible for data that must stay atomic (a user profile, which is rarely this hot anyway).
- **Resharding.** Going from 8 shards to 16 re-maps nearly everything under naive hashing. Never take the system down for it: dual-write to old and new shards, read from the new one, backfill, then cut over. Consistent hashing makes the eventual next reshard a fraction-sized move instead of a full migration.

The unifying principle: write scaling is the art of reducing throughput demanded of any single component — spread it, buffer it, shrink it, or drop it.

Go deeper on Kafka internals and the Cassandra data model at [Hello Interview's system design course](https://www.hellointerview.com/learn/courses/system-design).

## 🤖 Mock interview: run it

```text
You are my system design interviewer for a WRITE-HEAVY problem. Your goal is
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
Stay in character. Do not accept "we'll use Kafka" without a partition key
and a failure story attached. Hints only if I ask; smallest nudge possible.
At 45 minutes or "end interview", stop.

SCORING
Score 1-4 on Problem Navigation, Solution Design, Technical Excellence,
Communication — one quoted moment each. Then report: did I do write-throughput
math before choosing an engine, is my partition key defensible, and did I
confuse queues with throughput. Name the weakest strategy in my playbook and
assign me a problem to re-run.

Ask me to pick a problem to start.
```

## ✅ Interview-ready when

- [ ] You can name all four write-scaling strategies with one stated cost each
- [ ] You can explain, mechanism-level, why LSM writes beat B-trees and what it costs reads
- [ ] You can sketch Kafka's model and derive a partition key for any given stream
- [ ] You know at-least-once is the default and what exactly-once costs to get
- [ ] You can catch yourself (or a mock partner) using a queue as a throughput band-aid

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

- **You proposed a queue and the interviewer asks "then what?"** Own the physics: the queue delays but never absorbs steady overload. Answer with the pairing: "buffer for bursts, and behind it either a sharded write path or load shedding."
- **You picked Cassandra and can't say why it's fast.** Rebuild from the mechanism: sequential appends vs in-place updates. If you can't, downgrade to "a write-optimized engine — I'd validate with the actual workload" rather than bluffing internals.
- **Your partition key fragments under a viral event.** Don't redesign live. Add salting for that key: "we salt only keys our per-key metrics flag as hot — readers aggregate across the salted copies."
- **You promised exactly-once delivery casually.** Walk it back precisely: default is at-least-once; exactly-once needs idempotent producers plus transactional consumers — or design the consumer's writes to be idempotent instead, which is usually simpler.
- **The interviewer says "writes are only 5k/sec, why Kafka?"** Concede gracefully — that fits one tuned database. Do the math out loud (Challenge 4's numbers), then justify the queue only for ordering, decoupling, or genuine bursts.
- **You shard by created_at and every write lands on one shard.** Catch it before they do: time keys route all current writes to the newest shard. Prefer hashing a stable high-cardinality key; keep time as a column, not a distribution key.

➡️ **Next:** [Challenge 7 — Real-Time Updates](../07-real-time-updates/)
