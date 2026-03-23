/* countdown.js — Real clock countdown to midnight */
(function () {
    'use strict';

    // ── CONFIG ──────────────────────────────────
    // Target: Midnight, March 25, 2026 (Paris Time) -> UTC+1
    const TARGET_DATE = new Date('2026-03-24T23:00:00Z');
    const TARGET_MS = TARGET_DATE.getTime();

    let intervalId = null;
    let triggered = false;
    let fallbackSeconds = 5;
    let isFallbackMode = false;

    function pad(n) { return String(Math.floor(n)).padStart(2, '0'); }

    function updateDisplay(days, hours, minutes, seconds) {
        const td = document.getElementById('t-d');
        const th = document.getElementById('t-h');
        const tm = document.getElementById('t-m');
        const ts = document.getElementById('t-s');
        if (td) td.textContent = pad(days);
        if (th) th.textContent = pad(hours);
        if (tm) tm.textContent = pad(minutes);
        if (ts) ts.textContent = pad(seconds);
    }

    function triggerCelebration() {
        if (triggered) return; // Guard against double-call
        triggered = true;
        clearInterval(intervalId);
        if (typeof window.AppController !== 'undefined') {
            window.AppController.onMidnight();
        }
    }

    function tick() {
        if (triggered) return;

        if (isFallbackMode) {
            updateDisplay(0, 0, 0, fallbackSeconds);
            if (fallbackSeconds <= 0) {
                triggerCelebration();
                return;
            }
            fallbackSeconds--;
        } else {
            const now = Date.now();
            const diff = Math.floor((TARGET_MS - now) / 1000);

            if (diff <= 0) {
                updateDisplay(0, 0, 0, 0);
                triggerCelebration();
                return;
            }

            const d = Math.floor(diff / 86400);
            const h = Math.floor((diff % 86400) / 3600);
            const m = Math.floor((diff % 3600) / 60);
            const s = diff % 60;
            
            updateDisplay(d, h, m, s);
        }
    }

    function startCountdown() {
        const now = Date.now();
        // If current time is past the target, use 5-second fallback
        if (now >= TARGET_MS) {
            isFallbackMode = true;
        }
        
        tick();
        intervalId = setInterval(tick, 1000);
    }

    // Spawn floating hearts on countdown screen
    function spawnHearts() {
        const container = document.getElementById('floating-hearts');
        if (!container) return;
        setInterval(() => {
            const h = document.createElement('span');
            h.textContent = ['❤', '💕', '🌸', '✨', '🎂', '🎉', '🎈', '🎂'][Math.floor(Math.random() * 8)];
            h.style.cssText = `
        position:absolute;
        left:${Math.random() * 95}%;
        bottom:-20px;
        font-size:${1 + Math.random() * 1.5}rem;
        opacity:0.8;
        animation: floatUp ${4 + Math.random() * 4}s ease-out forwards;
        pointer-events:none;
      `;
            container.appendChild(h);
            h.addEventListener('animationend', () => h.remove());
        }, 600);
    }

    // ── PUBLIC ───────────────────────────────────
    window.CountdownModule = {
        start: () => {
            startCountdown();
            spawnHearts();
        },
        // Test helper: expose trigger manually
        testTrigger: triggerCelebration,
    };
})();
