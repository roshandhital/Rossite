/* =========================================================
   Roshan Dhital — quiz edition
   Vanilla JS. No dependencies.
   ========================================================= */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- year + toast ---------- */
  var y = $('#year'); if (y) y.textContent = new Date().getFullYear();

  var toastEl = $('#toast'), toastT;
  function toast(m) {
    if (!toastEl) return;
    toastEl.textContent = m;
    toastEl.classList.add('is-up');
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove('is-up'); }, 2200);
  }

  /* ---------- nav ---------- */
  var nav = $('#nav'), burger = $('#burger');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
    });
  }
  var navLinks = $$('[data-nav]');
  var secs = navLinks.map(function (a) { return $(a.getAttribute('href')); }).filter(Boolean);
  window.addEventListener('scroll', function () {
    var cur = null;
    secs.forEach(function (s) { if (s.getBoundingClientRect().top <= 160) cur = s.id; });
    navLinks.forEach(function (a) {
      a.classList.toggle('is-active', a.getAttribute('href') === '#' + cur);
    });
    if (nav) nav.classList.remove('is-open');
  }, { passive: true });

  /* ---------- ticker ---------- */
  (function ticker() {
    var row = $('#tickerRow');
    if (!row) return;
    var items = [
      ['Wi-Fi', 'stands for nothing at all'],
      ['Bluetooth', 'is named after a Viking king'],
      ['1956', 'first hard drive: 5MB and a forklift'],
      ['A coffee pot', 'was the first thing on a webcam'],
      ['1971', 'email is older than the web'],
      ['A moth', 'is why we say "bug"'],
      ['Paper', 'was Nokia\u2019s original business'],
      ['BackRub', 'was Google\u2019s first name']
    ];
    var html = items.map(function (i) {
      return '<span><b>' + i[0] + '</b> ' + i[1] + '</span>';
    }).join('');
    row.innerHTML = html + html;          /* duplicated for seamless loop */
  })();

  /* ---------- flip cards (click + keyboard) ---------- */
  $$('[data-flip]').forEach(function (card) {
    card.setAttribute('aria-pressed', 'false');
    card.addEventListener('click', function () {
      var open = card.classList.toggle('is-open');
      card.setAttribute('aria-pressed', String(open));
    });
  });

  /* ---------- 3D tilt on hover ---------- */
  function tilt(node, max) {
    if (reduced) return;
    if (!window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    var base = node.dataset.base || '';
    node.addEventListener('pointermove', function (e) {
      var r = node.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      node.style.transform = base +
        ' perspective(900px) rotateY(' + (px * max).toFixed(2) + 'deg)' +
        ' rotateX(' + (-py * max).toFixed(2) + 'deg)';
    });
    node.addEventListener('pointerleave', function () { node.style.transform = base; });
  }

  $$('[data-tilt]').forEach(function (n) { tilt(n, 9); });

  /* hero stack: keep each card's base rotation, add parallax on mouse */
  (function heroStack() {
    var stack = $('#stack');
    if (!stack || reduced) return;
    var cards = $$('.stack__card', stack);
    var bases = ['rotate(-8deg) translateZ(0px)', 'rotate(3deg) translateZ(40px)', 'rotate(10deg) translateZ(80px)'];

    stack.addEventListener('pointermove', function (e) {
      var r = stack.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      cards.forEach(function (c, i) {
        var depth = (i + 1) * 6;
        c.style.transform = 'translate(-50%,-50%) ' + bases[i] +
          ' rotateY(' + (px * depth).toFixed(2) + 'deg)' +
          ' rotateX(' + (-py * depth).toFixed(2) + 'deg)' +
          ' translate(' + (px * depth * 1.6).toFixed(1) + 'px,' + (py * depth * 1.6).toFixed(1) + 'px)';
      });
    });
    stack.addEventListener('pointerleave', function () {
      cards.forEach(function (c, i) { c.style.transform = 'translate(-50%,-50%) ' + bases[i]; });
    });
  })();

  /* ---------- copy email ---------- */
  var copyBtn = $('#copyMail');
  if (copyBtn) copyBtn.addEventListener('click', function () {
    var m = copyBtn.getAttribute('data-mail') || '';
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(m).then(
        function () { toast('Copied — go on then'); },
        function () { toast('Copy failed, select it manually'); }
      );
    } else toast('Copy not supported here');
  });

  /* =========================================================
     QUIZ
     ========================================================= */
  var QUESTIONS = [
    {
      q: 'The @ symbol was chosen for email addresses because...',
      opts: [
        'It means "at" in Latin',
        'It was sitting unused on the keyboard',
        'It was the shortest key to reach',
        'It stood for "address"'
      ],
      a: 1,
      why: 'In 1971 Ray Tomlinson needed a character that would never appear in someone\'s name, so he looked down at his keyboard and picked the one nobody was using. That is genuinely the whole story. It now appears billions of times a day.'
    },
    {
      q: 'Which of these is older?',
      opts: [
        'The World Wide Web',
        'Networked email',
        'The first iPhone',
        'The USB port'
      ],
      a: 1,
      why: 'Email came first, in 1971. The web was not proposed until 1989. This trips people up because we treat "the internet" and "the web" as the same thing — the internet is the road network, the web is one very popular type of vehicle on it.'
    },
    {
      q: 'The QWERTY keyboard layout exists because...',
      opts: [
        'It is the fastest arrangement for human hands',
        'It stopped early typewriter arms from jamming',
        'It was alphabetical originally and got shuffled by mistake',
        'A committee voted on it'
      ],
      a: 1,
      why: 'On mechanical typewriters, letters typed in quick succession jammed if their arms sat next to each other, so common pairs were spread apart. You often hear it was designed to slow typists down — that is the myth version. We kept it because millions of people had already learned it.'
    },
    {
      q: 'Roughly how much did the first commercial hard drive hold?',
      opts: [
        'About 5 megabytes',
        'About 5 gigabytes',
        'About 500 megabytes',
        'About 50 kilobytes'
      ],
      a: 0,
      why: 'IBM\'s 1956 RAMAC stored around 5 MB — roughly one photo from a modern phone. It weighed about a ton and was moved by forklift. Your phone holds tens of thousands of times more and fits in a pocket.'
    },
    {
      q: 'What does the "www" in a web address actually do these days?',
      opts: [
        'It is required for the site to work',
        'It makes the connection faster',
        'Almost nothing — it is a leftover naming habit',
        'It marks the site as secure'
      ],
      a: 2,
      why: 'It was originally just a name given to the machine serving web pages, the way you might name a server "mail" or "files". Most sites now work with or without it. It survives mostly out of habit and because people expect to see it.'
    },
    {
      q: 'Your phone battery lasts longest if you...',
      opts: [
        'Let it drain to 0% before charging',
        'Keep it roughly between 20% and 80%',
        'Charge it only overnight',
        'Close all your background apps constantly'
      ],
      a: 1,
      why: 'Modern lithium batteries dislike both extremes. Draining to zero is advice left over from older battery chemistry, and constantly force-closing apps can actually use more power, since reopening from scratch costs more than leaving them suspended.'
    }
  ];

  var slot = $('#quizSlot'), bar = $('#quizBar'), count = $('#quizCount');
  var done = $('#quizDone'), scoreEl = $('#quizScore'), verdictEl = $('#quizVerdict');
  var resetBtn = $('#quizReset');

  var idx = 0, score = 0, answered = false;

  function render() {
    if (!slot) return;
    answered = false;
    var Q = QUESTIONS[idx];

    if (count) count.textContent = 'Question ' + (idx + 1) + ' of ' + QUESTIONS.length;
    if (bar) bar.style.width = ((idx / QUESTIONS.length) * 100) + '%';

    slot.innerHTML = '';

    var h = document.createElement('p');
    h.className = 'qz__q';
    h.textContent = Q.q;
    slot.appendChild(h);

    if (Q.ctx) {
      var c = document.createElement('p');
      c.className = 'qz__ctx';
      c.textContent = Q.ctx;
      slot.appendChild(c);
    }

    var box = document.createElement('div');
    box.className = 'qz__opts';
    Q.opts.forEach(function (text, i) {
      var b = document.createElement('button');
      b.className = 'opt';
      b.type = 'button';
      b.textContent = text;
      b.addEventListener('click', function () { pick(i, box, Q); });
      box.appendChild(b);
    });
    slot.appendChild(box);
  }

  function pick(chosen, box, Q) {
    if (answered) return;
    answered = true;

    var btns = $$('.opt', box);
    btns.forEach(function (b, i) {
      b.disabled = true;
      if (i === Q.a) b.classList.add('is-right');
      else if (i === chosen) b.classList.add('is-wrong');
    });

    if (chosen === Q.a) score++;

    var why = document.createElement('div');
    why.className = 'qz__why';
    var strong = document.createElement('b');
    strong.textContent = chosen === Q.a ? 'Correct.' : 'Not quite.';
    why.appendChild(strong);
    why.appendChild(document.createTextNode(Q.why));
    slot.appendChild(why);

    var next = document.createElement('button');
    next.className = 'btn btn--pop qz__next';
    next.type = 'button';
    next.textContent = idx === QUESTIONS.length - 1 ? 'See my score →' : 'Next question →';
    next.addEventListener('click', function () {
      idx++;
      if (idx >= QUESTIONS.length) finish();
      else render();
    });
    slot.appendChild(next);
  }

  function finish() {
    if (bar) bar.style.width = '100%';
    if (count) count.textContent = 'Done';
    if (slot) slot.innerHTML = '';
    if (done) done.hidden = false;
    if (scoreEl) scoreEl.textContent = score + ' / ' + QUESTIONS.length;

    var msg;
    if (score === QUESTIONS.length) msg = 'Flawless. You are either in security already or you are lying.';
    else if (score >= 4) msg = 'Solid. You would survive most inboxes on most days.';
    else if (score >= 2) msg = 'Middling — which is roughly where most people sit, including some IT departments.';
    else msg = 'Please do not open any attachments today. Turn on MFA and we will say no more about it.';
    if (verdictEl) verdictEl.textContent = msg;

    if (score >= 4) confetti();
  }

  if (resetBtn) resetBtn.addEventListener('click', function () {
    idx = 0; score = 0;
    if (done) done.hidden = true;
    render();
    var box = $('#quizBox');
    if (box) box.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
  });

  if (slot) render();

  /* ---------- confetti ---------- */
  function confetti() {
    var cv = $('#confetti');
    if (!cv || reduced) return;
    var ctx = cv.getContext('2d');
    if (!ctx) return;

    var r = cv.getBoundingClientRect();
    cv.width = r.width; cv.height = r.height;

    var colours = ['#FF4D3D', '#FFC629', '#B6E82E', '#2B59FF', '#7B4DFF'];
    var bits = [];
    for (var i = 0; i < 90; i++) {
      bits.push({
        x: cv.width / 2, y: cv.height / 2,
        vx: (Math.random() - 0.5) * 11,
        vy: (Math.random() - 0.9) * 11,
        w: 5 + Math.random() * 6, h: 3 + Math.random() * 5,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        c: colours[(Math.random() * colours.length) | 0],
        life: 0
      });
    }

    (function frame() {
      ctx.clearRect(0, 0, cv.width, cv.height);
      var alive = false;
      bits.forEach(function (b) {
        b.life++;
        b.vy += 0.22;
        b.x += b.vx; b.y += b.vy; b.rot += b.vr;
        if (b.y < cv.height + 40) alive = true;
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.rot);
        ctx.fillStyle = b.c;
        ctx.globalAlpha = Math.max(0, 1 - b.life / 130);
        ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
        ctx.restore();
      });
      if (alive) requestAnimationFrame(frame);
      else ctx.clearRect(0, 0, cv.width, cv.height);
    })();
  }
})();
