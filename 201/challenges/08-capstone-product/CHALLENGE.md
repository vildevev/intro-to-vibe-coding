# Challenge 8 — Capstone: A Product, Not a Page

**Mission:** The whole 201 stack, end to end: an app with accounts, memory,
and (optionally) money — shipped with previews, backups, and a real user who
isn't you.

**Time:** 3–5 hours, spread over days (save points make it resumable)

---

## 😱 The story

The 101 capstone made you a builder: one folder, one page, one human
delighted. This capstone makes you an **operator**: a product with users,
data it must not lose, money it must not misplace, and a running system
someone depends on. The difference between the two isn't talent. It's that
an operator runs the *whole loop* — build, protect, watch, recover — and
that loop is exactly what this course installed. Time to run it all at once.

## 📋 The menu

Pick something that genuinely needs the stack — memory, accounts, and
ideally one payment. The classics:

- **The tiny SaaS** — a tracker (habits, plants, invoices) with sign-in, per-user data, free tier + $2 "pro" tier
- **The paid digital good** — a guide/template/checklist behind a Stripe checkout, delivered on payment (webhook unlocks it)
- **The booking page** — for a real person's services: accounts, requests saved to the database, a small deposit via Stripe
- **The team tool** — one shared list/dashboard for a real group you're in, sign-in required

Pick the one a **real person** needs. In 201, "someone else depends on this"
is a feature, not a bug — it's what makes you run the safety gears.

---

## The build — phases

### Phase 1 — Intent on paper (15 min)

Before the AI: who is it for, what does a user **do** (one primary action),
what's the data (which tables), what's the money (free / paid / deposit),
and — new for 201 — **what must never leak or be lost** (secrets, user data,
orders). Write it. This page becomes your AGENTS.md seed.

### Phase 2 — Map and house rules first (15 min)

New folder, new `AGENTS.md` — now with the 201 rules baked in:

```
# House rules (201)
- Tour the project map before any non-trivial change; say which files
  you'll touch
- One small change at a time; run the tests after each accepted change
- Secrets: never in code, chat, or git — .env locally, host panel on the
  server; use the no-peek pattern, I paste values myself
- Auth: managed only (Supabase). Payments: Stripe-hosted checkout only.
  Card numbers never touch this app
- Before I merge anything to main: preview first, tests green
```

### Phase 3 — Build the skeleton, then the organs (60–90 min)

Order matters now, because the parts depend on each other:

1. **Memory first** (Challenge 1): tables designed from Phase 1's "what's
   the data". Check the schema in plain English before building on it.
2. **Lock second** (Challenge 2): sign-in, then RLS *before* real data
   arrives. The bouncer goes on before the party, not after.
3. **Money third, in test mode** (Challenge 3): product, checkout, webhook —
   all test-mode until Phase 5.
4. **Any API ingredient** (Challenge 4): middleman only, keys on the server,
   graceful failure, usage caps on day one.
5. Small bites throughout, **tests growing alongside** — every must-always-
   work becomes a check, and "run the tests" closes every bite.

The rhythm, as always: **ask → diff → try → tests → commit** — with the 201
addition: **push to a branch and look at the preview**, not just localhost.

### Phase 4 — Grow it without losing the map (30–60 min)

This is where 201 projects die: feature four arrives and nobody remembers
where feature one lives. Countermeasures, all mandatory:

- The project map updates with every moving day (Challenge 5)
- Debugging stays evidence-based: two witnesses, exact text (Challenge 6)
- Rejection stays free: every scope creep gets "restore and re-ask smaller"
- IDEAS.md eats the "also add…" avalanche alive

**Checkpoint:** "Would I let a stranger sign up and pay right now — and
could I recover from a disaster tonight?" That's v1.

### Phase 5 — The pre-flight, 201 edition (30 min)

The 101 checklist, wearing its grown-up shoes:

- [ ] Git clean, log reads like a story, everything pushed
- [ ] Tests green — no green, no ship
- [ ] Secrets audit: nothing in code or git; server keys in the host panel;
      no-peek respected everywhere
