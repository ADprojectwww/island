// ============================================================
// ultimate-expansion.js
// 14 ВЕЛИКИХ ІГРОВИХ СИСТЕМ:
// 1. Повноцінна риболовля з поплавком та реакцією
// 2. Казанок і кулінарія (супи, рагу, бафи)
// 3. Реальний ріст фермерства (стадії, полив)
// 4. Підземна печера / Закинута шахта
// 5. Болотяний біом (Трясовина, п'явки, торф)
// 6. Стародавній храм із головоломкою (3 плити)
// 7. Вцілілі пасажири літака (медик, тесля, мисливець)
// 8. Розведення свійських тварин (загін, доїння, яйця)
// 9. Оглядова вежа / Маяк (промінь, розсіювання туману)
// 10. Оборонні пастки (падаюча колода, смоляна бочка)
// 11. Припливи та відпливи (мілини зі скарбами)
// 12. Вулканічний попелопад / Кислотний дощ
// 13. Дерево навичок (Перки за рівні)
// 14. Різні типи рюкзаків (розширення інвентарю)
// ============================================================

(function() {
    'use strict';

    // ─── 1. НОВІ ПРЕДМЕТИ В ITEM_DB ─────────────────────────────
    if (window.ITEM_DB) {
        const ultimateItems = {
            // Риби
            'sea_bass':       { id:'sea_bass',       name:'Морський окунь',    icon:'fish', category:'food', maxStack:10, effects:{hunger:18, health:4}, description:'Смачна морська риба' },
            'electric_eel':   { id:'electric_eel',   name:'Електричний вугор', icon:'fish', category:'food', maxStack:5,  effects:{hunger:15, energy:25}, description:'Дивний вугор, що б\'ється легким струмом' },
            'swordfish':      { id:'swordfish',      name:'Риба-меч',          icon:'fish', category:'food', maxStack:5,  effects:{hunger:35, health:12}, description:'Величезний рідкісний улов!' },
            'golden_trout':   { id:'golden_trout',   name:'Золота форель',     icon:'fish', category:'food', maxStack:5,  effects:{hunger:25, health:20}, description:'Легендарна риба із золотавим відливом' },
            
            // Кулінарія
            'cooking_pot_item':{ id:'cooking_pot_item', name:'Казанок (предмет)', icon:'pot', category:'building', maxStack:1, placeable:'cooking_pot', description:'Казанок для приготування поживних супів та рагу' },
            'fish_stew':      { id:'fish_stew',      name:'Поживна юшка',      icon:'stew', category:'food', maxStack:5,  effects:{hunger:45, thirst:30}, description:'Юшка: дає баф «Швидке плавання (+40%)» на 3 хв' },
            'meat_stew':      { id:'meat_stew',      name:'Мисливське рагу',   icon:'stew', category:'food', maxStack:5,  effects:{hunger:55, health:15}, description:'Рагу: дає баф «Сила ведмедя (+35% шкоди)» на 3 хв' },
            'veggie_soup':    { id:'veggie_soup',    name:'Цілющий відвар',    icon:'soup', category:'food', maxStack:5,  effects:{hunger:30, health:25}, description:'Відвар: дає швидку регенерацію здоров\'я на 2 хв' },
            'energizing_brew':{ id:'energizing_brew',name:'Еліксир бадьорості',icon:'tea',  category:'food', maxStack:5,  effects:{thirst:40, energy:50}, description:'Еліксир: нескінченна витривалість на 2 хв' },

            // Фермерство
            'potato_seed':    { id:'potato_seed',    name:'Бульба картоплі',   icon:'seeds', category:'resource', maxStack:20, description:'Для посадки на грядку' },
            'corn_seed':      { id:'corn_seed',      name:'Зерна кукурудзи',   icon:'seeds', category:'resource', maxStack:20, description:'Для посадки або корму тваринам' },
            'potato':         { id:'potato',         name:'Картопля',          icon:'food',  category:'food',     maxStack:25, effects:{hunger:12}, description:'Поживний овоч' },
            'corn':           { id:'corn',           name:'Кукурудза',         icon:'food',  category:'food',     maxStack:25, effects:{hunger:14}, description:'Солодка кукурудза' },

            // Печера та корисні копалини
            'iron_ore':       { id:'iron_ore',       name:'Залізна руда',      icon:'iron_ore', category:'resource', maxStack:25, description:'Руда з підземних надр острова' },
            'iron_ingot':     { id:'iron_ingot',     name:'Залізний зливок',   icon:'iron',     category:'resource', maxStack:20, description:'Виплавлене міцне залізо' },
            'coal':           { id:'coal',           name:'Вугілля',           icon:'coal',     category:'resource', maxStack:30, description:'Ефективне паливо для вогню та плавки' },
            'mining_pickaxe': { id:'mining_pickaxe', name:'Шахтарське кайло',  icon:'pickaxe',  category:'tool',     maxStack:1,  toolType:'pickaxe', power:3, description:'Для швидкого видобутку руди' },

            // Болото та трясовина
            'peat':           { id:'peat',           name:'Торф',              icon:'peat',     category:'resource', maxStack:20, description:'Сухий болотний торф — чудове паливо' },
            'swamp_moss':     { id:'swamp_moss',     name:'Болотний мох',      icon:'fiber',    category:'medicine', maxStack:20, description:'Природний антисептик, зупиняє кровотечу' },
            'sea_shell':      { id:'sea_shell',      name:'Рідкісна мушля',    icon:'shell',    category:'resource', maxStack:15, description:'Викинута відпливом мушля із дна моря' },

            // Храм і реліквія
            'ancient_relic':  { id:'ancient_relic',  name:'Священний скарабей',icon:'relic',    category:'resource', maxStack:1,  description:'Реліквія з таємної зали стародавнього храму' },

            // Будівництво та пастки
            'watchtower_item':{ id:'watchtower_item',name:'Оглядова вежа / Маяк', icon:'tower', category:'building', maxStack:1, placeable:'watchtower', description:'Маяк: розсіює туман і освітлює море' },
            'log_trap_item':  { id:'log_trap_item',  name:'Падаюча колода',    icon:'trap',     category:'building', maxStack:5, placeable:'log_trap', description:'Пастка збиває нападників з ніг' },
            'tar_barrel_item':{ id:'tar_barrel_item',name:'Смоляна бочка',     icon:'barrel',   category:'building', maxStack:5, placeable:'tar_barrel', description:'Вибухає від пострілу або вогню' },

            // Рюкзаки
            'leather_backpack': { id:'leather_backpack', name:'Шкіряний рюкзак', icon:'backpack', category:'armor', maxStack:1, description:'Розширює інвентар до 40 слотів' },
            'military_backpack':{ id:'military_backpack',name:'Тактичний рюкзак',icon:'backpack', category:'armor', maxStack:1, description:'Розширює інвентар до 50 слотів' }
        };
        Object.assign(window.ITEM_DB, ultimateItems);
    }

    // ─── 2. НОВІ РЕЦЕПТИ В RECIPE_DB ────────────────────────────
    if (window.RECIPE_DB) {
        const ultimateRecipes = {
            'cooking_pot_item': { id:'cooking_pot_item', name:'Казанок', result:{id:'cooking_pot_item',count:1}, materials:[{id:'metal_scrap',count:5},{id:'stone',count:4}], requires:'workbench' },
            'mining_pickaxe':   { id:'mining_pickaxe',   name:'Шахтарське кайло', result:{id:'mining_pickaxe',count:1}, materials:[{id:'wood',count:3},{id:'stone',count:4},{id:'rope',count:2}], requires:'workbench' },
            'iron_ingot':       { id:'iron_ingot',       name:'Залізний зливок', result:{id:'iron_ingot',count:1}, materials:[{id:'iron_ore',count:2},{id:'coal',count:1}], requires:'campfire' },
            'watchtower_item':  { id:'watchtower_item',  name:'Маяк / Вежа', result:{id:'watchtower_item',count:1}, materials:[{id:'wood',count:25},{id:'plank',count:12},{id:'spotlight_item',count:1},{id:'rope',count:6}], requires:'workbench' },
            'log_trap_item':    { id:'log_trap_item',    name:'Падаюча колода', result:{id:'log_trap_item',count:1}, materials:[{id:'wood',count:4},{id:'rope',count:2}], requires:null },
            'tar_barrel_item':  { id:'tar_barrel_item',  name:'Смоляна бочка', result:{id:'tar_barrel_item',count:1}, materials:[{id:'wood',count:4},{id:'fuel',count:1},{id:'gunpowder',count:1}], requires:'workbench' },
            'leather_backpack': { id:'leather_backpack', name:'Шкіряний рюкзак (+10 слотів)', result:{id:'leather_backpack',count:1}, materials:[{id:'basket',count:1},{id:'fiber',count:10},{id:'rope',count:4}], requires:'workbench' },
            'military_backpack':{ id:'military_backpack',name:'Тактичний рюкзак (+20 слотів)', result:{id:'military_backpack',count:1}, materials:[{id:'leather_backpack',count:1},{id:'metal_scrap',count:6},{id:'rope',count:4}], requires:'workbench' }
        };
        Object.assign(window.RECIPE_DB, ultimateRecipes);
    }

    // ─── 3. НОВІ БУДІВЛІ В BUILDING_DB ──────────────────────────
    if (window.BUILDING_DB) {
        const ultimateBuildings = {
            'cooking_pot': { id:'cooking_pot', name:'Казанок', width:36, height:36, passable:false, maxHealth:150, description:'Для приготування поживних супів і рагу', func:'cooking' },
            'watchtower':  { id:'watchtower',  name:'Маяк / Вежа', width:64, height:64, passable:false, maxHealth:400, description:'Освітлює велику територію та відганяє туман', func:'watchtower' },
            'log_trap':    { id:'log_trap',    name:'Падаюча колода', width:32, height:32, passable:true, maxHealth:80, description:'Захисна пастка', func:'log_trap' },
            'tar_barrel':  { id:'tar_barrel',  name:'Смоляна бочка', width:32, height:32, passable:false, maxHealth:40, description:'Вибухонебезпечна бочка', func:'tar_barrel' }
        };
        Object.assign(window.BUILDING_DB, ultimateBuildings);
    }

    // ─── 4. ГОЛОВНИЙ КЛАС ULTIMATE EXPANSION ────────────────────
    class UltimateExpansionSystem {
        constructor(game) {
            this.game = game;
            this.tileSize = game.tileSize || 32;

            // 1. РИБОЛОВЛЯ
            this.fishingState = {
                active: false,
                castTime: 0,
                biteTime: 0,
                isBiting: false,
                catchWindow: 0,
                floatX: 0,
                floatY: 0,
                ripples: []
            };

            // 2. КУЛІНАРНІ БАФИ
            this.activeBuffs = {
                swimSpeed: 0, // секунди
                attackBonus: 0,
                regenHp: 0,
                infiniteStamina: 0
            };

            // 3. ФЕРМЕРСТВО (Реальний ріст грядок)
            this.crops = new Map(); // buildingId -> { type, stage: 0..3, timer, watered: bool }

            // 4. ПІДЗЕМНА ПЕЧЕРА / ШАХТА
            this.inCave = false;
            this.caveEntrance = { x: 48 * this.tileSize, y: 32 * this.tileSize };
            this.caveExit = { x: 15 * this.tileSize, y: 15 * this.tileSize };
            this.caveOres = [];
            this.caveBats = [];
            this.initCaveLevel();

            // 5. БОЛОТЯНИЙ БІОМ
            this.swampZone = {
                minX: 18 * this.tileSize, maxX: 38 * this.tileSize,
                minY: 65 * this.tileSize, maxY: 95 * this.tileSize
            };
            this.leechTimer = 0;

            // 6. СТАРОДАВНІЙ ХРАМ З 3 ПЛИТАМИ
            this.temple = {
                x: 75 * this.tileSize,
                y: 75 * this.tileSize,
                plates: [
                    { id: 1, relX: -45, relY: 20, pressed: false },
                    { id: 2, relX: 0,   relY: 45, pressed: false },
                    { id: 3, relX: 45,  relY: 20, pressed: false }
                ],
                doorOpen: false,
                relicLooted: false
            };

            // 7. ВЦІЛІЛІ ПАСАЖИРИ ЛІТАКА
            this.survivors = [
                { id: 'elena', name: 'Олена (Лікар)', role: 'medic', x: 88 * this.tileSize, y: 22 * this.tileSize, recruited: false, dialogue: 'Дякую, що знайшов мене! Я можу лікувати рани та давати бинти.' },
                { id: 'mykhailo', name: 'Михайло (Тесля)', role: 'builder', x: 25 * this.tileSize, y: 45 * this.tileSize, recruited: false, dialogue: 'Ого, живий! Дай мені притулок, і я щодня виготовлятиму дошки для бази.' },
                { id: 'artem', name: 'Артем (Мисливець)', role: 'hunter', x: 92 * this.tileSize, y: 80 * this.tileSize, recruited: false, dialogue: 'Я тримав оборону сам. Разом ми впораємося з будь-якими хижаками!' }
            ];

            // 8. РОЗВЕДЕННЯ ТВАРИН
            this.penAnimals = []; // { species, feedTimer, produceTimer }

            // 9. ОГЛЯДОВА ВЕЖА / МАЯК
            this.lighthouseBeamAngle = 0;

            // 10. ПРИПЛИВИ ТА ВІДПЛИВИ
            this.tideHeight = 0; // -1 (повний відплив) до 1 (повний приплив)
            this.tidePools = [];
            this.initTidePools();

            // 11. ПОПЕЛОПАД ТА КИСЛОТНИЙ ДОЩ
            this.ashfallActive = false;
            this.ashfallTimer = 0;

            // 12. ДЕРЕВО НАВИЧОК (ПЕРКИ)
            this.unspentPerkPoints = 0;
            this.lastLevelChecked = 1;
            this.perks = {
                ironStomach: false,   // імунітет до отруєння
                scout: false,         // витривалість -40%
                sturdy: false,        // HP +30
                lumberjack: false,    // рубка x2
                miner: false,         // шанс самоцвіту
                sniper: false,        // дальність вогню +30%
                sprinter: false       // швидкість бігу +20%
            };

            // 13. ПОТОЧНИЙ РЮКЗАК
            this.equippedBackpack = 'default';

            this.initUI();
        }

        // ── 4.1. Генерація шахти / печери ─────────────────────────
        initCaveLevel() {
            this.caveOres = [
                { id: 'ore_1', type: 'iron_ore', x: 12 * this.tileSize, y: 18 * this.tileSize, health: 100 },
                { id: 'ore_2', type: 'iron_ore', x: 18 * this.tileSize, y: 12 * this.tileSize, health: 100 },
                { id: 'ore_3', type: 'coal',     x: 22 * this.tileSize, y: 24 * this.tileSize, health: 100 },
                { id: 'ore_4', type: 'void_crystal', x: 26 * this.tileSize, y: 16 * this.tileSize, health: 150 }
            ];
            this.caveBats = [
                { id: 'bat_1', x: 16 * this.tileSize, y: 14 * this.tileSize, health: 25 },
                { id: 'bat_2', x: 20 * this.tileSize, y: 22 * this.tileSize, health: 25 }
            ];
        }

        // ── 4.2. Генерація припливних мілин ───────────────────────
        initTidePools() {
            this.tidePools = [];
            for (let i = 0; i < 6; i++) {
                this.tidePools.push({
                    x: (20 + i * 14) * this.tileSize,
                    y: 8 * this.tileSize,
                    searched: false
                });
            }
        }

        // ── 4.3. Оновлення щокадру ────────────────────────────────
        update(dt) {
            const player = this.game.player;
            if (!player) return;

            // 1. Оновлення кулінарних бафів
            this.updateBuffs(dt, player);

            // 2. Оновлення фермерства
            this.updateCrops(dt);

            // 3. Оновлення риболовлі
            this.updateFishing(dt, player);

            // 4. Оновлення болота
            this.updateSwamp(dt, player);

            // 5. Оновлення припливів
            this.updateTides(dt);

            // 6. Оновлення оглядової вежі / маяка
            this.lighthouseBeamAngle += dt * 0.8;

            // 7. Оновлення кислотного дощу / попелопаду
            this.updateAshfall(dt, player);

            // 8. Перевірка очок навичок
            this.checkPerkPoints(player);

            // 9. Перевірка храмових плит
            this.updateTemplePlates(player);

            // 10. Перевірка рюкзаків у інвентарі
            this.updateBackpacks(player);
        }

        // ── 4.4. Риболовля з поплавком ─────────────────────────────
        startFishing(player) {
            if (!player.equippedTool || window.ITEM_DB[player.equippedTool]?.toolType !== 'fishing') {
                this.game.showNotification('Екіпіруйте вудку для риболовлі!', 'warning');
                return;
            }

            // Шукаємо воду перед гравцем
            const fAngle = [Math.PI/2, Math.PI, 0, -Math.PI/2][player.direction || 0];
            const dist = 55;
            const targetX = player.x + Math.cos(fAngle) * dist;
            const targetY = player.y + Math.sin(fAngle) * dist;

            const tX = Math.floor(targetX / this.tileSize);
            const tY = Math.floor(targetY / this.tileSize);
            const tile = this.game.world ? this.game.world.getTile(tX, tY) : 0;

            if (tile > 1) { // не вода
                this.game.showNotification('Закидайте вудку у воду (океан або річку)!', 'info');
                return;
            }

            this.fishingState.active = true;
            this.fishingState.castTime = Date.now();
            this.fishingState.floatX = targetX;
            this.fishingState.floatY = targetY;
            this.fishingState.isBiting = false;
            this.fishingState.catchWindow = 0;
            this.fishingState.biteTime = 2.5 + Math.random() * 3.5; // клюне через 2.5-6 сек

            this.game.showNotification('🎣 Вудку закинуто... Слідкуйте за поплавком!', 'info');
            if (window.soundSystem) window.soundSystem.playSplash();
        }

        updateFishing(dt, player) {
            const fs = this.fishingState;
            if (!fs.active) return;

            // Якщо гравець пішов надто далеко — змотуємо
            if (Math.hypot(player.x - fs.floatX, player.y - fs.floatY) > 110) {
                fs.active = false;
                this.game.showNotification('Волосінь натяглася та змоталася.', 'info');
                return;
            }

            // Кола на воді навколо поплавка
            if (Math.random() < dt * 3) {
                fs.ripples.push({ x: fs.floatX, y: fs.floatY, r: 2, alpha: 0.8 });
            }
            for (let i = fs.ripples.length - 1; i >= 0; i--) {
                const rp = fs.ripples[i];
                rp.r += dt * 14;
                rp.alpha -= dt * 0.9;
                if (rp.alpha <= 0) fs.ripples.splice(i, 1);
            }

            if (!fs.isBiting) {
                fs.biteTime -= dt;
                if (fs.biteTime <= 0) {
                    fs.isBiting = true;
                    fs.catchWindow = 1.8; // 1.8 секунди на підсікання!
                    this.game.showNotification('⚡ КЛЮЄ! Тисніть ПРОБІЛ або [E] прямо зараз!', 'warning');
                    if (window.soundSystem) window.soundSystem.playSplash();
                }
            } else {
                fs.catchWindow -= dt;
                if (fs.catchWindow <= 0) {
                    fs.active = false;
                    fs.isBiting = false;
                    this.game.showNotification('Рихва зірвалася з гачка!', 'error');
                }
            }
        }

        catchFish(player) {
            const fs = this.fishingState;
            if (!fs.active) return false;

            if (fs.isBiting && fs.catchWindow > 0) {
                fs.active = false;
                fs.isBiting = false;

                // Визначаємо улов за рідкістю
                const roll = Math.random();
                let catchId = 'fish';
                let xp = 15;

                if (roll < 0.08) {
                    catchId = 'golden_trout';
                    xp = 60;
                } else if (roll < 0.22) {
                    catchId = 'swordfish';
                    xp = 45;
                } else if (roll < 0.40) {
                    catchId = 'electric_eel';
                    xp = 30;
                } else if (roll < 0.65) {
                    catchId = 'sea_bass';
                    xp = 20;
                }

                player.inventory.addItem(catchId, 1);
                player.addXP(xp);
                this.game.showNotification(`🎉 Вдале підсікання! Спіймано: ${window.ITEM_DB[catchId]?.name || catchId}!`, 'success');
                this.game.spawnParticles(fs.floatX, fs.floatY, '#38BDF8', 20);
                if (window.soundSystem) window.soundSystem.playPickup();
                return true;
            } else {
                fs.active = false;
                this.game.showNotification('Зарано підсікли! Риба ще не клюнула.', 'info');
                return true;
            }
        }

        // ── 4.5. Казанок і кулінарія ──────────────────────────────
        openCookingUI() {
            let modal = document.getElementById('cooking-modal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'cooking-modal';
                modal.className = 'modal';
                modal.style.position = 'fixed';
                modal.style.top = '0'; modal.style.left = '0';
                modal.style.width = '100vw'; modal.style.height = '100vh';
                modal.style.background = 'rgba(0,0,0,0.85)';
                modal.style.display = 'flex'; modal.style.alignItems = 'center'; modal.style.justifyContent = 'center';
                modal.style.zIndex = '100';
                document.body.appendChild(modal);
            }

            modal.innerHTML = `
                <div style="background: linear-gradient(135deg, #1E293B, #0F172A); border: 2px solid #F59E0B; border-radius: 14px; padding: 24px; max-width: 520px; width: 90%; color: #F1F5F9; box-shadow: 0 8px 32px rgba(245,158,11,0.3); position: relative;">
                    <button id="btn-close-cooking" style="position: absolute; top: 12px; right: 16px; background: transparent; border: none; color: #94A3B8; font-size: 24px; cursor: pointer;">&times;</button>
                    <h2 style="color: #F59E0B; margin-top: 0;">🍲 Польовий казанок</h2>
                    <p style="color: #94A3B8; font-size: 0.95rem;">Змішуйте свіжі інгредієнти та готуйте страви із тривалими бафами!</p>
                    <div id="cooking-recipes" style="display: flex; flex-direction: column; gap: 10px; max-height: 320px; overflow-y: auto;"></div>
                </div>
            `;

            const list = modal.querySelector('#cooking-recipes');
            const recipes = [
                { id: 'fish_stew', name: 'Поживна юшка', mats: '2x Риба, 1x Вода, 1x Гриб', cost: [{id:'fish',n:2},{id:'water',n:1},{id:'mushroom',n:1}], buff: 'Швидке плавання (+40%) на 3 хв' },
                { id: 'meat_stew', name: 'Мисливське рагу', mats: '2x М\'ясо, 2x Ягоди, 1x Вода', cost: [{id:'meat',n:2},{id:'berry',n:2},{id:'water',n:1}], buff: 'Сила ведмедя (+35% шкоди) на 3 хв' },
                { id: 'veggie_soup', name: 'Цілющий відвар', mats: '2x Водорості, 2x Гриби, 2x Ягоди', cost: [{id:'seaweed',n:2},{id:'mushroom',n:2},{id:'berry',n:2}], buff: 'Регенерація здоров\'я (+2 HP/с) на 2 хв' },
                { id: 'energizing_brew', name: 'Еліксир бадьорості', mats: '2x Кокос, 1x Вода', cost: [{id:'coconut',n:2},{id:'water',n:1}], buff: 'Нескінченна витривалість на 2 хв' }
            ];

            const inv = this.game.player.inventory;
            recipes.forEach(r => {
                const canCook = r.cost.every(c => inv.hasItem(c.id, c.n));
                const row = document.createElement('div');
                row.style.background = 'rgba(255,255,255,0.06)';
                row.style.padding = '10px 14px';
                row.style.borderRadius = '8px';
                row.style.display = 'flex';
                row.style.justifyContent = 'space-between';
                row.style.alignItems = 'center';

                row.innerHTML = `
                    <div>
                        <b style="color:#FEF08A;">${r.name}</b><br>
                        <span style="font-size:0.85rem; color:#94A3B8;">Інгредієнти: ${r.mats}</span><br>
                        <span style="font-size:0.85rem; color:#34D399;">✨ Ефект: ${r.buff}</span>
                    </div>
                    <button class="cook-btn" style="background:${canCook ? '#F59E0B' : '#475569'}; color:#000; font-weight:bold; border:none; padding:8px 16px; border-radius:6px; cursor:${canCook ? 'pointer' : 'not-allowed'};" ${canCook ? '' : 'disabled'}>Зварити</button>
                `;

                if (canCook) {
                    row.querySelector('.cook-btn').onclick = () => {
                        r.cost.forEach(c => inv.removeItem(c.id, c.n));
                        inv.addItem(r.id, 1);
                        this.game.showNotification(`🍲 Зварено: ${r.name}!`, 'success');
                        this.game.spawnParticles(this.game.player.x, this.game.player.y, '#F59E0B', 15);
                        if (window.soundSystem) window.soundSystem.playCraft();
                        modal.style.display = 'none';
                    };
                }
                list.appendChild(row);
            });

            modal.classList.remove('hidden');
            modal.style.display = 'flex';
            modal.querySelector('#btn-close-cooking').onclick = () => { modal.style.display = 'none'; };
        }

        applyFoodBuff(itemId) {
            if (itemId === 'fish_stew') {
                this.activeBuffs.swimSpeed = 180;
                this.game.showNotification('✨ Баф активовано: «Швидке плавання (+40%)» на 3 хвилини!', 'success');
            } else if (itemId === 'meat_stew') {
                this.activeBuffs.attackBonus = 180;
                this.game.showNotification('✨ Баф активовано: «Сила ведмедя (+35% шкоди)» на 3 хвилини!', 'success');
            } else if (itemId === 'veggie_soup') {
                this.activeBuffs.regenHp = 120;
                this.game.showNotification('✨ Баф активовано: «Швидка регенерація здоров\'я» на 2 хвилини!', 'success');
            } else if (itemId === 'energizing_brew') {
                this.activeBuffs.infiniteStamina = 120;
                this.game.showNotification('✨ Баф активовано: «Нескінченна витривалість» на 2 хвилини!', 'success');
            }
        }

        updateBuffs(dt, player) {
            const b = this.activeBuffs;
            if (b.swimSpeed > 0) b.swimSpeed -= dt;
            if (b.attackBonus > 0) b.attackBonus -= dt;
            if (b.infiniteStamina > 0) {
                b.infiniteStamina -= dt;
                player.energy = player.maxEnergy; // не вичерпується!
            }
            if (b.regenHp > 0) {
                b.regenHp -= dt;
                player.health = Math.min(player.maxHealth, player.health + 2 * dt);
            }
        }

        // ── 4.6. Реальний ріст фермерства ─────────────────────────
        plantSeed(buildingId, seedType) {
            this.crops.set(buildingId, {
                type: seedType,
                stage: 0, // 0=насіння, 1=паросток, 2=цвітіння, 3=дозріло
                timer: 45, // секунд до наступної стадії
                watered: false
            });
            this.game.showNotification('🌱 Насіння посаджено на грядку!', 'info');
        }

        waterGarden(buildingId) {
            const crop = this.crops.get(buildingId);
            if (crop && !crop.watered) {
                crop.watered = true;
                crop.timer *= 0.5; // полив удвічі прискорює ріст!
                this.game.showNotification('💧 Грядку полито! Швидкість росту подвоєна.', 'success');
                if (window.soundSystem) window.soundSystem.playSplash();
            }
        }

        updateCrops(dt) {
            const isRaining = this.game.weatherSystem && (this.game.weatherSystem.current === 'rain' || this.game.weatherSystem.current === 'heavy_rain');
            this.crops.forEach((crop, bId) => {
                // Дощ автоматично поливає всі грядки
                if (isRaining && !crop.watered) {
                    crop.watered = true;
                    crop.timer *= 0.5;
                }

                if (crop.stage < 3) {
                    crop.timer -= dt;
                    if (crop.timer <= 0) {
                        crop.stage++;
                        crop.timer = crop.watered ? 25 : 50;
                        crop.watered = false; // потребує нового поливу для наступної стадії
                    }
                }
            });
        }

        harvestCrop(buildingId, player) {
            const crop = this.crops.get(buildingId);
            if (!crop) return false;

            if (crop.stage >= 3) {
                let produceId = 'berry';
                let seedId = 'berry_seeds';
                if (crop.type === 'potato_seed') { produceId = 'potato'; seedId = 'potato_seed'; }
                if (crop.type === 'corn_seed') { produceId = 'corn'; seedId = 'corn_seed'; }

                player.inventory.addItem(produceId, 3 + Math.floor(Math.random() * 2));
                player.inventory.addItem(seedId, 2);
                player.addXP(25);

                this.crops.delete(buildingId);
                this.game.showNotification(`🌾 Зібрано врожай: ${window.ITEM_DB[produceId]?.name || produceId}!`, 'success');
                this.game.spawnParticles(player.x, player.y, '#2ECC71', 20);
                if (window.soundSystem) window.soundSystem.playPickup();
                return true;
            } else {
                this.game.showNotification(`Рослина ще росте (Стадія ${crop.stage + 1}/4). Потрібно полити!`, 'info');
                return true;
            }
        }

        // ── 4.7. Болотяний біом та п'явки ──────────────────────────
        updateSwamp(dt, player) {
            const sz = this.swampZone;
            const inSwamp = player.x >= sz.minX && player.x <= sz.maxX && player.y >= sz.minY && player.y <= sz.maxY;

            if (inSwamp && !player.inBoat) {
                // Сповільнення руху в трясовині на 40%
                player.speed = (player.baseSpeed || 140) * 0.6;

                // Напад п'явок раз на 35 секунд
                this.leechTimer += dt;
                if (this.leechTimer > 35) {
                    this.leechTimer = 0;
                    player.health = Math.max(5, player.health - 8);
                    this.game.showNotification('🩸 До вас присмокталися болотні п\'явки! Використайте пов\'язку або вийдіть з трясовини.', 'danger');
                    this.game.spawnParticles(player.x, player.y, '#DC2626', 10);
                }
            } else {
                if (player.baseSpeed) player.speed = player.baseSpeed;
                this.leechTimer = Math.max(0, this.leechTimer - dt);
            }
        }

        // ── 4.8. Стародавній храм і головоломка з 3 плитами ─────────
        updateTemplePlates(player) {
            const t = this.temple;
            let pressedCount = 0;

            t.plates.forEach(p => {
                const plateWorldX = t.x + p.relX;
                const plateWorldY = t.y + p.relY;
                const dPlayer = Math.hypot(player.x - plateWorldX, player.y - plateWorldY);

                // Плита активується якщо гравець стоїть або пес стоїть або камінь
                let active = dPlayer < 24;

                // Перевірка собаки-компаньйона
                if (this.game.animalManager && this.game.animalManager.dogs) {
                    const nearDog = this.game.animalManager.dogs.some(dog => Math.hypot(dog.x - plateWorldX, dog.y - plateWorldY) < 24);
                    if (nearDog) active = true;
                }

                p.pressed = active;
                if (p.pressed) pressedCount++;
            });

            if (pressedCount === 3 && !t.doorOpen) {
                t.doorOpen = true;
                this.game.showNotification('🏛️ Всі 3 плити затиснуто! Кам\'яна брама храму з гуркотом опустилася!', 'success');
                if (window.soundSystem) window.soundSystem.playMine();
                this.game.spawnParticles(t.x, t.y, '#F59E0B', 40);
            }
        }

        // ── 4.9. Вцілілі пасажири літака ───────────────────────────
        talkToSurvivor(survivor, player) {
            if (!survivor.recruited) {
                survivor.recruited = true;
                this.game.showNotification(`🤝 ${survivor.name} приєднався до вашого табору!`, 'success');
                player.addXP(100);
            }

            // Щоденна користь
            if (survivor.role === 'medic') {
                player.health = player.maxHealth;
                player.inventory.addItem('bandage', 2);
                this.game.showNotification('🩺 Олена повністю перев\'язала ваші рани та дала 2 пов\'язки!', 'success');
            } else if (survivor.role === 'builder') {
                player.inventory.addItem('plank', 4);
                this.game.showNotification('🪓 Михайло передав вам 4 оброблені дошки!', 'success');
            } else if (survivor.role === 'hunter') {
                player.inventory.addItem('meat', 3);
                player.inventory.addItem('ammo', 10);
                this.game.showNotification('🏹 Артем поділився свіжим м\'ясом та набоями!', 'success');
            }
            if (window.soundSystem) window.soundSystem.playPickup();
        }

        // ── 4.10. Припливи та відпливи ─────────────────────────────
        updateTides(dt) {
            if (!this.game.timeSystem) return;
            const hour = this.game.timeSystem.hour;
            // Відплив найнижчий о 13:00 (сонце в зеніті), приплив найвищий о 01:00 ночі
            this.tideHeight = Math.sin((hour - 7) / 24 * Math.PI * 2);
        }

        // ── 4.11. Вулканічний попелопад ────────────────────────────
        updateAshfall(dt, player) {
            if (this.ashfallActive) {
                this.ashfallTimer -= dt;
                if (this.ashfallTimer <= 0) {
                    this.ashfallActive = false;
                    this.game.showNotification('☀️ Вулканічний попелопад завершився. Повітря знову чисте!', 'success');
                } else {
                    // Якщо гравець просто неба без укриття — втрата здоров'я
                    const underRoof = this.isUnderRoof(player.x, player.y);
                    if (!underRoof) {
                        player.health = Math.max(1, player.health - 1.2 * dt);
                        if (Math.random() < dt * 4) {
                            this.game.spawnParticles(player.x + (Math.random()*40-20), player.y + (Math.random()*40-20), '#78350F', 2);
                        }
                    }
                }
            } else {
                // Шанс початку попелопаду раз на кілька ігрових днів
                if (Math.random() < 0.00015 * dt * 60) {
                    this.ashfallActive = true;
                    this.ashfallTimer = 90; // 1.5 хвилини попелопаду
                    this.game.showNotification('🌋 УВАГА! Насувається вулканічний попелопад! Сховайтеся під дах будівлі!', 'danger');
                }
            }
        }

        isUnderRoof(px, py) {
            if (!this.game.buildingSystem) return false;
            return this.game.buildingSystem.buildings.some(b =>
                (b.type === 'shelter' || b.type === 'wooden_house') &&
                Math.hypot(b.x - px, b.y - py) < 55
            );
        }

        // ── 4.12. Дерево навичок (Перки) ───────────────────────────
        checkPerkPoints(player) {
            if (player.level > this.lastLevelChecked) {
                const gained = player.level - this.lastLevelChecked;
                this.unspentPerkPoints += gained;
                this.lastLevelChecked = player.level;
                this.game.showNotification(`🌟 Отримано очко навичок (${this.unspentPerkPoints} доступно)! Натисніть [P] для прокачки.`, 'success');
            }
        }

        openPerksUI() {
            let modal = document.getElementById('perks-modal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'perks-modal';
                modal.className = 'modal';
                modal.style.position = 'fixed';
                modal.style.top = '0'; modal.style.left = '0';
                modal.style.width = '100vw'; modal.style.height = '100vh';
                modal.style.background = 'rgba(0,0,0,0.85)';
                modal.style.display = 'flex'; modal.style.alignItems = 'center'; modal.style.justifyContent = 'center';
                modal.style.zIndex = '100';
                document.body.appendChild(modal);
            }

            const pList = [
                { id: 'ironStomach', name: 'Міцний шлунок', desc: 'Повний імунітет до отруєння сирою їжею' },
                { id: 'scout',       name: 'Слідопит',      desc: 'Витривалість витрачається на 40% повільніше' },
                { id: 'sturdy',      name: 'Загартований',  desc: 'Максимальне здоров\'я збільшено на +30 HP' },
                { id: 'lumberjack',  name: 'Лісоруб',       desc: 'Дерева рубаються вдвічі швидше + бонусні гілки' },
                { id: 'miner',       name: 'Шахтар',        desc: 'Шанс знайти кристал при видобутку руди' },
                { id: 'sniper',      name: 'Снайпер',       desc: 'Дальність стрільби вогнепальної зброї +30%' },
                { id: 'sprinter',    name: 'Спринтер',      desc: 'Швидкість пересування збільшена на +20%' }
            ];

            modal.innerHTML = `
                <div style="background: linear-gradient(145deg, #0F172A, #1E1B4B); border: 2px solid #8B5CF6; border-radius: 16px; padding: 24px; max-width: 550px; width: 90%; color: #E2E8F0; box-shadow: 0 10px 40px rgba(139,92,246,0.4); position: relative;">
                    <button id="btn-close-perks" style="position: absolute; top: 12px; right: 16px; background: transparent; border: none; color: #94A3B8; font-size: 24px; cursor: pointer;">&times;</button>
                    <h2 style="color: #C084FC; margin-top: 0;">🌟 Дерево навичок виживальника</h2>
                    <p style="color: #94A3B8;">Доступно очок навичок: <b id="perk-points-val" style="color: #FACC15; font-size: 1.2rem;">${this.unspentPerkPoints}</b></p>
                    <div id="perks-container" style="display: flex; flex-direction: column; gap: 8px; max-height: 340px; overflow-y: auto;"></div>
                </div>
            `;

            const container = modal.querySelector('#perks-container');
            pList.forEach(item => {
                const unlocked = this.perks[item.id];
                const canUnlock = !unlocked && this.unspentPerkPoints > 0;

                const row = document.createElement('div');
                row.style.background = unlocked ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.05)';
                row.style.border = unlocked ? '1px solid #10B981' : '1px solid rgba(255,255,255,0.1)';
                row.style.padding = '10px 14px';
                row.style.borderRadius = '8px';
                row.style.display = 'flex';
                row.style.justifyContent = 'space-between';
                row.style.alignItems = 'center';

                row.innerHTML = `
                    <div>
                        <b style="color: ${unlocked ? '#34D399' : '#F1F5F9'};">${item.name}</b> ${unlocked ? '✅' : ''}<br>
                        <span style="font-size: 0.85rem; color: #94A3B8;">${item.desc}</span>
                    </div>
                    <button class="unlock-btn" style="background: ${unlocked ? '#10B981' : canUnlock ? '#8B5CF6' : '#475569'}; color: #fff; font-weight: bold; border: none; padding: 6px 14px; border-radius: 6px; cursor: ${canUnlock ? 'pointer' : 'default'};" ${canUnlock ? '' : 'disabled'}>
                        ${unlocked ? 'Вивчено' : 'Вивчити (1 очко)'}
                    </button>
                `;

                if (canUnlock) {
                    row.querySelector('.unlock-btn').onclick = () => {
                        this.perks[item.id] = true;
                        this.unspentPerkPoints--;
                        this.applyPerkEffect(item.id, this.game.player);
                        this.openPerksUI(); // перевідкриваємо оновлене
                    };
                }
                container.appendChild(row);
            });

            modal.style.display = 'flex';
            modal.querySelector('#btn-close-perks').onclick = () => { modal.style.display = 'none'; };
        }

        applyPerkEffect(perkId, player) {
            if (perkId === 'sturdy') {
                player.maxHealth += 30;
                player.health += 30;
            } else if (perkId === 'sprinter') {
                player.speed = (player.speed || 140) * 1.2;
                player.baseSpeed = player.speed;
            }
            this.game.showNotification(`✨ Навичку активовано: ${perkId}!`, 'success');
            if (window.soundSystem) window.soundSystem.playPickup();
        }

        // ── 4.13. Рюкзаки та розширення інвентарю ──────────────────
        updateBackpacks(player) {
            const inv = player.inventory;
            if (!inv) return;

            if (inv.hasItem('military_backpack') && this.equippedBackpack !== 'military') {
                this.equippedBackpack = 'military';
                this.expandInventorySlots(inv, 50);
                this.game.showNotification('🎒 Екіпіровано військовий тактичний рюкзак (50 слотів)!', 'success');
            } else if (inv.hasItem('leather_backpack') && this.equippedBackpack === 'default') {
                this.equippedBackpack = 'leather';
                this.expandInventorySlots(inv, 40);
                this.game.showNotification('🎒 Екіпіровано шкіряний рюкзак (40 слотів)!', 'success');
            }
        }

        expandInventorySlots(inv, newCount) {
            if (inv.maxSlots >= newCount) return;
            const diff = newCount - inv.maxSlots;
            for (let i = 0; i < diff; i++) inv.slots.push(null);
            inv.maxSlots = newCount;
            if (window.updateInventoryUI) window.updateInventoryUI();
        }

        // ── 4.14. Взаємодія [E] ────────────────────────────────────
        handleInteraction() {
            const player = this.game.player;
            if (!player) return false;

            // 1. Риболовля (якщо клює — підсікаємо)
            if (this.fishingState.active) {
                return this.catchFish(player);
            }

            // 2. Вхід / Вихід з печери
            if (!this.inCave && Math.hypot(player.x - this.caveEntrance.x, player.y - this.caveEntrance.y) < 60) {
                this.inCave = true;
                player.x = this.caveExit.x + 30;
                player.y = this.caveExit.y + 30;
                this.game.showNotification('⛏️ Ви спустилися в темну закинуту шахту острова...', 'info');
                return true;
            }
            if (this.inCave && Math.hypot(player.x - this.caveExit.x, player.y - this.caveExit.y) < 60) {
                this.inCave = false;
                player.x = this.caveEntrance.x + 30;
                player.y = this.caveEntrance.y + 30;
                this.game.showNotification('☀️ Ви піднялися назад на поверхню острова.', 'info');
                return true;
            }

            // 3. Видобуток руди в шахті
            if (this.inCave) {
                for (let ore of this.caveOres) {
                    if (ore.health > 0 && Math.hypot(player.x - ore.x, player.y - ore.y) < 45) {
                        ore.health -= 50;
                        player.inventory.addItem(ore.type, 2);
                        player.addXP(15);
                        this.game.spawnParticles(ore.x, ore.y, '#9CA3AF', 10);
                        if (window.soundSystem) window.soundSystem.playMine();
                        if (ore.health <= 0) this.game.showNotification(`⛏️ Поклади вичерпано! Отримано ${window.ITEM_DB[ore.type]?.name}.`, 'success');
                        return true;
                    }
                }
            }

            // 4. Скриня храму (якщо відкрито)
            if (this.temple.doorOpen && !this.temple.relicLooted && Math.hypot(player.x - this.temple.x, player.y - this.temple.y) < 55) {
                this.temple.relicLooted = true;
                player.inventory.addItem('ancient_relic', 1);
                player.inventory.addItem('gold_coin', 10);
                player.addXP(150);
                this.game.showNotification('🏆 Знайдено Священного Скарабея та 10 золотих монет храму!', 'success');
                this.game.spawnParticles(player.x, player.y, '#F59E0B', 35);
                return true;
            }

            // 5. Розмова з вцілілими пасажирами
            for (let s of this.survivors) {
                if (Math.hypot(player.x - s.x, player.y - s.y) < 55) {
                    this.talkToSurvivor(s, player);
                    return true;
                }
            }

            // 6. Казанок на вогнищі
            if (this.game.buildingSystem) {
                const nearPot = this.game.buildingSystem.buildings.find(b => b.type === 'cooking_pot' && Math.hypot(b.x - player.x, b.y - player.y) < 60);
                if (nearPot) {
                    this.openCookingUI();
                    return true;
                }

                // 7. Збір врожаю з грядки
                const nearGarden = this.game.buildingSystem.buildings.find(b => b.type === 'garden' && Math.hypot(b.x - player.x, b.y - player.y) < 60);
                if (nearGarden) {
                    if (this.crops.has(nearGarden.id)) {
                        return this.harvestCrop(nearGarden.id, player);
                    } else {
                        // Садимо насіння якщо є
                        if (player.inventory.hasItem('potato_seed', 1)) {
                            player.inventory.removeItem('potato_seed', 1);
                            this.plantSeed(nearGarden.id, 'potato_seed');
                            return true;
                        } else if (player.inventory.hasItem('corn_seed', 1)) {
                            player.inventory.removeItem('corn_seed', 1);
                            this.plantSeed(nearGarden.id, 'corn_seed');
                            return true;
                        } else if (player.inventory.hasItem('berry_seeds', 1)) {
                            player.inventory.removeItem('berry_seeds', 1);
                            this.plantSeed(nearGarden.id, 'berry_seeds');
                            return true;
                        }
                    }
                }
            }

            // 8. Пошук на припливних мілинах під час відпливу
            if (this.tideHeight < -0.3) {
                for (let pool of this.tidePools) {
                    if (!pool.searched && Math.hypot(player.x - pool.x, player.y - pool.y) < 45) {
                        pool.searched = true;
                        player.inventory.addItem('sea_shell', 2);
                        if (Math.random() < 0.4) player.inventory.addItem('pearl', 1);
                        player.addXP(15);
                        this.game.showNotification('🐚 На мілині знайдено рідкісні мушлі та морську перлину!', 'success');
                        this.game.spawnParticles(pool.x, pool.y, '#38BDF8', 15);
                        return true;
                    }
                }
            }

            return false;
        }

        // ── 4.15. Відмальовування нових систем на Canvas ───────────
        render(ctx, camera) {
            // 1. Якщо гравець у шахті — малюємо підземелля
            if (this.inCave) {
                this.renderCave(ctx, camera);
                return;
            }

            // 2. Вхід у печеру
            this.renderCaveEntrance(ctx, camera);

            // 3. Стародавній храм та 3 плити
            this.renderTemple(ctx, camera);

            // 4. Поплавок риболовлі
            this.renderFishing(ctx, camera);

            // 5. Вцілілі пасажири
            this.renderSurvivors(ctx, camera);

            // 6. Мілини відпливу
            if (this.tideHeight < -0.3) {
                this.renderTidePools(ctx, camera);
            }

            // 7. Промінь оглядової вежі / маяка
            this.renderLighthouses(ctx, camera);

            // 8. Попіл на екрані при попелопаді
            if (this.ashfallActive) {
                this.renderAshfallParticles(ctx);
            }
        }

        renderFishing(ctx, camera) {
            const fs = this.fishingState;
            if (!fs.active) return;

            // Волосінь від гравця до поплавка
            const pPos = camera.worldToScreen(this.game.player.x, this.game.player.y);
            const fPos = camera.worldToScreen(fs.floatX, fs.floatY);

            ctx.save();
            ctx.strokeStyle = 'rgba(255,255,255,0.7)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(pPos.x, pPos.y - 10);
            ctx.quadraticCurveTo((pPos.x + fPos.x) / 2, Math.min(pPos.y, fPos.y) - 20, fPos.x, fPos.y);
            ctx.stroke();

            // Кола на воді
            for (let rp of fs.ripples) {
                const rpPos = camera.worldToScreen(rp.x, rp.y);
                ctx.strokeStyle = `rgba(255,255,255,${rp.alpha})`;
                ctx.beginPath();
                ctx.ellipse(rpPos.x, rpPos.y, rp.r, rp.r * 0.5, 0, 0, Math.PI * 2);
                ctx.stroke();
            }

            // Червоно-білий поплавок
            const bobY = fs.isBiting ? Math.sin(Date.now() / 60) * 4 : Math.sin(Date.now() / 250) * 1.5;
            ctx.fillStyle = '#EF4444';
            ctx.beginPath();
            ctx.arc(fPos.x, fPos.y + bobY, 4, 0, Math.PI);
            ctx.fill();
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(fPos.x, fPos.y + bobY, 4, Math.PI, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }

        renderCaveEntrance(ctx, camera) {
            if (!camera.isVisible(this.caveEntrance.x, this.caveEntrance.y)) return;
            const pos = camera.worldToScreen(this.caveEntrance.x, this.caveEntrance.y);
            ctx.save();
            ctx.translate(pos.x, pos.y);

            // Темний вхід у скелю
            ctx.fillStyle = '#1F2937';
            ctx.beginPath();
            ctx.arc(0, 0, 24, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#111827';
            ctx.beginPath();
            ctx.arc(0, 4, 18, Math.PI, 0);
            ctx.fill();

            // Табличка
            ctx.fillStyle = '#F59E0B';
            ctx.font = 'bold 11px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('⛏️ ВХІД У ШАХТУ [E]', 0, -28);

            ctx.restore();
        }

        renderCave(ctx, camera) {
            // Темний фон шахти
            ctx.fillStyle = '#0B0F19';
            ctx.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);

            // Вихід зі сходів
            const exitPos = camera.worldToScreen(this.caveExit.x, this.caveExit.y);
            ctx.save();
            ctx.translate(exitPos.x, exitPos.y);
            ctx.fillStyle = '#F59E0B';
            ctx.font = 'bold 11px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('🪜 ВИХІД НАГОРУ [E]', 0, -20);
            ctx.restore();

            // Рудні жили
            for (let ore of this.caveOres) {
                if (ore.health <= 0 || !camera.isVisible(ore.x, ore.y)) continue;
                const pos = camera.worldToScreen(ore.x, ore.y);
                ctx.save();
                ctx.translate(pos.x, pos.y);

                ctx.fillStyle = ore.type === 'void_crystal' ? '#A855F7' : ore.type === 'coal' ? '#1F2937' : '#94A3B8';
                ctx.beginPath();
                ctx.arc(0, 0, 14, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#F1F5F9';
                ctx.font = '9px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(window.ITEM_DB[ore.type]?.name || 'Руда', 0, 24);
                ctx.restore();
            }
        }

        renderTemple(ctx, camera) {
            if (!camera.isVisible(this.temple.x, this.temple.y)) return;
            const pos = camera.worldToScreen(this.temple.x, this.temple.y);
            ctx.save();
            ctx.translate(pos.x, pos.y);

            // Храмова кам'яна підлога
            ctx.fillStyle = '#334155';
            ctx.fillRect(-60, -40, 120, 80);
            ctx.strokeStyle = '#64748B';
            ctx.lineWidth = 2;
            ctx.strokeRect(-60, -40, 120, 80);

            // 3 плити
            this.temple.plates.forEach(p => {
                ctx.fillStyle = p.pressed ? '#10B981' : '#64748B';
                ctx.fillRect(p.relX - 12, p.relY - 12, 24, 24);
                ctx.strokeStyle = p.pressed ? '#34D399' : '#94A3B8';
                ctx.strokeRect(p.relX - 12, p.relY - 12, 24, 24);
            });

            // Брама / Скриня
            ctx.fillStyle = this.temple.doorOpen ? '#F59E0B' : '#1E293B';
            ctx.fillRect(-15, -35, 30, 20);
            ctx.fillStyle = '#F8FAFC';
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(this.temple.doorOpen ? (this.temple.relicLooted ? 'Святилище' : '👑 Скриня [E]') : '🔒 Брама', 0, -42);

            ctx.restore();
        }

        renderSurvivors(ctx, camera) {
            for (let s of this.survivors) {
                if (!camera.isVisible(s.x, s.y)) continue;
                const pos = camera.worldToScreen(s.x, s.y);
                ctx.save();
                ctx.translate(pos.x, pos.y);

                // Тіло поселенця
                ctx.fillStyle = s.role === 'medic' ? '#38BDF8' : s.role === 'builder' ? '#F59E0B' : '#10B981';
                ctx.beginPath();
                ctx.arc(0, -12, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillRect(-6, -4, 12, 16);

                // Ім'я над головою
                ctx.fillStyle = '#F8FAFC';
                ctx.font = 'bold 10px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(`${s.name} [E]`, 0, -25);

                ctx.restore();
            }
        }

        renderTidePools(ctx, camera) {
            for (let p of this.tidePools) {
                if (p.searched || !camera.isVisible(p.x, p.y)) continue;
                const pos = camera.worldToScreen(p.x, p.y);
                ctx.save();
                ctx.translate(pos.x, pos.y);
                ctx.fillStyle = '#F59E0B';
                ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#38BDF8';
                ctx.font = '10px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('🐚 Мілина [E]', 0, -10);
                ctx.restore();
            }
        }

        renderLighthouses(ctx, camera) {
            if (!this.game.buildingSystem) return;
            const towers = this.game.buildingSystem.buildings.filter(b => b.type === 'watchtower');
            towers.forEach(tw => {
                if (!camera.isVisible(tw.x, tw.y)) return;
                const pos = camera.worldToScreen(tw.x, tw.y);
                ctx.save();
                ctx.translate(pos.x, pos.y);

                // Обертовий світловий конус
                ctx.rotate(this.lighthouseBeamAngle);
                ctx.fillStyle = 'rgba(254, 240, 138, 0.22)';
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(240, -45);
                ctx.lineTo(240, 45);
                ctx.closePath();
                ctx.fill();

                ctx.restore();
            });
        }

        renderAshfallParticles(ctx) {
            ctx.save();
            ctx.fillStyle = 'rgba(120, 53, 15, 0.25)';
            ctx.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);
            ctx.restore();
        }

        initUI() {
            // Кнопка навичок [P]
            window.addEventListener('keydown', (e) => {
                if (e.key === 'p' || e.key === 'P' || e.key === 'з' || e.key === 'З') {
                    this.openPerksUI();
                }
            });

            const btnPerks = document.getElementById('btn-toggle-perks');
            if (btnPerks) {
                btnPerks.onclick = () => this.openPerksUI();
            }

            // Перехоплення вживання їжі для надання бафів
            const origUse = window.useItem;
            window.useItem = (itemId) => {
                this.applyFoodBuff(itemId);
                if (origUse) origUse(itemId);
            };
        }
    }

    window.UltimateExpansionSystem = UltimateExpansionSystem;

    // ─── 5. ПАТЧІ В ІГРОВИЙ ЦИКЛ (Game Engine Integration) ───────
    (function patchGameCore() {
        if (!window.Game) return;

        // Патч Game.init
        const origInit = Game.prototype.init;
        Game.prototype.init = function() {
            origInit.call(this);
            this.ultimateSystem = new window.UltimateExpansionSystem(this);
        };

        // Патч Game.loadFromSave — створити систему якщо її немає
        const origLoad = Game.prototype.loadFromSave;
        Game.prototype.loadFromSave = function() {
            origLoad.call(this);
            if (!this.ultimateSystem) {
                this.ultimateSystem = new window.UltimateExpansionSystem(this);
            }
            const raw = window.SaveManager ? window.SaveManager.load() : null;
            if (raw && raw.ultimateSystem) {
                for (const [key, value] of Object.entries(raw.ultimateSystem)) {
                    if (!Object.prototype.hasOwnProperty.call(this.ultimateSystem, key)) continue;
                    this.ultimateSystem[key] = key === 'crops' && Array.isArray(value)
                        ? new Map(value)
                        : value;
                }
            }
        };

        const origSave = Game.prototype.saveGame;
        Game.prototype.saveGame = function() {
            origSave.call(this);
            if (!window.SaveManager || !this.ultimateSystem) return;
            const raw = window.SaveManager.load() || {};
            raw.ultimateSystem = Object.fromEntries(
                Object.entries(this.ultimateSystem)
                    .filter(([key]) => key !== 'game')
                    .map(([key, value]) => [key, key === 'crops' ? Array.from(value.entries()) : value])
            );
            window.SaveManager.rawSave(raw);
        };

        // Патч Game.update
        const origUpdate = Game.prototype.update;
        Game.prototype.update = function(dt) {
            origUpdate.call(this, dt);
            if (this.ultimateSystem) this.ultimateSystem.update(dt);
        };

        // Патч Game.render
        const origRender = Game.prototype.render;
        Game.prototype.render = function() {
            origRender.call(this);
            if (this.ultimateSystem && this.camera) {
                this.ultimateSystem.render(this.ctx, this.camera);
            }
        };

        // Патч взаємодії [E]
        const origInteract = Game.prototype.handleInteraction;
        Game.prototype.handleInteraction = function() {
            if (this.ultimateSystem && this.ultimateSystem.handleInteraction()) return;
            if (origInteract) return origInteract.call(this);
        };

        // Патч атаки або використання інструменту (Вудка)
        const origAttack = Game.prototype.attack;
        Game.prototype.attack = function(...args) {
            const p = this.player;
            if (p && p.equippedTool && window.ITEM_DB[p.equippedTool]?.toolType === 'fishing' && this.ultimateSystem) {
                this.ultimateSystem.startFishing(p);
                return;
            }
            if (origAttack) return origAttack.apply(this, args);
        };
    })();

    console.log('[ultimate-expansion.js] 14 Нових систем успішно активовано ✅');
})();
