// ============================================================
// world-events.js
// ПОДІЇ СВІТУ, ПОГОДА ТА ТЕХНОЛОГІЇ:
//  1. Смерч / Торнадо — рухається по карті, підіймає та кидає предмети й ворогів
//  2. Сезони та Снігопад взимку — теплий одяг або вогнище від замерзання
//  3. Лісова пожежа — поширюється на дерева, гаситься водою або дощем
//  4. Сонячне затемнення — темрява вдень, зомбі вдень, тиша птахів
//  5. Паливний генератор — живить турелі, лампи та лабораторію
//  6. Телескоп — розширений огляд карти та виявлення кораблів
// ============================================================
(function () {
    'use strict';

    // ─── 1. ПРЕДМЕТИ, РЕЦЕПТИ ТА БУДІВЛІ ─────────────────────
    if (window.ITEM_DB) {
        Object.assign(window.ITEM_DB, {
            'warm_coat': {
                id: 'warm_coat', name: 'Тепла куртка', icon: 'warm_coat',
                category: 'armor', maxStack: 1, warmth: true,
                description: 'Захищає від зимового морозу та снігопаду'
            },
            'fuel_generator_item': {
                id: 'fuel_generator_item', name: 'Паливний генератор', icon: 'fuel_generator',
                category: 'building', maxStack: 2, placeable: 'fuel_generator',
                description: 'Працює на паливі та живить турелі, прожектори й лабораторію в радіусі 260px'
            },
            'telescope_item': {
                id: 'telescope_item', name: 'Телескоп', icon: 'telescope',
                category: 'building', maxStack: 2, placeable: 'telescope',
                description: 'Встановіть на березі або вежі [E] — бачте далі та відстежуйте кораблі'
            }
        });
    }

    if (window.RECIPE_DB) {
        Object.assign(window.RECIPE_DB, {
            'warm_coat': {
                id: 'warm_coat', name: 'Тепла куртка',
                result: { id: 'warm_coat', count: 1 },
                materials: [{ id: 'fiber', count: 12 }, { id: 'rope', count: 3 }, { id: 'meat', count: 2 }],
                requires: 'workbench'
            },
            'fuel_generator_item': {
                id: 'fuel_generator_item', name: 'Паливний генератор',
                result: { id: 'fuel_generator_item', count: 1 },
                materials: [{ id: 'metal_scrap', count: 8 }, { id: 'electronics', count: 4 }, { id: 'fuel', count: 1 }],
                requires: 'workbench'
            },
            'telescope_item': {
                id: 'telescope_item', name: 'Телескоп',
                result: { id: 'telescope_item', count: 1 },
                materials: [{ id: 'metal_scrap', count: 4 }, { id: 'glass_shard', count: 3 }, { id: 'wood', count: 2 }],
                requires: 'workbench'
            }
        });
    }

    if (window.BUILDING_DB) {
        Object.assign(window.BUILDING_DB, {
            'fuel_generator': {
                id: 'fuel_generator', name: 'Паливний генератор', width: 44, height: 44,
                passable: false, maxHealth: 180, func: 'power',
                description: 'Живить турелі, лампи й лабораторію'
            },
            'telescope': {
                id: 'telescope', name: 'Телескоп', width: 32, height: 32,
                passable: false, maxHealth: 80, func: 'vision',
                description: 'Дозволяє дивитися далеко на море та острів'
            }
        });
    }

    // ─── 2. СИСТЕМА ПОДІЙ СВІТУ ──────────────────────────────
    class WorldEventsSystem {
        constructor(game) {
            this.game = game;

            // Сезони (зміна кожні 4 дні)
            this.seasons = ['Весна', 'Літо', 'Осінь', 'Зима'];
            this.snowflakes = [];
            this.bodyTemp = 100; // 0..100 (нижче 30 -> замерзання)
            this.freezeDmgCd = 0;

            // Смерч / Торнадо
            this.tornado = null; // { x, y, vx, vy, timer, angle }
            this.tornadoCooldown = 210;

            // Лісові пожежі
            this.fires = []; // [{ x, y, treeRef, life, spreadCd }]
            this.fireCheckCd = 4;

            // Сонячне затемнення
            this.eclipseActive = false;
            this.eclipseTimer = 0;
            this.eclipseCooldown = 320;
            this.eclipseZombieCd = 0;

            // Телескоп
            this.telescopeActive = false;
            this.telescopeOffset = { x: 0, y: 0 };
        }

        getCurrentSeason() {
            const day = this.game.timeSystem ? this.game.timeSystem.day : 1;
            const idx = Math.floor((day - 1) / 4) % 4;
            return this.seasons[idx];
        }

        isWinter() {
            return this.getCurrentSeason() === 'Зима';
        }

        update(dt) {
            const p = this.game.player;
            if (!p) return;

            this._updateSeasonAndWinter(dt, p);
            this._updateTornado(dt, p);
            this._updateForestFires(dt, p);
            this._updateSolarEclipse(dt, p);
            this._updateGenerators(dt);
            this._updateTelescope(dt, p);
        }

        // ── 1. Зима та снігопад ────────────────────────────────
        _updateSeasonAndWinter(dt, p) {
            const winter = this.isWinter();
            const w = this.game.canvas?.width || window.innerWidth;
            const h = this.game.canvas?.height || window.innerHeight;

            if (winter) {
                if (this.snowflakes.length < 90) {
                    this.snowflakes.push({
                        x: Math.random() * w,
                        y: -10,
                        r: 1.5 + Math.random() * 2.5,
                        vy: 35 + Math.random() * 45,
                        vx: -15 + Math.random() * 30
                    });
                }
                for (let i = this.snowflakes.length - 1; i >= 0; i--) {
                    const sf = this.snowflakes[i];
                    sf.x += sf.vx * dt;
                    sf.y += sf.vy * dt;
                    if (sf.y > h + 10) {
                        sf.y = -10;
                        sf.x = Math.random() * w;
                    }
                }

                // Перевірка тепла: теплий одяг, вогнище або дім/укриття поруч
                const hasCoat = p.inventory?.hasItem('warm_coat', 1) || p.inventory?.hasItem('military_uniform', 1);
                const bs = this.game.buildingSystem;
                const nearHeat = bs?.buildings?.some(b =>
                    ['campfire', 'wooden_house', 'shelter'].includes(b.type) &&
                    Math.hypot(b.x - p.x, b.y - p.y) < 150
                );

                if (hasCoat || nearHeat || this.fires.some(f => Math.hypot(f.x - p.x, f.y - p.y) < 130)) {
                    this.bodyTemp = Math.min(100, this.bodyTemp + 8 * dt);
                } else {
                    this.bodyTemp = Math.max(0, this.bodyTemp - 2.6 * dt);
                    if (this.bodyTemp < 25) {
                        this.freezeDmgCd -= dt;
                        if (this.freezeDmgCd <= 0) {
                            this.freezeDmgCd = 2.5;
                            p.health = Math.max(0, p.health - 3);
                            this.game.showNotification('❄️ Ви замерзаєте! Потрібна Тепла куртка або вогнище!', 'danger');
                        }
                    }
                }
            } else {
                this.snowflakes.length = 0;
                this.bodyTemp = Math.min(100, this.bodyTemp + 12 * dt);
            }
        }

        // ── 2. Смерч / Торнадо ────────────────────────────────
        _updateTornado(dt, p) {
            if (!this.tornado) {
                this.tornadoCooldown -= dt;
                const isStorm = this.game.weatherSystem?.current === 'storm';
                if (this.tornadoCooldown <= 0 || (isStorm && Math.random() < dt * 0.02)) {
                    this.tornadoCooldown = 220 + Math.random() * 140;
                    const ang = Math.random() * Math.PI * 2;
                    this.tornado = {
                        x: p.x + Math.cos(ang) * 420,
                        y: p.y + Math.sin(ang) * 420,
                        vx: (Math.random() - 0.5) * 90,
                        vy: (Math.random() - 0.5) * 90,
                        timer: 32,
                        angle: 0
                    };
                    this.game.showNotification('🌪️ УВАГА! Наближається СМЕРЧ! Тримайтеся подалі від вихору!', 'danger');
                }
                return;
            }

            const t = this.tornado;
            t.timer -= dt;
            t.angle += dt * 10;
            t.x += t.vx * dt;
            t.y += t.vy * dt;

            // Легке блукання траєкторії
            t.vx += (Math.random() - 0.5) * 35 * dt;
            t.vy += (Math.random() - 0.5) * 35 * dt;

            // Піднімаємо та кидаємо предмети на землі
            if (this.game.world?.droppedItems) {
                for (const item of this.game.world.droppedItems) {
                    const d = Math.hypot(item.x - t.x, item.y - t.y);
                    if (d < 160 && d > 8) {
                        const a = Math.atan2(t.y - item.y, t.x - item.x) + 1.2;
                        item.x += Math.cos(a) * 140 * dt;
                        item.y += Math.sin(a) * 140 * dt;
                    } else if (d <= 16) {
                        const tossAng = Math.random() * Math.PI * 2;
                        item.x += Math.cos(tossAng) * 95;
                        item.y += Math.sin(tossAng) * 95;
                    }
                }
            }

            // Піднімаємо та кидаємо ворогів (зомбі / піратів)
            const enemies = [
                ...(this.game.zombieManager?.zombies || []),
                ...(this.game.activeRaidPirates || [])
            ];
            for (const en of enemies) {
                const d = Math.hypot(en.x - t.x, en.y - t.y);
                if (d < 150) {
                    const a = Math.atan2(t.y - en.y, t.x - en.x) + 1.3;
                    en.x += Math.cos(a) * 160 * dt;
                    en.y += Math.sin(a) * 160 * dt;
                    en.health -= 12 * dt;
                }
            }

            // Відштовхуємо/тягнемо гравця
            const pd = Math.hypot(p.x - t.x, p.y - t.y);
            if (pd < 110 && !p.inBoat) {
                const a = Math.atan2(t.y - p.y, t.x - p.x) + 0.9;
                p.x += Math.cos(a) * 85 * dt;
                p.y += Math.sin(a) * 85 * dt;
                if (pd < 35 && Math.random() < dt * 2) {
                    p.health = Math.max(0, p.health - 4);
                    this.game.showNotification('🌪️ Смерч закрутив вас!', 'danger');
                }
            }

            if (t.timer <= 0) {
                this.tornado = null;
                this.game.showNotification('🌤️ Смерч розсіявся.', 'info');
            }
        }

        // ── 3. Лісова пожежа ───────────────────────────────────
        igniteAt(x, y) {
            if (this.fires.length >= 18) return;
            if (this.fires.some(f => Math.hypot(f.x - x, f.y - y) < 28)) return;
            this.fires.push({ x, y, life: 35, spreadCd: 6.0 });
            this.game.showNotification('🔥 У лісі спалахнула пожежа! Загасіть водою ([E])!', 'danger');
        }

        _updateForestFires(dt, p) {
            const weather = this.game.weatherSystem?.current;
            const isRaining = weather === 'rain' || weather === 'heavy_rain' || weather === 'storm';

            // Спонтанна пожежа під час грози
            this.fireCheckCd -= dt;
            if (this.fireCheckCd <= 0) {
                this.fireCheckCd = 8;
                if (weather === 'storm' && Math.random() < 0.25 && this.game.world?.resources) {
                    const trees = this.game.world.resources.filter(r => !r.depleted && ['tree', 'palm'].includes(r.type));
                    if (trees.length > 0) {
                        const t = trees[Math.floor(Math.random() * trees.length)];
                        if (Math.hypot(t.x - p.x, t.y - p.y) < 700) this.igniteAt(t.x, t.y);
                    }
                }
            }

            for (let i = this.fires.length - 1; i >= 0; i--) {
                const f = this.fires[i];
                f.life -= isRaining ? dt * 5.0 : dt;
                f.spreadCd -= dt;

                if (Math.random() < dt * 10) {
                    this.game.spawnParticles(f.x, f.y, '#F97316', 1);
                }

                // Шкода гравцю та ворогам поруч
                if (Math.hypot(p.x - f.x, p.y - f.y) < 32 && Math.random() < dt * 2) {
                    p.health = Math.max(0, p.health - 3);
                }

                // Поширення на сусідні дерева
                if (f.spreadCd <= 0 && !isRaining && this.fires.length < 18 && this.game.world?.resources) {
                    f.spreadCd = 7.5;
                    const nextTree = this.game.world.resources.find(r =>
                        !r.depleted && ['tree', 'palm', 'coconut_palm'].includes(r.type) &&
                        Math.hypot(r.x - f.x, r.y - f.y) < 95 &&
                        !this.fires.some(of => Math.hypot(of.x - r.x, of.y - r.y) < 25)
                    );
                    if (nextTree) {
                        this.fires.push({ x: nextTree.x, y: nextTree.y, life: 30, spreadCd: 8.0 });
                    }
                }

                if (f.life <= 0) {
                    this.fires.splice(i, 1);
                }
            }
        }

        extinguishNearestFire(p) {
            const idx = this.fires.findIndex(f => Math.hypot(f.x - p.x, f.y - p.y) < 65);
            if (idx < 0) return false;
            const inv = p.inventory;
            if (!inv || (!inv.hasItem('water', 1) && !inv.hasItem('water_container', 1))) {
                this.game.showNotification('Потрібна Вода або Ємність для води, щоб загасити пожежу!', 'warning');
                return true;
            }
            if (inv.hasItem('water', 1)) inv.removeItem('water', 1);
            this.fires.splice(idx, 1);
            this.game.spawnParticles(p.x, p.y, '#38BDF8', 18);
            this.game.showNotification('💧 Ви загасили лісову пожежу!', 'success');
            return true;
        }

        // ── 4. Сонячне затемнення ──────────────────────────────
        _updateSolarEclipse(dt, p) {
            const isNight = this.game.timeSystem ? this.game.timeSystem.isNight() : false;
            if (!this.eclipseActive) {
                this.eclipseCooldown -= dt;
                if (this.eclipseCooldown <= 0 && !isNight) {
                    this.eclipseCooldown = 360 + Math.random() * 180;
                    this.eclipseActive = true;
                    this.eclipseTimer = 55;
                    this.game.showNotification('🌑 СОНЯЧНЕ ЗАТЕМНЕННЯ! Птахи замовкли, а зомбі виходять удень!', 'danger');
                }
                return;
            }

            this.eclipseTimer -= dt;
            this.eclipseZombieCd -= dt;
            if (this.eclipseZombieCd <= 0 && this.game.zombieManager) {
                this.eclipseZombieCd = 9.0;
                const ang = Math.random() * Math.PI * 2;
                this.game.zombieManager.zombies.push({
                    id: 'ecl_z_' + Date.now(),
                    x: p.x + Math.cos(ang) * 280,
                    y: p.y + Math.sin(ang) * 280,
                    health: 40, maxHealth: 40, attackCooldown: 0
                });
            }

            if (this.eclipseTimer <= 0 || isNight) {
                this.eclipseActive = false;
                this.game.showNotification('☀️ Сонячне затемнення минуло.', 'info');
            }
        }

        // ── 5. Паливний генератор ──────────────────────────────
        _updateGenerators(dt) {
            const bs = this.game.buildingSystem;
            if (!bs) return;
            const gens = bs.buildings.filter(b => b.type === 'fuel_generator');
            for (const g of gens) {
                if (g.fuelLevel === undefined) g.fuelLevel = 50;
                if (g.fuelLevel > 0) {
                    g.active = true;
                    g.fuelLevel = Math.max(0, g.fuelLevel - dt * 0.45);
                    // Живимо сусідні прожектори, турелі, лампи
                    for (const ob of bs.buildings) {
                        if (['spotlight', 'auto_turret', 'electric_lamp', 'laboratory'].includes(ob.type)) {
                            if (Math.hypot(ob.x - g.x, ob.y - g.y) <= 260) {
                                ob.powered = true;
                                ob.active = true;
                            }
                        }
                    }
                } else {
                    g.active = false;
                }
            }
        }

        // ── 6. Телескоп ────────────────────────────────────────
        _updateTelescope(dt, p) {
            if (!this.telescopeActive) return;
            // Якщо гравець відійшов — вимикаємо
            const bs = this.game.buildingSystem;
            const nearTel = bs?.buildings?.find(b => b.type === 'telescope' && Math.hypot(b.x - p.x, b.y - p.y) < 75);
            if (!nearTel) {
                this.telescopeActive = false;
                return;
            }
            // Зсуваємо камеру в бік курсора для далекого огляду
            const inp = this.game.input;
            if (inp) {
                const dx = (inp.mouseX - window.innerWidth / 2) * 1.4;
                const dy = (inp.mouseY - window.innerHeight / 2) * 1.4;
                this.game.camera.x = p.x + dx;
                this.game.camera.y = p.y + dy;
            }
        }

        handleInteraction(p) {
            if (this.extinguishNearestFire(p)) return true;

            const bs = this.game.buildingSystem;
            if (!bs) return false;

            // Генератор [E] — дозаправка паливом
            const gen = bs.buildings.find(b => b.type === 'fuel_generator' && Math.hypot(b.x - p.x, b.y - p.y) < 60);
            if (gen) {
                if (p.inventory?.hasItem('fuel', 1)) {
                    p.inventory.removeItem('fuel', 1);
                    gen.fuelLevel = Math.min(100, (gen.fuelLevel || 0) + 50);
                    this.game.showNotification(`⚡ Генератор заправлено (${Math.round(gen.fuelLevel)}%)! Живить турелі та лампи.`, 'success');
                } else {
                    this.game.showNotification(`⚡ Заряд генератора: ${Math.round(gen.fuelLevel || 0)}%. Потрібно Паливо.`, 'info');
                }
                return true;
            }

            // Телескоп [E] — перегляд карти / кораблів
            const tel = bs.buildings.find(b => b.type === 'telescope' && Math.hypot(b.x - p.x, b.y - p.y) < 65);
            if (tel) {
                this.telescopeActive = !this.telescopeActive;
                if (this.telescopeActive) {
                    const shipInfo = this.game.phantomPirateSystem?.ship
                        ? '👻 Фантомний корабель на горизонті!'
                        : (this.game.pirateManager?.pirates?.length ? `🏴‍☠️ Помічено піратських кораблів: ${this.game.pirateManager.pirates.length}` : '🌊 Горизонт чистий');
                    this.game.showNotification(`🔭 Телескоп активовано! Рухайте мишею для огляду. ${shipInfo}`, 'info');
                } else {
                    this.game.showNotification('🔭 Телескоп вимкнено.', 'info');
                }
                return true;
            }

            return false;
        }

        render(ctx, camera) {
            const w = this.game.canvas?.width || window.innerWidth;
            const h = this.game.canvas?.height || window.innerHeight;
            const bs = this.game.buildingSystem;

            // 1) Будівлі: Генератор і Телескоп
            if (bs) {
                for (const b of bs.buildings) {
                    if (!camera.isVisible(b.x, b.y, 50)) continue;
                    const pos = camera.worldToScreen(b.x, b.y);
                    if (b.type === 'fuel_generator') {
                        ctx.save();
                        ctx.fillStyle = '#334155';
                        ctx.fillRect(pos.x - 18, pos.y - 16, 36, 32);
                        ctx.fillStyle = b.active ? '#22C55E' : '#EF4444';
                        ctx.beginPath(); ctx.arc(pos.x + 10, pos.y - 8, 4, 0, Math.PI * 2); ctx.fill();
                        ctx.fillStyle = '#FACC15'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
                        ctx.fillText('⚡', pos.x - 3, pos.y + 5);
                        ctx.restore();
                    } else if (b.type === 'telescope') {
                        ctx.save();
                        ctx.strokeStyle = '#78350F'; ctx.lineWidth = 3;
                        ctx.beginPath();
                        ctx.moveTo(pos.x - 10, pos.y + 14); ctx.lineTo(pos.x, pos.y - 4);
                        ctx.lineTo(pos.x + 10, pos.y + 14); ctx.stroke();
                        ctx.fillStyle = '#94A3B8';
                        ctx.save(); ctx.translate(pos.x, pos.y - 6); ctx.rotate(-0.35);
                        ctx.fillRect(-14, -4, 28, 8);
                        ctx.fillStyle = '#38BDF8'; ctx.fillRect(11, -3, 4, 6);
                        ctx.restore(); ctx.restore();
                    }
                }
            }

            // 2) Лісові пожежі
            for (const f of this.fires) {
                if (!camera.isVisible(f.x, f.y, 50)) continue;
                const pos = camera.worldToScreen(f.x, f.y);
                const pulse = 1 + Math.sin(performance.now() / 120 + f.x) * 0.2;
                ctx.save();
                ctx.fillStyle = 'rgba(249,115,22,0.8)';
                ctx.beginPath(); ctx.arc(pos.x, pos.y - 6, 16 * pulse, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = 'rgba(250,204,21,0.9)';
                ctx.beginPath(); ctx.arc(pos.x, pos.y - 8, 8 * pulse, 0, Math.PI * 2); ctx.fill();
                ctx.restore();
            }

            // 3) Смерч / Торнадо
            if (this.tornado && camera.isVisible(this.tornado.x, this.tornado.y, 160)) {
                const pos = camera.worldToScreen(this.tornado.x, this.tornado.y);
                ctx.save();
                ctx.translate(pos.x, pos.y);
                for (let ring = 0; ring < 5; ring++) {
                    const r = 16 + ring * 14;
                    const yOff = -ring * 16;
                    ctx.strokeStyle = `rgba(148,163,184,${0.65 - ring * 0.08})`;
                    ctx.lineWidth = 4;
                    ctx.beginPath();
                    ctx.ellipse(Math.sin(this.tornado.angle + ring) * 6, yOff, r, r * 0.4, 0, 0, Math.PI * 2);
                    ctx.stroke();
                }
                ctx.restore();
            }

            // 4) Зимовий снігопад + плашка сезону
            if (this.isWinter()) {
                ctx.save();
                ctx.fillStyle = 'rgba(224,242,254,0.14)';
                ctx.fillRect(0, 0, w, h);
                ctx.fillStyle = '#FFFFFF';
                for (const sf of this.snowflakes) {
                    ctx.beginPath(); ctx.arc(sf.x, sf.y, sf.r, 0, Math.PI * 2); ctx.fill();
                }
                ctx.restore();
            }

            // 5) Сонячне затемнення (денна темрява)
            if (this.eclipseActive) {
                ctx.save();
                ctx.fillStyle = 'rgba(15, 10, 30, 0.72)';
                ctx.fillRect(0, 0, w, h);
                // Корона сонця зверху
                ctx.fillStyle = '#000';
                ctx.beginPath(); ctx.arc(w - 110, 110, 22, 0, Math.PI * 2); ctx.fill();
                ctx.strokeStyle = '#F97316'; ctx.lineWidth = 3; ctx.stroke();
                ctx.restore();
            }

            // 6) Рамка телескопа
            if (this.telescopeActive) {
                ctx.save();
                ctx.strokeStyle = '#0F172A';
                ctx.lineWidth = 50;
                ctx.beginPath();
                ctx.arc(w / 2, h / 2, Math.min(w, h) * 0.45, 0, Math.PI * 2);
                ctx.stroke();
                ctx.fillStyle = 'rgba(15,23,42,0.8)';
                ctx.fillRect(w / 2 - 140, 62, 280, 26);
                ctx.fillStyle = '#38BDF8'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';
                ctx.fillText('🔭 РЕЖИМ ТЕЛЕСКОПА ([E] — вийти)', w / 2, 79);
                ctx.restore();
            }

            // 7) Індикатор Сезону / Температури
            ctx.save();
            ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
            ctx.fillRect(14, 170, 180, 26);
            const season = this.getCurrentSeason();
            const icon = season === 'Зима' ? '❄️' : season === 'Весна' ? '🌸' : season === 'Літо' ? '☀️' : '🍂';
            ctx.fillStyle = this.bodyTemp < 35 ? '#38BDF8' : '#E2E8F0';
            ctx.font = 'bold 12px sans-serif';
            ctx.fillText(`${icon} ${season} | Тепло: ${Math.round(this.bodyTemp)}%`, 22, 187);
            ctx.restore();
        }
    }

    // ─── 3. ІНТЕГРАЦІЯ З GAME ────────────────────────────────
    if (window.Game) {
        const origInit = Game.prototype.init;
        Game.prototype.init = function () {
            origInit.call(this);
            this.worldEventsSystem = new WorldEventsSystem(this);
        };

        const origLoad = Game.prototype.loadFromSave;
        Game.prototype.loadFromSave = function () {
            origLoad.call(this);
            if (!this.worldEventsSystem) this.worldEventsSystem = new WorldEventsSystem(this);
        };

        const origUpdate = Game.prototype.update;
        Game.prototype.update = function (dt) {
            origUpdate.call(this, dt);
            if (this.worldEventsSystem) this.worldEventsSystem.update(dt);
        };

        const origRender = Game.prototype.render;
        Game.prototype.render = function () {
            origRender.call(this);
            if (this.worldEventsSystem && this.camera) {
                this.worldEventsSystem.render(this.ctx, this.camera);
            }
        };

        const origInteract = Game.prototype.handleInteraction;
        Game.prototype.handleInteraction = function () {
            if (this.worldEventsSystem && this.worldEventsSystem.handleInteraction(this.player)) return;
            if (origInteract) origInteract.call(this);
        };
    }

    if (window.drawItemIcon) {
        const origIcon = window.drawItemIcon;
        window.drawItemIcon = function (ctx, itemId, x, y, size) {
            const cx = x + size / 2, cy = y + size / 2, s = size;
            if (itemId === 'warm_coat') {
                ctx.save();
                ctx.fillStyle = '#B45309';
                ctx.fillRect(cx - s * 0.25, cy - s * 0.22, s * 0.5, s * 0.48);
                ctx.fillStyle = '#FEF3C7';
                ctx.fillRect(cx - s * 0.16, cy - s * 0.26, s * 0.32, s * 0.12);
                ctx.restore();
                return;
            }
            if (itemId === 'fuel_generator_item') {
                ctx.save();
                ctx.fillStyle = '#334155'; ctx.fillRect(cx - s * 0.26, cy - s * 0.2, s * 0.52, s * 0.4);
                ctx.fillStyle = '#FACC15'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillText('⚡', cx, cy);
                ctx.restore();
                return;
            }
            if (itemId === 'telescope_item') {
                ctx.save();
                ctx.strokeStyle = '#94A3B8'; ctx.lineWidth = 4;
                ctx.beginPath(); ctx.moveTo(cx - s * 0.25, cy + s * 0.15); ctx.lineTo(cx + s * 0.25, cy - s * 0.2); ctx.stroke();
                ctx.fillStyle = '#38BDF8'; ctx.beginPath(); ctx.arc(cx + s * 0.24, cy - s * 0.19, s * 0.08, 0, Math.PI * 2); ctx.fill();
                ctx.restore();
                return;
            }
            origIcon.call(this, ctx, itemId, x, y, size);
        };
    }

    console.log('[world-events.js] Смерч, Зима/Сніг, Пожежі, Затемнення, Генератор, Телескоп — завантажено ✅');
})();
