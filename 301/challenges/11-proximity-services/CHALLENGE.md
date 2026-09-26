# Challenge 11 — Proximity Services

**Mission:** Index the physical world — why latitude/longitude defeats ordinary indexes, the two families of geospatial indexes (spatial trees vs encoded cells), and how nearby search and driver matching survive 100M users and millions of location writes per second — by building a review app and a ride-hailing app.

**Time:** ~60 minutes

---

## 😱 War story: the composite index that wasn't

"Find restaurants within 2km." The candidate adds a composite B-tree index on `(latitude, longitude)` and predicts victory. The interviewer runs `EXPLAIN`: full table scan. A B-tree sorts one dimension at a time — index latitude alone and a "range query" returns a horizontal strip of the planet thousands of kilometers tall; the composite only breaks ties on longitude among equal latitudes. Neither understands that two points are close. The general lesson is the shape every good answer takes: a spatial structure narrows the world to a small candidate set, then exact distance math on those candidates picks the winners. Candidates who say "use PostGIS" without articulating those two moves don't get credit for the word.

## 🧰 What you'll learn

- Why 2D proximity breaks 1D indexes — and the universal index-then-post-filter shape
- The two families: spatial trees (quadtree, k-d/BKD, R-tree) vs encoded cells (geohash, S2, H3)
- Yelp: one query, three index types; ratings without races; one-review-per-user as a database constraint
- Uber: location updates as a write firehose, matching as a ring lookup, and reusing Challenges 7–9

## The two families

| Family | Structures | Data it loves | The cost |
|---|---|---|---|
| Spatial trees | quadtree (recursive quadrants), k-d/BKD (median splits packed into disk pages), R-tree (nested bounding rectangles) | geometry — polygons, roads, delivery zones, containment questions | pricier writes, and you need a spatial extension (PostGIS, Elasticsearch's geo fields) |
| Encoded cells | geohash (grid string with shared prefixes), S2 (equal-ish cells on a sphere), H3 (hexagons) | points that move constantly — drivers, couriers, users | points only; every query needs a neighbor ring plus post-filter |

Interview-level facts to carry. Geohash interleaves lat/long into a string where shared prefix ≈ nearby — 5 characters ≈ 5km, 9 ≈ 5m — so `WHERE geohash LIKE 'dr5ru%'` is a plain B-tree prefix scan on any database. The boundary trap: two points a meter apart can land in different cells with different prefixes — so always query your cell plus its eight neighbors, then post-filter by exact distance. S2 fixes geohash's flat-map distortion (cells of roughly equal area anywhere on the globe). H3's hexagons give six equidistant neighbors, which makes ring and heatmap math clean — snap each driver to a cell and match by looking up a list of cell IDs, a plain integer index query. Choosing: shapes and containment → a tree; moving points → cells, because a driver's move becomes one cheap integer update and the pattern scales to millions of writes per second.

## Worked example 1: Yelp

Requirements: search by name + location + category; view a business and its reviews; leave a review. Scale: 100M daily users, 10M businesses.

Search is three index problems wearing one query: location (geospatial), name keywords (inverted/full-text), category (plain B-tree). Elasticsearch answers all three; the price is a second datastore to keep in sync — CDC from the primary database. The alternative that scores staff points at this data size (~10GB of businesses): Postgres with PostGIS for spatial and a trigram index for text — no sync problem, and no second system to operate. Either way, order the filters to shrink the search space fastest: distance first (it's the most restrictive), then keywords and category on the survivors.

Two constraint deep dives:

- **Average rating without races.** Don't aggregate per search — store `(num_reviews, avg_rating)` and update synchronously per review with a running formula. But two concurrent reviews race and one overwrites the other: guard the business row with a version check (optimistic concurrency, Challenge 8); the loser recalculates and retries. The senior flourish is refusing the queue: reviews trail reads by ~1000:1 — about one write per second — a database barely notices, so no message queue is needed.
- **One review per user per business.** Application-level checks race and backfills won't honor them. A unique constraint on `(user_id, business_id)` makes the violation impossible at the persistence layer; handle the error gracefully.
- **Neighborhoods.** "Pizza in the Mission" is not a radius — neighborhoods are polygons. Map location names to polygons (public boundary datasets), or precompute each business's containing location names at write time and index them as plain keywords.

## Worked example 2: Uber

The emphasis inverts: writes are the firehose. A million drivers pinging every few seconds is a location-update stream that would crush a spatial tree's rebalancing — exactly why moving points get encoded cells. Each update is a single-key write into a Redis geoset or an indexed cell column. Matching: a rider request computes the rider's cell plus surrounding rings, looks up drivers in those cells, post-filters by real distance and rating, then offers the ride. What if two riders target the same driver? That's Challenge 8's reservation pattern with a ~10-second TTL. The ride itself — request, accept, pickup, complete, with a human in the loop — is Challenge 9's workflow. And streaming driver locations back to riders is Challenge 7's push problem. Name the reuse out loud: "this is the reservation pattern from contention" is worth more than a new box on the diagram.

Go deeper on the full Yelp and Uber breakdowns — plus the spatial-index deep dive — at [Hello Interview's system design course](https://www.hellointerview.com/learn/courses/system-design).

## 🤖 Mock interview: run it

```text
You are my system design interviewer. This session is a PROXIMITY design:
the problem must hinge on "find things near me" or on locations that move
— search-style, matching-style, or both.

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
After 45 minutes or "end interview": score 1-4 on Problem Navigation,
Solution Design, Technical Excellence, Communication — one quoted moment
each. Then report: did I explain why ordinary indexes fail on 2D data,
did I do index-then-post-filter on every query, and did I match the index
family to the data shape (shapes vs moving points). Assign me one drill
to repeat.

Ask me to pick a problem to start.
```

## ✅ Interview-ready when

- [ ] You can explain in two sentences why a B-tree on lat/long full-scans
- [ ] Every proximity answer you give has the two moves: narrow to candidates, then post-filter by exact distance
- [ ] You can describe geohash's prefix trick, its boundary trap, and the 3×3 neighbor fix
- [ ] You can pick the family from the data shape: polygons → tree, moving points → cells
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
