/* =========================================================
   Aviso de cookies + Pixel da Meta
   O Pixel só é carregado depois que a pessoa clica em "Aceitar".
   A escolha fica salva no navegador e pode ser mudada pelo link
   "Preferências de cookies" (qualquer elemento com data-cookie-prefs).
   ========================================================= */
(function () {
  var PIXEL_ID = '1977978540106117';
  var KEY = 'filtrum-cookies';           // valores: "aceito" ou "recusado"
  var POLICY = '/privacidade/';

  function getChoice() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function setChoice(v) {
    try { localStorage.setItem(KEY, v); } catch (e) { /* navegador sem armazenamento: vale só nesta visita */ }
  }

  var pixelOn = false;
  function loadPixel() {
    if (pixelOn) return;
    pixelOn = true;
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/pt_BR/fbevents.js');
    window.fbq('set', 'autoConfig', false, PIXEL_ID);
    window.fbq('init', PIXEL_ID);
    window.fbq('track', 'PageView');
  }

  /* ---------- aviso ---------- */
  var css = '' +
    '.ck{position:fixed;z-index:9999;left:0;right:0;bottom:0;padding:0 max(12px,env(safe-area-inset-right)) calc(12px + env(safe-area-inset-bottom)) max(12px,env(safe-area-inset-left));pointer-events:none;font-family:"Manrope",system-ui,-apple-system,"Segoe UI",sans-serif}' +
    '.ck__box{pointer-events:auto;max-width:720px;margin:0 auto;display:flex;align-items:center;gap:16px;padding:16px 18px;border-radius:16px;background:rgba(7,14,34,.96);border:1px solid rgba(95,212,255,.3);box-shadow:0 18px 50px -12px rgba(0,0,0,.7);color:#F3F5FA;transform:translateY(20px);opacity:0;transition:transform .35s ease,opacity .35s ease}' +
    '.ck.is-in .ck__box{transform:none;opacity:1}' +
    '.ck__txt{flex:1;min-width:0;font-size:14px;line-height:1.5;color:#C9D3EA}' +
    '.ck__txt strong{color:#fff}' +
    '.ck__txt a{color:#D4FF24;font-weight:700}' +
    '.ck__btns{display:flex;gap:8px;flex:none}' +
    '.ck__btn{font:inherit;font-size:14px;font-weight:800;height:42px;padding:0 18px;border-radius:999px;cursor:pointer;border:1.5px solid #D4FF24;white-space:nowrap}' +
    '.ck__btn--yes{background:#D4FF24;color:#0A1430}' +
    '.ck__btn--no{background:transparent;color:#D4FF24}' +
    '.ck__btn:focus-visible{outline:2px solid #fff;outline-offset:2px}' +
    '@media (max-width:600px){.ck__box{flex-direction:column;align-items:stretch;gap:12px}.ck__btns{display:grid;grid-template-columns:1fr 1fr}}' +
    '@media (prefers-reduced-motion:reduce){.ck__box{transition:none}}';

  var bar = null;
  function showBanner() {
    if (bar) { bar.hidden = false; requestAnimationFrame(function () { bar.classList.add('is-in'); }); return; }
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    bar = document.createElement('div');
    bar.className = 'ck';
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-live', 'polite');
    bar.setAttribute('aria-label', 'Aviso de cookies');
    bar.innerHTML =
      '<div class="ck__box">' +
        '<p class="ck__txt"><strong>Usamos cookies</strong> para medir as visitas e melhorar nossos anúncios no Facebook e Instagram. Você escolhe se aceita. <a href="' + POLICY + '">Política de privacidade</a></p>' +
        '<div class="ck__btns">' +
          '<button type="button" class="ck__btn ck__btn--no" data-ck="recusado">Recusar</button>' +
          '<button type="button" class="ck__btn ck__btn--yes" data-ck="aceito">Aceitar</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(bar);
    bar.addEventListener('click', function (e) {
      var b = e.target.closest('[data-ck]');
      if (!b) return;
      var v = b.getAttribute('data-ck');
      var mudouParaRecusa = v === 'recusado' && getChoice() === 'aceito';
      setChoice(v);
      hideBanner();
      if (v === 'aceito') loadPixel();
      // quem aceitou e depois recusou: recarrega para o Pixel parar nesta visita
      if (mudouParaRecusa && pixelOn) location.reload();
    });
    requestAnimationFrame(function () { bar.classList.add('is-in'); });
  }
  function hideBanner() {
    if (!bar) return;
    bar.classList.remove('is-in');
    setTimeout(function () { bar.hidden = true; }, 350);
  }

  /* ---------- clique no WhatsApp conta como Contato (só com o Pixel ligado) ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href*="wa.me"]');
    if (!a || !pixelOn || typeof window.fbq !== 'function') return;
    window.fbq('track', 'Contact', { origem: a.getAttribute('data-track') || 'sem-origem' });
  }, true);

  /* ---------- link para rever a escolha ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-cookie-prefs]');
    if (!t) return;
    e.preventDefault();
    showBanner();
  });

  function start() {
    var c = getChoice();
    if (c === 'aceito') loadPixel();
    else if (c !== 'recusado') showBanner();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
