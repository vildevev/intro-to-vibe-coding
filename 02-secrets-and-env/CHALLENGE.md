# Challenge 2 — Secrets: Don't Get Hacked

**Mission:** Learn where passwords and API keys live, and build the habit that
separates safe vibe coders from cautionary tales on the evening news.

**Time:** ~60 minutes

---

## 😱 The story

Marcus built a little app that texts him the weather every morning. It needed
an **API key** — a password his app uses to talk to the weather service. The
AI put that password directly in the code. Marcus pushed his code to GitHub,
proud, and went to bed.

Software robots scan GitHub *constantly* — not for code, for **passwords**.
Marcus's key was found in under 10 minutes. By morning, strangers were using
his weather-service account around the clock. His bill: thousands of dollars.
The service eventually forgave him. Some companies don't.

None of this requires a genius hacker. It's an automated vacuum cleaner that
sucks up passwords people leave on the floor. Today you learn to never leave
passwords on the floor — and what to do about the vacuum's cousins that come
knocking once your app is public.

## 🧰 What you'll learn

- What a **secret** is (API keys, tokens, passwords — passwords for *programs*)
- The **`.env` file** — the drawer where secrets live
- The **no-peek trick** — how to add a real secret the AI builds everything
  for *except* seeing the value
- The **git history rule** — unpushed = erasable, pushed = rotate
- **Rotation** — what to do the day a secret leaks (change the locks)
- **Rate limits & spend caps** — protecting your app once strangers arrive

## 📋 Before you start

- [ ] Challenge 1 done: your project has save points and a GitHub repo
- [ ] Your AI assistant open in your project folder

---

## Part A — Do it wrong on purpose (5 min)

You need to see the bad way once, safely, with a **fake** key.

Ask your AI:

```
Add a feature to my page: a weather widget that would call a weather API.
For now, put a FAKE api key directly in the code — literally write
API_KEY = "sk-fake-key-12345" in the code. I'm doing a security exercise.
Then commit it.
```

Look at the code. There it is: a password, sitting in a file, in the open.
If that were a real key and you pushed to GitHub — Marcus's morning.

> 💡 **A secret is any string a program uses to prove it's allowed to do
> something.** API keys, tokens, passwords, connection strings. If it's long,
> random-looking, and lets software access something — it's a secret.

## Part B — Build the drawer: `.env` (10 min)

The fix is a boring convention that every real app on Earth uses: secrets live
in a special file named **`.env`** (short for *environment*), and that file is
never saved into git.

1. Ask your AI:

   ```
   Move the fake API key out of the code into a new file called .env.
   Make the code read it from there instead. Explain what you did in
   plain English.
   ```

2. Open the `.env` file yourself and look at it. One line, roughly:

   ```
   WEATHER_API_KEY=sk-fake-key-12345
   ```

   The code now *reads* the value from the drawer instead of holding it.
   (This is called an **environment variable** — a setting the program picks
   up from outside its own files.)

3. Now check what git thinks. Run it yourself:

   ```
   git status
   ```

   See `.env` in red? That means git wants to pack it into your next save
   point. **This is the exact moment people get hacked** — one `git add .`
   and the password is in history forever.

4. Tell git to never pack it. Ask your AI:

   ```
   Make sure .env is listed in .gitignore, and confirm to me that
   git status no longer shows .env.
   ```

5. Run `git status` again yourself. `.env` gone from the list? That silence
   is the sound of safety. Open the `.gitignore` file and find the `.env`
   line — that's the **do-not-pack list** in action.

6. Commit the *good* version:

   ```
   git add .
   git commit -m "moved secret to .env, out of git"
   git push
   ```

7. Go look at your repo on github.com. Find the weather-widget code. Notice:
   the key is not there. The drawer stayed home. **This is what safe looks like.**

## Part C — The no-peek trick (10 min)

Here's the cleanest rule in all of vibe coding: **the AI needs to *use* your
secrets, but it never needs to *see* them.** It writes the lock; you put the
key in.

When you're adding a **real** key (from a service's dashboard), don't paste it
anywhere the AI can read it. Instead, ask:

```
I'm about to add a real API key for this feature. Create a file called .env
with a line WEATHER_API_KEY= (empty value), plus a short comment explaining
what belongs there. Then write the code so it reads the key from .env.
Do NOT invent, guess, or fill in any value, and don't ask me to paste the
key into chat — I'll open the file myself and paste it in. Finally, verify
the setup by checking the value is present (not empty) WITHOUT printing it.
```

Then:

1. The AI builds everything *except* the value — the `.env` line with an empty
   `=`, and the code that reads it.
