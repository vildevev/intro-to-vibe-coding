# Challenge 4 — Thinking in Scale

**Mission:** Get fluent in the numbers that drive design decisions — modern hardware limits, QPS and storage arithmetic, the caching pattern table, and when sharding is actually warranted — so every scaling claim you make is anchored in math.

**Time:** ~60 minutes

---

## 😱 War story: sharding 10 gigabytes

The candidate draws their schema and says, with confidence, "next, we shard the database by user ID." The interviewer asks the innocent-sounding question: "How much data are we at?" Pause. "Ten million businesses at about a kilobyte each… about 10GB. Ten with reviews." Silence. The candidate just proposed the single most expensive, most operationally painful technique in the toolkit — for a dataset that fits on one cheap instance a hundred times over. Sharding-in-minute-eight is the tell of book learning. The same candidate often fears SSD latency ("we must cache everything!") while quoting 2015 hardware limits. Both failures are cured the same way: knowing the actual numbers.

## 🧰 What you'll learn

- The 2026 numbers table: what a cache, database, app server, and queue can actually absorb
- Back-of-envelope QPS and storage math you can do out loud in 30 seconds
- The four cache patterns and the eviction policies that keep them honest
- When sharding is warranted — and the checklist for doing it right

## The numbers that matter now

Modern hardware would embarrass your textbooks. Servers ship with up to 4TB of RAM; databases hold tens of terabytes per instance; the constraint that kills designs is almost never storage.

| Component | Typical numbers (2026) | Consider scaling when |
|---|---|---|
| In-memory cache | ~1ms reads; 100k+ ops/sec per instance; up to ~1TB | Hit rate < 80%, or ops/sec near 100k sustained |
| SQL database | 1–5ms indexed reads; ~10–20k write TPS; tens of TB per instance (Aurora ~256 TiB) | Sustained writes > 10k TPS, > ~50TB, or multi-region needs |
| App server | 100k+ concurrent connections; 8–64 cores; 64–512GB RAM | CPU or memory pinned above ~80%, latency breaches SLA |
| Message queue | ~1M msgs/sec per broker; 1–5ms in-region | Consumer lag keeps growing; ~200k partitions |
| Network | <1ms same datacenter; 1–2ms cross-zone; 50–150ms cross-region | — |

The latency ladder underneath those rows: RAM ~100ns, SSD indexed lookup ~1ms or less, spinning disk ~10ms (and mostly extinct), cross-region round trip 50–150ms — that last one is physics (light in fiber), which is why geography is a design constraint, not a tuning knob.

Two traps these numbers kill:

- **Premature sharding.** Do the multiplication before proposing it. 10M businesses × 1KB = 10GB; even 100GB fits comfortably on one instance. A single "instance" still means primary + replicas for availability — replication for HA and sharding for scale are different tools.
- **Overestimating latency.** An indexed row lookup on SSD is sub-millisecond to low-milliseconds. Caching cheap lookups buys you little; cache the expensive queries instead.

## Back-of-envelope drills

Two formulas, done out loud, rounded aggressively:

- **QPS** = DAU × actions per user per day ÷ 86,400 seconds, then × 2–10 for peak.
- **Storage** = rows × bytes per row (round each row up generously).

Worked example, spoken version: "100M DAU, each reading 10 pages a day — that's 1B reads over 86,400 seconds, roughly 12k QPS average, call it 60k at peak. Writes: 100M users posting twice a day is 2k writes/sec — trivial. Storage: 100M posts × 1KB ≈ 100GB a year; a single database laughs." Every conclusion is now justified: reads need a cache strategy at peak, writes need nothing exotic.

The flip side — when math *does* change the design: a trending-topics service needs to know how many distinct topics it's counting. If it's 10k, one in-memory heap works. If it's 100M, that heap must be sharded. That estimate isn't decoration; it's a fork in the design. If an estimate won't change anything, skip it and say so.

## Caching, properly

Where caching can live, outermost to innermost: browser → CDN → external cache (Redis — the interview default) → in-process memory (for tiny hot values like feature flags). When you propose one, walk five steps: the bottleneck (quantified), what to cache (frequent, rarely-changing, expensive to compute), the pattern, the eviction policy, and the failure modes.

| Pattern | Who writes the DB | Trade-off | Default? |
|---|---|---|---|
| **Cache-aside** | App, on cache miss | Simplest; small stale window; miss costs extra latency | Yes — say this one |
| **Write-through** | Cache writes synchronously to DB | Reads always fresh; writes slower; may cache never-read data | Only when reads must be fresh |
| **Write-behind (write-back)** | Cache flushes to DB asynchronously | Very fast writes; data loss if the cache dies | High write volume where loss is tolerable |
| **Read-through** | The cache itself fetches on miss | Centralized logic; that's literally how a CDN works | Rarely proposed by name |

Eviction policies keep memory bounded: **LRU** evicts the least recently touched (the safe default), **LFU** tracks frequency (steady favorites like trending lists), **FIFO** ignores usage (rarely defensible), and **TTL** expires entries after a period — not a replacement for the others, but always combined with them. The failure modes every cache carries: a **stampede** when one hot key expires and thousands of requests hit the DB at once (fix: coalesce the rebuilds or refresh early), **staleness** (fix: invalidate on write, short TTL, or accept it), and **hot keys** that overload one cache node no matter how healthy the hit rate is (fix: replicate the key or keep it in-process). Each gets dissected in Challenge 5.

## Sharding, introduced

Partitioning splits a table inside one machine; sharding splits data across machines. Reach for it when a single instance genuinely hits a wall: write throughput above ~10k TPS sustained, storage beyond tens of terabytes, or a geographic requirement. Two decisions define it:

