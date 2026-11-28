// ============================================================
// phantom-pirates.js
// ФАНТОМНІ ПІРАТИ ТА ФАНТОМНИЙ КОРАБЕЛЬ
//
// Механіки:
//  1. Фантомний Корабель — з'являється вночі раз на 5 днів
//     біля берега, привозить 3-5 фантомних піратів.
//  2. Фантомні пірати — захоплюють будівлі гравця, б'ються.
//  3. Дроп: Фантомний меч (phantom_sword) з одного пірата.
//  4. Фантомний меч — при ударі робить ворогів прозорими,
//     через 3 сек вбиває їх.
// ============================================================
(function () {
    'use strict';

    // ─── ITEM_DB: фантомний меч ───────────────────────────────
    if (window.ITEM_DB) {
        window.ITEM_DB['phantom_sword'] = {
            id: 'phantom_sword',
            name: 'Фантомний меч',
            icon: 'phantom_sword',
            category: 'weapon',
            toolType: 'melee',
            damage: 35,
            attackCooldown: 0.9,
            maxStack: 1,
            description: 'Меч зі світу примар. Зробить ворога прозорим і через 3 секунди вб\'є його.'
        };
    }

    // ─── СИСТЕМА ФАНТОМНИХ ПІРАТІВ ────────────────────────────
    class PhantomPirateSystem {
        constructor(game) {
            this.game = game;

            // Фантомний корабель
            this.ship = null;          // { x, y, alpha, angle, timer, departing }
            this.shipCooldown = 0;     // Таймер до наступного появи
            this.SHIP_INTERVAL = 5 * 24 * 60; // 5 ігрових днів (секунд у timeSys)
            this.shipSwordDropped = false;

            // Фантомні пірати
            this.pirates = [];         // [ { x, y, hp, maxHp, state, targetBuilding, alpha, phantomCd, speed } ]

            // Ефект прозорості на НПС (cursed enemies)
            // Формат: { target: ref, timer: float }
            this.phantomCursed = [];
        }

        // Скільки ігрових днів пройшло
        _gameDay() {
            return this.game.timeSystem ? this.game.timeSystem.day : 0;
        }
        _isNight() {
            return this.game.timeSystem ? this.game.timeSystem.isNight() : false;
        }

        update(dt) {
            const p = this.game.player;
            if (!p) return;

            this._updateShip(dt, p);
            this._updatePirates(dt, p);
            this._updatePhantomCursed(dt, p);
        }

        // ── 1. Фантомний корабель ──────────────────────────────
        _updateShip(dt, p) {
            if (!this.ship) {
                // Відлік — після SHIP_INTERVAL секунд вночі спавнимо
                this.shipCooldown += dt;
                const thresholdSec = this.SHIP_INTERVAL;
                if (this.shipCooldown >= thresholdSec && this._isNight()) {
                    this._spawnShip(p);
                    this.shipCooldown = 0;
                }
                return;
            }

            const s = this.ship;

            if (!s.departing) {
                // Корабель наближається до берега та висаджує піратів
                s.timer -= dt;
                s.alpha = Math.min(1, s.alpha + dt * 0.5);

                // Анімація гойдання
                s.angle = Math.sin(performance.now() / 1200) * 0.08;

                // Коли таймер вийшов — відправляємо
                if (s.timer <= 0 || !this._isNight()) {
                    s.departing = true;
                }
            } else {
                // Корабель відпливає
                const ang = Math.atan2(p.y - s.y, p.x - s.x) + Math.PI;
                s.x += Math.cos(ang) * 60 * dt;
                s.y += Math.sin(ang) * 60 * dt;
                s.alpha = Math.max(0, s.alpha - dt * 0.3);
                if (s.alpha <= 0) {
                    this.ship = null;
                }
            }
        }

        _spawnShip(p) {
            // Знаходимо берегову точку
            const world = this.game.world;
            const ts = this.game.tileSize;
            let spawnX = p.x, spawnY = p.y;

            // Пробуємо знайти воду поблизу гравця
            for (let attempt = 0; attempt < 40; attempt++) {
                const ang = Math.random() * Math.PI * 2;
                const dist = 400 + Math.random() * 300;
                const tx = p.x + Math.cos(ang) * dist;
                const ty = p.y + Math.sin(ang) * dist;
                const tile = world ? world.getTileAtWorld(tx, ty) : 1;
                if (tile === 0 || tile === 1) {
                    spawnX = tx; spawnY = ty;
                    break;
                }
            }

            this.ship = {
                x: spawnX, y: spawnY,
                alpha: 0,
                angle: 0,
                timer: 30, // 30 сек стоїть
                departing: false
            };
            this.shipSwordDropped = false;

            // Спавн 3-5 фантомних піратів
            const count = 3 + Math.floor(Math.random() * 3);
            for (let i = 0; i < count; i++) {
                setTimeout(() => this._spawnPirate(spawnX, spawnY), i * 1200);
            }

            this.game.showNotification('👻 ФАНТОМНИЙ КОРАБЕЛЬ З\'ЯВИВСЯ В ТЕМРЯВІ! Пірати висаджуються на берег!', 'danger');
            if (window.soundSystem) window.soundSystem.playAlarm();
        }

        _spawnPirate(shipX, shipY) {
            const world = this.game.world;
            const ts = this.game.tileSize || 32;
            // Знаходимо суходіл поблизу корабля
            let px = shipX, py = shipY;
            for (let attempt = 0; attempt < 60; attempt++) {
                const ax = shipX + (Math.random() - 0.5) * 300;
                const ay = shipY + (Math.random() - 0.5) * 300;
                const tile = world ? world.getTileAtWorld(ax, ay) : 2;
                if (tile >= 2 && tile <= 5) { px = ax; py = ay; break; }
            }
            this.pirates.push({
                x: px, y: py,
                hp: 60, maxHp: 60,
                speed: 55,
                alpha: 0,          // плавна поява
                state: 'seek',     // 'seek' | 'capture' | 'attack_player'
                targetBuilding: null,
                captureTimer: 0,
                captureProgress: 0,
                attackCd: 0,
                swordCarrier: this.pirates.length === 0 // перший пірат несе меч
            });
        }

        // ── 2. Оновлення піратів ───────────────────────────────
        _updatePirates(dt, p) {
            const world = this.game.world;
            const bs = this.game.buildingSystem;

            for (let i = this.pirates.length - 1; i >= 0; i--) {
                const pirate = this.pirates[i];

                // Плавна поява
                pirate.alpha = Math.min(0.85, pirate.alpha + dt * 0.6);

                // Смерть
                if (pirate.hp <= 0) {
                    // Дроп меч якщо він його ніс
                    if (pirate.swordCarrier && !this.shipSwordDropped && world) {
                        world.addDroppedItem('phantom_sword', 1, pirate.x, pirate.y);
                        this.shipSwordDropped = true;
                        this.game.showNotification('💀 Фантомний меч впав на землю!', 'warning');
                    }
                    this.game.spawnParticles(pirate.x, pirate.y, 'rgba(100,180,255,0.9)', 20);
                    this.pirates.splice(i, 1);
                    this.game.player.addXP && this.game.player.addXP(30);
                    continue;
                }

                // Атака гравця якщо близько
                const distPlayer = Math.hypot(p.x - pirate.x, p.y - pirate.y);
                if (distPlayer < 220) {
                    pirate.state = 'attack_player';
                }

                if (pirate.state === 'attack_player') {
                    this._movePirateToward(pirate, p.x, p.y, dt);
                    pirate.attackCd -= dt;
                    if (distPlayer < 32 && pirate.attackCd <= 0) {
                        pirate.attackCd = 1.6;
                        p.health = Math.max(0, p.health - 12);
                        this.game.showNotification('👻 Фантомний пірат ударив вас!', 'danger');
                        if (window.soundSystem) window.soundSystem.playHurt();
                    }
                } else {
                    // Шукаємо будівлю для захоплення
                    if (!pirate.targetBuilding && bs) {
                        pirate.targetBuilding = this._findBuildingTarget(bs, pirate);
                    }
                    if (pirate.targetBuilding) {
                        const tb = pirate.targetBuilding;
                        const distBuilding = Math.hypot(tb.x - pirate.x, tb.y - pirate.y);
                        if (distBuilding > 30) {
                            this._movePirateToward(pirate, tb.x, tb.y, dt);
                            pirate.captureProgress = 0;
                        } else {
                            // Захоплення
                            pirate.captureProgress += dt;
                            if (pirate.captureProgress >= 5) {
                                // Захопили будівлю — б'ємо її
                                pirate.captureProgress = 0;
                                tb.health = (tb.health || 100) - 20;
                                this.game.showNotification(`👻 Фантомний пірат захопив ${tb.type}! Захищайте базу!`, 'danger');
                                if (tb.health <= 0 && bs) {
                                    const idx = bs.buildings.indexOf(tb);
                                    if (idx >= 0) bs.buildings.splice(idx, 1);
                                    pirate.targetBuilding = null;
                                }
                            }
                        }
                    } else {
                        // Немає будівель — іде до гравця
                        this._movePirateToward(pirate, p.x, p.y, dt);
                    }
                }
            }
        }

        _movePirateToward(pirate, tx, ty, dt) {
            const dist = Math.hypot(tx - pirate.x, ty - pirate.y);
            if (dist > 20) {
                pirate.x += (tx - pirate.x) / dist * pirate.speed * dt;
                pirate.y += (ty - pirate.y) / dist * pirate.speed * dt;
            }
        }

        _findBuildingTarget(bs, pirate) {
            const capturable = ['wooden_house', 'shelter', 'fence', 'gate', 'storage', 'workbench', 'campfire'];
            let best = null;
            let bestDist = Infinity;
            for (const b of bs.buildings) {
                if (!capturable.includes(b.type)) continue;
                const d = Math.hypot(b.x - pirate.x, b.y - pirate.y);
                if (d < bestDist) { bestDist = d; best = b; }
            }
            return best;
        }

        // ── 3. Ефект Фантомного меча ──────────────────────────
        applyPhantomCurse(target) {
            // Перевіряємо, щоб не дублювати
            if (this.phantomCursed.find(c => c.target === target)) return;
            this.phantomCursed.push({ target, timer: 3.0 });
            this.game.showNotification('💀 Ціль прокляте фантомним мечем! Смерть через 3 секунди...', 'warning');
        }

        _updatePhantomCursed(dt, p) {
            for (let i = this.phantomCursed.length - 1; i >= 0; i--) {
                const c = this.phantomCursed[i];
                c.timer -= dt;
                // Встановлюємо alpha (прозорість) на об'єкті
                c.target.phantomAlpha = Math.max(0.05, c.timer / 3.0);

                if (c.timer <= 0) {
                    // Вбиваємо ціль
                    c.target.hp   = c.target.hp   !== undefined ? 0 : c.target.hp;
                    c.target.health = c.target.health !== undefined ? 0 : c.target.health;
                    // Частинки зникнення
                    this.game.spawnParticles(c.target.x, c.target.y, 'rgba(140,80,255,0.9)', 25);
                    this.game.showNotification('💀 Ціль розчинилась у примарному світлі!', 'info');
                    this.phantomCursed.splice(i, 1);
                }
            }
        }

        // ── 4. Рендер ─────────────────────────────────────────
        render(ctx, camera) {
            this._renderShip(ctx, camera);
            this._renderPirates(ctx, camera);
        }

        _renderShip(ctx, camera) {
            if (!this.ship) return;
            const s = this.ship;
            const pos = camera.worldToScreen(s.x, s.y);

            ctx.save();
            ctx.globalAlpha = s.alpha * 0.9;
            ctx.translate(pos.x, pos.y);
            ctx.rotate(s.angle);

            // Тінь корабля
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.beginPath();
            ctx.ellipse(0, 20, 60, 15, 0, 0, Math.PI * 2);
            ctx.fill();

            // Корпус корабля (фантомний — синьо-фіолетовий)
            const gradient = ctx.createLinearGradient(-55, -20, 55, 20);
            gradient.addColorStop(0, '#1E1B4B');
            gradient.addColorStop(0.5, '#312E81');
            gradient.addColorStop(1, '#1E1B4B');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(-55, 0);
            ctx.quadraticCurveTo(-60, 20, 0, 22);
            ctx.quadraticCurveTo(60, 20, 55, 0);
            ctx.quadraticCurveTo(40, -18, 0, -20);
            ctx.quadraticCurveTo(-40, -18, -55, 0);
            ctx.fill();
            ctx.strokeStyle = '#7C3AED';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Щогла
            ctx.fillStyle = '#4C1D95';
            ctx.fillRect(-4, -55, 7, 55);

            // Вітрило (примарне, з рунами)
            ctx.fillStyle = 'rgba(139,92,246,0.55)';
            ctx.beginPath();
            ctx.moveTo(0, -52);
            ctx.lineTo(32, -30);
            ctx.lineTo(0, -10);
            ctx.closePath();
            ctx.fill();

            // Руни на вітрилі
            ctx.fillStyle = 'rgba(196,181,253,0.9)';
            ctx.font = 'bold 10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('ᚠ', 14, -34);
            ctx.fillText('ᚢ', 10, -24);

            // Черепна символіка на корпусі
            ctx.fillStyle = 'rgba(196,181,253,0.8)';
            ctx.font = '14px sans-serif';
            ctx.fillText('💀', -10, 6);

            // Пульсуюче сяйво
            const glow = Math.abs(Math.sin(performance.now() / 700));
            ctx.strokeStyle = `rgba(139,92,246,${glow * 0.6})`;
            ctx.lineWidth = 3 + glow * 4;
            ctx.beginPath();
            ctx.ellipse(0, 0, 60, 24, 0, 0, Math.PI * 2);
            ctx.stroke();

            ctx.restore();

            // Назва корабля над ним
            if (s.alpha > 0.3) {
                ctx.save();
                ctx.globalAlpha = s.alpha;
                ctx.fillStyle = 'rgba(0,0,0,0.6)';
                ctx.fillRect(pos.x - 65, pos.y - 68, 130, 20);
                ctx.fillStyle = '#C4B5FD';
                ctx.font = 'bold 11px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('⚓ ФАНТОМНИЙ КОРАБЕЛЬ', pos.x, pos.y - 54);
                ctx.restore();
            }
        }

        _renderPirates(ctx, camera) {
            for (const pirate of this.pirates) {
                if (!camera.isVisible(pirate.x, pirate.y, 60)) continue;
                const pos = camera.worldToScreen(pirate.x, pirate.y);
                const alpha = pirate.phantomAlpha !== undefined ? pirate.phantomAlpha : pirate.alpha;

                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.translate(pos.x, pos.y);

                // Тінь
                ctx.fillStyle = 'rgba(0,0,0,0.3)';
                ctx.beginPath();
                ctx.ellipse(0, 16, 10, 5, 0, 0, Math.PI * 2);
                ctx.fill();

                // Тіло (фантомне, синьо-фіолетове)
                ctx.fillStyle = pirate.captureProgress > 0 ? '#7C3AED' : '#4C1D95';
                ctx.fillRect(-8, -6, 16, 18);

                // Голова
                ctx.fillStyle = '#DDD6FE';
                ctx.beginPath();
                ctx.arc(0, -12, 9, 0, Math.PI * 2);
                ctx.fill();

                // Очі — світяться фіолетовим
                ctx.fillStyle = '#A855F7';
                ctx.beginPath();
                ctx.arc(-3, -13, 2.5, 0, Math.PI * 2);
                ctx.arc(3, -13, 2.5, 0, Math.PI * 2);
                ctx.fill();

                // Ефект прозорості — частинки
                if (pirate.phantomAlpha !== undefined) {
                    const t = performance.now() / 400;
                    ctx.globalAlpha = alpha * 0.5;
                    ctx.fillStyle = '#A855F7';
                    for (let k = 0; k < 4; k++) {
                        const angle = t + k * Math.PI / 2;
                        ctx.beginPath();
                        ctx.arc(Math.cos(angle) * 12, Math.sin(angle) * 12 - 5, 2, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    ctx.globalAlpha = alpha;
                }

                // Шабля
                ctx.strokeStyle = '#6D28D9';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(8, -4);
                ctx.lineTo(20, 10);
                ctx.stroke();

                ctx.restore();

                // Планка HP
                ctx.save();
                ctx.globalAlpha = pirate.alpha;
                const barW = 36;
                ctx.fillStyle = '#1E1B4B';
                ctx.fillRect(pos.x - barW / 2, pos.y - 30, barW, 5);
                ctx.fillStyle = '#7C3AED';
                ctx.fillRect(pos.x - barW / 2, pos.y - 30, barW * (pirate.hp / pirate.maxHp), 5);
                ctx.restore();

                // Прогрес захоплення
                if (pirate.captureProgress > 0 && pirate.captureProgress < 5) {
                    ctx.save();
                    ctx.globalAlpha = 0.9;
                    ctx.fillStyle = 'rgba(0,0,0,0.5)';
                    ctx.fillRect(pos.x - 24, pos.y - 40, 48, 7);
                    ctx.fillStyle = '#F59E0B';
                    ctx.fillRect(pos.x - 24, pos.y - 40, 48 * (pirate.captureProgress / 5), 7);
                    ctx.fillStyle = '#fff';
                    ctx.font = '9px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText('Захоплення...', pos.x, pos.y - 48);
                    ctx.restore();
                }
            }
        }

        // Шкода для піратів (від атаки гравця)
        damagePirate(pirate, dmg) {
            pirate.hp -= dmg;
            if (pirate.hp < 0) pirate.hp = 0;
        }

        // Всі живі пірати
        getAlivePirates() { return this.pirates; }
    }

    // ─── ІНТЕГРАЦІЯ З ІГРОВИМ ЦИКЛОМ ─────────────────────────
    if (window.Game) {

        // Патч init
        const origInit = Game.prototype.init;
        Game.prototype.init = function () {
            origInit.call(this);
            this.phantomPirateSystem = new PhantomPirateSystem(this);
        };

        // Патч loadFromSave
        const origLoad = Game.prototype.loadFromSave;
        Game.prototype.loadFromSave = function () {
            origLoad.call(this);
            if (!this.phantomPirateSystem) {
                this.phantomPirateSystem = new PhantomPirateSystem(this);
            }
        };

        // Патч update
        const origUpdate = Game.prototype.update;
        Game.prototype.update = function (dt) {
            origUpdate.call(this, dt);
            if (this.phantomPirateSystem) this.phantomPirateSystem.update(dt);
        };

        // Патч render (після всього рендеру)
        const origRender = Game.prototype.render;
        Game.prototype.render = function () {
            origRender.call(this);
            if (this.phantomPirateSystem && this.camera) {
                this.phantomPirateSystem.render(this.ctx, this.camera);
            }
        };

        // Патч attack — фантомний меч наносить прокляття
        const origAttack = Game.prototype.attack;
        Game.prototype.attack = function (aimX, aimY, allowMiss) {
            const p = this.player;
            const pps = this.phantomPirateSystem;

            // Перевіряємо чи екіпіровано фантомний меч
            if (p && p.equippedTool === 'phantom_sword' && pps) {
                const range = 70;
                let hit = false;

                // Атакуємо фантомних піратів
                for (const pirate of pps.getAlivePirates()) {
                    if (Math.hypot(pirate.x - p.x, pirate.y - p.y) < range) {
                        pps.damagePirate(pirate, 35);
                        hit = true;
                    }
                }

                // Атакуємо зомбі
                if (this.zombieManager) {
                    for (const z of this.zombieManager.zombies) {
                        if (Math.hypot(z.x - p.x, z.y - p.y) < range) {
                            pps.applyPhantomCurse(z);
                            z.health -= 10;
                            hit = true;
                        }
                    }
                }

                // Атакуємо піратів (activeRaidPirates)
                if (this.activeRaidPirates) {
                    for (const rp of this.activeRaidPirates) {
                        if (Math.hypot(rp.x - p.x, rp.y - p.y) < range) {
                            pps.applyPhantomCurse(rp);
                            rp.health -= 10;
                            hit = true;
                        }
                    }
                }

                if (hit) {
                    this.spawnParticles(p.x, p.y, 'rgba(139,92,246,0.9)', 15);
                    this.showNotification('⚔️ Фантомний удар!', 'info');
                    return; // Не дозволяємо стандартній атаці
                }
            }

            // Стандартна атака
            if (origAttack) origAttack.apply(this, [aimX, aimY, allowMiss]);
        };

        // Патч handleInteraction — кажемо гравцю про корабель
        const origInteract = Game.prototype.handleInteraction;
        Game.prototype.handleInteraction = function () {
            const pps = this.phantomPirateSystem;
            if (pps && pps.ship && !pps.ship.departing) {
                const dist = Math.hypot(this.player.x - pps.ship.x, this.player.y - pps.ship.y);
                if (dist < 120) {
                    this.showNotification('⚓ Фантомний корабель... зсередини чути стогони. Вбийте всіх піратів!', 'warning');
                    return;
                }
            }
            if (origInteract) origInteract.call(this);
        };
    }

    // ─── DRAWITEMICON — іконка фантомного меча ────────────────
    if (window.drawItemIcon) {
        const origDrawItemIcon = window.drawItemIcon;
        window.drawItemIcon = function (ctx, itemId, x, y, size) {
            if (itemId === 'phantom_sword') {
                const cx = x + size / 2;
                const cy = y + size / 2;
                const s = size;
                ctx.save();
                // Фіолетове сяйво
                const grd = ctx.createRadialGradient(cx, cy, 2, cx, cy, s * 0.4);
                grd.addColorStop(0, 'rgba(167,139,250,0.7)');
                grd.addColorStop(1, 'rgba(109,40,217,0)');
                ctx.fillStyle = grd;
                ctx.fillRect(x, y, size, size);

                // Клинок
                ctx.strokeStyle = '#C4B5FD';
                ctx.lineWidth = s * 0.12;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(cx - s * 0.3, cy + s * 0.3);
                ctx.lineTo(cx + s * 0.3, cy - s * 0.3);
                ctx.stroke();

                // Гарда
                ctx.strokeStyle = '#7C3AED';
                ctx.lineWidth = s * 0.08;
                ctx.beginPath();
                ctx.moveTo(cx - s * 0.12, cy + s * 0.12);
                ctx.lineTo(cx + s * 0.14, cy - s * 0.08);
                ctx.stroke();

                // Рукоятка
                ctx.strokeStyle = '#4C1D95';
                ctx.lineWidth = s * 0.1;
                ctx.beginPath();
                ctx.moveTo(cx - s * 0.3, cy + s * 0.3);
                ctx.lineTo(cx - s * 0.4, cy + s * 0.4);
                ctx.stroke();

                // Частинки
                ctx.fillStyle = 'rgba(196,181,253,0.8)';
                const t = performance.now() / 500;
                for (let k = 0; k < 3; k++) {
                    const angle = t + k * 2.1;
                    const r = s * 0.22;
                    ctx.beginPath();
                    ctx.arc(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r, s * 0.04, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
                return;
            }
            origDrawItemIcon.call(this, ctx, itemId, x, y, size);
        };
    }

    // ─── ПІДКАЗКА В ТУЛТІПАХ ─────────────────────────────────
    if (window.Game) {
        const origTooltips = Game.prototype.drawTooltips;
        if (origTooltips) {
            Game.prototype.drawTooltips = function () {
                origTooltips.call(this);
                const pps = this.phantomPirateSystem;
                if (!pps || !pps.ship || pps.ship.departing) return;
                const dist = Math.hypot(this.player.x - pps.ship.x, this.player.y - pps.ship.y);
                if (dist < 180) {
                    const pos = this.camera.worldToScreen(pps.ship.x, pps.ship.y);
                    this.ctx.save();
                    this.ctx.fillStyle = 'rgba(76,29,149,0.85)';
                    this.ctx.fillRect(pos.x - 90, pos.y - 50, 180, 20);
                    this.ctx.fillStyle = '#C4B5FD';
                    this.ctx.font = '11px sans-serif';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText('[E] Фантомний корабель (вбийте піратів!)', pos.x, pos.y - 36);
                    this.ctx.restore();
                }
            };
        }
    }

    console.log('[phantom-pirates.js] Фантомний корабель та пірати активовані! 👻⚓');
})();
