# Challenge 6 — Deep Debugging

**Mission:** Debug like you operate the building, not like you're locked out
of it: read server logs, read the network tab, and know what the error codes
are trying to tell you.

**Time:** ~60 minutes

---

## 😱 The story

The 101 taught you the debugging loop: reproduce, capture, describe, fix,
verify, save. But 201 apps have a second floor. When YOUR machine works and
the SERVER doesn't — the checkout that fails only for customers, the button
that spins forever for everyone but you — the old loop stalls, because the
witness isn't on your screen anymore. It's in two places you've never been
shown: the **server logs** (where the server whispers what hurt it) and the
**network tab** (where the browser records every conversation it had).

This challenge shows you both, then breaks your app three ways so you can
practice reading the clues before it's 2am and real.

## 🧰 What you'll learn

- **Server logs**: where they live on Vercel, and how to read them
- **The network tab**: the browser's honest diary of every request
- The error-code decoder: **401, 403, 404, 429, 500** — five messages you'll
  meet for the rest of your life
- The 201 evidence template: same loop, two witnesses

## 📋 Before you start

- [ ] Challenge 4's project deployed on Vercel (middleman + key on server)
- [ ] The 101 debugging loop in your bones: *evidence, not feelings*

---

## Part A — Meet the witnesses (10 min)

Two diaries record everything. Know where they live:

1. **Server logs.** Vercel → your project → **Logs**. Every time your
   serverless function runs — success or failure — a line lands here: what
   came in, what it printed, what it choked on. Right now it's mostly
   silence. Silence is healthy.
2. **The network tab.** In your browser: `F12` → **Network** (Mac:
   `Cmd+Option+J` → Network). Refresh your page and watch: every request —
   pages, fonts, API calls — with its **status code**. Green-ish 200s are
   "fine"; red anything is a conversation worth reading. Click one and you
   see exactly what was sent and exactly what came back.

> 💡 Reading these is safe. You're the detective reading witness statements,
> not touching evidence. (And like the 101 console — closing them is always
> harmless too.)

## Part B — The decoder ring (10 min)

Error codes are the network's dialect. Five cover 95% of your life:

| Code | Plain English | Usual suspect |
|------|---------------|---------------|
| **401** | "Who are you?" | Not signed in, or a key that's missing/expired |
| **403** | "I know who you are. No." | Signed in, not allowed — RLS said no, plan limits hit |
| **404** | "No such address." | Typo in a URL or route path |
| **429** | "Slow down." | Rate limit — yours or the service's (101 · Challenge 2 grows up) |
| **500** | "I face-planted." | Your server code crashed — the server log has the story |

Memorize the pairs that travel together: **401 → check the key/session**.
**403 → check the bouncer (RLS/permissions)**. **500 → check the server log,
not the browser.** Half of all adult debugging is just routing yourself to
the right witness by code.

## Part C — Three break-ins, three reads (25 min)

The drill, 201 edition. Ask your AI to plant the crimes:

```
Debugging drill, planted one at a time. After each plant, tell me
"planted" and nothing else — I'll find it. Wait for my diagnosis before
the next.
1. On the SERVER: make the middleman's environment variable name wrong
   (so the key is missing at runtime).
2. In the BROWSER: break the address my page uses to call the middleman
   (wrong path).
3. On the SERVER: make the middleman throw an error for one specific
   input.
```

Then, for each, run the 201 evidence play:

1. **Reproduce**, then open the network tab and find the red row. **Read the
   code.** 401/403 → server-side key or auth issue. 404 → wrong address.
   500 → take the conversation upstairs.
2. **Read the server log** for the matching minute. Plant 1's log literally
   says the variable is missing; plant 3's log names the line that threw.
3. **Report, then fix**: state the code, the witness, the diagnosis:

   ```
   Diagnosis: the page got 401 from /api/polite. Network tab shows the
   request lacked the key; server log says OPENAI_API_KEY is undefined.
   That's the server env variable name — check it against the code.
   ```

   Then let the AI fix, verify, and — always — **run the tests** and commit:
   `git commit -m "fixed: 401 after deploy — server env var name mismatch"`.

Three planted crimes, three correct witnesses. That's the whole skill: at
2am you won't panic because you'll know *which diary to open first*.

## Part D — The upgrade to the evidence template (5 min)

The 101 template grows one line for the second floor:

```
A bug: [expected] — but instead [actual].
The error says: [exact red text]
How I make it happen: [steps]
The network tab says: [status code + which request]
The server log says: [paste the matching lines]

Explain in plain English. Smallest fix. Show me before applying.
```

Two witnesses, one loop, zero vibes.

---

## 🤖 Prompts worth stealing

- *"My machine works, production doesn't. Walk me through checking: same
  code? same env vars? what do the server logs say?"*
- *"Decode this status code for me in plain English and list the three most
  likely causes for OUR app."*
- *"Add better words to the server log so future-me can diagnose this at
  2am — log the input, the outcome, and the reason on failure."*

## ✅ You passed when…

- [ ] You found Vercel's logs and can pull up a function's last error
- [ ] You found the network tab and can spot the red request + its code
- [ ] You diagnosed all three planted crimes by code class, before fixing
- [ ] Your evidence template now has the two-witness lines
- [ ] You can pair each code (401/403/404/429/500) with its usual suspect

## 📚 Jargon translator

| Term | Plain English |
|------|---------------|
| Server log | The server's diary: every run, every crash, every reason |
| Network tab | The browser's diary of every conversation: what was sent, what came back, in what code |
| Status code | The first word of every reply: 200 "fine", 401 "who?", 403 "no", 404 "nothing here", 429 "slow down", 500 "I crashed" |
| Production / prod | The real app, serving real people — where errors have witnesses now |
| Environment drift | "Works on my machine": your laptop and the server disagree about keys, data, or versions |
| Payload | What a request carries in its suitcase — visible in the network tab |

## 🆘 When it goes wrong

- **The log says nothing useful.** Logs only know what they were told. Ask
  the AI: *"Add plain-English logging around the failing step — inputs,
  outcome, reason — then redeploy and let's reproduce."*
- **401 but you're definitely signed in.** Two different diaries disagree —
  browser session vs server key. Check *which* side got the 401: your page
  to your server (session), or server to the big service (key).
- **Everything is 500 and the logs are a wall of soup.** Paste the *last*
  error only — the first line of the crash is the sentence that matters.
  Soup-reading is exactly what the AI is for; you supply the paste.
- **It fixed itself and you never learned why.** Log it anyway: *"Add a
  note to the logs capturing what we saw."* Self-healing mysteries become
  2am reruns; witnesses prevent reruns.

➡️ **Next:** [Challenge 7 — Ship Like a Pro](../07-ship-like-a-pro/)