**The shard key.** High cardinality (user_id: millions of values; a boolean: two), even distribution (user_id again; country no), and aligned with queries (user-scoped queries hit exactly one shard). Sharding by creation date dumps every write on the newest shard — a self-inflicted hotspot.

| Strategy | How it assigns shards | Strength | Weakness |
|---|---|---|---|
| **Range** | user 1–1M → shard 1, next million → shard 2 | Simple; efficient range scans | Recent-time hotspots; uneven access |
| **Hash** (default) | hash(user_id) mod N | Even distribution, always | Resharding moves nearly everything — fix via consistent hashing |
| **Directory** | Lookup table maps each key to a shard | Total flexibility; move hot users anywhere | A lookup on every request + a new single point of failure |

**The costs you must name.** Hot spots (the celebrity whose data one shard serves 1000x harder than anyone else's), cross-shard queries ("top 10 posts globally" fans out to every shard — cache or precompute those), and the death of cross-shard transactions (no more ACID across machines — co-locate a user's data on one shard, or orchestrate multi-step operations with compensating actions). Modern databases (Cassandra, DynamoDB, MongoDB) shard by partition key automatically; Vitess/Citus bring it to Postgres/MySQL. In the room, "we'd shard by user_id with consistent hashing, and keep each user's data on one shard so transactions stay local" is the whole answer.

Go deeper: [Hello Interview's system design course](https://www.hellointerview.com/learn/courses/system-design) covers consistent hashing and CAP in the same depth as this material.

## 🤖 Mock interview: run it

```text
You are a system design interviewer who believes candidates who can't do the
math can't do the design. You will make me prove scale-sense before any
architecture.

SETUP
Ask me to pick: "Design a trending topics service", "Design a photo sharing
app", or "Design a leaderboard". Then set the clock: 40 minutes.

PHASE 1 — NUMBERS GATE (first ~8 minutes)
Refuse to discuss architecture until I have estimated, out loud:
- Read and write QPS from DAU and per-user actions (average AND peak)
- Storage for 5 years
- Whether any of those numbers changes the design
Demand the arithmetic, not just the answer: "show me the multiplication."
Then stress one number: "10x peak traffic — does anything above change?"
Only once my numbers hold, let me proceed to the design.

PHASE 2 — DESIGN, WITH TRAPS
As I design, deploy these probes at the natural moment:
- I propose a cache → "Eviction policy? And what's your worst case when the
  hottest key expires at once?"
- I propose sharding → "Back up. Do the math — is a single database dead?"
- I quote a latency → "Where did that number come from?"
- I skip consistency → "What can be stale, and for how long?"
- I put everything in one DB → "What breaks first: reads, writes, or storage?"

RULES
Never give me numbers; make me derive them. Hints only if I ask, and give me
units, not answers. At 40 minutes or when I say "end interview", stop.

SCORING
Score 1-4 on Problem Navigation, Solution Design, Technical Excellence,
Communication, with quoted evidence. Grade my numbers separately: any
estimate off by 10x or more is a fail regardless of the design. Report my
weakest area — arithmetic, cache reasoning, or scaling judgment — and which
drill to repeat.

Begin by asking me to pick a problem.
```

## ✅ Interview-ready when

- [ ] You can quote the numbers table from memory — cache, DB, app server, queue
- [ ] You can compute QPS and storage for any prompt in under 30 seconds, out loud
- [ ] You reach for cache-aside by default and can name the other three patterns and their costs
- [ ] You propose LRU + TTL as the eviction answer and can name stampede/staleness/hot-key
- [ ] You've killed a premature sharding instinct with math at least once in a mock

## 📚 Jargon

| Term | What it means |
|---|---|
| QPS / TPS | Queries (or transactions, writes) per second — the throughput unit |
| DAU | Daily active users; multiply by per-user actions to get daily traffic |
| Cache-aside | App checks cache, on miss reads DB and backfills the cache |
| Write-through / write-behind | Cache writes to DB synchronously vs asynchronously in the background |
| LRU / LFU / TTL | Evict least-recently-used / least-frequently-used / anything older than its expiry |
| Cache stampede | Hot key expires; simultaneous misses stampede the database |
| Hot key | One key taking wildly disproportionate traffic |
| Shard key | The column data is split on; must be high-cardinality, even, query-aligned |
| Consistent hashing | Hash-ring scheme so adding/removing shards moves only a fraction of data |
| TiB | Tebibyte, ~1.1 trillion bytes; the scale modern single instances reach |

## 🆘 When it goes wrong

- **Your mental arithmetic stalls under pressure.** Round brutally: 86,400 seconds/day ≈ 100k, so "1B reads/day ≈ 10k QPS" is close enough and sounds better than a 20-second pause. State the rounding: "call it 10k, order of magnitude."
- **You proposed sharding and got the "how much data?" question.** Never bluff. Answer the number, then reverse: "…which fits on one instance, so sharding is premature — the real constraint is read load, and I'd add replicas first."
- **You added a cache to make "fast" things faster.** If the lookup is already ~1ms on SSD, the cache adds a network hop for nothing. Re-aim it at the expensive query or drop it.
- **The interviewer asks "what's your eviction policy?" and you freeze.** LRU with TTLs. Then one sentence on why (recent access predicts future access; TTL bounds staleness). Don't recite all four policies unprompted.
- **You're stuck choosing between two cache patterns.** Default cache-aside, then say when you'd upgrade: "If reads must never see stale data, write-through; if writes dominate and some loss is acceptable, write-behind."

➡️ **Next:** [Challenge 5 — Scaling Reads](../05-scaling-reads/)
