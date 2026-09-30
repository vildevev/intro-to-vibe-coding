# Challenge 3 — The Toolbox

**Mission:** Build the toolbox — DNS, TCP/UDP, HTTP, load balancers (L4 vs L7), database families, caches, and the consistency trade-off — by watching each default earn its place fixing a break the vibe-based pick caused, so every box you draw comes with a default and a reason, not a vibe.

**Time:** ~60 minutes

---

## 😱 War story: the tool zoo

The candidate draws: MongoDB "because it scales," Kafka "for real-time," WebSockets "so it's fast," six microservices, and a graph database "for the social part." The reviewer asks two questions — "Why Mongo?" and "What does the graph database buy you over your relational schema?" — and gets silence, then hand-waving. Nothing the candidate proposed was exotic enough to fail on its own; together they were a confession that no choice had been made deliberately. Reviewers don't score you for the count of technologies on the board. They score whether each one arrives with a default justification and a named cost. This challenge is the stock of defaults — each one introduced by the break that demands it.

## 🧰 What you'll learn

- Why the network layers matter: statelessness is the property horizontal scaling depends on — lose it and adding servers stops adding capacity
- Why the load balancer exists: the moment one app server dies, and the L4-vs-L7 choice the fix forces
- Why the database family table exists: it's the antidote to the "Why Mongo?" confession
- Why the consistency question belongs in requirements, not deep dives: the double-booked seat it prevents

## Break 1 — one app server dies, and the fleet can't absorb it

**The break, on the clock.** Traffic doubles; you add a second app server; users keep failing because their session lives on server one. Then server one dies outright and takes its users with it. Every design is independent machines talking over a network — three layers carry the conversation:

| Layer | What lives there | What it gives you |
|---|---|---|
| L3 — Network | IP | Routing and addressing: packets find any machine on earth |
| L4 — Transport | TCP, UDP, QUIC | Reliability, ordering, flow control (or the absence of them) |
| L7 — Application | DNS, HTTP, WebSockets, WebRTC | The protocols your application actually speaks |

**The obvious fix, and why it fails:** a bigger machine. Vertical scaling sidesteps the routing problem by never distributing — and it's one failure domain at superlinear cost: when the big box dies, the outage is total. Design reviews live on the horizontal path, and the horizontal path needs a router.

**The fix: make requests stateless, then route them.** At L4 you face the one transport decision you'll ever be asked to defend:

| Feature | TCP | UDP |
|---|---|---|
| Connection | Handshake first, stateful stream | None — fire and forget |
| Delivery | Guaranteed, ordered, retransmitted | Best effort; loss and reordering happen |
| Overhead | Higher (bigger headers, flow control) | Minimal — lower latency |
| Use | Everything by default | Gaming, VoIP, live video, telemetry where loss beats lag |

Default to TCP without saying it; reach for UDP only when the break is retransmission lag itself — live voice that retransmission delay makes unusable, where losing a packet beats waiting for it. QUIC is a modernized TCP descendant — nice to name, don't design around it. At L7, HTTP is stateless: every request is self-contained, so any server can handle any request — *that* statelessness is what makes horizontal scaling boring, so guard it. HTTPS encrypts the contents; it does not make the contents trustworthy — validate the body, derive identity from the auth token. On top of HTTP you pick an API paradigm: REST (default), GraphQL (when clients need to shape their own payloads), gRPC (internal, binary, fast) — details live in Challenge 2's API phase.

Then the router. **Client-side LB** — the client holds a server list (from a registry or DNS) and picks directly: fast, no extra hop, built into gRPC; updates are as slow as your TTL or refresh cycle. Great for internal services and DNS-level failover. **Dedicated LB** — a box in front of your fleet: one extra hop per request in exchange for instant server-list updates, health checks, and routing policy. The dedicated box comes in two flavors, and choosing correctly is a common probe:

| | L4 (transport) | L7 (application) |
|---|---|---|
| Decides using | IPs and ports | Request contents: URL, headers, cookies |
| Connection model | Client↔server TCP session passes through | Terminates client connection, opens its own to backend |
| Cost | Cheap — barely inspects packets | Pricier — reads every request |
| Reach for it when | WebSockets and other persistent connections | HTTP traffic, path-based routing, most designs |

