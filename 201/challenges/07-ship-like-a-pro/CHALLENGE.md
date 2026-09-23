# Challenge 7 — Ship Like a Pro

**Mission:** Turn deploys from a held-breath click into a system: preview
first, roll back in one click, back up the memory, and write the 2am
runbook before you need it.

**Time:** ~60 minutes

---

## 😱 The story

Ana's shop was live. Every update went straight to it — edit, deploy, pray.
Launch morning she shipped "one tiny button change" and the checkout died.
For six hours. On launch day. While customers watched. There was no preview
(the change never rehearsed), no rollback (going back meant finding an old
version somewhere in the fog), and no backup of the orders she was
meanwhile losing.

None of that requires bad luck — it requires missing gears. Professional
teams aren't braver than Ana; they have machinery: **previews** (nothing
meets the public unrehearsed), **rollbacks** (the ship has a reverse gear),
**backups** (memory can be re-loaded), and a **runbook** (Future You at 2am
gets instructions, not a mystery). You're going to install all four gears
today, and they're all nearly free.

## 🧰 What you'll learn

- **Production vs preview**: the stage vs the rehearsal room
- **Rollback**: going back to yesterday in one click
- **Backups**: exporting your database's memory on a schedule that isn't "never"
- **The 2am runbook**: one page of instructions written by Day You, for
   Night You

## 📋 Before you start

- [ ] Your 201 project on GitHub, deployed on Vercel (Challenge 4 did this)
- [ ] Supabase project holding real-ish data (Challenge 1)
- [ ] Tests exist and pass (you know why, by now)

---

## Part A — The rehearsal room (15 min)

Vercel's core trick: **every branch gets its own URL.** `main` is the stage
(your real site); any other branch is a rehearsal room with a private door.

1. Make sure your project is connected to GitHub (Vercel → Settings → Git).
   From Challenge 4 it should be: every push to `main` already auto-deploys —
   watch Vercel's Deployments tab as proof.
2. Now the rehearsal: create a branch, paint the barn red, push:

   ```
   Create a branch called paint-job. On it, and ONLY on it: add a huge
   red banner across the top of the page that says "UNDER
   CONSTRUCTION??". Push the branch.
   ```

3. Look at Vercel → Deployments. The `paint-job` branch built its **own
   deploy** with its own URL (`paint-job-…vercel.app`). Open it: red banner.
   Then open your **production** URL: no banner. The stage never saw the
   rehearsal. That's the whole professional workflow, already running:

   **branch → preview URL → click every thing → merge to main → stage.**

4. Keep the branch for Part B. You're about to need something broken.

## Part B — The reverse gear (10 min)

Merge the red banner into `main` (GitHub → Pull request → Merge — or ask
your AI to walk you through it). Production now has the banner. Imagine it
also "broke the checkout" — same moment, same feeling.

Now use the gear that saves careers: Vercel → **Deployments** → find the
deploy *before* the banner (the last good one) → the `⋯` menu →
**"Instant Rollback"** → confirm. Refresh production: banner gone, yesterday
restored, in about the time it takes to sip coffee.

> 💡 Notice what rollback is: the 101's save points, grown up and pointed at
> the *live site*. You learned time travel in week one of the 101. This is
> the same spell, cast on production. Say the rule out loud: **"Shipping
> without testing the rollback is renovating without knowing where the door
> is."**

## Part C — Backup the memory (15 min)

Rollback restores your *code*. It does nothing for your **data** — the
wishes, orders, and users in Supabase. Database backups are the 201 version
of git: the memory gets its own time machine.

1. Supabase → **Database → Backups**. See what your free tier gives you
   (scheduled backups may be limited — that's fine, you'll add the manual
   habit).
2. The manual export, once today: ask your AI —

   ```
   Walk me through exporting my Supabase data so I could restore it
   anywhere. I want a file I can download and keep. Explain what the
   file contains and how a restore would work, in plain English.
   ```

3. Download it. Put it somewhere real (cloud drive, not just the desktop of
   the same laptop). The habit: **export after any big data change, weekly
   if the app is live.** A backup you took once in a fit of responsibility
   is a museum piece, not a backup.

## Part D — The 2am runbook (15 min)

The last gear is a *document*. When the site breaks at 2am, Day You (calm,
coffee, full context) writes instructions for Night You (panicked, bleary,
no context). One page. Ask the AI to draft it, then edit:

```
Draft my 2am runbook as RUNBOOK.md in the project root. My stack:
Vercel (static pages + serverless functions), Supabase (database),
Stripe (payments), GitHub (code, main deploys to production). Include:
1) first five minutes: how to check if it's really down for everyone
   (Vercel status, my own visit in a private window)
2) how to read today's server logs and find the first error
3) how to roll back a deploy — exact clicks
4) how to restore the database from a backup — exact clicks
5) what NEVER to do at 2am (delete the database, rewrite history,
   "quick fixes" directly in production)
Keep every step at the level of exact clicks, not concepts.
```

Read every click in that document. If a step says something you've never
done — go do it once now, calm, so the runbook is tested. A runbook with
untested steps is a novel. Commit it with everything else: the map (Challenge
5) now includes the emergency exits.

---

## 🤖 Prompts worth stealing

- *"What happens if Supabase goes down for an hour? What breaks first, and
  what should my page say while it's away?"*
- *"Which parts of my deploy can be rehearsed on a preview, and which can't?"*
- *"Review my RUNBOOK.md like a skeptical ops engineer: what's missing,
  what step would fail at 2am?"*

## ✅ You passed when…

- [ ] A branch produced a preview URL that never touched production
- [ ] You merged something broken to prod **on purpose** and rolled it back
- [ ] A database backup file exists somewhere that isn't just your laptop
- [ ] RUNBOOK.md exists, with steps you have actually clicked at least once
- [ ] Your deploy ritual reads: branch → preview → click around → merge →
      watch → (rollback if needed)

## 📚 Jargon translator

| Term | Plain English |
|------|---------------|
| Production (prod) | The stage: the real site, real users, real stakes |
| Preview deploy | The rehearsal room: every branch gets a private URL — nothing public until merged |
| Pull request (PR) | The formal request "rehearsal → stage," with the diff attached for one last review |
| Rollback | Instant reverse gear: point production back at the last good deploy |
| Backup | The memory's own save file — kept somewhere other than the machine it describes |
| Runbook | Instructions Day You leaves for Night You: exact clicks for the worst hour |

## 🆘 When it goes wrong

- **Rolled back… but the problem persists.** Then it isn't the deploy — it's
  the data or an outside service. Open the runbook, step 2: logs. The
  reverse gear only reverses code.
- **Rolled back and the NEW data is gone.** Data lives in Supabase, not in
  deploys — rolling back code never touches memory. This is exactly why
  Part C exists; restore from a backup only if data was actually damaged.
- **The preview URL is public and you don't want it indexed.** Preview URLs
  are unlisted, not secret. Fine for rehearsal; don't put real user data on
  a branch just because it feels private.
- **"I'll write the runbook later."** You won't. The runbook is written in
  daylight or not at all — 15 minutes now, or a mystery later. Day You owes
  Night You exactly one document.

➡️ **Final quest:** [Challenge 8 — Capstone: A Product, Not a Page](../08-capstone-product/)
