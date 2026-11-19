
(function(){
  var scenes = [].slice.call(document.querySelectorAll('.cine__scene'));
  if (!scenes.length) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var navs = [].slice.call(document.querySelectorAll('.cine__nav a'));

  function fit(){
    document.querySelectorAll('.cine .m-mock').forEach(function(m){
      var box = m.closest('.cine__camera').getBoundingClientRect();
      var w = +m.dataset.w, h = +m.dataset.h;
      var s = Math.min(box.width * .96 / w, box.height * .96 / h);
      m.style.setProperty('--s', s.toFixed(3));
    });
  }
  fit(); window.addEventListener('resize', fit);

  function fmt(v, f){
    if (f === 'brl') return 'R$ ' + Math.round(v).toLocaleString('pt-BR');
    if (f === 'brl2') return 'R$ ' + v.toFixed(2).replace('.', ',');
    return Math.round(v).toLocaleString('pt-BR');
  }
  function counters(root){
    if (reduce) return;
    root.querySelectorAll('[data-count]').forEach(function(el){
      var end = +el.dataset.count, f = el.dataset.fmt, t0 = null;
      (function step(t){ if (!t0) t0 = t; var p = Math.min((t - t0) / 1800, 1);
        el.textContent = fmt(end * (1 - Math.pow(1 - p, 3)), f); if (p < 1) requestAnimationFrame(step); })(performance.now());
    });
  }

  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){
      if (!e.isIntersecting) return;
      var sc = e.target;
      if (!sc.classList.contains('is-on')) { sc.classList.add('is-on'); counters(sc); }
      navs.forEach(function(a){ a.classList.toggle('is-active', a.dataset.nav === sc.dataset.scene); });
    });
  }, {threshold: .35});
  scenes.forEach(function(s){ io.observe(s); });

  /* progresso da rolagem dentro de cada cena: move a câmera e o nome gigante */
  if (!reduce) {
    var ticking = false;
    function upd(){
      var vh = window.innerHeight;
      scenes.forEach(function(s){
        var r = s.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        var p = (vh - r.top) / (vh + r.height);
        s.style.setProperty('--p', Math.max(0, Math.min(1, p)).toFixed(3));
      });
      ticking = false;
    }
    window.addEventListener('scroll', function(){ if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, {passive: true});
    upd();
  }

  /* relógio do editor e botão seguir do Instagram */
  if (!reduce) {
    var t0 = Date.now();
    var clocks = document.querySelectorAll('.cine .m-cc__bar span:first-child');
    setInterval(function(){
      var s = Math.floor(((Date.now() - t0) / 1000) % 7 * 15 / 7);
      clocks.forEach(function(c){ c.textContent = '00:' + ('0' + s).slice(-2) + ' / 00:15'; });
    }, 250);
    document.querySelectorAll('.cine .m-ig__follow').forEach(function(fb){
      var tx = fb.querySelector('em');
      function cycle(){
        setTimeout(function(){ fb.classList.add('m-done'); tx.textContent = 'Seguindo ▾'; }, 1100);
        setTimeout(function(){ fb.classList.remove('m-done'); tx.textContent = 'Seguir'; }, 8600);
      }
      cycle(); setInterval(cycle, 9000);
    });
  }
})();

(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* topo: separa o título em palavras para entrarem uma a uma */
  var t = document.querySelector('.hcine .hero__title');
  if (t) {
    var i = 0;
    [].slice.call(t.childNodes).forEach(function(n){
      if (n.nodeType === 3) {
        var frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(function(w){
          if (!w) return;
          if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(' ')); return; }
          var s = document.createElement('span'); s.className = 'hw'; s.textContent = w;
          s.style.animationDelay = (1.1 + i++ * .12) + 's'; frag.appendChild(s);
        });
        n.parentNode.replaceChild(frag, n);
      } else if (n.nodeType === 1) {
        n.classList.add('hw'); n.style.animationDelay = (1.1 + i++ * .12) + 's';
      }
    });
  }

  /* quem somos: entra em cena, conta os números e mostra o crédito final */
  var q = document.querySelector('.qcine');
  if (q) {
    function count(el){
      var txt = el.textContent, m = txt.match(/\d+/); if (!m || reduce) return;
      var end = +m[0], t0 = null;
      (function step(ts){ if (!t0) t0 = ts; var p = Math.min((ts - t0) / 1600, 1);
        el.textContent = txt.replace(m[0], Math.round(end * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(step); })(performance.now());
    }
    new IntersectionObserver(function(es, ob){
      es.forEach(function(e){ if (e.isIntersecting) { q.classList.add('is-on'); ob.disconnect(); } });
    }, {threshold: .2}).observe(q);
    var stats = q.querySelector('.about__stats');
    if (stats) new IntersectionObserver(function(es, ob){
      es.forEach(function(e){ if (e.isIntersecting) { stats.querySelectorAll('strong').forEach(count); ob.disconnect(); } });
    }, {threshold: .6}).observe(stats);
    var tag = q.querySelector('.about__tagline');
    if (tag) new IntersectionObserver(function(es, ob){
      es.forEach(function(e){ if (e.isIntersecting) { q.classList.add('qcine--end'); ob.disconnect(); } });
    }, {threshold: .9}).observe(tag);
  }

  /* progresso de rolagem: câmera do topo e nome gigante do quem somos */
  if (!reduce) {
    var hero = document.querySelector('.hcine'), ticking = false;
    function upd(){
      var vh = window.innerHeight;
      if (hero) { var r = hero.getBoundingClientRect(); hero.style.setProperty('--hp', Math.max(0, Math.min(1, -r.top / r.height)).toFixed(3)); }
      if (q) { var r2 = q.getBoundingClientRect(); if (r2.bottom > 0 && r2.top < vh) q.style.setProperty('--qp', Math.max(0, Math.min(1, (vh - r2.top) / (vh + r2.height))).toFixed(3)); }
      ticking = false;
    }
    window.addEventListener('scroll', function(){ if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, {passive: true});
    upd();
  }
})();
