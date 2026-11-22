// ============================================================
// HONGUITO MÁGICO — otromundo
// Un hongo chiquito con pasto en la esquina. Al tocarlo, se abre
// un portal desde el hongo: la página se tiñe de otro mundo, la
// magia recorre todos sus elementos y después aparece el panel
// de servicios como un mundo recién descubierto.
// ============================================================
(function () {
  const CONFIG = {
    brand: 'otromundo',
    kicker: 'Descubriste un mundo nuevo',
    badge: '✦ Agencia de Páginas Web',
    headline: 'Tu <span>sitio web</span> listo y profesional',
    sub: 'Diseño moderno, rápido y a tu medida. Trabajamos con vos desde el primer boceto hasta el lanzamiento.',
    features: ['Diseño personalizado y único', 'Entrega rápida, sin vueltas', 'Soporte incluido el primer mes'],
    price: '$150',
    priceNote: 'pago único / USD',
    priceItems: ['Dominio incluido el 1er año', 'Hosting ultra-rápido', 'Diseño responsive', 'SEO básico incluido'],
    whatsapp: 'https://wa.me/59894691690?text=Hola%21%20Vi%20que%20hacen%20p%C3%A1ginas%20web%2C%20me%20gustar%C3%ADa%20saber%20m%C3%A1s%20%F0%9F%9A%80',
    magicMaxElements: 90,   // cuántos elementos de la página participan de la magia
    loadingMs: 1200,        // tiempo de "carga" del mundo dentro del panel
  };

  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const css = `
    #mm-hongo { position: fixed; left: 14px; bottom: 10px; width: 22px; height: 24px; z-index: 9998; cursor: pointer; border: 0; padding: 0; background: none; -webkit-tap-highlight-color: transparent; }
    #mm-hongo svg { width: 100%; height: 100%; overflow: visible; transition: transform .4s ease; }
    #mm-hongo .mm-cap { transform-origin: 50% 100%; animation: mmBreathe 4.5s ease-in-out infinite; }
    #mm-hongo .mm-glow { animation: mmGlow 3.2s ease-in-out infinite; }
    #mm-hongo:hover svg { transform: translateY(-3px) scale(1.06); }
    #mm-hongo:focus-visible { outline: 2px solid #0ff; outline-offset: 4px; border-radius: 50%; }
    @keyframes mmBreathe { 0%,100% { transform: scale(1); } 50% { transform: scale(1.035); } }
    @keyframes mmGlow { 0%,100% { opacity: .35; } 50% { opacity: .8; } }

    /* Portal: anillo de luz que sale del hongo */
    .mm-portal { position: fixed; width: 10px; height: 10px; margin: -5px 0 0 -5px; border-radius: 50%; z-index: 9996; pointer-events: none;
      border: 2px solid #0ff; box-shadow: 0 0 24px #0ff, inset 0 0 18px #a855f7; animation: mmPortal 1.3s cubic-bezier(.2,.7,.2,1) forwards; }
    @keyframes mmPortal { from { transform: scale(1); opacity: 1; } 70% { opacity: .8; } to { transform: scale(90); opacity: 0; } }

    /* Velo de otro mundo: la página se tiñe de violeta-cian y vuelve */
    #mm-veil { position: fixed; inset: 0; z-index: 9995; pointer-events: none;
      background: radial-gradient(circle at var(--mm-ox, 50%) var(--mm-oy, 100%), rgba(41,231,231,.28) 0%, rgba(168,85,247,.42) 35%, rgba(6,8,24,.88) 75%);
      animation: mmVeil 1.8s ease-in-out forwards; }
    @keyframes mmVeil { 0% { opacity: 0; } 30% { opacity: 1; } 100% { opacity: 0; } }

    #mm-sweep { position: fixed; inset: 0; z-index: 9997; pointer-events: none; mix-blend-mode: screen;
      background: linear-gradient(115deg, transparent 38%, rgba(0,255,255,.25) 46%, rgba(255,255,255,.7) 50%, rgba(168,85,247,.3) 54%, transparent 62%);
      background-size: 260% 100%; background-position: 120% 0; animation: mmSweep 1.5s cubic-bezier(.4,.1,.2,1) forwards; }
    @keyframes mmSweep { from { background-position: 120% 0; opacity: 1; } 80% { opacity: 1; } to { background-position: -40% 0; opacity: 0; } }

    .mm-spark { position: fixed; width: 5px; height: 5px; border-radius: 50%; background: #fff; box-shadow: 0 0 8px #0ff, 0 0 14px #a855f7; z-index: 9997; pointer-events: none; animation: mmSpark 1.1s ease-out forwards; }
    @keyframes mmSpark { 0% { transform: scale(0); opacity: 0; } 30% { opacity: 1; } 100% { transform: scale(1.8) translateY(-18px); opacity: 0; } }

    #mm-panel { position: fixed; left: 50%; top: 50%; transform: translate(-50%, -50%) scale(.92); width: min(560px, 92vw); max-height: 88vh; overflow: auto; z-index: 9999;
      background: linear-gradient(160deg, #0a0d24 0%, #060818 100%); color: #fff; border-radius: 18px; padding: 28px 28px 26px; box-sizing: border-box;
      border: 1px solid rgba(0,255,255,.18); box-shadow: 0 0 60px rgba(168,85,247,.25), 0 0 1px #0ff; font-family: 'Inter', system-ui, sans-serif;
      opacity: 0; pointer-events: none; transition: opacity .6s ease, transform .6s cubic-bezier(.2,.8,.2,1); }
    #mm-panel.open { opacity: 1; pointer-events: auto; transform: translate(-50%, -50%) scale(1); }
    #mm-panel .mm-kicker { font-size: .66rem; letter-spacing: 3px; text-transform: uppercase; color: #a855f7; margin-bottom: 4px; }
    #mm-panel .mm-brand { font-size: 1.3rem; font-weight: 700; letter-spacing: 2px; background: linear-gradient(90deg,#00ffff,#a855f7); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
    #mm-panel .mm-badge { display: inline-block; margin: 10px 0 12px; font-size: .62rem; letter-spacing: 3px; text-transform: uppercase; color: #0ff; background: rgba(0,255,255,.1); border: 1px solid rgba(0,255,255,.25); padding: 4px 10px; border-radius: 999px; }
    #mm-panel h2 { margin: 0 0 10px; font-size: clamp(1.2rem, 2.6vw, 1.6rem); line-height: 1.25; }
    #mm-panel h2 span { background: linear-gradient(90deg,#0ff,#a855f7); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
    #mm-panel p { color: rgba(255,255,255,.6); font-size: .9rem; line-height: 1.55; margin: 0 0 14px; }
    #mm-panel ul { list-style: none; padding: 0; margin: 0 0 18px; display: grid; gap: 7px; }
    #mm-panel li { display: flex; gap: 8px; align-items: center; color: rgba(255,255,255,.75); font-size: .85rem; }
    #mm-panel li::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: linear-gradient(135deg,#00ffff,#a855f7); flex-shrink: 0; }
    #mm-panel .mm-price { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; margin-bottom: 8px; }
    #mm-panel .mm-amount { font-size: 2.6rem; font-weight: 700; background: linear-gradient(90deg,#00ffff,#a855f7); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
    #mm-panel .mm-note { font-size: .7rem; color: rgba(255,255,255,.4); letter-spacing: 1px; text-transform: uppercase; }
    #mm-panel .mm-items { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 14px; margin-bottom: 20px; font-size: .78rem; color: rgba(255,255,255,.7); }
    #mm-panel .mm-cta { display: inline-block; text-decoration: none; background: linear-gradient(135deg,#0ff 0%,#a855f7 100%); color: #000; font-weight: 700; padding: 12px 22px; border-radius: 999px; font-size: .9rem; }
    #mm-panel .mm-cta:hover { box-shadow: 0 0 30px rgba(168,85,247,.45); }
    #mm-close { position: absolute; top: 12px; right: 12px; width: 32px; height: 32px; border-radius: 50%; border: 1px solid rgba(255,255,255,.15); background: rgba(255,255,255,.06); color: rgba(255,255,255,.7); cursor: pointer; font-size: 14px; }
    #mm-close:hover { color: #fff; background: rgba(255,255,255,.16); }

    /* Carga del mundo dentro del panel */
    #mm-panel .mm-loader { display: none; padding: 26px 0 30px; text-align: center; }
    #mm-panel.loading .mm-loader { display: block; }
    #mm-panel.loading .mm-content { opacity: 0; }
    #mm-panel .mm-content { transition: opacity .5s ease .1s; }
    #mm-panel .mm-loader-text { font-size: .72rem; letter-spacing: 3px; text-transform: uppercase; color: #0ff; margin-bottom: 14px; }
    #mm-panel .mm-loader-bar { height: 4px; border-radius: 999px; background: rgba(255,255,255,.08); overflow: hidden; }
    #mm-panel .mm-loader-bar i { display: block; height: 100%; width: 0; background: linear-gradient(90deg,#0ff,#a855f7); box-shadow: 0 0 12px #0ff; animation: mmLoad linear forwards; }
    @keyframes mmLoad { to { width: 100%; } }

    @media (max-width: 500px) { #mm-panel .mm-items { grid-template-columns: 1fr; } }
    @media (prefers-reduced-motion: reduce) {
      #mm-hongo .mm-cap, #mm-hongo .mm-glow { animation: none; }
      #mm-sweep, #mm-veil, .mm-portal, .mm-spark { display: none; }
      #mm-panel .mm-loader-bar i { animation: none; width: 100%; }
    }
  `;

  // Hongo con pasto. Colores: casquete cian/violeta, pie claro, pasto verde apagado.
  const hongoSVG = `
    <svg viewBox="0 0 64 72" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="mmCap" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#29e7e7"/><stop offset="1" stop-color="#a855f7"/>
        </linearGradient>
        <radialGradient id="mmGlowG" cx=".5" cy=".5" r=".5">
          <stop offset="0" stop-color="#0ff" stop-opacity=".55"/><stop offset="1" stop-color="#0ff" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <ellipse class="mm-glow" cx="32" cy="58" rx="28" ry="10" fill="url(#mmGlowG)"/>
      <path d="M22 44 Q20 56 17 62 L47 62 Q44 56 42 44 Z" fill="#e8ecf3" opacity=".92"/>
      <path d="M26 46 Q25 54 24 60" stroke="#c7cfdc" stroke-width="1.2" fill="none" opacity=".7"/>
      <g class="mm-cap">
        <path d="M6 42 Q6 16 32 14 Q58 16 58 42 Q58 46 52 46 L12 46 Q6 46 6 42 Z" fill="url(#mmCap)"/>
        <circle cx="20" cy="27" r="3" fill="#fff" opacity=".85"/>
        <circle cx="36" cy="22" r="2.2" fill="#fff" opacity=".7"/>
        <circle cx="46" cy="32" r="2.6" fill="#fff" opacity=".75"/>
        <circle cx="30" cy="36" r="1.6" fill="#fff" opacity=".6"/>
      </g>
      <path d="M12 62 Q13 56 10 50 M15 62 Q16 54 14 48 M52 62 Q51 56 54 50 M49 62 Q48 54 50 48" stroke="#4ade80" stroke-width="2" fill="none" stroke-linecap="round" opacity=".75"/>
      <path d="M4 63 Q32 58 60 63" stroke="#22c55e" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".55"/>
    </svg>`;

  function sparkles() {
    const count = 16;
    for (let i = 0; i < count; i++) {
      const s = document.createElement('div');
      s.className = 'mm-spark';
      s.style.left = Math.random() * 100 + 'vw';
      s.style.top = Math.random() * 100 + 'vh';
      s.style.animationDelay = Math.random() * 0.9 + 's';
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 2600);
    }
  }

  // Magia sobre los elementos de la página: oleada desde el hongo hacia afuera.
  // Cada elemento hace una de tres cosas imposibles: levitar con brillo,
  // girar en 3D como si lo volteara una mano invisible, o desvanecerse
  // y reaparecer en otro tono. Las animaciones de Web Animations API se
  // limpian solas al terminar, así que la página vuelve a su estado normal.
  function magicOverPage(origin) {
    if (!document.body.animate) return 0;
    const skip = new Set(['SCRIPT', 'STYLE', 'LINK', 'META', 'NOSCRIPT', 'BR', 'SVG', 'PATH']);
    const vw = window.innerWidth, vh = window.innerHeight;
    const candidates = [];

    document.body.querySelectorAll('*').forEach((el) => {
      if (skip.has(el.tagName)) return;
      if (el.closest('#mm-hongo, #mm-panel, #mm-sweep, #mm-veil, .mm-portal, .mm-spark')) return;
      const r = el.getBoundingClientRect();
      if (r.width < 20 || r.height < 12) return;
      if (r.bottom < 0 || r.top > vh || r.right < 0 || r.left > vw) return;
      if (r.width * r.height > vw * vh * 0.6) return; // no animar contenedores enormes
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      candidates.push({ el, display: getComputedStyle(el).display, d: Math.hypot(cx - origin.x, cy - origin.y) });
    });

    candidates.sort((a, b) => a.d - b.d);
    const picked = candidates.slice(0, CONFIG.magicMaxElements);
    const maxD = picked.length ? picked[picked.length - 1].d || 1 : 1;

    picked.forEach(({ el, display, d }, i) => {
      const delay = (d / maxD) * 700; // la oleada sale del portal
      const dur = 1400 + Math.random() * 600;
      let kind = i % 3;
      if (display === 'inline' && kind === 1) kind = 2; // rotateY no aplica a inline

      let frames;
      if (kind === 0) {
        const lift = 6 + Math.random() * 10;
        const tilt = (Math.random() - 0.5) * 10;
        frames = [
          { transform: 'translateY(0) rotate(0deg)' },
          { transform: `translateY(-${lift}px) rotate(${tilt}deg)`, filter: 'drop-shadow(0 0 10px rgba(0,255,255,.55))' },
          { transform: 'translateY(0) rotate(0deg)' },
        ];
      } else if (kind === 1) {
        frames = [
          { transform: 'rotateY(0deg)' },
          { transform: 'rotateY(180deg)', filter: 'brightness(1.4) hue-rotate(60deg)' },
          { transform: 'rotateY(360deg)' },
        ];
      } else {
        frames = [
          { opacity: 1, filter: 'none' },
          { opacity: 0.15, filter: 'blur(3px) hue-rotate(180deg)' },
          { opacity: 1, filter: 'none' },
        ];
      }

      try {
        el.animate(frames, { duration: dur, delay, easing: 'ease-in-out' });
      } catch (_) { /* elemento no animable: se ignora */ }
    });

    return picked.length;
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
      <div class="mm-loader" aria-live="polite">
        <div class="mm-loader-text">Abriendo ${CONFIG.brand}…</div>
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

      const rect = hongo.getBoundingClientRect();
      const origin = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };

      // 1) El portal se abre desde el hongo
      const portal = document.createElement('div');
      portal.className = 'mm-portal';
      portal.style.left = origin.x + 'px';
      portal.style.top = origin.y + 'px';
      document.body.appendChild(portal);

      // 2) La página se tiñe de otro mundo
      const veil = document.createElement('div');
      veil.id = 'mm-veil';
      veil.style.setProperty('--mm-ox', origin.x + 'px');
      veil.style.setProperty('--mm-oy', origin.y + 'px');
      document.body.appendChild(veil);

      // 3) Barrido, chispas y magia sobre los elementos
      const sweep = document.createElement('div');
      sweep.id = 'mm-sweep';
      document.body.appendChild(sweep);
      sparkles();
      magicOverPage(origin);

      // 4) El mundo se revela en el panel
      setTimeout(openPanel, 600);
      setTimeout(() => {
        sweep.remove();
        veil.remove();
        portal.remove();
        busy = false;
      }, 1800);
    });

    panel.querySelector('#mm-close').addEventListener('click', closePanel);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePanel(); });
    panel.addEventListener('click', (e) => { if (e.target === panel) closePanel(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
