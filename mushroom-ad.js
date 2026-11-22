// ============================================================
// HONGUITO DEL BOSQUE — otromundo
// Un hongo escondido en el pasto. Al tocarlo se hunde en la tierra y
// de su base crece un creep orgánico que cubre la página, con venas
// que laten. Mientras el panel está abierto el bosque sigue vivo:
// ambiente de tierra con gotas, esporas que siguen al cursor, y el
// nombre aparece letra por letra. Sin dependencias externas.
// ============================================================
(function () {
  const CONFIG = {
    brand: 'otromundo',
    kicker: 'Descubriste un rincón escondido',
    badge: 'Agencia de Páginas Web',
    headline: 'Tu <span>sitio web</span> listo y profesional',
    sub: 'Diseño moderno, rápido y a tu medida. Trabajamos con vos desde el primer boceto hasta el lanzamiento.',
    features: ['Diseño personalizado y único', 'Entrega rápida, sin vueltas', 'Soporte incluido el primer mes'],
    price: '$150',
    priceNote: 'pago único / USD',
    priceItems: ['Dominio incluido el 1er año', 'Hosting ultra-rápido', 'Diseño responsive', 'SEO básico incluido'],
    whatsapp: 'https://wa.me/59894691690?text=Hola%21%20Vi%20que%20hacen%20p%C3%A1ginas%20web%2C%20me%20gustar%C3%ADa%20saber%20m%C3%A1s%20%F0%9F%9A%80',
    magicMaxElements: 90,
    tumorMax: 28,
    loadingMs: 1200,
    creepMs: 1900,
    leafCount: 14,
    sporeCount: 12,
    cursorSporeEveryMs: 70,
  };

  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const soundOn = true;

  const css = `
    #mm-hongo { position: fixed; left: 14px; bottom: 10px; width: 22px; height: 24px; z-index: 9998; cursor: pointer; border: 0; padding: 0; background: none; -webkit-tap-highlight-color: transparent; transform-origin: 50% 100%; }
    #mm-hongo svg { width: 100%; height: 100%; overflow: visible; transition: transform .5s ease; }
    #mm-hongo .mm-cap { transform-origin: 50% 100%; animation: mmBreathe 5s ease-in-out infinite; }
    #mm-hongo .mm-glow { animation: mmGlow 3.6s ease-in-out infinite; }
    #mm-hongo:hover svg { transform: translateY(-2px) rotate(-3deg); }
    #mm-hongo:focus-visible { outline: 2px solid #d9a441; outline-offset: 4px; border-radius: 50%; }
    @keyframes mmBreathe { 0%,100% { transform: scale(1); } 50% { transform: scale(1.03); } }
    @keyframes mmGlow { 0%,100% { opacity: .3; } 50% { opacity: .7; } }

    .mm-portal { position: fixed; width: 200vmax; height: 200vmax; margin: -100vmax 0 0 -100vmax; border-radius: 50%; z-index: 9996; pointer-events: none; will-change: transform, opacity;
      border: 2px solid rgba(255,240,200,.85); box-shadow: 0 0 30px rgba(255,220,140,.55); animation: mmPortal 1.4s cubic-bezier(.2,.7,.2,1) forwards; }
    @keyframes mmPortal { from { transform: scale(.02); opacity: 1; } 70% { opacity: .6; } to { transform: scale(.7); opacity: 0; } }

    #mm-veil { position: fixed; inset: 0; z-index: 9995; pointer-events: none;
      background: radial-gradient(circle at var(--mm-ox, 50%) var(--mm-oy, 100%), rgba(255,226,160,.18) 0%, rgba(90,120,70,.32) 40%, rgba(30,45,28,.8) 80%);
      animation: mmVeil 2.2s ease-in-out forwards; }
    @keyframes mmVeil { 0% { opacity: 0; } 30% { opacity: 1; } 100% { opacity: 0; } }

    /* Viñeta constante mientras el bosque está activo */
    #mm-vignette { position: fixed; inset: 0; z-index: 9993; pointer-events: none; opacity: 0; transition: opacity 1.2s ease;
      background: radial-gradient(ellipse at center, transparent 45%, rgba(10,18,8,.65) 100%); }
    #mm-vignette.on { opacity: 1; }

    #mm-creep { position: fixed; inset: 0; z-index: 9994; pointer-events: none; transition: opacity .8s ease; }
    #mm-creep svg { width: 100%; height: 100%; display: block; }

    #mm-sweep { position: fixed; inset: 0; z-index: 9997; pointer-events: none; mix-blend-mode: screen;
      background: linear-gradient(100deg, transparent 40%, rgba(255,236,180,.28) 50%, transparent 60%);
      background-size: 260% 100%; background-position: 120% 0; animation: mmSweep 1.8s cubic-bezier(.4,.1,.2,1) forwards; }
    @keyframes mmSweep { from { background-position: 120% 0; opacity: 1; } 80% { opacity: 1; } to { background-position: -40% 0; opacity: 0; } }

    .mm-leaf { position: fixed; top: -20px; width: 12px; height: 8px; border-radius: 0 80% 0 80%; background: linear-gradient(135deg,#8fb35a,#4a6b3a); z-index: 9997; pointer-events: none;
      animation: mmFall var(--mm-dur, 3.4s) linear forwards; }
    @keyframes mmFall { from { transform: translate(0,0) rotate(0deg); } to { transform: translate(var(--mm-dx, 0px), 110vh) rotate(540deg); } }
    .mm-spore { position: fixed; width: 4px; height: 4px; border-radius: 50%; background: #ffd66b; box-shadow: 0 0 8px #ffc94a; z-index: 9997; pointer-events: none;
      animation: mmSpore var(--mm-dur, 2.4s) ease-out forwards; }
    @keyframes mmSpore { 0% { transform: translate(0,0); opacity: 0; } 25% { opacity: .9; } 100% { transform: translate(var(--mm-dx, 0px), var(--mm-dy, -160px)); opacity: 0; } }
    .mm-dirt { position: fixed; width: 5px; height: 4px; border-radius: 40%; background: #ffc94a; box-shadow: 0 0 6px rgba(255,201,74,.8); z-index: 9997; pointer-events: none; }
    .mm-tumor { position: fixed; width: 14px; height: 14px; margin: -7px 0 0 -7px; border-radius: 50%; z-index: 9996; pointer-events: none; opacity: 0;
      background: radial-gradient(circle, #fff4c2 0%, #ffc94a 40%, rgba(181,101,29,0) 70%); box-shadow: 0 0 10px rgba(255,200,74,.7); }

    #mm-panel { position: fixed; left: 50%; top: 50%; transform: translate(-50%, -50%) scale(.94); width: min(560px, 92vw); overflow: visible; z-index: 9999;
      background: none; color: #3b2c1e; border-radius: 16px; isolation: isolate; padding: 28px 28px 26px; box-sizing: border-box;
      border: 0; font-family: Georgia, 'Times New Roman', serif;
      opacity: 0; pointer-events: none; transition: opacity .7s ease, transform .7s cubic-bezier(.2,.8,.2,1); }
    #mm-panel.open { opacity: 1; pointer-events: auto; transform: translate(-50%, -50%) scale(1); }
    #mm-panel .mm-kicker { font-size: .66rem; letter-spacing: 2.5px; text-transform: uppercase; color: #8a5a2b; margin-bottom: 4px; font-style: italic; }
    #mm-panel .mm-brand { font-size: 1.35rem; font-weight: 700; letter-spacing: 1px; color: #2f5233; }
    #mm-panel .mm-brand .mm-ch { display: inline-block; }
    #mm-panel .mm-badge { display: inline-block; margin: 8px 0 12px; font-size: .64rem; letter-spacing: 2px; text-transform: uppercase; color: #5b6e2f; background: rgba(143,179,90,.18); border: 1px solid rgba(91,110,47,.35); padding: 4px 10px; border-radius: 999px; font-family: system-ui, sans-serif; }
    #mm-panel h2 { margin: 0 0 10px; font-size: clamp(1.2rem, 2.6vw, 1.6rem); line-height: 1.25; color: #2f5233; }
    #mm-panel h2 span { color: #b5651d; font-style: italic; }
    #mm-panel p { color: #6b5540; font-size: .92rem; line-height: 1.6; margin: 0 0 14px; }
    #mm-panel ul { list-style: none; padding: 0; margin: 0 0 18px; display: grid; gap: 7px; }
    #mm-panel li { display: flex; gap: 8px; align-items: center; color: #4a3828; font-size: .88rem; }
    #mm-panel li::before { content: ""; width: 7px; height: 7px; border-radius: 50% 0 50% 0; background: linear-gradient(135deg,#8fb35a,#4a6b3a); flex-shrink: 0; }
    #mm-panel .mm-price { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; margin-bottom: 8px; }
    #mm-panel .mm-amount { font-size: 2.6rem; font-weight: 700; color: #b5651d; }
    #mm-panel .mm-note { font-size: .7rem; color: #8a7360; letter-spacing: 1px; text-transform: uppercase; font-family: system-ui, sans-serif; }
    #mm-panel .mm-items { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 14px; margin-bottom: 20px; font-size: .8rem; color: #5b4632; font-family: system-ui, sans-serif; }
    #mm-panel .mm-cta { display: inline-block; text-decoration: none; background: linear-gradient(135deg,#d9a441 0%,#b5651d 100%); color: #fff; font-weight: 700; padding: 12px 22px; border-radius: 999px; font-size: .9rem; font-family: system-ui, sans-serif; box-shadow: 0 4px 14px rgba(181,101,29,.3); }
    #mm-panel .mm-cta:hover { box-shadow: 0 6px 20px rgba(181,101,29,.45); }
    #mm-close { position: absolute; top: 12px; right: 12px; width: 32px; height: 32px; border-radius: 50%; border: 1px solid rgba(90,62,43,.25); background: rgba(255,255,255,.5); color: #6b5540; cursor: pointer; font-size: 14px; }
    #mm-close:hover { color: #3b2c1e; background: #fff; }

    #mm-panel .mm-loader { display: none; padding: 26px 0 30px; text-align: center; }
    #mm-panel.loading .mm-loader { display: block; }
    #mm-panel.loading .mm-content { opacity: 0; }
    #mm-panel .mm-content { transition: opacity .6s ease .1s; max-height: 80vh; overflow-y: auto; scrollbar-width: none; }
    #mm-panel .mm-loader-text { font-size: .8rem; letter-spacing: 2px; font-style: italic; color: #6b5540; margin-bottom: 14px; }
    #mm-panel .mm-loader-bar { height: 5px; border-radius: 999px; background: rgba(90,62,43,.12); overflow: hidden; }
    #mm-panel .mm-loader-bar i { display: block; height: 100%; width: 0; background: linear-gradient(90deg,#8fb35a,#d9a441); animation: mmLoad linear forwards; }
    @keyframes mmLoad { to { width: 100%; } }

    /* Parásito: vínculo verde que recorre el panel, un ojo que sigue el cursor y el latido del vínculo */
    #mm-panel.open { animation: mmUnfold 1.1s cubic-bezier(.2,.8,.2,1) both; }
    @keyframes mmUnfold { from { clip-path: inset(46% 46% 46% 46% round 60px); } to { clip-path: inset(-120px -120px -120px -120px round 60px); } }
    #mm-panel:not(.open) { animation: none; }
    @keyframes mmPulse {
      0%,100% { box-shadow: 0 18px 50px rgba(20,35,20,.45), 0 0 26px rgba(125,255,90,.2), inset 0 0 0 4px rgba(255,255,255,.35); }
      50% { box-shadow: 0 18px 50px rgba(20,35,20,.45), 0 0 52px rgba(125,255,90,.45), inset 0 0 0 4px rgba(255,255,255,.35); }
    }
    #mm-panel .mm-infest { position: absolute; inset: 0; pointer-events: none; border-radius: 16px; overflow: hidden; opacity: 0; transition: opacity 1s ease .4s; }
    #mm-panel.open .mm-infest { opacity: 1; }
    #mm-panel .mm-infest svg { width: 100%; height: 100%; display: block; }
    #mm-panel .mm-infest path { fill: none; stroke: #7dff5a; stroke-width: 1.4; stroke-linecap: round; stroke-dasharray: 520; stroke-dashoffset: 520; opacity: .6; filter: drop-shadow(0 0 4px rgba(125,255,90,.7)); animation: mmGrow 2.6s ease-out .3s forwards, mmThrob 3s ease-in-out 3s infinite; }
    @keyframes mmGrow { to { stroke-dashoffset: 0; } }
    @keyframes mmThrob { 0%,100% { opacity: .45; } 50% { opacity: .9; } }
    #mm-panel .mm-eye { position: absolute; left: 16px; top: 16px; width: 12px; height: 12px; border-radius: 50%; pointer-events: none; background: radial-gradient(circle at 40% 35%, #eaffd6 0 18%, #5fe03a 22% 55%, #1d4d12 58%); box-shadow: 0 0 10px rgba(125,255,90,.8); }
    #mm-panel .mm-eye i { position: absolute; left: 50%; top: 50%; width: 4px; height: 4px; margin: -2px 0 0 -2px; border-radius: 50%; background: #0b1a06; transition: transform .08s linear; }
    #mm-panel .mm-link { position: absolute; left: 16px; bottom: 10px; font: .6rem system-ui, sans-serif; letter-spacing: 2px; text-transform: uppercase; color: #5fe03a; text-shadow: 0 0 6px rgba(125,255,90,.6); pointer-events: none; }

    #mm-panel .mm-membrane { position: absolute; left: -36px; top: -36px; z-index: -1; pointer-events: none; overflow: visible;
      filter: drop-shadow(0 18px 40px rgba(20,35,20,.5)) drop-shadow(0 0 16px rgba(125,255,90,.35)); }
    #mm-panel .mm-membrane path { stroke: #7dff5a; stroke-width: 1.6; stroke-linejoin: round; animation: mmWet 3.2s ease-in-out infinite; }
    @keyframes mmWet { 0%,100% { stroke-opacity: .3; } 50% { stroke-opacity: .9; } }
    #mm-root { position: fixed; inset: 0; z-index: 9998; pointer-events: none; transition: opacity .8s ease; }
    #mm-root svg { width: 100%; height: 100%; display: block; overflow: visible; }
    #mm-root path { fill: none; stroke: #7dff5a; stroke-linecap: round; filter: drop-shadow(0 0 4px rgba(125,255,90,.8)); }

    @media (max-width: 500px) { #mm-panel .mm-items { grid-template-columns: 1fr; } }
    @media (prefers-reduced-motion: reduce) {
      #mm-hongo .mm-cap, #mm-hongo .mm-glow { animation: none; }
      #mm-sweep, #mm-veil, #mm-vignette, .mm-portal, .mm-leaf, .mm-spore, .mm-dirt, .mm-tumor, #mm-creep { display: none; }
      #mm-panel .mm-loader-bar i { animation: none; width: 100%; }
      #mm-panel, #mm-panel .mm-membrane path, #mm-panel .mm-infest path { animation: none; }
      #mm-root { display: none; }
      #mm-panel .mm-infest path { stroke-dashoffset: 0; }
    }
  `;

  const hongoSVG = `
    <svg viewBox="0 0 64 72" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="mmCap" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#e0392b"/><stop offset="1" stop-color="#7a1410"/>
        </linearGradient>
        <radialGradient id="mmGlowG" cx=".5" cy=".5" r=".5">
          <stop offset="0" stop-color="#ffe6a8" stop-opacity=".6"/><stop offset="1" stop-color="#ffe6a8" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <ellipse class="mm-glow" cx="32" cy="58" rx="28" ry="10" fill="url(#mmGlowG)"/>
      <path d="M22 44 Q20 56 17 62 L47 62 Q44 56 42 44 Z" fill="#f3ead2" opacity=".95"/>
      <path d="M26 46 Q25 54 24 60" stroke="#d8c9a6" stroke-width="1.2" fill="none" opacity=".7"/>
      <g class="mm-cap">
        <path d="M6 42 Q6 16 32 14 Q58 16 58 42 Q58 46 52 46 L12 46 Q6 46 6 42 Z" fill="url(#mmCap)"/>
        <circle cx="20" cy="27" r="3" fill="#fff6e0" opacity=".85"/>
        <circle cx="36" cy="22" r="2.2" fill="#fff6e0" opacity=".7"/>
        <circle cx="46" cy="32" r="2.6" fill="#fff6e0" opacity=".75"/>
        <circle cx="30" cy="36" r="1.6" fill="#fff6e0" opacity=".6"/>
      </g>
      <path d="M12 62 Q13 56 10 50 M15 62 Q16 54 14 48 M52 62 Q51 56 54 50 M49 62 Q48 54 50 48" stroke="#6b8f3a" stroke-width="2" fill="none" stroke-linecap="round" opacity=".85"/>
      <path d="M4 63 Q32 58 60 63" stroke="#4a6b3a" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".6"/>
    </svg>`;

  // ---------- SONIDO (Web Audio, generado acá: sin archivos ajenos) ----------
  let audioCtx = null;
  function getAudio() {
    if (!soundOn) return null;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      return audioCtx;
    } catch (_) { return null; }
  }
  function noiseBuffer(c, seconds) {
    const buf = c.createBuffer(1, Math.floor(c.sampleRate * seconds), c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }
  function sfxPop(c, delay) {
    const t = c.currentTime + delay;
    const o = c.createOscillator(), g = c.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(1100 + Math.random() * 900, t);
    o.frequency.exponentialRampToValueAtTime(500, t + 0.12);
    g.gain.setValueAtTime(0.07, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
    o.connect(g).connect(c.destination);
    o.start(t); o.stop(t + 0.15);
  }
  // ---------- CREEP ORGÁNICO (SVG + filtros de ruido) ----------
  let activeCreep = null;
  let cursorSporeHandler = null;

  function growCreep(origin, dur) {
    const vw = window.innerWidth, vh = window.innerHeight;
    const maxR = Math.hypot(Math.max(origin.x, vw - origin.x), Math.max(origin.y, vh - origin.y)) + 60;
    const wrap = document.createElement('div');
    wrap.id = 'mm-creep';
    wrap.innerHTML = `
      <svg viewBox="0 0 ${vw} ${vh}" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <filter id="mm-organic" x="-30%" y="-30%" width="160%" height="160%" color-interpolation-filters="sRGB">
            <feTurbulence id="mm-turb" type="fractalNoise" baseFrequency="0.012" numOctaves="2" seed="7" result="n"/>
            <feDisplacementMap id="mm-disp" in="SourceGraphic" in2="n" scale="34" xChannelSelector="R" yChannelSelector="G"/>
          </filter>
          <filter id="mm-veins" color-interpolation-filters="sRGB">
            <feTurbulence id="mm-vturb" type="fractalNoise" baseFrequency="0.045" numOctaves="3" seed="2" result="v"/>
            <feColorMatrix in="v" type="matrix" values="0 0 0 0 0.75  0 0 0 0 1  0 0 0 0 0.55  0 0 0 12 -7.2"/>
          </filter>
          <radialGradient id="mm-creep-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0" stop-color="#5b8a44" stop-opacity=".6"/>
            <stop offset=".7" stop-color="#2c4a24" stop-opacity=".75"/>
            <stop offset="1" stop-color="#14240f" stop-opacity=".85"/>
          </radialGradient>
          <mask id="mm-blob-mask">
            <circle id="mm-mask-c" cx="${origin.x}" cy="${origin.y}" r="0" fill="#fff" filter="url(#mm-organic)"/>
          </mask>
        </defs>
        <circle id="mm-blob" cx="${origin.x}" cy="${origin.y}" r="0" fill="url(#mm-creep-grad)" filter="url(#mm-organic)"/>
        <g mask="url(#mm-blob-mask)" opacity=".38">
          <rect id="mm-vein-rect" width="100%" height="100%" filter="url(#mm-veins)"/>
        </g>
      </svg>`;
    document.body.appendChild(wrap);

    const blob = wrap.querySelector('#mm-blob');
    const mask = wrap.querySelector('#mm-mask-c');
    const disp = wrap.querySelector('#mm-disp');
    const turb = wrap.querySelector('#mm-turb');
    const vturb = wrap.querySelector('#mm-vturb');
    const start = performance.now();

    // Latido: el borde respira y las venas se mueven despacio mientras el bosque esté vivo
    function living(e) {
      disp.setAttribute('scale', (34 + 16 * Math.sin(e / 260)).toFixed(2));
      turb.setAttribute('baseFrequency', (0.012 + 0.003 * Math.sin(e / 600)).toFixed(4));
      vturb.setAttribute('baseFrequency', (0.045 + 0.006 * Math.sin(e / 900)).toFixed(4));
    }

    function grow(now) {
      const e = now - start;
      const t = Math.min(1, e / dur);
      const r = maxR * (1 - Math.pow(1 - t, 3));
      blob.setAttribute('r', r);
      mask.setAttribute('r', r);
      living(e);
      if (t < 1) { requestAnimationFrame(grow); return; }
      // Cuando termina de crecer, sigue vivo a menor frecuencia (ahorra CPU)
      const iv = setInterval(() => {
        if (!wrap.isConnected) { clearInterval(iv); return; }
        living(performance.now() - start);
      }, 90);
    }
    requestAnimationFrame(grow);
    return wrap;
  }

  function fadeCreep() {
    if (!activeCreep) return;
    const wrap = activeCreep;
    activeCreep = null;
    wrap.style.opacity = '0';
    setTimeout(() => wrap.remove(), 900);
  }

  // Temblor del mundo al brotar: sacude las capas fijas (no el body, para no romper position: fixed)
  function shake(elements, ms, amp) {
    elements.forEach((el) => {
      if (!el || !el.animate) return;
      const frames = [];
      const steps = 8;
      for (let i = 0; i <= steps; i++) {
        const k = (1 - i / steps) * amp;
        frames.push({ transform: `translate(${(Math.random() - 0.5) * 2 * k}px, ${(Math.random() - 0.5) * 2 * k}px)` });
      }
      frames.push({ transform: 'translate(0,0)' });
      el.animate(frames, { duration: ms, easing: 'linear' });
    });
  }

  // Esporas que siguen al cursor mientras el bosque está activo
  function enableCursorSpores() {
    let last = 0;
    cursorSporeHandler = (e) => {
      const now = performance.now();
      if (now - last < CONFIG.cursorSporeEveryMs) return;
      last = now;
      const s = document.createElement('div');
      s.className = 'mm-spore';
      s.style.left = e.clientX + 'px';
      s.style.top = e.clientY + 'px';
      s.style.setProperty('--mm-dur', '1s');
      s.style.setProperty('--mm-dx', ((Math.random() - 0.5) * 30) + 'px');
      s.style.setProperty('--mm-dy', (-20 - Math.random() * 30) + 'px');
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 1100);
    };
    window.addEventListener('pointermove', cursorSporeHandler, { passive: true });
  }
  function disableCursorSpores() {
    if (cursorSporeHandler) window.removeEventListener('pointermove', cursorSporeHandler);
    cursorSporeHandler = null;
  }

  function forestParticles(origin) {
    for (let i = 0; i < CONFIG.leafCount; i++) {
      const leaf = document.createElement('div');
      leaf.className = 'mm-leaf';
      leaf.style.left = Math.random() * 100 + 'vw';
      leaf.style.setProperty('--mm-dur', (3 + Math.random() * 2) + 's');
      leaf.style.setProperty('--mm-dx', ((Math.random() - 0.5) * 120) + 'px');
      leaf.style.animationDelay = Math.random() * 0.8 + 's';
      document.body.appendChild(leaf);
      setTimeout(() => leaf.remove(), 5200);
    }
    for (let i = 0; i < CONFIG.sporeCount; i++) {
      const spore = document.createElement('div');
      spore.className = 'mm-spore';
      spore.style.left = origin.x + 'px';
      spore.style.top = origin.y + 'px';
      spore.style.setProperty('--mm-dur', (2 + Math.random() * 1.2) + 's');
      spore.style.setProperty('--mm-dx', ((Math.random() - 0.5) * 140) + 'px');
      spore.style.setProperty('--mm-dy', (-90 - Math.random() * 150) + 'px');
      spore.style.animationDelay = Math.random() * 0.5 + 's';
      document.body.appendChild(spore);
      setTimeout(() => spore.remove(), 3500);
    }
  }

  function dirtBurst(origin) {
    for (let i = 0; i < 10; i++) {
      const d = document.createElement('div');
      d.className = 'mm-dirt';
      d.style.left = origin.x + 'px';
      d.style.top = origin.y + 'px';
      document.body.appendChild(d);
      const dx = (Math.random() - 0.5) * 70;
      const up = -(10 + Math.random() * 30);
      const anim = d.animate([
        { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
        { transform: `translate(${dx * 0.6}px, ${up}px) rotate(120deg)`, opacity: 1, offset: 0.45 },
        { transform: `translate(${dx}px, ${up * 0.2 + 14}px) rotate(300deg)`, opacity: 0 },
      ], { duration: 700 + Math.random() * 300, easing: 'cubic-bezier(.2,.6,.4,1)' });
      anim.onfinish = () => d.remove();
    }
  }

  function collectTargets(origin) {
    const skip = new Set(['SCRIPT', 'STYLE', 'LINK', 'META', 'NOSCRIPT', 'BR', 'SVG', 'PATH']);
    const vw = window.innerWidth, vh = window.innerHeight;
    const out = [];
    document.body.querySelectorAll('*').forEach((el) => {
      if (skip.has(el.tagName)) return;
      if (el.closest('#mm-hongo, #mm-panel, #mm-sweep, #mm-veil, #mm-vignette, #mm-creep, .mm-portal, .mm-leaf, .mm-spore, .mm-dirt, .mm-tumor')) return;
      const r = el.getBoundingClientRect();
      if (r.width < 20 || r.height < 12) return;
      if (r.bottom < 0 || r.top > vh || r.right < 0 || r.left > vw) return;
      if (r.width * r.height > vw * vh * 0.6) return;
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      out.push({ el, rect: r, display: getComputedStyle(el).display, d: Math.hypot(cx - origin.x, cy - origin.y) });
    });
    out.sort((a, b) => a.d - b.d);
    return out.slice(0, CONFIG.magicMaxElements);
  }

  function magicOverPage(picked) {
    if (!document.body.animate) return;
    const maxD = picked.length ? picked[picked.length - 1].d || 1 : 1;
    picked.forEach(({ el, display, d }, i) => {
      const delay = (d / maxD) * 800;
      const dur = 1600 + Math.random() * 700;
      let kind = i % 3;
      if (display === 'inline' && kind === 1) kind = 2;
      let frames;
      if (kind === 0) {
        const sway = (Math.random() < 0.5 ? -1 : 1) * (0.6 + Math.random() * 0.8);
        frames = [
          { transform: 'rotate(0deg)' },
          { transform: `rotate(${sway}deg) translateY(-2px)` },
          { transform: 'rotate(0deg)' },
        ];
      } else if (kind === 1) {
        frames = [
          { transform: 'rotateY(0deg)' },
          { transform: 'rotateY(180deg)', filter: 'sepia(.5) saturate(1.2)' },
          { transform: 'rotateY(360deg)' },
        ];
      } else {
        frames = [
          { opacity: 1, filter: 'none' },
          { opacity: 0.55, filter: 'blur(1.5px) brightness(1.15)' },
          { opacity: 1, filter: 'none' },
        ];
      }
      try { el.animate(frames, { duration: dur, delay, easing: 'ease-in-out' }); } catch (_) { /* no animable */ }
    });
  }

  function spawnTumors(picked) {
    if (!picked.length) return;
    const maxD = picked[picked.length - 1].d || 1;
    picked.slice(0, CONFIG.tumorMax).forEach(({ rect, d }, i) => {
      const t = document.createElement('div');
      t.className = 'mm-tumor';
      t.style.left = (rect.left + Math.random() * rect.width) + 'px';
      t.style.top = (rect.top + Math.random() * rect.height) + 'px';
      document.body.appendChild(t);
      const delay = (d / maxD) * 800;
      const anim = t.animate([
        { transform: 'scale(0)', opacity: 0, offset: 0 },
        { transform: 'scale(1.3)', opacity: 1, offset: 0.35 },
        { transform: 'scale(1)', opacity: 0.8, offset: 0.6 },
        { transform: 'scale(0)', opacity: 0, offset: 1 },
      ], { duration: 1800, delay: delay + i * 10, fill: 'backwards', easing: 'ease-in-out' });
      anim.onfinish = () => t.remove();
    });
  }

  function init() {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    const vignette = document.createElement('div');
    vignette.id = 'mm-vignette';
    document.body.appendChild(vignette);

    const hongo = document.createElement('button');
    hongo.id = 'mm-hongo';
    hongo.type = 'button';
    hongo.setAttribute('aria-label', 'Descubrir ' + CONFIG.brand);
    hongo.innerHTML = hongoSVG;
    document.body.appendChild(hongo);

    const panel = document.createElement('section');
    panel.id = 'mm-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Servicios de ' + CONFIG.brand);
    panel.innerHTML = `
      <button id="mm-close" type="button" aria-label="Cerrar">✕</button>
      <svg class="mm-membrane" aria-hidden="true"><path id="mm-mem-p" fill="#f5ecd6"/></svg>
      <span class="mm-eye" aria-hidden="true"><i></i></span>
      <span class="mm-link" aria-hidden="true">● Vínculo activo</span>
      <div class="mm-loader" aria-live="polite">
        <div class="mm-loader-text">Brotando ${CONFIG.brand}…</div>
        <div class="mm-loader-bar"><i style="animation-duration:${CONFIG.loadingMs}ms"></i></div>
      </div>
      <div class="mm-content">
        <div class="mm-kicker">${CONFIG.kicker}</div>
        <div class="mm-brand" aria-label="${CONFIG.brand}">${[...CONFIG.brand].map((ch) => `<span class="mm-ch" aria-hidden="true">${ch}</span>`).join('')}</div>
        <span class="mm-badge">${CONFIG.badge}</span>
        <h2>${CONFIG.headline}</h2>
        <p>${CONFIG.sub}</p>
        <ul>${CONFIG.features.map((f) => `<li>${f}</li>`).join('')}</ul>
        <div class="mm-price"><span class="mm-amount">${CONFIG.price}</span><span class="mm-note">desde · ${CONFIG.priceNote}</span></div>
        <div class="mm-items">${CONFIG.priceItems.map((i) => `<span>✓ ${i}</span>`).join('')}</div>
        <a class="mm-cta" href="${CONFIG.whatsapp}" target="_blank" rel="noopener">Hablemos por WhatsApp →</a>
      </div>`;
    document.body.appendChild(panel);

    let busy = false;
    let open = false;
    let loadTimer = null;

    function revealBrand() {
      if (!document.body.animate) return;
      panel.querySelectorAll('.mm-brand .mm-ch').forEach((s, i) => {
        s.animate([
          { opacity: 0, transform: 'translateY(10px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ], { duration: 520, delay: 350 + i * 80, fill: 'backwards', easing: 'ease-out' });
      });
    }

    let lastOrigin = null;
    let membraneRaf = null;
    const membraneSvg = panel.querySelector('.mm-membrane');
    const membranePathEl = panel.querySelector('#mm-mem-p');

    // Forma de superelipse con deformación orgánica que cambia con el tiempo
    function membraneD(w, h, t, cut = 28) {
      const cx = w / 2, cy = (h - cut) / 2, rx = w / 2 - 8, ry = (h - cut) / 2 - 8, n = 3.6, N = 28;
      const pts = [];
      for (let i = 0; i < N; i++) {
        const th = (2 * Math.PI * i) / N;
        const c = Math.cos(th), s = Math.sin(th);
        const wob = 1 + 0.018 * Math.sin(4 * th + t * 0.9) + 0.012 * Math.sin(7 * th - t * 1.4);
        pts.push([
          cx + rx * wob * Math.sign(c) * Math.pow(Math.abs(c), 2 / n),
          cy + ry * wob * Math.sign(s) * Math.pow(Math.abs(s), 2 / n),
        ]);
      }
      const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      const m0 = mid(pts[N - 1], pts[0]);
      let d = `M${m0[0].toFixed(1)} ${m0[1].toFixed(1)}`;
      for (let i = 0; i < N; i++) {
        const p = pts[i], m = mid(p, pts[(i + 1) % N]);
        d += ` Q${p[0].toFixed(1)} ${p[1].toFixed(1)} ${m[0].toFixed(1)} ${m[1].toFixed(1)}`;
      }
      return d + 'Z';
    }
    function animateMembrane() {
      const PAD = 36;
      const w = panel.offsetWidth + PAD * 2, h = panel.offsetHeight + PAD * 2;
      membraneSvg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      membraneSvg.style.width = w + 'px';
      membraneSvg.style.height = h + 'px';
      const start = performance.now();
      if (membraneRaf) cancelAnimationFrame(membraneRaf);
      const tick = (now) => {
        if (!open) { membraneRaf = null; return; }
        membranePathEl.setAttribute('d', membraneD(w, h, (now - start) / 1000));
        membraneRaf = requestAnimationFrame(tick);
      };
      membraneRaf = requestAnimationFrame(tick);
    }
    // Raíz que sale del hongo hacia el panel y se queda un momento
    function drawRoot(from) {
      const r = panel.getBoundingClientRect();
      const to = { x: r.left + r.width / 2, y: r.top + 30 };
      const mx = (from.x + to.x) / 2, my = (from.y + to.y) / 2;
      const wrap = document.createElement('div');
      wrap.id = 'mm-root';
      wrap.innerHTML = `<svg viewBox="0 0 ${window.innerWidth} ${window.innerHeight}" preserveAspectRatio="none">
        <path d="M${from.x} ${from.y} C ${from.x} ${from.y - 140}, ${to.x - 120} ${to.y + 200}, ${to.x} ${to.y}" stroke-width="2.2"/>
        <path d="M${mx - 60} ${my + 40} q 40 -30 90 -10" stroke-width="1.2"/>
        <path d="M${mx + 40} ${my - 40} q -30 30 -70 50" stroke-width="1.2"/>
      </svg>`;
      document.body.appendChild(wrap);
      wrap.querySelectorAll('path').forEach((p, i) => {
        const L = p.getTotalLength();
        p.animate([
          { strokeDasharray: `${L}`, strokeDashoffset: `${L}` },
          { strokeDasharray: `${L}`, strokeDashoffset: '0' },
        ], { duration: 900 + i * 200, delay: i * 120, fill: 'forwards', easing: 'ease-out' });
      });
      setTimeout(() => {
        wrap.style.opacity = '0';
        setTimeout(() => wrap.remove(), 900);
      }, 2200);
    }

    function openPanel() {
      open = true;
      panel.classList.add('open', 'loading');
      vignette.classList.add('on');
      clearTimeout(loadTimer);
      loadTimer = setTimeout(() => {
        panel.classList.remove('loading');
        revealBrand();
      }, CONFIG.loadingMs);
      animateMembrane();
      if (lastOrigin) drawRoot(lastOrigin);
    }
    function closePanel() {
      open = false;
      panel.classList.remove('open', 'loading');
      vignette.classList.remove('on');
      clearTimeout(loadTimer);
      disableCursorSpores();
      fadeCreep();
    }

    hongo.addEventListener('click', () => {
      if (busy) return;
      if (open) return closePanel();
      if (reduceMotion) return openPanel();
      busy = true;

      const c = getAudio();
      if (navigator.vibrate) navigator.vibrate([25, 40, 70]);

      const rect = hongo.getBoundingClientRect();
      const origin = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      const baseY = rect.bottom - 4;
      lastOrigin = origin;

      // 1) El hongo se hunde en la tierra y vuelve a salir
      hongo.animate([
        { transform: 'translateY(0) scaleY(1)' },
        { transform: 'translateY(12px) scaleY(.55)', offset: 0.25 },
        { transform: 'translateY(-3px) scaleY(1.06)', offset: 0.6 },
        { transform: 'translateY(0) scaleY(1)' },
      ], { duration: 1100, easing: 'ease-in-out' });
      dirtBurst({ x: origin.x, y: baseY });

      // 2) Portal, atardecer y rayo de sol
      const portal = document.createElement('div');
      portal.className = 'mm-portal';
      portal.style.left = origin.x + 'px';
      portal.style.top = origin.y + 'px';
      document.body.appendChild(portal);

      const veil = document.createElement('div');
      veil.id = 'mm-veil';
      veil.style.setProperty('--mm-ox', origin.x + 'px');
      veil.style.setProperty('--mm-oy', origin.y + 'px');
      document.body.appendChild(veil);

      const sweep = document.createElement('div');
      sweep.id = 'mm-sweep';
      document.body.appendChild(sweep);

      // 3) El creep crece desde la base del hongo, con temblor
      fadeCreep();
      activeCreep = growCreep({ x: origin.x, y: baseY }, CONFIG.creepMs);
      shake([activeCreep, veil], 520, 5);
      setTimeout(() => shake([activeCreep, veil], 380, 3), CONFIG.creepMs * 0.55);
      enableCursorSpores();

      // 4) Hojas, esporas, magia sobre los elementos y brotes
      forestParticles(origin);
      const targets = collectTargets(origin);
      magicOverPage(targets);
      spawnTumors(targets);
      if (c) for (let i = 0; i < 6; i++) sfxPop(c, 0.3 + i * 0.22 + Math.random() * 0.1);

      // 5) El mundo se revela en el panel
      setTimeout(openPanel, 650);
      setTimeout(() => {
        sweep.remove();
        veil.remove();
        portal.remove();
        busy = false;
      }, 2500);
    });

    const eyeBox = panel.querySelector('.mm-eye');
    const pupil = panel.querySelector('.mm-eye i');
    window.addEventListener('pointermove', (e) => {
      if (!open || !pupil) return;
      const r = eyeBox.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy) || 1;
      const m = Math.min(3, d);
      pupil.style.transform = `translate(${(dx / d) * m}px, ${(dy / d) * m}px)`;
    }, { passive: true });

    panel.querySelector('#mm-close').addEventListener('click', closePanel);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePanel(); });
    panel.addEventListener('click', (e) => { if (e.target === panel) closePanel(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
