/* gifts.js — Gift selection mini-game */
(function () {
    'use strict';

    // ── GIFT DATA ─────────────────────────────────────────────────────────────
    const GIFTS = [
        {
            id: 1, emoji: '❤️', label: 'Hộp quà 1',
            text: 'Tặng em pé trái tym của anh, nhờ em chăm sóc và giữ nó giúp anh nhoa. Trái tym tui dễ bị tổn thương lém đóa. Nên Mia phải giữ nó cẩn thận vào nhoa.',
            images: ['image/heart1.png', 'image/heart2.png', 'image/heart3.png'],
        },
        {
            id: 2, emoji: '🥺', label: 'Hộp quà 2',
            text: 'Louis hiền nên dễ bị lừa lém, nên có gì nhờ em pé luôn bên cạnh anh để không ai có thể gạt anh nhá. Với lại em pé phải luôn ở bên cạnh anh để anh không bị cô đơn nữa nhoa.',
            images: ['image/shy1.png', 'image/shy2.png'],
        },
        {
            id: 3, emoji: '🛡️', label: 'Hộp quà 3',
            text: 'Anh không biết trước đó em đã phải chịu đựng những gì, những tổn thương, những nỗi buồn. Nhưng em yên tâm nha, khi em cho phép anh đến bên cạnh em, anh sẽ bảo vệ em, không để em phải thiệt thòi, chịu đựng bất kỳ tổn thương nào nữa, vậy nha. Anh yêu em, Phương Anh.',
            images: ['image/oc3.jpg'],
        },
        {
            id: 4, emoji: '🍜', label: 'Hộp quà 4',
            text: 'Tui nuôi em, tui không cho phép bản thân nhìn em bị thiệt thòi, bị buồn phiền, nên em cứ giữ anh bên cạnh để không còn đau lòng nữa nhaa. Đừng chịu đau 1 mình nữa nhoa.',
            images: ['image/cool1.png', 'image/cool2.png', 'image/cool3.png', 'image/cool4.png'],
        },
        {
            id: 5, emoji: '💌', label: 'Hộp quà 5',
            text: 'Dù chỉ có 1 cơ hội nhỏ nhất thôi anh cũng sẽ đến và tỏ tình em: Cho anh được làm bạn trai của chị pé nhá?',
            images: ['image/oc5.jpg'],
        },
        {
            id: 6, emoji: '🌙', label: 'Hộp quà 6',
            text: 'Anh muốn được đồng hành cùng em, anh muốn được chăm sóc em, anh muốn được lo cho em, anh muốn được là chỗ dựa vững chắc nhất cho em. Thế nên Mia cho phép anh cơ hội được thực hiện điều đó nhá.',
            images: ['image/oc6.jpg'],
        },
        {
            id: 7, emoji: '😊', label: 'Hộp quà 7',
            text: 'Tặng cho em pé 1 người iu cute để Mía lúc nào cũng cười cười nói nói mỗi ngày. Nguồn năng lượng tích cực của Phương Anh nè.',
            images: ['image/cute1.png', 'image/cute2.png', 'image/cute3.png', 'image/cute4.png'],
        },
        {
            id: 8, emoji: '🤝', label: 'Hộp quà 8',
            text: 'Rẻ nhất là lời hứa, đắt nhất là niềm tin. Tụi mình làm 1 cuộc giao dịch nghen: Anh lấy thứ rẻ nhất của anh để đổi lấy thứ đắt nhất của anh, em cho anh cơ hội anh sẽ cho em hạnh phúc.',
            images: ['image/oc8.jpg'],
        },
    ];

    // ── STATE ─────────────────────────────────────────────────────────────────
    let pickCount = 0;   // 0..3
    let openedIds = [];  // gift IDs already previewed
    let currentGift = null; // gift being previewed in popup
    let typewriterTimer = null;

    function isOpened(id) { return openedIds.includes(id); }
    function remainingPicks() { return 3 - pickCount; }

    // ── SHOW GIFT RULES SCREEN ────────────────────────────────────────────────
    function showRules() {
        _hideAll();
        document.getElementById('gift-rules-screen').classList.remove('hidden');
    }

    // ── SHOW GIFT SELECT SCREEN ───────────────────────────────────────────────
    function showSelectScreen() {
        _hideAll();
        const screen = document.getElementById('gift-select-screen');
        screen.classList.remove('hidden');
        _buildGrid();
    }

    function _hideAll() {
        ['gift-rules-screen', 'gift-select-screen'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add('hidden');
        });
        _closePopup();
    }

    function _buildGrid() {
        const grid = document.getElementById('gift-grid');
        if (!grid) return;
        grid.innerHTML = '';

        GIFTS.forEach(gift => {
            const box = document.createElement('div');
            box.className = 'gift-box' + (isOpened(gift.id) ? ' opened' : '');
            box.dataset.giftId = gift.id;
            box.innerHTML = `
                <div class="gift-box-inner">
                    <div class="gift-lid"><span class="gift-ribbon">🎀</span></div>
                    <div class="gift-body">
                        <span class="gift-emoji">${gift.emoji}</span>
                    </div>
                </div>
                ${isOpened(gift.id) ? '<div class="gift-opened-badge">✓ Đã mở</div>' : ''}
            `;

            if (!isOpened(gift.id)) {
                box.addEventListener('click', () => _onBoxClick(gift, box));
            } else {
                box.title = 'Bạn đã chọn hộp quà này trước đó';
            }
            grid.appendChild(box);

            // Staggered pop-in
            setTimeout(() => box.classList.add('gift-box-visible'), gift.id * 80);
        });

        // Update remaining count label
        const label = document.getElementById('pick-count-label');
        if (label) label.textContent = `Bạn còn ${remainingPicks()} lần chọn`;
    }

    // ── BOX CLICK ─────────────────────────────────────────────────────────────
    function _onBoxClick(gift, boxEl) {
        if (isOpened(gift.id)) return;

        // Open animation
        boxEl.classList.add('gift-opening');
        setTimeout(() => {
            boxEl.classList.remove('gift-opening');
            boxEl.classList.add('opened');
            boxEl.innerHTML += '<div class="gift-opened-badge">✓ Đã mở</div>';
            boxEl.removeEventListener('click', () => { });
        }, 600);

        pickCount++;
        openedIds.push(gift.id);
        currentGift = gift;

        // Show popup after brief delay
        setTimeout(() => _showPopup(gift, pickCount >= 3), 700);
    }

    // ── POPUP ─────────────────────────────────────────────────────────────────
    function _showPopup(gift, isFinal) {
        const popup = document.getElementById('gift-popup');
        if (!popup) return;

        // Build images
        const imgsHtml = gift.images.map(src =>
            `<img src="${src}" alt="gift" class="gift-popup-img" />`
        ).join('');

        // Remaining text
        const remaining = 3 - pickCount;
        const pickLabel = isFinal
            ? 'Đây là lần chọn cuối cùng của em pé 💕'
            : `Em pé còn ${remaining}/3 lần chọn lại thui nha`;

        // Buttons
        const btnHtml = isFinal
            ? `<button class="gift-btn gift-btn-accept" id="gift-accept-btn">Nhận quà 🎁</button>`
            : `<button class="gift-btn gift-btn-accept" id="gift-accept-btn">Nhận quà 🎁</button>
               <button class="gift-btn gift-btn-retry" id="gift-retry-btn">Chọn lại 🔄</button>`;

        popup.innerHTML = `
            <div class="gift-popup-box">
                <div class="gift-popup-header">
                    <span class="gift-popup-emoji">${gift.emoji}</span>
                    <h3 class="gift-popup-title">${gift.label}</h3>
                </div>
                <div class="gift-popup-body">
                    <div class="gift-popup-text-wrap">
                        <p class="gift-popup-text" id="gift-popup-text"></p>
                    </div>
                    <div class="gift-popup-images">${imgsHtml}</div>
                </div>
                <p class="gift-pick-label">${pickLabel}</p>
                <div class="gift-popup-btns">${btnHtml}</div>
            </div>
        `;
        popup.classList.remove('hidden');
        popup.classList.add('popup-visible');

        // Typewriter
        _typewrite(gift.text, document.getElementById('gift-popup-text'));

        // Button events
        const acceptBtn = document.getElementById('gift-accept-btn');
        if (acceptBtn) acceptBtn.addEventListener('click', () => _acceptGift(gift));

        const retryBtn = document.getElementById('gift-retry-btn');
        if (retryBtn) retryBtn.addEventListener('click', _tryAgain);
    }

    function _closePopup() {
        const popup = document.getElementById('gift-popup');
        if (popup) {
            popup.classList.add('hidden');
            popup.classList.remove('popup-visible');
            popup.innerHTML = '';
        }
        if (typewriterTimer) { clearTimeout(typewriterTimer); typewriterTimer = null; }
    }

    // ── TYPEWRITER ────────────────────────────────────────────────────────────
    function _typewrite(text, el) {
        if (!el) return;
        el.textContent = '';
        let i = 0;
        function next() {
            if (i < text.length) {
                el.textContent += text[i++];
                typewriterTimer = setTimeout(next, 28);
            }
        }
        next();
    }

    // ── ACCEPT GIFT ───────────────────────────────────────────────────────────
    function _acceptGift(gift) {
        _closePopup();
        // Hide all screens, show congrats
        if (window.AppController && window.AppController.showScreen) {
            window.AppController.showScreen('giftCongrats');
        }
        _showCongrats(gift);
    }

    function _showCongrats(gift) {
        const screen = document.getElementById('gift-congrats');
        if (!screen) return;

        const giftIndex = openedIds.indexOf(gift.id) + 1;
        const imgsHtml = gift.images.map(src =>
            `<img src="${src}" alt="gift" class="congrats-img" />`
        ).join('');

        screen.innerHTML = `
            <canvas id="fireworks-canvas"></canvas>
            <div class="congrats-box">
                <h2 class="congrats-title">Em pé sinh nhật vui vẻ nhó 🎂✨</h2>
                <p class="congrats-sub">Em pé đã chọn món quà thứ ${giftIndex}</p>
                <div class="congrats-content">
                    <p class="congrats-text" id="congrats-text"></p>
                    <div class="congrats-images">${imgsHtml}</div>
                </div>
            </div>
        `;

        // Typewriter for congrats text
        setTimeout(() => _typewrite(gift.text, document.getElementById('congrats-text')), 400);

        // Start fireworks
        _startFireworks();
    }

    // ── TRY AGAIN ─────────────────────────────────────────────────────────────
    function _tryAgain() {
        _closePopup();
        showSelectScreen();
    }

    // ── FIREWORKS ─────────────────────────────────────────────────────────────
    function _startFireworks() {
        const canvas = document.getElementById('fireworks-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        const particles = [];
        const COLORS = ['#f22c6b', '#ffd700', '#ff69b4', '#fff', '#ff9ff3', '#54a0ff', '#ff6b6b'];

        class Particle {
            constructor(x, y) {
                this.x = x; this.y = y;
                const angle = Math.random() * Math.PI * 2;
                const speed = 3 + Math.random() * 6;
                this.vx = Math.cos(angle) * speed;
                this.vy = Math.sin(angle) * speed - 2;
                this.alpha = 1;
                this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
                this.size = 3 + Math.random() * 4;
                this.decay = 0.015 + Math.random() * 0.01;
                this.gravity = 0.12;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.vy += this.gravity;
                this.alpha -= this.decay;
            }
            draw() {
                ctx.save();
                ctx.globalAlpha = Math.max(0, this.alpha);
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        let frame = 0;
        let animId;
        function loop() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Burst every 40 frames
            if (frame % 40 === 0) {
                const x = canvas.width * (0.2 + Math.random() * 0.6);
                const y = canvas.height * (0.1 + Math.random() * 0.5);
                for (let i = 0; i < 60; i++) particles.push(new Particle(x, y));
            }

            for (let i = particles.length - 1; i >= 0; i--) {
                particles[i].update();
                particles[i].draw();
                if (particles[i].alpha <= 0) particles.splice(i, 1);
            }

            frame++;
            animId = requestAnimationFrame(loop);
        }
        loop();

        // Stop after 12 seconds (screen stays)
        setTimeout(() => cancelAnimationFrame(animId), 12000);
    }

    // ── PUBLIC ────────────────────────────────────────────────────────────────
    window.GiftModule = {
        showRules,
        showSelectScreen,
    };
})();
