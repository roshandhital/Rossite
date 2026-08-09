/* =========================================================
   Roshan Dhital — portfolio behaviour
   WebGL fragment shader · GSAP ScrollTrigger · spring physics
   · SVG morphing · vanilla console
   Every enhancement degrades safely if its dependency is missing.
   ========================================================= */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGSAP = typeof window.gsap !== 'undefined';
  var hasST   = hasGSAP && typeof window.ScrollTrigger !== 'undefined';

  document.documentElement.classList.add('js');
  if (!hasST) document.documentElement.classList.add('no-gsap');
  if (hasST) gsap.registerPlugin(ScrollTrigger);

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };

  /* =======================================================
     1. WebGL — animated fragment shader field
     Raw WebGL, no library. Silently removes itself on failure.
     ======================================================= */
  (function shaderField() {
    var canvas = $('#gl');
    if (!canvas || reduced) return;
    if (window.innerWidth < 720) return;              // skip on phones

    var gl = canvas.getContext('webgl', { antialias: false, alpha: true })
          || canvas.getContext('experimental-webgl');
    if (!gl) return;                                   // CSS gradient remains

    var VERT = [
      'attribute vec2 p;',
      'void main(){ gl_Position = vec4(p, 0.0, 1.0); }'
    ].join('\n');

    /* fbm noise field, warped by mouse and time */
    var FRAG = [
      'precision mediump float;',
      'uniform vec2  u_res;',
      'uniform vec2  u_mouse;',
      'uniform float u_time;',

      'float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }',

      'float noise(vec2 p){',
      '  vec2 i = floor(p); vec2 f = fract(p);',
      '  vec2 u = f * f * (3.0 - 2.0 * f);',
      '  return mix(mix(hash(i + vec2(0.0,0.0)), hash(i + vec2(1.0,0.0)), u.x),',
      '             mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), u.x), u.y);',
      '}',

      'float fbm(vec2 p){',
      '  float v = 0.0, a = 0.5;',
      '  for(int i = 0; i < 5; i++){ v += a * noise(p); p *= 2.02; a *= 0.5; }',
      '  return v;',
      '}',

      'void main(){',
      '  vec2 uv = gl_FragCoord.xy / u_res.xy;',
      '  vec2 asp = vec2(u_res.x / u_res.y, 1.0);',
      '  vec2 st = uv * asp * 2.4;',

      '  vec2 m = u_mouse * asp * 2.4;',
      '  float d = distance(st, m);',
      '  float pull = 0.35 / (1.0 + d * d * 3.0);',   // magnetic warp near cursor

      '  float t = u_time * 0.06;',
      '  vec2 q = vec2(fbm(st + t), fbm(st + vec2(3.2, 1.7) - t));',
      '  vec2 r = vec2(fbm(st + 3.0 * q + vec2(1.7, 9.2) + t * 1.4),',
      '                fbm(st + 3.0 * q + vec2(8.3, 2.8) - t * 1.1));',
      '  float f = fbm(st + 2.6 * r + pull * 4.0);',

      '  vec3 amber = vec3(0.96, 0.65, 0.14);',
      '  vec3 cyan  = vec3(0.32, 0.82, 0.77);',
      '  vec3 deep  = vec3(0.047, 0.071, 0.110);',

      '  vec3 col = mix(deep, cyan,  clamp(f * 1.15, 0.0, 1.0));',
      '  col = mix(col, amber, clamp(pow(r.x, 2.0) * 1.3 + pull * 0.7, 0.0, 1.0));',
      '  col += pull * 0.10;',

      '  float vig = smoothstep(1.25, 0.25, length(uv - 0.5));',
      '  col *= vig;',

      '  gl_FragColor = vec4(col, 0.92);',
      '}'
    ].join('\n');

    function compile(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.warn('shader:', gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    }

    var vs = compile(gl.VERTEX_SHADER, VERT);
    var fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;

    var prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    var uRes   = gl.getUniformLocation(prog, 'u_res');
    var uMouse = gl.getUniformLocation(prog, 'u_mouse');
    var uTime  = gl.getUniformLocation(prog, 'u_time');

    var mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var raf = null, visible = true;

    function size() {
      var r = canvas.getBoundingClientRect();
      canvas.width  = Math.max(1, Math.floor(r.width  * dpr));
      canvas.height = Math.max(1, Math.floor(r.height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    }

    window.addEventListener('pointermove', function (e) {
      var r = canvas.getBoundingClientRect();
      mouse.tx = (e.clientX - r.left) / r.width;
      mouse.ty = 1 - (e.clientY - r.top) / r.height;
    }, { passive: true });

    function frame(now) {
      mouse.x = lerp(mouse.x, mouse.tx, 0.06);        // eased follow
      mouse.y = lerp(mouse.y, mouse.ty, 0.06);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform1f(uTime, now * 0.001);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(frame);
    }

    size();
    canvas.classList.add('is-live');
    raf = requestAnimationFrame(frame);

    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt); rt = setTimeout(size, 180);
    });

    /* pause when off-screen or tab hidden — saves battery */
    function pause() { if (raf) { cancelAnimationFrame(raf); raf = null; } }
    function play()  { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame); }

    document.addEventListener('visibilitychange', function () {
      document.hidden ? pause() : play();
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        visible = es[0].isIntersecting;
        visible ? play() : pause();
      }, { threshold: 0.01 }).observe(canvas);
    }
  })();

  /* =======================================================
     2. Flashlight mask over the hero title (CSS mask + JS coords)
     ======================================================= */
  (function flashlight() {
    var title = $('#title');
    if (!title || reduced) return;
    var lit = $('.title__lit', title);
    if (!lit) return;

    var mx = -999, my = -999, cx = -999, cy = -999, running = false;

    title.addEventListener('pointermove', function (e) {
      var r = title.getBoundingClientRect();
      mx = e.clientX - r.left; my = e.clientY - r.top;
      if (!running) { running = true; requestAnimationFrame(tick); }
    });
    title.addEventListener('pointerleave', function () { mx = -999; my = -999; });

    function tick() {
      cx = lerp(cx < -500 ? mx : cx, mx, 0.18);
      cy = lerp(cy < -500 ? my : cy, my, 0.18);
      lit.style.setProperty('--mx', cx + 'px');
      lit.style.setProperty('--my', cy + 'px');
      requestAnimationFrame(tick);
    }
  })();

  /* =======================================================
     3. Spring-physics cursor + magnetic elements
     ======================================================= */
  (function physicsCursor() {
    var el = $('#cursor');
    if (!el || reduced) return;
    if (!window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;

    var dot = $('.cursor__dot', el);
    var ring = $('.cursor__ring', el);
    var tx = window.innerWidth / 2, ty = window.innerHeight / 2;
    var dx = tx, dy = ty;                    // dot: stiff spring
    var rx = tx, ry = ty, vrx = 0, vry = 0;  // ring: real spring w/ damping

    var K = 0.14, DAMP = 0.72;

    window.addEventListener('pointermove', function (e) {
      tx = e.clientX; ty = e.clientY;
    }, { passive: true });

    (function loop() {
      dx = lerp(dx, tx, 0.45);
      dy = lerp(dy, ty, 0.45);

      vrx = (vrx + (tx - rx) * K) * DAMP;
      vry = (vry + (ty - ry) * K) * DAMP;
      rx += vrx; ry += vry;

      dot.style.transform  = 'translate(' + dx + 'px,' + dy + 'px)';
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';
      requestAnimationFrame(loop);
    })();

    $$('a, button, input').forEach(function (n) {
      n.addEventListener('pointerenter', function () { el.classList.add('is-hot'); });
      n.addEventListener('pointerleave', function () { el.classList.remove('is-hot'); });
    });

    /* magnetic pull — GSAP quickTo when present, manual spring otherwise */
    $$('[data-magnet]').forEach(function (node) {
      var strength = 0.32, max = 14;
      var qx = hasGSAP ? gsap.quickTo(node, 'x', { duration: 0.5, ease: 'elastic.out(1,0.4)' }) : null;
      var qy = hasGSAP ? gsap.quickTo(node, 'y', { duration: 0.5, ease: 'elastic.out(1,0.4)' }) : null;

      node.addEventListener('pointermove', function (e) {
        var r = node.getBoundingClientRect();
        var ox = (e.clientX - (r.left + r.width / 2)) * strength;
        var oy = (e.clientY - (r.top + r.height / 2)) * strength;
        ox = Math.max(-max, Math.min(max, ox));
        oy = Math.max(-max, Math.min(max, oy));
        if (qx) { qx(ox); qy(oy); }
        else node.style.transform = 'translate(' + ox + 'px,' + oy + 'px)';
      });

      node.addEventListener('pointerleave', function () {
        if (qx) { qx(0); qy(0); }
        else node.style.transform = '';
      });
    });
  })();

  /* =======================================================
     4. SVG blob — continuous morph via generated path
     ======================================================= */
  (function morphBlob() {
    var path = $('#blobPath');
    if (!path) return;

    var N = 8, R = 108, CX = 150, CY = 150;
    var seeds = [];
    for (var i = 0; i < N; i++) {
      seeds.push({ a: Math.random() * Math.PI * 2, s: 0.5 + Math.random() * 0.7 });
    }

    function build(t) {
      var pts = [];
      for (var i = 0; i < N; i++) {
        var ang = (i / N) * Math.PI * 2;
        var wob = Math.sin(t * seeds[i].s + seeds[i].a) * 17;
        var rad = R + wob;
        pts.push([CX + Math.cos(ang) * rad, CY + Math.sin(ang) * rad]);
      }
      /* closed quadratic through midpoints — smooth at every joint */
      var d = '';
      for (var j = 0; j < N; j++) {
        var p0 = pts[j];
        var p1 = pts[(j + 1) % N];
        var p2 = pts[(j + 2) % N];
        if (j === 0) {
          var sx = (p0[0] + p1[0]) / 2, sy = (p0[1] + p1[1]) / 2;
          d = 'M' + sx.toFixed(1) + ',' + sy.toFixed(1);
        }
        var nx = (p1[0] + p2[0]) / 2, ny = (p1[1] + p2[1]) / 2;
        d += ' Q' + p1[0].toFixed(1) + ',' + p1[1].toFixed(1) +
             ' ' + nx.toFixed(1) + ',' + ny.toFixed(1);
      }
      return d + ' Z';
    }

    if (reduced) { path.setAttribute('d', build(0)); return; }

    var t0 = performance.now();
    (function spin(now) {
      path.setAttribute('d', build((now - t0) * 0.0006));
      requestAnimationFrame(spin);
    })(t0);
  })();

  /* =======================================================
     5. GSAP — scroll-linked reveals, split headings, pinned track
     ======================================================= */
  if (hasST && !reduced) {

    /* headings split into characters, staggered on entry */
    $$('[data-split]').forEach(function (h) {
      var text = h.textContent;
      h.textContent = '';
      var frag = document.createDocumentFragment();
      text.split('').forEach(function (ch) {
        var s = document.createElement('span');
        s.className = 'ch';
        s.textContent = ch === ' ' ? '\u00A0' : ch;
        frag.appendChild(s);
      });
      h.appendChild(frag);

      gsap.from(h.querySelectorAll('.ch'), {
        scrollTrigger: { trigger: h, start: 'top 85%' },
        yPercent: 110, opacity: 0, duration: 0.7,
        ease: 'power3.out', stagger: 0.022
      });
    });

    gsap.utils.toArray('[data-fade]').forEach(function (n) {
      gsap.to(n, {
        scrollTrigger: { trigger: n, start: 'top 90%' },
        opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
        startAt: { opacity: 0, y: 22 }
      });
    });

    gsap.utils.toArray('.tl').forEach(function (n) {
      gsap.to(n, {
        scrollTrigger: { trigger: n, start: 'top 85%' },
        opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
        startAt: { opacity: 0, y: 26 }
      });
    });

    /* hero parallax on scroll */
    gsap.to('.hero__inner', {
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.5 },
      y: 90, opacity: 0.25, ease: 'none'
    });

    /* pinned horizontal scrollytelling */
    var track = $('#track');
    var stage = $('#pinStage');
    var bar = $('#pinBar');
    if (track && stage) {
      var distance = function () { return Math.max(0, track.scrollWidth - window.innerWidth + 80); };
      gsap.to(track, {
        x: function () { return -distance(); },
        ease: 'none',
        scrollTrigger: {
          trigger: '#process',
          start: 'top top',
          end: function () { return '+=' + (distance() + window.innerHeight * 0.6); },
          pin: stage,
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: function (self) {
            if (bar) bar.style.width = (self.progress * 100).toFixed(1) + '%';
          }
        }
      });
    }
  } else {
    /* no GSAP (or reduced motion): make sure nothing stays invisible */
    $$('[data-fade], .tl').forEach(function (n) { n.style.opacity = 1; });
  }

  /* =======================================================
     6. Nav, scrollspy, back-to-top, toast
     ======================================================= */
  var nav = $('#nav'), toTop = $('#toTop');
  var navLinks = $$('[data-nav]');
  var sections = navLinks.map(function (a) { return $(a.getAttribute('href')); }).filter(Boolean);

  function onScroll() {
    var y = window.scrollY;
    if (nav) nav.classList.toggle('is-stuck', y > 20);
    if (toTop) toTop.classList.toggle('is-on', y > 700);
    var cur = null;
    sections.forEach(function (s) { if (s.getBoundingClientRect().top <= 140) cur = s.id; });
    navLinks.forEach(function (a) {
      a.classList.toggle('is-active', a.getAttribute('href') === '#' + cur);
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toTop) toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  });

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

  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  var toastEl = $('#toast'), toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('is-up');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-up'); }, 2200);
  }

  /* =======================================================
     7. Counters
     ======================================================= */
  function countUp(el) {
    var target = parseFloat(el.getAttribute('data-count')) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    var out = $('.stat__num', el);
    if (!out) return;
    if (reduced) { out.textContent = target + suffix; return; }
    var start = performance.now(), dur = 1300;
    (function tick(now) {
      var p = Math.min((now - start) / dur, 1);
      out.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    })(start);
  }
  var stats = $$('.stat');
  if ('IntersectionObserver' in window) {
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { countUp(e.target); so.unobserve(e.target); } });
    }, { threshold: 0.4 });
    stats.forEach(function (s) { so.observe(s); });
  } else stats.forEach(countUp);

  /* =======================================================
     8. Capability filters
     ======================================================= */
  var filters = $$('.filter'), cards = $$('#skillGrid .card'), gridEmpty = $('#gridEmpty');
  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var want = btn.getAttribute('data-filter'), shown = 0;
      filters.forEach(function (b) { b.classList.toggle('is-on', b === btn); });
      cards.forEach(function (c) {
        var ok = want === 'all' || c.getAttribute('data-cat') === want;
        c.classList.toggle('is-hidden', !ok);
        if (ok) shown++;
      });
      if (gridEmpty) gridEmpty.hidden = shown !== 0;
      if (hasGSAP && !reduced) {
        gsap.fromTo(cards.filter(function (c) { return !c.classList.contains('is-hidden'); }),
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.45, stagger: 0.03, ease: 'power2.out' });
      }
      if (hasST) ScrollTrigger.refresh();
    });
  });

  /* =======================================================
     9. Copy email
     ======================================================= */
  var copyBtn = $('#copyMail');
  if (copyBtn) copyBtn.addEventListener('click', function () {
    var mail = copyBtn.getAttribute('data-mail') || '';
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(mail).then(
        function () { toast('Email address copied'); },
        function () { toast('Copy failed — select the text instead'); }
      );
    } else toast('Copy is unavailable in this browser');
  });

  /* =======================================================
     10. Triage console
     ======================================================= */
  var body = $('#termBody'), input = $('#termInput'), clock = $('#termClock');

  if (clock) setInterval(function () {
    clock.textContent = new Date().toLocaleTimeString('en-AU', { hour12: false });
  }, 1000);

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
      '  WebGL fragment shader, GSAP ScrollTrigger, CSS scroll-driven',
      '  animations and hand-written SVG morphing.'
    ],
    contact: [
      'email     Rsondhtl.50@gmail.com',
      'linkedin  linkedin.com/in/roshan-dhital',
      'location  Melbourne, VIC',
      '',
      'Open to cybersecurity and security operations roles.'
    ],
    uptime: function () {
      var start = new Date(2023, 4, 1);
      var days = Math.floor((Date.now() - start) / 86400000);
      return ['In IT operations for ' + days + ' days.'];
    }
  };

  function line(text, cls) {
    if (!body) return null;
    var p = document.createElement('p');
    p.className = 'ln ' + (cls || 'ln--out');
    p.textContent = text;
    body.appendChild(p);
    body.scrollTop = body.scrollHeight;
    return p;
  }
  function echo(lines) { lines.forEach(function (t) { line(t); }); }

  function printHelp() {
    line('Available commands:', 'ln--key');
    HELP.forEach(function (pair) {
      var pad = pair[0] + '             '.slice(0, Math.max(1, 13 - pair[0].length));
      line('  ' + pad + pair[1]);
    });
  }

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
      line(steps[i][0], steps[i][1]); i++;
      setTimeout(next, 260);
    })();
  }

  var history = [], histIdx = -1;

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

    history.push(cmd); histIdx = history.length;

    if (cmd === 'clear') { body.innerHTML = ''; return; }
    if (cmd === 'help')  { printHelp(); return; }
    if (cmd === 'scan')  { runScan(); return; }
    if (cmd === 'sudo' || cmd.indexOf('sudo ') === 0) { line('Permission denied.', 'ln--warn'); return; }

    var res = RESPONSES[cmd];
    if (typeof res === 'function') { echo(res()); return; }
    if (res) { echo(res); return; }

    line('Unknown command: ' + cmd, 'ln--warn');
    line('Type help for the list.');
  }

  if (input && body) {
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        run(input.value); input.value = ''; line('', 'ln--sp');
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
        run(c.getAttribute('data-cmd')); line('', 'ln--sp'); input.focus();
      });
    });

    var termBox = $('#term');
    if (termBox) termBox.addEventListener('click', function (e) {
      if (e.target.tagName !== 'INPUT') input.focus();
    });

    line('Roshan Dhital — triage console', 'ln--key');
    line('Melbourne, Australia');
    line('');
    line('Type help for commands, or click one below.');
    line('', 'ln--sp');
  }
})();
