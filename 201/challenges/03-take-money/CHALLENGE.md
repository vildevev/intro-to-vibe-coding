# Challenge 3 — Take Money

**Mission:** Sell something real from your app: a Stripe checkout, a real
card charge (one dollar, yours), and the go-live checklist for when it's not
a drill anymore.

**Time:** ~60 minutes

---

## 😱 The story

Two vibe coders wanted payments. The first asked the AI to "add a credit
card form" — and got one: boxes for the card number, right on their site.
The code worked. It also would have made them **illegal on day one**: card
numbers are radioactive. Storing or even *touching* them unraw puts you
under a contract called PCI-DSS with audits, fines, and liability that makes
tax paperwork look like a coloring book.

The second vibe coder used **Stripe**. The card box lived on Stripe's
computers, the money moved through Stripe's pipes, and the app itself never
saw a single digit. Rule for life: **card numbers never touch your app.**
You don't handle cash in a bank vault you built in your garage — you use the
bank. Stripe is the bank.

## 🧰 What you'll learn

- The payments rule: your app asks Stripe; **Stripe handles the cards**
- **Test mode**: a full fake economy with fake money — build here first
- The go-live moment: swapping test keys for live keys, on purpose
- **Webhooks**: how your app *hears* "payment succeeded" from Stripe

## 📋 Before you start

- [ ] Challenges 1–2 done (memory + sign-in — payments ride on both)
- [ ] A free [stripe.com](https://stripe.com) account (no card needed today)
- [ ] Comfort with the no-peek trick — Stripe keys are secrets too

---

## Part A — Meet the fake economy (10 min)

In Stripe's dashboard, find the **Test mode** toggle (top right, orange).
Test mode is a parallel universe: real features, imaginary money. Make a
**product** there: name it whatever you'd sell, price it **$1.00** one-time.
Grab its **Price ID** (starts `price_…`) — your app will point at it.

> 💡 Why $1? Because at the end of this challenge you'll buy it *from
> yourself* with a real card in live mode. Seeing a real receipt that you
> sent to yourself is the moment "I could sell things" becomes true.

## Part B — Checkout, small bites (20 min)

Keys first, no-peek as always — Stripe gives you a **publishable** key (can
be seen) and a **secret** key (never leaves the drawer; in this challenge it
will live in `.env` locally, and in Challenge 7 it moves to the server
panel — never anywhere else):

```
I'm adding Stripe payments. Create .env entries for STRIPE_SECRET_KEY=
and STRIPE_PRICE_ID= (empty, with comments). Then add a "Buy now" button
that creates a Stripe Checkout Session (test mode) and redirects me to
Stripe's hosted checkout page. Do NOT use my own card form — Stripe
hosts the card page. Explain the flow in plain English first.
```

Then the drill, with the famous test card. On Stripe's checkout page use:

```
Email: any test email
Card: 4242 4242 4242 4242
Expiry: any future date · CVC: any 3 digits · ZIP: anything
```

Pay the dollar of fake money. Stripe says thanks and redirects you back.
Look in Stripe → Payments: the test payment sits there with a green
"succeeded". **You just built a store.** Save point.

## Part C — When Stripe talks back: webhooks (15 min)

Right now you're *assuming* success because Stripe's page said thanks. Real
apps need to *hear about it officially* — that's a **webhook**: Stripe
phones your app after money moves ("payment succeeded — session `cs_…`").
Your app answers the phone, and only then marks the order paid or unlocks
the content.

```
Add a Stripe webhook endpoint in my app for the event
checkout.session.completed. On success, write a row to a new "orders"
table: who bought, what, when. Explain webhooks in plain English —
what Stripe sends, how my app confirms it's really Stripe talking —
before writing code.
```

Test it: another fake purchase → Supabase `orders` table gains a row,
written not by your form but by *Stripe's phone call*. Money moved, memory
recorded, nobody typed anything.

> 💡 Those "how does my app know it's really Stripe?" details (signatures,
> secrets) are exactly the parts you should never hand-write from memory —
> ask the AI to use Stripe's official tools, then read the explanation.

## Part D — The go-live checklist (10 min)

Test mode graduates to live mode with a *checklist*, not a leap:

- [ ] The purchase flow works end-to-end in **test** — buy button, checkout,
      webhook, orders table
- [ ] Taxes & "what am I actually selling" are honest — Stripe asks; answer
      truthfully (a $1 digital sticker is fine; "consulting" is a whole thing)
- [ ] Live keys created in Stripe → pasted by **you** into `.env` (no-peek)
      — test keys stay, commented, for next time
- [ ] One real purchase: your own card, your own product, one real dollar.
      Refund yourself in Stripe → Payments (also good to have seen)
- [ ] Spend cap habit: Stripe → Settings → Billing alerts, on

That last real purchase is a graduation moment of its own. Screenshot it.
You're a merchant now.

---

## 🤖 Prompts worth stealing

- *"Which Stripe keys exist, which may be public, which must never leave
  .env — and where does each one go in my app?"*
- *"What happens if the webhook never fires? Add a fallback so orders can't
  silently vanish."*
- *"Review my checkout flow like a payments auditor: what would embarrass me
  in month six?"*

## ✅ You passed when…

- [ ] A test purchase completes: button → Stripe page → success → back
- [ ] Card numbers never appear in your code, `.env`, or git (Stripe hosts
      the card page — verify with a search of your project)
- [ ] A webhook writes real rows to an `orders` table
- [ ] You did the go-live checklist and made one real $1 purchase from yourself
- [ ] Test keys are commented in `.env`, live keys in use — labeled, no-peek

## 📚 Jargon translator

| Term | Plain English |
|------|---------------|
| Stripe | The rented bank: cards, money movement, receipts — the industry default |
| Test mode | The fake economy: identical features, imaginary money, famous test card 4242… |
| Checkout Session | A one-time "cash register lane" Stripe opens for one purchase |
| Publishable key | The public half of your keys — safe to be seen |
| Secret key | The private half — drawer-only, forever |
| Webhook | The official phone call after money moves: "it's done, here's the receipt ID" |
| PCI-DSS | The card-industry rulebook you avoid by never touching card numbers |

## 🆘 When it goes wrong

- **"Invalid API key" in test mode.** Mode mismatch: the key is from one
  mode, the price from the other. Both must be test — or both live.
- **The webhook never fires locally.** Stripe's phones can't reach your
  laptop by themselves — dev setups need a relay (Stripe CLI). Ask your AI:
  *"Set up the Stripe CLI webhook forwarding for local testing."*
- **You built a card form.** Delete it. No exception, no "just for testing."
  Test mode *would* work — and that's exactly the trap: it trains you to
  ship the radioactive version.
- **A real customer appears before you're ready.** Honest badge of success.
  Freeze new features, do the go-live checklist properly that day, and
  refund graciously if anything was half-built.

➡️ **Next:** [Challenge 4 — APIs Are Ingredients](../04-apis-are-ingredients/)
