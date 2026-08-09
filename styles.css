/* =========================================================
   Roshan Dhital — portfolio behaviour
   Vanilla JS, no dependencies.
   ========================================================= */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------------------------------------------------
     1. Year + toast helper
     --------------------------------------------------- */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  var toastEl = $('#toast');
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('is-up');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove('is-up');
    }, 2200);
  }

  /* ---------------------------------------------------
     2. Sticky nav, scrollspy, mobile menu, back to top
     --------------------------------------------------- */
  var nav = $('#nav');
  var toTop = $('#toTop');
  var navLinks = $$('[data-nav]');
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  function onScroll() {
    var y = window.scrollY;
    if (nav) nav.classList.toggle('is-stuck', y > 20);
    if (toTop) toTop.classList.toggle('is-on', y > 700);

    var current = null;
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].getBoundingClientRect().top <= 120) current = sections[i].id;
    }
    navLinks.forEach(function (a) {
      a.classList.toggle('is-active', a.getAttribute('href') === '#' + current);
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    });
  }

  var navToggle = $('#navToggle');
  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
    navLinks.forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------------------------------------------------
     3. Scroll reveal
     --------------------------------------------------- */
  var revealables = $$('.tl, .habit');
  if (reduced || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          revealObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealables.forEach(function (el) { revealObs.observe(el); });
  }

  /* ---------------------------------------------------
     4. Counting stats
     --------------------------------------------------- */
  function countUp(el) {
    var target = parseFloat(el.getAttribute('data-count')) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    var out = $('.stat__num', el);
    if (!out) return;

    if (reduced) { out.textContent = target + suffix; return; }

    var start = performance.now();
    var dur = 1300;
    function tick(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      out.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  var stats = $$('.stat');
  if (!('IntersectionObserver' in window)) {
    stats.forEach(countUp);
  } else {
    var statObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { countUp(e.target); statObs.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    stats.forEach(function (el) { statObs.observe(el); });
  }

  /* ---------------------------------------------------
     5. Capability filters
     --------------------------------------------------- */
  var filters = $$('.filter');
  var cards = $$('#skillGrid .card');
  var gridEmpty = $('#gridEmpty');

  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var want = btn.getAttribute('data-filter');
      filters.forEach(function (b) { b.classList.toggle('is-on', b === btn); });

      var shown = 0;
      cards.forEach(function (card) {
        var match = want === 'all' || card.getAttribute('data-cat') === want;
        card.classList.toggle('is-hidden', !match);
        if (match) shown++;
      });
      if (gridEmpty) gridEmpty.hidden = shown !== 0;
    });
  });

  /* ---------------------------------------------------
     6. Copy email
     --------------------------------------------------- */
  var copyBtn = $('#copyMail');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var mail = copyBtn.getAttribute('data-mail') || '';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(mail).then(
          function () { toast('Email address copied'); },
          function () { toast('Copy failed — select the text instead'); }
        );
      } else {
        toast('Copy is unavailable in this browser');
      }
    });
  }

  /* ---------------------------------------------------
     7. Hero network canvas
     --------------------------------------------------- */
  var canvas = $('#net');
  if (canvas && canvas.getContext && !reduced) {
    var ctx = canvas.getContext('2d');
    var nodes = [];
    var w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var raf = null;

    function size() {
      var rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var count = Math.round(Math.min(70, Math.max(24, (w * h) / 22000)));
      nodes = [];
      for (var i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.22,
          vy: (Math.random() - 0.5) * 0.22,
          r: Math.random() * 1.6 + 0.7
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);

      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;

        for (var j = i + 1; j < nodes.length; j++) {
          var m = nodes[j];
          var dx = n.x - m.x, dy = n.y - m.y;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d < 130) {
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(82,208,196,' + (0.16 * (1 - d / 130)).toFixed(3) + ')';
            ctx.lineWidth = 1;
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(m.x, m.y);
            ctx.stroke();
          }
        }

        ctx.beginPath();
        ctx.fillStyle = 'rgba(245,165,36,.5)';
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    }

    size();
    draw();

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(size, 180);
    });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        if (raf) { cancelAnimationFrame(raf); raf = null; }
      } else if (!raf) {
        raf = requestAnimationFrame(draw);
      }
    });
  }

  /* ---------------------------------------------------
     8. Triage console
     --------------------------------------------------- */
  var body = $('#termBody');
  var input = $('#termInput');
  var clock = $('#termClock');

  if (clock) {
    setInterval(function () {
      clock.textContent = new Date().toLocaleTimeString('en-AU', { hour12: false });
    }, 1000);
  }

  var HELP = [
    ['whoami', 'who I am and what I do'],
    ['skills', 'tools I use in production'],
    ['experience', 'roles and dates'],
    ['education', 'degree and study'],
    ['projects', 'things I have built'],
    ['scan', 'run a mock triage sweep'],
    ['contact', 'how to reach me'],
    ['uptime', 'how long I have been at this'],
    ['clear', 'wipe the console'],
    ['help', 'show this list']
  ];

  var RESPONSES = {
    whoami: [
      'Roshan Dhital',
      'IT Operations Analyst — Crown Melbourne',
      'Melbourne, Victoria, Australia',
      '',
      'Level 2 incident response across gaming, hospitality and corporate',
      'systems. Firewall and web filtering review, endpoint access control,',
      'network troubleshooting.'
    ],
    skills: [
      'SECURITY & NETWORK',
      '  Check Point SmartConsole, Forcepoint, Aruba ClearPass,',
      '  SecureCRT, Cisco Call Manager',
      '',
      'CLOUD & IDENTITY',
      '  Microsoft Azure, Active Directory, Intune, AVD,',
      '  Workspace ONE, Exchange Admin Center',
      '',
      'OPERATIONS',
      '  ServiceNow, Confluence, Ninja RMM, Auvik',
      '',
      'CODE',
      '  Python, JavaScript, HTML/CSS, Git'
    ],
    experience: [
      '2023-11 → now     IT Operations Analyst     Crown Melbourne',
      '2023-05 → 2023-10 IT Support Intern         ATMC',
      '2019-11 → 2022-10 BIT                       Federation University'
    ],
    education: [
      'Bachelor of Information Technology',
      'Federation University Australia — 2019 to 2022',
      '',
      'Networking and information security, cloud computing,',
      'systems analysis, web development, OOP.'
    ],
    projects: [
      'Barcode-scanning retail prototype (university, 2022)',
      '  InVision, HTML, CSS, JavaScript, Python, MySQL.',
      '  Judged best of seven prototypes in the cohort.',
      '',
      'This site',
      '  Hand-written HTML, CSS and JavaScript. No frameworks.'
    ],
    contact: [
      'email     Rsondhtl.50@gmail.com',
      'linkedin  linkedin.com/in/roshan-dhital',
      'location  Melbourne, VIC',
      '',
      'Open to cybersecurity and security operations roles.'
    ],
    uptime: function () {
      var start = new Date(2023, 4, 1);       // May 2023, first IT role
      var days = Math.floor((Date.now() - start) / 86400000);
      return ['In IT operations for ' + days + ' days.'];
    }
  };

  function line(text, cls) {
    if (!body) return;
    var p = document.createElement('p');
    p.className = 'ln ' + (cls || 'ln--out');
    p.textContent = text;
    body.appendChild(p);
    body.scrollTop = body.scrollHeight;
    return p;
  }

  function echo(lines, cls) {
    lines.forEach(function (t) { line(t, cls); });
  }

  function printHelp() {
    line('Available commands:', 'ln--key');
    HELP.forEach(function (pair) {
      var pad = pair[0] + '            '.slice(0, Math.max(1, 13 - pair[0].length));
      line('  ' + pad + pair[1]);
    });
  }

  /* mock triage sweep — deliberately fictional, purely presentational */
  function runScan() {
    var steps = [
      ['Starting triage sweep...', 'ln--key'],
      ['  [ok]   queue reachable', 'ln--out'],
      ['  [ok]   17 open incidents', 'ln--out'],
      ['  [warn] 3 awaiting vendor response', 'ln--warn'],
      ['  [ok]   0 breached SLAs', 'ln--out'],
      ['  [ok]   documentation current', 'ln--out'],
      ['Sweep complete.', 'ln--key']
    ];
    if (reduced) { steps.forEach(function (s) { line(s[0], s[1]); }); return; }

    var i = 0;
    (function next() {
      if (i >= steps.length) return;
      line(steps[i][0], steps[i][1]);
      i++;
      setTimeout(next, 260);
    })();
  }

  var history = [];
  var histIdx = -1;

  function run(raw) {
    var cmd = String(raw || '').trim().toLowerCase();
    if (!cmd) return;

    var p = line('', 'ln--cmd');
    if (p) {
      var b = document.createElement('b');
      b.textContent = '› ';
      p.appendChild(b);
      p.appendChild(document.createTextNode(cmd));
    }

    history.push(cmd);
    histIdx = history.length;

    if (cmd === 'clear') { body.innerHTML = ''; return; }
    if (cmd === 'help') { printHelp(); return; }
    if (cmd === 'scan') { runScan(); return; }

    if (cmd === 'sudo' || cmd.indexOf('sudo ') === 0) {
      line('Permission denied.', 'ln--warn');
      return;
    }

    var res = RESPONSES[cmd];
    if (typeof res === 'function') { echo(res()); return; }
    if (res) { echo(res); return; }

    line('Unknown command: ' + cmd, 'ln--warn');
    line('Type help for the list.');
  }

  if (input && body) {
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        run(input.value);
        input.value = '';
        line('', 'ln--sp');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (histIdx > 0) { histIdx--; input.value = history[histIdx] || ''; }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (histIdx < history.length - 1) { histIdx++; input.value = history[histIdx] || ''; }
        else { histIdx = history.length; input.value = ''; }
      }
    });

    $$('.chip').forEach(function (c) {
      c.addEventListener('click', function () {
        run(c.getAttribute('data-cmd'));
        line('', 'ln--sp');
        input.focus();
      });
    });

    var termBox = $('#term');
    if (termBox) {
      termBox.addEventListener('click', function (e) {
        if (e.target.tagName !== 'INPUT') input.focus();
      });
    }

    /* opening banner */
    line('Roshan Dhital — triage console', 'ln--key');
    line('Melbourne, Australia');
    line('');
    line('Type help for commands, or click one below.');
    line('', 'ln--sp');
  }
})();
