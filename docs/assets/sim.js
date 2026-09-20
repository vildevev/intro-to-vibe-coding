/* ============================================================
   The loop demo (homepage) — a gate-runner beat simulator.
   A simulated challenge run: save → ask → build → review (your
   call) → try it (your call) → save, with a broken-path branch
   that ends back at "try it". Vanilla JS, no dependencies.
   Colors are the site's diff semantics: yellow = you,
   green = the AI, red = errors.
   ============================================================ */
(() => {
  const root = document.querySelector('.sim');
  if (!root) return;

  const log = root.querySelector('.sim-log');
  const gateEl = root.querySelector('.sim-gate');
  const gateName = root.querySelector('.gate-name');
  const gatePrompt = root.querySelector('.gate-prompt');
  const gateActions = root.querySelector('.gate-actions');
  const infoEl = root.querySelector('.sim-info');
  const runBtn = root.querySelector('.sim-run');
  const stepBtn = root.querySelector('.sim-step');
  const phases = [...root.querySelectorAll('.sim-phase')];

  const INITIAL_LOG = log.innerHTML;
  const INITIAL_INFO = infoEl.innerHTML;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const LINE_MS = 340;
  const BEAT_MS = 520;

  // phase index into .sim-phase (save, ask, build, review, try, saved)
  const BEATS = [
    {
      phase: 0,
      info: '<strong>Golden Rule #1: Save before you renovate.</strong> A save point (git calls it a <em>commit</em>) is a video-game checkpoint — if the AI wrecks something, you just travel back. You make your first one in <a href="challenges/01-git-time-machine/">Challenge 1</a>.',
      logs: [
        ['you', 'First things first — make a save point.'],
        ['ai', 'Done — save point “before my next big idea” created ✓'],
      ],
    },
    {
      phase: 1,
      info: 'You decide what to build; the AI does the typing. It is a <strong>brilliant intern with total amnesia</strong> (Challenge 3) — a specific ask like this one removes the guessing.',
      logs: [
        ['you', 'Add a big yellow button that says “Party time 🎉” to my page.'],
      ],
    },
    {
      phase: 2,
      info: 'The AI types every character — you never touch the code. The <strong>diff</strong> is the before/after picture of what it changed, and it is made for humans (Challenge 5).',
      logs: [
        ['ai', 'Done! I edited 2 files. Here\'s the diff — green is what I added:'],
        ['add', '+ <button class="party">Party time 🎉</button>'],
        ['add', '+ .party { background: gold; font-size: 1.4rem }'],
      ],
    },
    {
      phase: 3,
      info: 'This pause is the whole course. Reading the diff takes 30 seconds — it is the difference between <strong>directing</strong> the AI and <strong>hoping</strong>.',
      gate: {
        name: 'Review the diff',
        prompt: '<strong>Golden Rule #3: the AI is your intern, not your boss.</strong> Read the green lines — do they match what you asked for?',
        actions: [
          { label: 'Looks right — accept it', goto: 4, log: 'Looks right — accept it ✓' },
          { label: 'Not what I asked — send it back', res: 'revise' },
        ],
      },
    },
    {
      phase: 4,
      info: 'The AI cannot click your button for you. Trying it yourself is how you catch problems while they are still small.',
      gate: {
        name: 'Try it for real',
        prompt: 'Open your page in the browser and actually click the thing. <strong>Trust, but verify</strong> — does it work?',
        actions: [
          { label: 'It works! 🎉', goto: 6 },
          { label: 'Red text — it broke', goto: 5 },
        ],
      },
    },
    {
      phase: 4,
      goto: 4,
      info: '<strong>An error message is a clue, not a failure</strong> (Challenge 4) — and nobody reads clues better than your AI, <em>if you hand it the clue</em>. Stuck for real? Every challenge has a 🆘 safe mode at the bottom.',
      logs: [
        ['err', 'Uncaught ReferenceError: buttton is not defined'],
        ['you', 'This broke. Here\'s the exact red text, all of it: [paste] — please fix.'],
        ['ai', 'Found it — I\'d typed “buttton” with three t\'s. Fixed ✓'],
      ],
    },
    {
      phase: 5,
      info: 'That is vibe coding: <strong>one small change, reviewed, tried, saved</strong> (Golden Rule #5). Eight challenges, same rhythm — <a href="challenges/00-setup/">start Challenge 0</a> and run it for real.',
      logs: [
        ['you', 'It works — save this version.'],
        ['ai', 'Save point created: “party button works” ✓'],
      ],
      final: 'SAVED ✓ — ask, build, review, try, save. That\'s the whole loop.',
    },
  ];

  // shown when the reader sends the diff back; cycles through these pairs
  const REVISES = [
    [
      ['you', 'Close — but make it bigger. And yellow-yellow, not lime.'],
      ['ai', 'Fixed — one line changed. Here\'s the new diff.'],
    ],
    [
      ['you', 'Better! Now the label should say “Party time” — with the emoji.'],
      ['ai', 'Done — diff attached so you can check me.'],
    ],
  ];

  let token = 0;   // invalidates in-flight animations when the run resets
  let idx = 0;     // next beat to render
  let mode = 'idle'; // idle | running | paused | gate | done
  let rev = 0;     // cycles the revise dialogue
  let wasPlaying = false;

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  function line(kind, text, instant) {
    const wait = log.querySelector('.sim-wait');
    if (wait) wait.remove();
    const el = document.createElement('span');
    el.className = 'sim-line ' + kind;
    if (kind === 'you' || kind === 'ai') {
      const who = document.createElement('b');
      who.className = 'who';
      who.textContent = kind === 'you' ? 'you ›' : 'ai ›';
      el.appendChild(who);
    } else if (kind === 'err') {
      const who = document.createElement('b');
      who.className = 'who';
      who.textContent = '✖';
      el.appendChild(who);
    }
    el.appendChild(document.createTextNode(text));
    log.appendChild(el);
    if (!instant && !reduce) {
      el.classList.add('pre');
      requestAnimationFrame(() => requestAnimationFrame(() => el.classList.remove('pre')));
    }
    log.scrollTop = log.scrollHeight;
  }

  function showInfo(html) {
    infoEl.innerHTML = html;
  }

  function setPhase(p, allDone) {
    phases.forEach((el, i) => {
      el.classList.toggle('done', Boolean(allDone) || i < p);
      el.classList.toggle('active', !allDone && i === p);
      if (!allDone && i === p) el.setAttribute('aria-current', 'step');
      else el.removeAttribute('aria-current');
    });
  }

  function sync() {
    runBtn.disabled = mode === 'running' || mode === 'gate';
    runBtn.textContent =
      mode === 'done' ? '↻ Replay' :
      mode === 'running' ? 'Running…' :
      mode === 'paused' ? '▶ Keep going' : '▶ Run the loop';
    stepBtn.disabled = mode !== 'idle' && mode !== 'paused';
    stepBtn.textContent = 'Step ▸';
  }

  function hardReset() {
    token += 1;
    idx = 0;
    rev = 0;
    log.innerHTML = INITIAL_LOG;
    infoEl.innerHTML = INITIAL_INFO;
    gateEl.hidden = true;
    setPhase(0, false);
    phases.forEach((el) => el.classList.remove('done', 'active'));
  }

  function openGate(gate, i) {
    wasPlaying = mode === 'running';
    mode = 'gate';
    gateName.textContent = gate.name;
    gatePrompt.innerHTML = gate.prompt;
    gateActions.innerHTML = '';
    gate.actions.forEach((a) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn';
      b.textContent = a.label;
      b.addEventListener('click', () => choose(a, i));
      gateActions.appendChild(b);
    });
    gateEl.hidden = false;
    sync();
    log.scrollTop = log.scrollHeight;
  }

  async function revise(i) {
    gateEl.hidden = true;
    const my = ++token;
    const pair = REVISES[rev % REVISES.length];
    rev += 1;
    for (const [k, t] of pair) {
      if (my !== token) return;
      line(k, t, false);
      await sleep(LINE_MS + 140);
    }
    if (my !== token) return;
    openGate(BEATS[i].gate, i);
  }

  function choose(a, i) {
    if (a.res === 'revise') {
      revise(i);
      return;
    }
    gateEl.hidden = true;
    line('you', a.log || a.label, false);
    mode = wasPlaying ? 'running' : 'paused';
    sync();
    run(a.goto, { autoplay: wasPlaying });
  }

  async function run(from, opts = {}) {
    const { instant = false, autoplay = false, upto = Infinity, autoGates = false } = opts;
    const my = ++token;
    idx = from;
    const seenGates = new Set(); // deep links accept each gate once, so goto loops terminate
    let guard = 0;
    while (idx < BEATS.length && idx <= upto && guard++ < 50) {
      if (my !== token) return;
      const beat = BEATS[idx];
      // deep links follow the happy path: jump over branch beats unless targeted
      if (autoGates && beat.goto != null && idx !== upto) {
        idx += 1;
        continue;
      }
      setPhase(beat.phase);
      for (const [k, t] of beat.logs || []) {
        if (my !== token) return;
        line(k, t, instant);
        if (!instant) await sleep(LINE_MS);
      }
      if (my !== token) return;
      showInfo(beat.info);
      if (beat.gate) {
        // deep links auto-accept gates they pass through (once each), stopping at the target
        if (autoGates && idx < upto && !seenGates.has(idx)) {
          seenGates.add(idx);
          line('you', 'Looks right — accept it ✓', true);
          idx += 1;
          continue;
        }
        openGate(beat.gate, idx);
        return;
      }
      if (beat.final) {
        setPhase(beat.phase, true);
        const v = document.createElement('div');
        v.className = 'sim-verdict';
        v.textContent = beat.final;
        log.appendChild(v);
        log.scrollTop = log.scrollHeight;
        mode = 'done';
        sync();
        return;
      }
      // a branch beat (the recovery loop) jumps back to its target gate
      if (beat.goto != null) {
        idx = beat.goto;
        if (!instant) await sleep(BEAT_MS);
        continue;
      }
      idx += 1;
      if (!instant && autoplay) await sleep(BEAT_MS);
    }
    if (my === token) {
      if (!autoplay) mode = 'paused';
      sync();
    }
  }

  runBtn.addEventListener('click', () => {
    if (mode === 'done' || mode === 'idle') hardReset();
    mode = 'running';
    sync();
    run(idx, { autoplay: true });
  });

  stepBtn.addEventListener('click', () => {
    if (mode === 'idle') hardReset();
    mode = 'running'; // lock both buttons until the beat finishes rendering
    sync();
    run(idx, { autoplay: false, upto: idx });
  });

  // deep link: #sim=N renders the run up to beat N instantly (shareable states)
  const deep = window.location.hash.match(/^#sim=(\d+)$/);
  if (deep) {
    hardReset();
    run(0, { instant: true, autoplay: false, upto: Math.min(Number(deep[1]), BEATS.length - 1), autoGates: true });
  } else {
    sync();
  }
})();
