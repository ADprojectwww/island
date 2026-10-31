// ============================================================
// expansion.js — Туман війни, хвороби, електрика, бункер
// Завантажується після game.js
// ============================================================

// ─── 1. НОВІ ПРЕДМЕТИ ─────────────────────────────────────────

(function patchItemDB() {
    if (!window.ITEM_DB) return;
    const newItems = {
        // Електрика
        'solar_panel_item': { id:'solar_panel_item', name:'Сонячна панель', icon:'solar', category:'building', maxStack:1, placeable:'solar_panel', description:'Генерує 10 Вт енергії вдень' },
        'battery_item':     { id:'battery_item',     name:'Акумулятор',     icon:'battery_bld', category:'building', maxStack:1, placeable:'battery_unit', description:'Зберігає 100 Вт·год електроенергії' },
        'electric_fence_item': { id:'electric_fence_item', name:'Електроогорожа', icon:'efence', category:'building', maxStack:10, placeable:'electric_fence', description:'Вражає ворогів струмом. Потрібна електрика' },
        // Ліки
        'herbal_remedy':  { id:'herbal_remedy',  name:'Трав\'яний відвар', icon:'remedy', category:'medicine', maxStack:5,  description:'Лікує отруєння',    effects:{health:15} },
        'bandage':        { id:'bandage',         name:'Пов\'язка',        icon:'bandage', category:'medicine', maxStack:10, description:'Зупиняє кровотечу', effects:{health:20} },
        'hot_tea':        { id:'hot_tea',         name:'Гарячий чай',      icon:'tea',     category:'medicine', maxStack:5,  description:'Лікує застуду',     effects:{health:10, energy:15} },
        // Бункер
        'bunker_key_fragment': { id:'bunker_key_fragment', name:'Фрагмент ключа',          icon:'key_frag', category:'resource', maxStack:3,  description:'Частина ключа від бункера. Знайди всі 3' },
        'bunker_diary':        { id:'bunker_diary',         name:'Щоденник виживальника',   icon:'diary',    category:'resource', maxStack:1,  description:'Записки колишнього мешканця' },
        'military_ration':     { id:'military_ration',      name:'Військовий паєк',         icon:'ration',   category:'food',     maxStack:6,  description:'Армійський запас їжі', effects:{hunger:50, health:10} },
        'night_vision':        { id:'night_vision',         name:'Прилад нічного бачення',  icon:'nvg',      category:'tool',     maxStack:1,  description:'Бачиш вночі далі' },
    };
    Object.assign(window.ITEM_DB, newItems);
})();

// ─── 2. НОВІ РЕЦЕПТИ ──────────────────────────────────────────

(function patchRecipeDB() {
    if (!window.RECIPE_DB) return;
    const newRecipes = {
        'herbal_remedy':     { id:'herbal_remedy',     name:'Трав\'яний відвар', result:{id:'herbal_remedy',count:1},     materials:[{id:'mushroom',count:2},{id:'fiber',count:3}],    requires:null },
        'bandage':           { id:'bandage',           name:'Пов\'язка',         result:{id:'bandage',count:2},           materials:[{id:'fiber',count:4},{id:'branch',count:1}],      requires:null },
        'hot_tea':           { id:'hot_tea',           name:'Гарячий чай',       result:{id:'hot_tea',count:1},           materials:[{id:'water',count:1},{id:'mushroom',count:1}],    requires:'campfire' },
        'solar_panel_item':  { id:'solar_panel_item',  name:'Сонячна панель',    result:{id:'solar_panel_item',count:1},  materials:[{id:'glass_shard',count:6},{id:'electronics',count:4},{id:'metal_scrap',count:4}], requires:'workbench' },
        'battery_item':      { id:'battery_item',      name:'Акумулятор',        result:{id:'battery_item',count:1},      materials:[{id:'metal_scrap',count:6},{id:'electronics',count:5},{id:'rope',count:2}], requires:'workbench' },
        'electric_fence_item':{ id:'electric_fence_item', name:'Електроогорожа', result:{id:'electric_fence_item',count:2}, materials:[{id:'metal_scrap',count:3},{id:'electronics',count:1},{id:'rope',count:1}], requires:'workbench' },
    };
    Object.assign(window.RECIPE_DB, newRecipes);
})();

// ─── 3. НОВІ БУДІВЛІ ──────────────────────────────────────────

