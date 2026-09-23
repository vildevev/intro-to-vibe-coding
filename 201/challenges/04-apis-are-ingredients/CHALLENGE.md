# Challenge 4 — APIs Are Ingredients

**Mission:** Let your app call other services — an AI model, a map, the
weather — safely: keys on the server, graceful failure when the world
misbehaves.

**Time:** ~60 minutes

---

## 😱 The story

Priya's startup idea needed AI: users typed text, her app made it
polite. She asked the AI for "GPT in my site" and pasted the code it gave —
which put her OpenAI key *in the browser code*, because that's the only place
a plain web page can keep things. Her launch tweet did numbers. So did the
bots: `view-source:` is not a hacker skill, it's a browser menu. Her key was
crawled, used, and her $5 credit became a $5,000 invoice in one weekend.

Remember Challenge 2's bouncer lesson: *anything in the browser is public.*
Browser code isn't just visible to polite users reading diffs — it's visible
to everyone, always. The fix is the oldest idea in the book, with a new name:
**a middleman**. Your page asks your middleman; the middleman — running on a
server, where secrets *can* live — holds the key, talks to the big service,
and hands back only the answer. Users see the answer. Nobody sees the key.

## 🧰 What you'll learn

- **The middleman pattern** (serverless functions): where browser secrets go
  to die — nowhere, because none live there
- **Server environment variables**: the host's settings panel is the grown-up
  `.env`
- **Graceful failure**: other services will be slow, down, or out of credits —
  your app should shrug politely, not face-plant

## 📋 Before you start

- [ ] Any project from challenges 1–3 (or a fresh simple page)
- [ ] A free [vercel.com](https://vercel.com) account — sign in **with
      GitHub** (it reads your repos; that's the magic of Challenge 7)
- [ ] An API key to play with: OpenAI, or any free-tier API you like

---

## Part A — The middleman, first contact (15 min)

On Vercel, a middleman is a **serverless function**: a small file in your
project that runs on *their* servers when a certain address is visited. To
the browser it looks like a page. To you, it's a private room.

```
Add a serverless function (Vercel-style) at /api/polite that: reads
OPENAI_API_KEY from environment variables, takes the text my page sends,
asks the AI model to make it polite, and returns just the result. Do not
put the key anywhere client-side. Explain what a serverless function is
like I've never run one.
```

Deploy it once (Vercel makes this one click from the dashboard — Challenge 7
does this properly; for now let the AI walk you through the dashboard
import). Then set the key where it belongs:

**Vercel → your project → Settings → Environment Variables:** add
`OPENAI_API_KEY`, paste the value yourself — **no-peek, server edition.**
The host's settings panel *is* the grown-up `.env`: values live with the
server, outside the code, outside git, outside chats.

Then test the loop: your page → `/api/polite` → OpenAI → back. If the answer
comes back polite, a server you've never seen just used a secret you never
showed, on your behalf. That's the pattern. Everything else is detail.

## Part B — Break it on purpose (15 min)

The middleman works when the world is friendly. Now make the world unfriendly
and watch your app's manners:

```
Drill time. Do these one at a time, and after each: I'll try the feature
and tell you what I saw.
1. Rename the environment variable on the server so the key is missing.
2. Change the API route path so the page calls the wrong address.
3. (If the API supports it) use an invalid key.
```

For each break, notice *how* your app fails. If it shows raw error soup or
freezes forever, it has no manners. Fix it with manners:

```
Make the page handle failures gracefully: if /api/polite is unreachable,
errors, or returns junk, show "The politeness service is taking a break —
try again in a minute." — and give me a retry button. Also cap waits at
10 seconds. Explain timeouts like I'm new.
```

The finished drill teaches the real lesson: **your app is only as calm as
its worst day.** Features that only work when everything works are demos;
features that fail politely are products.

## Part C — The ingredient rules (10 min)

Every external service you'll ever add — maps, weather, email, AI — follows
the same five rules. Print them in your head:

1. **Keys live server-side.** Browser = public square, forever, no exceptions.
2. **No-peek is forever.** You paste server keys into the host's panel; the
   AI sees empty variables and clean code.
3. **Cap the blast radius on day one.** Every API dashboard has usage limits
   and alerts — set them the day the key is born (101 · Challenge 2).
4. **Expect the ingredient to be missing.** Slow, down, rate-limited,
   out of credits — graceful message + retry is the standard plate.
5. **Log what happened, in plain words.** When the middleman fails at 2am
   (Challenge 6), the log is the witness statement.

---

## 🤖 Prompts worth stealing

- *"Could ANY of my keys end up in browser code? Audit the project and show
  me exactly what the browser can see."*
- *"Add a timeout, a graceful failure message, and a retry to this API
  call — explain each like I'm new."*
- *"Before I add [service], tell me: what will it cost at 100 users, where
  do its keys live, and what happens when it goes down?"*

## ✅ You passed when…

- [ ] A serverless function calls an external API and your page shows the result
- [ ] The API key exists ONLY in the host's environment variables — and a
      search of your project code finds no trace
- [ ] You broke the middleman 3 ways and the page stayed polite
- [ ] A timeout and retry exist — no infinite spinners
- [ ] Usage alerts are on at the API provider

## 📚 Jargon translator

| Term | Plain English |
|------|---------------|
| API | A service's menu: things you may ask it to do, and what comes back |
| Serverless function | Your small program running on the host's server, one address, no machine to babysit |
| Middleman pattern | Page → your server (holds keys) → big service → back. Keys never touch the browser |
| Environment variables (server) | The host's settings panel — the grown-up `.env` |
| Timeout | "Stop waiting after 10 seconds" — the difference between a shrug and a freeze |
| Graceful failure | Breaking politely: a clear message, a retry, no soup |

## 🆘 When it goes wrong

- **Works locally, 401/403 after deploy.** The server doesn't have the key —
  you set it on your machine but not in the host's panel. That's not a bug;
  it's the drawer being in a different building. Add it to Vercel's
  Environment Variables.
- **The function returns 500 with no clues.** The server logs know. Ask:
  *"Show me where Vercel keeps function logs and help me read the last
  error."* (Deep dive: Challenge 6.)
- **CORS errors appear.** Foreign words for "the browser blocked this
  request." Usually the page is calling the API directly instead of through
  your middleman. Paste the error — evidence first (101 · Challenge 4).
- **You catch yourself pasting the key into the page code "just to test."**
  No. The middleman exists so that sentence can never be finished. Test the
  middleman, not the key.

➡️ **Next:** [Challenge 5 — The 30-File App](../05-the-30-file-app/)
