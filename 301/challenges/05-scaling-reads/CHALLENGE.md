# Challenge 5 — Scaling Reads

**Mission:** Master the read-scaling ladder — indexes first, then replicas, then caches, then CDNs — by building the canonical read-heavy system (a URL shortener) end to end, and learn the three failure modes that bite once reads are cached.

**Time:** ~60 minutes

---

## 😱 War story: the cache that arrived without a number

Two candidates, "Design a URL shortener." The first aces short-code generation — counters, base62, collision math — then lets every redirect hit the database forever, and only mumbles "we could add Redis" when prompted, with no hit rate, no latency, no load number attached. The second produces a simpler code generator, then says: "500M redirects a day is ~6k QPS average and ~600k at peak; one indexed database can't absorb peak, so Redis in front cuts origin load by the hit rate — call it 95% — and the DB only serves the long tail." The second candidate is Senior. The difference isn't knowledge; it's the reflex to quantify the read path before touching the write path, and to treat the cache as a load-reduction argument, not a buzzword.

## 🧰 What you'll learn

- The read-scaling ladder and the numeric triggers for each rung
- The full URL shortener: requirements, math, code generation, the 301/302 choice
- The three ways cached reads fail: hot keys, stampedes, staleness — and their fixes
- When NOT to cache

## The read-scaling ladder

Read traffic outgrows write traffic almost everywhere: per tweet read thousands of times, per product page viewed hundreds of times, ratios of 100:1 and beyond are normal. When the database strains, climb this ladder in order — each rung is cheaper than the one above it:

| Rung | Move | Trigger | The catch |
|---|---|---|---|
| 1. Optimize in place | Index the queried/sorted/joined columns; denormalize hot read paths; materialize expensive aggregates | Any read problem, always first | None worth mentioning — under-indexing kills more systems than over-indexing |
| 2. Read replicas | Writes go to a primary; reads fan out to copies | Well-indexed DB past ~50–100k read QPS | Replication lag: a reader may see its own write late (route those reads to the primary) |
| 3. Cache | Redis in front, cache-aside | Hot subset of data, expensive queries, or strict latency targets | Staleness, invalidation, and everything below |
| 4. CDN / edge | Serve shared, public data from edge locations | Globally distributed users reading shared content | Only pays off for data many users share; useless for one user's private settings |

Read replicas double as high availability (promote a replica if the primary dies) — replication for HA and caching for load are separate tools and you should say so. CDN caching routinely cuts origin load by 90%+ for public content and drops a 200ms cross-ocean round trip to under 10ms nearby.

## Worked example: the URL shortener

The cleanest read-heavy interview problem. Run the framework:

**Requirements.** Functional (top 3): submit a long URL, get a short one (optional custom alias, optional expiry); a short URL redirects to the original. Non-functional, quantified: redirect < 100ms; availability over consistency (a stale mapping is harmless); scale to ~1B URLs and 100M DAU. The defining fact: reads dwarf writes — call it 100:1 to 1000:1.

**The math.** Redirects: 100M DAU × 5 clicks ≈ 500M/day ÷ 86,400 ≈ 6k QPS average — but traffic peaks, so design for roughly 100x spikes ≈ 600k QPS at peak. Storage: 1B rows × ~500 bytes ≈ 500GB — comfortably one instance. Conclusion before any architecture: this system is a caching problem, not a storage problem.

**Generating the code** — the classic deep dive:

| Approach | How | For | Against |
|---|---|---|---|
| URL prefix | First N chars of the long URL | Nothing | Collides constantly — same prefix, different pages |
| Hash + base62 | Hash the URL, base62-encode, take ~7–8 chars | No coordination; deterministic (dedupe free) | Collisions need a UNIQUE constraint plus bounded retries |
| Counter + base62 | Atomic counter (Redis INCR), encode in base62 | Unique by construction; 62^6 ≈ 56B codes at 6 chars | Central coordination point; sequential codes are guessable |

Base62 (a–z, A–Z, 0–9) because URL-safe: base64's `+` and `/` don't survive URLs. The counter scales across write instances via batching — each instance grabs a block of 1,000 values, and "lost" values on a crash don't matter, since uniqueness, not continuity, is the requirement.

**The redirect.** GET /{code} → look up → 302 redirect. 302 (temporary) over 301 (permanent): browsers cache a 301 and stop visiting you entirely, killing expiry control and any future click analytics. With the ladder applied: Redis cache-aside on the code→URL map (mappings are immutable, so staleness is nearly free), optionally the redirect itself executed at the CDN edge for hot codes, and the database touched only for long-tail cache misses. One instance of Postgres behind that is untouchable.

## Where reads bite

Once reads are cached, three failure modes interviewers probe — each with a name and a fix:

| Failure | What happens | The fix |
|---|---|---|
| **Hot key** | One key (a celebrity profile) takes 500k req/s and saturates a single cache node even at a great hit rate | Request coalescing (N servers = N backend requests, max); fan the key out to k identical copies and read them randomly; keep it in-process |
| **Stampede** | A popular entry expires; every concurrent request misses simultaneously and the DB eats them all at once | Probabilistic early refresh (refresh odds climb as entries age); background warming for the critical few; lock-and-wait as the blunt option |
| **Staleness** | Data changed but the cache still serves yesterday's value | Delete-on-write plus short TTL; or versioned keys — bump a version column in the same transaction, read `event:123:v43`, and old versions simply stop being requested |