(function patchBuildingDB() {
    if (!window.BUILDING_DB) return;
    const newBuildings = {
        'solar_panel':   { id:'solar_panel',   name:'Сонячна панель',  width:40, height:40, passable:false, maxHealth:120, description:'Виробляє 10 Вт вдень', func:'solar' },
        'battery_unit':  { id:'battery_unit',  name:'Акумулятор',      width:36, height:36, passable:false, maxHealth:150, description:'100 Вт·год ємність',    func:'battery' },
        'electric_fence':{ id:'electric_fence',name:'Електроогорожа',  width:32, height:32, passable:false, maxHealth:200, description:'Б\'є струмом ворогів',   func:'electric_fence' },
    };
    Object.assign(window.BUILDING_DB, newBuildings);
})();

// ─── 4. СИСТЕМА ХВОРОБ ────────────────────────────────────────

window.DiseaseSystem = class DiseaseSystem {
    constructor() {
        this.diseases = [];      // активні хвороби гравця
        this.rainExposureTime = 0;
        this.lastBiteTime = 0;
    }

    // Визначення хвороб
    static DISEASES = {
        poisoning: {
            id: 'poisoning',
            name: '☠️ Отруєння',
            description: 'Гриб або зіпсована їжа',
            duration: 120,
            tick: (stats, dt) => { stats.health -= 2 * dt; stats.energy -= 1 * dt; },
            cure: 'herbal_remedy'
        },
        cold: {
            id: 'cold',
            name: '🤧 Застуда',
            description: 'Промокли під дощем',
            duration: 180,
            tick: (stats, dt) => { stats.energy -= 1.5 * dt; stats.health -= 0.5 * dt; },
            cure: 'hot_tea'
        },
        infection: {
            id: 'infection',
            name: '🩸 Зараження',
            description: 'Укус тварини або зомбі',
            duration: 240,
            tick: (stats, dt) => { stats.health -= 1 * dt; stats.hunger -= 1 * dt; },
            cure: 'bandage'
        }
    };

    contract(diseaseId) {
        if (this.diseases.find(d => d.id === diseaseId)) return false; // вже хворий
        const def = DiseaseSystem.DISEASES[diseaseId];
        if (!def) return false;
        this.diseases.push({ id: diseaseId, timer: def.duration });
        if (window.game) window.game.showNotification(`⚠️ Ви захворіли: ${def.name}`, 'danger');
        return true;
    }

    cure(diseaseId, itemId) {
        const def = DiseaseSystem.DISEASES[diseaseId];
        if (!def || def.cure !== itemId) return false;
        const idx = this.diseases.findIndex(d => d.id === diseaseId);
        if (idx < 0) return false;
        this.diseases.splice(idx, 1);
        if (window.game) window.game.showNotification(`✅ Хвороба "${def.name}" вилікована!`, 'success');
        return true;
    }

    cureWithItem(itemId) {
        // Застосовуємо предмет — лікуємо хворобу для якої він підходить
        for (const dis of Object.values(DiseaseSystem.DISEASES)) {
            if (dis.cure === itemId) {
                return this.cure(dis.id, itemId);
            }
        }
        return false;
    }

    update(dt, playerStats, weather, time) {
        // Накопичення часу під дощем
        if (weather && (weather.current === 'rain' || weather.current === 'heavy_rain' || weather.current === 'storm')) {
            this.rainExposureTime += dt;
            if (this.rainExposureTime > 45 && Math.random() < 0.001 * dt * 60) {
                this.contract('cold');
                this.rainExposureTime = 0;
            }
        } else {
            this.rainExposureTime = Math.max(0, this.rainExposureTime - dt * 0.5);
        }

        // Оновлення активних хвороб
        for (let i = this.diseases.length - 1; i >= 0; i--) {
            const d = this.diseases[i];
            const def = DiseaseSystem.DISEASES[d.id];
            if (def) {
                def.tick(playerStats, dt);
            }
            d.timer -= dt;
            if (d.timer <= 0) {
                this.diseases.splice(i, 1);
                if (window.game) window.game.showNotification(`✅ Хвороба "${def ? def.name : d.id}" пройшла сама по собі`, 'info');
            }
        }
    }

    getActiveNames() {
        return this.diseases.map(d => {
            const def = DiseaseSystem.DISEASES[d.id];
            return def ? def.name : d.id;
        });
    }

    serialize() {
        return { diseases: this.diseases, rainExposure: this.rainExposureTime };
    }

    static deserialize(data) {
        const s = new DiseaseSystem();
        if (data) {
            s.diseases = data.diseases || [];
            s.rainExposureTime = data.rainExposure || 0;
        }
        return s;
    }
};

