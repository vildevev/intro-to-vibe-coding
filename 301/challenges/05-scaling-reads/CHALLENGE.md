# Challenge 5 — Scaling Reads

**Mission:** Climb the read-scaling ladder — indexes, replicas, caches, CDNs — the only way it sticks: by breaking a URL shortener at each rung and letting the break force the next move. Every technique arrives because the previous fix stopped working, and every fix names its cost.

**Time:** ~60 minutes

---

## 😱 War story: the cache that arrived without a number

Two candidates, "Design a URL shortener." The first aces short-code generation, then lets every redirect hit the database forever, mumbling "we could add Redis" with no number attached. The second opens with: "500M redirects a day is ~6k QPS average, ~600k at peak — the DB can't absorb peak, so a cache cutting 95% is the whole design." The second is Senior. Not because they know the word "cache" — because they predicted the break before it happened. This challenge teaches the ladder the same way: break by break.

## 🧰 What you'll learn

- Why the read-scaling ladder is ordered the way it is: each rung exists because the one below hits a wall with a name
- The full URL shortener, built under load — requirements, math, code generation, 301 vs 302
- The three ways a cache breaks (hot key, stampede, staleness) — each as a moment you can watch coming
- When to refuse the ladder entirely

## The system that works (until it doesn't)

**Requirements.** Submit a long URL, get a short one; a short URL redirects. Non-functional: redirects under 100ms, availability over consistency (a stale mapping is harmless), ~1B URLs, 100M DAU. The defining fact: reads dwarf writes, 100:1 to 1000:1.

**The math — how you predict your own break.** 100M DAU × 5 clicks ≈ 500M redirects/day ÷ 86,400 ≈ **6k QPS average**, with traffic spikes of ~100x: **600k QPS at peak**. Storage: 1B rows × ~500B ≈ 500GB — one machine, comfortably. Write those two sentences before any architecture: *this is a load problem wearing a storage costume*, and the load problem is read-shaped.

