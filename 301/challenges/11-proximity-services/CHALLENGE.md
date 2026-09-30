# Challenge 11 — Proximity Services

**Mission:** Index the physical world by breaking it twice: first with the innocent-looking query that full-scans a perfectly indexed table, then with the write firehose that melts the index you just chose. The two families of geospatial structure exist because of those two breaks — and the second system (Uber) is the first (Yelp) inverted.

**Time:** ~60 minutes

---

## 😱 War story: the composite index that wasn't

"Find restaurants within 2km." The candidate adds a composite B-tree index on `(latitude, longitude)` and predicts victory. The reviewer runs `EXPLAIN`: full table scan. A B-tree sorts one dimension at a time — index latitude alone and a "range query" returns a horizontal strip of the planet thousands of kilometers tall; the composite only breaks ties on longitude among equal latitudes. Neither understands that two points are close. The general lesson is the shape every good answer takes: a spatial structure narrows the world to a small candidate set, then exact distance math on those candidates picks the winners. Candidates who say "use PostGIS" without articulating those two moves don't get credit for the word.

## 🧰 What you'll learn

- Why 2D proximity breaks 1D indexes — the break that defines the whole challenge
- The two families (spatial trees vs encoded cells) as answers to two different breaks: search over static shapes vs writes over moving points
- Yelp: one query, three index types; ratings without races; one-review-per-user as a database constraint
- Uber: location updates as a write firehose, matching as a ring lookup, and reusing Challenges 7–9

## Break 1 — "restaurants within 2km" full-scans a table with an index on everything

The system that works at 100 rows and dies at 10M: Yelp-scale — 100M daily users, 10M businesses — and the flagship query is `WHERE lat BETWEEN ... AND lng BETWEEN ...`. With the composite B-tree above, `EXPLAIN` says full table scan, p99 blows past any latency budget, and the database does the work of computing distance to every business on Earth per search.

**The obvious fix, and why it fails:** "fine — index both columns separately / use a better composite order." Same wall, different arrangement: any 1D ordering of 2D data slices the world into strips or shards that don't understand *closeness in two dimensions*. The insight being tested is exactly this failure, so say it before naming any structure.

**The fix: narrow, then post-filter — the shape every proximity answer takes.** Some structure collapses 2D space into things ordinary indexes handle, returning a small *candidate set*; exact distance math (Haversine) on those candidates picks the winners. Two families of structures, and the choice is a data-shape decision:

| Family | Structures | Data it loves | The cost |
|---|---|---|---|
| Spatial trees | quadtree (recursive quadrants), k-d/BKD (median splits packed into disk pages), R-tree (nested bounding rectangles) | geometry — polygons, roads, delivery zones, containment questions | pricier writes; needs a spatial extension (PostGIS, Elasticsearch geo fields) |
| Encoded cells | geohash (grid string with shared prefixes), S2 (equal-ish cells on a sphere), H3 (hexagons) | points that move constantly | points only; every query needs a neighbor ring plus post-filter |

The review-level workhorse is the encoded cell: geohash interleaves lat/long into a string where shared prefix ≈ nearby — 5 characters ≈ 5km, 9 ≈ 5m — so `WHERE geohash LIKE 'dr5ru%'` is a plain B-tree prefix scan on any database.

**The cost, and the trap inside it:** cells are a grid, and grids have edges — two restaurants a meter apart can land in cells with different prefixes, so a single-cell query silently loses them. Every encoded-cell system pays the same tax: query your cell **plus its eight neighbors**, then post-filter. Forget the ring and your search "works" while quietly returning wrong answers — the worst kind of bug to find in production and the easiest one to catch in an review if you walk a boundary example aloud.

## Break 2 — Yelp: three searches wearing one query box

With the spatial problem solved, the real Yelp query breaks anyway: "tacos, Mission, open now" is *location + name keywords + category + rating sort* — four index problems in one request, and no single structure serves all of them.

**The obvious fix, and why it fails:** three separate indexes queried and merged in the app. You've built a slow cross-join in application code and re-invented search infrastructure badly.

**The fix: a search engine that owns the query — or the discipline not to need one.** Elasticsearch answers all three natively (geospatial fields, inverted index for text, B-tree-style filters); the cost is a second datastore to keep in sync — CDC from the primary database. The staff-level alternative at this data size (~10GB of businesses): Postgres with PostGIS for spatial and a trigram index for text — no sync problem, no second system to operate. Either way, order the filters to shrink the search space fastest: distance first (most restrictive), then keywords and category on the survivors.

Then the quiet breaks — small failures that don't graph but sink designs, each answered at the persistence layer:

- **Average rating without races.** Don't aggregate per search — store `(num_reviews, avg_rating)` and update per review with a running formula. But two concurrent reviews race and one overwrites the other: guard the row with a version check (optimistic concurrency — Challenge 8); the loser recalculates and retries. The senior flourish is refusing the queue: reviews trail reads ~1000:1 — about one write per second — a database barely notices, so no message queue is needed.
- **One review per user per business.** Application-level checks race and backfills won't honor them. A unique constraint on `(user_id, business_id)` makes the violation impossible at the persistence layer; handle the error gracefully.
- **Neighborhoods are polygons.** "Pizza in the Mission" is not a radius — map location names to polygons (public boundary datasets), or precompute each business's containing neighborhoods at write time and index them as plain keywords.

## Break 3 — Uber: the index you chose melts under the write firehose