// ─── 5. СИСТЕМА ЕЛЕКТРИКИ ─────────────────────────────────────

window.ElectricitySystem = class ElectricitySystem {
    constructor() {
        this.storedEnergy = 0;    // Вт·год
        this.maxEnergy = 0;       // ємність усіх акумуляторів
        this.production = 0;      // поточне виробництво (Вт)
        this.consumption = 0;     // поточне споживання (Вт)
        this.isDay = true;
    }

    update(dt, buildings, timeSystem) {
        this.production = 0;
        this.consumption = 0;
        this.maxEnergy = 0;

        this.isDay = !timeSystem.isNight();

        for (const b of buildings) {
            if (b.type === 'solar_panel') {
                b.powered = true;
                if (this.isDay) {
                    this.production += 10; // 10 Вт вдень
                }
            }
            if (b.type === 'battery_unit') {
                this.maxEnergy += 100; // 100 Вт·год кожен
            }
            if (b.type === 'electric_fence') {
                this.consumption += 5; // 5 Вт кожна секція
            }
            if (b.type === 'spotlight') {
                this.consumption += 8; // 8 Вт прожектор
            }
        }

        // Зарядка / розрядка
        const netDt = (this.production - this.consumption) * dt / 3600; // Вт·год за dt сек
        this.storedEnergy = Math.max(0, Math.min(this.maxEnergy, this.storedEnergy + netDt));

        // Живлення будівель
        const hasPower = this.storedEnergy > 0 || this.production >= this.consumption;
        for (const b of buildings) {
            if (b.type === 'electric_fence' || b.type === 'spotlight') {
                b.powered = hasPower;
                b.active = hasPower && timeSystem.isNight(); // spotlight активний вночі
            }
        }
    }

    // Пошкодження від електроогорожі
    applyFenceDamage(dt, game) {
        if (!game.buildingSystem) return;
        const fences = game.buildingSystem.buildings.filter(b => b.type === 'electric_fence' && b.powered);
        if (fences.length === 0) return;

        const damageTargets = [];
        if (game.zombieManager) damageTargets.push(...game.zombieManager.zombies.map(z => ({ e: z, type: 'zombie' })));
        if (game.pirateManager) damageTargets.push(...game.pirateManager.pirates.map(p => ({ e: p, type: 'pirate' })));
        for (const rp of (game.activeRaidPirates || [])) damageTargets.push({ e: rp, type: 'pirate' });

        for (const fence of fences) {
            for (const { e } of damageTargets) {
                if (Math.hypot(e.x - fence.x, e.y - fence.y) < 22) {
                    e.health -= 30 * dt;
                    if (Math.random() < dt * 3) {
                        game.spawnParticles(e.x, e.y, '#60A5FA', 3);
                    }
                }
            }
        }
    }

    getStatusText() {
        const stored = Math.round(this.storedEnergy);
        const max = Math.round(this.maxEnergy);
        return `⚡ ${stored}/${max} Вт·год | +${Math.round(this.production)} -${Math.round(this.consumption)} Вт`;
    }

    serialize() {
        return { storedEnergy: this.storedEnergy };
    }

    static deserialize(data) {
        const s = new ElectricitySystem();
        if (data) s.storedEnergy = data.storedEnergy || 0;
        return s;
    }
};

// ─── 6. ТУМАН ВІЙНИ ───────────────────────────────────────────

