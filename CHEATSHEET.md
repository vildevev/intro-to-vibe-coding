# 🗂️ The Vibe Coder's Cheat Sheets

One page per topic. Print, tape to monitor, survive anything.

---

## 💾 Git — the time machine

**The ritual (after every good moment):**

```
git add .                          pack the suitcase
git commit -m "what I just did"    label & seal it (plain words!)
git push                           upload to the cloud (GitHub)
```

**Looking around (never breaks anything):**

```
git status      what's going on right now?
git log --oneline  my save points, newest first
git diff        what exactly changed (red = removed, green = added)
```

**Rules:**
- Save before you renovate — commit before every big AI change.
- Commit messages in plain words Future You can search.
- `git log` trapped your terminal? Press `q`.
- Never truly lost if it was ever committed. Panic → `git log` → restore.
- Branch = parallel universe for experiments. Merge = bring the good ones home.

---

## 🔐 Secrets — don't get hacked

- A **secret** = any string a program uses to prove permission: API keys,
  tokens, passwords. Long + gibberish-looking + unlocks something = secret.
- Secrets live in **`.env`**, never in code, never in chats, screenshots,
  emails, or group chats.
- **The no-peek trick:** the AI needs to *use* secrets, never *see* them.
  Have it create the empty `.env` lines and the reading code — you paste the
  real values yourself.
- **`.gitignore`** is the do-not-pack list. It must contain `.env`.
- **Secret in a commit? Two branches:**
  *unpushed = erasable* (take the commit back, move secret to `.env`,
  re-save clean) · *pushed = rotate* — history is forever, bots are fast.
- **Look before you push:** after `git add .`, run `git status` and read every
  filename. Something shouldn't be there? `git restore --staged <file>`.
- **Leaked? Revoke first, panic second.** (Rotation = change the locks.)
- The AI never needs your real password or key. If it asks: red flag.
- Bots scan GitHub for keys within minutes. This is not paranoia; it's weather.

**Real app? Rate-limit per visitor (per IP/user), set spend caps on every
paid service the day you create the key, build with sandbox keys, and use
your host's DDoS shield.**

**Before you deploy, view your live page source and search for `key`, `sk-`,
`token`. Nothing there = ship clean.**

---

## 🗣️ Prompting — brief, don't wish

The AI is a brilliant intern with total amnesia. Remove the guessing.

**The 4 parts:**
1. **Role** — "you are a web designer for cozy neighborhood shops"
2. **Goal** — what to build, for whom
3. **Constraints** — colors, sections, size, "don't touch X", "one page"
4. **Examples / context** — the actual hero line, the vibe, a site you like

**Force multipliers:**
- *"Ask me 3–5 questions before you start."*
- Small bites: one judgment call per prompt. Two "ands" = two prompts.
- Keep an **`AGENTS.md`** house-rules file: explain in plain English, ask
  before deleting, one change at a time, secrets in `.env`.
- *"Here's what I wanted: X. Here's what I got: Y. What should I have said?"*

---

## 🐞 Debugging — errors are evidence

**The loop:** reproduce → capture → describe → fix → verify → **save**.

**The evidence template:**

```
A bug: I expected [X] but instead [Y].

The error says:
[paste the EXACT red text — all of it]

How I make it happen: [open page, click the button, …]

Explain in plain English first. Propose the smallest fix, show me
before applying.
```

- Red text is the program's honest diary, not a verdict.
- Console = the diary's location: `F12` (Mac: `Cmd+Option+J`). Reading is safe.
- No error but something's wrong? Describe expected vs. actual anyway.
- **Stuck 20 minutes → restore last good commit, re-ask smaller.**
  Retries are free. Marathons are expensive.

---

## 🔍 Reviewing — trust, but verify

Before accepting any AI change, three questions:

1. **What changed?** (`git diff` — red/green receipt)
2. **Is it what I asked — and *nothing else*?** (scope creep is the #1 hazard)
3. **Does everything still work?** (old features too, not just the new one)

**The pro menu when it's wrong:** full reject (*"restore to the last
commit"*) · partial accept (*"keep the spacing, undo the rest"*) ·
defer (*"note it in IDEAS.md and undo"*).

**Teach the robot to check for you:** before big changes, have the AI write
tests for what must always work ("page loads, my name in the heading, footer
appears"). Then the loop is: change → *run the tests* → green? commit.
Red is the best evidence you'll ever have — paste it into the debugging
template. **No green, no commit.**

Request size math: one button = 5 lines = reviewable in seconds.
"Make it better" = everything = unreviewable. Small requests are a
*review strategy*.

---

## 🚀 Shipping — the ship loop

```
small change → review diff → commit → push → live in ~1 minute
```

- **Static** (paper: menu, portfolio, invite) → GitHub Pages, free:
  repo → Settings → Pages → deploy from `main`.
- **Dynamic** (needs memory: accounts, saving, emailing) → needs a server
  and a hosting service. Secrets go in the host's *settings panel*
  ("Environment Variables"), never in code.
- After any deployment: check for 404s (did you push?), hard-refresh
  (`Cmd+Shift+R`) for staleness, secrets-scan the live source.

**The 10 rules of graduation:** one folder per project · git init first ·
save before renovating · secrets in `.env` · revoke before panicking ·
brief, don't wish · small bites · read the receipt · errors are evidence ·
ship the small real thing.
