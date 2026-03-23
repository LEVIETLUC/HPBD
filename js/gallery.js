/* gallery.js — Strip → 3D Carousel → Scatter layout */
(function () {
    'use strict';

    // ── IMAGE LIST ────────────────────────────────────────────────────────────
    const IMAGE_LIST = [
        // .jpg files
        'image/ange1.jpg', 'image/ange2.jpg', 'image/ange3.jpg', 'image/ange6.jpg', 'image/ava1.jpg',
        // .png files
        'image/ange4.png', 'image/ange5.png', 'image/ange7.png', 'image/ange8.png',
        'image/ange9.png', 'image/ange10.png', 'image/ang11.png', 'image/ange12.png',
        'image/ange13.png', 'image/ange14.png', 'image/ange15.png', 'image/ange16.jpg',
    ];

    const loadedSrcs = new Set();

    function preloadImages(list) {
        return Promise.allSettled(
            list.map(src => new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    if (!loadedSrcs.has(src)) { loadedSrcs.add(src); resolve(src); }
                    else reject('dup');
                };
                img.onerror = reject;
                img.src = src;
            }))
        ).then(results =>
            results.filter(r => r.status === 'fulfilled').map(r => r.value)
        );
    }

    // ── PHASE 1: STRIP SLIDE ──────────────────────────────────────────────────
    function buildStrip(images) {
        const strip = document.getElementById('gallery-strip');
        if (!strip) return;
        strip.innerHTML = '';

        images.forEach((src, i) => {
            const wrap = document.createElement('div');
            wrap.className = 'strip-img-wrap';
            const img = document.createElement('img');
            img.src = src;
            img.alt = `Memory ${i + 1}`;
            wrap.appendChild(img);
            strip.appendChild(wrap);
        });

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                strip.classList.add('strip-slide');
                const wraps = strip.querySelectorAll('.strip-img-wrap');
                wraps.forEach((w, i) => {
                    setTimeout(() => w.classList.add('img-revealed'), 300 + i * 200);
                });
            });
        });
    }

    // ── PHASE 2: 3D CAROUSEL (10 seconds) ────────────────────────────────────
    function buildCarousel(images) {
        const screen = document.getElementById('gallery-screen');
        if (!screen) return;

        // Remove old carousel if re-init
        const existing = document.getElementById('gallery-carousel');
        if (existing) existing.remove();

        const CAROUSEL_DURATION = 5000; // ms

        // Cap items on carousel to avoid overcrowding
        const items = images.slice(0, Math.min(images.length, 10));
        const count = items.length;
        const angleStep = 360 / count;

        // Radius scales with viewport
        const radius = Math.min(window.innerWidth, window.innerHeight) * 0.45;

        const wrapper = document.createElement('div');
        wrapper.id = 'gallery-carousel';
        wrapper.className = 'gallery-carousel';

        const ring = document.createElement('div');
        ring.className = 'carousel-ring';

        items.forEach((src, i) => {
            const card = document.createElement('div');
            card.className = 'carousel-card';
            card.style.cssText = `
                transform: rotateY(${i * angleStep}deg) translateZ(${radius}px);
                animation-delay: ${(i / count) * -CAROUSEL_DURATION}ms;
            `;
            const img = document.createElement('img');
            img.src = src;
            img.alt = `Memory ${i + 1}`;
            card.appendChild(img);
            ring.appendChild(card);
        });

        wrapper.appendChild(ring);
        screen.appendChild(wrapper);

        // Fade in the carousel
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                wrapper.classList.add('carousel-visible');
            });
        });

        // After 10s, fade out carousel and move to scatter
        return new Promise(resolve => {
            setTimeout(() => {
                wrapper.classList.add('carousel-exit');
                setTimeout(() => {
                    wrapper.remove();
                    resolve();
                }, 800);
            }, CAROUSEL_DURATION);
        });
    }

    // ── PHASE 3: SCATTER ──────────────────────────────────────────────────────
    function scatterImages(images) {
        const container = document.getElementById('gallery-scatter');
        if (!container) return;
        container.classList.remove('hidden');
        container.innerHTML = '';

        const VW = window.innerWidth;
        const VH = window.innerHeight;
        const TITLE_H = 160;
        const PAD = 12; // gap between images

        const total = Math.min(15, images.length); // show max 15 photos

        // ── Find optimal cols that minimizes empty cells ──────────────────
        // Try cols near the ideal aspect-ratio value and pick the one with
        // the fewest wasted cells (ties broken by aspect ratio closeness).
        const aspectRatio = VW / (VH - TITLE_H);
        const targetCols = Math.sqrt(total * aspectRatio);
        let cols = 2, bestScore = Infinity;
        for (let c = Math.max(2, Math.floor(targetCols) - 1); c <= Math.ceil(targetCols) + 2; c++) {
            const r = Math.ceil(total / c);
            const empty = c * r - total;           // empty slots in grid
            const aspectDiff = Math.abs(c / r - aspectRatio);
            const score = empty * 3 + aspectDiff;  // penalise empty cells heavily
            if (score < bestScore) { bestScore = score; cols = c; }
        }
        const rows = Math.ceil(total / cols);

        // Cell dimensions
        const cellW = Math.floor(VW / cols);
        const cellH = Math.floor((VH - TITLE_H) / rows);

        // Image fits inside cell with padding on each side — guarantees no overlap
        const imgW = cellW - PAD * 2;
        const imgH = cellH - PAD * 2;

        const shuffled = [...images].sort(() => Math.random() - 0.5);

        const cells = [];
        for (let r = 0; r < rows; r++)
            for (let c = 0; c < cols; c++)
                cells.push({ r, c });
        cells.sort(() => Math.random() - 0.5);

        const count = Math.min(total, cells.length);

        for (let i = 0; i < count; i++) {
            const cell = cells[i];
            const src = shuffled[i];

            // Jitter stays strictly within the padding margin — never overlaps
            const maxJitter = PAD * 0.5;
            const jitterX = (Math.random() - 0.5) * maxJitter * 2;
            const jitterY = (Math.random() - 0.5) * maxJitter * 2;

            const left = cell.c * cellW + PAD + jitterX;
            const top = TITLE_H + cell.r * cellH + PAD + jitterY;
            const rot = (Math.random() - 0.5) * 8;

            const div = document.createElement('div');
            div.className = 'scatter-img';
            div.style.cssText = `left:${left}px; top:${top}px; --rot:${rot}deg; width:${imgW}px; height:${imgH}px;`;

            const img = document.createElement('img');
            img.src = src;
            img.alt = `Memory ${i + 1}`;
            div.appendChild(img);
            container.appendChild(div);

            setTimeout(() => div.classList.add('img-popped'), i * 100 + 200);
        }
    }

    // ── MAIN ENTRY ────────────────────────────────────────────────────────────
    async function initGallery() {
        const images = await preloadImages(IMAGE_LIST);

        if (images.length === 0) {
            console.warn('[gallery.js] No gallery images found. Add image/angeX.jpg files.');
            const scatter = document.getElementById('gallery-scatter');
            if (scatter) {
                scatter.classList.remove('hidden');
                scatter.innerHTML = `
                    <div style="
                        position:absolute; top:50%; left:50%;
                        transform:translate(-50%,-50%);
                        text-align:center; color:rgba(255,255,255,0.5);
                        font-family:'Dancing Script',cursive; font-size:1.4rem;
                    ">
                        📷 Add your photos as<br/>image/ange1.jpg, ange2.jpg …
                    </div>`;
            }
            return;
        }

        // Phase 1: Strip slide in
        buildStrip(images);

        // Phase 2: After strip done → fade out strip → 3D Carousel
        const stripDuration = 1200 + images.length * 200 + 800;
        setTimeout(async () => {
            // Fade strip out
            const strip = document.getElementById('gallery-strip');
            if (strip) {
                strip.style.transition = 'opacity 0.5s ease';
                strip.style.opacity = '0';
                setTimeout(() => strip.style.display = 'none', 500);
            }

            // Wait a moment then show carousel
            await new Promise(r => setTimeout(r, 600));

            // Phase 2: 3D Carousel (returns promise that resolves after 10s)
            await buildCarousel(images);

            // Phase 3: Scatter
            scatterImages(images);

            // Phase 4: Show gift teaser after last image pops in
            const teaserDelay = Math.min(15, images.length) * 100 + 600;
            setTimeout(() => {
                const teaser = document.getElementById('gift-teaser');
                if (teaser) {
                    teaser.classList.remove('hidden');
                    const btn = document.getElementById('gift-teaser-btn');
                    if (btn) {
                        btn.addEventListener('click', () => {
                            window.AppController.showGiftRules();
                        }, { once: true });
                    }
                }
            }, teaserDelay);
        }, stripDuration);
    }

    window.GalleryModule = { init: initGallery };
})();
