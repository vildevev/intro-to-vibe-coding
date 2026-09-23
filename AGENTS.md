# AGENTS.md — Intro to Vibe Coding course repo

This repo contains course material, not an app. Challenges are written for
**non-technical learners** using an AI coding agent (like this one) for the
first time.

## Writing rules

- Audience has never used a terminal, git, or a code editor. Assume zero.
- Plain language first; introduce a technical term only with an everyday
  analogy, and collect terms in the challenge's jargon table.
- Every challenge: a story ("why you should care"), hands-on steps, exact
  copy-paste prompts for the AI, a "you passed when" checklist, and a
  recovery section for when it goes wrong.
- The AI does the typing; the learner makes the decisions and verifies.
  Never require memorizing commands.

## Structure

- `README.md` — 101 course home and map (also the website's landing content)
- `NN-slug/CHALLENGE.md` — 101: one challenge per numbered folder
- `201/` — the advanced track: `201/README.md` (map) + `201/challenges/NN-slug/`
- `CHEATSHEET.md` — printable one-pagers per topic (101; a 201 sheet is not written yet)
- `build.mjs` + `site/style.css` — static-site generator and design system
- `docs/` — generated website (committed; GitHub Pages serves this folder)

## Commands

- Build site: `npm install` (once), then `npm run build` (regenerates `docs/`)
- Preview site: `python3 -m http.server 8142 --directory docs`

Edit the markdown sources, never `docs/` — it is generated output. After
changing any course content, run the build and commit both the source and
the regenerated `docs/`.

## Deploying

Live at **`https://learn.getglod.com`** (GitHub Pages, deploy-from-branch
`main` → `/docs`, no build step on GitHub's side; `docs/` is committed
pre-built). `docs/CNAME` pins the custom domain — keep it in the build
output. DNS: Cloudflare, `learn` CNAME → `vildevev.github.io`, DNS-only
(not proxied), HTTPS enforced.

The apex `getglod.com` hosts the user's separate Glod app on Cloudflare
Workers — never attach the apex to this repo's Pages.

## Conventions

- Keep `node_modules/`, `.env`, and `dist/` out of git (already in .gitignore).
- Challenge folders may contain starter files learners practice on; keep them
  deliberately breakable.
