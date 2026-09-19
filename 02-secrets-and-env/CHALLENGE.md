# Challenge 2 — Secrets: Don't Get Hacked

**Mission:** Learn where passwords and API keys live, and build the habit that
separates safe vibe coders from cautionary tales on the evening news.

**Time:** ~45 minutes

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
passwords on the floor.

## 🧰 What you'll learn

- What a **secret** is (API keys, tokens, passwords — passwords for *programs*)
- The **`.env` file** — the drawer where secrets live
- How **`.gitignore`** keeps the drawer out of your save points
- **Rotation** — what to do the day a secret leaks (change the locks)
- The rules for secrets and AI chats

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
   is the sound of safety. (Your scaffold's `.gitignore` already ignored
   `.env` — make sure you can *see* the line in the `.gitignore` file and
   understand what it does: it's the **do-not-pack list** for your suitcase.)

6. Commit the *good* version:

   ```
   git add .
   git commit -m "moved secret to .env, out of git"
   git push
   ```

7. Go look at your repo on github.com. Find the weather-widget code. Notice:
   the key is not there. The drawer stayed home. **This is what safe looks like.**

## Part C — The "almost leaked" drill (5 min)

Most leaks aren't malice; they're autopilot. Build the checking reflex.

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

   That single habit — **look before you push** — prevents most leaks.

## Part D — The rotation drill (10 min)

Someday a secret will leak. (Emailing it to yourself, a screenshot in a group
chat, pasting it into an AI chat…) The fix is always the same, and it's
*fine* if you know the moves. It's called **rotation**: change the locks, not
the doors.

1. Log into any service you use and find where keys are made (e.g. GitHub →
   Settings → Developer settings → Personal access tokens; or OpenAI →
   API keys). Notice the buttons **Revoke** and **Create new**. That's the
   whole mechanism.
2. Make a throwaway key. Revoke it. Regenerate it. Delete the old one.
3. Say the mantra out loud: **"Leaked? Revoke first, panic second."** A leaked
   key that's been revoked is a dead key — worthless to the thief.

## Part E — Secrets and AI chats (5 min)

Your AI assistant is brilliant and **not a vault**. Chats may be stored,
reviewed, or logged. So:

- **Never paste a real API key, password, or token into an AI chat.** Not even
  "just quickly." The AI never needs the real value to help you — it can show
  you *where* to put it.
- Screenshots count. Emails count. Group chats count. Error messages that
  *contain* your key count.
- If an AI asks for your real password to "fix" something: **it doesn't need
  it.** No legitimate tool asks for your passwords. That's a red flag, even
  from software you trust.
- Your `.env` file stays in the drawer. You talk *about* it ("the key in my
  .env isn't working") — you never paste its contents.

---

## 🤖 Prompts worth stealing

- *"Is there anything in my project that looks like a secret or API key that
  shouldn't be in git? Check before I push."*
- *"Add this new feature using an environment variable from .env — do not
  hardcode the value in the code."*
- *"I accidentally committed a secret. Walk me through rotating it and
  removing it from git history, step by step, calmly."*

## ✅ You passed when…

- [ ] Your project has a `.env` file holding a (fake) key
- [ ] `.gitignore` lists `.env`, and `git status` proves git ignores it
- [ ] You looked at your repo on GitHub and confirmed the key isn't there
- [ ] You ran the "look before you push" drill: `git add .` → `git status` → check
- [ ] You did one rotation drill (revoke + regenerate) at a real service
- [ ] You can finish the sentence: "If a secret leaks, first I ______ it"

## 📚 Jargon translator

| Term | Plain English |
|------|---------------|
| Secret | Any password a *program* uses: API key, token, connection string |
| API key | A password one program uses to talk to another service |
| `.env` | The drawer file where secrets live, outside the code |
| Environment variable | A value the program reads from outside itself (from `.env`) |
| Hardcoded | Written directly into the code — the dangerous way |
| `.gitignore` | The do-not-pack list: files git will never save |
| Rotation | Leaked? Revoke the old key, create a new one. Change the locks |
| Secret manager | A pro service that keeps secrets for companies (you don't need this yet) |

## 🆘 When it goes wrong

- **"I already committed/pushed a real key!"** Don't hide. **Revoke/rotate the
  key first** (Part D) — a revoked key can't hurt you even if it's visible.
  Then ask your AI: *"Help me remove a secret from my git history and push
  the cleaned version."* Removing history is fiddly; rotation makes it urgent,
  not catastrophic.
- **My app can't find the key / feature stopped working.** Usually the code
  isn't reading `.env` correctly. Ask: *"The app can't find my environment
  variable — check how the code reads .env and fix it."*
- **I pasted a real secret into the AI chat.** Rotate that key now (Part D).
  Then delete what you can from the chat/history, and move on. Rotation fixes
  pastes, too.
- **Is [this string] a secret?** If it's long, gibberish-looking, and unlocks
  access to something — treat it as one. Ask your AI: *"What is this kind of
  credential used for?"* (but paste a **redacted** version, e.g. `sk-abc…xyz`).

➡️ **Next:** [Challenge 3 — Prompt Like a Pro](../03-prompt-like-a-pro/CHALLENGE.md)
