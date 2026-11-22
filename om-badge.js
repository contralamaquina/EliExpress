// ============================================================
// om-badge.js — loader liviano del honguito de otromundo
// Muestra el hongo y descarga om-badge-fx.js (el show completo +
// panel) recién cuando alguien lo toca, lo apunta o lo enfoca.
//
// Uso (ambos archivos juntos, en tu dominio o en el del sitio):
//   <script src="https://TU-DOMINIO/om-badge.js" defer
//           data-brand="otromundo" data-price="$150"
//           data-whatsapp="59894691690"></script>
//
// Opciones data-*  (todas opcionales; sin ellas rigen los defaults del fx):
//   brand, kicker, badge, headline, sub, price, price-note
//   features="a|b|c"   items="a|b|c"
//   whatsapp="598..."  (número o URL completa de wa.me)
//   sound="true"       sonido + vibración (apagado por defecto)
//   effects="lite"     no anima ni toca elementos del sitio (default: full)
//   position="right"   esquina del hongo (default: left)
//   fx="URL"           si om-badge-fx.js está en otro lado
// ============================================================
(function () {
  if (window.__omBadgeLoaded) return;
  window.__omBadgeLoaded = true;

  const script = document.currentScript || document.querySelector('script[src*="om-badge"]');
  const ds = (script && script.dataset) || {};

  // ---------- config desde data-* ----------
  const list = (v) => v.split('|').map((x) => x.trim()).filter(Boolean);
  const cfg = {};
  ['brand', 'kicker', 'badge', 'headline', 'sub', 'price', 'effects', 'sound'].forEach((k) => { if (ds[k]) cfg[k] = ds[k]; });
  if (ds.priceNote) cfg.priceNote = ds.priceNote;
  if (ds.features) cfg.features = list(ds.features);
  if (ds.items) cfg.priceItems = list(ds.items);
  if (ds.whatsapp) {
    cfg.whatsapp = /^https?:/i.test(ds.whatsapp)
      ? ds.whatsapp
      : 'https://wa.me/' + ds.whatsapp.replace(/\D/g, '') + '?text=' + encodeURIComponent('¡Hola! Vi que hacen páginas web, me gustaría saber más 🚀');
  }
  window.__OM_BADGE_CFG = cfg;

  const fxUrl = ds.fx || (script && script.src ? new URL('om-badge-fx.js', script.src).href : 'om-badge-fx.js');
  const side = ds.position === 'right' ? 'right' : 'left';

  const css = `
    #mm-hongo { position: fixed; ${side}: 14px; bottom: calc(10px + env(safe-area-inset-bottom, 0px)); width: 22px; height: 24px; z-index: 9998; cursor: pointer; border: 0; padding: 0; background: none; -webkit-tap-highlight-color: transparent; transform-origin: 50% 100%; }
    #mm-hongo::after { content: ""; position: absolute; inset: -12px; } /* área de toque ~46x48 sin agrandar el dibujo */
    #mm-hongo svg { width: 100%; height: 100%; overflow: visible; transition: transform .5s ease; }
    #mm-hongo .mm-cap { transform-origin: 50% 100%; animation: mmBreathe 5s ease-in-out infinite; }
    #mm-hongo .mm-glow { animation: mmGlow 3.6s ease-in-out infinite; }
    #mm-hongo:hover svg { transform: translateY(-2px) rotate(-3deg); }
    #mm-hongo:focus-visible { outline: 2px solid #d9a441; outline-offset: 4px; border-radius: 50%; }
    @keyframes mmBreathe { 0%,100% { transform: scale(1); } 50% { transform: scale(1.03); } }
    @keyframes mmGlow { 0%,100% { opacity: .3; } 50% { opacity: .7; } }
    @media (prefers-reduced-motion: reduce) { #mm-hongo .mm-cap, #mm-hongo .mm-glow { animation: none; } }
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

  function mount() {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    const hongo = document.createElement('button');
    hongo.id = 'mm-hongo';
    hongo.type = 'button';
    hongo.setAttribute('aria-label', 'Descubrir ' + (cfg.brand || 'otromundo'));
    hongo.innerHTML = hongoSVG;
    document.body.appendChild(hongo);

    // Carga perezosa del fx; devuelve una promesa del handler de click.
    let loading = null;
    function load() {
      if (loading) return loading;
      loading = new Promise((resolve, reject) => {
        if (window.OtroMundoBadge) return resolve();
        const s = document.createElement('script');
        s.src = fxUrl;
        s.async = true;
        s.onload = resolve;
        s.onerror = () => reject(new Error('no se pudo cargar ' + fxUrl));
        document.head.appendChild(s);
      }).then(() => window.OtroMundoBadge.init(hongo));
      loading.catch(() => { loading = null; }); // permite reintentar en el próximo toque
      return loading;
    }

    // Precarga al apuntar/enfocar/tocar, para que el click sea instantáneo.
    const prefetch = () => { load().catch(() => {}); };
    ['pointerenter', 'focus', 'touchstart'].forEach((ev) => hongo.addEventListener(ev, prefetch, { once: true, passive: true }));

    hongo.addEventListener('click', () => {
      load().then((run) => run()).catch((e) => console.warn('[om-badge]', e.message));
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