Algorithms: round-robin or random is fine for stateless HTTP fleets; **least-connections** when connections are long-lived (SSE/WebSockets), so one server doesn't accumulate them all. Health checks — is the port open (TCP) or does `/healthz` return 200 (HTTP) — are what let the LB route around dead servers automatically. That failover, not the distribution math, is the availability story you should tell. And DNS belongs in the same story: resolvers cache answers under a TTL and rotate them, which makes DNS a crude client-side load balancer — and that rotation is how you keep your load balancers themselves from being a single point of failure (two LBs, DNS spins between them).

**The cost:** the dedicated LB is a new box in the critical path — and a single point of failure, which is exactly why the DNS rotation trick exists.

## Break 2 — "Why Mongo?" — the silence that costs the offer

**The break, on the clock.** The board reads MongoDB, Kafka, WebSockets, six microservices, a graph database. The reviewer asks "Why Mongo?" and "What does the graph database buy you over your relational schema?" — and gets silence, then hand-waving. The count of technologies was never the problem; no choice on the board was deliberate.

**The obvious fix, and why it fails:** pick tools that sound scalable — "MongoDB because it scales." It fails the instant the probe lands, and it's the single most common database mistake in design reviews: reaching for the exotic.

**The fix: default to relational, deviate with named reasons.** Say PostgreSQL unless a requirement names a reason:

| Family | Optimized for | When it's actually right | The review reality |
|---|---|---|---|
| Relational (Postgres, MySQL) | Structured data, joins, ACID transactions | Default — money, inventory, most products | What you should say 80% of the time |
| Document (MongoDB) | Flexible, evolving schemas; nested reads | Requirements genuinely change shape mid-flight | Review requirements are frozen; rarely justified |
| Key-value (Redis, DynamoDB) | Exact-key lookups at absurd speed | Caches, sessions, feature flags | Usually in front of SQL, not instead of it |
| Wide-column (Cassandra) | Massive append-heavy writes, time-series | Telemetry, metrics, event logs | The write-heavy answer — Challenge 6 |
| Graph (Neo4j) | Relationship traversal | … | Almost never; even the biggest social network runs on MySQL |

SQL's "doesn't scale" reputation is stale: replicas, caching, and sharding carry relational databases at companies far larger than any review scenario. Justify every deviation out loud: "I'm choosing X because the access pattern is Y, and I accept Z as the cost."

**The cost:** defaults are boring — you give up the exotic tool that might impress. An unjustified exotic scores *negative*; a justified default is the senior look.

## Break 3 — the double-booked seat

**The break, on the clock.** The read-heavy table is melting (that's Challenge 5's whole plot), so a cache goes in front and reads drop to ~1ms. Two weeks into the story: two users book the same seat, because one of them read a stale row. The cache fixed the load break and created a staleness break — the consistency question you postponed in requirements just arrived on its own terms.

**The obvious fix, and why it fails:** make everything consistent everywhere. Distributed systems *will* partition — networks fail (that term is non-negotiable) — so perfect consistency during a partition is not on the menu. The real choice is what to sacrifice during one.

**The fix: decide the trade-off per feature, in requirements.** The cache itself first: usually Redis, keeping hot data in memory at ~1ms reads vs the milliseconds-to-tens-of-milliseconds a database costs. The default pattern is **cache-aside**: check Redis, on miss read the DB and populate the cache. Patterns and failure modes get full treatment in Challenges 4 and 5 — name the tool when the load is read-heavy, the queries are expensive, or the latency targets are ones the DB can't meet. Then the deeper tool, answered per feature:

| You prioritize | Reads return | Choose it for | Paid in |
|---|---|---|---|
| **Consistency** | Always the latest write | Bookings, inventory, money | Availability and latency during failures |
| **Availability** | Possibly slightly stale data | Feeds, profiles, catalogs — most systems | Brief staleness, resolved eventually |