Push a level deeper on staleness: deletion-based invalidation has races (a slow reader re-caches the old value between delete and rewrite) and CDN edges make "delete everywhere" genuinely hard — versioned keys sidestep both by routing around stale entries instead of hunting them down. Set your TTL from the non-functional requirement: "search results may be 30 seconds stale" is a TTL of 30 seconds, not a vibe.

## When NOT to scale reads

Show judgment by refusing the tool: write-heavy systems (driver location pings are a write problem — Challenge 6), small scale (a single indexed database handles thousands of QPS — solve the stated problem, not the imagined one), strongly consistent data (inventory, money — you'd still cache, but with aggressive invalidation and short TTLs), and real-time collaborative data (caching actively fights every-keystroke-visible). And remember the goal is load reduction, not latency cosmetics: if the DB is comfortable and you need speed, the answer might be edge placement, not a cache.

Go deeper on the full Bitly breakdown and the cache failure modes at [Hello Interview's system design course](https://www.hellointerview.com/learn/courses/system-design).

## 🤖 Mock interview: run it

```text
You are my system design interviewer. Today's session is a READ-HEAVY design:
I must not only design the system but defend its cache strategy under fire.

SETUP
Offer me one of: "Design a URL shortener", "Design Pastebin", or "Design an
image hosting service" — or take the problem I name if it's read-heavy.
Confirm, then run 45 minutes in real time with phase clocks (Requirements
~5, Entities ~2, API ~5, High-Level ~10-15, Deep Dives ~10).

MANDATORY DEEP DIVES — pull me into at least two of these:
1. "Reads are 100x writes. Walk a single redirect request through every layer
   at peak, with rough numbers."
2. "Your cache entry for the hottest key just expired. What happens next?"
   (Push until I name the stampede and a fix: coalescing, early refresh,
   warming.)
3. "The data behind a cached entry changed. When do users see the update?"
   (Push on invalidation: delete-on-write, TTLs, versioned keys, and the
   race conditions of deletion.)
4. "CDN or no CDN? Argue both sides."
Expect exact numbers: I should state my QPS, my assumed hit rate, and what
the database absorbs when the cache fails.

RULES
Stay in character. If I add a cache without numbers, stop me: "What problem
does it solve, quantified?" If I skip indexes before caches, point at the
database and raise an eyebrow. Hints only on request, smallest nudge
possible.

SCORING
After 45 minutes or "end interview": score 1-4 on Problem Navigation,
Solution Design, Technical Excellence, Communication — one quoted moment
each. Then report: did I quantify before adding infrastructure, did I know
all three read failure modes (hot key, stampede, staleness), and did I
optimize the database before reaching for the cache. Assign me one drill to
repeat.

Ask me to pick a problem to start.
```

## ✅ Interview-ready when

- [ ] You can run the full URL shortener in 45 minutes with the math spoken out loud
- [ ] Your first move on any read problem is indexes, not Redis
- [ ] You can justify 302 over 301 (and know when a 301 would be fine)
- [ ] You can name hot key, stampede, and staleness with a fix for each, unprompted
- [ ] You can say "we shouldn't cache this" and explain why in at least one mock

## 📚 Jargon

| Term | What it means |
|---|---|
| Read/write ratio | Reads per write (100:1 means 100 reads for every write); drives the whole strategy |
| Read replica | A copy of the DB that serves reads; written to by the primary, async by default |
| Replication lag | The delay before a replica reflects the primary's latest writes |
| Base62 | Digits 0-9, a-z, A-Z — URL-safe encoding for compact numeric IDs |
| 301 vs 302 | Permanent vs temporary redirect; browsers cache the permanent one |
| Cache hit rate | Fraction of reads served from cache; the number that justifies the cache |
| Request coalescing | Collapsing N identical in-flight requests into one backend fetch |
| Versioned keys | Cache key includes a version number, so updates route to a new key instead of invalidating |

## 🆘 When it goes wrong

- **You reach for Redis before doing any math.** Stop and quantify out loud: DAU × reads ÷ 86,400, peak multiple, then the cache as a hit-rate argument. If the DB survives the peak, say the cache is premature.
- **The interviewer asks "what if the cache goes down?" and you freeze.** Answer in two layers: requests fall through to the DB (which is why the DB must survive the miss storm), and coalescing/circuit breakers keep the stampede from crushing it.
- **You claim "the cache keeps data consistent."** It doesn't — it trades staleness for load. Name the staleness window, tie it to a requirement, and pick invalidation or TTLs accordingly.
- **Your counter-based short codes "felt random" but aren't.** Sequential codes are enumerable. Either accept it (short URLs are shared publicly anyway) or say you'd scramble the counter with a reversible transform — don't pretend the problem away.
- **You spend 25 minutes on code generation and never draw the redirect path.** The redirect is the read path — the actual interview. Timebox codegen to ~5 minutes and move.

➡️ **Next:** [Challenge 6 — Scaling Writes](../06-scaling-writes/)
