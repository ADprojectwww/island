// ============================================================
// survival-plus.js
// ВЕЛИКЕ РОЗШИРЕННЯ СВІТУ, СЮЖЕТУ ТА РЕЖИМІВ:
//  1. Дух острова (Загадки, підказки та нагороди)
//  2. Прокляте село (Покинуті хати, НПС-привиди, зняття прокляття)
//  3. Часовий розлом (Перехід у минуле острова + предмети минулого)
//  4. Система репутації (Пірати, Місцеві, Природа + вибір союзників)
//  5. Статистика виживання (Панель рекордів)
//  6. Режим Хардкор (1 життя + регенерація світу з тим самим сідом)
//  7. Кооператив (2-4 гравці через BroadcastChannel або WebRTC P2P)
// ============================================================
(function () {
    'use strict';

    // ─── 1. ПРЕДМЕТИ З МИНУЛОГО ТА РЕЛІКВІЇ ───────────────────
    if (window.ITEM_DB) {
        Object.assign(window.ITEM_DB, {
            'chrono_amulet': {
                id: 'chrono_amulet', name: 'Хроно-амулет минулого', icon: 'chrono_amulet',
                category: 'resource', maxStack: 1,
                description: 'Реліквія з Часового розлому. Відновлює енергію та психіку'
            },
            'ancient_compass': {
                id: 'ancient_compass', name: 'Стародавній компас', icon: 'ancient_compass',
                category: 'resource', maxStack: 1,
                description: 'Артефакт до катастрофи. Показує напрямок до таємниць острова'
            }
        });
    }

    // ─── 2. ГОЛОВНИЙ МЕНЕДЖЕР SURVIVAL+ ───────────────────────
    class SurvivalPlusSystem {
        constructor(game) {
            this.game = game;
            const ts = game.tileSize || 32;

            // 1) Дух острова
            this.spirit = {
                x: 48 * ts, y: 46 * ts,
                riddleIdx: 0,
                solved: []
            };
            this.riddles = [
                {
                    q: 'Я не маю легень, але потребую повітря; вода мене вбиває, а дерево живить. Що я?',
                    opts: ['Вогонь', 'Вітер', 'Тінь'],
                    ans: 0,
                    reward: { id: 'gold_coin', count: 5 },
                    hint: 'Шукай Прокляте село на північному сході острова!'
                },
                {
                    q: 'Хто приходить щоночі без запрошення, краде сни і боїться світла маяка?',
                    opts: ['Пірати', 'Туман і Зовсім-темні', 'Кози'],
                    ans: 1,
                    reward: { id: 'rare_material', count: 2 },
                    hint: 'Часовий розлом лежить на південному заході від центру!'
                },
                {
                    q: 'Воно завжди йде вперед, ніколи не повертається, але біля розлому може показати минуле.',
                    opts: ['Море', 'Час', 'Сонце'],
                    ans: 1,
                    reward: { id: 'chrono_amulet', count: 1 },
                    hint: 'Розбий 3 тотеми прокляття в Проклятому селі, щоб звільнити душі.'
                }
            ];

            // 2) Прокляте село
            this.cursedVillage = {
                x: 82 * ts, y: 34 * ts,
                cursed: true,
                huts: [
                    { x: 80 * ts, y: 32 * ts },
                    { x: 84 * ts, y: 32 * ts },
                    { x: 82 * ts, y: 36 * ts }
                ],
                ghosts: [
                    { x: 81 * ts, y: 33 * ts, name: 'Привид Коваля', vx: 12, vy: 8 },
                    { x: 83 * ts, y: 35 * ts, name: 'Привид Знахарки', vx: -10, vy: 10 },
                    { x: 82 * ts, y: 31 * ts, name: 'Привид Старости', vx: 8, vy: -12 }
                ],
                totems: [
                    { x: 79 * ts, y: 34 * ts, active: true },
                    { x: 85 * ts, y: 34 * ts, active: true },
                    { x: 82 * ts, y: 38 * ts, active: true }
                ]
            };

            // 3) Часовий розлом (Past Rift)
            this.timeRift = {
                x: 34 * ts, y: 76 * ts,
                inPast: false,
                returnX: 34 * ts, returnY: 76 * ts,
                pastLoot: [
                    { x: 32 * ts, y: 74 * ts, id: 'chrono_amulet', count: 1, taken: false },
                    { x: 36 * ts, y: 78 * ts, id: 'ancient_compass', count: 1, taken: false },
                    { x: 34 * ts, y: 72 * ts, id: 'gold_coin', count: 8, taken: false }
                ]
            };

            // 4) Система репутації (-100 .. +100)
            this.reputation = {
                pirates: 0,
                locals: 15,
                nature: 10
            };

            // 5) Статистика виживання
            this.stats = {
                enemiesKilled: 0,
                buildingsBuilt: 0,
                fishCaught: 0,
                riddlesSolved: 0,
                cursesLifted: 0,
                bestDays: parseInt(localStorage.getItem('island_best_days') || '1', 10)
            };

            // 7) Кооператив (BroadcastChannel + WebRTC P2P)
            this.coop = {
                enabled: false,
                room: 'island-coop-1',
                playerId: 'p_' + Math.random().toString(36).slice(2, 7),
                playerName: 'Виживальник-' + Math.floor(10 + Math.random() * 89),
                peers: {}, // id -> { x, y, name, dir, inBoat, lastSeen }
                channel: null,
                pc: null,
                dc: null,
                syncCd: 0
            };
        }

        update(dt) {
            const p = this.game.player;
            if (!p) return;

            // Оновлення статистики рекордів
            const day = this.game.timeSystem ? this.game.timeSystem.day : 1;
            if (day > this.stats.bestDays) {
                this.stats.bestDays = day;
                localStorage.setItem('island_best_days', String(day));
            }

            // Хроно-амулет у інвентарі трохи відновлює енергію
            if (p.inventory?.hasItem('chrono_amulet', 1)) {
                p.energy = Math.min(p.maxEnergy, p.energy + 0.6 * dt);
            }

            // Привиди у Проклятому селі
            for (const g of this.cursedVillage.ghosts) {
                g.x += g.vx * dt;
                g.y += g.vy * dt;
                if (Math.hypot(g.x - this.cursedVillage.x, g.y - this.cursedVillage.y) > 120) {
                    g.vx *= -1;
                    g.vy *= -1;
                }
            }

            // Якщо пірати — союзники (репутація >= 40), активні пірати не б'ють гравця
            if (this.reputation.pirates >= 40 && this.game.activeRaidPirates?.length) {
                this.game.activeRaidPirates.length = 0;
                this.game.showNotification('🏴‍☠️ Пірати поважають ваш союз і відступили!', 'success');
            }

            // Синхронізація кооперативу
            if (this.coop.enabled) {
                this.coop.syncCd -= dt;
                if (this.coop.syncCd <= 0) {
                    this.coop.syncCd = 0.08;
                    this._broadcastState();
                }
                const now = Date.now();
                for (const id of Object.keys(this.coop.peers)) {
                    if (now - this.coop.peers[id].lastSeen > 8000) {
                        delete this.coop.peers[id];
                    }
                }
            }
        }

        // ── Взаємодія [E] ──────────────────────────────────────
        handleInteraction(p) {
            // 1) Дух острова
            if (!this.timeRift.inPast && Math.hypot(p.x - this.spirit.x, p.y - this.spirit.y) < 70) {
                this.openSpiritModal();
                return true;
            }

            // 2) Тотеми Проклятого села
            if (!this.timeRift.inPast && this.cursedVillage.cursed) {
                const totem = this.cursedVillage.totems.find(t => t.active && Math.hypot(p.x - t.x, p.y - t.y) < 55);
                if (totem) {
                    totem.active = false;
                    this.game.spawnParticles(totem.x, totem.y, '#A855F7', 25);
                    const left = this.cursedVillage.totems.filter(t => t.active).length;
                    if (left === 0) {
                        this.cursedVillage.cursed = false;
                        this.stats.cursesLifted++;
                        this.reputation.locals = Math.min(100, this.reputation.locals + 35);
                        p.inventory?.addItem('gold_coin', 10);
                        p.inventory?.addItem('rare_material', 3);
                        p.addXP?.(150);
                        this.game.showNotification('✨ ПРОКЛЯТТЯ СЕЛА ЗНЯТО! Душі звільнено, отримано легендарну нагороду!', 'success');
                    } else {
                        this.game.showNotification(`🔮 Тотем прокляття знищено! Залишилось тотемів: ${left}`, 'warning');
                    }
                    return true;
                }
            }

            // 3) Часовий розлом (вхід/вихід + збір реліквій минулого)
            if (this.timeRift.inPast) {
                const loot = this.timeRift.pastLoot.find(l => !l.taken && Math.hypot(p.x - l.x, p.y - l.y) < 50);
                if (loot) {
                    loot.taken = true;
                    p.inventory?.addItem(loot.id, loot.count);
                    const itemDef = window.ITEM_DB?.[loot.id];
                    this.game.showNotification(`⏳ Знайдено предмет минулого: ${itemDef?.name || loot.id}!`, 'success');
                    return true;
                }
                if (Math.hypot(p.x - this.timeRift.x, p.y - this.timeRift.y) < 65) {
                    this.timeRift.inPast = false;
                    this.game.showNotification('🌀 Ви повернулися у теперішній час!', 'info');
                    return true;
                }
            } else if (Math.hypot(p.x - this.timeRift.x, p.y - this.timeRift.y) < 65) {
                this.timeRift.inPast = true;
                this.game.spawnParticles(p.x, p.y, '#22D3EE', 30);
                this.game.showNotification('⏳ Ви увійшли в ЧАСОВИЙ РОЗЛОМ! Досліджуйте минуле острова та шукайте реліквії!', 'warning');
                return true;
            }

            return false;
        }

        // ── Рендер ─────────────────────────────────────────────
        render(ctx, camera) {
            const w = this.game.canvas?.width || window.innerWidth;
            const h = this.game.canvas?.height || window.innerHeight;

            if (this.timeRift.inPast) {
                // Золотиста сепія минулого
                ctx.save();
                ctx.fillStyle = 'rgba(217, 119, 6, 0.22)';
                ctx.fillRect(0, 0, w, h);
                ctx.restore();

                // Портал повернення + реліквії минулого
                for (const l of this.timeRift.pastLoot) {
                    if (l.taken || !camera.isVisible(l.x, l.y, 40)) continue;
                    const pos = camera.worldToScreen(l.x, l.y);
                    ctx.save();
                    ctx.fillStyle = '#FACC15';
                    ctx.beginPath(); ctx.arc(pos.x, pos.y, 9, 0, Math.PI * 2); ctx.fill();
                    ctx.fillStyle = '#FEF08A'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center';
                    ctx.fillText('⏳ [E] Реліквія минулого', pos.x, pos.y - 14);
                    ctx.restore();
                }
            } else {
                // 1) Дух острова
                if (camera.isVisible(this.spirit.x, this.spirit.y, 60)) {
                    const pos = camera.worldToScreen(this.spirit.x, this.spirit.y);
                    const bob = Math.sin(performance.now() / 400) * 5;
                    ctx.save();
                    ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
                    ctx.beginPath(); ctx.arc(pos.x, pos.y + bob, 22, 0, Math.PI * 2); ctx.fill();
                    ctx.fillStyle = '#67E8F9';
                    ctx.beginPath(); ctx.arc(pos.x, pos.y - 8 + bob, 10, 0, Math.PI * 2); ctx.fill();
                    ctx.fillRect(pos.x - 7, pos.y + 2 + bob, 14, 16);
                    ctx.fillStyle = '#ECFEFF'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center';
                    ctx.fillText('👻 Дух Острова [E]', pos.x, pos.y - 24 + bob);
                    ctx.restore();
                }

                // 2) Прокляте село
                const cv = this.cursedVillage;
                for (const hut of cv.huts) {
                    if (!camera.isVisible(hut.x, hut.y, 60)) continue;
                    const pos = camera.worldToScreen(hut.x, hut.y);
                    ctx.save();
                    ctx.fillStyle = cv.cursed ? '#312E81' : '#78350F';
                    ctx.fillRect(pos.x - 24, pos.y - 20, 48, 40);
                    ctx.fillStyle = cv.cursed ? '#1E1B4B' : '#92400E';
                    ctx.beginPath();
                    ctx.moveTo(pos.x - 28, pos.y - 20); ctx.lineTo(pos.x, pos.y - 38); ctx.lineTo(pos.x + 28, pos.y - 20);
                    ctx.closePath(); ctx.fill();
                    ctx.restore();
                }
                for (const t of cv.totems) {
                    if (!t.active || !camera.isVisible(t.x, t.y, 40)) continue;
                    const pos = camera.worldToScreen(t.x, t.y);
                    ctx.save();
                    ctx.fillStyle = '#4C1D95';
                    ctx.fillRect(pos.x - 7, pos.y - 18, 14, 30);
                    ctx.fillStyle = '#A855F7';
                    ctx.beginPath(); ctx.arc(pos.x, pos.y - 14, 6, 0, Math.PI * 2); ctx.fill();
                    ctx.fillStyle = '#E9D5FF'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
                    ctx.fillText('🔮 Тотем [E]', pos.x, pos.y - 26);
                    ctx.restore();
                }
                for (const g of cv.ghosts) {
                    if (!camera.isVisible(g.x, g.y, 40)) continue;
                    const pos = camera.worldToScreen(g.x, g.y);
                    ctx.save();
                    ctx.globalAlpha = 0.65;
                    ctx.fillStyle = cv.cursed ? '#C084FC' : '#6EE7B7';
                    ctx.beginPath(); ctx.arc(pos.x, pos.y - 6, 8, 0, Math.PI * 2); ctx.fill();
                    ctx.fillRect(pos.x - 6, pos.y + 2, 12, 12);
                    ctx.font = '10px sans-serif'; ctx.textAlign = 'center';
                    ctx.fillText(g.name, pos.x, pos.y - 18);
                    ctx.restore();
                }
            }

            // 3) Портал Часового розлому
            if (camera.isVisible(this.timeRift.x, this.timeRift.y, 60)) {
                const pos = camera.worldToScreen(this.timeRift.x, this.timeRift.y);
                const rot = performance.now() / 500;
                ctx.save();
                ctx.translate(pos.x, pos.y);
                ctx.rotate(rot);
                ctx.strokeStyle = this.timeRift.inPast ? '#F59E0B' : '#22D3EE';
                ctx.lineWidth = 4;
                ctx.beginPath(); ctx.ellipse(0, 0, 22, 12, 0, 0, Math.PI * 2); ctx.stroke();
                ctx.rotate(-rot * 2);
                ctx.strokeStyle = '#A5F3FC';
                ctx.beginPath(); ctx.ellipse(0, 0, 14, 8, 0, 0, Math.PI * 2); ctx.stroke();
                ctx.restore();
                ctx.save();
                ctx.fillStyle = '#A5F3FC'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center';
                ctx.fillText(this.timeRift.inPast ? '🌀 [E] Повернутися в сьогодення' : '⏳ [E] Часовий розлом', pos.x, pos.y - 26);
                ctx.restore();
            }

            // 4) Інші гравці в Кооперативі
            if (this.coop.enabled) {
                for (const peer of Object.values(this.coop.peers)) {
                    if (!camera.isVisible(peer.x, peer.y, 50)) continue;
                    const pos = camera.worldToScreen(peer.x, peer.y);
                    ctx.save();
                    ctx.fillStyle = '#3B82F6';
                    ctx.beginPath(); ctx.arc(pos.x, pos.y, 12, 0, Math.PI * 2); ctx.fill();
                    ctx.fillStyle = '#FDE047';
                    ctx.beginPath(); ctx.arc(pos.x, pos.y - 12, 7, 0, Math.PI * 2); ctx.fill();
                    ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center';
                    ctx.fillText(peer.name || 'Гравець', pos.x, pos.y - 24);
                    ctx.restore();
                }
            }
        }

        // ── КООПЕРАТИВ: BroadcastChannel + WebRTC P2P ──────────
        enableCoopBroadcast(roomName) {
            this.coop.room = roomName || 'island-coop-1';
            if (this.coop.channel) this.coop.channel.close();
            if (typeof BroadcastChannel !== 'undefined') {
                this.coop.channel = new BroadcastChannel('island_coop_' + this.coop.room);
                this.coop.channel.onmessage = (ev) => this._handleCoopMsg(ev.data);
            }
            this.coop.enabled = true;
            this.game.showNotification(`👥 Кооператив увімкнено! Кімната: ${this.coop.room}`, 'success');
        }

        _broadcastState() {
            const p = this.game.player;
            if (!p) return;
            const payload = {
                id: this.coop.playerId,
                name: this.coop.playerName,
                x: p.x, y: p.y,
                dir: p.direction,
                inBoat: p.inBoat
            };
            if (this.coop.channel) {
                try { this.coop.channel.postMessage(payload); } catch (_) {}
            }
            if (this.coop.dc && this.coop.dc.readyState === 'open') {
                try { this.coop.dc.send(JSON.stringify(payload)); } catch (_) {}
            }
        }

        _handleCoopMsg(data) {
            if (!data || data.id === this.coop.playerId) return;
            if (Object.keys(this.coop.peers).length >= 3 && !this.coop.peers[data.id]) return; // до 4 гравців разом із локальним
            this.coop.peers[data.id] = {
                x: data.x, y: data.y,
                name: data.name,
                dir: data.dir,
                inBoat: data.inBoat,
                lastSeen: Date.now()
            };
        }

        // ── UI Модалки: Дух, Репутація, Статистика, Кооп ──────
        openSpiritModal() {
            const modal = ensureModal('modal-spirit', '👻 Дух Острова');
            const body = modal.querySelector('.sp-body');
            const unSolved = this.riddles.findIndex((_, i) => !this.spirit.solved.includes(i));
            if (unSolved < 0) {
                body.innerHTML = `<p style="color:#67E8F9;">Усі мої загадки розгадані, мандрівнику. Бережи острів і зніми прокляття з села!</p>`;
            } else {
                const r = this.riddles[unSolved];
                body.innerHTML = `<p style="font-size:15px;color:#E2E8F0;margin-bottom:14px;">"${r.q}"</p><div id="spirit-opts" style="display:flex;flex-direction:column;gap:8px;"></div>`;
                const optsBox = body.querySelector('#spirit-opts');
                r.opts.forEach((opt, idx) => {
                    const btn = document.createElement('button');
                    btn.textContent = opt;
                    btn.style.cssText = 'padding:10px;background:#0E7490;color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:bold;';
                    btn.onclick = () => {
                        if (idx === r.ans) {
                            this.spirit.solved.push(unSolved);
                            this.stats.riddlesSolved++;
                            this.reputation.locals = Math.min(100, this.reputation.locals + 20);
                            this.game.player?.inventory?.addItem(r.reward.id, r.reward.count);
                            this.game.showNotification(`✨ Вірно! Підказка: ${r.hint}`, 'success');
                            modal.style.display = 'none';
                        } else {
                            this.game.showNotification('👻 Невірна відповідь! Подумай ще.', 'warning');
                        }
                    };
                    optsBox.appendChild(btn);
                });
            }
            modal.style.display = 'flex';
        }

        openReputationModal() {
            const modal = ensureModal('modal-reputation', '⚖️ Репутація Фракцій');
            const body = modal.querySelector('.sp-body');
            const r = this.reputation;
            body.innerHTML = `
                <div style="display:flex;flex-direction:column;gap:12px;">
                    <div style="background:#1E293B;padding:10px;border-radius:8px;">
                        <b>🏴‍☠️ Пірати:</b> <span style="color:${r.pirates >= 40 ? '#4ADE80' : '#F87171'};">${r.pirates}</span>
                        <br><small style="color:#94A3B8;">При +40 стають союзниками та припиняють рейди</small>
                        <div style="margin-top:8px;"><button id="btn-bribe-pirates" style="padding:6px 10px;background:#B45309;color:#fff;border:none;border-radius:6px;cursor:pointer;">💰 Дати 5 золотих (+25 репутації)</button></div>
                    </div>
                    <div style="background:#1E293B;padding:10px;border-radius:8px;">
                        <b>🏘️ Місцеві та Духи:</b> <span style="color:#38BDF8;">${r.locals}</span>
                        <br><small style="color:#94A3B8;">Підвищується за загадки Духа та очищення Проклятого села</small>
                    </div>
                    <div style="background:#1E293B;padding:10px;border-radius:8px;">
                        <b>🌿 Природа:</b> <span style="color:#4ADE80;">${r.nature}</span>
                        <br><small style="color:#94A3B8;">Підвищується за посадку рослин і турботу про тварин</small>
                    </div>
                </div>
            `;
            const bribeBtn = body.querySelector('#btn-bribe-pirates');
            if (bribeBtn) {
                bribeBtn.onclick = () => {
                    const inv = this.game.player?.inventory;
                    if (inv?.hasItem('gold_coin', 5)) {
                        inv.removeItem('gold_coin', 5);
                        this.reputation.pirates = Math.min(100, this.reputation.pirates + 25);
                        this.game.showNotification('🏴‍☠️ Пірати прийняли данину! Репутація +25.', 'success');
                        this.openReputationModal();
                    } else {
                        this.game.showNotification('Потрібно 5 золотих монет!', 'warning');
                    }
                };
            }
            modal.style.display = 'flex';
        }

        openStatsModal() {
            const modal = ensureModal('modal-stats', '📊 Статистика Виживання');
            const body = modal.querySelector('.sp-body');
            const day = this.game.timeSystem ? this.game.timeSystem.day : 1;
            const bCount = this.game.buildingSystem ? this.game.buildingSystem.buildings.length : 0;
            body.innerHTML = `
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                    <div style="background:#1E293B;padding:10px;border-radius:8px;">📅 Поточний день:<br><b style="font-size:18px;color:#FACC15;">${day}</b></div>
                    <div style="background:#1E293B;padding:10px;border-radius:8px;">🏆 Рекорд днів:<br><b style="font-size:18px;color:#4ADE80;">${this.stats.bestDays}</b></div>
                    <div style="background:#1E293B;padding:10px;border-radius:8px;">💀 Ворогів вбито:<br><b style="font-size:18px;color:#F87171;">${this.stats.enemiesKilled}</b></div>
                    <div style="background:#1E293B;padding:10px;border-radius:8px;">🏠 Споруд на базі:<br><b style="font-size:18px;color:#38BDF8;">${bCount}</b></div>
                    <div style="background:#1E293B;padding:10px;border-radius:8px;">👻 Загадок Духа:<br><b style="font-size:18px;color:#67E8F9;">${this.stats.riddlesSolved} / 3</b></div>
                    <div style="background:#1E293B;padding:10px;border-radius:8px;">🔮 Знято проклять:<br><b style="font-size:18px;color:#C084FC;">${this.stats.cursesLifted}</b></div>
                </div>
            `;
            modal.style.display = 'flex';
        }

        openCoopModal() {
            const modal = ensureModal('modal-coop', '👥 Кооператив (2-4 гравці)');
            const body = modal.querySelector('.sp-body');
            const peersCount = Object.keys(this.coop.peers).length;
            body.innerHTML = `
                <p style="color:#CBD5E1;font-size:13px;margin-top:0;">Грайте разом із друзями у сусідніх вкладках браузера (BroadcastChannel) або по мережі через WebRTC-код!</p>
                <div style="display:flex;gap:8px;margin-bottom:10px;">
                    <input id="coop-room-input" value="${this.coop.room}" style="flex:1;padding:8px;border-radius:6px;border:1px solid #475569;background:#0F172A;color:#fff;" placeholder="Назва кімнати">
                    <button id="btn-coop-join" style="padding:8px 14px;background:#0284C7;color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:bold;">Увімкнути</button>
                </div>
                <div style="background:#1E293B;padding:10px;border-radius:8px;font-size:13px;">
                    Статус: <b style="color:${this.coop.enabled ? '#4ADE80' : '#94A3B8'};">${this.coop.enabled ? 'Онлайн (' + (peersCount + 1) + '/4 гравців)' : 'Вимкнено'}</b><br>
                    Ваш ID: <code>${this.coop.playerName}</code>
                </div>
            `;
            body.querySelector('#btn-coop-join').onclick = () => {
                const room = body.querySelector('#coop-room-input').value.trim();
                this.enableCoopBroadcast(room);
                this.openCoopModal();
            };
            modal.style.display = 'flex';
        }
    }

    function ensureModal(id, title) {
        let m = document.getElementById(id);
        if (!m) {
            m = document.createElement('div');
            m.id = id;
            m.style.cssText = 'position:fixed;inset:0;background:rgba(2,6,23,0.75);display:none;align-items:center;justify-content:center;z-index:9999;';
            m.innerHTML = `
                <div style="background:#0F172A;border:2px solid #334155;border-radius:14px;padding:20px;width:400px;max-width:92vw;color:#F8FAFC;font-family:system-ui,sans-serif;position:relative;">
                    <button class="sp-close" style="position:absolute;top:10px;right:12px;background:none;border:none;color:#94A3B8;font-size:22px;cursor:pointer;">&times;</button>
                    <h3 style="margin-top:0;color:#38BDF8;">${title}</h3>
                    <div class="sp-body"></div>
                </div>
            `;
            m.querySelector('.sp-close').onclick = () => { m.style.display = 'none'; };
            document.body.appendChild(m);
        }
        return m;
    }

    // ─── 3. РЕЖИМ ХАРДКОР (1 життя + той самий сід) ─────────
    window.ISLAND_HARDCORE_MODE = false;
    window.ISLAND_HARDCORE_SEED = parseFloat(localStorage.getItem('island_hardcore_seed') || String(Math.floor(Math.random() * 100000)));

    // ─── 4. ІНТЕГРАЦІЯ З GAME ТА UI ──────────────────────────
    if (window.Game) {
        const origInit = Game.prototype.init;
        Game.prototype.init = function () {
            origInit.call(this);
            this.survivalPlus = new SurvivalPlusSystem(this);
            // У Хардкор-режимі застосовуємо збережений сід острова
            if (window.ISLAND_HARDCORE_MODE && this.world) {
                this.world.noise = new window.ValueNoise(window.ISLAND_HARDCORE_SEED);
                this.world.generate();
            }
        };

        const origLoad = Game.prototype.loadFromSave;
        Game.prototype.loadFromSave = function () {
            origLoad.call(this);
            if (!this.survivalPlus) this.survivalPlus = new SurvivalPlusSystem(this);
        };

        const origUpdate = Game.prototype.update;
        Game.prototype.update = function (dt) {
            origUpdate.call(this, dt);
            if (this.survivalPlus) this.survivalPlus.update(dt);

            // Перевірка смерті в режимі Хардкор
            if (window.ISLAND_HARDCORE_MODE && this.player && this.player.health <= 0) {
                this.running = false;
                if (window.SaveManager) window.SaveManager.deleteSave();
                alert('💀 ХАРДКОР: Ви загинули! Острів буде згенеровано заново з тим самим сідом.');
                localStorage.setItem('island_hardcore_seed', String(window.ISLAND_HARDCORE_SEED));
                this.init();
                this.start();
            }
        };

        const origRender = Game.prototype.render;
        Game.prototype.render = function () {
            origRender.call(this);
            if (this.survivalPlus && this.camera) {
                this.survivalPlus.render(this.ctx, this.camera);
            }
        };

        const origInteract = Game.prototype.handleInteraction;
        Game.prototype.handleInteraction = function () {
            if (this.survivalPlus && this.survivalPlus.handleInteraction(this.player)) return;
            if (origInteract) origInteract.call(this);
        };

        const origDamageTarget = Game.prototype.damageTarget;
        if (origDamageTarget) {
            Game.prototype.damageTarget = function (type, target, damage) {
                const res = origDamageTarget.call(this, type, target, damage);
                if (this.survivalPlus && ((target.health !== undefined && target.health <= 0) || (target.hp !== undefined && target.hp <= 0))) {
                    this.survivalPlus.stats.enemiesKilled++;
                    if (type === 'pirate') {
                        this.survivalPlus.reputation.pirates = Math.max(-100, this.survivalPlus.reputation.pirates - 10);
                        this.survivalPlus.reputation.locals = Math.min(100, this.survivalPlus.reputation.locals + 5);
                    }
                }
                return res;
            };
        }
    }

    // Інжектуємо кнопки у меню та бічну панель після DOMContentLoaded
    window.addEventListener('DOMContentLoaded', () => {
        // 1) Кнопка Хардкор у Головному Меню
        const diffSel = document.getElementById('difficulty-selector');
        if (diffSel && !document.getElementById('btn-hardcore-toggle')) {
            const hcBtn = document.createElement('button');
            hcBtn.id = 'btn-hardcore-toggle';
            hcBtn.type = 'button';
            hcBtn.textContent = '💀 Хардкор (1 життя): ВИМК';
            hcBtn.style.cssText = 'margin-top:8px;padding:7px 14px;border-radius:8px;border:1px solid #DC2626;background:rgba(127,29,29,0.45);color:#FECACA;cursor:pointer;font-weight:bold;';
            hcBtn.onclick = () => {
                window.ISLAND_HARDCORE_MODE = !window.ISLAND_HARDCORE_MODE;
                hcBtn.textContent = window.ISLAND_HARDCORE_MODE ? '💀 Хардкор (1 життя): УВІМК' : '💀 Хардкор (1 життя): ВИМК';
                hcBtn.style.background = window.ISLAND_HARDCORE_MODE ? '#DC2626' : 'rgba(127,29,29,0.45)';
            };
            diffSel.appendChild(hcBtn);
        }

        // 2) Кнопки на бічній панелі: Репутація, Статистика, Кооператив
        const sideBtns = document.querySelector('.side-buttons');
        if (sideBtns) {
            const addSideBtn = (id, icon, title, cb) => {
                if (document.getElementById(id)) return;
                const b = document.createElement('button');
                b.className = 'side-btn';
                b.id = id;
                b.title = title;
                b.textContent = icon;
                b.onclick = cb;
                sideBtns.appendChild(b);
            };
            addSideBtn('btn-toggle-reputation', '⚖️', 'Репутація фракцій', () => window.game?.survivalPlus?.openReputationModal());
            addSideBtn('btn-toggle-stats', '📊', 'Статистика виживання', () => window.game?.survivalPlus?.openStatsModal());
            addSideBtn('btn-toggle-coop', '👥', 'Кооператив (2-4 гравці)', () => window.game?.survivalPlus?.openCoopModal());
        }
    });

    if (window.drawItemIcon) {
        const origIcon = window.drawItemIcon;
        window.drawItemIcon = function (ctx, itemId, x, y, size) {
            const cx = x + size / 2, cy = y + size / 2, s = size;
            if (itemId === 'chrono_amulet' || itemId === 'ancient_compass') {
                ctx.save();
                ctx.fillStyle = itemId === 'chrono_amulet' ? '#06B6D4' : '#F59E0B';
                ctx.beginPath(); ctx.arc(cx, cy, s * 0.25, 0, Math.PI * 2); ctx.fill();
                ctx.strokeStyle = '#FEF08A'; ctx.lineWidth = 2; ctx.stroke();
                ctx.restore();
                return;
            }
            origIcon.call(this, ctx, itemId, x, y, size);
        };
    }

    console.log('[survival-plus.js] Дух, Прокляте село, Часовий розлом, Репутація, Статистика, Хардкор, Кооператив — завантажено ✅');
})();