2. **You** open `.env` and paste the real key in yourself. It never touches
   the chat, the code, or any screenshot.
3. When testing, ask the AI to confirm the app *loaded* a value — not to show
   it. "Is it there?" is safe. "What is it?" never is.

Why bother? Anything typed into a chat may be stored, logged, or screenshotted
forever (Part F). With this pattern, even a screenshot of your entire session
shows nothing useful to a thief. The AI hands you the drawer with the label
written — you drop the key in when it's not looking.

## Part D — The last cheap moment: look before you push (10 min)

Most leaks aren't malice; they're autopilot. Build the checking reflex —
because once a secret is *pushed*, it's in **history**, and history is
forever. This is the rule:

> 💡 **Secret in a commit? Two branches:**
> **Not pushed yet → erasable.** A save point only becomes history when
> others can see it. Take it back, fix it, re-save clean.
> **Already pushed → rotate.** No rewriting trick changes the math: bots had
> it minutes ago. Revoke first, panic second (Part E).

**The "almost leaked" drill:**

1. Type, yourself:

   ```
   git add .
   ```

2. **Stop.** Before anything else: `git status`. Read the file list line by
   line, asking of each file: *does this contain a password, a key, personal
   info, or stuff I wouldn't put on a poster?*

3. Imagine you see something you don't want. Unpack it (ask your AI, or type):

   ```
   git restore --staged .env
   ```

