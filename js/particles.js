/* particles.js — Animated star/particle canvas renderer */
(function () {
  'use strict';

  const configs = {
    'splash-canvas':    { count: 180, speed: 0.25, sizeRange: [0.5, 2.5], color: 'rgba(255,255,255,VAL)', twinkle: true },
    'countdown-canvas': { count: 220, speed: 0.3,  sizeRange: [0.5, 3],   color: 'rgba(255,180,200,VAL)', twinkle: true },
    'card-canvas':      { count: 120, speed: 0.2,  sizeRange: [1, 3],     color: 'rgba(255,215,100,VAL)', twinkle: true, hearts: true },
    'letter-canvas':    { count: 0,   speed: 0,    sizeRange: [1,1],      color: '',                       twinkle: false },
    'gallery-canvas':   { count: 160, speed: 0.4,  sizeRange: [0.5, 2.5], color: 'rgba(200,160,255,VAL)', twinkle: true },
  };

  const instances = {};

  function createInstance(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const cfg = configs[canvasId];
    if (!cfg || cfg.count === 0) return;

    const ctx = canvas.getContext('2d');
    let W, H, particles;
    let raf;

    function resize() {
      W = canvas.width  = canvas.parentElement.clientWidth;
      H = canvas.height = canvas.parentElement.clientHeight;
    }

    function mkParticle() {
      return {
        x: Math.random() * (W || window.innerWidth),
        y: Math.random() * (H || window.innerHeight),
        r: cfg.sizeRange[0] + Math.random() * (cfg.sizeRange[1] - cfg.sizeRange[0]),
        dx: (Math.random() - 0.5) * cfg.speed,
        dy: -cfg.speed * (0.3 + Math.random() * 0.7),
        alpha: 0.3 + Math.random() * 0.7,
        dAlpha: cfg.twinkle ? (Math.random() * 0.015 + 0.003) * (Math.random() < 0.5 ? 1 : -1) : 0,
        heart: cfg.hearts && Math.random() < 0.08,
        rot: Math.random() * Math.PI * 2,
      };
    }

    function init() {
      resize();
      particles = Array.from({ length: cfg.count }, mkParticle);
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.x  += p.dx;
        p.y  += p.dy;
        p.alpha += p.dAlpha;
        if (p.alpha > 1)  { p.alpha = 1;  p.dAlpha *= -1; }
        if (p.alpha < 0.1){ p.alpha = 0.1; p.dAlpha *= -1; }
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < -20) { p.y = H + 10; p.x = Math.random() * W; }

        const color = cfg.color.replace('VAL', p.alpha);

        if (p.heart) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.font = `${p.r * 6}px serif`;
          ctx.fillStyle = `rgba(242,44,107,${p.alpha})`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('❤', 0, 0);
          ctx.restore();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
        }
      });
      raf = requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize);
    init();
    draw();

    instances[canvasId] = { start: () => { if (!raf) draw(); }, stop: () => cancelAnimationFrame(raf) };
  }

  // Init all canvases
  document.addEventListener('DOMContentLoaded', () => {
    Object.keys(configs).forEach(createInstance);
  });

  window.ParticlesBg = instances;
})();
