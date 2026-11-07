// ============================================================
// mystic-expansion.js
// 1. Голоси в радіо (уривки, хибні координати, повтор слів гравця)
// 2. Містичні сліди (мокрі сліди у море, силуети між деревами, багаття-привид)
// 3. Вплив психіки (галюцинації, віньєтка, бачення-підказки секретів)
// 4. Ритуал-фінал (Вівтар Аномалії, вибір: закрити чи підкорити силу)
// ============================================================

(function() {
    'use strict';

    // ─── 1. НОВІ ПРЕДМЕТИ ДЛЯ РИТУАЛУ ТА МІСТИКИ ─────────────────
    if (window.ITEM_DB) {
        const mysticItems = {
            'diary_fragment': {
                id: 'diary_fragment',
                name: 'Уламок щоденника',
                icon: 'diary',
                category: 'resource',
                maxStack: 5,
                description: 'Фрагмент стародавнього запису про просторову аномалію острова (потрібно 3 для ритуалу)'
            },
            'airplane_resonance_core': {
                id: 'airplane_resonance_core',
                name: 'Резонуюче ядро літака',
                icon: 'blackbox',
                category: 'resource',
                maxStack: 1,
                description: 'Квантовий прилад із кабіни літака, що вступив у резонанс з аномалією'
            },
            'void_crystal': {
                id: 'void_crystal',
                name: 'Кристал Пустоти',
                icon: 'crystal',
                category: 'resource',
                maxStack: 3,
                description: 'Пульсуючий фіолетовий кристал, ядро магічної сили архіпелагу'
            },
            'mystic_tea': {
                id: 'mystic_tea',
                name: 'Заспокійливий чай',
                icon: 'tea',
                category: 'medicine',
                maxStack: 5,
                description: 'Чай із польових квітів, що заспокоює нерви та відновлює психіку (+40 Психіки)',
                effects: { health: 15, energy: 20 }
            }
        };
        Object.assign(window.ITEM_DB, mysticItems);
    }

    // Рецепт чаю
    if (window.RECIPE_DB) {
        window.RECIPE_DB['mystic_tea'] = {
            id: 'mystic_tea',
            name: 'Заспокійливий чай',
            result: { id: 'mystic_tea', count: 1 },
            materials: [{ id: 'water', count: 1 }, { id: 'berry', count: 2 }, { id: 'fiber', count: 2 }],
            requires: 'campfire'
        };
    }

    // ─── 2. АУДІО-СИНТЕЗАТОР ДЛЯ МІСТИКИ ────────────────────────
    function setupMysticAudio() {
        if (!window.soundSystem) return;
        const ss = window.soundSystem;

        if (!ss.playRadioStatic) {
            ss.playRadioStatic = function(duration = 1.2) {
                if (!this.soundEnabled) return;
                try {
                    const ctx = this.getAudioContext();
                    if (!ctx) return;
                    const bufferSize = ctx.sampleRate * duration;
                    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
                    const data = buffer.getChannelData(0);
                    for (let i = 0; i < bufferSize; i++) {
                        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.8));
                    }
                    const noise = ctx.createBufferSource();
                    noise.buffer = buffer;
                    const filter = ctx.createBiquadFilter();
                    filter.type = 'bandpass';
                    filter.frequency.setValueAtTime(1400, ctx.currentTime);
                    filter.Q.setValueAtTime(3.5, ctx.currentTime);
                    const gain = ctx.createGain();
                    gain.gain.setValueAtTime(this.volume * 0.35, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
                    noise.connect(filter);
                    filter.connect(gain);
                    gain.connect(ctx.destination);
                    noise.start();
                } catch(e) {}
            };
        }

        if (!ss.playMysticWhisper) {
            ss.playMysticWhisper = function() {
                if (!this.soundEnabled) return;
                try {
                    const ctx = this.getAudioContext();
                    if (!ctx) return;
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(180, ctx.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(420, ctx.currentTime + 1.2);
                    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 2.5);
                    gain.gain.setValueAtTime(0.001, ctx.currentTime);
                    gain.gain.linearRampToValueAtTime(this.volume * 0.25, ctx.currentTime + 0.8);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start();
                    osc.stop(ctx.currentTime + 2.6);
                } catch(e) {}
            };
        }

        if (!ss.playRitualBoom) {
            ss.playRitualBoom = function() {
                if (!this.soundEnabled) return;
                try {
                    const ctx = this.getAudioContext();
                    if (!ctx) return;
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(80, ctx.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(28, ctx.currentTime + 3.0);
                    gain.gain.setValueAtTime(this.volume * 0.8, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.0);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start();
                    osc.stop(ctx.currentTime + 3.1);
                } catch(e) {}
            };
        }
    }

    // ─── 3. ГОЛОВНИЙ КЛАС МІСТИЧНОЇ СИСТЕМИ ─────────────────────
    class MysticWorldSystem {
        constructor(game) {
            this.game = game;
            this.tileSize = game.tileSize || 32;

            // ПСИХІКА (Sanity)
            this.sanity = 100;
            this.maxSanity = 100;
            this.lastAction = { type: 'idle', text: '', time: Date.now() };

            // ГОЛОСИ В РАДІО
            this.radioTimer = 35 + Math.random() * 25; // інтервал передач
            this.activeRadioMessage = null;
            this.radioBannerTimer = 0;
            this.spawnedCaches = []; // сховані ящики

            // МІСТИЧНІ СЛІДИ
            this.footprints = [];    // ланцюжки мокрих слідів
            this.shadowFigures = []; // силуети між деревами
            this.hauntedCampfire = null; // багаття, що саме спалахує

            // БАЧЕННЯ-ПІДКАЗКИ
            this.guidingSpirit = null; // світлий фантом-провідник
            this.guidingWisp = null;   // вогник, що веде до секрету
            this.hallucinationTimer = 45;

            // РИТУАЛ-ФІНАЛ
            this.altar = {
                x: 65 * this.tileSize,
                y: 45 * this.tileSize,
                unlocked: false,
                activated: false,
                outcome: null // 'closed' або 'absorbed'
            };

            this.initWorldEntities();
            setupMysticAudio();
        }

        initWorldEntities() {
            // Знаходимо зручне місце для вівтаря на твердій землі
            if (this.game.world) {
                for (let r = 0; r < 30; r++) {
                    const tx = Math.floor(this.game.worldWidth * 0.6) + (r % 6) - 3;
                    const ty = Math.floor(this.game.worldHeight * 0.4) + Math.floor(r / 6) - 3;
                    const tile = this.game.world.getTile(tx, ty);
                    if (tile >= 2 && tile <= 4) {
                        this.altar.x = tx * this.tileSize;
                        this.altar.y = ty * this.tileSize;
                        break;
                    }
                }
            }

            // Генеруємо мокрі сліди, що йдуть з берега в океан
            this.generateFootprints();

            // Генеруємо силуети в лісових зонах
            this.generateShadowFigures();

            // Генеруємо містичне багаття
            this.generateHauntedCampfire();
        }

        // ── 3.1. Генерація слідів ────────────────────────────────
        generateFootprints() {
            this.footprints = [];
            if (!this.game.world) return;

            // Шукаємо пляж біля води
            for (let y = 10; y < this.game.worldHeight - 10; y += 8) {
                for (let x = 10; x < this.game.worldWidth - 10; x += 8) {
                    const t = this.game.world.getTile(x, y);
                    const tWater = this.game.world.getTile(x, y + 1);
                    if (t === 2 && tWater < 2) { // пісок межує з водою
                        const startX = x * this.tileSize;
                        const startY = y * this.tileSize;
                        // Створюємо ланцюжок із 8 слідів, що йдуть прямо у воду
                        for (let step = 0; step < 8; step++) {
                            const isLeft = step % 2 === 0;
                            this.footprints.push({
                                x: startX + (isLeft ? -5 : 5),
                                y: startY + step * 7,
                                wetAlpha: 0.85 - step * 0.08,
                                isLeft: isLeft,
                                rotation: Math.PI / 2
                            });
                        }
                        return; // один виразний ланцюжок
                    }
                }
            }
        }

        // ── 3.2. Генерація силуетів ──────────────────────────────
        generateShadowFigures() {
            this.shadowFigures = [];
            if (!this.game.world) return;

            // Знаходимо кілька точок біля дерев
            const trees = this.game.world.resources.filter(r => r.type === 'tree' || r.type === 'palm');
            for (let i = 0; i < Math.min(trees.length, 5); i++) {
                const tr = trees[Math.floor(Math.random() * trees.length)];
                this.shadowFigures.push({
                    id: 'shadow_' + i,
                    x: tr.x + (Math.random() * 40 - 20),
                    y: tr.y + (Math.random() * 40 - 20),
                    visible: true,
                    alpha: 0.65,
                    pulse: Math.random() * Math.PI
                });
            }
        }

        // ── 3.3. Містичне багаття ───────────────────────────────
        generateHauntedCampfire() {
            if (!this.game.world) return;
            const cx = Math.floor(this.game.worldWidth * 0.35) * this.tileSize;
            const cy = Math.floor(this.game.worldHeight * 0.65) * this.tileSize;
            this.hauntedCampfire = {
                x: cx,
                y: cy,
                burning: false,
                emberAlpha: 0.8,
                searched: false
            };
        }

        // ── 3.4. Відстеження дій гравця для радіо ────────────────
        logPlayerAction(type, text) {
            this.lastAction = { type, text, time: Date.now() };
        }

        // ── 3.5. Оновлення логіки щокадру ────────────────────────
        update(dt) {
            const player = this.game.player;
            if (!player) return;

            // 1. ПСИХІКА (Sanity drain & recovery)
            this.updateSanity(dt, player);

            // 2. ГОЛОСИ В РАДІО (Radio chatter timer)
            this.updateRadioVoices(dt, player);

            // 3. МІСТИЧНІ СЛІДИ ТА СИЛУЕТИ
            this.updateMysticTraces(dt, player);

            // 4. БАЧЕННЯ-ПІДКАЗКИ ПРИ НИЗЬКІЙ ПСИХІЦІ
            this.updateSanityVisions(dt, player);

            // Оновлення HUD психіки
            this.updateHUD();
        }

        updateSanity(dt, player) {
            const isNight = this.game.timeSystem && this.game.timeSystem.isNight();
            const weather = this.game.weatherSystem ? this.game.weatherSystem.current : 'sunny';
            let drainRate = 0;

            // Ніч без світла знижує психіку
            if (isNight) {
                const nearLight = this.isNearFireOrLight(player.x, player.y);
                if (!nearLight) drainRate += 0.35;
            }

            // Шторм або вірусний туман пригнічують психіку
            if (weather === 'storm') drainRate += 0.25;

            // Близькість до тіней лякає гравця
            for (const sf of this.shadowFigures) {
                if (sf.visible && Math.hypot(player.x - sf.x, player.y - sf.y) < 90) {
                    drainRate += 0.8;
                }
            }

            // Відновлення психіки
            let recoveryRate = 0;
            if (this.isNearFireOrLight(player.x, player.y)) recoveryRate += 0.45;
            if (this.isNearCompanion(player.x, player.y)) recoveryRate += 0.6; // пес заспокоює!

            this.sanity = Math.max(0, Math.min(this.maxSanity, this.sanity - (drainRate - recoveryRate) * dt));

            // Віньєтка на екрані при низькій психіці
            const vignette = document.getElementById('sanity-vignette');
            if (vignette) {
                if (this.sanity < 50) {
                    const intensity = (50 - this.sanity) / 50;
                    vignette.style.opacity = (intensity * 0.85).toFixed(2);
                    vignette.style.boxShadow = `inset 0 0 ${Math.round(80 + intensity * 100)}px rgba(88, 28, 135, ${0.4 + intensity * 0.5})`;
                } else {
                    vignette.style.opacity = '0';
                }
            }
        }

        isNearFireOrLight(px, py) {
            if (!this.game.buildingSystem) return false;
            return this.game.buildingSystem.buildings.some(b =>
                (b.type === 'campfire' || b.type === 'wooden_house' || (b.type === 'spotlight' && b.active)) &&
                Math.hypot(b.x - px, b.y - py) < 140
            );
        }

        isNearCompanion(px, py) {
            if (!this.game.animalManager || !this.game.animalManager.dogs) return false;
            return this.game.animalManager.dogs.some(dog => Math.hypot(dog.x - px, dog.y - py) < 90);
        }

        // ── 3.6. Радіопередачі ────────────────────────────────────
        updateRadioVoices(dt, player) {
            this.radioTimer -= dt;
            if (this.radioBannerTimer > 0) {
                this.radioBannerTimer -= dt;
                if (this.radioBannerTimer <= 0) {
                    this.hideRadioBanner();
                }
            }

            // Кожні 40-75 секунд приходить уривок повідомлення
            if (this.radioTimer <= 0) {
                this.radioTimer = 55 + Math.random() * 45;
                this.triggerRadioVoice();
            }
        }

        triggerRadioVoice() {
            if (window.soundSystem) window.soundSystem.playRadioStatic(1.5);

            const roll = Math.random();
            let msg = '';
            let freq = (87.5 + Math.random() * 20).toFixed(1);

            if (roll < 0.45) {
                // ТИП 1: СПРАВЖНЯ СХОВАНКА (Real Cache)
                const cacheTx = Math.max(10, Math.min(this.game.worldWidth - 10, Math.floor(this.game.player.x / this.tileSize) + (Math.floor(Math.random() * 26) - 13)));
                const cacheTy = Math.max(10, Math.min(this.game.worldHeight - 10, Math.floor(this.game.player.y / this.tileSize) + (Math.floor(Math.random() * 26) - 13)));
                const cacheX = cacheTx * this.tileSize;
                const cacheY = cacheTy * this.tileSize;

                this.spawnedCaches.push({
                    x: cacheX,
                    y: cacheY,
                    looted: false,
                    isTrap: false,
                    items: [
                        { id: 'ammo', count: 12 },
                        { id: 'diary_fragment', count: 1 },
                        { id: 'canned_food', count: 3 },
                        { id: 'battery_item', count: 1 }
                    ]
                });

                msg = `📻 [${freq} МГц] Ш-ш-ш... "База... ми закопали припаси біля координат [X: ${cacheTx}, Y: ${cacheTy}]... там щоденник і набої... візьміть їх..."`;
                this.showRadioBanner(msg, 'success');
            } else if (roll < 0.75) {
                // ТИП 2: ХИБНІ КООРДИНАТИ (False Coordinates / Trap)
                const trapTx = Math.max(5, Math.min(this.game.worldWidth - 5, Math.floor(this.game.player.x / this.tileSize) + (Math.floor(Math.random() * 20) - 10)));
                const trapTy = Math.max(5, Math.min(this.game.worldHeight - 5, Math.floor(this.game.player.y / this.tileSize) + (Math.floor(Math.random() * 20) - 10)));
                const trapX = trapTx * this.tileSize;
                const trapY = trapTy * this.tileSize;

                this.spawnedCaches.push({
                    x: trapX,
                    y: trapY,
                    looted: false,
                    isTrap: true,
                    items: []
                });

                msg = `📻 [${freq} МГц] "...тут рятувальний загін... ми на точці [X: ${trapTx}, Y: ${trapTy}]... біжіть сюди швидше, тут безпечно..."`;
                this.showRadioBanner(msg, 'warning');
            } else {
                // ТИП 3: ВІДЛУННЯ СЛІВ ТА ДІЙ ГРАВЦЯ (Player Echo)
                const action = this.lastAction;
                const timeDiff = Math.round((Date.now() - action.time) / 1000);

                if (action.type === 'chop' && timeDiff < 40) {
                    msg = `📻 [${freq} МГц] *глухий шепіт* "...чуєш?.. тук... тук... сокира рубає ліс... дерево падає, а тіні ростуть..."`;
                } else if (action.type === 'shoot' && timeDiff < 40) {
                    msg = `📻 [${freq} МГц] "...постріли в темряву... думаєш, кулі врятують тебе від того, що спить на дні?.."`;
                } else if (action.type === 'eat' && timeDiff < 40) {
                    msg = `📻 [${freq} МГц] "...ти їси ${action.text}... а що, коли скоро сам станеш здобиччю?.."`;
                } else if (this.game.player.health < 40) {
                    msg = `📻 [${freq} МГц] "...твоє серце калатає... кров сочиться на пісок... ми чуємо твій страх..."`;
                } else {
                    msg = `📻 [${freq} МГц] "...ти знову озирнувся?.. не повертайся спиною до моря... ми стоїмо просто за тобою..."`;
                }
                this.showRadioBanner(msg, 'danger');
                if (window.soundSystem) window.soundSystem.playMysticWhisper();
            }
        }

        showRadioBanner(text, type = 'info') {
            let banner = document.getElementById('radio-voice-banner');
            if (!banner) {
                banner = document.createElement('div');
                banner.id = 'radio-voice-banner';
                banner.style.position = 'absolute';
                banner.style.bottom = '85px';
                banner.style.left = '50%';
                banner.style.transform = 'translateX(-50%)';
                banner.style.background = 'rgba(15, 23, 42, 0.95)';
                banner.style.color = '#E2E8F0';
                banner.style.padding = '12px 24px';
                banner.style.borderRadius = '12px';
                banner.style.border = '2px solid #8B5CF6';
                banner.style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.4)';
                banner.style.fontFamily = 'monospace';
                banner.style.fontSize = '14px';
                banner.style.maxWidth = '650px';
                banner.style.width = '90%';
                banner.style.zIndex = '50';
                banner.style.display = 'flex';
                banner.style.alignItems = 'center';
                banner.style.gap = '12px';
                banner.style.transition = 'opacity 0.4s ease';
                document.getElementById('game-container').appendChild(banner);
            }

            banner.style.borderColor = type === 'danger' ? '#EF4444' : type === 'warning' ? '#F59E0B' : '#8B5CF6';
            banner.innerHTML = `
                <span style="font-size: 22px; animation: pulse 1s infinite;">📡</span>
                <span style="flex: 1; line-height: 1.4;">${text}</span>
                <button id="btn-close-radio-banner" style="background: transparent; border: none; color: #94A3B8; font-size: 18px; cursor: pointer;">&times;</button>
            `;
            banner.style.display = 'flex';
            banner.style.opacity = '1';

            const closeBtn = document.getElementById('btn-close-radio-banner');
            if (closeBtn) closeBtn.onclick = () => this.hideRadioBanner();

            this.radioBannerTimer = 10;
        }

        hideRadioBanner() {
            const banner = document.getElementById('radio-voice-banner');
            if (banner) {
                banner.style.opacity = '0';
                setTimeout(() => { banner.style.display = 'none'; }, 400);
            }
        }

        // ── 3.7. Оновлення містичних слідів та силуетів ──────────
        updateMysticTraces(dt, player) {
            // Силуети зникають при наближенні гравця
            for (const sf of this.shadowFigures) {
                const dist = Math.hypot(player.x - sf.x, player.y - sf.y);
                if (dist < 100 && sf.visible) {
                    sf.visible = false;
                    // Ефект зникнення: частинки диму
                    this.game.spawnParticles(sf.x, sf.y, '#8B5CF6', 15);
                    if (window.soundSystem) window.soundSystem.playMysticWhisper();
                    this.game.showNotification('Тінь розчинилася серед дерев...', 'info');
                    // З'явиться знову через деякий час в іншому місці
                    setTimeout(() => {
                        sf.x = player.x + (Math.random() * 300 - 150);
                        sf.y = player.y + (Math.random() * 300 - 150);
                        sf.visible = true;
                    }, 40000);
                }
            }

            // Багаття-привид: горить, коли гравець відвернувся або далеко!
            if (this.hauntedCampfire) {
                const hc = this.hauntedCampfire;
                const dist = Math.hypot(player.x - hc.x, player.y - hc.y);

                // Визначаємо, чи дивиться гравець прямо на багаття
                // Напрямки гравця: 0=вниз, 1=вліво, 2=вправо, 3=вгору
                const dx = hc.x - player.x;
                const dy = hc.y - player.y;
                let facingCampfire = false;
                if (player.direction === 0 && dy > 0 && Math.abs(dx) < dy) facingCampfire = true;
                if (player.direction === 3 && dy < 0 && Math.abs(dx) < -dy) facingCampfire = true;
                if (player.direction === 1 && dx < 0 && Math.abs(dy) < -dx) facingCampfire = true;
                if (player.direction === 2 && dx > 0 && Math.abs(dy) < dx) facingCampfire = true;

                if (!facingCampfire && dist > 90 && dist < 320) {
                    if (!hc.burning) {
                        hc.burning = true;
                        if (Math.random() < 0.05) this.game.spawnParticles(hc.x, hc.y, '#A78BFA', 5);
                    }
                } else if (facingCampfire && dist < 120) {
                    if (hc.burning) {
                        hc.burning = false;
                        this.game.spawnParticles(hc.x, hc.y, '#6B7280', 12);
                        this.game.showNotification('Багаття зненацька згасло, лишивши холодний попіл...', 'info');
                    }
                }
            }
        }

        // ── 3.8. Бачення-підказки при низькій психіці ───────────
        updateSanityVisions(dt, player) {
            if (this.sanity > 40) return;

            this.hallucinationTimer -= dt;
            if (this.hallucinationTimer <= 0) {
                this.hallucinationTimer = 40 + Math.random() * 30;

                // 50% шанс — корисне бачення (Справжній секрет!)
                if (Math.random() < 0.6) {
                    this.triggerGuidingVision(player);
                } else {
                    // Фантомний нападник
                    this.triggerPhantomAttack(player);
                }
            }

            // Оновлення вогника-провідника
            if (this.guidingWisp) {
                const w = this.guidingWisp;
                const d = Math.hypot(w.targetX - w.x, w.targetY - w.y);
                if (d > 15) {
                    w.x += ((w.targetX - w.x) / d) * 60 * dt;
                    w.y += ((w.targetY - w.y) / d) * 60 * dt;
                    if (Math.random() < dt * 8) {
                        this.game.spawnParticles(w.x, w.y, '#FDE68A', 2);
                    }
                } else {
                    this.guidingWisp = null; // долетів
                }
            }
        }

        triggerGuidingVision(player) {
            // Фантом-провідник вказує на Вівтар або схованку
            const targetX = this.altar.x;
            const targetY = this.altar.y;

            this.guidingWisp = {
                x: player.x,
                y: player.y,
                targetX: targetX,
                targetY: targetY
            };

            if (window.soundSystem) window.soundSystem.playMysticWhisper();
            this.game.showNotification('🌟 Світле видіння розірвало морок! Золотий вогник вказує на Вівтар Аномалії...', 'success');
            this.game.spawnParticles(player.x, player.y, '#FDE68A', 25);
        }

        triggerPhantomAttack(player) {
            // Фантомний вовк, що розчиняється від одного дотику
            if (this.game.zombieManager) {
                this.game.zombieManager.zombies.push({
                    id: 'phantom_' + Date.now(),
                    x: player.x + (Math.random() < 0.5 ? -140 : 140),
                    y: player.y + (Math.random() < 0.5 ? -140 : 140),
                    health: 1,
                    maxHealth: 1,
                    isPhantom: true,
                    speed: 80,
                    attackCooldown: 0
                });
                this.game.showNotification('👻 У ваших очах двоїться... фантомна потвора виривається з темряви!', 'warning');
            }
        }

        // ── 3.9. Взаємодія з містичними об'єктами [E] ────────────
        handleInteraction() {
            const player = this.game.player;
            if (!player) return false;

            // 1. Взаємодія з Вівтарем Аномалії
            const altarDist = Math.hypot(player.x - this.altar.x, player.y - this.altar.y);
            if (altarDist < 75) {
                this.openAltarModal();
                return true;
            }

            // 2. Взаємодія зі схованками від радіо
            for (let i = this.spawnedCaches.length - 1; i >= 0; i--) {
                const c = this.spawnedCaches[i];
                if (!c.looted && Math.hypot(player.x - c.x, player.y - c.y) < 50) {
                    c.looted = true;
                    if (c.isTrap) {
                        // Пастка від радіо!
                        this.game.showNotification('⚠️ Радіо збрехало! Це була піратська засідка!', 'danger');
                        this.game.spawnParticles(c.x, c.y, '#EF4444', 30);
                        if (this.game.pirateManager) {
                            for (let k = 0; k < 2; k++) {
                                this.game.activeRaidPirates.push({
                                    id: 'trap_p_' + Date.now() + '_' + k,
                                    x: c.x + (k === 0 ? 40 : -40),
                                    y: c.y + 30,
                                    health: 40,
                                    maxHealth: 40,
                                    speed: 70,
                                    attackCd: 0
                                });
                            }
                        }
                    } else {
                        // Справжня схованка!
                        for (const it of c.items) {
                            player.inventory.addItem(it.id, it.count);
                        }
                        this.game.showNotification('🎁 Знайдено схованку з радіо! Отримано уламок щоденника та припаси!', 'success');
                        this.game.spawnParticles(c.x, c.y, '#10B981', 25);
                        if (window.soundSystem) window.soundSystem.playPickup();
                    }
                    return true;
                }
            }

            // 3. Взаємодія з багаттям-привидом
            if (this.hauntedCampfire && !this.hauntedCampfire.searched) {
                const hc = this.hauntedCampfire;
                if (Math.hypot(player.x - hc.x, player.y - hc.y) < 55) {
                    hc.searched = true;
                    player.inventory.addItem('sulfur', 3);
                    player.inventory.addItem('void_crystal', 1);
                    this.game.showNotification('🔍 У попелі багаття-привида знайдено Кристал Пустоти та сірку!', 'success');
                    this.game.spawnParticles(hc.x, hc.y, '#A78BFA', 20);
                    if (window.soundSystem) window.soundSystem.playPickup();
                    return true;
                }
            }

            return false;
        }

        // ── 3.10. Модальне вікно Вівтаря Аномалії ────────────────
        openAltarModal() {
            const player = this.game.player;
            const inv = player.inventory;

            // Рахуємо наявність трьох реліквій
            const diaryCount = inv.countItem('diary_fragment') + (inv.hasItem('pilot_diary') || inv.hasItem('bunker_diary') ? 2 : 0);
            const crystalCount = inv.countItem('void_crystal') + inv.countItem('mystic_crystal');
            const airplaneCoreCount = inv.countItem('airplane_resonance_core') + inv.countItem('black_box_1') + (inv.countItem('electronics') >= 5 ? 1 : 0);

            const hasAll = diaryCount >= 1 && crystalCount >= 1 && airplaneCoreCount >= 1;

            let modal = document.getElementById('ritual-dialog');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'ritual-dialog';
                modal.className = 'modal';
                modal.style.position = 'fixed';
                modal.style.top = '0';
                modal.style.left = '0';
                modal.style.width = '100vw';
                modal.style.height = '100vh';
                modal.style.background = 'rgba(0,0,0,0.85)';
                modal.style.display = 'flex';
                modal.style.alignItems = 'center';
                modal.style.justifyContent = 'center';
                modal.style.zIndex = '100';
                document.body.appendChild(modal);
            }

            modal.innerHTML = `
                <div style="background: linear-gradient(145deg, #0F172A, #1E1B4B); border: 2px solid #8B5CF6; border-radius: 16px; padding: 28px; max-width: 580px; width: 90%; color: #E2E8F0; box-shadow: 0 10px 40px rgba(139,92,246,0.5); text-align: center; position: relative;">
                    <button id="btn-close-ritual" style="position: absolute; top: 12px; right: 16px; background: transparent; border: none; color: #94A3B8; font-size: 24px; cursor: pointer;">&times;</button>
                    <h2 style="color: #C084FC; margin-top: 0; font-size: 1.8rem;">🔮 Вівтар Просторової Аномалії</h2>
                    <p style="color: #CBD5E1; font-size: 0.95rem; line-height: 1.5;">Стародавній менгір пульсує таємничим світлом. Простір архіпелагу зв'язаний у магічний вузол.</p>
                    
                    <div style="background: rgba(0,0,0,0.4); border-radius: 10px; padding: 14px; margin: 18px 0; text-align: left; font-size: 0.95rem;">
                        <div style="margin-bottom: 8px;">📜 <b>Уламки щоденника:</b> ${diaryCount >= 1 ? '✅ Знайдено' : '❌ Не знайдено (шукайте в схованках радіо)'}</div>
                        <div style="margin-bottom: 8px;">💎 <b>Містичний кристал:</b> ${crystalCount >= 1 ? '✅ Знайдено' : '❌ Не знайдено (шукайте в багатті-привиді або метеориті)'}</div>
                        <div>✈️ <b>Ядро літака:</b> ${airplaneCoreCount >= 1 ? '✅ Знайдено' : '❌ Не знайдено (уламки літака або 5 шт. електроніки)'}</div>
                    </div>

                    ${hasAll ? `
                        <p style="color: #34D399; font-weight: bold; font-size: 1.05rem;">✨ Всі 3 реліквії наявні! Виберіть долю Архіпелагу:</p>
                        <div style="display: flex; gap: 14px; justify-content: center; margin-top: 20px;">
                            <button id="btn-ritual-close" style="background: #10B981; color: #fff; border: none; padding: 12px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; flex: 1;">🌟 Закрити аномалію<br><span style="font-size: 0.8rem; font-weight: normal;">Очистити острів від мороку</span></button>
                            <button id="btn-ritual-absorb" style="background: #8B5CF6; color: #fff; border: none; padding: 12px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; flex: 1;">⚡ Використати силу<br><span style="font-size: 0.8rem; font-weight: normal;">Стати володарем острова</span></button>
                        </div>
                    ` : `
                        <p style="color: #F87171; font-size: 0.9rem;">Зберіть усі три реліквії, щоб розпочати обряд.</p>
                    `}
                </div>
            `;

            modal.style.display = 'flex';

            const closeBtn = document.getElementById('btn-close-ritual');
            if (closeBtn) closeBtn.onclick = () => { modal.style.display = 'none'; };

            if (hasAll) {
                const btnClose = document.getElementById('btn-ritual-close');
                const btnAbsorb = document.getElementById('btn-ritual-absorb');

                if (btnClose) {
                    btnClose.onclick = () => {
                        modal.style.display = 'none';
                        this.executeRitual('close');
                    };
                }
                if (btnAbsorb) {
                    btnAbsorb.onclick = () => {
                        modal.style.display = 'none';
                        this.executeRitual('absorb');
                    };
                }
            }
        }

        // ── 3.11. Виконання фінального обряду ────────────────────
        executeRitual(choice) {
            this.altar.activated = true;
            this.altar.outcome = choice;

            if (window.soundSystem) window.soundSystem.playRitualBoom();

            if (choice === 'close') {
                // ФІНАЛ 1: ЗАКРИТИ АНОМАЛІЮ
                this.sanity = 100;
                // Очищення світу від зомбі та піратів
                if (this.game.zombieManager) this.game.zombieManager.zombies = [];
                if (this.game.weatherSystem) this.game.weatherSystem.current = 'sunny';

                this.game.showNotification('🕊️ Аномалію закрито! Архіпелаг звільнено від мороку та чудовиськ!', 'success');
                this.game.spawnParticles(this.altar.x, this.altar.y, '#34D399', 80);

                this.showVictoryScreen('Закриття Аномалії', 'Ви розірвали просторовий вузол. Острів заспокоївся, зомбі розпалися на попіл, а сонячне світло назавжди розігнало морок!');
            } else {
                // ФІНАЛ 2: ПІДКОРИТИ СИЛУ АНОМАЛІЇ
                this.sanity = 100;
                this.game.player.maxHealth = 250;
                this.game.player.health = 250;
                this.game.player.speed = 220; // надшвидкість
                this.game.player.godMode = true;

                this.game.showNotification('⚡ Ви поглинули силу Аномалії! Ви стали безсмертним володарем Архіпелагу!', 'success');
                this.game.spawnParticles(this.altar.x, this.altar.y, '#8B5CF6', 80);

                this.showVictoryScreen('Володар Архіпелагу', 'Ви ввібрали космічну міць Аномалії. Тепер ваше тіло сповнене безсмертної енергії, а дикі звірі та стихії схиляються перед вами!');
            }
        }

        showVictoryScreen(title, story) {
            let overlay = document.getElementById('victory-overlay');
            if (overlay) {
                const stats = document.getElementById('victory-stats');
                if (stats) {
                    stats.innerHTML = `
                        <h3 style="color:#A78BFA; margin-top:0;">🌟 Фінал: ${title}</h3>
                        <p>${story}</p>
                        <p>⏱️ Днів вижито: <b>${this.game.timeSystem ? this.game.timeSystem.day : 1}</b></p>
                        <p>🧠 Стан психіки: <b>100% (Просвітлення)</b></p>
                    `;
                }
                overlay.classList.remove('hidden');
                overlay.style.display = 'flex';
            }
        }

        // ── 3.12. Оновлення HUD психіки ─────────────────────────
        updateHUD() {
            const bar = document.getElementById('hud-sanity');
            const text = document.getElementById('hud-sanity-text');
            if (bar) {
                const pct = Math.max(0, Math.min(100, (this.sanity / this.maxSanity) * 100));
                bar.style.width = pct + '%';
            }
            if (text) {
                text.innerText = `${Math.round(this.sanity)}/100`;
            }
        }

        // ── 3.13. Відмальовування містичних елементів ─────────────
        render(ctx, camera) {
            // 1. Мокрі сліди на піску
            this.drawFootprints(ctx, camera);

            // 2. Силуети між деревами
            this.drawShadowFigures(ctx, camera);

            // 3. Багаття-привид
            this.drawHauntedCampfire(ctx, camera);

            // 4. Схованки від радіо
            this.drawCaches(ctx, camera);

            // 5. Вівтар Аномалії
            this.drawAltar(ctx, camera);

            // 6. Вогник-провідник
            this.drawGuidingWisp(ctx, camera);
        }

        drawFootprints(ctx, camera) {
            for (const fp of this.footprints) {
                if (!camera.isVisible(fp.x, fp.y)) continue;
                const pos = camera.worldToScreen(fp.x, fp.y);
                ctx.save();
                ctx.translate(pos.x, pos.y);
                ctx.rotate(fp.rotation);

                // Мокрий темний відбиток босої стопи
                ctx.fillStyle = `rgba(30, 58, 70, ${fp.wetAlpha})`;
                ctx.beginPath();
                ctx.ellipse(0, 0, 3, 5, 0, 0, Math.PI * 2);
                ctx.fill();

                // 4 пальці
                for (let toe = -2; toe <= 2; toe++) {
                    ctx.beginPath();
                    ctx.arc(toe * 1.5, -6, 0.9, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Блік води
                ctx.fillStyle = `rgba(200, 240, 255, ${fp.wetAlpha * 0.4})`;
                ctx.beginPath();
                ctx.arc(0, -1, 1.2, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();
            }
        }

        drawShadowFigures(ctx, camera) {
            const time = Date.now() / 600;
            for (const sf of this.shadowFigures) {
                if (!sf.visible || !camera.isVisible(sf.x, sf.y)) continue;
                const pos = camera.worldToScreen(sf.x, sf.y);
                ctx.save();
                ctx.translate(pos.x, pos.y);

                const sway = Math.sin(time + sf.pulse) * 2;

                // Напівпрозорий містичний силует
                ctx.fillStyle = 'rgba(30, 27, 75, 0.6)';
                ctx.beginPath();
                ctx.ellipse(sway, 0, 10, 22, 0, 0, Math.PI * 2);
                ctx.fill();

                // Голова
                ctx.beginPath();
                ctx.arc(sway, -26, 7, 0, Math.PI * 2);
                ctx.fill();

                // Очі, що світяться фіолетовим
                ctx.fillStyle = '#C084FC';
                ctx.beginPath();
                ctx.arc(sway - 2.5, -27, 1.2, 0, Math.PI * 2);
                ctx.arc(sway + 2.5, -27, 1.2, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();
            }
        }

        drawHauntedCampfire(ctx, camera) {
            if (!this.hauntedCampfire) return;
            const hc = this.hauntedCampfire;
            if (!camera.isVisible(hc.x, hc.y)) continueBlock: {
                const pos = camera.worldToScreen(hc.x, hc.y);
                ctx.save();
                ctx.translate(pos.x, pos.y);

                // Кам'яне кільце з попелом
                ctx.fillStyle = '#374151';
                ctx.beginPath();
                ctx.arc(0, 0, 16, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#111827';
                ctx.beginPath();
                ctx.arc(0, 0, 10, 0, Math.PI * 2);
                ctx.fill();

                if (hc.burning) {
                    // Містичне фіолетово-синє полум'я
                    const flicker = Math.sin(Date.now() / 90) * 3;
                    ctx.fillStyle = '#8B5CF6';
                    ctx.beginPath();
                    ctx.moveTo(-8, 4);
                    ctx.lineTo(0, -18 + flicker);
                    ctx.lineTo(8, 4);
                    ctx.closePath();
                    ctx.fill();

                    ctx.fillStyle = '#67E8F9';
                    ctx.beginPath();
                    ctx.moveTo(-4, 2);
                    ctx.lineTo(0, -11 + flicker * 0.7);
                    ctx.lineTo(4, 2);
                    ctx.closePath();
                    ctx.fill();
                } else {
                    // Тліючі іскри попелу
                    ctx.fillStyle = '#F59E0B';
                    ctx.beginPath();
                    ctx.arc(-2, -1, 1.5, 0, Math.PI * 2);
                    ctx.arc(3, 2, 1.2, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.restore();
            }
        }

        drawCaches(ctx, camera) {
            for (const c of this.spawnedCaches) {
                if (c.looted || !camera.isVisible(c.x, c.y)) continue;
                const pos = camera.worldToScreen(c.x, c.y);
                ctx.save();
                ctx.translate(pos.x, pos.y);

                // Ящик із золотим світінням
                ctx.fillStyle = '#78350F';
                ctx.fillRect(-10, -10, 20, 16);
                ctx.strokeStyle = '#D97706';
                ctx.lineWidth = 1.5;
                ctx.strokeRect(-10, -10, 20, 16);

                // Мерехтливий промінь
                const pulse = (Math.sin(Date.now() / 300) + 1) / 2;
                ctx.strokeStyle = `rgba(245, 158, 11, ${0.4 + pulse * 0.5})`;
                ctx.beginPath();
                ctx.arc(0, -2, 14 + pulse * 4, 0, Math.PI * 2);
                ctx.stroke();

                ctx.restore();
            }
        }

        drawAltar(ctx, camera) {
            if (!camera.isVisible(this.altar.x, this.altar.y)) return;
            const pos = camera.worldToScreen(this.altar.x, this.altar.y);
            const t = Date.now() / 800;

            ctx.save();
            ctx.translate(pos.x, pos.y);

            // Зовнішнє коло рунічних каменів
            ctx.strokeStyle = '#6D28D9';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, 38, 0, Math.PI * 2);
            ctx.stroke();

            // 6 стоячих менгірів
            for (let i = 0; i < 6; i++) {
                const angle = (i * Math.PI * 2) / 6;
                const mx = Math.cos(angle) * 38;
                const my = Math.sin(angle) * 38;
                ctx.fillStyle = '#475569';
                ctx.beginPath();
                ctx.arc(mx, my, 7, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#8B5CF6';
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }

            // Центральний постамент
            ctx.fillStyle = '#1E1B4B';
            ctx.beginPath();
            ctx.arc(0, 0, 20, 0, Math.PI * 2);
            ctx.fill();

            // Левітуючий кристал у центрі
            const bob = Math.sin(t * 2) * 4;
            ctx.fillStyle = this.altar.activated ? '#34D399' : '#C084FC';
            ctx.beginPath();
            ctx.moveTo(0, -14 + bob);
            ctx.lineTo(8, bob);
            ctx.lineTo(0, 14 + bob);
            ctx.lineTo(-8, bob);
            ctx.closePath();
            ctx.fill();

            // Рунічний текст над вівтарем
            ctx.font = 'bold 11px sans-serif';
            ctx.fillStyle = '#E9D5FF';
            ctx.textAlign = 'center';
            ctx.fillText('ВІВТАР АНОМАЛІЇ', 0, -48);

            ctx.restore();
        }

        drawGuidingWisp(ctx, camera) {
            if (!this.guidingWisp || !camera.isVisible(this.guidingWisp.x, this.guidingWisp.y)) return;
            const pos = camera.worldToScreen(this.guidingWisp.x, this.guidingWisp.y);
            ctx.save();
            ctx.translate(pos.x, pos.y);

            // Золоте сонячне сяйво
            ctx.fillStyle = '#FDE68A';
            ctx.beginPath();
            ctx.arc(0, 0, 6, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = 'rgba(253, 230, 138, 0.4)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, 14, 0, Math.PI * 2);
            ctx.stroke();

            ctx.restore();
        }
    }

    window.MysticWorldSystem = MysticWorldSystem;

    // ─── 4. ІНТЕГРАЦІЯ З ІГРОВИМ ЦИКЛОМ (Game Patches) ────────────
    (function patchGameForMystic() {
        if (!window.Game) return;

        // Патч Game.init
        const origInit = Game.prototype.init;
        Game.prototype.init = function() {
            origInit.call(this);
            this.mysticSystem = new window.MysticWorldSystem(this);
        };

        // Патч Game.update
        const origUpdate = Game.prototype.update;
        Game.prototype.update = function(dt) {
            origUpdate.call(this, dt);
            if (this.mysticSystem) this.mysticSystem.update(dt);
        };

        // Патч Game.render
        const origRender = Game.prototype.render;
        Game.prototype.render = function() {
            origRender.call(this);
            if (this.mysticSystem && this.camera) {
                this.mysticSystem.render(this.ctx, this.camera);
            }
        };

        // Патч Game.handleInteraction [E]
        const origInteract = Game.prototype.handleInteraction;
        Game.prototype.handleInteraction = function() {
            if (this.mysticSystem && this.mysticSystem.handleInteraction()) return;
            if (origInteract) return origInteract.call(this);
        };

        // Патч дій гравця (рубання, їжа тощо для відлуння в радіо)
        const origHarvest = World.prototype.harvestResource;
        if (origHarvest) {
            World.prototype.harvestResource = function(...args) {
                const res = origHarvest.apply(this, args);
                if (window.game && window.game.mysticSystem) {
                    window.game.mysticSystem.logPlayerAction('chop', 'дерево');
                }
                return res;
            };
        }
    })();

    console.log('[mystic-expansion.js] Голоси в радіо, Містичні сліди, Психіка та Ритуал-фінал — завантажено ✅');
})();