Now invert the system. A million drivers, each pinging location every few seconds, is a stream of millions of writes per second — and if you put those moving points in a spatial tree, the constant rebalancing burns the write path: the tree that loved Yelp's static restaurants is exactly wrong for Uber's drivers. (Design Uber like Yelp and this is the review's verdict: right structure, wrong system.)

**The fix: encoded cells, all the way down.** A driver's move becomes one cheap single-key write — a Redis geoset update or an indexed cell column — no rebalancing, linear under the firehose. Matching: a rider request computes the rider's cell plus surrounding rings, looks up drivers in those cells, post-filters by real distance and rating, then offers the ride. What if two riders target the same driver? That's Challenge 8's reservation pattern with a ~10-second TTL. The ride itself — request, accept, pickup, complete, with a human in the loop — is Challenge 9's workflow. Streaming driver locations back to riders is Challenge 7's push problem. Name the reuse out loud: "this is the reservation pattern from contention" is worth more than a new box on the diagram.

**The cost:** cells trade global structure for local cheapness — cell IDs answer "who's near this cell" beautifully and "draw me this delivery zone" not at all. Static shapes still belong in a tree; most real systems (Uber included) carry both. The senior sentence: *match the structure family to the data shape, and say which parts of the system each one owns.*

## 🤖 Design-review drill: run it

```text
You are a senior engineer leading my design review. This session is a PROXIMITY design:
the problem must hinge on "find things near me" or on locations that move
— search-style, matching-style, or both. Your style is failure-first:
every time I add a component, ask "what break does that fix?" — and if I
name a technique without the break, make me explain the failure it
prevents first.

SETUP
Offer one of: "Design Yelp (nearby search + reviews)", "Design Uber
(driver matching + live location)", "Design a food-delivery discovery
service", or "Design 'friends nearby' for a social app" — or take the
problem I name if it's geospatial. Confirm, then run 45 minutes in real
time with phase clocks (Requirements ~5, Entities ~2, API ~5, High-Level
~10-15, Deep Dives ~10).

MANDATORY DEEP DIVES — pull me into at least two:
1. "Find businesses within 2km. Why doesn't an index on (latitude,
   longitude) work, and what does?" (Push until I explain 1D-vs-2D
   ordering, name a spatial structure, and show the candidate-set +
   exact-distance post-filter shape.)
2. "Two restaurants a meter apart on either side of a cell boundary. Does
   your index find both?" (Expect the boundary problem: query the cell
   plus its 8 neighbors, then post-filter.)
3. "A million drivers send an update every 4 seconds. Walk me through the
   write path." (Expect encoded cells / cheap single-key updates — and
   why a pointer-heavy spatial tree is the wrong tool here.)
4. "A rider requests a ride. How do you pick the driver — and what if two
   riders pick the same one?" (Expect ring lookup + post-filter, then a
   short TTL reservation from the contention playbook.)
5. If I reach for Elasticsearch or PostGIS: "What keeps the search index
   in sync with the primary database?" (Expect CDC or an explicit
   trade-off.)
RULES
Stay in character. If I say "use a geospatial index" without explaining
how it works, ask: "How does it actually narrow the search?" If my queries
return exact answers with no post-filter step, make me walk one query end
to end. Hints only on request, smallest nudge possible.

SCORING
After 45 minutes or "end review": score 1-4 on Problem Navigation,
Solution Design, Technical Excellence, Communication — one quoted moment
each. Then report: did I explain why ordinary indexes fail on 2D data,
did I do index-then-post-filter on every query, and did I match the index
family to the data shape (shapes vs moving points). Assign me one drill
to repeat.

Ask me to pick a problem to start.
```

## ✅ You own it when

- [ ] You can explain in two sentences why a B-tree on lat/long full-scans
- [ ] Every proximity answer you give has the two moves: narrow to candidates, then post-filter by exact distance
- [ ] You can describe geohash's prefix trick, its boundary trap, and the 3×3 neighbor fix
- [ ] You can pick the family from the data shape: polygons → tree, moving points → cells — and say why putting drivers in a tree melts the write path
- [ ] You reach for Challenges 7–9's patterns (push, reservations, workflows) inside the geo design and say so

## 📚 Jargon

| Term | What it means |
|---|---|
| Geospatial index | Any structure that narrows 2D (or 3D) space before exact distance math runs |
| Geohash | Lat/long encoded as a grid string where shared prefix ≈ nearby; prefix scan on any B-tree |
| Quadtree | Recursively split the map into quadrants until leaves hold few points; adapts to density |
| R-tree | Nested bounding rectangles over objects; the on-disk workhorse for shapes (PostGIS) |
| S2 | Google's spherical cell system — equal-ish area cells anywhere on Earth |
| H3 | Uber's hexagonal cells; six equidistant neighbors make ring math and heatmaps clean |
| Candidate set | The small set an index returns, finished by exact distance (Haversine) or polygon math |
| Post-filter | Exact distance/containment check on candidates — no spatial index returns the final answer alone |
| CDC | Change data capture: stream database changes into the search index to keep it in sync |
| Inverted index | Maps terms → documents; how keyword search (and Elasticsearch) works |
| Encoded cells | Flattening a location into one sortable cell ID so ordinary indexes handle 2D data |

## 🆘 When it goes wrong

- **You index lat/long and call it done.** The composite B-tree still full-scans. Name the 1D-ordering problem before naming any structure — that's the insight being tested.
- **Your queries trust one cell.** Points on boundaries vanish. Query the cell plus its eight neighbors, then post-filter — every encoded-cell system does this dance.
- **You put moving drivers in a spatial tree.** Constant rebalancing burns writes. Moving points want encoded cells where an update is one integer write.
- **You say "Elasticsearch" without a sync story.** It's a second source of truth. CDC from the primary database — or justify Postgres extensions instead, which at 10M rows is the simpler answer.
- **You design Uber like Yelp.** Yelp is read-heavy search over static points; Uber is write-heavy over moving points plus a workflow. Say which one you're building before drawing.

➡️ **Next:** [Challenge 12 — Full Designs](../12-full-designs/)