window.FogOfWar = class FogOfWar {
    constructor(worldW, worldH) {
        this.worldW = worldW;
        this.worldH = worldH;
        // Бітовий масив: 1 байт на тайл (0=приховано, 1=видно)
        this.explored = new Uint8Array(worldW * worldH);
        this.revealRadius = 6; // тайлів
    }

    reveal(px, py, tileSize) {
        const tx = Math.floor(px / tileSize);
        const ty = Math.floor(py / tileSize);
        const r = this.revealRadius;
        for (let dy = -r; dy <= r; dy++) {
            for (let dx = -r; dx <= r; dx++) {
                if (dx * dx + dy * dy > r * r) continue;
                const nx = tx + dx;
                const ny = ty + dy;
                if (nx < 0 || ny < 0 || nx >= this.worldW || ny >= this.worldH) continue;
                this.explored[ny * this.worldW + nx] = 1;
            }
        }
    }

    isExplored(tx, ty) {
        if (tx < 0 || ty < 0 || tx >= this.worldW || ty >= this.worldH) return false;
        return this.explored[ty * this.worldW + tx] === 1;
    }

    drawOnMap(ctx, canvasW, canvasH) {
        const scaleX = canvasW / this.worldW;
        const scaleY = canvasH / this.worldH;
        ctx.fillStyle = 'rgba(0,0,0,0.72)';
        for (let ty = 0; ty < this.worldH; ty++) {
            for (let tx = 0; tx < this.worldW; tx++) {
                if (!this.isExplored(tx, ty)) {
                    ctx.fillRect(tx * scaleX, ty * scaleY, Math.ceil(scaleX + 0.5), Math.ceil(scaleY + 0.5));
                }
            }
        }
    }

    // Скорочена серіалізація — зберігаємо тільки відкриті тайли як масив
    serialize() {
        const open = [];
        for (let i = 0; i < this.explored.length; i++) {
            if (this.explored[i]) open.push(i);
        }
        return { worldW: this.worldW, worldH: this.worldH, open };
    }

    static deserialize(data, worldW, worldH) {
        const f = new FogOfWar(worldW, worldH);
        if (data && data.open) {
            for (const idx of data.open) {
                if (idx < f.explored.length) f.explored[idx] = 1;
            }
        }
        return f;
    }
};

// ─── 7. БУНКЕР ────────────────────────────────────────────────

