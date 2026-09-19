# Challenge 6 — Ship It

**Mission:** Put what you built on the real internet, with a link you can send
to your mom. (Or your investors.)

**Time:** ~60 minutes

---

## 😱 The story

Everything you've built so far lives in a private world called **localhost** —
"just for me, on this machine, only while my tools are running." It's a diary
entry. The moment you send a link to localhost to a friend, you learn the
diary-entry problem: *they can't open it. Nobody can.*

**Shipping** (or **deploying**) means copying your finished work to a computer
whose full-time job is showing your site to the world. Your site stops being a
diary entry and becomes a business card — a URL that works on any phone,
anywhere, while you sleep.

The secret pros won't tell you: for the sites you're building, shipping takes
about 10 minutes and costs nothing. The rest of this challenge is learning the
loop that makes shipping *routine*, and one safety rule that matters forever.

## 🧰 What you'll learn

- What **deploying** actually is (copying your work to an always-on computer)
- **GitHub Pages** — free hosting straight from your Challenge-1 GitHub repo
- The ship loop: **change → save → push → live**
- The one new security rule: secrets belong on the server, never in shipped code

## 📋 Before you start

- [ ] Challenge 1 done — project on GitHub (this is the ticket to ride)
- [ ] A page you're not embarrassed to show humans. Almost-ready counts.

---

## Part A — Your first launch (15 min)

For pages made of plain files (like your About Me and bakery pages — pros call
these **static** sites: just paper, no machinery), GitHub hosts them free.

1. On your repo's GitHub page: **Settings → Pages**.
2. Under "Build and deployment", set **Source** to **Deploy from a branch**,
   pick your `main` branch and `/ (root)`, and **Save**.
3. Wait for the green check (1–3 minutes). Refresh until you see:
   *"Your site is live at `https://YOUR-USERNAME.github.io/vibe-coding-course/`"*
4. Open it. **On your phone.** This is the moment. Send it to one person who
   will be nice about it.

> 🤖 If any button doesn't look like this (GitHub rearranges its furniture
> sometimes): ask your AI, *"Walk me through enabling GitHub Pages for my
> repo, step by step, for the current GitHub layout."*

## Part B — The ship loop (15 min)

Here's the professional rhythm you'll use forever:

```
change (small bite)  →  review the diff  →  commit  →  push  →  live in ~1 minute
```

Run the loop twice right now:

1. Ask for a small change that's worth the world seeing — e.g.:

   ```
   Add a line to my footer: "Last updated [today's date]".
   Change nothing else, show me the diff first.
   ```

2. Review it (Challenge 5, three questions). Commit. Push.
3. Watch your live site update about a minute later. No servers, no settings.
4. Do it once more with a change of your choice.

Notice what you've assembled across this course: prompt (C3) → diff review
(C5) → commit (C1) → secrets check (C2) → push → **live**. That pipeline *is*
professional software development. You're doing the real loop, just calmer.

## Part C — When your app needs a brain (15 min, reading challenge)

Static sites are paper: text, images, buttons that work in the browser. But
some ideas need **machinery** — saving a guestbook entry so it exists
tomorrow, sending an email, storing passwords. That machinery is a **server**
(a computer running your logic, in the cloud), and you'll know you need one
when your idea involves *remembering* or *doing* things after the page closes.

You don't need to build a server today, but you need the map:

- **Static** (paper): portfolio, event invite, bakery menu, About Me →
  GitHub Pages, free, perfect.
- **Dynamic** (paper + machinery): anything that saves data, has user
  accounts, or sends messages → you'll eventually deploy to a hosting service
  (free tiers exist for all of them) *and* — this is the important part —

> ⚠️ **The shipping security rule (Challenge 2 grows up):** the moment you
> deploy anything dynamic, your secrets move *from your `.env` drawer to the
> hosting service's settings panel* (usually called "Environment Variables"
> or "Secrets"). Never paste a real API key into code because "it needs to be
> on the server anyway." It gets there through the settings panel, still never
> written in your files. When you get there, ask your AI: *"How do I add my
> .env values as environment variables on this host?"*

And the flip side to check today, on your fresh static site: **view your live
site's source** (right-click → View Page Source) and search for anything that
looks like a key (`sk-`, `key=`, `token`). Nothing there? Ship clean.

## Part D — Name it (optional, 10 min)

`your-username.github.io/vibe-coding-course` is honest but not lovely. A
**domain** is your site's own name — `flourandfog.com` — rented yearly
(~$10–15) from a **registrar** (e.g. Namecheap, Cloudflare). Buying one and
connecting it is a nice 30-minute quest for another day; ask your AI
*"walk me through connecting a custom domain to GitHub Pages"* when the
moment comes. For now: free subdomain, fully respectable.

---

## 🤖 Prompts worth stealing

- *"Is my project a static site or does it need a server? Explain like I'm new."*
- *"My GitHub Pages site shows the wrong thing / a 404. Walk me through
  diagnosing it."* (80% of the time: files in a subfolder, or the push didn't
  happen — the loop skipped a step.)
- *"Before I deploy, check the project for anything that shouldn't be public:
  secrets, real names, phone numbers, API keys."* ← **make this a habit**
- *"Help me write a one-line announcement for shipping my site."*

## ✅ You passed when…

- [ ] A URL of yours loads on your phone, on real internet
- [ ] Someone else has opened your link
- [ ] You ran the full ship loop twice: change → review → commit → push → live
- [ ] You checked your live source code for secrets (nothing found, or you rotated)
- [ ] You can explain: static = paper, dynamic = paper + machinery

## 📚 Jargon translator

| Term | Plain English |
|------|---------------|
| localhost | Your private rehearsal — only visible on your machine |
| Deploy / ship | Copy finished work to an always-on computer the world can reach |
| Hosting | The always-on computer showing your site to the world |
| GitHub Pages | Free hosting for static sites, straight from your repo |
| Static site | Paper: files served as-is. Fast, free, no memory |
| Server / backend | Machinery: code that runs in the cloud and *remembers* things |
| Domain | Your site's own rented name, like `flourandfog.com` |
| 404 | "Nothing lives at this address" — usually a typo or a missing push |

## 🆘 When it goes wrong

- **"404 not found" on your live site.** First: did you *push*? (The live site
  updates from GitHub, not from your laptop.) Second: is the page file in the
  repo root? Ask your AI to check both.
- **Site live but stale — changes missing.** The push didn't include your
  latest commit, or the browser cached the old version. Hard-refresh
  (`Cmd+Shift+R`). Then `git log` and compare what's on GitHub.
- **"Your site is taking forever to build."** Wait 3 minutes. GitHub Pages is
  free and unhurried. Refresh the Actions/Settings page before diagnosing.
- **You accidentally deployed something you shouldn't have** (a real name, a
  key, a phone number). Same protocol as Challenge 2: *rotate/revoke first*
  if it was a secret, then remove the content, push the cleaned version.
  Note: sites may be archived by third parties — the rotation matters more
  than the deletion.

➡️ **Final quest:** [Challenge 7 — Capstone](../07-capstone/CHALLENGE.md)