Code generation, quickly (it's the write path; the review is the read path): hash + base62 needs collision retries; a counter (Redis INCR) gives uniqueness by construction — 62⁶ ≈ 56B codes at 6 chars, batched out in blocks of 1,000 per instance so the counter isn't a hotspot. Base62 because base64's `+` and `/` don't survive URLs. Redirect via **302, not 301** — remember that choice, it returns in Break 2.

Day one, this is one Postgres with an indexed `code` column and one app server. It works.

## Break 1 — launch day: the database melts

The link goes viral. The graph you watch: p99 latency climbs from 20ms to 400ms, then connection-pool exhaustion errors. The math you should have said out loud: an indexed point-select on commodity Postgres saturates around 10–20k QPS — your *average* fits, your peak is 30–60x past it. The database isn't slow; it's full.

**The obvious fix, and why it fails:** "get a bigger database." Vertical scaling buys maybe 5–10x, costs superlinearly, and — the disqualifier — one giant box is one failure domain: when it melts on launch day, everything melts with it. Senior signal: naming *why* the obvious fix fails before naming yours.

**The fix: read replicas.** Writes go to a primary; reads fan out to N copies. 600k QPS at ~15k per replica ≈ 40 replicas — ugly but physically possible, which is the point: you've turned a hard wall into a tunable knob. Replicas double as high availability (promote one when the primary dies) — say that as a bonus, not the reason; the reason is read load.

**The cost:** replication lag. A user who just created a short URL might not find it on the replica their next request hits. For redirects: harmless — mappings are immutable. For the creator's dashboard: route read-your-own-writes to the primary. Every fix in this challenge costs something; name it before the reviewer does.

## Break 2 — forty replicas later: the bill and the map disagree

Now the honest question: 40 replicas of a 500GB database, most serving the *same popular links* over and over. Traffic on shorteners — like almost everything — is Zipfian: the top few percent of URLs carry the majority of redirects, and they're requested from everywhere on Earth. The symptom list: replica count tracks the long tail you don't need, cross-ocean latency dominates your 100ms budget (a 200ms round trip is a broken requirement regardless of DB health), and the invoice arrives.

**The obvious fix, and why it fails:** more replicas, distributed globally. Now you're replicating *all* data to *every* region to serve reads that are 95% the same 10k rows. You'd pay for the long tail everywhere to serve the hot head anywhere.

**The fix: a cache in front — cache-aside in Redis.** Read path: check Redis, miss → read a replica, populate, return. At a 95% hit rate, origin load drops 20x: 40 replicas becomes 2–3. The two sentences that justify it are always the same two: *the traffic is repeated, and the data is shared* — say both, because the cache is a load-reduction argument, not a latency decoration. (When latency alone is the problem and the DB is comfortable, the answer is edge placement, not a cache — that's a different fix for a different break.)

The browser is a cache too, and it's why you chose **302** back in the design: a 301 is cached *by the browser*, permanently — great for load, fatal for expiry control and click analytics. 302 keeps every redirect coming through you. And for hot codes at global scale, the last rung of the ladder: execute the redirect at the **CDN edge** — public, shared, immutable data is exactly what CDNs exist for, and edge execution takes a 200ms round trip to under 10ms.

**The cost:** the cache is a new component with new failure modes — and a cache that fails *loudly* can resurrect Break 1. Which is the next break.

## Break 3 — the cache breaks, and Break 1 comes back

Three moments, each with a name. Reviewers probe all three; have the moment, the symptom, the fix, and the cost for each:

| The moment | What you see | The obvious fix, and why it fails | The fix | The cost |
|---|---|---|---|---|
| **Hot key** — one celebrity link takes 500k req/s | One cache node at 100% CPU while its neighbors idle; hit rate is great, the node is melting | Add cache nodes — doesn't help; the key lives on exactly one | Replicate the hot key to k copies, read randomly; request coalescing; or keep it in-process | More memory for redundancy you mostly don't need |
| **Stampede** — a hot entry expires | Brief, perfect storm: thousands of simultaneous misses hit the DB at once — Break 1 rebuilt inside your cache | "Cache for longer" — delays it, doesn't remove it; bigger DB — paying to absorb your own design choice | Probabilistic early refresh (odds climb with age); pre-warm the critical few; lock-and-wait as the blunt tool | Complexity, and a background-refresh job to babysit |
| **Staleness** — the destination changed; users see yesterday's | Support ticket, not a graph | Delete-on-write everywhere — has races (a slow reader re-caches the old value mid-delete) and "delete everywhere" is genuinely hard with CDN edges involved | Versioned keys: bump a version in the same transaction, read `code:v43`; old versions stop being requested | Unbounded old keys — bound it with a TTL anyway |

TTLs deserve one sentence of discipline: set them from the non-functional requirement — "search results may be 30 seconds stale" is a TTL of 30 seconds, not a vibe. For a URL shortener the mappings are immutable, which is why this system is the *friendly* case: staleness is nearly free. Reviewers will move you to systems where it isn't.

## The senior move: refusing the ladder

Each rung cost you something: replicas cost lag, the cache costs staleness and stampedes, the CDN costs control. So practice refusing it out loud: write-heavy data (driver location pings are a *write* problem — Challenge 6), small scale (one indexed database handles thousands of QPS — solve the stated problem, not the imagined one), strong-consistency data (inventory, money — cache only with aggressive invalidation and short TTLs), real-time collaboration (caching fights every-keystroke-visible by design). "We don't need a cache because the peak is 3k QPS and the DB absorbs 20k" is a senior sentence.

## 🤖 Design-review drill: run it

```text
You are a senior engineer leading my design review. Today's session is a READ-HEAVY design,
and your style is the failure ladder: every time I add a component, you ask
"what break does that fix?" — and if I can't name the break with a number,
you make me quantify it before moving on.

SETUP
Offer one of: "Design a URL shortener", "Design Pastebin", or "Design an
image hosting service" — or take a read-heavy problem I name. Confirm, then
run 45 minutes with phase clocks (Requirements ~5, Entities ~2, API ~5,
High-Level ~10-15, Deep Dives ~10).

MANDATORY DEEP DIVES — pull me into at least two:
1. "Walk one redirect through every layer at peak, with numbers."
2. "Your hottest cache entry just expired. What happens next?" (Push until
   I name the stampede and a fix.)
3. "The data behind a cached entry changed. When do users see it?" (Push on
   invalidation races and versioned keys.)
4. "Your cache is down entirely. Walk me through the blast radius." (I must
   fall through to the DB and survive the miss storm.)
RULES: if I add a component without naming the break it fixes, stop me:
"What breaks without it?" If I skip indexes before caches, raise an eyebrow.
If I claim the cache keeps data consistent, correct me. Hints on request,
smallest nudge possible.

SCORING
Score 1-4 each: Problem Navigation, Solution Design, Technical Excellence,
Communication — one quoted moment per score. Then report: did every
component I added trace to a named break, did I know all three cache
failure modes, and did I ever refuse a rung of the ladder. Assign one drill.

Ask me to pick a problem to start.
```

## ✅ You own it when

- [ ] You can run the full URL shortener in 45 minutes, math spoken out loud, and *predict* the break before the reviewer names it
- [ ] Every component you draw traces to a named break: "replicas because 600k peak; cache because Zipfian repeats; CDN because global"
- [ ] Your first move on any read problem is indexes, not Redis
- [ ] You can name hot key, stampede, and staleness with the moment, the fix, and the cost — unprompted
- [ ] You have refused a rung of the ladder with numbers, out loud, at least once

## 📚 Jargon

| Term | What it means |
|---|---|
| Read/write ratio | Reads per write (100:1 = 100 reads per write); decides whether this challenge is your problem |
| Read replica | A copy serving reads, fed async by the primary; buys read headroom and HA |
| Replication lag | Delay before a replica sees the primary's latest writes; the cost of Break 1's fix |
| Zipfian distribution | A few keys take most of the traffic; the reason caches have high hit rates |
| Cache hit rate | Fraction of reads served from cache; the number that justifies the cache |
| Cache-aside | App checks cache, on miss reads origin and populates; the default pattern |
| Request coalescing | Collapsing N identical in-flight misses into one backend fetch |
| Versioned keys | Key includes a version number; updates route to a new key instead of invalidating |
| 301 vs 302 | Permanent vs temporary redirect; browsers cache the permanent one — the browser is a cache too |

## 🆘 When it goes wrong

- **You reach for Redis before doing any math.** Quantify out loud: DAU × reads ÷ 86,400, peak multiple. If the DB survives the peak, say the cache is premature — refusing the tool is the signal.
- **"What if the cache goes down?" and you freeze.** Two layers: requests fall through to the DB (so the DB must survive the miss storm — that's why the DB was sized for peak in Break 1), and coalescing plus circuit breakers keep the storm from crushing it.
- **You claim the cache keeps data consistent.** It trades staleness for load. Name the window, tie it to a requirement, pick invalidation vs TTL accordingly.
- **Your counter-based codes "felt random" but aren't.** Sequential codes are enumerable; accept it (short URLs are shared publicly) or scramble with a reversible transform — don't pretend the problem away.
- **25 minutes on codegen, no redirect path drawn.** The redirect is the read path — the actual review. Timebox codegen to ~5 minutes.

➡️ **Next:** [Challenge 6 — Scaling Writes](../06-scaling-writes/)
