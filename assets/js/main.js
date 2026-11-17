/* =========================================================
   FILTRUM — interações e efeitos "IA" da landing page
   ========================================================= */
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const NS = 'http://www.w3.org/2000/svg';

  /* Ano no rodapé */
  const ano = $('#ano');
  if (ano) ano.textContent = new Date().getFullYear();

  /* =======================================================
     1. ÍCONES VIVOS
     Cada <svg><use/></svg> vira um SVG próprio com duas camadas:
     - ic-base: o desenho (se desenha ao aparecer na tela)
     - ic-trace: um pulso de luz percorrendo o contorno sem parar
     ======================================================= */
  const SHAPES = 'path,circle,rect,line,polyline,polygon,ellipse';
  $$('svg.ico').forEach((svg) => {
    const use = svg.querySelector('use');
    if (!use) return;
    const sym = document.getElementById((use.getAttribute('href') || '').slice(1));
    if (!sym) return;
    svg.setAttribute('viewBox', sym.getAttribute('viewBox'));
    use.remove();

    const stroked = sym.querySelector('.st');
    if (!stroked) { // ícone preenchido (WhatsApp)
      [...sym.childNodes].forEach((n) => svg.appendChild(n.cloneNode(true)));
      svg.classList.add('ico--fill');
      return;
    }
    const base = document.createElementNS(NS, 'g');
    base.setAttribute('class', 'ic-base');
    [...sym.childNodes].forEach((n) => base.appendChild(n.cloneNode(true)));
    const trace = base.cloneNode(true);
    trace.setAttribute('class', 'ic-trace');
    [base, trace].forEach((g) => g.querySelectorAll(SHAPES).forEach((el) => el.setAttribute('pathLength', '1')));
    svg.append(base, trace);
    svg.classList.add('ico--live');
    svg.style.setProperty('--tr-delay', `${-(Math.random() * 3).toFixed(2)}s`);
    svg.style.setProperty('--tr-dur', `${(2.6 + Math.random() * 1.6).toFixed(2)}s`);
    svg.style.setProperty('--icd', `${(Math.random() * 0.25).toFixed(2)}s`);
  });

  // redesenha um ícone (usado ao trocar de aba e ao passar o mouse)
  const redraw = (svg) => {
    svg.classList.remove('is-drawn');
    void svg.getBoundingClientRect();
    svg.classList.add('is-drawn');
  };

  const liveIcons = $$('.ico--live');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const ioIcons = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-drawn'); ioIcons.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    liveIcons.forEach((i) => ioIcons.observe(i));
  } else {
    liveIcons.forEach((i) => i.classList.add('is-drawn'));
  }
  // hover: o ícone se redesenha
  $$('.features li, .segment, .pain, .tab, .chip').forEach((el) => {
    el.addEventListener('pointerenter', () => $$('.ico--live', el).forEach(redraw));
  });
  // atrasos diferentes para os ícones "flutuarem" fora de sincronia
  $$('.tile').forEach((t) => t.style.setProperty('--bob', `${-(Math.random() * 3).toFixed(2)}s`));

  /* =======================================================
     2. Header ao rolar + botão flutuante
     ======================================================= */
  const header = $('.header');
  const whatsFloat = $('.whats-float');
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      if (header) header.classList.toggle('is-scrolled', y > 20);
      if (whatsFloat) whatsFloat.classList.toggle('is-visible', y > window.innerHeight * 0.6);
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* =======================================================
     3. Menu mobile
     ======================================================= */
  const toggle = $('#menuToggle');
  const nav = $('#nav');
  if (toggle && nav && header) {
    const setMenu = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      nav.classList.toggle('is-open', open);
      header.classList.toggle('menu-open', open);
    };
    toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
    $$('a', nav).forEach((a) => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  }

  /* =======================================================
     4. Texto "decodificando" (rótulos em fonte mono)
     ======================================================= */
  const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+<>/';
  const scramble = (el) => {
    if (reduceMotion) return;
    const final = el.dataset.text || el.textContent;
    el.dataset.text = final;
    const total = 26;
    let frame = 0;
    const tick = () => {
      let out = '';
      for (let i = 0; i < final.length; i++) {
        const done = (frame / total) * final.length > i;
        out += final[i] === ' ' || done ? final[i] : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = out;
      if (frame++ < total) requestAnimationFrame(tick);
      else el.textContent = final;
    };
    tick();
  };

  /* =======================================================
     5. Revelar ao rolar (cascata entre irmãos)
     ======================================================= */
  const groups = new Map();
  $$('.reveal').forEach((el) => {
    const parent = el.parentElement;
    const i = groups.get(parent) || 0;
    el.style.setProperty('--d', `${Math.min(i * 0.08, 0.6)}s`);
    groups.set(parent, i + 1);
  });
  $$('.segment').forEach((el, i) => el.style.setProperty('--n', i));

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        const eb = entry.target.matches('.eyebrow') ? entry.target : $('.eyebrow', entry.target);
        if (eb) setTimeout(() => scramble(eb), 150);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    $$('.reveal').forEach((el) => io.observe(el));
    // rede de segurança: o que já está na tela nunca fica invisível
    setTimeout(() => {
      $$('.reveal:not(.is-visible)').forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-visible');
      });
    }, 2500);
  } else {
    $$('.reveal').forEach((el) => el.classList.add('is-visible'));
  }

  /* =======================================================
     6. Abas de serviços
     ======================================================= */
  const tabsRoot = $('[data-tabs]');
  if (tabsRoot) {
    const tabs = $$('[role="tab"]', tabsRoot);
    const panels = $$('[role="tabpanel"]', tabsRoot);
    const AUTO_MS = 7000;
    let current = 0;
    let timer = null;
    let userTookOver = false;
    let inView = false;

    tabsRoot.style.setProperty('--tab-time', `${AUTO_MS}ms`);
    panels.forEach((p) => $$('.features li', p).forEach((li, i) => li.style.setProperty('--i', i)));

    const show = (index, focus = false) => {
      current = (index + tabs.length) % tabs.length;
      tabs.forEach((t, i) => {
        const on = i === current;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
      });
      panels.forEach((p, i) => {
        const on = i === current;
        p.hidden = false;
        p.inert = !on;
        p.setAttribute('aria-hidden', String(!on));
        p.classList.toggle('is-active', on);
        if (on) {
          $$('.ico--live', p).forEach(redraw);
          const tag = $('.panel__tag', p);
          if (tag) scramble(tag);
        }
      });
      const bar = $('.tab__progress', tabs[current]);
      if (bar) { bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = ''; }
      if (focus) tabs[current].focus();
    };

    const stopAuto = () => {
      userTookOver = true;
      tabsRoot.classList.remove('is-auto');
      clearInterval(timer);
    };
    const startAuto = () => {
      // no celular não troca sozinho: a altura mudaria enquanto a pessoa lê
      if (reduceMotion || userTookOver || timer || window.innerWidth <= 1024) return;
      tabsRoot.classList.add('is-auto');
      show(current);
      timer = setInterval(() => { if (inView && !document.hidden) show(current + 1); }, AUTO_MS);
    };

    tabs.forEach((t, i) => {
      t.addEventListener('click', () => { stopAuto(); show(i); });
      t.addEventListener('keydown', (e) => {
        const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
        if (e.key in keys) { e.preventDefault(); stopAuto(); show(current + keys[e.key], true); }
        if (e.key === 'Home') { e.preventDefault(); stopAuto(); show(0, true); }
        if (e.key === 'End') { e.preventDefault(); stopAuto(); show(tabs.length - 1, true); }
      });
    });
    panels.forEach((p) => p.addEventListener('pointerdown', stopAuto));
    show(0);

    // Link direto para um serviço (ex.: /#trafego-pago, vindo da página de links)
    const HASH_TABS = { 'trafego-pago': 0, 'landing-pages': 1, 'edicao-de-videos': 2, 'social-media': 3 };
    const openFromHash = () => {
      const key = decodeURIComponent(location.hash.slice(1));
      if (!(key in HASH_TABS)) return;
      stopAuto();
      show(HASH_TABS[key]);
      const section = $('#servicos');
      if (!section) return;
      const go = () => setTimeout(() => section.scrollIntoView({ behavior: 'instant', block: 'start' }), 120);
      if (document.readyState === 'complete') go(); else window.addEventListener('load', go, { once: true });
    };
    openFromHash();
    window.addEventListener('hashchange', openFromHash);

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        if (inView) startAuto();
      }, { threshold: 0.35 }).observe(tabsRoot);
    }
  }

  /* =======================================================
     7. Rede neural no fundo do hero
     ======================================================= */
  const canvas = $('#neural');
  const hero = $('.hero');
  if (canvas && hero && !reduceMotion) {
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, nodes = [], raf = 0, running = false;
    const mouse = { x: -9999, y: -9999 };
    const LINK = 130;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(90, (w * h) / 15000));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 0.7, lime: Math.random() < 0.14,
      }));
    };

    const frame = () => {
      ctx.clearRect(0, 0, w, h);
      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
        const dx = mouse.x - n.x, dy = mouse.y - n.y;
        if (dx * dx + dy * dy < 160 * 160) { n.x += dx * 0.004; n.y += dy * 0.004; }
      }
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK) {
            ctx.strokeStyle = `rgba(95, 212, 255, ${(1 - d / LINK) * 0.32})`;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        const dm = Math.hypot(a.x - mouse.x, a.y - mouse.y);
        if (dm < 170) {
          ctx.strokeStyle = `rgba(212, 255, 36, ${(1 - dm / 170) * 0.55})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
      }
      for (const n of nodes) {
        ctx.fillStyle = n.lime ? 'rgba(212, 255, 36, .95)' : 'rgba(190, 230, 255, .85)';
        ctx.shadowColor = n.lime ? '#D4FF24' : '#5FD4FF';
        ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.shadowBlur = 0;
      raf = requestAnimationFrame(frame);
    };

    const start = () => { if (!running) { running = true; raf = requestAnimationFrame(frame); } };
    const stop = () => { running = false; cancelAnimationFrame(raf); };

    resize();
    window.addEventListener('resize', () => { resize(); });
    hero.addEventListener('pointermove', (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    hero.addEventListener('pointerleave', () => { mouse.x = -9999; mouse.y = -9999; });
    new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop())).observe(hero);
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  }

  /* =======================================================
     8. Brilho que segue o cursor + parallax na foto
     ======================================================= */
  const glow = $('.cursor-glow');
  if (glow && finePointer && !reduceMotion) {
    let gx = 0, gy = 0, pending = false;
    window.addEventListener('pointermove', (e) => {
      gx = e.clientX; gy = e.clientY;
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        glow.style.setProperty('--cx', `${gx}px`);
        glow.style.setProperty('--cy', `${gy}px`);
        pending = false;
      });
    }, { passive: true });
  }

  const orbit = $('.orbit');
  if (orbit && hero && !reduceMotion && finePointer) {
    hero.addEventListener('pointermove', (e) => {
      orbit.style.setProperty('--px', `${(e.clientX / window.innerWidth - 0.5) * 20}px`);
      orbit.style.setProperty('--py', `${(e.clientY / window.innerHeight - 0.5) * 20}px`);
    });
    hero.addEventListener('pointerleave', () => {
      orbit.style.setProperty('--px', '0px');
      orbit.style.setProperty('--py', '0px');
    });
  }

  /* =======================================================
     9. Notificação de WhatsApp em loop
     ======================================================= */
  const notif = $('#notif');
  const notifText = $('#notifText');
  const mensagens = [
    'Oi! Vi seu anúncio e quero um orçamento.',
    'Bom dia! Vocês têm horário essa semana?',
    'Olá, quero saber mais sobre o serviço.',
    'Vi o vídeo no Instagram, como faço pra comprar?',
    'Oi! Ainda tem disponível?',
  ];
  if (notif && notifText && !reduceMotion) {
    let i = 0;
    setInterval(() => {
      notif.classList.add('is-hidden');
      setTimeout(() => {
        i = (i + 1) % mensagens.length;
        notifText.textContent = mensagens[i];
        notif.classList.remove('is-hidden');
      }, 500);
    }, 3800);
  }

  /* =======================================================
     10. FAQ: uma pergunta aberta por vez
     ======================================================= */
  const faqItems = $$('.faq__item');
  faqItems.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (item.open) faqItems.forEach((other) => { if (other !== item) other.open = false; });
    });
  });

  /* =======================================================
     11. Rastreamento de cliques no WhatsApp
     Quando o Pixel da Meta / Google Tag forem instalados,
     estes eventos passam a ser registrados automaticamente.
     ======================================================= */
  $$('[data-track]').forEach((el) => {
    el.addEventListener('click', () => {
      const origem = el.dataset.track;
      if (typeof window.gtag === 'function') window.gtag('event', 'clique_whatsapp', { origem });
    });
  });
})();
