// ============================================================
// combat-expansion.js
// БОЙОВЕ РОЗШИРЕННЯ:
//  1. Пастки-сигналки (tripwire_alarm)
//  2. Дерев'яний та Металевий щити (wood_shield, metal_shield) [V / ПКМ]
//  3. Лук, Стріли та Вогняні стріли (bow, arrow, fire_arrow) [X - перемкнути стріли]
//  4. Граната (grenade) — AoE вибух + відкидання
//  5. Отрута на зброю (poison_vial) — DoT-ефект на клинок
//  6. Димова шашка (smoke_grenade) — димова завіса + SOS-сигнал
// ============================================================
(function () {
    'use strict';

    // ─── 1. ПРЕДМЕТИ, РЕЦЕПТИ ТА БУДІВЛІ ─────────────────────
    if (window.ITEM_DB) {
        Object.assign(window.ITEM_DB, {
            'tripwire_alarm_item': {
                id: 'tripwire_alarm_item', name: 'Пастка-сигналка', icon: 'tripwire_alarm',
                category: 'building', maxStack: 10, placeable: 'tripwire_alarm',
                description: 'Мотузка з дзвіночком між кілками. Сповіщає про ворогів при перетині'
            },
            'wood_shield': {
                id: 'wood_shield', name: 'Дерев\'яний щит', icon: 'wood_shield',
                category: 'armor', maxStack: 1, blockPower: 0.65,
                description: 'Блокує 65% шкоди при утриманні [V] або ПКМ (20% пасивно)'
            },
            'metal_shield': {
                id: 'metal_shield', name: 'Металевий щит', icon: 'metal_shield',
                category: 'armor', maxStack: 1, blockPower: 0.85,
                description: 'Блокує 85% шкоди при утриманні [V] або ПКМ (30% пасивно)'
            },
            'bow': {
                id: 'bow', name: 'Мисливський лук', icon: 'bow',
                category: 'weapon', toolType: 'bow', maxStack: 1, damage: 34, range: 340, cooldown: 0.55,
                description: 'Безшумна зброя. Потребує стріли або вогняні стріли ([X] — перемкнути тип)'
            },
            'arrow': {
                id: 'arrow', name: 'Стріла', icon: 'arrow',
                category: 'ammo', maxStack: 40,
                description: 'Звичайна стріла для лука'
            },
            'fire_arrow': {
                id: 'fire_arrow', name: 'Вогняна стріла', icon: 'fire_arrow',
                category: 'ammo', maxStack: 30,
                description: 'Підпалює ворогів і може запалити дерева'
            },
            'grenade': {
                id: 'grenade', name: 'Граната', icon: 'grenade',
                category: 'weapon', toolType: 'throwable', maxStack: 10, damage: 85, range: 260, cooldown: 0.9,
                description: 'Вибухає через 1.2с, завдає AoE шкоди та відкидає ворогів'
            },
            'poison_vial': {
                id: 'poison_vial', name: 'Отрута для клинка', icon: 'poison_vial',
                category: 'consumable', maxStack: 10,
                description: 'Намастіть зброю, щоб отруювати ворогів на 6 сек (DoT)'
            },
            'smoke_grenade': {
                id: 'smoke_grenade', name: 'Димова шашка', icon: 'smoke_grenade',
                category: 'weapon', toolType: 'smoke', maxStack: 10, range: 220, cooldown: 1.0,
                description: 'Створює димову завісу (сліпить ворогів) або подає SOS-сигнал'
            }
        });
    }

    if (window.RECIPE_DB) {
        Object.assign(window.RECIPE_DB, {
            'tripwire_alarm_item': {
                id: 'tripwire_alarm_item', name: 'Пастка-сигналка',
                result: { id: 'tripwire_alarm_item', count: 2 },
                materials: [{ id: 'rope', count: 1 }, { id: 'branch', count: 2 }, { id: 'metal_scrap', count: 1 }],
                requires: null
            },
            'wood_shield': {
                id: 'wood_shield', name: 'Дерев\'яний щит',
                result: { id: 'wood_shield', count: 1 },
                materials: [{ id: 'wood', count: 6 }, { id: 'rope', count: 2 }],
                requires: null
            },
            'metal_shield': {
                id: 'metal_shield', name: 'Металевий щит',
                result: { id: 'metal_shield', count: 1 },
                materials: [{ id: 'metal_scrap', count: 6 }, { id: 'wood', count: 2 }, { id: 'rope', count: 2 }],
                requires: 'workbench'
            },
            'bow': {
                id: 'bow', name: 'Мисливський лук',
                result: { id: 'bow', count: 1 },
                materials: [{ id: 'branch', count: 4 }, { id: 'rope', count: 3 }],
                requires: null
            },
            'arrow_craft': {
                id: 'arrow_craft', name: 'Стріли (8 шт)',
                result: { id: 'arrow', count: 8 },
                materials: [{ id: 'branch', count: 2 }, { id: 'stone', count: 1 }, { id: 'fiber', count: 2 }],
                requires: null
            },
            'fire_arrow_craft': {
                id: 'fire_arrow_craft', name: 'Вогняні стріли (5 шт)',
                result: { id: 'fire_arrow', count: 5 },
                materials: [{ id: 'arrow', count: 5 }, { id: 'fuel', count: 1 }, { id: 'fiber', count: 2 }],
                requires: 'campfire'
            },
            'grenade': {
                id: 'grenade', name: 'Граната',
                result: { id: 'grenade', count: 2 },
                materials: [{ id: 'metal_scrap', count: 3 }, { id: 'gunpowder', count: 2 }, { id: 'fiber', count: 1 }],
                requires: 'workbench'
            },
            'poison_vial': {
                id: 'poison_vial', name: 'Отрута для клинка',
                result: { id: 'poison_vial', count: 2 },
                materials: [{ id: 'mushroom', count: 3 }, { id: 'fiber', count: 2 }, { id: 'water', count: 1 }],
                requires: null
            },
            'smoke_grenade': {
                id: 'smoke_grenade', name: 'Димова шашка',
                result: { id: 'smoke_grenade', count: 2 },
                materials: [{ id: 'sulfur', count: 2 }, { id: 'metal_scrap', count: 1 }, { id: 'fiber', count: 2 }],
                requires: 'workbench'
            }
        });
    }

    if (window.BUILDING_DB) {
        window.BUILDING_DB['tripwire_alarm'] = {
            id: 'tripwire_alarm', name: 'Пастка-сигналка', width: 48, height: 18,
            passable: true, maxHealth: 40, func: 'alarm',
            description: 'Спрацьовує дзвін при перетині ворогом'
        };
    }

    // ─── ЗВУКИ ДЛЯ БОЮ (Web Audio) ─────────────────────────────
    const CombatAudio = {
        ctx: null,
        _getCtx() {
            if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
                this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
            return this.ctx;
        },
        playBell() {
            const ctx = this._getCtx(); if (!ctx) return;
            [1180, 1480].forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const g = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
                g.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.08);
                g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.45);
                osc.connect(g); g.connect(ctx.destination);
                osc.start(ctx.currentTime + idx * 0.08);
                osc.stop(ctx.currentTime + idx * 0.08 + 0.5);
            });
        },
        playBow() {
            const ctx = this._getCtx(); if (!ctx) return;
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(220, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.14);
            g.gain.setValueAtTime(0.14, ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);
            osc.connect(g); g.connect(ctx.destination);
            osc.start(); osc.stop(ctx.currentTime + 0.18);
        },
        playShieldBlock() {
            const ctx = this._getCtx(); if (!ctx) return;
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(420, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.12);
            g.gain.setValueAtTime(0.16, ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
            osc.connect(g); g.connect(ctx.destination);
            osc.start(); osc.stop(ctx.currentTime + 0.15);
        }
    };

    // ─── 2. СИСТЕМА БОЙОВОГО РОЗШИРЕННЯ ──────────────────────
    class CombatExpansionSystem {
        constructor(game) {
            this.game = game;
            this.projectiles = [];     // Стріли
            this.grenades = [];        // Кинуті гранати та димові шашки
            this.smokeClouds = [];     // Активні димові хмари
            this.poisonedEnemies = []; // { enemy, timer, tickCd, type }
            this.burningEnemies = [];  // { enemy, timer, tickCd }
            this.tripwireAlerts = [];  // { x, y, timer }
            this.preferFireArrow = false;
            this.shieldRaised = false;
            this.weaponPoisonHits = 0; // Залишилось отруєних ударів
            this.weaponPoisonTimer = 0;
            this._lastHealth = null;
        }

        getActiveShield() {
            const inv = this.game.player?.inventory;
            if (!inv) return null;
            if (inv.hasItem('metal_shield', 1)) return window.ITEM_DB.metal_shield;
            if (inv.hasItem('wood_shield', 1)) return window.ITEM_DB.wood_shield;
            return null;
        }

        update(dt) {
            const p = this.game.player;
            if (!p) return;

            // 1) Активний блок щитом ([V] або ПКМ)
            const shield = this.getActiveShield();
            const keys = this.game.input?.keys || {};
            this.shieldRaised = !!(shield && (keys['v'] || keys['м'] || this.rightMouseDown));

            // Захист щитом при втраті HP (перехоплюємо вхідну шкоду)
            if (this._lastHealth !== null && p.health < this._lastHealth && shield) {
                const dmgTaken = this._lastHealth - p.health;
                if (dmgTaken > 0 && dmgTaken < 45) {
                    const blockRatio = this.shieldRaised ? shield.blockPower : (shield.id === 'metal_shield' ? 0.30 : 0.20);
                    if (this.shieldRaised || Math.random() < blockRatio) {
                        const saved = dmgTaken * (this.shieldRaised ? shield.blockPower : 0.65);
                        p.health = Math.min(p.maxHealth, p.health + saved);
                        CombatAudio.playShieldBlock();
                        this.game.spawnParticles(p.x, p.y, '#93C5FD', 8);
                        if (this.shieldRaised) {
                            this.game.showNotification(`🛡️ Щит заблокував ${Math.round(saved)} шкоди!`, 'info');
                        }
                    }
                }
            }
            this._lastHealth = p.health;

            // Таймер отрути на зброї
            if (this.weaponPoisonTimer > 0) {
                this.weaponPoisonTimer -= dt;
                if (this.weaponPoisonTimer <= 0) this.weaponPoisonHits = 0;
            }

            // 2) Пастки-сигналки
            this._updateTripwires(dt);

            // 3) Стріли (projectiles)
            this._updateProjectiles(dt);

            // 4) Гранати
            this._updateGrenades(dt);

            // 5) Димові завіси
            this._updateSmokeClouds(dt);

            // 6) DoT: Отрута та Горіння
            this._updateDoTs(dt);
        }

        _collectAllEnemies() {
            const list = [];
            if (this.game.zombieManager?.zombies) {
                for (const z of this.game.zombieManager.zombies) list.push({ ref: z, kind: 'zombie' });
            }
            if (this.game.activeRaidPirates) {
                for (const rp of this.game.activeRaidPirates) list.push({ ref: rp, kind: 'pirate' });
            }
            if (this.game.fortPirates) {
                for (const fp of this.game.fortPirates) if (fp.health > 0) list.push({ ref: fp, kind: 'pirate' });
            }
            if (this.game.phantomPirateSystem?.pirates) {
                for (const pp of this.game.phantomPirateSystem.pirates) list.push({ ref: pp, kind: 'phantom' });
            }
            return list;
        }

        _damageEnemy(entry, dmg, knockX = 0, knockY = 0) {
            const e = entry.ref;
            if (entry.kind === 'phantom') {
                e.hp = Math.max(0, e.hp - dmg);
            } else {
                e.health = Math.max(0, e.health - dmg);
            }
            if (knockX || knockY) {
                e.x += knockX;
                e.y += knockY;
            }
        }

        _updateTripwires(dt) {
            const bs = this.game.buildingSystem;
            if (!bs) return;
            const enemies = this._collectAllEnemies();
            const alarms = bs.buildings.filter(b => b.type === 'tripwire_alarm');

            for (const a of alarms) {
                if (a._cd > 0) a._cd -= dt;
                if (a._cd > 0) continue;
                for (const en of enemies) {
                    if (Math.hypot(en.ref.x - a.x, en.ref.y - a.y) < 34) {
                        a._cd = 10.0;
                        CombatAudio.playBell();
                        this.tripwireAlerts.push({ x: a.x, y: a.y, timer: 4.0 });
                        this.game.spawnParticles(a.x, a.y, '#FACC15', 14);
                        this.game.showNotification('🔔 СПРАЦЮВАЛА СИГНАЛКА! Ворог перетнув мотузку!', 'danger');
                        break;
                    }
                }
            }
            for (let i = this.tripwireAlerts.length - 1; i >= 0; i--) {
                this.tripwireAlerts[i].timer -= dt;
                if (this.tripwireAlerts[i].timer <= 0) this.tripwireAlerts.splice(i, 1);
            }
        }

        shootBow(aimX, aimY) {
            const p = this.game.player;
            const inv = p.inventory;
            if (!inv) return false;

            let arrowType = null;
            if (this.preferFireArrow && inv.hasItem('fire_arrow', 1)) arrowType = 'fire_arrow';
            else if (!this.preferFireArrow && inv.hasItem('arrow', 1)) arrowType = 'arrow';
            else if (inv.hasItem('fire_arrow', 1)) arrowType = 'fire_arrow';
            else if (inv.hasItem('arrow', 1)) arrowType = 'arrow';

            if (!arrowType) {
                this.game.showNotification('Немає стріл! Скрафтіть стріли в меню крафту.', 'warning');
                return true;
            }

            inv.removeItem(arrowType, 1);
            const dirAngles = [Math.PI / 2, Math.PI, 0, -Math.PI / 2];
            const angle = (aimX !== null && aimY !== null)
                ? Math.atan2(aimY - p.y, aimX - p.x)
                : (dirAngles[p.direction] || 0);

            this.projectiles.push({
                x: p.x + Math.cos(angle) * 16,
                y: p.y + Math.sin(angle) * 16,
                vx: Math.cos(angle) * 420,
                vy: Math.sin(angle) * 420,
                angle,
                fire: arrowType === 'fire_arrow',
                damage: arrowType === 'fire_arrow' ? 42 : 34,
                life: 0.9
            });
            CombatAudio.playBow();
            return true;
        }

        throwGrenade(aimX, aimY, isSmoke = false) {
            const p = this.game.player;
            const inv = p.inventory;
            const itemId = isSmoke ? 'smoke_grenade' : 'grenade';
            if (!inv || !inv.hasItem(itemId, 1)) return false;
            inv.removeItem(itemId, 1);

            const dirAngles = [Math.PI / 2, Math.PI, 0, -Math.PI / 2];
            const tx = aimX !== null ? aimX : p.x + Math.cos(dirAngles[p.direction] || 0) * 140;
            const ty = aimY !== null ? aimY : p.y + Math.sin(dirAngles[p.direction] || 0) * 140;
            const dist = Math.min(240, Math.hypot(tx - p.x, ty - p.y));
            const ang = Math.atan2(ty - p.y, tx - p.x);

            this.grenades.push({
                x: p.x, y: p.y,
                targetX: p.x + Math.cos(ang) * dist,
                targetY: p.y + Math.sin(ang) * dist,
                startX: p.x, startY: p.y,
                flight: 0, flightDur: 0.45,
                fuse: isSmoke ? 0.5 : 1.2,
                isSmoke
            });
            this.game.showNotification(isSmoke ? '💨 Кинуто димову шашку!' : '💣 Граната полетіла!', 'info');
            return true;
        }

        _updateProjectiles(dt) {
            const enemies = this._collectAllEnemies();
            const animals = this.game.animalManager?.animals || [];

            for (let i = this.projectiles.length - 1; i >= 0; i--) {
                const pr = this.projectiles[i];
                pr.x += pr.vx * dt;
                pr.y += pr.vy * dt;
                pr.life -= dt;

                if (pr.fire && Math.random() < 0.6) {
                    this.game.spawnParticles(pr.x, pr.y, '#F97316', 1);
                }

                let hit = false;
                for (const en of enemies) {
                    if (Math.hypot(en.ref.x - pr.x, en.ref.y - pr.y) < 22) {
                        this._damageEnemy(en, pr.damage);
                        this.game.spawnParticles(pr.x, pr.y, pr.fire ? '#F97316' : '#EF4444', 10);
                        if (pr.fire) {
                            this.burningEnemies.push({ enemy: en, timer: 5.0, tickCd: 0.8 });
                        }
                        hit = true;
                        break;
                    }
                }
                if (!hit) {
                    for (const a of animals) {
                        if (a.health > 0 && Math.hypot(a.x - pr.x, a.y - pr.y) < 20) {
                            this.game.animalManager.damage(a, pr.damage, this.game);
                            hit = true;
                            break;
                        }
                    }
                }
                // Вогняна стріла може підпалити дерево (лісова пожежа у world-events.js)
                if (!hit && pr.fire && this.game.world?.resources) {
                    const tree = this.game.world.resources.find(r => !r.depleted && ['tree', 'palm', 'coconut_palm'].includes(r.type) && Math.hypot(r.x - pr.x, r.y - pr.y) < 22);
                    if (tree) {
                        if (this.game.worldEventsSystem?.igniteAt) {
                            this.game.worldEventsSystem.igniteAt(tree.x, tree.y);
                        }
                        hit = true;
                    }
                }

                if (hit || pr.life <= 0) {
                    this.projectiles.splice(i, 1);
                }
            }
        }

        _updateGrenades(dt) {
            const enemies = this._collectAllEnemies();
            for (let i = this.grenades.length - 1; i >= 0; i--) {
                const g = this.grenades[i];
                if (g.flight < g.flightDur) {
                    g.flight = Math.min(g.flightDur, g.flight + dt);
                    const t = g.flight / g.flightDur;
                    g.x = g.startX + (g.targetX - g.startX) * t;
                    g.y = g.startY + (g.targetY - g.startY) * t;
                }
                g.fuse -= dt;
                if (g.fuse <= 0) {
                    if (g.isSmoke) {
                        this.smokeClouds.push({ x: g.x, y: g.y, radius: 110, timer: 16.0 });
                        this.game.spawnParticles(g.x, g.y, '#CBD5E1', 25);
                        if (this.game.evacuationState === 'active') {
                            this.game.evacuationTimer = Math.max(5, this.game.evacuationTimer - 20);
                            this.game.showNotification('🆘 Димовий SOS-сигнал помічено! Гелікоптер прибуде на 20с швидше!', 'success');
                        } else {
                            this.game.showNotification('💨 Димова завіса розгорнута! Вороги втрачають орієнтацію.', 'info');
                        }
                    } else {
                        // Вибух гранати + відкидання
                        if (window.soundSystem?.playExplosion) window.soundSystem.playExplosion();
                        this.game.spawnParticles(g.x, g.y, '#F97316', 35);
                        this.game.spawnParticles(g.x, g.y, '#EF4444', 20);
                        let hitCount = 0;
                        for (const en of enemies) {
                            const d = Math.hypot(en.ref.x - g.x, en.ref.y - g.y);
                            if (d < 120) {
                                const falloff = 1 - (d / 140);
                                const dmg = Math.round(90 * falloff);
                                const ang = Math.atan2(en.ref.y - g.y, en.ref.x - g.x);
                                this._damageEnemy(en, dmg, Math.cos(ang) * 75, Math.sin(ang) * 75);
                                hitCount++;
                            }
                        }
                        this.game.showNotification(hitCount > 0 ? `💥 Вибух гранати! Зачеплено ворогів: ${hitCount}` : '💥 Бах!', 'warning');
                    }
                    this.grenades.splice(i, 1);
                }
            }
        }

        _updateSmokeClouds(dt) {
            const enemies = this._collectAllEnemies();
            for (let i = this.smokeClouds.length - 1; i >= 0; i--) {
                const sc = this.smokeClouds[i];
                sc.timer -= dt;
                if (Math.random() < dt * 8) {
                    this.game.spawnParticles(
                        sc.x + (Math.random() - 0.5) * sc.radius,
                        sc.y + (Math.random() - 0.5) * sc.radius,
                        'rgba(203,213,225,0.7)', 2
                    );
                }
                // Сповільнюємо та відштовхуємо ворогів у диму
                for (const en of enemies) {
                    const d = Math.hypot(en.ref.x - sc.x, en.ref.y - sc.y);
                    if (d < sc.radius) {
                        const ang = Math.atan2(en.ref.y - sc.y, en.ref.x - sc.x);
                        en.ref.x += Math.cos(ang) * 28 * dt;
                        en.ref.y += Math.sin(ang) * 28 * dt;
                    }
                }
                if (sc.timer <= 0) this.smokeClouds.splice(i, 1);
            }
        }

        _updateDoTs(dt) {
            for (let i = this.poisonedEnemies.length - 1; i >= 0; i--) {
                const pe = this.poisonedEnemies[i];
                pe.timer -= dt;
                pe.tickCd -= dt;
                if (pe.tickCd <= 0) {
                    pe.tickCd = 1.0;
                    this._damageEnemy(pe.enemy, 6);
                    this.game.spawnParticles(pe.enemy.ref.x, pe.enemy.ref.y, '#22C55E', 5);
                }
                if (pe.timer <= 0) this.poisonedEnemies.splice(i, 1);
            }
            for (let i = this.burningEnemies.length - 1; i >= 0; i--) {
                const be = this.burningEnemies[i];
                be.timer -= dt;
                be.tickCd -= dt;
                if (be.tickCd <= 0) {
                    be.tickCd = 0.9;
                    this._damageEnemy(be.enemy, 8);
                    this.game.spawnParticles(be.enemy.ref.x, be.enemy.ref.y, '#F97316', 5);
                }
                if (be.timer <= 0) this.burningEnemies.splice(i, 1);
            }
        }

        applyPoisonToNearbyHit() {
            if (this.weaponPoisonHits <= 0) return;
            const p = this.game.player;
            const enemies = this._collectAllEnemies();
            let applied = false;
            for (const en of enemies) {
                if (Math.hypot(en.ref.x - p.x, en.ref.y - p.y) < 75) {
                    if (!this.poisonedEnemies.find(x => x.enemy.ref === en.ref)) {
                        this.poisonedEnemies.push({ enemy: en, timer: 6.0, tickCd: 0.8 });
                        applied = true;
                    }
                }
            }
            if (applied) {
                this.weaponPoisonHits--;
                this.game.showNotification(`🧪 Ворога отруєно! (Залишилось зарядів: ${this.weaponPoisonHits})`, 'success');
            }
        }

        render(ctx, camera) {
            const p = this.game.player;
            const bs = this.game.buildingSystem;

            // 1) Пастки-сигналки (мотузка між кілками)
            if (bs) {
                for (const b of bs.buildings) {
                    if (b.type !== 'tripwire_alarm' || !camera.isVisible(b.x, b.y, 40)) continue;
                    const pos = camera.worldToScreen(b.x, b.y);
                    ctx.save();
                    ctx.fillStyle = '#78350F';
                    ctx.fillRect(pos.x - 22, pos.y - 8, 5, 16);
                    ctx.fillRect(pos.x + 17, pos.y - 8, 5, 16);
                    ctx.strokeStyle = b._cd > 0 ? '#EF4444' : '#E2E8F0';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(pos.x - 19, pos.y);
                    ctx.lineTo(pos.x + 19, pos.y);
                    ctx.stroke();
                    // Дзвіночок
                    ctx.fillStyle = '#FACC15';
                    ctx.beginPath(); ctx.arc(pos.x, pos.y - 2, 4, 0, Math.PI * 2); ctx.fill();
                    ctx.restore();
                }
            }

            // Червоні кола тривоги
            for (const al of this.tripwireAlerts) {
                const pos = camera.worldToScreen(al.x, al.y);
                ctx.save();
                ctx.strokeStyle = `rgba(239,68,68,${Math.min(1, al.timer / 2)})`;
                ctx.lineWidth = 3;
                const r = 20 + ((4 - al.timer) * 28) % 60;
                ctx.beginPath(); ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2); ctx.stroke();
                ctx.restore();
            }

            // 2) Активний щит на гравці
            if (p && this.shieldRaised && !p.inBoat) {
                const pos = camera.worldToScreen(p.x, p.y);
                const shield = this.getActiveShield();
                const angles = [Math.PI / 2, Math.PI, 0, -Math.PI / 2];
                const ang = angles[p.direction] || 0;
                ctx.save();
                ctx.translate(pos.x, pos.y);
                ctx.rotate(ang);
                ctx.strokeStyle = shield?.id === 'metal_shield' ? '#94A3B8' : '#D97706';
                ctx.lineWidth = 6;
                ctx.beginPath();
                ctx.arc(0, 0, 22, -0.75, 0.75);
                ctx.stroke();
                ctx.restore();
            }

            // 3) Стріли
            for (const pr of this.projectiles) {
                const pos = camera.worldToScreen(pr.x, pr.y);
                ctx.save();
                ctx.translate(pos.x, pos.y);
                ctx.rotate(pr.angle);
                ctx.strokeStyle = pr.fire ? '#F97316' : '#E2E8F0';
                ctx.lineWidth = 2.5;
                ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(10, 0); ctx.stroke();
                ctx.fillStyle = pr.fire ? '#FEF08A' : '#94A3B8';
                ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(6, -3); ctx.lineTo(6, 3); ctx.closePath(); ctx.fill();
                ctx.restore();
            }

            // 4) Гранати в польоті / на землі
            for (const g of this.grenades) {
                const pos = camera.worldToScreen(g.x, g.y);
                const arc = Math.sin((g.flight / g.flightDur) * Math.PI) * 24;
                ctx.save();
                ctx.fillStyle = g.isSmoke ? '#64748B' : '#166534';
                ctx.beginPath(); ctx.arc(pos.x, pos.y - arc, 6, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#EF4444';
                ctx.beginPath(); ctx.arc(pos.x, pos.y - arc - 5, 2.5, 0, Math.PI * 2); ctx.fill();
                ctx.restore();
            }

            // 5) Димові хмари
            for (const sc of this.smokeClouds) {
                if (!camera.isVisible(sc.x, sc.y, sc.radius + 40)) continue;
                const pos = camera.worldToScreen(sc.x, sc.y);
                ctx.save();
                ctx.globalAlpha = Math.min(0.65, sc.timer / 4);
                const grad = ctx.createRadialGradient(pos.x, pos.y, 10, pos.x, pos.y, sc.radius);
                grad.addColorStop(0, 'rgba(226,232,240,0.85)');
                grad.addColorStop(1, 'rgba(148,163,184,0)');
                ctx.fillStyle = grad;
                ctx.beginPath(); ctx.arc(pos.x, pos.y, sc.radius, 0, Math.PI * 2); ctx.fill();
                ctx.restore();
            }

            // Індикатор отрути на зброї
            if (this.weaponPoisonHits > 0) {
                ctx.save();
                ctx.fillStyle = 'rgba(20, 83, 45, 0.8)';
                ctx.fillRect(14, 140, 180, 24);
                ctx.fillStyle = '#4ADE80';
                ctx.font = 'bold 12px sans-serif';
                ctx.fillText(`🧪 Отрута на зброї: ${this.weaponPoisonHits} уд.`, 22, 156);
                ctx.restore();
            }
        }
    }

    // ─── 3. ІНТЕГРАЦІЯ З GAME ────────────────────────────────
    if (window.Game) {
        const origInit = Game.prototype.init;
        Game.prototype.init = function () {
            origInit.call(this);
            this.combatExpansion = new CombatExpansionSystem(this);
        };

        const origLoad = Game.prototype.loadFromSave;
        Game.prototype.loadFromSave = function () {
            origLoad.call(this);
            if (!this.combatExpansion) this.combatExpansion = new CombatExpansionSystem(this);
        };

        const origUpdate = Game.prototype.update;
        Game.prototype.update = function (dt) {
            origUpdate.call(this, dt);
            if (this.combatExpansion) this.combatExpansion.update(dt);
        };

        const origRender = Game.prototype.render;
        Game.prototype.render = function () {
            origRender.call(this);
            if (this.combatExpansion && this.camera) {
                this.combatExpansion.render(this.ctx, this.camera);
            }
        };

        const origAttack = Game.prototype.attack;
        Game.prototype.attack = function (aimX = null, aimY = null, allowMiss = false) {
            const p = this.player;
            const ce = this.combatExpansion;
            if (p && ce && p.equippedTool) {
                const now = performance.now();
                const item = window.ITEM_DB?.[p.equippedTool];
                if (item?.toolType === 'bow') {
                    if (now - (this._lastBowAt || 0) < 480) return;
                    this._lastBowAt = now;
                    ce.shootBow(aimX, aimY);
                    return;
                }
                if (item?.toolType === 'throwable') {
                    if (now - (this._lastGrenadeAt || 0) < 700) return;
                    this._lastGrenadeAt = now;
                    ce.throwGrenade(aimX, aimY, false);
                    return;
                }
                if (item?.toolType === 'smoke') {
                    if (now - (this._lastGrenadeAt || 0) < 700) return;
                    this._lastGrenadeAt = now;
                    ce.throwGrenade(aimX, aimY, true);
                    return;
                }
            }
            if (origAttack) origAttack.call(this, aimX, aimY, allowMiss);
            if (ce && ce.weaponPoisonHits > 0) ce.applyPoisonToNearbyHit();
        };
    }

    // Використання poison_vial із інвентарю
    const origUseItem = window.useInventoryItem;
    window.useInventoryItem = function (slotIdx) {
        const inv = window.game?.player?.inventory;
        const slot = inv?.slots?.[slotIdx];
        if (slot && slot.itemId === 'poison_vial' && window.game?.combatExpansion) {
            inv.removeItem('poison_vial', 1);
            window.game.combatExpansion.weaponPoisonHits = 12;
            window.game.combatExpansion.weaponPoisonTimer = 60;
            window.game.showNotification('🧪 Ви намастили зброю отрутою (12 ударів)!', 'success');
            if (window.updateInventoryUI) window.updateInventoryUI();
            return;
        }
        if (origUseItem) origUseItem(slotIdx);
    };

    // Гарячі клавіші: X (перемкнути стріли), ПКМ (щит)
    window.addEventListener('keydown', (e) => {
        if (e.target && ['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
        const ce = window.game?.combatExpansion;
        if (!ce) return;
        if (e.key === 'x' || e.key === 'X' || e.key === 'ч' || e.key === 'Ч') {
            ce.preferFireArrow = !ce.preferFireArrow;
            window.game.showNotification(
                ce.preferFireArrow ? '🔥 Обрано: Вогняні стріли' : '🏹 Обрано: Звичайні стріли',
                'info'
            );
        }
    });
    window.addEventListener('mousedown', (e) => {
        if (e.button === 2 && window.game?.combatExpansion) {
            window.game.combatExpansion.rightMouseDown = true;
        }
    });
    window.addEventListener('mouseup', (e) => {
        if (e.button === 2 && window.game?.combatExpansion) {
            window.game.combatExpansion.rightMouseDown = false;
        }
    });
    window.addEventListener('contextmenu', (e) => {
        if (window.game?.running && window.game?.combatExpansion?.getActiveShield()) {
            e.preventDefault();
        }
    });

    // Іконки предметів
    if (window.drawItemIcon) {
        const origIcon = window.drawItemIcon;
        window.drawItemIcon = function (ctx, itemId, x, y, size) {
            const cx = x + size / 2, cy = y + size / 2, s = size;
            if (itemId === 'wood_shield' || itemId === 'metal_shield') {
                ctx.save();
                ctx.fillStyle = itemId === 'metal_shield' ? '#64748B' : '#92400E';
                ctx.strokeStyle = itemId === 'metal_shield' ? '#E2E8F0' : '#D97706';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(cx - s * 0.25, cy - s * 0.28);
                ctx.lineTo(cx + s * 0.25, cy - s * 0.28);
                ctx.lineTo(cx + s * 0.25, cy + s * 0.05);
                ctx.lineTo(cx, cy + s * 0.34);
                ctx.lineTo(cx - s * 0.25, cy + s * 0.05);
                ctx.closePath();
                ctx.fill(); ctx.stroke();
                ctx.restore();
                return;
            }
            if (itemId === 'bow') {
                ctx.save();
                ctx.strokeStyle = '#92400E'; ctx.lineWidth = 3;
                ctx.beginPath(); ctx.arc(cx - s * 0.05, cy, s * 0.3, -Math.PI * 0.45, Math.PI * 0.45); ctx.stroke();
                ctx.strokeStyle = '#E2E8F0'; ctx.lineWidth = 1.2;
                ctx.beginPath(); ctx.moveTo(cx, cy - s * 0.3); ctx.lineTo(cx, cy + s * 0.3); ctx.stroke();
                ctx.restore();
                return;
            }
            if (itemId === 'arrow' || itemId === 'fire_arrow') {
                ctx.save();
                ctx.strokeStyle = itemId === 'fire_arrow' ? '#F97316' : '#CBD5E1';
                ctx.lineWidth = 2.5;
                ctx.beginPath(); ctx.moveTo(cx - s * 0.28, cy + s * 0.28); ctx.lineTo(cx + s * 0.28, cy - s * 0.28); ctx.stroke();
                ctx.fillStyle = itemId === 'fire_arrow' ? '#FACC15' : '#94A3B8';
                ctx.beginPath(); ctx.arc(cx + s * 0.24, cy - s * 0.24, s * 0.08, 0, Math.PI * 2); ctx.fill();
                ctx.restore();
                return;
            }
            if (itemId === 'grenade' || itemId === 'smoke_grenade') {
                ctx.save();
                ctx.fillStyle = itemId === 'smoke_grenade' ? '#94A3B8' : '#15803D';
                ctx.beginPath(); ctx.arc(cx, cy + s * 0.04, s * 0.22, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#EAB308'; ctx.fillRect(cx - s * 0.07, cy - s * 0.25, s * 0.14, s * 0.1);
                ctx.restore();
                return;
            }
            if (itemId === 'poison_vial') {
                ctx.save();
                ctx.fillStyle = '#22C55E';
                ctx.beginPath(); ctx.arc(cx, cy + s * 0.08, s * 0.2, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#CBD5E1'; ctx.fillRect(cx - s * 0.06, cy - s * 0.24, s * 0.12, s * 0.14);
                ctx.restore();
                return;
            }
            if (itemId === 'tripwire_alarm_item') {
                ctx.save();
                ctx.strokeStyle = '#FACC15'; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.moveTo(cx - s * 0.28, cy + s * 0.1); ctx.lineTo(cx + s * 0.28, cy + s * 0.1); ctx.stroke();
                ctx.fillStyle = '#F59E0B';
                ctx.beginPath(); ctx.arc(cx, cy - s * 0.05, s * 0.12, 0, Math.PI * 2); ctx.fill();
                ctx.restore();
                return;
            }
            origIcon.call(this, ctx, itemId, x, y, size);
        };
    }

    console.log('[combat-expansion.js] Пастки-сигналки, Щити, Лук/Стріли, Гранати, Отрута, Димова шашка — завантажено ✅');
})();