window.BunkerSystem = class BunkerSystem {
    constructor(tileSize) {
        this.tileSize = tileSize;
        // Бункер розташований у конкретному місці острова
        this.x = 55 * tileSize;
        this.y = 55 * tileSize;
        this.radius = 24;
        this.unlocked = false;
        this.looted = false;
        this.isOpen = false;
        this.lootChests = [
            // Розкид предметів що знаходяться всередині
            { id: 'canned_food',        count: 8  },
            { id: 'military_ration',    count: 4  },
            { id: 'ammo',               count: 30 },
            { id: 'bandage',            count: 5  },
            { id: 'electronics',        count: 3  },
            { id: 'metal_armor',        count: 1  },
            { id: 'night_vision',       count: 1  },
            { id: 'bunker_diary',       count: 1  },
            { id: 'sniper_rifle',       count: 1  },
        ];
        // Фрагменти ключа — прив'язані до локацій
        this.keyLocations = [
            { tx: 30, ty: 40, found: false, label: 'Уламки літака (північ)' },
            { tx: 80, ty: 30, found: false, label: 'Піратський форт'        },
            { tx: 40, ty: 80, found: false, label: 'Берег на півдні'        },
        ];
    }

    nearEntrance(px, py) {
        return Math.hypot(px - this.x, py - this.y) < 80;
    }

    tryOpen(inventory, game) {
        if (this.unlocked) {
            this.isOpen = !this.isOpen;
            game.showNotification(this.isOpen ? '🔓 Бункер відкрито! Заходьте.' : '🔒 Бункер зачинено.', 'info');
            return;
        }
        const fragments = inventory.countItem('bunker_key_fragment');
        if (fragments >= 3) {
            inventory.removeItem('bunker_key_fragment', 3);
            this.unlocked = true;
            this.isOpen = true;
            game.showNotification('🔑 Усі 3 фрагменти зібрано — БУНКЕР ВІДЧИНЕНО!', 'success');
            game.player.addXP(150);
            game.spawnParticles(this.x, this.y, '#F59E0B', 40);
        } else {
            game.showNotification(`🔒 Потрібно 3 фрагменти ключа. У вас: ${fragments}/3`, 'warning');
        }
    }

    lootBunker(inventory, game) {
        if (!this.isOpen) {
            game.showNotification('Бункер зачинений!', 'error');
            return;
        }
        if (this.looted) {
            game.showNotification('Бункер вже спустошено.', 'info');
            return;
        }
        let added = 0;
        for (const item of this.lootChests) {
            const n = inventory.addItem(item.id, item.count);
            if (n > 0) added += n;
            else game.world.addDroppedItem(item.id, item.count, this.x + Math.random()*20 - 10, this.y + Math.random()*20 - 10);
        }
        this.looted = true;
        game.showNotification('🎖️ Ви отримали всі запаси бункера!', 'success');
        game.player.addXP(200);
    }

    // Перевіряємо ближність до позицій фрагментів ключа
    checkKeyFragments(px, py, inventory, game) {
        for (const loc of this.keyLocations) {
            if (loc.found) continue;
            const wx = loc.tx * this.tileSize;
            const wy = loc.ty * this.tileSize;
            if (Math.hypot(px - wx, py - wy) < 60) {
                loc.found = true;
                inventory.addItem('bunker_key_fragment', 1);
                const total = this.keyLocations.filter(l => l.found).length;
                game.showNotification(`🔑 Знайдено фрагмент ключа! (${total}/3) — ${loc.label}`, 'success');
                game.spawnParticles(wx, wy, '#FDE68A', 20);
                game.player.addXP(50);
            }
        }
    }

    drawEntrance(ctx, camera) {
        if (!camera.isVisible(this.x, this.y)) return;
        const pos = camera.worldToScreen(this.x, this.y);
        ctx.save();
        ctx.translate(pos.x, pos.y);

        // Фон бункера
        ctx.fillStyle = this.unlocked ? '#374151' : '#1F2937';
        ctx.fillRect(-28, -28, 56, 56);
        ctx.strokeStyle = this.unlocked ? '#F59E0B' : '#6B7280';
        ctx.lineWidth = 3;
        ctx.strokeRect(-28, -28, 56, 56);

        // Люк
        ctx.fillStyle = this.isOpen ? '#059669' : '#DC2626';
        ctx.fillRect(-16, -16, 32, 32);
        ctx.strokeStyle = '#9CA3AF';
        ctx.lineWidth = 2;
        ctx.strokeRect(-16, -16, 32, 32);

        // Іконка
        ctx.fillStyle = '#F1F5F9';
        ctx.font = 'bold 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.unlocked ? '🔓' : '🔒', 0, 0);

        // Мітка
        ctx.font = '10px sans-serif';
        ctx.fillStyle = '#FDE68A';
        ctx.fillText('БУНКЕР', 0, -36);

        ctx.restore();
    }

    drawKeyMarkers(ctx, camera) {
        for (const loc of this.keyLocations) {
            if (loc.found) continue;
            const wx = loc.tx * this.tileSize;
            const wy = loc.ty * this.tileSize;
            if (!camera.isVisible(wx, wy)) continue;
            const pos = camera.worldToScreen(wx, wy);
            ctx.save();
            ctx.translate(pos.x, pos.y);
            // Пульсуючий ромб
            const t = Date.now() / 400;
            const sc = 1 + 0.15 * Math.sin(t);
            ctx.scale(sc, sc);
            ctx.fillStyle = '#FDE68A';
            ctx.beginPath();
            ctx.moveTo(0, -10); ctx.lineTo(10, 0);
            ctx.lineTo(0, 10);  ctx.lineTo(-10, 0);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#D97706';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.font = '9px sans-serif';
            ctx.fillStyle = '#1F2937';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🔑', 0, 0);
            ctx.restore();
        }
    }

    drawBunkerInterior(ctx, camera) {
        if (!this.isOpen) return;
        const pos = camera.worldToScreen(this.x, this.y);
        const r = 120; // радіус інтер'єру на екрані
        ctx.save();
        ctx.translate(pos.x, pos.y + 50);
        ctx.fillStyle = 'rgba(15,23,42,0.92)';
        ctx.fillRect(-r, -r/2, r*2, r);
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.strokeRect(-r, -r/2, r*2, r);

        ctx.fillStyle = '#94A3B8';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(this.looted ? '[ Порожній бункер ]' : '[ Натисніть E щоб взяти запаси ]', 0, -r/4);

        if (!this.looted) {
            ctx.font = '28px sans-serif';
            ctx.fillText('🎖️', -40, 10);
            ctx.fillText('🥫', 0, 10);
            ctx.fillText('🔫', 40, 10);
        }
        ctx.restore();
    }

    serialize() {
        return {
            unlocked: this.unlocked,
            looted: this.looted,
            isOpen: this.isOpen,
            keyLocations: this.keyLocations
        };
    }

    static deserialize(data, tileSize) {
        const s = new BunkerSystem(tileSize);
        if (data) {
            s.unlocked = !!data.unlocked;
            s.looted   = !!data.looted;
            s.isOpen   = !!data.isOpen;
            if (data.keyLocations) s.keyLocations = data.keyLocations;
        }
        return s;
    }
};