- [ ] RLS on, and you **attacked it** (impostor rows refused)
- [ ] Stripe: tested end-to-end; go-live checklist done if selling for real
- [ ] Spend caps + usage alerts on every paid service
- [ ] Backup taken *today*; rollback rehearsed *today* (break a branch, not
      prod)
- [ ] RUNBOOK.md updated for this product's stack
- [ ] The skeptic pass: *"Review this like a paranoid senior engineer —
      what leaks, what breaks, what embarrasses?"*

### Phase 6 — Ship (30 min)

Merge to `main`, watch the deploy, open production on a phone. Then the 201
moment the 101 never had: **the rollback you don't need** — knowing the
reverse gear is there and tested while everything works. Calm is the feature.

### Phase 7 — The human test, real edition (ongoing)

One real user (not your mom — someone who'd actually use it). Watch them.
Fix the top confusion, re-ship via preview. If you take payments: their real
receipt is the real milestone — and your first refund policy gets written
the day their first "oops" email arrives. (It will. Be kind; refunds are
marketing.)

Then post the product to
[the graduation thread](https://github.com/vildevev/intro-to-vibe-coding/discussions/1)
— live link, one sentence, hardest bug. That thread is the course's hall of
fame, and 201 graduates are its engineers.

---

## 🏁 The Operator's Checklist (print this one)

1. One folder per project; the map lives in README + AGENTS.md and is *true*
2. Memory first, bouncer before the party (RLS before real data)
3. Secrets: no-peek, drawer locally, host panel on the server, caps on day one
4. Test keys until it works; live keys only with the go-live checklist
5. Cards never touch the app; Stripe hosts the register
6. Middleman for every ingredient; timeouts and polite failures always
7. Small bites → diff → preview → tests → commit; **no green, no merge**
8. Prod is sacred: nothing arrives without a rehearsal, nothing stays broken
   without a rollback
9. Backups on a schedule that isn't "never"; restore rehearsed in daylight
10. Day You always leaves Night You a RUNBOOK

## ✅ You passed when…

- [ ] A stranger signed up, and their data is theirs alone
- [ ] The app survived your own three-act disaster drill (missing key, wrong
      path, crash) with polite manners
- [ ] Money moved (or the full test-mode loop did), and the webhook recorded it
- [ ] You shipped a real update via preview→merge *after* the launch
- [ ] You have taken a backup and rehearsed a rollback on the live project
- [ ] A real human depends on it — and so does your RUNBOOK
- [ ] The product is in the graduation thread

## 🎓 Where to go next

- **Watch it live:** your analytics (visits), Stripe dashboard (money),
  Supabase (memory), Vercel (uptime) — four panes, one product
- **"Automate your boring work"** — the next track: AI agents that handle
  files, reports, and schedules. Bring your requests to
  [the planning thread](https://github.com/vildevev/intro-to-vibe-coding/discussions/2)
- **Contribute:** you can now read a project's map, fork a repo, and send a
  pull request. Open source is a door you know how to knock on
- **The real secret:** 101 taught you to direct an intern. 201 taught you to
  operate a system. Both were the same loop, over and over: **brief, small
  bites, save points, verify, ship — and now: rehearse, back up, runbook,
  recover.** Keep the loop. It scales.

## 🆘 When it goes wrong

- **Mid-build overwhelm: "this is now a REAL system."** Yes — and you have
  the gears. Save point, map, runbook. Overwhelm shrinks to the size of the
  next small bite.
- **A real user hits a real bug.** Evidence template, two witnesses, exact
  text. You have rehearsed this. Communicate kindly and visibly: "found,
  fixing, shipped" beats silence every time.
- **Money goes weird (double charge, failed webhook).** Stop, don't hack.
  Stripe's dashboard is truth; reconcile there. Refund generously first,
  diagnose second — trust is the actual product.
- **You're afraid to touch the live app.** Then a gear is missing: preview
  deploys, tests, backup, rollback — rehearsed. Fear isn't a sign to stop;
  it's a sign a gear needs installing.
- **Time's up, it's not done.** Cut scope, not gears. A smaller product with
  the full loop beats a bigger one with the loop "to do later." Later is
  where 2am lives.