Most products answer "availability, with a few seconds of eventual consistency" — but the senior version is per-feature: matching and seat-booking stay consistent while profile views stay available. Decide it during requirements and the rest of your design stops contradicting itself.

**The cost:** you now carry a staleness budget per feature — and the seat that must never double-book pays for consistency with availability during failures.

## 🤖 Design-review drill: run it

```text
You are a senior engineer drilling me on system design fundamentals — the
"toolbox" layer every design is built from. Two rounds.

ROUND 1 — TOOL GAUNTLET (~15 minutes)
Fire scenarios at me one at a time. After each answer, press "why?" and
"what does it cost?" until I name a real trade-off. Cover at least:
- Two clients that need the same data shaped differently (API paradigm)
- A latency-critical internal service-to-service call (protocol choice)
- A WebSocket fleet at 1M persistent connections (load balancer + algorithm)
- A read-heavy table queried by exact key (index vs cache choice)
- "The database is 40% CPU and 200GB — should we shard it?" (trap: no)
- "In an outage, do you sacrifice fresh data or uptime?" (trap: it depends —
  make me say for which feature)
Reject any answer that is a tool without a reason: "Convince me." If I add a
tool without naming the break it fixes, stop me: "What breaks without it?"
An answer that is right but unjustified counts as a fail — tell me so.

ROUND 2 — MICRO-DESIGN (~15 minutes)
Give me "Design a link preview service" (or take my pick). 15 minutes,
default tools only. Interrupt if I reach for exotic tech without a stated
reason. Force me to name the default choice and its justification for every
box I draw.

SCORING
Score 1-4 on Problem Navigation, Solution Design, Technical Excellence,
Communication — one quoted moment each. Then list: every tool I reached for
without justification, and the three defaults I should have said
instinctively. Offer to re-run Round 1 with fresh scenarios.

Begin with Round 1, first scenario.
```

## ✅ You own it when

- [ ] You can fill the TCP vs UDP and L4 vs L7 tables from memory
- [ ] Your default database answer is relational, with the deviation criteria on hand
- [ ] You can explain why statelessness is a scaling property, not a style preference
- [ ] You answer "consistency or availability?" per feature, with an example of each
- [ ] You've run the tool gauntlet and survived it without an unjustified tool

## 📚 Jargon

| Term | What it means |
|---|---|
| TTL | Time-to-live: how long a cached answer (DNS, cache entry) stays valid |
| Stateless | Server keeps no memory between requests; any server can serve any request |
| L4 / L7 load balancer | Routes on IP/port vs on request contents (URL, headers, cookies) |
| Health check | The LB's periodic "are you alive?" probe; failed checks mean no traffic |
| Least connections | Routing algorithm that avoids piling long-lived connections on one server |
| ACID | SQL transaction guarantees: atomic, consistent, isolated, durable |
| Eventual consistency | Replicas converge to the same value after a delay; fine for feeds, not for money |
| Cache-aside | App checks the cache, falls to the DB on miss, backfills the cache |

## 🆘 When it goes wrong

- **"Why did you pick that?" and your mind is blank.** Never defend a random choice — reframe: "Good question, let me reconsider: the access pattern is X, so the simpler default is Y." Changing your answer under a probe is a better look than defending one you can't justify.
- **You said MongoDB because "it scales."** Recover by grounding it: name the specific schema-flexibility or access pattern that motivates it — or downgrade to "SQL is honestly the right default here."
- **You proposed WebSockets for a request/response app.** Walk it back explicitly: "That's overkill — the server never needs to push, so plain HTTP is cheaper and simpler." Knowing when to un-pick a tool is its own signal.
- **The reviewer says "are you sure SQL can handle this?"** Do the numbers before conceding (Challenge 4): replicas and caching take a single relational instance astonishingly far. "It handles 50k reads/sec with replicas" is a defensible answer.
- **You can't remember whether DNS is L3 or L7.** Don't litigate layer numbers — describe the function ("name-to-IP lookup with cached, rotating answers"). Reviewers score the working model, not the textbook indexing.

➡️ **Next:** [Challenge 4 — Thinking in Scale](../04-thinking-in-scale/)