// ─── 8. ПАТЧ Game.init() ──────────────────────────────────────
// Підключаємо нові системи до ігрового циклу

(function patchGameInit() {
    const origInit = Game.prototype.init;
    Game.prototype.init = function() {
        origInit.call(this);
        this.fogOfWar      = new window.FogOfWar(this.worldWidth, this.worldHeight);
        this.diseaseSystem = new window.DiseaseSystem();
        this.electricSystem= new window.ElectricitySystem();
        this.bunkerSystem  = new window.BunkerSystem(this.tileSize);

        // Початково відкриваємо стартову зону
        this.fogOfWar.reveal(this.player.x, this.player.y, this.tileSize);
    };

    const origLoad = Game.prototype.loadFromSave;
    Game.prototype.loadFromSave = function() {
        origLoad.call(this);
        const raw = window.SaveManager ? window.SaveManager.load() : null;
        this.fogOfWar      = raw && raw.fogOfWar      ? window.FogOfWar.deserialize(raw.fogOfWar, this.worldWidth, this.worldHeight) : new window.FogOfWar(this.worldWidth, this.worldHeight);
        this.diseaseSystem = raw && raw.diseaseSystem  ? window.DiseaseSystem.deserialize(raw.diseaseSystem)  : new window.DiseaseSystem();
        this.electricSystem= raw && raw.electricSystem ? window.ElectricitySystem.deserialize(raw.electricSystem) : new window.ElectricitySystem();
        this.bunkerSystem  = raw && raw.bunkerSystem   ? window.BunkerSystem.deserialize(raw.bunkerSystem, this.tileSize) : new window.BunkerSystem(this.tileSize);
    };

    // Збереження
    const origSave = Game.prototype.saveGame;
    Game.prototype.saveGame = function() {
        origSave.call(this);
        if (!window.SaveManager) return;
        const raw = window.SaveManager.load() || {};
        if (this.fogOfWar)      raw.fogOfWar      = this.fogOfWar.serialize();
        if (this.diseaseSystem) raw.diseaseSystem  = this.diseaseSystem.serialize();
        if (this.electricSystem)raw.electricSystem = this.electricSystem.serialize();
        if (this.bunkerSystem)  raw.bunkerSystem   = this.bunkerSystem.serialize();
        window.SaveManager.rawSave(raw);
    };
})();

// ─── 9. ПАТЧ Game.update() ────────────────────────────────────

(function patchGameUpdate() {
    const origUpdate = Game.prototype.update;
    Game.prototype.update = function(dt) {
        origUpdate.call(this, dt);

        // Туман війни — відкриваємо місцевість навколо гравця
        if (this.fogOfWar) {
            this.fogOfWar.reveal(this.player.x, this.player.y, this.tileSize);
        }

        // Система хвороб
        if (this.diseaseSystem && this.systemsLoaded) {
            const pStats = {
                health: this.player.health,
                hunger: this.player.hunger,
                energy: this.player.energy
            };
            this.diseaseSystem.update(dt, pStats, this.weatherSystem, this.timeSystem);
            this.player.health = Math.max(0, pStats.health);
            this.player.energy = Math.max(0, pStats.energy);
        }

        // Електрика
        if (this.electricSystem && this.buildingSystem && this.systemsLoaded) {
            this.electricSystem.update(dt, this.buildingSystem.buildings, this.timeSystem);
            this.electricSystem.applyFenceDamage(dt, this);
        }

        // Бункер — перевірка фрагментів ключа та взаємодія
        if (this.bunkerSystem && this.player) {
            this.bunkerSystem.checkKeyFragments(
                this.player.x, this.player.y,
                this.player.inventory, this
            );
        }
    };
})();

// ─── 10. ПАТЧ Game.render() ───────────────────────────────────

