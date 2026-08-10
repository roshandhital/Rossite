/* =========================================================
   Roshan Dhital — portfolio motion
   Vanilla JS. No dependencies. Every feature is isolated so
   one failure can never blank the page.
   ========================================================= */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var mod360 = function (v) { return ((v % 360) + 360) % 360; };

  /* Run a block in isolation. One broken feature must never take the page
     down with it — a failure here should cost an animation, not the content. */
  function safe(name, fn) {
    try { fn(); }
    catch (err) { console.warn('[site] ' + name + ' failed:', err); reveal(); }
  }

  /* Last resort: make every hidden element visible. */
  function reveal() {
    $$('[data-anim]').forEach(function (n) { n.classList.add('in'); });
    $$('.mask__i').forEach(function (n) { n.style.transform = 'none'; });
    var l = $('#loader');
    if (l) l.classList.add('is-done');
    document.body.classList.remove('is-locked');
  }

  /* Failsafe timer: whatever happens, nothing stays invisible past 4 seconds. */
  setTimeout(reveal, 4000);

  /* ---------- 1. Loader ---------- */
  safe('loader', function () {
    var box = $('#loader'), num = $('#loaderNum');
    if (!box) { start(); return; }

    if (reduced) { box.classList.add('is-done'); start(); return; }

    document.body.classList.add('is-locked');
    var t0 = performance.now(), dur = 1900;

    (function tick(now) {
      var p = Math.min((now - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      if (num) num.textContent = Math.round(eased * 100);
      if (p < 1) requestAnimationFrame(tick);
      else {
        box.classList.add('is-done');
        document.body.classList.remove('is-locked');
        start();
      }
    })(t0);
  });

  /* hero entrance, once the loader clears */
  function start() {
    var items = $$('.mask__i');
    items.forEach(function (n, i) {
      if (reduced) { n.style.transform = 'none'; return; }
      setTimeout(function () {
        n.style.transition = 'transform 1.05s cubic-bezier(.22,.9,.28,1)';
        n.style.transform = 'translateY(0)';
      }, 90 * i);
    });

    $$('.hero [data-anim]').forEach(function (n, i) {
      setTimeout(function () { n.classList.add('in'); }, 340 + 110 * i);
    });

    scramble();
  }

  /* ---------- 2. Scramble text ---------- */
  function scramble() {
    var node = $('[data-scramble]');
    if (!node || reduced) return;
    var target = node.getAttribute('data-scramble');
    var chars = '!<>-_\\/[]{}—=+*^?#01';
    var frame = 0, queue = [];

    for (var i = 0; i < target.length; i++) {
      queue.push({
        to: target[i],
        start: Math.floor(Math.random() * 18),
        end: Math.floor(Math.random() * 18) + 18
      });
    }

    (function run() {
      var out = '', done = 0;
      for (var i = 0; i < queue.length; i++) {
        var q = queue[i];
        if (frame >= q.end) { done++; out += q.to; }
        else if (frame >= q.start) out += chars[(Math.random() * chars.length) | 0];
        else out += ' ';
      }
      node.textContent = out;
      if (done < queue.length) { frame++; requestAnimationFrame(run); }
      else node.textContent = target;
    })();
  }

  /* ---------- 3. Split headings into masked lines ---------- */
  safe('split', function () {
    $$('[data-anim="lines"]').forEach(function (h) {
      var parts = h.innerHTML.split(/<br\s*\/?>/i);
      h.innerHTML = parts.map(function (p) {
        return '<span class="ln"><i>' + p.trim() + '</i></span>';
      }).join('');
    });
  });

  /* ---------- 4. Scroll reveals ---------- */
  safe('reveals', function () {
    var anims = $$('[data-anim]').filter(function (n) { return !n.closest('.hero'); });
    if (reduced || !('IntersectionObserver' in window)) {
      anims.forEach(function (n) { n.classList.add('in'); });
    } else {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          var sibs = $$('[data-anim]', e.target.parentNode);
          var i = Math.max(0, sibs.indexOf(e.target));
          setTimeout(function () { e.target.classList.add('in'); }, i * 90);
          io.unobserve(e.target);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
      anims.forEach(function (n) { io.observe(n); });
    }
  });

  /* ---------- 5. Marquee ---------- */
  safe('marquee', function () {
    var row = $('#marquee');
    if (!row) return;
    var words = ['Incident response', 'Networks', 'Cloud &amp; identity',
                 'Endpoints', 'Documentation', 'Melbourne'];
    var block = words.map(function (w) { return '<span>' + w + '<i></i></span>'; }).join('');
    row.innerHTML = block + block;
  });

  /* ---------- 6. Cursor + magnetic ---------- */
  safe('cursor', function () {
    var el = $('#cursor');
    if (!el || reduced) return;
    if (!window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;

    var r = $('.cursor__r', el);
    var tx = innerWidth / 2, ty = innerHeight / 2, rx = tx, ry = ty, vx = 0, vy = 0;

    addEventListener('pointermove', function (e) { tx = e.clientX; ty = e.clientY; }, { passive: true });

    (function loop() {
      vx = (vx + (tx - rx) * 0.13) * 0.74;
      vy = (vy + (ty - ry) * 0.13) * 0.74;
      rx += vx; ry += vy;
      r.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';
      requestAnimationFrame(loop);
    })();

    $$('a, button').forEach(function (n) {
      n.addEventListener('pointerenter', function () { el.classList.add('is-big'); });
      n.addEventListener('pointerleave', function () { el.classList.remove('is-big'); });
    });

    $$('[data-magnet]').forEach(function (n) {
      n.addEventListener('pointermove', function (e) {
        var b = n.getBoundingClientRect();
        var ox = Math.max(-12, Math.min(12, (e.clientX - (b.left + b.width / 2)) * 0.3));
        var oy = Math.max(-12, Math.min(12, (e.clientY - (b.top + b.height / 2)) * 0.3));
        n.style.transform = 'translate(' + ox.toFixed(1) + 'px,' + oy.toFixed(1) + 'px)';
      });
      n.addEventListener('pointerleave', function () { n.style.transform = ''; });
    });
  });

  /* ---------- 7. Tile tilt + spotlight ---------- */
  safe('tilt', function () {
    $$('[data-tilt]').forEach(function (n) {
      n.addEventListener('pointermove', function (e) {
        var b = n.getBoundingClientRect();
        var px = (e.clientX - b.left) / b.width;
        var py = (e.clientY - b.top) / b.height;
        n.style.setProperty('--px', (px * 100).toFixed(1) + '%');
        n.style.setProperty('--py', (py * 100).toFixed(1) + '%');
        if (reduced) return;
        n.style.transform = 'perspective(800px) rotateY(' + ((px - .5) * 8).toFixed(2) +
                            'deg) rotateX(' + ((.5 - py) * 8).toFixed(2) + 'deg) translateY(-3px)';
      });
      n.addEventListener('pointerleave', function () { n.style.transform = ''; });
    });
  });

  /* ---------- 8b. Respect reduced motion for the SMIL packet animation ----------
     CSS animation:none cannot touch SVG SMIL (<animateMotion>) — it has to be
     stopped through the SVG DOM directly. */
  safe('netIcon', function () {
    if (!reduced) return;
    $$('.icon--net animateMotion').forEach(function (a) {
      a.setAttribute('repeatCount', '1');
      a.setAttribute('dur', '0.001s');
    });
  });

  /* ---------- 8. Blueprint grid parallax ---------- */
  safe('gridParallax', function () {
    var g = $('#gridBg');
    if (!g || reduced) return;
    var tx = 0, ty = 0, cx = 0, cy = 0;

    addEventListener('pointermove', function (e) {
      tx = (e.clientX / innerWidth - 0.5) * 22;
      ty = (e.clientY / innerHeight - 0.5) * 22;
    }, { passive: true });

    (function loop() {
      cx = lerp(cx, tx, 0.05); cy = lerp(cy, ty, 0.05);
      g.style.transform = 'translate(' + cx.toFixed(2) + 'px,' + cy.toFixed(2) + 'px)';
      requestAnimationFrame(loop);
    })();
  });

  /* ---------- 9. Interactive die ---------- */
  safe('die', function () {
    var die = $('#die'), result = $('#dieResult'), rollBtn = $('#dieRoll'), hint = $('#dieHint');
    if (!die || !result) return;

    /* Target rotation for each face to land facing the camera — the exact
       inverse of that face's own placement transform in the CSS, so this is
       correct regardless of which rotation-sign convention the browser uses. */
    var TARGET = {
      1: { x: 0,   y: 0   },
      6: { x: 0,   y: 180 },
      3: { x: 0,   y: 90  },
      4: { x: 0,   y: -90 },
      2: { x: -90, y: 0   },
      5: { x: 90,  y: 0   }
    };
    var LABEL = {
      1: 'Support — Level 2 tickets, triaged and closed.',
      2: 'Cloud & identity — Azure, Active Directory, Intune.',
      3: 'Networks — switching, filtering, access control.',
      4: 'Systems — Windows, macOS, Linux, and some Python.',
      5: 'Always-on — rostered shifts, 24/7 coverage.',
      6: 'Six — ask me about the chess in the footer sometime.'
    };

    var curX = -18, curY = 28;   /* matches the CSS idle base, for a clean first roll */
    var lastFace = null, rollTimer = null, busy = false;

    function pickFace() {
      var pool = [1, 2, 3, 4, 5, 6].filter(function (f) { return f !== lastFace; });
      return pool[(Math.random() * pool.length) | 0];
    }

    function roll() {
      if (busy) return;
      busy = true;

      var face = pickFace();
      var t = TARGET[face];
      var turnsX = 2 + ((Math.random() * 2) | 0);
      var turnsY = 3 + ((Math.random() * 2) | 0);
      var dirX = Math.random() < 0.5 ? -1 : 1;
      var dirY = Math.random() < 0.5 ? -1 : 1;

      var newX = curX + dirX * turnsX * 360 + (t.x - mod360(curX));
      var newY = curY + dirY * turnsY * 360 + (t.y - mod360(curY));

      die.classList.add('is-rolling');
      die.style.transform = 'rotateX(' + newX + 'deg) rotateY(' + newY + 'deg)';
      curX = newX; curY = newY; lastFace = face;

      result.textContent = LABEL[face];
      if (hint) hint.textContent = 'Click again, or press Enter';

      clearTimeout(rollTimer);
      rollTimer = setTimeout(function () {
        die.classList.remove('is-rolling');
        die.classList.add('is-hit');
        setTimeout(function () { die.classList.remove('is-hit'); busy = false; }, 420);
      }, reduced ? 60 : 1080);
    }

    die.addEventListener('click', roll);
    die.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); roll(); }
    });
    if (rollBtn) rollBtn.addEventListener('click', roll);
  });

  /* ---------- 10. Work rail scroll progress ---------- */
  safe('rail', function () {
    var rail = $('#rail'), dot = $('#railDot');
    if (!rail || !dot || reduced) return;
    var ticking = false;

    function update() {
      var r = rail.getBoundingClientRect();
      var vh = innerHeight;
      var span = r.height + vh * 0.5;
      var p = (vh * 0.75 - r.top) / span;
      p = Math.max(0, Math.min(1, p));
      dot.style.top = (p * 100) + '%';
      ticking = false;
    }
    addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }, { passive: true });
    update();
  });

  /* ---------- 11. Rings (about section stats) ---------- */
  safe('rings', function () {
    function count(el) {
      var target = parseFloat(el.getAttribute('data-count')) || 0;
      var suf = el.getAttribute('data-suf') || '';
      var out = el.querySelector('b');
      if (!out) return;
      if (reduced) { out.textContent = target + suf; return; }
      var t0 = performance.now(), dur = 1400;
      (function tick(now) {
        var p = Math.min((now - t0) / dur, 1);
        out.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suf;
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    }
    var rings = $$('.ring');
    if ('IntersectionObserver' in window) {
      var ro = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('in'); count(e.target); ro.unobserve(e.target); }
        });
      }, { threshold: 0.5 });
      rings.forEach(function (r) { ro.observe(r); });
    } else rings.forEach(function (r) { r.classList.add('in'); count(r); });
  });

  /* ---------- 12. Nav, scrollspy, top button ---------- */
  safe('nav', function () {
    var nav = $('#nav'), topBtn = $('#top-btn'), menu = $('#menu');
    var links = $$('[data-nav]');
    var secs = links.map(function (a) { return $(a.getAttribute('href')); }).filter(Boolean);

    addEventListener('scroll', function () {
      var y = scrollY;
      if (nav) nav.classList.toggle('is-stuck', y > 30);
      if (topBtn) topBtn.classList.toggle('on', y > 600);
      var cur = null;
      secs.forEach(function (s) { if (s.getBoundingClientRect().top <= 160) cur = s.id; });
      links.forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + cur); });
    }, { passive: true });

    if (menu && nav) {
      menu.addEventListener('click', function () {
        var open = nav.classList.toggle('open');
        menu.setAttribute('aria-expanded', String(open));
      });
      links.forEach(function (a) {
        a.addEventListener('click', function () {
          nav.classList.remove('open');
          menu.setAttribute('aria-expanded', 'false');
        });
      });
    }

    if (topBtn) topBtn.addEventListener('click', function () {
      scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    });
  });

  /* ---------- 13. Copy email ---------- */
  safe('mail', function () {
    var toastEl = $('#toast'), tT;
    function toast(m) {
      if (!toastEl) return;
      toastEl.textContent = m;
      toastEl.classList.add('up');
      clearTimeout(tT);
      tT = setTimeout(function () { toastEl.classList.remove('up'); }, 2100);
    }
    var mail = $('#copyMail');
    if (mail) mail.addEventListener('click', function () {
      var v = mail.getAttribute('data-mail') || '';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(v).then(
          function () { toast('Copied to clipboard'); },
          function () { toast('Copy failed — select it manually'); }
        );
      } else toast('Copy not supported here');
    });
  });

  var y = $('#year');
  if (y) y.textContent = new Date().getFullYear();
})();
