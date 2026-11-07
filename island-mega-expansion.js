// ============================================================
// island-mega-expansion.js
// 11 ВЕЛИКИХ НОВИХ СИСТЕМ ТА МЕХАНІК ДЛЯ ГРИ "ОСТРІВ ІЗ НІЧОГО"
// ============================================================

(function() {
    'use strict';

    // ─── 1. НОВІ ПРЕДМЕТИ В ITEM_DB ─────────────────────────────
    if (window.ITEM_DB) {
        const megaItems = {
            // Радіо та навігація
            'radio_scanner':    { id:'radio_scanner',    name:'Радіосканер частот',      icon:'radio',         category:'tool',     maxStack:1,  description:'Перехоплює піратські частоти, SOS та погодні зведення' },
            'eternal_compass':  { id:'eternal_compass',  name:'Вічний компас',          icon:'compass_mystic',category:'tool',     maxStack:1,  description:'Вказує напрямок до найближчого боса або острова-привида' },
            'speed_amulet':     { id:'speed_amulet',     name:'Амулет швидкості',        icon:'amulet_speed',  category:'tool',     maxStack:1,  description:'Пасивний артефакт: збільшує швидкість пересування на 40%' },
            'mystic_crystal':   { id:'mystic_crystal',   name:'Містичний кристал',       icon:'crystal',       category:'resource', maxStack:10, description:'Світиться таємничим світлом острова-привида' },

            // Зброя та вибухівка
            'cutlass':          { id:'cutlass',          name:'Піратська шабля',         icon:'cutlass',       category:'weapon',   maxStack:1,  damage:45, description:'Гостра шабля капітана Чорної Бороди' },
            'dynamite':         { id:'dynamite',         name:'Динамітна шашка',         icon:'dynamite',      category:'weapon',   maxStack:10, description:'Потужна вибухівка з радіусом ураження' },
            'meteor_blade':     { id:'meteor_blade',     name:'Метеоритний клинок',      icon:'meteor_sword',  category:'weapon',   maxStack:1,  damage:65, description:'Викуваний із космічного заліза. Найсильніша зброя' },

            // Броня та матеріали босів
            'volcanic_heart':   { id:'volcanic_heart',   name:'Вулканічне серце',        icon:'lava_heart',    category:'resource', maxStack:1,  description:'Артефакт Лавового Голема. Дарує імунітет до холоду' },
            'obsidian_shard':   { id:'obsidian_shard',   name:'Обсидіановий уламок',     icon:'obsidian',      category:'resource', maxStack:20, description:'Вулканічне скло високої міцності' },
            'giant_crab_shell': { id:'giant_crab_shell', name:'Панцир гігантського краба',icon:'crab_shell',   category:'resource', maxStack:5,  description:'Надміцний панцир морського чудовиська' },
            'chitin_armor':     { id:'chitin_armor',     name:'Хітиновий обладунок',     icon:'chitin_armor',  category:'armor',    maxStack:1,  armor:0.75, description:'Знижує весь отриманий урон на 75%' },
            'meteoric_iron':    { id:'meteoric_iron',    name:'Метеоритне залізо',       icon:'meteor_ore',    category:'resource', maxStack:15, description:'Космічний метал найвищої міцності' },
            'star_armor':       { id:'star_armor',       name:'Зоряний панцир',          icon:'star_armor',    category:'armor',    maxStack:1,  armor:0.85, description:'Легендарний захист від метеоритного металу' },

            // Апгрейди човна
            'boat_chest_item':  { id:'boat_chest_item',  name:'Палубна скриня',          icon:'b_chest',       category:'tool',     maxStack:1,  description:'Встановлює 12 додаткових слотів зберігання на човен' },
            'boat_sail_item':   { id:'boat_sail_item',   name:'Тканинне вітрило',        icon:'b_sail',        category:'tool',     maxStack:1,  description:'Прискорює човен на 35% і зберігає витривалість' },
            'boat_motor_item':  { id:'boat_motor_item',  name:'Підвісний мотор',         icon:'b_motor',       category:'tool',     maxStack:1,  description:'Турбо-швидкість човна (+100%). Споживає пальне' },
            'boat_spotlight_item':{ id:'boat_spotlight_item', name:'Носовий прожектор',  icon:'b_light',       category:'tool',     maxStack:1,  description:'Освітлює шлях човна в темряві та тумані' },

            // Будівлі оборони та енергії
            'auto_turret_item': { id:'auto_turret_item', name:'Кулеметна турель',        icon:'turret_icon',   category:'building', maxStack:2,  placeable:'auto_turret', description:'Автоматично розстрілює ворогів у радіусі 180px' },
            'flame_trap_item':  { id:'flame_trap_item',  name:'Вогнеметна пастка',       icon:'flame_trap_ico',category:'building', maxStack:5,  placeable:'flame_trap',  description:'Спалює нападників струменем полум\'я' },
            'spiked_moat_item': { id:'spiked_moat_item', name:'Рів із кілками',          icon:'moat_icon',     category:'building', maxStack:10, placeable:'spiked_moat', description:'Сповільнює ворогів і завдає їм шкоди' },
            'wind_turbine_item':{ id:'wind_turbine_item',name:'Вітрогенератор',          icon:'wind_icon',     category:'building', maxStack:2,  placeable:'wind_turbine',description:'Виробляє 15 Вт енергії цілодобово (35 Вт у шторм)' },
            'water_wheel_item': { id:'water_wheel_item', name:'Гідроколесо',             icon:'hydro_icon',    category:'building', maxStack:2,  placeable:'water_wheel', description:'Виробляє 12 Вт енергії від хвиль на березі' },
            'diving_bell_item': { id:'diving_bell_item', name:'Водолазний дзвін',        icon:'diving_bell_ico',category:'building',maxStack:1, placeable:'diving_bell', description:'Дозволяє занурюватися на дно океану' },

            // Документи та розслідування (ЛОР)
            'black_box_1':      { id:'black_box_1',      name:'Чорна скринька літака',   icon:'blackbox',      category:'resource', maxStack:1,  description:'Запис переговорів пілотів рейсу 404' },
            'pilot_diary':      { id:'pilot_diary',      name:'Щоденник капітана',       icon:'pilotlog',      category:'resource', maxStack:1,  description:'Записи про дивну електромагнітну аномалію' },
            'passenger_letter': { id:'passenger_letter', name:'Лист пасажира',           icon:'letter',        category:'resource', maxStack:1,  description:'Таємниче повідомлення про схований бункер' },
            'scientist_notes':  { id:'scientist_notes',  name:'Записки експедиції',      icon:'notes',         category:'resource', maxStack:1,  description:'Дослідження острова-привида та вірусного туману' }
        };
        Object.assign(window.ITEM_DB, megaItems);
    }

    // ─── 2. НОВІ РЕЦЕПТИ В RECIPE_DB ────────────────────────────
    if (window.RECIPE_DB) {
        const megaRecipes = {
            'radio_scanner':     { id:'radio_scanner',     name:'Радіосканер',          result:{id:'radio_scanner',count:1},     materials:[{id:'metal_scrap',count:4},{id:'electronics',count:3},{id:'battery_item',count:1}], requires:'workbench' },
            'dynamite':          { id:'dynamite',          name:'Динамітна шашка',      result:{id:'dynamite',count:2},          materials:[{id:'gunpowder',count:3},{id:'fiber',count:2},{id:'rope',count:1}],               requires:'workbench' },
            'chitin_armor':      { id:'chitin_armor',      name:'Хітиновий обладунок',  result:{id:'chitin_armor',count:1},      materials:[{id:'giant_crab_shell',count:1},{id:'rope',count:3},{id:'fiber',count:6}],       requires:'workbench' },
            'meteor_blade':      { id:'meteor_blade',      name:'Метеоритний клинок',   result:{id:'meteor_blade',count:1},      materials:[{id:'meteoric_iron',count:3},{id:'wood',count:2},{id:'rope',count:2}],             requires:'workbench' },
            'star_armor':        { id:'star_armor',        name:'Зоряний панцир',       result:{id:'star_armor',count:1},        materials:[{id:'meteoric_iron',count:5},{id:'metal_armor',count:1}],                          requires:'workbench' },

            'boat_chest_item':   { id:'boat_chest_item',   name:'Палубна скриня',       result:{id:'boat_chest_item',count:1},   materials:[{id:'plank',count:6},{id:'metal_scrap',count:3}],                                   requires:'workbench' },
            'boat_sail_item':    { id:'boat_sail_item',    name:'Тканинне вітрило',     result:{id:'boat_sail_item',count:1},    materials:[{id:'fiber',count:16},{id:'branch',count:8},{id:'rope',count:4}],                  requires:'workbench' },
            'boat_motor_item':   { id:'boat_motor_item',   name:'Підвісний мотор',      result:{id:'boat_motor_item',count:1},   materials:[{id:'metal_scrap',count:8},{id:'electronics',count:3},{id:'fuel',count:2}],         requires:'workbench' },
            'boat_spotlight_item':{ id:'boat_spotlight_item', name:'Носовий прожектор', result:{id:'boat_spotlight_item',count:1},materials:[{id:'glass_shard',count:4},{id:'electronics',count:2},{id:'metal_scrap',count:2}], requires:'workbench' },

            'auto_turret_item':  { id:'auto_turret_item',  name:'Кулеметна турель',     result:{id:'auto_turret_item',count:1},  materials:[{id:'machinegun',count:1},{id:'electronics',count:4},{id:'metal_scrap',count:6}], requires:'workbench' },
            'flame_trap_item':   { id:'flame_trap_item',   name:'Вогнеметна пастка',    result:{id:'flame_trap_item',count:2},   materials:[{id:'fuel',count:2},{id:'metal_scrap',count:4},{id:'electronics',count:1}],       requires:'workbench' },
            'spiked_moat_item':  { id:'spiked_moat_item',  name:'Рів із кілками',       result:{id:'spiked_moat_item',count:2},  materials:[{id:'branch',count:8},{id:'stone',count:4}],                                        requires:null },
            'wind_turbine_item': { id:'wind_turbine_item', name:'Вітрогенератор',       result:{id:'wind_turbine_item',count:1}, materials:[{id:'metal_scrap',count:8},{id:'electronics',count:3},{id:'plank',count:4}],     requires:'workbench' },
            'water_wheel_item':  { id:'water_wheel_item',  name:'Гідроколесо',          result:{id:'water_wheel_item',count:1},  materials:[{id:'plank',count:10},{id:'metal_scrap',count:4},{id:'rope',count:3}],            requires:'workbench' },
            'diving_bell_item':  { id:'diving_bell_item',  name:'Водолазний дзвін',     result:{id:'diving_bell_item',count:1},  materials:[{id:'metal_scrap',count:8},{id:'glass_shard',count:4},{id:'rope',count:4}],      requires:'workbench' }
        };
        Object.assign(window.RECIPE_DB, megaRecipes);
    }

    // ─── 3. НОВІ БУДІВЛІ В BUILDING_DB ──────────────────────────
    if (window.BUILDING_DB) {
        const megaBuildings = {
            'auto_turret':   { id:'auto_turret',   name:'Кулеметна турель',  width:36, height:36, passable:false, maxHealth:250, description:'Автоматично стріляє у ворогів',   func:'turret' },
            'flame_trap':    { id:'flame_trap',    name:'Вогнеметна пастка', width:32, height:32, passable:true,  maxHealth:150, description:'Випускає струмінь вогню',      func:'trap' },
            'spiked_moat':   { id:'spiked_moat',   name:'Рів із кілками',    width:32, height:32, passable:true,  maxHealth:200, description:'Сповільнює і ранить ворогів',  func:'trap' },
            'wind_turbine':  { id:'wind_turbine',  name:'Вітрогенератор',    width:44, height:44, passable:false, maxHealth:200, description:'Генерує 15-35 Вт енергії',     func:'power_wind' },
            'water_wheel':   { id:'water_wheel',   name:'Гідроколесо',       width:44, height:44, passable:false, maxHealth:200, description:'Генерує 12 Вт від хвиль води', func:'power_hydro' },
            'diving_bell':   { id:'diving_bell',   name:'Водолазний дзвін',  width:48, height:48, passable:false, maxHealth:300, description:'Вхід у глибоководний режим',    func:'dive' }
        };
        Object.assign(window.BUILDING_DB, megaBuildings);
    }

    // ─── 4. ЗВУКОВИЙ СИНТЕЗАТОР ДЛЯ НОВИХ СИСТЕМ ────────────────
    const MegaAudio = {
        playTone(freq = 440, duration = 0.1, type = 'sine', volume = 0.2) {
            try {
                if (!window.soundSystem || !window.soundSystem.soundEnabled) return;
                const ctx = window.soundSystem.getAudioContext();
                if (!ctx) return;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = type;
                osc.frequency.setValueAtTime(freq, ctx.currentTime);
                gain.gain.setValueAtTime(volume, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + duration);
            } catch (e) {}
        },
        playExplosion() {
            try {
                if (!window.soundSystem || !window.soundSystem.soundEnabled) return;
                const ctx = window.soundSystem.getAudioContext();
                if (!ctx) return;
                const bufferSize = ctx.sampleRate * 0.8;
                const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.2));
                }
                const noise = ctx.createBufferSource();
                noise.buffer = buffer;
                const filter = ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(300, ctx.currentTime);
                filter.frequency.linearRampToValueAtTime(40, ctx.currentTime + 0.8);
                const gain = ctx.createGain();
                gain.gain.setValueAtTime(0.5, ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.8);
                noise.connect(filter);
                filter.connect(gain);
                gain.connect(ctx.destination);
                noise.start();
            } catch (e) {}
        },
        playMorse() {
            MegaAudio.playTone(800, 0.08, 'sine', 0.15);
        },
        playStatic() {
            try {
                if (!window.soundSystem || !window.soundSystem.soundEnabled) return;
                const ctx = window.soundSystem.getAudioContext();
                if (!ctx) return;
                const bufferSize = ctx.sampleRate * 0.25;
                const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.08;
                const noise = ctx.createBufferSource();
                noise.buffer = buffer;
                noise.connect(ctx.destination);
                noise.start();
            } catch (e) {}
        },
        playBossRoar() {
            MegaAudio.playTone(90, 0.6, 'sawtooth', 0.35);
        },
        playSonar() {
            MegaAudio.playTone(1200, 0.4, 'sine', 0.2);
        }
    };
    window.MegaAudio = MegaAudio;

    // ─── 5. ПОВНИЙ КОМПЛЕКС 11 НОВИХ СИСТЕМ ─────────────────────
    class MegaExpansionSystem {
        constructor(game) {
            this.game = game;

            // 1. Острів-привид (Phantom Island)
            this.phantomActive = false;
            this.phantomTimer = 0;
            this.phantomCooldown = 300; // кожні 5-8 хв
            this.phantomPos = { x: 25, y: 88 }; // тайлові координати
            this.phantomOriginalTiles = [];
            this.phantomChest = { x: 26 * 32, y: 89 * 32, looted: false };

            // 2. Радіосканер (Radio Scanner)
            this.radioFrequency = 98.4;
            this.radioMessages = {
                88.0: { title: 'Погодна служба', text: '🌤️ Метеозведення: наближається тиха ясна ніч. Сприятливо для риболовлі.' },
                98.4: { title: 'Піратська хвиля', text: '☠️ "Усім шлюпкам! Капітан Чорна Борода призначив десант на базу через декілька хвилин!"' },
                104.2: { title: 'Затонулий фрегат', text: '⚓ Координати затонулого ящика з золотом: X: 45, Y: 110 біля рифів. Морс: .--. . .- .-. .-..' },
                107.9: { title: 'SOS Сигнал рейсу 404', text: '📡 "Тут другий пілот... Чорна скринька в хвості літака... Електромагнітна аномалія в центрі архіпелагу..."' }
            };

            // 3. Психічний стан (Sanity)
            this.sanity = 100;
            this.maxSanity = 100;
            this.hallucinationShadows = [];
            this.fakeSoundTimer = 30;

            // 4. Острівні Боси (Island Bosses)
            this.bosses = [
                {
                    id: 'boss_blackbeard',
                    name: 'Капітан «Чорна Борода»',
                    title: 'Володар Піратського Форту',
                    x: 99 * 32,
                    y: 90 * 32,
                    health: 600,
                    maxHealth: 600,
                    speed: 55,
                    attackCd: 0,
                    dynamiteCd: 5,
                    active: true,
                    type: 'human'
                },
                {
                    id: 'boss_golem',
                    name: 'Лавовий Голем',
                    title: 'Вулканічний Страж',
                    x: 20 * 32,
                    y: 23 * 32,
                    health: 850,
                    maxHealth: 850,
                    speed: 40,
                    attackCd: 0,
                    stompCd: 6,
                    active: true,
                    type: 'golem'
                },
                {
                    id: 'boss_crab',
                    name: 'Гігантський Рифовий Краб',
                    title: 'Жах Рифів',
                    x: 55 * 32,
                    y: 15 * 32,
                    health: 750,
                    maxHealth: 750,
                    speed: 48,
                    attackCd: 0,
                    armor: 0.8, // 80% зниження урону від примітивної зброї
                    active: true,
                    type: 'crab'
                }
            ];
            this.activeBoss = null;
            this.activeDynamites = []; // динаміти в польоті/на землі

            // 5. Облога бази піратами (Siege)
            this.siegeTimer = 400 + Math.random() * 200;
            this.activeSiegePirates = [];

            // 6. Кастомізація човна (Boat Upgrades)
            this.boatUpgrades = {
                chest: false,
                sail: false,
                motor: false,
                spotlight: false
            };
            this.boatStorage = []; // 12 слотів на човні

            // 7. Водолазний дзвін та глибоководне занурення (Diving)
            this.isDiving = false;
            this.oxygen = 100;
            this.maxOxygen = 100;
            this.divingWrecks = [
                { id: 'dw_1', x: 28 * 32, y: 70 * 32, looted: false, loot: ['titanium_ingot', 'black_box_1', 'pearl'] },
                { id: 'dw_2', x: 75 * 32, y: 35 * 32, looted: false, loot: ['gold_coin', 'pearl', 'electronics'] }
            ];

            // 8. Автоматичні турелі та пастки (Turrets & Traps)
            this.turretCd = 0;

            // 9. Відновлювана енергія (Wind & Waterwheels)
            // Обробляється через electricity update

            // 10. Таємниці та ЛОР (Lore System)
            this.discoveredLore = [];

            // 11. Динамічні катастрофи (Disasters)
            this.disasterTimer = 360 + Math.random() * 240;
            this.tsunamiActive = false;
            this.tsunamiTimer = 0;
            this.meteorCraters = [];
        }

        // ─── ОНОВЛЕННЯ СИСТЕМ (Update Loop) ──────────────────────
        update(dt) {
            const p = this.game.player;
            if (!p) return;

            this.updateSanity(dt, p);
            this.updatePhantomIsland(dt, p);
            this.updateBosses(dt, p);
            this.updateSiege(dt, p);
            this.updateBoat(dt, p);
            this.updateDiving(dt, p);
            this.updateTurrets(dt, p);
            this.updateDisasters(dt, p);
            this.updateHUD();
        }

        // 1. Острів-привид
        updatePhantomIsland(dt, p) {
            if (!this.phantomActive) {
                this.phantomCooldown -= dt;
                // Активація в туман, повний місяць або по таймеру
                const isFog = this.game.weatherSystem && this.game.weatherSystem.currentWeather === 'fog';
                if (this.phantomCooldown <= 0 || (isFog && Math.random() < 0.002)) {
                    this.spawnPhantomIsland();
                }
            } else {
                this.phantomTimer -= dt;
                const dist = Math.hypot(p.x - this.phantomPos.x * 32, p.y - this.phantomPos.y * 32);
                if (dist < 400 && Math.floor(this.phantomTimer) % 30 === 0 && this.phantomTimer > 5) {
                    this.game.showNotification(`🔮 Міраж острова розсіюється через ${Math.ceil(this.phantomTimer)}с!`, 'warning');
                }
                if (this.phantomTimer <= 0) {
                    this.despawnPhantomIsland();
                }
            }
        }

        spawnPhantomIsland() {
            this.phantomActive = true;
            this.phantomTimer = 180; // 3 хвилини
            this.phantomCooldown = 500;
            this.phantomOriginalTiles = [];
            this.phantomChest.looted = false;

            const w = this.game.world;
            if (!w) return;

            // Створюємо містичний острів 8x8 тайлів на воді
            for (let dy = -4; dy <= 4; dy++) {
                for (let dx = -4; dx <= 4; dx++) {
                    const tx = this.phantomPos.x + dx;
                    const ty = this.phantomPos.y + dy;
                    if (tx >= 0 && tx < w.width && ty >= 0 && ty < w.height) {
                        const orig = w.getTile(tx, ty);
                        this.phantomOriginalTiles.push({ tx, ty, orig });
                        if (Math.hypot(dx, dy) <= 3.8) {
                            w.setTile(tx, ty, 3); // трава/містична земля
                        }
                    }
                }
            }
            MegaAudio.playSonar();
            this.game.showNotification('✨ В океані з\'явився таємничий ОСТРІВ-ПРИВИД! Поспішайте знайти реліквії!', 'success');
        }

        despawnPhantomIsland() {
            this.phantomActive = false;
            const w = this.game.world;
            if (w) {
                for (let item of this.phantomOriginalTiles) {
                    w.setTile(item.tx, item.ty, item.orig);
                }
            }
            this.phantomOriginalTiles = [];
            this.game.showNotification('🌊 Міраж острова-привида розсіявся у морській безодні...', 'info');
        }

        // 3. Психічний стан (Sanity)
        updateSanity(dt, p) {
            const isNight = this.game.timeSystem && this.game.timeSystem.isNight();
            const weather = this.game.weatherSystem ? this.game.weatherSystem.currentWeather : 'clear';
            const nearFire = this.isNearCampfire(p.x, p.y);

            // Швидкість пасивного амулета
            if (p.inventory && p.inventory.hasItem('speed_amulet', 1)) {
                p.speed = 170; // +40% до стандартних 120
                this.sanity = Math.min(this.maxSanity, this.sanity + 0.5 * dt);
            } else {
                p.speed = 120;
            }

            // Зниження психіки
            if (isNight && !nearFire) {
                this.sanity = Math.max(0, this.sanity - 0.7 * dt);
            } else if ((weather === 'rain' || weather === 'fog') && !this.isUnderShelter(p.x, p.y)) {
                this.sanity = Math.max(0, this.sanity - 0.3 * dt);
            } else if (nearFire) {
                this.sanity = Math.min(this.maxSanity, this.sanity + 1.2 * dt);
            }

            // Галюцинації при низькій психіці (< 45)
            const vig = document.getElementById('sanity-vignette');
            if (vig) {
                if (this.sanity < 45) {
                    const intensity = ((45 - this.sanity) / 45);
                    vig.style.opacity = (intensity * 0.8).toString();
                } else {
                    vig.style.opacity = '0';
                }
            }

            if (this.sanity < 40) {
                this.fakeSoundTimer -= dt;
                if (this.fakeSoundTimer <= 0) {
                    this.fakeSoundTimer = 15 + Math.random() * 20;
                    MegaAudio.playTone(180 + Math.random() * 60, 0.4, 'sine', 0.1);
                    if (Math.random() < 0.4 && window.soundSystem) window.soundSystem.playZombie();
                }

                // Фантомні тіні
                if (this.hallucinationShadows.length < 2 && Math.random() < 0.01) {
                    const angle = Math.random() * Math.PI * 2;
                    const r = 160 + Math.random() * 80;
                    this.hallucinationShadows.push({
                        x: p.x + Math.cos(angle) * r,
                        y: p.y + Math.sin(angle) * r,
                        life: 12
                    });
                }
            }

            // Рух фантомних тіней
            for (let i = this.hallucinationShadows.length - 1; i >= 0; i--) {
                const s = this.hallucinationShadows[i];
                s.life -= dt;
                const dx = p.x - s.x;
                const dy = p.y - s.y;
                const dist = Math.hypot(dx, dy);
                if (dist > 15) {
                    s.x += (dx / dist) * 35 * dt;
                    s.y += (dy / dist) * 35 * dt;
                }
                if (dist < 30 || s.life <= 0 || nearFire) {
                    this.hallucinationShadows.splice(i, 1);
                }
            }
        }

        isNearCampfire(x, y) {
            if (!this.game.buildingSystem) return false;
            return this.game.buildingSystem.buildings.some(b => {
                if (b.type === 'campfire' || b.type === 'spotlight') {
                    return Math.hypot(b.x - x, b.y - y) < 140;
                }
                return false;
            });
        }

        isUnderShelter(x, y) {
            if (!this.game.buildingSystem) return false;
            return this.game.buildingSystem.buildings.some(b => {
                if (b.type === 'shelter' || b.type === 'wooden_house') {
                    return Math.hypot(b.x - x, b.y - y) < 80;
                }
                return false;
            });
        }

        // 4. Острівні Боси (Bosses)
        updateBosses(dt, p) {
            let nearestBoss = null;
            let nearestDist = Infinity;

            for (let boss of this.bosses) {
                if (!boss.active) continue;
                const dist = Math.hypot(p.x - boss.x, p.y - boss.y);
                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearestBoss = boss;
                }

                // Агро радіус боса (280 пікселів)
                if (dist < 280) {
                    boss.attackCd = Math.max(0, boss.attackCd - dt);
                    // Рух до гравця
                    if (dist > 35) {
                        boss.x += ((p.x - boss.x) / dist) * boss.speed * dt;
                        boss.y += ((p.y - boss.y) / dist) * boss.speed * dt;
                    }

                    // Атаки босів
                    if (boss.id === 'boss_blackbeard') {
                        boss.dynamiteCd = Math.max(0, boss.dynamiteCd - dt);
                        if (boss.dynamiteCd <= 0 && dist < 220) {
                            boss.dynamiteCd = 6;
                            this.throwDynamite(boss.x, boss.y, p.x, p.y);
                        }
                        if (dist < 40 && boss.attackCd <= 0) {
                            boss.attackCd = 1.2;
                            this.damagePlayer(25, 'Шабля Чорної Бороди');
                        }
                    } else if (boss.id === 'boss_golem') {
                        boss.stompCd = Math.max(0, boss.stompCd - dt);
                        if (boss.stompCd <= 0 && dist < 120) {
                            boss.stompCd = 7;
                            MegaAudio.playBossRoar();
                            this.damagePlayer(35, 'Лавова ударна хвиля');
                            this.game.showNotification('🔥 Голем струсонув землю лавовою хвилею!', 'danger');
                        }
                    } else if (boss.id === 'boss_crab') {
                        if (dist < 45 && boss.attackCd <= 0) {
                            boss.attackCd = 1.5;
                            this.damagePlayer(28, 'Клешня Гігантського Краба');
                        }
                    }
                }
            }

            // Оновлення HUD боса
            const bossHud = document.getElementById('boss-hud');
            if (nearestBoss && nearestDist < 350) {
                this.activeBoss = nearestBoss;
                if (bossHud) {
                    bossHud.style.display = 'flex';
                    document.getElementById('boss-name').textContent = `👑 ${nearestBoss.name}`;
                    document.getElementById('boss-hp-text').textContent = `${Math.ceil(nearestBoss.health)} / ${nearestBoss.maxHealth} HP`;
                    const pct = Math.max(0, (nearestBoss.health / nearestBoss.maxHealth) * 100);
                    document.getElementById('boss-bar-fill').style.width = `${pct}%`;
                }
            } else {
                this.activeBoss = null;
                if (bossHud) bossHud.style.display = 'none';
            }

            // Оновлення динаміту
            for (let i = this.activeDynamites.length - 1; i >= 0; i--) {
                const d = this.activeDynamites[i];
                d.timer -= dt;
                if (d.progress < 1) {
                    d.progress = Math.min(1, d.progress + dt * 1.5);
                    d.curX = d.startX + (d.targetX - d.startX) * d.progress;
                    d.curY = d.startY + (d.targetY - d.startY) * d.progress;
                }
                if (d.timer <= 0) {
                    // Вибух
                    MegaAudio.playExplosion();
                    const expDist = Math.hypot(p.x - d.curX, p.y - d.curY);
                    if (expDist < 90) {
                        this.damagePlayer(Math.round(45 * (1 - expDist / 90)), 'Вибух динаміту');
                    }
                    this.activeDynamites.splice(i, 1);
                }
            }
        }

        throwDynamite(fromX, fromY, toX, toY) {
            MegaAudio.playTone(600, 0.1, 'square', 0.2);
            this.activeDynamites.push({
                startX: fromX, startY: fromY,
                targetX: toX, targetY: toY,
                curX: fromX, curY: fromY,
                progress: 0,
                timer: 2.2
            });
        }

        damagePlayer(rawDmg, source) {
            const p = this.game.player;
            if (!p) return;
            let reduction = 0;
            if (p.inventory) {
                if (p.inventory.hasItem('star_armor', 1)) reduction = 0.85;
                else if (p.inventory.hasItem('chitin_armor', 1)) reduction = 0.75;
                else if (p.inventory.hasItem('metal_armor', 1)) reduction = 0.40;
            }
            const finalDmg = Math.max(3, Math.round(rawDmg * (1 - reduction)));
            p.health = Math.max(0, p.health - finalDmg);
            this.sanity = Math.max(0, this.sanity - 5);
            this.game.showNotification(`⚠️ -${finalDmg} HP від ${source}!`, 'danger');
        }

        // Завдати урон босу від гравця
        attackBoss(boss, weaponId) {
            let dmg = 20;
            if (weaponId === 'meteor_blade') dmg = 65;
            else if (weaponId === 'cutlass') dmg = 45;
            else if (weaponId === 'machinegun') dmg = 35;
            else if (weaponId === 'sniper_rifle') dmg = 70;
            else if (weaponId === 'pistol') dmg = 25;
            else if (weaponId === 'spear') dmg = 22;

            // Броня краба
            if (boss.id === 'boss_crab' && !['machinegun','sniper_rifle','pistol','dynamite','meteor_blade'].includes(weaponId)) {
                dmg = Math.round(dmg * 0.2); // 80% блокує
                this.game.showNotification('🛡️ Панцир краба відбиває примітивні удари! Потрібна вогнепальна зброя!', 'warning');
            }

            boss.health -= dmg;
            MegaAudio.playTone(150, 0.08, 'sawtooth', 0.2);

            if (boss.health <= 0) {
                boss.active = false;
                this.onBossDefeated(boss);
            }
        }

        onBossDefeated(boss) {
            MegaAudio.playExplosion();
            this.game.showNotification(`🏆 БОСА ПОВАЛЕНО: ${boss.name}! Отримано легендарні скарби!`, 'success');
            const inv = this.game.player.inventory;
            if (!inv) return;

            if (boss.id === 'boss_blackbeard') {
                inv.addItem('cutlass', 1);
                inv.addItem('dynamite', 4);
                inv.addItem('gold_coin', 10);
                this.addLore('pirate_secret', 'Таємниця Чорної Бороди', 'Знайдено мапу із позначкою затонулого фрегата та кодом від секретного сховища форту.');
            } else if (boss.id === 'boss_golem') {
                inv.addItem('volcanic_heart', 1);
                inv.addItem('sulfur', 12);
                inv.addItem('obsidian_shard', 6);
                this.addLore('volcano_core', 'Серце Вулкана', 'Вулканічне серце випромінює тепло прадавнього магматичного ядра острова.');
            } else if (boss.id === 'boss_crab') {
                inv.addItem('giant_crab_shell', 1);
                inv.addItem('pearl', 6);
                inv.addItem('cooked_fish', 5);
            }
        }

        // 5. Облога бази (Siege)
        updateSiege(dt, p) {
            this.siegeTimer -= dt;
            if (this.siegeTimer <= 0) {
                this.siegeTimer = 450 + Math.random() * 250;
                this.triggerBaseSiege(p);
            }

            // Рух та дії піратів-підривників
            for (let i = this.activeSiegePirates.length - 1; i >= 0; i--) {
                const s = this.activeSiegePirates[i];
                s.fuseTimer -= dt;
                // Шукаємо найближчу будівлю бази для підриву
                const target = this.findNearestBaseBuilding(s.x, s.y);
                if (target) {
                    const dist = Math.hypot(target.x - s.x, target.y - s.y);
                    if (dist > 25) {
                        s.x += ((target.x - s.x) / dist) * s.speed * dt;
                        s.y += ((target.y - s.y) / dist) * s.speed * dt;
                    } else if (s.fuseTimer <= 0) {
                        // Підрив частоколу
                        MegaAudio.playExplosion();
                        target.health -= 120;
                        if (target.health <= 0 && this.game.buildingSystem) {
                            const idx = this.game.buildingSystem.buildings.indexOf(target);
                            if (idx >= 0) this.game.buildingSystem.buildings.splice(idx, 1);
                        }
                        this.game.showNotification('💥 Пірат підірвав огорожу бази!', 'danger');
                        this.activeSiegePirates.splice(i, 1);
                    }
                }
            }
        }

        triggerBaseSiege(p) {
            MegaAudio.playBossRoar();
            if (window.soundSystem) window.soundSystem.playAlarm();
            this.game.showNotification('🚨 ОБЛОГА БАЗИ! Піратський підривник висадився на березі!', 'danger');
            
            // Спавнимо підривника на узбережжі біля гравця
            const angle = Math.random() * Math.PI * 2;
            this.activeSiegePirates.push({
                x: p.x + Math.cos(angle) * 380,
                y: p.y + Math.sin(angle) * 380,
                health: 90,
                maxHealth: 90,
                speed: 48,
                fuseTimer: 20
            });
        }

        findNearestBaseBuilding(x, y) {
            if (!this.game.buildingSystem) return null;
            let nearest = null;
            let minDist = 600;
            for (let b of this.game.buildingSystem.buildings) {
                if (['fence', 'gate', 'auto_turret', 'shelter', 'wooden_house'].includes(b.type)) {
                    const d = Math.hypot(b.x - x, b.y - y);
                    if (d < minDist) {
                        minDist = d;
                        nearest = b;
                    }
                }
            }
            return nearest;
        }

        // 6. Кастомізація човна (Boat)
        updateBoat(dt, p) {
            const boat = this.game.boat;
            if (!boat || !p.inBoat) return;

            // Ефекти апгрейдів
            if (this.boatUpgrades.sail) {
                p.speed = 160; // Швидше пливе
            }
            if (this.boatUpgrades.motor) {
                p.speed = 220; // Турбо-мотор
            }
        }

        // 7. Водолазний режим (Diving)
        updateDiving(dt, p) {
            const overlay = document.getElementById('underwater-overlay');
            const divingHud = document.getElementById('diving-hud');

            if (this.isDiving) {
                if (overlay) overlay.style.display = 'block';
                if (divingHud) divingHud.style.display = 'flex';

                this.oxygen -= dt;
                const oxBar = document.getElementById('oxygen-bar-fill');
                const oxText = document.getElementById('oxygen-text');
                if (oxBar) oxBar.style.width = `${Math.max(0, (this.oxygen / this.maxOxygen) * 100)}%`;
                if (oxText) oxText.textContent = `${Math.ceil(this.oxygen)}с`;

                if (this.oxygen <= 0) {
                    this.damagePlayer(15 * dt, 'Брак кисню під водою');
                    if (this.oxygen < -5) {
                        this.surfaceDiving();
                    }
                }
            } else {
                if (overlay) overlay.style.display = 'none';
                if (divingHud) divingHud.style.display = 'none';
                this.oxygen = Math.min(this.maxOxygen, this.oxygen + 20 * dt);
            }
        }

        startDiving() {
            this.isDiving = true;
            this.oxygen = 100;
            MegaAudio.playSonar();
            this.game.showNotification('🤿 Ви занурилися на дно океану! Досліджуйте затонулі уламки.', 'info');
        }

        surfaceDiving() {
            this.isDiving = false;
            if (window.soundSystem) window.soundSystem.playSplash();
            this.game.showNotification('🌊 Ви піднялися на поверхню води.', 'success');
        }

        // 8. Автоматичні турелі (Turrets)
        updateTurrets(dt, p) {
            this.turretCd -= dt;
            if (this.turretCd > 0) return;
            if (!this.game.buildingSystem) return;

            const turrets = this.game.buildingSystem.buildings.filter(b => b.type === 'auto_turret');
            if (!turrets.length) return;

            // Збираємо всіх ворогів поблизу
            let enemies = [];
            if (this.game.zombieManager && this.game.zombieManager.zombies) {
                enemies.push(...this.game.zombieManager.zombies);
            }
            if (this.game.pirateManager && this.game.pirateManager.pirates) {
                enemies.push(...this.game.pirateManager.pirates);
            }
            enemies.push(...this.activeSiegePirates);

            for (let t of turrets) {
                for (let e of enemies) {
                    const dist = Math.hypot(e.x - t.x, e.y - t.y);
                    if (dist < 180) {
                        this.turretCd = 0.4;
                        e.health -= 35;
                        if (window.soundSystem) window.soundSystem.playGunshot('rifle');
                        MegaAudio.playTone(300, 0.05, 'square', 0.2);
                        break;
                    }
                }
            }
        }

        // 11. Динамічні катастрофи (Disasters)
        updateDisasters(dt, p) {
            this.disasterTimer -= dt;
            if (this.disasterTimer <= 0) {
                this.disasterTimer = 400 + Math.random() * 300;
                if (Math.random() < 0.5) {
                    this.triggerTsunami(p);
                } else {
                    this.triggerMeteorShower(p);
                }
            }

            if (this.tsunamiActive) {
                this.tsunamiTimer -= dt;
                if (this.tsunamiTimer <= 0) {
                    this.tsunamiActive = false;
                    this.game.showNotification('🌊 Цунамі відступило, залишивши на пляжах викинуті скрині та рідкісні перлини!', 'success');
                    this.spawnTsunamiLoot(p);
                }
            }
        }

        triggerTsunami(p) {
            this.tsunamiActive = true;
            this.tsunamiTimer = 45;
            MegaAudio.playBossRoar();
            if (window.soundSystem) window.soundSystem.playAlarm();
            this.game.showNotification('🌊 УВАГА: Наближається ЦУНАМІ! Підніміться на висоту або сідайте в човен!', 'danger');
        }

        spawnTsunamiLoot(p) {
            const w = this.game.world;
            if (!w) return;
            // Спавнимо уламки та перлини на берегах
            for (let i = 0; i < 6; i++) {
                const rx = p.x + (Math.random() * 400 - 200);
                const ry = p.y + (Math.random() * 400 - 200);
                const t = w.getTileAtWorld(rx, ry);
                if (t === 2) { // пляж
                    w.resources.push({
                        id: 'tsunami_crate_' + Date.now() + '_' + i,
                        type: 'sunken_crate',
                        x: rx, y: ry,
                        health: 30, maxHealth: 30,
                        drops: [{ id: 'pearl', count: 1 }, { id: 'metal_scrap', count: 2 }, { id: 'gold_coin', count: 1 }]
                    });
                }
            }
        }

        triggerMeteorShower(p) {
            MegaAudio.playExplosion();
            this.game.showNotification('☄️ МЕТЕОРИТНИЙ ДОЩ! Палаючі уламки впали на острови! Шукайте космічне залізо!', 'info');
            for (let i = 0; i < 3; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = 200 + Math.random() * 300;
                this.meteorCraters.push({
                    x: p.x + Math.cos(angle) * dist,
                    y: p.y + Math.sin(angle) * dist,
                    mined: false
                });
            }
        }

        // 10. Додавання ЛОР записів
        addLore(id, title, content) {
            if (this.discoveredLore.some(l => l.id === id)) return;
            this.discoveredLore.push({ id, title, content, date: new Date().toLocaleTimeString() });
            this.game.showNotification(`📖 Відкрито новий запис у щоденнику: "${title}"`, 'success');
            MegaAudio.playMorse();
        }

        updateHUD() {
            // Оновлення індикатора психіки
            const bar = document.getElementById('hud-sanity');
            const txt = document.getElementById('hud-sanity-text');
            if (bar) bar.style.width = `${Math.max(0, (this.sanity / this.maxSanity) * 100)}%`;
            if (txt) txt.textContent = `${Math.round(this.sanity)}/100`;
        }

        // ─── ВІДМАЛЬОВУВАННЯ НА CANVAS (Render) ──────────────────
        render(ctx, camera) {
            const time = performance.now() / 1000;

            // 1. Острів-привид (сяйво)
            if (this.phantomActive) {
                const sp = camera.worldToScreen(this.phantomPos.x * 32 + 64, this.phantomPos.y * 32 + 64);
                ctx.save();
                ctx.fillStyle = 'rgba(168, 85, 247, 0.2)';
                ctx.beginPath();
                ctx.arc(sp.x, sp.y, 140 + Math.sin(time * 3) * 15, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }

            // 2. Фантомні тіні при низькій психіці
            for (let s of this.hallucinationShadows) {
                if (!camera.isVisible(s.x, s.y)) continue;
                const sp = camera.worldToScreen(s.x, s.y);
                ctx.save();
                ctx.fillStyle = 'rgba(20, 10, 35, 0.65)';
                ctx.beginPath();
                ctx.arc(sp.x, sp.y, 14, 0, Math.PI * 2);
                ctx.fill();
                // Очі тіні
                ctx.fillStyle = '#EF4444';
                ctx.beginPath();
                ctx.arc(sp.x - 4, sp.y - 3, 2, 0, Math.PI * 2);
                ctx.arc(sp.x + 4, sp.y - 3, 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }

            // 3. Боси
            for (let boss of this.bosses) {
                if (!boss.active || !camera.isVisible(boss.x, boss.y)) continue;
                const sp = camera.worldToScreen(boss.x, boss.y);
                ctx.save();

                if (boss.id === 'boss_blackbeard') {
                    // Тіло пірата
                    ctx.fillStyle = '#DC2626';
                    ctx.beginPath(); ctx.arc(sp.x, sp.y, 18, 0, Math.PI * 2); ctx.fill();
                    // Капелюх
                    ctx.fillStyle = '#111827';
                    ctx.fillRect(sp.x - 16, sp.y - 24, 32, 10);
                    // Шабля
                    ctx.strokeStyle = '#F3F4F6'; ctx.lineWidth = 3;
                    ctx.beginPath(); ctx.moveTo(sp.x + 12, sp.y); ctx.lineTo(sp.x + 28, sp.y - 12); ctx.stroke();
                } else if (boss.id === 'boss_golem') {
                    // Кам'яний голем
                    ctx.fillStyle = '#451A03';
                    ctx.beginPath(); ctx.arc(sp.x, sp.y, 26, 0, Math.PI * 2); ctx.fill();
                    // Тріщини з лавою
                    ctx.strokeStyle = '#F97316'; ctx.lineWidth = 3;
                    ctx.beginPath(); ctx.moveTo(sp.x - 14, sp.y - 10); ctx.lineTo(sp.x + 14, sp.y + 10); ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(sp.x + 10, sp.y - 12); ctx.lineTo(sp.x - 10, sp.y + 12); ctx.stroke();
                } else if (boss.id === 'boss_crab') {
                    // Краб
                    ctx.fillStyle = '#B91C1C';
                    ctx.beginPath(); ctx.ellipse(sp.x, sp.y, 28, 20, 0, 0, Math.PI * 2); ctx.fill();
                    // Клешні
                    ctx.fillStyle = '#EF4444';
                    ctx.beginPath(); ctx.arc(sp.x - 26, sp.y - 14, 10, 0, Math.PI * 2); ctx.fill();
                    ctx.beginPath(); ctx.arc(sp.x + 26, sp.y - 14, 10, 0, Math.PI * 2); ctx.fill();
                }

                // Міні смужка HP над босом
                ctx.fillStyle = 'rgba(0,0,0,0.6)';
                ctx.fillRect(sp.x - 24, sp.y - 34, 48, 6);
                ctx.fillStyle = '#EF4444';
                ctx.fillRect(sp.x - 24, sp.y - 34, Math.max(0, (boss.health / boss.maxHealth) * 48), 6);
                ctx.restore();
            }

            // 4. Динаміти
            for (let d of this.activeDynamites) {
                if (!camera.isVisible(d.curX, d.curY)) continue;
                const sp = camera.worldToScreen(d.curX, d.curY);
                ctx.save();
                ctx.fillStyle = '#DC2626';
                ctx.fillRect(sp.x - 4, sp.y - 8, 8, 16);
                ctx.fillStyle = '#FBBF24'; // іскра
                ctx.beginPath(); ctx.arc(sp.x, sp.y - 10, 3 + Math.sin(time * 20) * 1.5, 0, Math.PI * 2); ctx.fill();
                ctx.restore();
            }

            // 5. Метеоритні кратери
            for (let c of this.meteorCraters) {
                if (c.mined || !camera.isVisible(c.x, c.y)) continue;
                const sp = camera.worldToScreen(c.x, c.y);
                ctx.save();
                ctx.fillStyle = '#1E1B4B';
                ctx.beginPath(); ctx.arc(sp.x, sp.y, 16, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#818CF8';
                ctx.beginPath(); ctx.arc(sp.x, sp.y, 8, 0, Math.PI * 2); ctx.fill();
                ctx.restore();
            }
        }
    }
    window.MegaExpansionSystem = MegaExpansionSystem;

    // ─── 6. ІНТЕГРАЦІЯ З КЛАСОМ GAME (Patches) ───────────────────
    (function patchGameCore() {
        if (!window.Game) return;

        // Патч Game.init
        const origInit = Game.prototype.init;
        Game.prototype.init = function() {
            origInit.call(this);
            this.megaSystem = new window.MegaExpansionSystem(this);

            // Початковий ЛОР
            this.megaSystem.addLore('intro', 'Початок виживання', 'Літак зазнав катастрофи через незрозумілий спалах світла. Я єдиний вижилий на пляжі.');
        };

        // Патч Game.update
        const origUpdate = Game.prototype.update;
        Game.prototype.update = function(dt) {
            origUpdate.call(this, dt);
            if (this.megaSystem) this.megaSystem.update(dt);
        };

        // Патч Game.render
        const origRender = Game.prototype.render;
        Game.prototype.render = function() {
            origRender.call(this);
            if (this.megaSystem && this.camera) {
                this.megaSystem.render(this.ctx, this.camera);
            }
        };

        // Патч взаємодії (Interaction: Boss attack / Chests / Diving / Meteor)
        const origInteract = Game.prototype.handleInteraction;
        Game.prototype.handleInteraction = function() {
            const p = this.player;
            const ms = this.megaSystem;
            if (!p || !ms) return origInteract ? origInteract.call(this) : undefined;

            // Взаємодія з кратером метеорита
            for (let c of ms.meteorCraters) {
                if (!c.mined && Math.hypot(p.x - c.x, p.y - c.y) < 45) {
                    c.mined = true;
                    p.inventory.addItem('meteoric_iron', 3);
                    if (window.soundSystem) window.soundSystem.playMine();
                    this.showNotification('⛏️ Видобуто 3 метеоритні уламки!', 'success');
                    ms.addLore('meteor_log', 'Космічний метал', 'Метеорит містить надміцний сплав. З нього можна викувати найгостріший клинок.');
                    return;
                }
            }

            // Взаємодія з водолазним дзвоном
            if (this.buildingSystem) {
                const bell = this.buildingSystem.buildings.find(b => b.type === 'diving_bell' && Math.hypot(b.x - p.x, b.y - p.y) < 60);
                if (bell) {
                    if (!ms.isDiving) ms.startDiving();
                    else ms.surfaceDiving();
                    return;
                }
            }

            return origInteract.call(this);
        };

        // Патч атаки гравця (Attack on Bosses)
        const origAttack = Game.prototype.attack;
        Game.prototype.attack = function(...args) {
            const p = this.player;
            const ms = this.megaSystem;
            if (p && ms) {
                // Перевіряємо удар по босу
                for (let b of ms.bosses) {
                    if (b.active && Math.hypot(p.x - b.x, p.y - b.y) < 65) {
                        ms.attackBoss(b, p.equippedTool);
                        window.GameTextures?.playerAction(p, window.ITEM_DB[p.equippedTool]?.range ? 'shoot' : 'swing');
                        return;
                    }
                }
            }
            if (origAttack) return origAttack.apply(this, args);
        };

        // Патч збереження (Save)
        const origSave = Game.prototype.saveGame;
        Game.prototype.saveGame = function() {
            origSave.call(this);
            if (!window.SaveManager || !this.megaSystem) return;
            const raw = window.SaveManager.load() || {};
            raw.megaSystem = {
                sanity: this.megaSystem.sanity,
                boatUpgrades: this.megaSystem.boatUpgrades,
                boatStorage: this.megaSystem.boatStorage,
                discoveredLore: this.megaSystem.discoveredLore,
                bosses: this.megaSystem.bosses.map(b => ({ id: b.id, health: b.health, active: b.active }))
            };
            window.SaveManager.rawSave(raw);
        };

        // Патч завантаження (Load)
        const origLoad = Game.prototype.loadFromSave;
        Game.prototype.loadFromSave = function() {
            origLoad.call(this);
            if (!window.SaveManager || !this.megaSystem) return;
            const raw = window.SaveManager.load();
            if (raw && raw.megaSystem) {
                this.megaSystem.sanity = raw.megaSystem.sanity || 100;
                this.megaSystem.boatUpgrades = raw.megaSystem.boatUpgrades || this.megaSystem.boatUpgrades;
                this.megaSystem.boatStorage = raw.megaSystem.boatStorage || [];
                this.megaSystem.discoveredLore = raw.megaSystem.discoveredLore || [];
                if (raw.megaSystem.bosses) {
                    for (let sb of raw.megaSystem.bosses) {
                        const b = this.megaSystem.bosses.find(x => x.id === sb.id);
                        if (b) { b.health = sb.health; b.active = sb.active; }
                    }
                }
            }
        };
    })();

    // ─── 7. ГЛОБАЛЬНІ ДІАЛОГИ ТА UI КНОПКИ ───────────────────────
    window.openRadioUI = function() {
        const p = document.getElementById('panel-radio');
        if (!p) return;
        p.classList.remove('hidden');
        p.style.display = 'flex';
        updateRadioDisplay();
    };

    function updateRadioDisplay() {
        const freqSlider = document.getElementById('radio-frequency');
        const freqDisp = document.getElementById('radio-freq-display');
        const crt = document.getElementById('radio-display');
        if (!freqSlider || !crt) return;

        const f = parseFloat(freqSlider.value).toFixed(1);
        if (freqDisp) freqDisp.textContent = `${f} MHz`;

        const ms = window.game && window.game.megaSystem;
        if (!ms) return;

        // Шукаємо співпадіння
        let found = null;
        for (let targetFreq in ms.radioMessages) {
            if (Math.abs(parseFloat(targetFreq) - parseFloat(f)) < 0.3) {
                found = ms.radioMessages[targetFreq];
                break;
            }
        }

        if (found) {
            MegaAudio.playMorse();
            crt.innerHTML = `<b style="color:#FBBF24;">[ ПЕРЕХОПЛЕНО СИГНАЛ: ${found.title} ]</b><br><br>${found.text}`;
        } else {
            MegaAudio.playStatic();
            crt.innerHTML = `[ ░▒▓ ШУМ ЕФІРУ: ${f} MHz ▓▒░ ]<br><br><span style="color:#6EE7B7;">Налаштуйте частоту повзунком на 88.0, 98.4, 104.2 або 107.9 MHz</span>`;
        }
    }

    window.openBoatUI = function() {
        const p = document.getElementById('panel-boat');
        const list = document.getElementById('boat-upgrades-list');
        if (!p || !list) return;
        p.classList.remove('hidden');
        p.style.display = 'flex';

        const ms = window.game && window.game.megaSystem;
        const inv = window.game && window.game.player && window.game.player.inventory;
        if (!ms || !inv) return;

        const upgrades = [
            { id: 'chest', name: 'Палубна скриня (+12 слотів)', req: '6 дощок, 3 металобрухту', can: inv.hasItem('plank', 6) && inv.hasItem('metal_scrap', 3), cost: [{id:'plank',c:6},{id:'metal_scrap',c:3}] },
            { id: 'sail', name: 'Тканинне вітрило (+35% швидкості)', req: '16 волокна, 8 гілок, 4 мотузки', can: inv.hasItem('fiber', 16) && inv.hasItem('rope', 4), cost: [{id:'fiber',c:16},{id:'rope',c:4}] },
            { id: 'motor', name: 'Підвісний мотор (+100% турбо)', req: '8 металобрухту, 3 електроніки, 2 палива', can: inv.hasItem('metal_scrap', 8) && inv.hasItem('electronics', 3) && inv.hasItem('fuel', 2), cost: [{id:'metal_scrap',c:8},{id:'electronics',c:3},{id:'fuel',c:2}] },
            { id: 'spotlight', name: 'Носовий прожектор (світло вночі)', req: '4 скла, 2 електроніки', can: inv.hasItem('glass_shard', 4) && inv.hasItem('electronics', 2), cost: [{id:'glass_shard',c:4},{id:'electronics',c:2}] }
        ];

        list.innerHTML = '';
        upgrades.forEach(u => {
            const card = document.createElement('div');
            card.className = `boat-upgrade-card ${ms.boatUpgrades[u.id] ? 'installed' : ''}`;

            const info = document.createElement('div');
            info.innerHTML = `<b>${u.name}</b><br><small style="color:#94A3B8;">Потрібно: ${u.req}</small>`;

            const btn = document.createElement('button');
            if (ms.boatUpgrades[u.id]) {
                btn.textContent = 'Встановлено ✅';
                btn.disabled = true;
                btn.style.background = '#10B981';
            } else {
                btn.textContent = 'Встановити';
                btn.style.background = u.can ? '#0284C7' : '#475569';
                btn.disabled = !u.can;
                btn.onclick = () => {
                    u.cost.forEach(c => inv.removeItem(c.id, c.c));
                    ms.boatUpgrades[u.id] = true;
                    if (window.soundSystem) window.soundSystem.playCraft();
                    window.game.showNotification(`Встановлено апгрейд човна: ${u.name}!`, 'success');
                    window.openBoatUI();
                };
            }
            btn.style.color = '#fff';
            btn.style.border = 'none';
            btn.style.padding = '6px 12px';
            btn.style.borderRadius = '6px';
            btn.style.cursor = btn.disabled ? 'default' : 'pointer';

            card.appendChild(info);
            card.appendChild(btn);
            list.appendChild(card);
        });
    };

    window.openLoreUI = function() {
        const p = document.getElementById('panel-lore');
        const list = document.getElementById('lore-entries-list');
        if (!p || !list) return;
        p.classList.remove('hidden');
        p.style.display = 'flex';

        const ms = window.game && window.game.megaSystem;
        if (!ms) return;

        list.innerHTML = '';
        if (ms.discoveredLore.length === 0) {
            list.innerHTML = '<p style="color:#A8A29E; text-align:center;">Ще не знайдено жодних записів авіакатастрофи. Досліджуйте уламки літака, печери та форт!</p>';
            return;
        }

        ms.discoveredLore.forEach(l => {
            const div = document.createElement('div');
            div.className = 'lore-entry';
            div.innerHTML = `<div class="lore-title">📜 ${l.title} <small style="color:#78716C; font-weight:normal;">(${l.date || ''})</small></div><div>${l.content}</div>`;
            list.appendChild(div);
        });
    };

    // Прив'язка кнопок UI та клавіш
    window.addEventListener('DOMContentLoaded', () => {
        // Кнопки бічної панелі
        const bRadio = document.getElementById('btn-toggle-radio');
        if (bRadio) bRadio.onclick = () => window.openRadioUI();

        const bBoat = document.getElementById('btn-toggle-boat');
        if (bBoat) bBoat.onclick = () => window.openBoatUI();

        const bLore = document.getElementById('btn-toggle-lore');
        if (bLore) bLore.onclick = () => window.openLoreUI();

        // Кнопка виринання
        const bSurf = document.getElementById('btn-surface');
        if (bSurf) bSurf.onclick = () => {
            if (window.game && window.game.megaSystem) window.game.megaSystem.surfaceDiving();
        };

        // Повзунок частоти радіо
        const freqSlider = document.getElementById('radio-frequency');
        if (freqSlider) freqSlider.oninput = updateRadioDisplay;

        const bScan = document.getElementById('btn-radio-scan');
        if (bScan) bScan.onclick = () => {
            if (freqSlider) {
                const freqs = [88.0, 98.4, 104.2, 107.9];
                const next = freqs[Math.floor(Math.random() * freqs.length)];
                freqSlider.value = next;
                updateRadioDisplay();
            }
        };

        // Закриття нових модалок
        ['btn-close-radio', 'btn-close-boat', 'btn-close-lore'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.onclick = () => {
                const modal = btn.closest('.modal, .game-panel');
                if (modal) { modal.classList.add('hidden'); modal.style.display = 'none'; }
            };
        });

        // Гарячі клавіші: R (Radio), U (Boat), L (Lore)
        window.addEventListener('keydown', (e) => {
            if (e.target && ['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
            if (e.key === 'r' || e.key === 'R' || e.key === 'к' || e.key === 'К') {
                window.openRadioUI();
            } else if (e.key === 'u' || e.key === 'U' || e.key === 'г' || e.key === 'Г') {
                window.openBoatUI();
            } else if (e.key === 'l' || e.key === 'L' || e.key === 'д' || e.key === 'Д') {
                window.openLoreUI();
            }
        });
    });

    console.log('[island-mega-expansion.js] 11 великих систем успішно активовано! 🚀');
})();