(function patchGameRender() {
    const origRender = Game.prototype.render;
    Game.prototype.render = function() {
        origRender.call(this);

        // Бункер
        if (this.bunkerSystem) {
            this.bunkerSystem.drawEntrance(this.ctx, this.camera);
            this.bunkerSystem.drawKeyMarkers(this.ctx, this.camera);
            this.bunkerSystem.drawBunkerInterior(this.ctx, this.camera);
        }

        // Електрика HUD
        if (this.electricSystem && this.electricSystem.maxEnergy > 0) {
            const txt = this.electricSystem.getStatusText();
            this.ctx.save();
            this.ctx.fillStyle = 'rgba(0,0,0,0.55)';
            this.ctx.fillRect(10, this.canvas.height - 70, 240, 24);
            this.ctx.fillStyle = '#93C5FD';
            this.ctx.font = '12px monospace';
            this.ctx.textAlign = 'left';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(txt, 16, this.canvas.height - 58);
            this.ctx.restore();
        }

        // Хвороби HUD
        if (this.diseaseSystem && this.diseaseSystem.diseases.length > 0) {
            const names = this.diseaseSystem.getActiveNames().join('  ');
            this.ctx.save();
            this.ctx.fillStyle = 'rgba(127,0,0,0.65)';
            this.ctx.fillRect(10, this.canvas.height - 44, 260, 22);
            this.ctx.fillStyle = '#FCA5A5';
            this.ctx.font = '11px sans-serif';
            this.ctx.textAlign = 'left';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(names, 14, this.canvas.height - 33);
            this.ctx.restore();
        }
    };
})();

// ─── 11. ПАТЧ map UI — туман на мінікарті ─────────────────────

(function patchMapUI() {
    const origMap = window.updateMapUI;
    window.updateMapUI = function() {
        origMap();
        if (!window.game || !window.game.fogOfWar) return;
        const canvas = document.getElementById('map-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        window.game.fogOfWar.drawOnMap(ctx, canvas.width, canvas.height);
    };
})();

// ─── 12. ПАТЧ взаємодія — бункер, ліки ───────────────────────

(function patchInteraction() {
    const origInteract = Game.prototype.handleInteraction;
    Game.prototype.handleInteraction = function() {
        // Бункер
        if (this.bunkerSystem && this.bunkerSystem.nearEntrance(this.player.x, this.player.y)) {
            if (this.bunkerSystem.isOpen) {
                this.bunkerSystem.lootBunker(this.player.inventory, this);
            } else {
                this.bunkerSystem.tryOpen(this.player.inventory, this);
            }
            return;
        }
        origInteract.call(this);
    };
})();

// ─── 13. ПАТЧ вживання предметів — ліки ──────────────────────

(function patchItemUse() {
    const origUse = window.useItem;
    window.useItem = function(itemId) {
        if (!window.game || !window.game.diseaseSystem) {
            if (origUse) return origUse(itemId);
            return;
        }
        const cured = window.game.diseaseSystem.cureWithItem(itemId);
        if (cured) {
            window.game.player.inventory.removeItem(itemId, 1);
            return;
        }
        if (origUse) origUse(itemId);
    };
})();

// ─── 14. ПАТЧ отруєння при їжі сирих грибів ─────────────────

(function patchFoodPoisoning() {
    // Перехоплюємо effects гриба — дає 15% шанс отруєння
    const origEffects = window.applyFoodEffects;
    window.applyFoodEffects = function(itemId, player) {
        if (origEffects) origEffects(itemId, player);
        if (itemId === 'mushroom' && window.game && window.game.diseaseSystem) {
            if (Math.random() < 0.15) {
                window.game.diseaseSystem.contract('poisoning');
            }
        }
    };
})();

// ─── 15. КОНТРАКТ інфекції при укусі зомбі ───────────────────

(function patchZombieBite() {
    const origUpdate = NightZombieManager.prototype.update;
    NightZombieManager.prototype.update = function(dt, game) {
        origUpdate.call(this, dt, game);
        // Після атаки зомбі — 20% шанс зараження
        if (game && game.diseaseSystem && game.player) {
            const nearZombie = this.zombies.some(z =>
                Math.hypot(z.x - game.player.x, z.y - game.player.y) < 32
            );
            if (nearZombie && Math.random() < 0.0004 * dt * 60) {
                game.diseaseSystem.contract('infection');
            }
        }
    };
})();

// ─── 16. SaveManager.rawSave ─────────────────────────────────

if (window.SaveManager && !window.SaveManager.rawSave) {
    window.SaveManager.rawSave = function(data) {
        try {
            localStorage.setItem('island_save', JSON.stringify(data));
        } catch (e) {
            console.warn('SaveManager.rawSave failed:', e);
        }
    };
}

console.log('[expansion.js] Fog of War, Diseases, Electricity, Bunker — loaded ✅');

