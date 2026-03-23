/* main.js — App controller: orchestrates all screens and modules */
(function () {
    'use strict';

    // ── OVERLAY ──────────────────────────────────────────────────────────
    const overlay = document.createElement('div');
    overlay.id = 'transition-overlay';
    document.body.appendChild(overlay);

    function fadeOut(cb) {
        overlay.classList.add('fade-in');
        setTimeout(() => {
            if (cb) cb();
            overlay.classList.remove('fade-in');
            overlay.classList.add('fade-out');
            setTimeout(() => overlay.classList.remove('fade-out'), 600);
        }, 600);
    }

    // ── SCREEN MANAGEMENT ─────────────────────────────────────────────────
    const screens = {
        splash:      document.getElementById('splash-screen'),
        countdown:   document.getElementById('countdown-screen'),
        card:        document.getElementById('card-screen'),
        letter:      document.getElementById('letter-screen'),
        gallery:     document.getElementById('gallery-screen'),
        giftRules:   document.getElementById('gift-rules-screen'),
        giftSelect:  document.getElementById('gift-select-screen'),
        giftCongrats: document.getElementById('gift-congrats'),
    };

    function showScreen(name) {
        Object.values(screens).forEach(s => { if (s) s.classList.add('hidden'); });
        const s = screens[name];
        if (s) s.classList.remove('hidden');
    }

    // ── MUSIC ─────────────────────────────────────────────────────────────
    const audio = document.getElementById('bg-music');
    const musicBtn = document.getElementById('music-btn');
    let musicPlaying = false;

    function setMusicUI(playing) {
        musicPlaying = playing;
        if (!musicBtn) return;
        musicBtn.textContent = playing ? '🎵' : '🔇';
        musicBtn.classList.toggle('muted', !playing);
    }

    function playMusic() {
        if (!audio) { console.warn('[audio] No <audio> element found'); return; }
        audio.volume = 0.4;
        audio.muted = false;
        const p = audio.play();
        if (p !== undefined) {
            p.then(() => {
                console.log('[audio] Playing ✓');
                setMusicUI(true);
            }).catch(err => {
                console.warn('[audio] Autoplay blocked:', err.message);
                setMusicUI(false);
            });
        } else {
            setMusicUI(!audio.paused);
        }
    }

    // Unmute & start on very first user interaction (any click/touch)
    function unlockAudio() {
        if (!audio) return;
        audio.muted = false;
        audio.volume = 0.4;
        if (audio.paused) {
            audio.play().then(() => setMusicUI(true)).catch(() => { });
        } else {
            setMusicUI(true);
        }
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('touchstart', unlockAudio);
    }
    document.addEventListener('click', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);

    // Toggle on button click
    if (musicBtn) {
        musicBtn.addEventListener('click', () => {
            if (!audio) return;
            if (musicPlaying) {
                audio.pause();
                setMusicUI(false);
            } else {
                playMusic();
            }
        });
    }

    // ── SPLASH ───────────────────────────────────────────────────────────
    function initSplash() {
        showScreen('splash');
        const btn = document.getElementById('splash-btn');
        if (btn) {
            btn.addEventListener('click', () => {
                playMusic();
                fadeOut(initCountdown);
            }, { once: true });
        }
    }

    // ── COUNTDOWN ────────────────────────────────────────────────────────
    function initCountdown() {
        showScreen('countdown');
        window.CountdownModule.start();
    }

    // ── CARD OPENING ─────────────────────────────────────────────────────
    function initCard() {
        showScreen('card');
        const wrapper = document.getElementById('envelope-wrapper');
        const flap = document.getElementById('envelope-flap');
        const seal = document.getElementById('envelope-seal');

        if (wrapper) wrapper.classList.add('show');

        // After envelope appears, open flap
        setTimeout(() => {
            if (flap) flap.classList.add('open');
            // Seal fades out as flap opens
            if (seal) {
                seal.style.transition = 'opacity 0.4s ease 0.3s';
                seal.style.opacity = '0';
            }
        }, 800);

        // After flap opens, fly envelope away and show letter
        setTimeout(() => {
            if (wrapper) wrapper.classList.add('fly-away');
            setTimeout(() => initLetter(), 900);
        }, 2200);
    }

    // ── LETTER ───────────────────────────────────────────────────────────
    function initLetter() {
        showScreen('letter');
        window.LetterModule.init();
    }

    // ── GALLERY ──────────────────────────────────────────────────────────
    function showGallery() {
        fadeOut(() => {
            showScreen('gallery');
            window.GalleryModule.init();
        });
    }

    // ── GIFTS ─────────────────────────────────────────────────────────────
    function showGiftRules() {
        fadeOut(() => {
            showScreen('giftRules');
            // Wire "start" button once
            const btn = document.getElementById('gift-rules-btn');
            if (btn) {
                btn.onclick = () => {
                    window.GiftModule.showSelectScreen();
                    showScreen('giftSelect');
                };
            }
        });
    }

    // ── PUBLIC API (for modules to call back into) ──────────────────────
    window.AppController = {
        onMidnight: () => fadeOut(initCard),
        showGallery,
        showGiftRules,
        // Called by GiftModule when accept/retry needs to swap screens
        showScreen,
    };

    // ── BOOT ─────────────────────────────────────────────────────────────
    document.addEventListener('DOMContentLoaded', initSplash);
})();
