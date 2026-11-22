// ============================================================
// HONGUITO DEL BOSQUE — otromundo
// Un hongo escondido en el pasto. Al tocarlo se hunde en la tierra,
// y de la base se extiende un creep orgánico con venas luminosas
// que cubre la página. Caen hojas, suben esporas, aparecen brotes
// en los elementos, suena un zumbido de tierra y se revela el
// panel de servicios. Sin dependencias externas: SVG + Web Audio.
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
  };

  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SOUND_KEY = 'mm-sound';
  let soundOn = true;
  try { soundOn = localStorage.getItem(SOUND_KEY) !== 'off'; } catch (_) { /* sin storage: sonido activo */ }

  const css = `
    #mm-hongo { position: fixed; left: 14px; bottom: 10px; width: 22px; height: 24px; z-index: 9998; cursor: pointer; border: 0; padding: 0; background: none; -webkit-tap-highlight-color: transparent; transform-origin: 50% 100%; }
    #mm-hongo svg { width: 100%; height: 100%; overflow: visible; transition: transform .5s ease; }
    #mm-hongo .mm-cap { transform-origin: 50% 100%; animation: mmBreathe 5s ease-in-out infinite; }
    #mm-hongo .mm-glow { animation: mmGlow 3.6s ease-in-out infinite; }
    #mm-hongo:hover svg { transform: translateY(-2px) rotate(-3deg); }
    #mm-hongo:focus-visible { outline: 2px solid #d9a441; outline-offset: 4px; border-radius: 50%; }
    @keyframes mmBreathe { 0%,100% { transform: scale(1); } 50% { transform: scale(1.03); } }
    @keyframes mmGlow { 0%,100% { opacity: .3; } 50% { opacity: .7; } }

    /* Círculo de luz cálida que se expande desde el hongo */
    .mm-portal { position: fixed; width: 10px; height: 10px; margin: -5px 0 0 -5px; border-radius: 50%; z-index: 9996; pointer-events: none;
      border: 2px solid rgba(255,240,200,.85); box-shadow: 0 0 30px rgba(255,220,140,.55); animation: mmPortal 1.4s cubic-bezier(.2,.7,.2,1) forwards; }
    @keyframes mmPortal { from { transform: scale(1); opacity: 1; } 70% { opacity: .7; } to { transform: scale(90); opacity: 0; } }

    /* Atardecer en el bosque */
    #mm-veil { position: fixed; inset: 0; z-index: 9995; pointer-events: none;
      background: radial-gradient(circle at var(--mm-ox, 50%) var(--mm-oy, 100%), rgba(255,226,160,.18) 0%, rgba(90,120,70,.32) 40%, rgba(30,45,28,.8) 80%);
      animation: mmVeil 2.2s ease-in-out forwards; }
    @keyframes mmVeil { 0% { opacity: 0; } 30% { opacity: 1; } 100% { opacity: 0; } }

    /* Creep orgánico: capa SVG con desplazamiento de ruido para el borde viscoso */
    #mm-creep { position: fixed; inset: 0; z-index: 9994; pointer-events: none; }
    #mm-creep svg { width: 100%; height: 100%; display: block; }

    /* Rayo de sol */
    #mm-sweep { position: fixed; inset: 0; z-index: 9997; pointer-events: none; mix-blend-mode: screen;
      background: linear-gradient(100deg, transparent 40%, rgba(255,236,180,.28) 50%, transparent 60%);
      background-size: 260% 100%; background-position: 120% 0; animation: mmSweep 1.8s cubic-bezier(.4,.1,.2,1) forwards; }
    @keyframes mmSweep { from { background-position: 120% 0; opacity: 1; } 80% { opacity: 1; } to { background-position: -40% 0; opacity: 0; } }

    /* Hojas, esporas, tierra y brotes */
    .mm-leaf { position: fixed; top: -20px; width: 12px; height: 8px; border-radius: 0 80% 0 80%; background: linear-gradient(135deg,#8fb35a,#4a6b3a); z-index: 9997; pointer-events: none;
      animation: mmFall var(--mm-dur, 3.4s) linear forwards; }
    @keyframes mmFall { from { transform: translate(0,0) rotate(0deg); } to { transform: translate(var(--mm-dx, 0px), 110vh) rotate(540deg); } }
    .mm-spore { position: fixed; width: 4px; height: 4px; border-radius: 50%; background: #fff3d6; box-shadow: 0 0 6px #fff3d6; z-index: 9997; pointer-events: none;
      animation: mmSpore var(--mm-dur, 2.4s) ease-out forwards; }
    @keyframes mmSpore { 0% { transform: translate(0,0); opacity: 0; } 25% { opacity: .9; } 100% { transform: translate(var(--mm-dx, 0px), var(--mm-dy, -160px)); opacity: 0; } }
    .mm-dirt { position: fixed; width: 5px; height: 4px; border-radius: 40%; background: #6b4a2e; z-index: 9997; pointer-events: none; }
    .mm-tumor { position: fixed; width: 14px; height: 14px; margin: -7px 0 0 -7px; border-radius: 50%; z-index: 9996; pointer-events: none; opacity: 0;
      background: radial-gradient(circle, #eaffb8 0%, #8fc85a 40%, rgba(74,107,58,0) 70%); box-shadow: 0 0 10px rgba(180,230,120,.6); }

    #mm-panel { position: fixed; left: 50%; top: 50%; transform: translate(-50%, -50%) scale(.94); width: min(560px, 92vw); max-height: 88vh; overflow: auto; z-index: 9999;
      background: radial-gradient(circle at 20% 0%, #f8f0dc 0%, #efe3c4 100%); color: #3b2c1e; border-radius: 16px; padding: 28px 28px 26px; box-sizing: border-box;
      border: 1px solid rgba(90,62,43,.25); box-shadow: 0 18px 50px rgba(20,35,20,.45), inset 0 0 0 4px rgba(255,255,255,.35); font-family: Georgia, 'Times New Roman', serif;
      opacity: 0; pointer-events: none; transition: opacity .7s ease, transform .7s cubic-bezier(.2,.8,.2,1); }
    #mm-panel.open { opacity: 1; pointer-events: auto; transform: translate(-50%, -50%) scale(1); }
    #mm-panel .mm-kicker { font-size: .66rem; letter-spacing: 2.5px; text-transform: uppercase; color: #8a5a2b; margin-bottom: 4px; font-style: italic; }
    #mm-panel .mm-brand { font-size: 1.35rem; font-weight: 700; letter-spacing: 1px; color: #2f5233; }
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
    #mm-sound { position: absolute; top: 12px; right: 54px; height: 32px; padding: 0 12px; border-radius: 999px; border: 1px solid rgba(90,62,43,.25); background: rgba(255,255,255,.5); color: #6b5540; cursor: pointer; font: .72rem system-ui, sans-serif; letter-spacing: .5px; }
    #mm-sound:hover { color: #3b2c1e; background: #fff; }

    /* Brotando el mundo dentro del panel */
    #mm-panel .mm-loader { display: none; padding: 26px 0 30px; text-align: center; }
    #mm-panel.loading .mm-loader { display: block; }
    #mm-panel.loading .mm-content { opacity: 0; }
    #mm-panel .mm-content { transition: opacity .6s ease .1s; }
    #mm-panel .mm-loader-text { font-size: .8rem; letter-spacing: 2px; font-style: italic; color: #6b5540; margin-bottom: 14px; }
    #mm-panel .mm-loader-bar { height: 5px; border-radius: 999px; background: rgba(90,62,43,.12); overflow: hidden; }
    #mm-panel .mm-loader-bar i { display: block; height: 100%; width: 0; background: linear-gradient(90deg,#8fb35a,#d9a441); animation: mmLoad linear forwards; }
    @keyframes mmLoad { to { width: 100%; } }

    @media (max-width: 500px) { #mm-panel .mm-items { grid-template-columns: 1fr; } }
    @media (prefers-reduced-motion: reduce) {
      #mm-hongo .mm-cap, #mm-hongo .mm-glow { animation: none; }
      #mm-sweep, #mm-veil, .mm-portal, .mm-leaf, .mm-spore, .mm-dirt, .mm-tumor, #mm-creep { display: none; }
      #mm-panel .mm-loader-bar i { animation: none; width: 100%; }
    }
  `;

  // Hongo del bosque: sombrero ocre con manchitas crema, pie claro, pasto verde.
  const hongoSVG = `
    <svg viewBox="0 0 64 72" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="mmCap" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#d9a441"/><stop offset="1" stop-color="#8b4a2b"/>
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
  // Chasquido húmedo al hundirse en la tierra
  function sfxSquelch(c) {
    const t = c.currentTime;
    const src = c.createBufferSource();
    src.buffer = noiseBuffer(c, 0.5);
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass'; bp.Q.value = 4;
    bp.frequency.setValueAtTime(900, t);
    bp.frequency.exponentialRampToValueAtTime(160, t + 0.45);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.6, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    src.connect(bp).connect(g).connect(c.destination);
    src.start(t); src.stop(t + 0.5);

    const o = c.createOscillator(), og = c.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(110, t);
    o.frequency.exponentialRampToValueAtTime(38, t + 0.3);
    og.gain.setValueAtTime(0.7, t);
    og.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
    o.connect(og).connect(c.destination);
    o.start(t); o.stop(t + 0.36);
  }
  // Zumbido grave de tierra que acompaña el crecimiento del creep
  function sfxDrone(c, seconds) {
    const t = c.currentTime;
    const o = c.createOscillator();
    o.type = 'sawtooth'; o.frequency.value = 52;
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 260;
    const lfo = c.createOscillator(), lfoG = c.createGain();
    lfo.frequency.value = 0.35; lfoG.gain.value = 3;
    lfo.connect(lfoG).connect(o.frequency);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.08, t + 0.5);
    g.gain.exponentialRampToValueAtTime(0.0001, t + seconds);
    o.connect(lp).connect(g).connect(c.destination);
    o.start(t); lfo.start(t);
    o.stop(t + seconds); lfo.stop(t + seconds);
  }
  // Pop de espora
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
  // Acorde suave al revelarse el panel
  function sfxChime(c) {
    const t = c.currentTime;
    [293.7, 370, 440, 554].forEach((f, i) => {
      const o = c.createOscillator(), g = c.createGain();
      o.type = 'sine'; o.frequency.value = f;
      const s = t + 0.05 * i;
      g.gain.setValueAtTime(0.0001, s);
      g.gain.exponentialRampToValueAtTime(0.05, s + 0.25);
      g.gain.exponentialRampToValueAtTime(0.0001, s + 2.4);
      o.connect(g).connect(c.destination);
      o.start(s); o.stop(s + 2.5);
    });
  }

  // ---------- CREEP ORGÁNICO (SVG + filtros de ruido) ----------
  // Un círculo que crece desde el hongo con borde viscoso (feDisplacementMap)
  // y venas luminosas recortadas a su forma (máscara). El ruido respira
  // mientras crece para que no parezca una animación mecánica.
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
            <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="3" seed="2" result="v"/>
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
          <rect width="100%" height="100%" filter="url(#mm-veins)"/>
        </g>
      </svg>`;
    document.body.appendChild(wrap);

    const blob = wrap.querySelector('#mm-blob');
    const mask = wrap.querySelector('#mm-mask-c');
    const disp = wrap.querySelector('#mm-disp');
    const turb = wrap.querySelector('#mm-turb');
    const start = performance.now();

    function frame(now) {
      const e = now - start;
      const t = Math.min(1, e / dur);
      const r = maxR * (1 - Math.pow(1 - t, 3));
      blob.setAttribute('r', r);
      mask.setAttribute('r', r);
      disp.setAttribute('scale', (34 + 16 * Math.sin(e / 260)).toFixed(2));
      turb.setAttribute('baseFrequency', (0.012 + 0.003 * Math.sin(e / 600)).toFixed(4));
      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        wrap.style.transition = 'opacity .6s ease';
        wrap.style.opacity = '0';
        setTimeout(() => wrap.remove(), 700);
      }
    }
    requestAnimationFrame(frame);
    return wrap;
  }

  // ---------- PARTÍCULAS Y BROTES ----------
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

  // Tierra que salta al hundirse el hongo
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

  // Elegir qué elementos participan de la magia: los más cercanos al hongo primero
  function collectTargets(origin) {
    const skip = new Set(['SCRIPT', 'STYLE', 'LINK', 'META', 'NOSCRIPT', 'BR', 'SVG', 'PATH']);
    const vw = window.innerWidth, vh = window.innerHeight;
    const out = [];
    document.body.querySelectorAll('*').forEach((el) => {
      if (skip.has(el.tagName)) return;
      if (el.closest('#mm-hongo, #mm-panel, #mm-sweep, #mm-veil, #mm-creep, .mm-portal, .mm-leaf, .mm-spore, .mm-dirt, .mm-tumor')) return;
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

  // Magia sobre los elementos: se mecen como ramas, se dan vuelta como hojas
  // o se empañan como con rocío. Las animaciones se limpian solas.
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

  // Brotes luminosos en las esquinas de los elementos que toca el creep
  function spawnTumors(picked) {
    picked.slice(0, CONFIG.tumorMax).forEach(({ rect, d }, i) => {
      const t = document.createElement('div');
      t.className = 'mm-tumor';
      t.style.left = (rect.left + Math.random() * rect.width) + 'px';
      t.style.top = (rect.top + Math.random() * rect.height) + 'px';
      document.body.appendChild(t);
      const delay = (d / (picked[picked.length - 1].d || 1)) * 800;
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
      <button id="mm-sound" type="button" aria-pressed="${soundOn}"></button>
      <div class="mm-loader" aria-live="polite">
        <div class="mm-loader-text">Brotando ${CONFIG.brand}…</div>
        <div class="mm-loader-bar"><i style="animation-duration:${CONFIG.loadingMs}ms"></i></div>
      </div>
      <div class="mm-content">
        <div class="mm-kicker">${CONFIG.kicker}</div>
        <div class="mm-brand">${CONFIG.brand}</div>
        <span class="mm-badge">${CONFIG.badge}</span>
        <h2>${CONFIG.headline}</h2>
        <p>${CONFIG.sub}</p>
        <ul>${CONFIG.features.map((f) => `<li>${f}</li>`).join('')}</ul>
        <div class="mm-price"><span class="mm-amount">${CONFIG.price}</span><span class="mm-note">desde · ${CONFIG.priceNote}</span></div>
        <div class="mm-items">${CONFIG.priceItems.map((i) => `<span>✓ ${i}</span>`).join('')}</div>
        <a class="mm-cta" href="${CONFIG.whatsapp}" target="_blank" rel="noopener">Hablemos por WhatsApp →</a>
      </div>`;
    document.body.appendChild(panel);

    const soundBtn = panel.querySelector('#mm-sound');
    function paintSound() {
      soundBtn.textContent = soundOn ? 'Sonido: on' : 'Sonido: off';
      soundBtn.setAttribute('aria-pressed', String(soundOn));
    }
    paintSound();
    soundBtn.addEventListener('click', () => {
      soundOn = !soundOn;
      try { localStorage.setItem(SOUND_KEY, soundOn ? 'on' : 'off'); } catch (_) { /* sin storage */ }
      paintSound();
    });

    let busy = false;
    let open = false;
    let loadTimer = null;

    function openPanel() {
      open = true;
      panel.classList.add('open', 'loading');
      clearTimeout(loadTimer);
      loadTimer = setTimeout(() => panel.classList.remove('loading'), CONFIG.loadingMs);
    }
    function closePanel() {
      open = false;
      panel.classList.remove('open', 'loading');
      clearTimeout(loadTimer);
    }

    hongo.addEventListener('click', () => {
      if (busy) return;
      if (open) return closePanel();
      if (reduceMotion) return openPanel();
      busy = true;

      // El audio se crea dentro del gesto del usuario (requisito del navegador)
      const c = getAudio();
      const rect = hongo.getBoundingClientRect();
      const origin = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      const baseY = rect.bottom - 4;

      // 1) El hongo se hunde en la tierra y vuelve a salir
      hongo.animate([
        { transform: 'translateY(0) scaleY(1)' },
        { transform: 'translateY(12px) scaleY(.55)', offset: 0.25 },
        { transform: 'translateY(-3px) scaleY(1.06)', offset: 0.6 },
        { transform: 'translateY(0) scaleY(1)' },
      ], { duration: 1100, easing: 'ease-in-out' });
      dirtBurst({ x: origin.x, y: baseY });
      if (c) { sfxSquelch(c); sfxDrone(c, 2.4); }

      // 2) Portal y atardecer
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

      // 3) El creep crece desde la base del hongo
      growCreep({ x: origin.x, y: baseY }, CONFIG.creepMs);

      // 4) Hojas, esporas, magia sobre los elementos y brotes
      forestParticles(origin);
      const targets = collectTargets(origin);
      magicOverPage(targets);
      spawnTumors(targets);
      if (c) for (let i = 0; i < 6; i++) sfxPop(c, 0.3 + i * 0.22 + Math.random() * 0.1);

      // 5) Se revela el mundo en el panel
      setTimeout(() => { openPanel(); if (c) sfxChime(c); }, 650);
      setTimeout(() => {
        sweep.remove();
        veil.remove();
        portal.remove();
        busy = false;
      }, 2500);
    });

    panel.querySelector('#mm-close').addEventListener('click', closePanel);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePanel(); });
    panel.addEventListener('click', (e) => { if (e.target === panel) closePanel(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
