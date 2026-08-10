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

  /* ---------- 9. Node sphere — canvas, pure math, no WebGL ---------- */
  safe('sphere', function () {
    var canvas = $('#sphere');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;                       /* CSS glow + rings still show */

    var COLORS = ['47,111,237', '34,211,238', '110,231,183'];  /* cobalt, cyan, mint */
    var N = 70;
    var pts = [];
    for (var i = 0; i < N; i++) {
      /* Fibonacci lattice — evenly spaced points on a unit sphere */
      var yv = 1 - (i / (N - 1)) * 2;
      var rv = Math.sqrt(Math.max(0, 1 - yv * yv));
      var theta = i * 2.399963;             /* golden angle */
      pts.push({
        x: Math.cos(theta) * rv, y: yv, z: Math.sin(theta) * rv,
        c: COLORS[i % COLORS.length]
      });
    }

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0, h = 0, cx = 0, cy = 0, radius = 0;
    var rotY = 0.4, rotX = 0.25;
    var tiltX = 0, tiltY = 0;

    function size() {
      var b = canvas.getBoundingClientRect();
      w = b.width; h = b.height;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = w / 2; cy = h / 2; radius = Math.min(w, h) * 0.42;
    }

    canvas.addEventListener('pointermove', function (e) {
      var b = canvas.getBoundingClientRect();
      var px = (e.clientX - b.left) / b.width - 0.5;
      var py = (e.clientY - b.top) / b.height - 0.5;
      tiltX = py * 0.6; tiltY = px * 0.6;
    });
    canvas.addEventListener('pointerleave', function () { tiltX = 0; tiltY = 0; });

    function project(p, ry, rx) {
      var x1 = p.x * Math.cos(ry) - p.z * Math.sin(ry);
      var z1 = p.x * Math.sin(ry) + p.z * Math.cos(ry);
      var y2 = p.y * Math.cos(rx) - z1 * Math.sin(rx);
      var z2 = p.y * Math.sin(rx) + z1 * Math.cos(rx);
      var d = 2.6;
      var scale = d / (d - z2);
      return { sx: cx + x1 * radius * scale, sy: cy + y2 * radius * scale, z: z2 };
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);
      rotY += 0.0022; rotX = 0.22 + tiltX;
      var ry = rotY + tiltY;

      var proj = pts.map(function (p) { return project(p, ry, rotX); });

      for (var i = 0; i < proj.length; i++) {
        for (var j = i + 1; j < proj.length; j++) {
          var dx = proj[i].sx - proj[j].sx, dy = proj[i].sy - proj[j].sy;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < radius * 0.62) {
            var avgZ = (proj[i].z + proj[j].z) / 2;
            var op = Math.max(0, (avgZ + 1) / 2) * 0.35;
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(90,140,255,' + op.toFixed(3) + ')';
            ctx.lineWidth = 1;
            ctx.moveTo(proj[i].sx, proj[i].sy);
            ctx.lineTo(proj[j].sx, proj[j].sy);
            ctx.stroke();
          }
        }
      }

      var order = proj.map(function (_, i) { return i; })
                       .sort(function (a, b) { return proj[a].z - proj[b].z; });
      order.forEach(function (i) {
        var p = proj[i], src = pts[i];
        var depth = (p.z + 1) / 2;
        var rad = 1.3 + depth * 2.4;
        ctx.beginPath();
        ctx.fillStyle = 'rgba(' + src.c + ',' + (0.35 + depth * 0.65).toFixed(3) + ')';
        ctx.arc(p.sx, p.sy, rad, 0, Math.PI * 2);
        ctx.fill();
        if (depth > 0.82) {
          ctx.beginPath();
          ctx.fillStyle = 'rgba(' + src.c + ',.16)';
          ctx.arc(p.sx, p.sy, rad * 3.2, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }

    size();

    if (reduced) { frame(); return; }

    var raf = null, active = true;
    function loop() { frame(); raf = requestAnimationFrame(loop); }
    function play()  { if (!raf && active && !document.hidden) raf = requestAnimationFrame(loop); }
    function pause() { if (raf) { cancelAnimationFrame(raf); raf = null; } }

    play();

    var rt;
    addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(size, 180); });
    document.addEventListener('visibilitychange', function () { document.hidden ? pause() : play(); });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        active = es[0].isIntersecting;
        active ? play() : pause();
      }, { threshold: 0.01 }).observe(canvas);
    }
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
