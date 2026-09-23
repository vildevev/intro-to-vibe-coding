# 🚀 Vibe Coding 201 — From Pages to Products

*The follow-up to Intro to Vibe Coding: for people who can ship a page, and
want to ship a **product** — one that remembers things, has users, and maybe
makes money.*

**You're ready for 201 if:** you finished the 101 (or can already build and
deploy a simple page with an AI assistant), and your next idea hits a wall —
"*but the app needs to remember people*, "*I want users to sign in*",
"*can I charge for this?*" Every one of those walls is a challenge here.

---

## What changes from the 101

The skills stay; the stakes go up. Save points, small bites, the no-peek
trick, reading the diff, "run the tests" — those are **instincts now**, and
every challenge assumes you use them without being told. What's new:

- Your app stops being paper. It **remembers things** (a database), has
  **accounts** (auth), **takes money** (payments), and **calls other
  services** (APIs).
- Your secrets get a second home: the **server**. The drawer rule evolves.
- You stop debugging by staring: you read **logs**, **status codes**, and
  **the network tab**.
- You ship like it's a real product: **previews, rollbacks, backups, and a
  2am runbook.**

## The course map

| # | Challenge | The wall it removes | Time |
|---|-----------|---------------------|------|
| 1 | [Your App Gets a Memory](challenges/01-app-memory/) | Databases without fear: save and read real data | 60 min |
| 2 | [Sign In, Safely](challenges/02-sign-in-safely/) | User accounts — without ever building login yourself | 60 min |
| 3 | [Take Money](challenges/03-take-money/) | Selling something real with Stripe | 60 min |
| 4 | [APIs Are Ingredients](challenges/04-apis-are-ingredients/) | Calling maps, weather, and AI models from your app | 60 min |
| 5 | [The 30-File App](challenges/05-the-30-file-app/) | Keeping the map in your head as the app grows | 45 min |
| 6 | [Deep Debugging](challenges/06-deep-debugging/) | Server logs, the network tab, and what error codes mean | 60 min |
| 7 | [Ship Like a Pro](challenges/07-ship-like-a-pro/) | Previews, rollbacks, backups, and the 2am runbook | 60 min |
| 8 | [Capstone: A Product, Not a Page](challenges/08-capstone-product/) | The whole stack, end to end, for a real user | 3–5 hrs |

## The 201 Golden Rules

1. **Never build login yourself.** Auth is a rented lock, not a hobby project.
2. **Card numbers never touch your app.** Payments live at Stripe; you just
   point at them.
3. **Secrets on the server go in the host's settings panel** — never in code,
   never in git, never in chat. (The drawer rule, grown up.)
4. **Build with test keys.** Go live only when it already works.
5. **Prod is sacred.** Nothing reaches it without a save point, a preview,
   and a tested rollback.

## Before you start

- [ ] A project from the 101 you can still open (or any simple page + git repo)
- [ ] The same AI assistant as before
- [ ] Free accounts you'll create along the way: Supabase (challenges 1–2),
      Stripe (challenge 3), Vercel (challenges 4, 7, 8)
- [ ] Small real budget: challenge 3 charges you ~$1 of your own money, on
      purpose, so you've seen a real sale from the inside

## FAQ

**Do I finally need to learn to code?**
Still no — but you'll learn to *operate* a system: logs, dashboards,
databases, deploys. Think driver's education, not mechanical engineering.

**Is 201 safe to do with real accounts and money?**
That's what test keys, sandbox modes, and spend caps are for — the 101's
blast-radius kit, everywhere. The only real money is the ~$1 you charge
yourself in Challenge 3, and you get it back from yourself.

**Where do questions go?**
Same place as always: [Discussions](https://github.com/vildevev/intro-to-vibe-coding/discussions)
— and finished products go in
[the graduation thread](https://github.com/vildevev/intro-to-vibe-coding/discussions/1).

---

*Coming after 201: "Automate your boring work" — AI agents that handle your
files, reports, and schedules. Vote and suggest in
[the 201 planning thread](https://github.com/vildevev/intro-to-vibe-coding/discussions/2).*

*Start here → [Challenge 1: Your App Gets a Memory](challenges/01-app-memory/)*
