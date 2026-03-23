/* countdown.js — Real clock countdown to midnight */
(function () {
    'use strict';

    // ── CONFIG ──────────────────────────────────
    // TEST_MODE = true  → countdown from 5 seconds then trigger (for testing)
    // TEST_MODE = false → real clock, triggers at exact midnight 00:00:00
    const TEST_MODE = true;
    const TEST_SECONDS = 5;

    let intervalId = null;
    let triggered = false;
    let testRemaining = TEST_SECONDS;

    function pad(n) { return String(Math.floor(n)).padStart(2, '0'); }

    function getSecondsUntilMidnight() {
        const now = new Date();
        const midnight = new Date(now);
        midnight.setHours(24, 0, 0, 0);
        return Math.max(0, Math.floor((midnight - now) / 1000));
    }

    function updateDisplay(secs) {
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        const s = secs % 60;
        const th = document.getElementById('t-h');
        const tm = document.getElementById('t-m');
        const ts = document.getElementById('t-s');
        if (th) th.textContent = pad(h);
        if (tm) tm.textContent = pad(m);
        if (ts) ts.textContent = pad(s);
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

        if (TEST_MODE) {
            // Show current remaining seconds, then decrement
            updateDisplay(testRemaining);
            if (testRemaining <= 0) {
                triggerCelebration();
                return;
            }
            testRemaining--;
        } else {
            const secs = getSecondsUntilMidnight();
            updateDisplay(secs);
            if (secs === 0) {
                triggerCelebration();
            }
        }
    }

    function startCountdown() {
        // Show initial value immediately, then tick every second
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
