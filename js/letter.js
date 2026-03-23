/* letter.js — Fetch, parse, and animate the birthday letter */
(function () {
    'use strict';

    const LETTER_PATH = 'text/lettre.txt';
    const CHAR_DELAY_MS = 28; // ms per character for handwriting effect
    const LINE_PAUSE_MS = 180; // extra pause between lines

    /**
     * Parse lettre.txt lines into segments.
     * Lines fully wrapped in "..." => type: 'quoted'
     * Other lines                  => type: 'normal'
     * Empty lines                  => type: 'spacer'
     */
    function parseLetterText(text) {
        return text.split('\n').map(raw => {
            const line = raw.trim();
            if (!line) return { type: 'spacer', text: '' };
            const quotedMatch = line.match(/^"(.+)"$/);
            if (quotedMatch) return { type: 'quoted', text: quotedMatch[1] };
            return { type: 'normal', text: line };
        });
    }

    /** Build DOM nodes for all lines (characters hidden, revealed by animation). */
    function buildLetterDOM(segments) {
        const body = document.getElementById('letter-body');
        if (!body) return;
        body.innerHTML = '';

        segments.forEach((seg, i) => {
            if (seg.type === 'spacer') {
                const br = document.createElement('span');
                br.className = 'letter-line spacer';
                br.style.display = 'block';
                br.style.height = '0.6em';
                body.appendChild(br);
                return;
            }

            const line = document.createElement('span');
            line.className = `letter-line ${seg.type}`;
            line.dataset.lineIndex = i;

            // Split into individual character spans
            [...seg.text].forEach(ch => {
                if (ch === ' ') {
                    line.appendChild(document.createTextNode(' '));
                } else {
                    const span = document.createElement('span');
                    span.className = 'letter-char';
                    span.textContent = ch;
                    line.appendChild(span);
                }
            });

            body.appendChild(line);
        });
    }

    /** Animate all characters sequentially (handwriting effect). */
    function animateHandwriting(onComplete) {
        const chars = document.querySelectorAll('#letter-body .letter-char');
        let idx = 0;

        function revealNext() {
            if (idx >= chars.length) {
                if (onComplete) onComplete();
                return;
            }

            const el = chars[idx];
            el.classList.add('visible');

            // Check if next char is in a new line (add pause)
            const nextEl = chars[idx + 1];
            let delay = CHAR_DELAY_MS;
            if (nextEl) {
                const curLine = el.closest('.letter-line');
                const nextLine = nextEl.closest('.letter-line');
                if (curLine !== nextLine) delay += LINE_PAUSE_MS;
            }

            idx++;
            setTimeout(revealNext, delay);
        }

        revealNext();
    }

    /** Show the signature and "More to Come" button. */
    function showEnding() {
        const sig = document.querySelector('.sig-text');
        if (sig) sig.classList.add('visible');

        setTimeout(() => {
            const wrapper = document.getElementById('more-btn-wrapper');
            if (wrapper) wrapper.classList.remove('hidden');

            const btn = document.getElementById('more-btn');
            if (btn) {
                btn.addEventListener('click', onMoreBtnClick, { once: true });
            }
        }, 800);
    }

    function onMoreBtnClick() {
        // Slide letter to the right, then hand off to gallery
        const container = document.getElementById('letter-container');
        if (container) container.classList.add('slide-right');

        setTimeout(() => {
            if (typeof window.AppController !== 'undefined') {
                window.AppController.showGallery();
            }
        }, 1200); // 1s after slide starts
    }

    /** Main entry point. */
    async function initLetter() {
        try {
            const resp = await fetch(LETTER_PATH);
            if (!resp.ok) throw new Error(`Cannot load ${LETTER_PATH}`);
            const text = await resp.text();
            const segments = parseLetterText(text);
            buildLetterDOM(segments);
            // Small delay before starting animation (letter paper settles)
            setTimeout(() => animateHandwriting(showEnding), 600);
        } catch (err) {
            console.warn('[letter.js] Could not load letter:', err.message);
            // Fallback content
            buildLetterDOM([
                { type: 'quoted', text: 'HAPPY BIRTHDAY, MY LOVE!' },
                { type: 'normal', text: 'Place your letter in text/lettre.txt to show your message here.' },
                { type: 'quoted', text: 'YOU MEAN THE WORLD TO ME' },
            ]);
            setTimeout(() => animateHandwriting(showEnding), 600);
        }
    }

    // ── TEST HELPER ──────────────────────────────
    window.LetterModule = {
        init: initLetter,
        testParse: (txt) => {
            const result = parseLetterText(txt);
            console.table(result);
            return result;
        }
    };
})();