4. Now practice the take-back, safely. Ask your AI:

   ```
   Make a small commit that contains the word "oops-test" in a file.
   Do NOT push it. Then show me how to undo that one commit while keeping
   the changes in my files, so it's like the commit never happened.
   Explain git reset in plain English first.
   ```

   What you just learned: an unpushed commit is a draft you can rewrite
   (that's `git reset` under the hood). A *pushed* commit is history.

That single habit — **look before you push** — prevents most leaks. And if a
secret slips into a commit you haven't pushed, taking the commit back is the
last cheap moment. After `git push`, the cheap moments are over.

## Part E — The rotation drill (10 min)

Someday a secret will leak. (Pushed by accident, emailed to yourself, a
screenshot in a group chat, pasted into an AI chat…) The fix is always the
same, and it's *fine* if you know the moves. It's called **rotation**: change
the locks, not the doors.

1. Log into any service you use and find where keys are made (e.g. GitHub →
   Settings → Developer settings → Personal access tokens; or OpenAI →
   API keys). Notice the buttons **Revoke** and **Create new**. That's the
   whole mechanism.
2. Make a throwaway key. Revoke it. Regenerate it. Delete the old one.
3. Say the mantra out loud: **"Leaked? Revoke first, panic second."** A leaked
   key that's been revoked is a dead key — worthless to the thief.
4. One nuance for later: there *is* surgery that scrubs a pushed secret out of
   git history, and your AI can perform it. But it's cosmetic — copies and
   bots may already exist. Rotation is the part that actually protects you;
   surgery is optional tidying you do *after* rotating.

## Part F — Secrets and AI chats (5 min)

Your AI assistant is brilliant and **not a vault**. Chats may be stored,
reviewed, or logged. So:

- **Never paste a real API key, password, or token into an AI chat.** Not even
  "just quickly." Use the no-peek trick (Part C) — the AI never needs the
  value to help you.
- Screenshots count. Emails count. Group chats count. Error messages that
  *contain* your key count.
- If an AI asks for your real password to "fix" something: **it doesn't need
  it.** No legitimate tool asks for your passwords. That's a red flag, even
  from software you trust.
- Your `.env` file stays in the drawer. You talk *about* it ("the key in my
  .env isn't working") — you never paste its contents.

## Part G — When it's a real app: limits protect the front door (10 min)

Keys protect your *accounts*. **Limits** protect your *app*. The day you ship
something public (Challenge 6), strangers arrive — and some of them are bots.
Two bad days to know about:

- **Abuse:** a script finds your "email me" button and fires it 10,000 times.
  Your email and API bills explode while you sleep.
- **DDoS** (Distributed Denial of Service): someone floods your site with so
  much fake traffic that real visitors can't get in. You can't always prevent
  it, but you can make it boring.

Your blast-radius kit — each is one prompt or one dashboard setting:

| Danger | Guard | Where it lives |
|--------|-------|----------------|
| Key leaks out | **Rotation** (Part E) | The service's dashboard |
| Runaway bills | **Spend caps** — monthly usage limits & billing alerts | Every paid service's dashboard, the day you create the key |
| Bots hammer your forms | **Rate limits** — e.g. max 10 requests per minute per visitor (per IP or per user) | Written into the app by your AI; often built into your host too |
| Site flooded offline | **DDoS shield** | Your host — Cloudflare (where your DNS already lives), Vercel, Netlify all include one free |

Try one right now. Ask your AI:

```
Add rate limiting to my app: each visitor can submit the form at most
10 times per minute (per IP). If they go over, show a friendly message:
"Whoa, slow down — try again in a minute." Explain how it works in
plain English.
```

And two habits that cost nothing:

- **Build with sandbox keys.** Most paid services give *test* keys that act
  real but cost nothing (Stripe's test cards are famous). Swap to live keys
  only when you ship.
- **Turn on what's free by default.** Ask your AI: *"What abuse protection
  (DDoS shield, rate limiting) does my hosting platform include, and how do I
  make sure it's on?"*

---

## 🤖 Prompts worth stealing

- *"Is there anything in my project that looks like a secret or API key that
  shouldn't be in git? Check before I push."*
- *"Create a .env file with empty entries and the code that reads them — I'll
  paste the real values myself. Never ask me to paste secrets in chat."*
- *"I committed a secret but haven't pushed: undo that commit, keep my
  changes, move the secret to .env, and commit a clean version."*
- *"I accidentally pushed a secret. Walk me through rotating it first, then
  removing it from git history, step by step, calmly."*
- *"Add rate limiting: max 10 requests per minute per visitor on this
  endpoint, with a friendly 'slow down' message."*
- *"Add this new feature using an environment variable from .env — do not
  hardcode the value in the code."*

## ✅ You passed when…

- [ ] Your project has a `.env` file holding a (fake) key
- [ ] `.gitignore` lists `.env`, and `git status` proves git ignores it
- [ ] You did the no-peek drill: the AI built the `.env` scaffolding and never
      saw a value
- [ ] You ran the "look before you push" drill: `git add .` → `git status` → check
- [ ] You can recite the rule: *unpushed = erasable, pushed = rotate*
- [ ] You did one rotation drill (revoke + regenerate) at a real service
- [ ] Your app has a rate limit, and you know where spend caps live

## 📚 Jargon translator

| Term | Plain English |
|------|---------------|
| Secret | Any password a *program* uses: API key, token, connection string |
| API key | A password one program uses to talk to another service |
| `.env` | The drawer file where secrets live, outside the code |
| Environment variable | A value the program reads from outside itself (from `.env`) |
| Hardcoded | Written directly into the code — the dangerous way |
| `.gitignore` | The do-not-pack list: files git will never save |
| Git reset | Take back an unpushed save point while keeping the work |
| History | The record of all pushed commits. Forever. Bots read it |
| Rotation | Leaked? Revoke the old key, create a new one. Change the locks |
| Rate limit | A ceiling on how often one visitor (IP or user) can use your app |
| DDoS | Flooding a site with fake traffic until real people can't use it |
| Sandbox / test key | A key that behaves real but costs nothing — for building |
| Spend cap | A hard ceiling a service enforces on your monthly bill |
| Secret manager | A pro service that keeps secrets for companies (you don't need this yet) |

## 🆘 When it goes wrong

- **"I committed a real key and haven't pushed!"** Nothing is history yet —
  take the commit back (Part D: reset, move the secret to `.env`, commit
  clean). Then breathe.
- **"I already pushed a real key."** Don't hide and don't trust history
  surgery. **Rotate first** (Part E) — a revoked key can't hurt you even
  while it's visible. Then ask your AI: *"Help me remove a secret from my
  git history and push the cleaned version."*
- **My app can't find the key / feature stopped working.** Usually the code
  isn't reading `.env` correctly. Ask: *"The app can't find my environment
  variable — check how the code reads .env and fix it."*
- **I pasted a real secret into the AI chat.** Rotate that key now (Part E).
  Then delete what you can from the chat/history, and move on. Rotation
  fixes pastes, too.
- **My bill spiked / my app is getting hammered.** Rate limit the endpoint
  (Part G), check the spend cap, and if the abuse involved one of *your*
  keys, rotate. Ask your AI: *"My [endpoint] is being called way too much —
  add per-IP rate limiting and tell me what protections my host includes."*
- **Is [this string] a secret?** If it's long, gibberish-looking, and unlocks
  access to something — treat it as one. Ask your AI: *"What is this kind of
  credential used for?"* (but paste a **redacted** version, e.g. `sk-abc…xyz`).

➡️ **Next:** [Challenge 3 — Prompt Like a Pro](../03-prompt-like-a-pro/CHALLENGE.md)
