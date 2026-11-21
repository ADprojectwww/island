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
            'scientist_notes':  { id:'scientist_notes',  name:'Записки експедиції',      icon:'notes',         category:'resource', maxStack:1,  description:'Дослідження острова-привида та вірусного туману' },

            // Інструменти копання та ресурси землі
            'shovel':            { id:'shovel',            name:'Кам\'яна лопата',        icon:'shovel',        category:'tool',     toolType:'shovel', maxStack:1, description:'Дозволяє копати землю [E/клік], добувати глину, пісок, черв\'яків та бункери' },
            'clay':              { id:'clay',              name:'Глина',                  icon:'clay',          category:'resource', maxStack:20, description:'Пластична глина для кам\'яних стін та цегли' },
            'sand':              { id:'sand',              name:'Будівельний пісок',      icon:'sand',          category:'resource', maxStack:20, description:'Пісок для фундаментів та розчину' },
            'worm':              { id:'worm',              name:'Дощовий черв\'як',       icon:'worm',          category:'food',     maxStack:15, description:'Живий черв\'як для риболовлі, викопаний із землі', effects:{hunger:2} },

            // Модульне будівництво (хати, бункери, стіни, підлога, дах)
            'stick_wall_item':   { id:'stick_wall_item',   name:'Стіна з палиць',         icon:'b_stick_wall',  category:'building', maxStack:20, placeable:'stick_wall',  description:'Легка стіна з переплетених гілок' },
            'stone_wall_item':   { id:'stone_wall_item',   name:'Кам\'яна стіна',         icon:'b_stone_wall',  category:'building', maxStack:20, placeable:'stone_wall',  description:'Міцна стіна з тесаного каменю та глини' },
            'stick_door_item':   { id:'stick_door_item',   name:'Двері з палиць',         icon:'b_stick_door',  category:'building', maxStack:5,  placeable:'stick_door',  description:'Двері для входу. Відкриваються на [E]' },
            'stone_door_item':   { id:'stone_door_item',   name:'Кам\'яні двері',         icon:'b_stone_door',  category:'building', maxStack:5,  placeable:'stone_door',  description:'Важкі захисні двері для кам\'яного бункера [E]' },
            'wood_floor_item':   { id:'wood_floor_item',   name:'Дерев\'яна підлога',     icon:'b_wood_floor',  category:'building', maxStack:20, placeable:'wood_floor',  description:'Настил підлоги. Можна будувати стіни поверх' },
            'stone_floor_item':  { id:'stone_floor_item',  name:'Кам\'яний фундамент',    icon:'b_stone_floor', category:'building', maxStack:20, placeable:'stone_floor', description:'Кам\'яна плитка для підлоги та бункера' },
            'thatched_roof_item':{ id:'thatched_roof_item',name:'Солом\'яний дах',        icon:'b_roof',        category:'building', maxStack:20, placeable:'thatched_roof',description:'Покрівля з листя, що захищає від дощу' },
            'bunker_hatch_item': { id:'bunker_hatch_item', name:'Люк підземного бункера',icon:'b_hatch',       category:'building', maxStack:2,  placeable:'bunker_hatch', description:'Вхід у ваш власний підземний бункер [E]' },
            'leaf_bed_item':     { id:'leaf_bed_item',     name:'Ліжко з листя',          icon:'b_bed',         category:'building', maxStack:2,  placeable:'leaf_bed',    description:'Затишне ліжко. Дозволяє поспати [E] і пропустити ніч' },

            // Новий транспорт, бойовий човен, станки та військове спорядження
            'buggy_item':        { id:'buggy_item',        name:'Саморобний баггі',       icon:'buggy_ico',     category:'tool',     maxStack:1,  description:'Всюдихід для швидкої їзди по суші та мілині з багажником на 12 слотів [E]' },
            'boat_gun_item':     { id:'boat_gun_item',     name:'Корабельний кулемет',   icon:'boat_gun_ico',  category:'tool',     maxStack:1,  description:'Встановлює кулемет на ніс човна. Стріляє [Пробіл / ЛКМ] під час плавання' },
            'blast_furnace_item':{ id:'blast_furnace_item',name:'Доменна піч',          icon:'b_furnace',     category:'building', maxStack:2,  placeable:'blast_furnace', description:'Станок для виплавки скла, цегли, сталі та обсидіану [E]' },
            'alarm_system_item': { id:'alarm_system_item', name:'Охоронна сигналізація',icon:'b_alarm',       category:'building', maxStack:5,  placeable:'alarm_system',  description:'Датчик руху: вмикає червоні сирени та сповіщає турелі при наближенні ворогів' },
            'glass':             { id:'glass',             name:'Загартоване скло',      icon:'glass_mat',     category:'resource', maxStack:30, description:'Прозоре скло, виплавлене з будівельного піску' },
            'brick':             { id:'brick',             name:'Будівельна цегла',      icon:'brick_mat',     category:'resource', maxStack:30, description:'Міцна вогнетривка цегла, випалена з глини' },
            'steel_ingot':       { id:'steel_ingot',       name:'Сталевий злиток',       icon:'steel_mat',     category:'resource', maxStack:25, description:'Міцна гартована сталь із металобрухту' },
            'obsidian':          { id:'obsidian',          name:'Вулканічний обсидіан',  icon:'obsidian_mat',  category:'resource', maxStack:20, description:'Надтвердий камінь, добутий із кратерів після виверження вулкану' },
            'obsidian_blade':    { id:'obsidian_blade',    name:'Обсидіановий клинок',   icon:'obsidian_sword',category:'weapon',   damage:70, maxStack:1, description:'Легендарний надгострий меч із застиглої лави (+70 шкоди)' },
            'obsidian_composite':{ id:'obsidian_composite',name:'Обсидіановий композит',icon:'obsidian_comp', category:'resource', maxStack:15, description:'Надміцний сплав сталі та вулканічного обсидіану' },
            'military_helmet':   { id:'military_helmet',   name:'Військова каска',       icon:'mil_helmet',    category:'armor',    armor:25, maxStack:1, description:'Балістичний шолом спецпризначення (+25% захисту від куль і поранень)' },
            'tactical_vest':     { id:'tactical_vest',     name:'Тактичний бронежилет',  icon:'mil_vest',      category:'armor',    armor:45, maxStack:1, description:'Важкий армійський бронежилет (+45% поглинання будь-якої шкоди)' },
            'military_uniform':  { id:'military_uniform',  name:'Камуфляжна форма',     icon:'mil_camo',      category:'armor',    armor:15, maxStack:1, description:'Армійський камуфляж (+15% швидкості бігу, знижує видимість для ворогів)' },
            'military_rifle':    { id:'military_rifle',    name:'Штурмова гвинтівка M16',icon:'mil_rifle',     category:'weapon',   range:true, damage:40, maxStack:1, description:'Швидкострільний військовий автомат із затонулого есмінця' },
            'naval_radar':       { id:'naval_radar',       name:'Морський радар',        icon:'naval_radar',   category:'tool',     maxStack:1,  description:'Прилад навігації: розкриває підводні об\'єкти, острови та рифи' },
            'undying_amulet':    { id:'undying_amulet',    name:'Амулет безсмертя',      icon:'amulet_undying',category:'relic',    maxStack:1,  description:'Реліквія Скрині Проклятих: рятує від смерті та миттєво зцілює 100 HP!' },
            'endless_flask':     { id:'endless_flask',     name:'Нескінченна фляга',     icon:'endless_flask', category:'food',     maxStack:1,  description:'Фляга живої води: втамовує спрагу та зцілює +20 HP, ніколи не вичерпується' },
            'torpedo_part':      { id:'torpedo_part',      name:'Частина торпеди',       icon:'torpedo_mat',   category:'resource', maxStack:2,  description:'Потужний військовий заряд із затонулого есмінця' }
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
            'diving_bell_item':  { id:'diving_bell_item',  name:'Водолазний дзвін',     result:{id:'diving_bell_item',count:1},  materials:[{id:'metal_scrap',count:8},{id:'glass_shard',count:4},{id:'rope',count:4}],      requires:'workbench' },

            // Рецепти копання та модульного будівництва
            'shovel':            { id:'shovel',            name:'Кам\'яна лопата',      result:{id:'shovel',count:1},            materials:[{id:'branch',count:3},{id:'stone',count:2},{id:'rope',count:1}],                 requires:null },
            'stick_wall_item':   { id:'stick_wall_item',   name:'Стіна з палиць',       result:{id:'stick_wall_item',count:1},   materials:[{id:'branch',count:4},{id:'fiber',count:2}],                                       requires:null },
            'stone_wall_item':   { id:'stone_wall_item',   name:'Кам\'яна стіна',       result:{id:'stone_wall_item',count:1},   materials:[{id:'stone',count:4},{id:'clay',count:2}],                                         requires:null },
            'stick_door_item':   { id:'stick_door_item',   name:'Двері з палиць',       result:{id:'stick_door_item',count:1},   materials:[{id:'branch',count:5},{id:'rope',count:1}],                                        requires:null },
            'stone_door_item':   { id:'stone_door_item',   name:'Кам\'яні двері',       result:{id:'stone_door_item',count:1},   materials:[{id:'stone',count:4},{id:'metal_scrap',count:2}],                                  requires:'workbench' },
            'wood_floor_item':   { id:'wood_floor_item',   name:'Дерев\'яна підлога',   result:{id:'wood_floor_item',count:1},   materials:[{id:'branch',count:3},{id:'wood',count:1}],                                        requires:null },
            'stone_floor_item':  { id:'stone_floor_item',  name:'Кам\'яний фундамент',  result:{id:'stone_floor_item',count:1},  materials:[{id:'stone',count:3},{id:'sand',count:1}],                                         requires:null },
            'thatched_roof_item':{ id:'thatched_roof_item',name:'Солом\'яний дах',      result:{id:'thatched_roof_item',count:1},materials:[{id:'fiber',count:4},{id:'branch',count:2}],                                       requires:null },
            'bunker_hatch_item': { id:'bunker_hatch_item', name:'Люк підземного бункера',result:{id:'bunker_hatch_item',count:1}, materials:[{id:'stone',count:8},{id:'wood',count:6},{id:'metal_scrap',count:4}],                requires:'workbench' },
            'leaf_bed_item':     { id:'leaf_bed_item',     name:'Ліжко з листя',        result:{id:'leaf_bed_item',count:1},     materials:[{id:'fiber',count:6},{id:'branch',count:4},{id:'wood',count:2}],                  requires:null },

            // Рецепти нового транспорту, бойового човна, печі, сигналізації та спорядження
            'buggy_item':        { id:'buggy_item',        name:'Саморобний баггі',     result:{id:'buggy_item',count:1},        materials:[{id:'metal_scrap',count:10},{id:'electronics',count:4},{id:'fuel',count:2},{id:'plank',count:4}], requires:'workbench' },
            'boat_gun_item':     { id:'boat_gun_item',     name:'Корабельний кулемет', result:{id:'boat_gun_item',count:1},      materials:[{id:'machinegun',count:1},{id:'metal_scrap',count:6},{id:'ammo',count:15}],      requires:'workbench' },
            'blast_furnace_item':{ id:'blast_furnace_item',name:'Доменна піч',        result:{id:'blast_furnace_item',count:1}, materials:[{id:'stone',count:10},{id:'clay',count:6},{id:'metal_scrap',count:4}],           requires:null },
            'alarm_system_item': { id:'alarm_system_item', name:'Охоронна сигналізація',result:{id:'alarm_system_item',count:1},materials:[{id:'electronics',count:3},{id:'metal_scrap',count:4},{id:'battery_item',count:1}],   requires:'workbench' },
            'obsidian_blade':    { id:'obsidian_blade',    name:'Обсидіановий клинок', result:{id:'obsidian_blade',count:1},    materials:[{id:'obsidian',count:3},{id:'steel_ingot',count:2},{id:'wood',count:2}],          requires:'workbench' },
            'military_uniform':  { id:'military_uniform',  name:'Камуфляжна форма',   result:{id:'military_uniform',count:1},  materials:[{id:'fiber',count:8},{id:'rope',count:2}],                                         requires:'workbench' },
            'tactical_vest':     { id:'tactical_vest',     name:'Тактичний бронежилет',result:{id:'tactical_vest',count:1},    materials:[{id:'steel_ingot',count:4},{id:'fiber',count:6}],                                  requires:'workbench' },
            'military_helmet':   { id:'military_helmet',   name:'Військова каска',     result:{id:'military_helmet',count:1},  materials:[{id:'steel_ingot',count:3},{id:'rope',count:1}],                                   requires:'workbench' }
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
            'diving_bell':   { id:'diving_bell',   name:'Водолазний дзвін',  width:48, height:48, passable:false, maxHealth:300, description:'Вхід у глибоководний режим',    func:'dive' },

            // Модульне будівництво (хати, бункери, стіни, підлога, дах)
            'stick_wall':   { id:'stick_wall',   name:'Стіна з палиць',        width:32, height:32, passable:false, maxHealth:180, description:'Легка стіна з гілок', cost:[{id:'branch',count:4},{id:'fiber',count:2}] },
            'stone_wall':   { id:'stone_wall',   name:'Кам\'яна стіна',        width:32, height:32, passable:false, maxHealth:500, description:'Міцна стіна з каменю та глини', cost:[{id:'stone',count:4},{id:'clay',count:2}] },
            'stick_door':   { id:'stick_door',   name:'Двері з палиць',        width:32, height:32, passable:true,  maxHealth:180, description:'Двері. Відкриваються на [E]', cost:[{id:'branch',count:5},{id:'rope',count:1}], func:'door' },
            'stone_door':   { id:'stone_door',   name:'Кам\'яні двері',        width:32, height:32, passable:true,  maxHealth:450, description:'Бронедвері для бункера [E]', cost:[{id:'stone',count:4},{id:'metal_scrap',count:2}], func:'door' },
            'wood_floor':   { id:'wood_floor',   name:'Дерев\'яна підлога',    width:32, height:32, passable:true,  isFloor:true, maxHealth:120, description:'Дерев\'яний настил підлоги', cost:[{id:'branch',count:3},{id:'wood',count:1}] },
            'stone_floor':  { id:'stone_floor',  name:'Кам\'яний фундамент',   width:32, height:32, passable:true,  isFloor:true, maxHealth:300, description:'Кам\'яна основа підлоги бункера', cost:[{id:'stone',count:3},{id:'sand',count:1}] },
            'thatched_roof':{ id:'thatched_roof',name:'Солом\'яний дах',       width:32, height:32, passable:true,  isRoof:true,  maxHealth:150, description:'Покрівля від дощу', cost:[{id:'fiber',count:4},{id:'branch',count:2}] },
            'bunker_hatch': { id:'bunker_hatch', name:'Люк підземного бункера',width:36, height:36, passable:false, maxHealth:600, description:'Вхід у підземний бункер [E]', cost:[{id:'stone',count:8},{id:'wood',count:6},{id:'metal_scrap',count:4}], func:'bunker_hatch' },
            'leaf_bed':     { id:'leaf_bed',     name:'Ліжко з листя',         width:40, height:26, passable:false, maxHealth:120, description:'Відпочинок і пропуск ночі [E]', cost:[{id:'fiber',count:6},{id:'branch',count:4},{id:'wood',count:2}], func:'bed' },

            // Станки та автоматизація бази
            'blast_furnace':{ id:'blast_furnace',name:'Доменна піч',          width:44, height:48, passable:false, maxHealth:600, description:'Переплавка скла, цегли, сталі та обсидіану [E]', func:'smelter' },
            'alarm_system': { id:'alarm_system', name:'Охоронна сигналізація',width:32, height:36, passable:false, maxHealth:300, description:'Сирена й прожектор при наближенні ворогів',       func:'alarm' }
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
                spotlight: false,
                hasGun: false
            };
            this.boatStorage = []; // 12 слотів на човні
            this.boatGunCd = 0;
            this.boatBullets = [];

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

            // 12. Підземний бункер гравця та копання
            this.inPlayerBunker = false;
            this.activeBunkerBuilding = null;
            this.bunkerStorage = [
                { id: 'canned_food', count: 3 },
                { id: 'water', count: 2 },
                { id: 'bandage', count: 2 }
            ];
            this.dugHoles = [];

            // 13. Саморобний всюдихід / Баггі
            this.buggy = {
                x: 32 * 32,
                y: 62 * 32,
                vx: 0,
                vy: 0,
                angle: 0,
                speed: 0,
                fuel: 100,
                maxFuel: 100,
                storage: [
                    { id: 'repair_kit', count: 1 },
                    { id: 'fuel', count: 3 },
                    { id: 'canned_food', count: 2 }
                ],
                active: true
            };

            // 14. Скриня Проклятих (Cursed Chest)
            this.cursedChest = {
                x: 62 * 32,
                y: 18 * 32,
                opened: false,
                sealed: true,
                wraiths: []
            };

            // 15. Затонулий військовий есмінець (Sunken Warship Dungeon)
            this.inWarshipDungeon = false;
            this.warship = {
                x: 16 * 32,
                y: 50 * 32,
                armoryBreached: false,
                lootedArmory: false,
                lootedBridge: false,
                lootedQuarters: false
            };

            // 16. Вулканічне виверження (Volcanic Eruption)
            this.volcanoTimer = 280 + Math.random() * 200;
            this.volcanoErupting = false;
            this.volcanoDuration = 0;
            this.volcanoBombs = [];
            this.obsidianRocks = [];
            this.screenShake = 0;

            // 17. Охоронні сигналізації
            this.alarmCooldown = 0;
        }

        // ─── ОНОВЛЕННЯ СИСТЕМ (Update Loop) ──────────────────────
        update(dt) {
            const p = this.game.player;
            if (!p) return;

            // Якщо гравець у власному підземному бункері — обмеження кімнатою та регенерація
            if (this.inPlayerBunker) {
                p.x = Math.max(130, Math.min(370, p.x));
                p.y = Math.max(140, Math.min(330, p.y));
                this.sanity = Math.min(this.maxSanity, this.sanity + 2.0 * dt);
                p.energy = Math.min(p.maxEnergy, p.energy + 0.5 * dt);
                this.updateHUD();
                return;
            }

            // Якщо гравець у затопленому військовому есмінці
            if (this.inWarshipDungeon) {
                this.updateWarshipDungeon(dt, p);
                this.updateHUD();
                return;
            }

            // Землетрус при виверженні
            if (this.screenShake > 0) {
                this.screenShake = Math.max(0, this.screenShake - dt * 0.7);
            }

            this.updateSanity(dt, p);
            this.updatePhantomIsland(dt, p);
            this.updateBosses(dt, p);
            this.updateSiege(dt, p);
            this.updateBoat(dt, p);
            this.updateCombatBoat(dt, p);
            this.updateBuggy(dt, p);
            this.updateDiving(dt, p);
            this.updateTurrets(dt, p);
            this.updateDisasters(dt, p);
            this.updateVolcano(dt, p);
            this.updateCursedChest(dt, p);
            this.updateAlarms(dt, p);
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
                if (p.inventory.hasItem('star_armor', 1)) reduction += 0.85;
                else if (p.inventory.hasItem('chitin_armor', 1)) reduction += 0.70;
                else if (p.inventory.hasItem('metal_armor', 1)) reduction += 0.35;

                // Армійське екіпірування
                if (p.inventory.hasItem('tactical_vest', 1)) reduction += 0.45;
                if (p.inventory.hasItem('military_helmet', 1)) reduction += 0.25;
                if (p.inventory.hasItem('military_uniform', 1)) reduction += 0.15;
            }
            reduction = Math.min(0.88, reduction);
            const finalDmg = Math.max(2, Math.round(rawDmg * (1 - reduction)));

            // Перевірка Амулета безсмертя
            if (p.health - finalDmg <= 0 && p.inventory && p.inventory.hasItem('undying_amulet', 1)) {
                p.inventory.removeItem('undying_amulet', 1);
                p.health = 100;
                this.sanity = Math.min(this.maxSanity, this.sanity + 50);
                this.game.spawnParticles(p.x, p.y, '#F59E0B', 35);
                this.game.showNotification('✨ Амулет безсмертя розсипався на порох та врятував ваше життя! Здоров\'я відновлено!', 'success');
                MegaAudio.playTone(880, 0.5, 'sine', 0.4);
                return;
            }

            p.health = Math.max(0, p.health - finalDmg);
            this.sanity = Math.max(0, this.sanity - 5);
            this.game.showNotification(`⚠️ -${finalDmg} HP від ${source}!`, 'danger');
        }

        // Завдати урон босу від гравця
        attackBoss(boss, weaponId) {
            let dmg = 20;
            if (weaponId === 'obsidian_blade') dmg = 70;
            else if (weaponId === 'meteor_blade') dmg = 65;
            else if (weaponId === 'military_rifle') dmg = 40;
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

        // 12. Копання землі та видобуток ресурсів
        dig(x, y) {
            const p = this.game.player;
            if (!p) return;
            if (p.energy < 3) {
                this.game.showNotification('Втомилися. Немає енергії для копання!', 'warning');
                return;
            }
            p.energy = Math.max(0, p.energy - 3);
            if (window.soundSystem) window.soundSystem.playMine();
            MegaAudio.playTone(220, 0.12, 'sawtooth', 0.2);
            if (this.game.spawnParticles) this.game.spawnParticles(p.x, p.y, '#8B5A2B', 15);

            const inv = p.inventory;
            const drops = [];
            const r = Math.random();
            if (r < 0.65) { inv.addItem('clay', 1 + Math.floor(Math.random() * 2)); drops.push('глину'); }
            if (Math.random() < 0.55) { inv.addItem('sand', 1 + Math.floor(Math.random() * 2)); drops.push('пісок'); }
            if (Math.random() < 0.40) { inv.addItem('stone', 1); drops.push('каміння'); }
            if (Math.random() < 0.35) { inv.addItem('worm', 1); drops.push('черв\'яка'); }
            if (Math.random() < 0.10) {
                const treasures = ['gold_coin', 'metal_scrap', 'bunker_key_fragment'];
                const found = treasures[Math.floor(Math.random() * treasures.length)];
                inv.addItem(found, 1);
                drops.push(`скарб (${window.ITEM_DB[found]?.name || found})`);
                MegaAudio.playSonar();
            }

            p.xp = (p.xp || 0) + 10;
            if (drops.length) {
                this.game.showNotification(`⛏️ Викопано: ${drops.join(', ')}! (+10 XP)`, 'success');
            } else {
                this.game.showNotification('⛏️ Ви поглибили яму. Продовжуйте копати!', 'info');
            }
        }

        // 13. Підземний бункер та житло
        enterPlayerBunker(hatch) {
            const p = this.game.player;
            if (!p) return;
            p.surfaceX = p.x;
            p.surfaceY = p.y;
            this.inPlayerBunker = true;
            this.activeBunkerBuilding = hatch;
            p.x = 250;
            p.y = 220;
            MegaAudio.playTone(100, 0.35, 'square', 0.25);
            this.game.showNotification('🕳️ Ви спустилися у свій підземний бункер. Тут тихо та безпечно!', 'success');
        }

        exitPlayerBunker() {
            const p = this.game.player;
            if (!p) return;
            this.inPlayerBunker = false;
            p.x = p.surfaceX || (this.activeBunkerBuilding ? this.activeBunkerBuilding.x + 32 : p.x);
            p.y = p.surfaceY || (this.activeBunkerBuilding ? this.activeBunkerBuilding.y + 32 : p.y);
            this.activeBunkerBuilding = null;
            MegaAudio.playTone(400, 0.15, 'sine', 0.2);
            this.game.showNotification('☀️ Ви піднялися на поверхню острова.', 'info');
        }

        sleepInBed() {
            const p = this.game.player;
            if (!p) return;
            const isNight = this.game.timeSystem && this.game.timeSystem.isNight();
            if (!isNight && p.energy > 45) {
                this.game.showNotification('🛌 Ви ще не втомилися. Спати можна вночі або при низькій енергії.', 'info');
                return;
            }

            // Перемотка ночі на 06:00
            if (this.game.timeSystem) {
                this.game.timeSystem.time = 6.0;
                this.game.timeSystem.day = (this.game.timeSystem.day || 1) + 1;
            }
            p.energy = Math.min(p.maxEnergy, p.energy + 60);
            p.health = Math.min(p.maxHealth, p.health + 25);
            this.sanity = Math.min(this.maxSanity, this.sanity + 40);
            MegaAudio.playTone(523, 0.5, 'sine', 0.2);
            this.game.showNotification('😴 Ви міцно поспали. Настав новий ранок! Енергію та психіку відновлено.', 'success');
            if (window.updateHUD) window.updateHUD();
        }

        toggleDoor(door) {
            door.isOpen = !door.isOpen;
            door.passable = door.isOpen;
            MegaAudio.playTone(door.isOpen ? 440 : 220, 0.1, 'triangle', 0.2);
            this.game.showNotification(door.isOpen ? '🚪 Двері відчинено' : '🚪 Двері зачинено', 'info');
        }

        renderBunkerRoom(ctx) {
            const time = performance.now() / 1000;
            ctx.fillStyle = '#070A10';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

            const rw = 320, rh = 240;
            const rx = (ctx.canvas.width - rw) / 2;
            const ry = (ctx.canvas.height - rh) / 2;

            // Кам'яні стіни підземелля
            ctx.fillStyle = '#1E293B';
            ctx.fillRect(rx - 16, ry - 16, rw + 32, rh + 32);
            ctx.strokeStyle = '#334155'; ctx.lineWidth = 4;
            ctx.strokeRect(rx - 16, ry - 16, rw + 32, rh + 32);

            // Підлога з дощок
            ctx.fillStyle = '#78350F';
            ctx.fillRect(rx, ry, rw, rh);
            ctx.strokeStyle = '#451A03'; ctx.lineWidth = 1;
            for (let py = ry + 20; py < ry + rh; py += 20) {
                ctx.beginPath(); ctx.moveTo(rx, py); ctx.lineTo(rx + rw, py); ctx.stroke();
            }

            // Балки перекриття стелі
            ctx.fillStyle = '#451A03';
            ctx.fillRect(rx, ry, rw, 10);
            ctx.fillRect(rx, ry + rh - 10, rw, 10);
            ctx.fillRect(rx, ry, 10, rh);
            ctx.fillRect(rx + rw - 10, ry, 10, rh);

            // Драбина виходу нагору (по центру вгорі)
            ctx.fillStyle = '#B45309';
            ctx.fillRect(rx + rw/2 - 14, ry, 28, 40);
            ctx.strokeStyle = '#FDE047'; ctx.lineWidth = 2;
            for (let ly = ry + 8; ly < ry + 36; ly += 8) {
                ctx.beginPath(); ctx.moveTo(rx + rw/2 - 12, ly); ctx.lineTo(rx + rw/2 + 12, ly); ctx.stroke();
            }
            ctx.fillStyle = '#FDE047';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('[E] Вийти на острів', rx + rw/2, ry + 54);

            // Підземне ліжко (ліворуч внизу)
            ctx.fillStyle = '#78350F';
            ctx.fillRect(rx + 20, ry + rh - 60, 64, 44);
            ctx.fillStyle = '#15803D';
            ctx.fillRect(rx + 24, ry + rh - 56, 56, 36);
            ctx.fillStyle = '#FEF08A';
            ctx.fillRect(rx + 26, ry + rh - 54, 16, 16);
            ctx.fillStyle = '#86EFAC';
            ctx.font = 'bold 11px sans-serif';
            ctx.fillText('[E] Спати', rx + 52, ry + rh - 66);

            // Скриня бункера (праворуч внизу)
            ctx.fillStyle = '#B45309';
            ctx.fillRect(rx + rw - 64, ry + rh - 50, 44, 34);
            ctx.fillStyle = '#F59E0B';
            ctx.fillRect(rx + rw - 64, ry + rh - 38, 44, 6);
            ctx.fillStyle = '#FBBF24';
            ctx.font = 'bold 11px sans-serif';
            ctx.fillText('[E] Сховище', rx + rw - 42, ry + rh - 56);

            // Підвісний ліхтар по центру
            const lx = rx + rw/2;
            const ly = ry + rh/2;
            ctx.strokeStyle = '#475569'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(lx, ry); ctx.lineTo(lx, ly - 20); ctx.stroke();

            // Тепле сяйво лампи
            const grad = ctx.createRadialGradient(lx, ly, 10, lx, ly, 150);
            grad.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
            grad.addColorStop(0.5, 'rgba(245, 158, 11, 0.15)');
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath(); ctx.arc(lx, ly, 150, 0, Math.PI * 2); ctx.fill();

            // Лампа
            ctx.fillStyle = '#FEF08A';
            ctx.beginPath(); ctx.arc(lx, ly - 14, 8 + Math.sin(time * 4) * 0.8, 0, Math.PI * 2); ctx.fill();

            // Відмальовування гравця у кімнаті бункера
            const p = this.game.player;
            if (p) {
                const px = rx + Math.max(30, Math.min(rw - 30, (p.x - 130) * (rw / 240)));
                const py = ry + Math.max(30, Math.min(rh - 30, (p.y - 140) * (rh / 190)));
                ctx.fillStyle = '#0284C7';
                ctx.beginPath(); ctx.arc(px, py, 14, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#FCD34D';
                ctx.beginPath(); ctx.arc(px, py - 10, 7, 0, Math.PI * 2); ctx.fill();
            }

            ctx.fillStyle = '#38BDF8';
            ctx.font = 'bold 15px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('🛡️ ВАШ ПІДЗЕМНИЙ БУНКЕР (БЕЗПЕЧНА ЗОНА)', rx + rw/2, ry - 24);
        }

        // 14. Баггі (Всюдихід)
        updateBuggy(dt, p) {
            if (!this.buggy || !this.buggy.active) return;
            const b = this.buggy;

            if (p.inBuggy) {
                p.x = b.x;
                p.y = b.y;
                p.energy = Math.min(p.maxEnergy, p.energy + dt * 1.5);

                const input = this.game.input ? this.game.input.getMovement() : { x: 0, y: 0 };
                const isMoving = input.x !== 0 || input.y !== 0;

                if (isMoving) {
                    const targetAngle = Math.atan2(input.y, input.x);
                    let diff = targetAngle - b.angle;
                    while (diff < -Math.PI) diff += Math.PI * 2;
                    while (diff > Math.PI) diff -= Math.PI * 2;
                    b.angle += diff * Math.min(1, dt * 7);

                    const maxSpd = b.fuel > 0 ? 250 : 45;
                    b.speed = Math.min(maxSpd, b.speed + dt * 320);
                    b.fuel = Math.max(0, b.fuel - dt * 0.05);

                    const nx = b.x + Math.cos(b.angle) * b.speed * dt;
                    const ny = b.y + Math.sin(b.angle) * b.speed * dt;

                    const world = this.game.world;
                    let canDrive = true;
                    if (world) {
                        const tx = Math.floor(nx / world.tileSize);
                        const ty = Math.floor(ny / world.tileSize);
                        const t = world.getTile(tx, ty);
                        if (t === 0) { // Глибокий океан
                            canDrive = false;
                            b.speed = -30;
                            this.game.showNotification('⚠️ Баггі зупинився перед глибоким океаном!', 'info');
                        }
                    }

                    if (canDrive) {
                        b.x = nx;
                        b.y = ny;
                        p.x = nx;
                        p.y = ny;
                    }

                    if (Math.random() < 0.35) {
                        const isWater = world && world.getTile(Math.floor(b.x/world.tileSize), Math.floor(b.y/world.tileSize)) === 1;
                        this.game.spawnParticles(b.x - Math.cos(b.angle) * 18, b.y - Math.sin(b.angle) * 18, isWater ? '#93C5FD' : '#D97706', 2);
                    }
                } else {
                    b.speed = Math.max(0, b.speed - dt * 450);
                }
            }
        }

        enterBuggy() {
            const p = this.game.player;
            if (!p || p.inBoat || this.inPlayerBunker) return;
            p.inBuggy = true;
            this.game.showNotification('🚗 Ви сіли в баггі! [WASD] — кермувати, [E] — вийти, [G] — багажник', 'success');
            MegaAudio.playTone(180, 0.2, 'sawtooth', 0.25);
        }

        exitBuggy() {
            const p = this.game.player;
            if (!p) return;
            p.inBuggy = false;
            p.x = this.buggy.x + Math.cos(this.buggy.angle + Math.PI / 2) * 28;
            p.y = this.buggy.y + Math.sin(this.buggy.angle + Math.PI / 2) * 28;
            this.game.showNotification('Ви вийшли з баггі.', 'info');
            MegaAudio.playTone(220, 0.1, 'sine', 0.2);
        }

        openBuggyStorage() {
            if (window.openChestUI) {
                window.openChestUI({ inventory: this.buggy.storage, type: 'buggy_chest', x: this.buggy.x, y: this.buggy.y });
            }
        }

        // 15. Корабельний кулемет (Combat Boat)
        updateCombatBoat(dt, p) {
            if (this.boatGunCd > 0) this.boatGunCd -= dt;

            for (let i = this.boatBullets.length - 1; i >= 0; i--) {
                const b = this.boatBullets[i];
                b.x += b.vx * dt;
                b.y += b.vy * dt;
                b.life -= dt;

                let hit = false;
                if (this.game.zombieManager?.zombies) {
                    for (let z of this.game.zombieManager.zombies) {
                        if (Math.hypot(z.x - b.x, z.y - b.y) < 22) {
                            z.health -= 35; hit = true;
                            this.game.spawnParticles(b.x, b.y, '#EF4444', 4);
                            break;
                        }
                    }
                }
                if (!hit && this.game.pirateManager?.pirates) {
                    for (let pir of this.game.pirateManager.pirates) {
                        if (Math.hypot(pir.x - b.x, pir.y - b.y) < 22) {
                            pir.health -= 35; hit = true;
                            this.game.spawnParticles(b.x, b.y, '#EF4444', 4);
                            break;
                        }
                    }
                }
                if (!hit && this.bosses) {
                    for (let boss of this.bosses) {
                        if (boss.active && Math.hypot(boss.x - b.x, boss.y - b.y) < 36) {
                            boss.health -= 35; hit = true;
                            this.game.spawnParticles(b.x, b.y, '#F59E0B', 5);
                            break;
                        }
                    }
                }

                if (hit || b.life <= 0) {
                    this.boatBullets.splice(i, 1);
                }
            }
        }

        fireBoatGun() {
            const p = this.game.player;
            if (!p || !p.inBoat || !this.boatUpgrades.hasGun) return;
            if (this.boatGunCd > 0) return;
            this.boatGunCd = 0.13;

            const hasAmmo = p.inventory && p.inventory.hasItem('ammo', 1);
            if (!hasAmmo) {
                this.game.showNotification('⚠️ Закінчилися патрони для корабельного кулемета!', 'warning');
                return;
            }
            p.inventory.removeItem('ammo', 1);

            const mouse = this.game.mouse || { x: p.x + 60, y: p.y };
            const angle = Math.atan2(mouse.y - p.y, mouse.x - p.x);
            const spd = 550;

            this.boatBullets.push({
                x: p.x + Math.cos(angle) * 20,
                y: p.y + Math.sin(angle) * 20,
                vx: Math.cos(angle + (Math.random() - 0.5) * 0.08) * spd,
                vy: Math.sin(angle + (Math.random() - 0.5) * 0.08) * spd,
                life: 1.3
            });

            if (window.soundSystem) window.soundSystem.playGunshot('machinegun');
            MegaAudio.playTone(340, 0.05, 'sawtooth', 0.22);
            this.game.spawnParticles(p.x + Math.cos(angle) * 24, p.y + Math.sin(angle) * 24, '#FBBF24', 3);
        }

        // 16. Вулканічне виверження (Volcano Eruption)
        updateVolcano(dt, p) {
            this.volcanoTimer -= dt;
            if (this.volcanoTimer <= 0 && !this.volcanoErupting) {
                this.startVolcanicEruption();
            }

            if (this.volcanoErupting) {
                this.volcanoDuration -= dt;
                this.screenShake = Math.max(0.3, this.screenShake);

                this.bombInterval = (this.bombInterval || 0) - dt;
                if (this.bombInterval <= 0) {
                    this.bombInterval = 1.5 + Math.random() * 0.8;
                    const vPos = { x: 22 * 32, y: 22 * 32 };
                    const angle = Math.random() * Math.PI * 2;
                    const dist = 60 + Math.random() * 380;
                    this.volcanoBombs.push({
                        startX: vPos.x, startY: vPos.y,
                        targetX: vPos.x + Math.cos(angle) * dist,
                        targetY: vPos.y + Math.sin(angle) * dist,
                        t: 0,
                        duration: 1.8 + Math.random() * 0.5
                    });
                }

                if (this.volcanoDuration <= 0) {
                    this.volcanoErupting = false;
                    this.volcanoTimer = 500 + Math.random() * 250;
                    this.game.showNotification('🌋 Вулкан заспокоївся! На землі застигли уламки цінного обсидіану!', 'info');
                }
            }

            for (let i = this.volcanoBombs.length - 1; i >= 0; i--) {
                const b = this.volcanoBombs[i];
                b.t += dt / b.duration;
                if (b.t >= 1) {
                    this.game.spawnParticles(b.targetX, b.targetY, '#EA580C', 20);
                    this.game.spawnParticles(b.targetX, b.targetY, '#78350F', 15);
                    MegaAudio.playExplosion();

                    if (Math.hypot(p.x - b.targetX, p.y - b.targetY) < 65) {
                        this.damagePlayer(35, 'Лавова бомба вулкану');
                    }

                    this.obsidianRocks.push({
                        id: 'obs_' + Date.now() + Math.random(),
                        x: b.targetX,
                        y: b.targetY,
                        health: 60,
                        mined: false
                    });

                    this.volcanoBombs.splice(i, 1);
                }
            }
        }

        startVolcanicEruption() {
            this.volcanoErupting = true;
            this.volcanoDuration = 32;
            this.screenShake = 1.0;
            MegaAudio.playExplosion();
            this.game.showNotification('🌋 ЗЕМЛЕТРУС! Вулкан прокинувся і починає виверження!', 'danger');
            this.addLore('volcano_eruption', 'Виверження вулкана', 'Вулкан архіпелагу активувався. Лавові бомби залишають на землі застиглий надтвердий обсидіан.');
        }

        mineObsidian(rock) {
            const p = this.game.player;
            rock.health -= 25;
            this.game.spawnParticles(rock.x, rock.y, '#7C3AED', 5);
            if (window.soundSystem) window.soundSystem.playMine();

            if (rock.health <= 0) {
                rock.mined = true;
                p.inventory.addItem('obsidian', 3);
                this.game.showNotification('⛏️ Видобуто 3 уламки вулканічного обсидіану!', 'success');
                MegaAudio.playTone(300, 0.1, 'sine', 0.25);
            }
        }

        // 17. Скриня Проклятих (Cursed Chest)
        updateCursedChest(dt, p) {
            const cc = this.cursedChest;
            if (cc.opened) return;

            for (let i = cc.wraiths.length - 1; i >= 0; i--) {
                const w = cc.wraiths[i];
                if (!w.active) continue;

                const d = Math.hypot(p.x - w.x, p.y - w.y);
                if (d > 20) {
                    w.x += ((p.x - w.x) / d) * w.speed * dt;
                    w.y += ((p.y - w.y) / d) * w.speed * dt;
                }

                w.attackCd = (w.attackCd || 0) - dt;
                if (d < 35 && w.attackCd <= 0) {
                    w.attackCd = 1.3;
                    this.damagePlayer(18, 'Привид Скрині Проклятих');
                    this.game.spawnParticles(p.x, p.y, '#A855F7', 6);
                }

                if (w.health <= 0) {
                    w.active = false;
                    this.game.spawnParticles(w.x, w.y, '#C084FC', 15);
                    this.game.showNotification('👻 Привид знищений!', 'success');
                }
            }

            if (cc.wraiths.length > 0 && cc.wraiths.every(w => !w.active) && cc.sealed) {
                cc.sealed = false;
                cc.opened = true;
                this.game.spawnParticles(cc.x, cc.y, '#F59E0B', 30);
                this.game.showNotification('✨ Прокляття знято! Скриня відкрилася і дарує Амулет безсмертя та Нескінченну флягу!', 'success');
                MegaAudio.playTone(880, 0.4, 'sine', 0.4);
                p.inventory.addItem('undying_amulet', 1);
                p.inventory.addItem('endless_flask', 1);
                this.addLore('cursed_chest_lore', 'Скриня Проклятих', 'Древня скриня була захищена примарами. Всередині лежав артефакт, здатний відвернути неминучу смерть.');
            }
        }

        triggerCursedChest() {
            const cc = this.cursedChest;
            if (cc.opened) {
                this.game.showNotification('Скриня Проклятих уже пуста.', 'info');
                return;
            }
            if (cc.wraiths.length > 0 && cc.wraiths.some(w => w.active)) {
                this.game.showNotification('⚠️ Спочатку здолайте всіх фантомів!', 'danger');
                return;
            }

            cc.wraiths = [];
            for (let i = 0; i < 4; i++) {
                const angle = (i / 4) * Math.PI * 2;
                cc.wraiths.push({
                    id: 'wraith_' + i,
                    x: cc.x + Math.cos(angle) * 70,
                    y: cc.y + Math.sin(angle) * 70,
                    health: 90,
                    speed: 55,
                    attackCd: 1.0,
                    active: true
                });
            }
            MegaAudio.playTone(130, 0.4, 'sawtooth', 0.4);
            this.game.showNotification('🔮 ПРОКЛЯТТЯ СКРИНІ! Знищіть привидів, щоб зняти печатку!', 'danger');
        }

        attackWraith(wraith, toolId) {
            const dmg = window.ITEM_DB[toolId]?.damage || 25;
            wraith.health -= dmg;
            this.game.spawnParticles(wraith.x, wraith.y, '#C084FC', 5);
            MegaAudio.playTone(200, 0.08, 'sawtooth', 0.2);
        }

        // 18. Охоронні сигналізації бази
        updateAlarms(dt, p) {
            if (!this.game.buildingSystem) return;
            const alarms = this.game.buildingSystem.buildings.filter(b => b.type === 'alarm_system');
            if (!alarms.length) return;

            let enemies = [];
            if (this.game.zombieManager?.zombies) enemies.push(...this.game.zombieManager.zombies);
            if (this.game.pirateManager?.pirates) enemies.push(...this.game.pirateManager.pirates);
            if (this.activeSiegePirates) enemies.push(...this.activeSiegePirates);

            for (let a of alarms) {
                a.beaconAngle = ((a.beaconAngle || 0) + dt * 8) % (Math.PI * 2);
                let detected = false;

                for (let e of enemies) {
                    if (Math.hypot(e.x - a.x, e.y - a.y) < 250) {
                        detected = true;
                        break;
                    }
                }

                if (detected) {
                    a.alert = true;
                    this.alarmCooldown = (this.alarmCooldown || 0) - dt;
                    if (this.alarmCooldown <= 0) {
                        this.alarmCooldown = 1.8;
                        this.game.showNotification('🚨 ТРИВОГА! Вороги помічені датчиками біля бази!', 'danger');
                        MegaAudio.playTone(750, 0.15, 'sawtooth', 0.35);
                        setTimeout(() => MegaAudio.playTone(550, 0.15, 'sawtooth', 0.35), 180);
                    }
                } else {
                    a.alert = false;
                }
            }
        }

        // ─── ОНОВЛЕННЯ HUD (Sanity Bar) ──────────────────────
        updateHUD() {
            const bar = document.getElementById('hud-sanity');
            const txt = document.getElementById('hud-sanity-text');
            if (bar) bar.style.width = `${Math.max(0, (this.sanity / this.maxSanity) * 100)}%`;
            if (txt) txt.textContent = `${Math.round(this.sanity)}/100`;
        }

        // 19. Затонулий есмінець (Warship Dungeon)
        enterWarshipDungeon() {
            this.inWarshipDungeon = true;
            const p = this.game.player;
            p.prevX = p.x;
            p.prevY = p.y;
            p.x = 240;
            p.y = 150;
            this.game.showNotification('🌊 Ви спустилися у затоплений есмінець "Привид"! [E] біля драбини — вихід', 'info');
            this.addLore('warship_entry', 'Затонулий есмінець', 'Військовий корабель затонув біля рифів під час таємної місії. У герметичному арсеналі захована армійська зброя.');
        }

        exitWarshipDungeon() {
            this.inWarshipDungeon = false;
            const p = this.game.player;
            p.x = p.prevX || this.warship.x + 32;
            p.y = p.prevY || this.warship.y;
            this.game.showNotification('Ви піднялися на поверхню океану.', 'info');
        }

        updateWarshipDungeon(dt, p) {
            p.x = Math.max(140, Math.min(380, p.x));
            p.y = Math.max(140, Math.min(340, p.y));

            // Повітряна кишеня біля драбини
            if (Math.hypot(p.x - 240, p.y - 150) < 65) {
                this.oxygen = Math.min(this.maxOxygen, this.oxygen + dt * 25);
            } else {
                this.oxygen = Math.max(0, this.oxygen - dt * 2.5);
                if (this.oxygen <= 0) {
                    this.damagePlayer(12 * dt, 'Брак кисню у затопленому відсіку');
                }
            }
        }

        renderWarshipDungeon(ctx) {
            ctx.save();
            ctx.fillStyle = '#081826';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

            const rx = 120, ry = 110, rw = 280, rh = 250;
            ctx.fillStyle = '#1E293B';
            ctx.fillRect(rx, ry, rw, rh);
            ctx.strokeStyle = '#475569';
            ctx.lineWidth = 4;
            ctx.strokeRect(rx, ry, rw, rh);

            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(rx + rw / 2, ry); ctx.lineTo(rx + rw / 2, ry + rh);
            ctx.moveTo(rx, ry + rh / 2); ctx.lineTo(rx + rw, ry + rh / 2);
            ctx.stroke();

            // Драбина виходу на поверхню
            ctx.fillStyle = '#E2E8F0';
            ctx.fillRect(235, 120, 14, 30);
            ctx.fillStyle = '#38BDF8';
            ctx.font = 'bold 11px sans-serif';
            ctx.fillText('Драбина [E]', 220, 115);

            // Торпедний відсік
            ctx.fillStyle = '#64748B';
            ctx.fillRect(140, 200, 36, 12);
            ctx.fillRect(140, 220, 36, 12);
            ctx.fillStyle = '#94A3B8';
            ctx.fillText('Торпеди [E]', 138, 195);

            // Радіорубка / Радар
            ctx.fillStyle = '#059669';
            ctx.fillRect(320, 140, 30, 20);
            ctx.fillStyle = '#34D399';
            ctx.fillText(this.warship.lootedBridge ? 'Радар (Знято)' : 'Радар [E]', 315, 135);

            // Броньований арсенал
            ctx.fillStyle = this.warship.armoryBreached ? '#10B981' : '#DC2626';
            ctx.fillRect(320, 280, 40, 28);
            ctx.fillStyle = '#FEF08A';
            ctx.fillText(this.warship.armoryBreached ? 'Арсенал [E]' : 'Бронедвері [E]', 310, 275);

            // Затоплений ефект
            ctx.fillStyle = 'rgba(6, 78, 59, 0.25)';
            ctx.fillRect(rx, ry, rw, rh);

            // Гравець у відсіку
            const p = this.game.player;
            if (p) {
                ctx.fillStyle = '#0284C7';
                ctx.beginPath(); ctx.arc(p.x, p.y, 14, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#FCD34D';
                ctx.beginPath(); ctx.arc(p.x, p.y - 10, 7, 0, Math.PI * 2); ctx.fill();
            }

            ctx.fillStyle = '#38BDF8';
            ctx.font = 'bold 15px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('⚓ ЗАТОПЛЕНИЙ ЕСМІНЕЦЬ "ПРИВИД"', rx + rw/2, ry - 22);

            ctx.restore();
        }

        // 20. Доменна піч UI (Smelter)
        openSmelterUI() {
            const p = document.getElementById('panel-smelter');
            if (!p) return;
            p.classList.remove('hidden');
            p.style.display = 'flex';

            const container = document.getElementById('smelter-recipes');
            if (!container) return;

            const recipes = [
                { title: '⏳ Загартоване скло', cost: '2 Будівельний пісок', req: [{ id: 'sand', count: 2 }], res: { id: 'glass', count: 1 }, desc: 'Термостійке скло для ліхтарів та прицілів' },
                { title: '🧱 Будівельна цегла', cost: '2 Глина', req: [{ id: 'clay', count: 2 }], res: { id: 'brick', count: 1 }, desc: 'Міцна цегла для вогнетривких бункерів' },
                { title: '⚔️ Сталевий злиток', cost: '3 Металобрухт', req: [{ id: 'metal_scrap', count: 3 }], res: { id: 'steel_ingot', count: 1 }, desc: 'Високоякісна загартована збройова сталь' },
                { title: '🔮 Обсидіановий сплав', cost: '2 Обсидіан + 1 Сталь', req: [{ id: 'obsidian', count: 2 }, { id: 'steel_ingot', count: 1 }], res: { id: 'obsidian_composite', count: 1 }, desc: 'Надміцний композит вулканічного рівня' }
            ];

            const playerInv = this.game.player.inventory;
            container.innerHTML = recipes.map((r, idx) => {
                const canCraft = r.req.every(item => playerInv.hasItem(item.id, item.count));
                return `
                    <div class="smelter-card">
                        <div>
                            <div style="font-weight:bold; color:#F97316; font-size:1.05rem;">${r.title}</div>
                            <div style="font-size:0.85rem; color:#94A3B8; margin:2px 0;">Потрібно: <span style="color:#FEF08A;">${r.cost}</span></div>
                            <div style="font-size:0.8rem; color:#64748B;">${r.desc}</div>
                        </div>
                        <button class="smelt-btn" onclick="window.smeltRecipe(${idx})" ${canCraft ? '' : 'disabled'}>
                            ${canCraft ? 'Виплавити' : 'Бракує ресурсів'}
                        </button>
                    </div>
                `;
            }).join('');
        }

        // ─── ВІДМАЛЬОВУВАННЯ НА CANVAS (Render) ──────────────────
        render(ctx, camera) {
            // Якщо гравець у власному підземному бункері
            if (this.inPlayerBunker) {
                this.renderBunkerRoom(ctx);
                return;
            }

            // Якщо гравець у затопленому військовому есмінці
            if (this.inWarshipDungeon) {
                this.renderWarshipDungeon(ctx);
                return;
            }

            ctx.save();
            const time = performance.now() / 1000;
            const p = this.game.player;

            // Ефект тремтіння екрана від землетрусу
            if (this.screenShake > 0) {
                const s = this.screenShake * 5;
                ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
            }

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
                ctx.fillStyle = '#EF4444';
                ctx.beginPath();
                ctx.arc(sp.x - 4, sp.y - 3, 2, 0, Math.PI * 2);
                ctx.arc(sp.x + 4, sp.y - 3, 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }

            // 3. Затонулий військовий есмінець в океані
            if (this.warship && camera.isVisible(this.warship.x, this.warship.y)) {
                const sp = camera.worldToScreen(this.warship.x, this.warship.y);
                ctx.save();
                ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
                ctx.beginPath();
                ctx.ellipse(sp.x, sp.y, 52, 24, -0.2, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#38BDF8'; ctx.lineWidth = 1.5;
                ctx.stroke();
                // Бульбашки
                ctx.fillStyle = 'rgba(147, 197, 253, 0.6)';
                ctx.beginPath();
                ctx.arc(sp.x - 10, sp.y - 12 + Math.sin(time * 3) * 6, 4, 0, Math.PI * 2);
                ctx.arc(sp.x + 12, sp.y - 18 + Math.cos(time * 3) * 6, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#38BDF8';
                ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center';
                ctx.fillText('Затонулий есмінець [E]', sp.x, sp.y - 28);
                ctx.restore();
            }

            // 4. Скриня Проклятих та примари
            if (this.cursedChest && camera.isVisible(this.cursedChest.x, this.cursedChest.y)) {
                const sp = camera.worldToScreen(this.cursedChest.x, this.cursedChest.y);
                ctx.save();
                // Фіолетова містична аура
                ctx.fillStyle = 'rgba(147, 51, 234, 0.25)';
                ctx.beginPath();
                ctx.arc(sp.x, sp.y, 35 + Math.sin(time * 4) * 5, 0, Math.PI * 2);
                ctx.fill();
                // Скриня
                ctx.fillStyle = this.cursedChest.opened ? '#4C1D95' : '#1E1B4B';
                ctx.fillRect(sp.x - 14, sp.y - 10, 28, 20);
                ctx.strokeStyle = '#C084FC'; ctx.lineWidth = 2;
                ctx.strokeRect(sp.x - 14, sp.y - 10, 28, 20);
                ctx.fillStyle = '#E9D5FF';
                ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
                ctx.fillText(this.cursedChest.opened ? 'Відкрито ✨' : 'Скриня Проклятих [E]', sp.x, sp.y - 15);
                ctx.restore();

                // Привиди скрині
                for (let w of this.cursedChest.wraiths) {
                    if (!w.active || !camera.isVisible(w.x, w.y)) continue;
                    const wsp = camera.worldToScreen(w.x, w.y);
                    ctx.save();
                    ctx.fillStyle = 'rgba(168, 85, 247, 0.7)';
                    ctx.beginPath(); ctx.arc(wsp.x, wsp.y + Math.sin(time * 6) * 3, 14, 0, Math.PI * 2); ctx.fill();
                    ctx.fillStyle = '#F43F5E';
                    ctx.beginPath(); ctx.arc(wsp.x - 4, wsp.y - 2, 2.5, 0, Math.PI * 2);
                    ctx.arc(wsp.x + 4, wsp.y - 2, 2.5, 0, Math.PI * 2); ctx.fill();
                    ctx.restore();
                }
            }

            // 5. Баггі (Всюдихід)
            if (this.buggy && this.buggy.active && camera.isVisible(this.buggy.x, this.buggy.y)) {
                const sp = camera.worldToScreen(this.buggy.x, this.buggy.y);
                ctx.save();
                ctx.translate(sp.x, sp.y);
                ctx.rotate(this.buggy.angle);

                // Конуси світла фар
                ctx.fillStyle = 'rgba(254, 240, 138, 0.22)';
                ctx.beginPath();
                ctx.moveTo(18, -6); ctx.lineTo(130, -35); ctx.lineTo(130, 35); ctx.lineTo(18, 6);
                ctx.closePath(); ctx.fill();

                // 4 великі позашляхові колеса
                ctx.fillStyle = '#0F172A';
                ctx.fillRect(-18, -16, 12, 7); // заднє ліве
                ctx.fillRect(-18, 9, 12, 7);   // заднє праве
                ctx.fillRect(8, -16, 12, 7);   // переднє ліве
                ctx.fillRect(8, 9, 12, 7);     // переднє праве

                // Кузов баггі
                ctx.fillStyle = '#D97706'; // помаранчевий металевий корпус
                ctx.fillRect(-14, -10, 28, 20);
                // Каркас безпеки (труби)
                ctx.strokeStyle = '#1E293B'; ctx.lineWidth = 2.5;
                ctx.strokeRect(-12, -9, 24, 18);
                ctx.beginPath(); ctx.moveTo(-12, -9); ctx.lineTo(12, 9); ctx.stroke();

                // Водій у баггі (якщо гравець сидить)
                if (p && p.inBuggy) {
                    ctx.fillStyle = '#15803D'; // шолом/форма
                    ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.fill();
                }

                // Вихлопна труба
                ctx.fillStyle = '#475569';
                ctx.fillRect(-18, -2, 4, 4);

                ctx.restore();

                // Напис підказки біля баггі
                if (!p.inBuggy && Math.hypot(p.x - this.buggy.x, p.y - this.buggy.y) < 65) {
                    ctx.fillStyle = '#FEF08A'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center';
                    ctx.fillText('[E] Сісти в баггі · [G] Багажник', sp.x, sp.y - 20);
                }
            }

            // 6. Лавові бомби вулкану
            for (let b of this.volcanoBombs) {
                const curX = b.startX + (b.targetX - b.startX) * b.t;
                const curY = b.startY + (b.targetY - b.startY) * b.t;
                const height = Math.sin(b.t * Math.PI) * 90;
                if (!camera.isVisible(curX, curY - height)) continue;
                const sp = camera.worldToScreen(curX, curY - height);
                const shadowSp = camera.worldToScreen(curX, curY);

                ctx.save();
                // Тінь на землі
                ctx.fillStyle = 'rgba(0,0,0,0.3)';
                ctx.beginPath(); ctx.ellipse(shadowSp.x, shadowSp.y, 10, 5, 0, 0, Math.PI * 2); ctx.fill();
                // Палаюча лавова куля
                ctx.fillStyle = '#EF4444';
                ctx.beginPath(); ctx.arc(sp.x, sp.y, 8, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#FBBF24';
                ctx.beginPath(); ctx.arc(sp.x, sp.y, 4, 0, Math.PI * 2); ctx.fill();
                ctx.restore();
            }

            // 7. Обсидіанові камені
            for (let r of this.obsidianRocks) {
                if (r.mined || !camera.isVisible(r.x, r.y)) continue;
                const sp = camera.worldToScreen(r.x, r.y);
                ctx.save();
                ctx.fillStyle = '#1E1B4B';
                ctx.beginPath();
                ctx.moveTo(sp.x - 12, sp.y + 8); ctx.lineTo(sp.x, sp.y - 12);
                ctx.lineTo(sp.x + 12, sp.y + 4); ctx.lineTo(sp.x, sp.y + 12);
                ctx.closePath(); ctx.fill();
                ctx.strokeStyle = '#8B5CF6'; ctx.lineWidth = 1.5; ctx.stroke();
                ctx.restore();
            }

            // 8. Кулі корабельного кулемета
            for (let b of this.boatBullets) {
                if (!camera.isVisible(b.x, b.y)) continue;
                const sp = camera.worldToScreen(b.x, b.y);
                ctx.save();
                ctx.fillStyle = '#FBBF24';
                ctx.beginPath(); ctx.arc(sp.x, sp.y, 3, 0, Math.PI * 2); ctx.fill();
                ctx.restore();
            }

            // 9. Відмальовування хвиль плавання для гравця
            if (p && !p.inBoat && !p.inBuggy && camera.isVisible(p.x, p.y)) {
                const sp = camera.worldToScreen(p.x, p.y);
                if (p.isSwimming) {
                    ctx.save();
                    // Концентричні біло-блакитні кола хвиль на воді
                    const waveR = 14 + (Math.sin(time * 4) + 1) * 4;
                    ctx.strokeStyle = 'rgba(186, 230, 253, 0.75)'; ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.ellipse(sp.x, sp.y + 8, waveR, waveR * 0.45, 0, 0, Math.PI * 2); ctx.stroke();
                    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)'; ctx.lineWidth = 1.5;
                    ctx.beginPath(); ctx.ellipse(sp.x, sp.y + 8, waveR + 8, (waveR + 8) * 0.45, 0, 0, Math.PI * 2); ctx.stroke();
                    ctx.restore();
                } else if (p.isWading) {
                    ctx.save();
                    ctx.fillStyle = 'rgba(186, 230, 253, 0.6)';
                    ctx.beginPath(); ctx.arc(sp.x - 6, sp.y + 12, 3, 0, Math.PI * 2);
                    ctx.arc(sp.x + 6, sp.y + 12, 3, 0, Math.PI * 2); ctx.fill();
                    ctx.restore();
                }
            }

            // 10. Боси
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

            ctx.restore();
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

        // Патч ходіння по мілині та плавання у воді (Walk & Swim)
        if (window.World) {
            const origIsWalkable = World.prototype.isWalkable;
            World.prototype.isWalkable = function(wx, wy, pw, ph, buildingSystem, currentX, currentY) {
                let tx = Math.floor(wx / this.tileSize);
                let ty = Math.floor(wy / this.tileSize);
                if (tx < 0 || tx >= this.width || ty < 0 || ty >= this.height) return false;
                let tType = this.getTile(tx, ty);

                // Світлоголуба вода (1) та океан (0) — ПЛАВАЄМО ТА ХОДИМО!
                if (tType === 1 || tType === 0) {
                    // Баггі зупиняється перед глибоким океаном (може їздити по мілині 1, але не в океан 0)
                    if (window.game?.player?.inBuggy && tType === 0) {
                        return false;
                    }
                    if (buildingSystem) {
                        let rects = buildingSystem.getCollisionRects();
                        for (let r of rects) {
                            if (!r.passable) {
                                let collides = (wx + pw/2 > r.x - r.w/2 && wx - pw/2 < r.x + r.w/2 &&
                                               wy + ph/2 > r.y - r.h/2 && wy - ph/2 < r.y + r.h/2);
                                if (collides) return false;
                            }
                        }
                    }
                    return true;
                }

                return origIsWalkable.call(this, wx, wy, pw, ph, buildingSystem, currentX, currentY);
            };
        }

        // Патч оновлення гравця (Плавання, витривалість, керування баггі)
        if (window.Player) {
            const origPlayerUpdate = Player.prototype.update;
            Player.prototype.update = function(dt, input, world, buildingSystem) {
                const ms = window.game?.megaSystem;

                // Керування баггі замість звичайного бігу
                if (this.inBuggy && ms && ms.buggy) {
                    ms.updateBuggy(dt, this);
                    return;
                }

                // Перевірка поточного тайла під ногами гравця
                if (world && !this.inBoat) {
                    const tx = Math.floor(this.x / world.tileSize);
                    const ty = Math.floor(this.y / world.tileSize);
                    const tType = world.getTile(tx, ty);

                    if (tType === 0) {
                        this.isSwimming = true;
                        this.isWading = false;
                    } else if (tType === 1) {
                        this.isWading = true;
                        this.isSwimming = false;
                    } else {
                        this.isSwimming = false;
                        this.isWading = false;
                    }
                } else {
                    this.isSwimming = false;
                    this.isWading = false;
                }

                // Модифікація швидкості
                const baseSpeed = this.speed;
                if (this.isSwimming) {
                    this.speed = baseSpeed * 0.72;
                } else if (this.isWading) {
                    this.speed = baseSpeed * 0.85;
                }

                origPlayerUpdate.call(this, dt, input, world, buildingSystem);
                this.speed = baseSpeed;

                // Витрата енергії при плаванні та попередження про втоплення
                if (this.isSwimming && !this.inBoat) {
                    if (this.moving) {
                        this.energy = Math.max(0, this.energy - dt * 0.35);
                    }
                    if (this.energy <= 0) {
                        this.drownTimer = (this.drownTimer || 0) + dt;
                        if (this.drownTimer > 2.5) {
                            this.drownTimer = 0;
                            this.health = Math.max(0, this.health - 4);
                            window.game?.showNotification('⚠️ Ви виснажені й тонете! Пливіть до мілини або острова!', 'danger');
                            if (window.soundSystem) window.soundSystem.playHurt();
                        }
                    } else {
                        this.drownTimer = 0;
                    }
                }
            };
        }

        // Патч будівництва (Дозволяє будувати стіни й меблі поверх підлоги, підлогу без перешкод)
        if (window.BuildingSystem) {
            const origCanPlace = window.BuildingSystem.prototype.canPlace;
            window.BuildingSystem.prototype.canPlace = function(typeId, x, y, worldTiles, tileSize) {
                const bData = window.BUILDING_DB[typeId];
                if (!bData) return { valid: false, reason: 'Невідома будівля' };

                const rx = Math.floor(x / tileSize);
                const ry = Math.floor(y / tileSize);

                const isBridge = typeId === 'bridge' || typeId === 'dock';
                if (!isBridge) {
                    if (!worldTiles || !worldTiles[ry] || worldTiles[ry][rx] === undefined || worldTiles[ry][rx] === 0 || worldTiles[ry][rx] === 1) {
                        return { valid: false, reason: 'Не можна будувати на воді або за межами острова' };
                    }
                } else {
                    if (!worldTiles || !worldTiles[ry] || worldTiles[ry][rx] === undefined) {
                        return { valid: false, reason: 'За межами карти' };
                    }
                    const tile = worldTiles[ry][rx];
                    if (tile !== 0 && tile !== 1 && tile !== 2) {
                        return { valid: false, reason: 'Міст можна будувати тільки на воді або пляжі' };
                    }
                }

                const rect1 = { x: x - bData.width/2, y: y - bData.height/2, w: bData.width, h: bData.height };
                for (const b of this.buildings) {
                    const b2Data = window.BUILDING_DB[b.type];
                    if (!b2Data) continue;
                    const rect2 = { x: b.x - b2Data.width/2, y: b.y - b2Data.height/2, w: b2Data.width, h: b2Data.height };

                    if (rect1.x < rect2.x + rect2.w &&
                        rect1.x + rect1.w > rect2.x &&
                        rect1.y < rect2.y + rect2.h &&
                        rect1.h + rect1.y > rect2.y) {

                        // Стіни, меблі та двері поверх підлоги дозволені
                        if (b2Data.isFloor && !bData.isFloor) continue;
                        // Дах поверх стін та підлоги дозволений
                        if (bData.isRoof && (b2Data.isFloor || b2Data.isWall)) continue;
                        // Підлога під меблями дозволена
                        if (bData.isFloor && !b2Data.isFloor) continue;

                        return { valid: false, reason: 'Місце зайняте іншою будівлею' };
                    }
                }
                return { valid: true, reason: '' };
            };
        }

        // Патч взаємодії (Interaction: Boss attack / Chests / Diving / Meteor / Digging / Bunker / Smelter / Buggy / Warship)
        const origInteract = Game.prototype.handleInteraction;
        Game.prototype.handleInteraction = function() {
            const p = this.player;
            const ms = this.megaSystem;
            if (!p || !ms) return origInteract ? origInteract.call(this) : undefined;

            // 1. Якщо гравець у підземному бункері
            if (ms.inPlayerBunker) {
                if (Math.hypot(p.x - 250, p.y - 120) < 65) { ms.exitPlayerBunker(); return; }
                if (Math.hypot(p.x - 140, p.y - 260) < 65) { ms.sleepInBed(); return; }
                if (Math.hypot(p.x - 360, p.y - 260) < 65) {
                    if (window.openChestUI) window.openChestUI({ inventory: ms.bunkerStorage, type: 'chest', x: 360, y: 260 });
                    return;
                }
                return;
            }

            // 2. Якщо гравець у затопленому військовому есмінці
            if (ms.inWarshipDungeon) {
                // Вихід на поверхню біля драбини
                if (Math.hypot(p.x - 240, p.y - 150) < 65) { ms.exitWarshipDungeon(); return; }
                // Радар у кабіні
                if (Math.hypot(p.x - 330, p.y - 150) < 55) {
                    if (!ms.warship.lootedBridge) {
                        ms.warship.lootedBridge = true;
                        p.inventory.addItem('naval_radar', 1);
                        this.showNotification('📡 Знайдено Морський Радар! Усі острови та рифи розкрито.', 'success');
                    } else {
                        this.showNotification('Радарну станцію вже демонтовано.', 'info');
                    }
                    return;
                }
                // Торпедний відсік
                if (Math.hypot(p.x - 150, p.y - 210) < 55) {
                    if (!ms.warship.lootedQuarters) {
                        ms.warship.lootedQuarters = true;
                        p.inventory.addItem('torpedo_part', 1);
                        p.inventory.addItem('military_uniform', 1);
                        this.showNotification('🪖 Знайдено Камуфляжну форму та Частину торпеди!', 'success');
                    } else {
                        this.showNotification('Торпедний стелаж пустий.', 'info');
                    }
                    return;
                }
                // Броньований арсенал
                if (Math.hypot(p.x - 340, p.y - 290) < 60) {
                    if (!ms.warship.armoryBreached) {
                        ms.warship.armoryBreached = true;
                        this.spawnParticles(340, 290, '#F59E0B', 20);
                        MegaAudio.playExplosion();
                        this.showNotification('💥 Ви зламали бронедвері арсеналу! Доступ відкрито.', 'success');
                    } else if (!ms.warship.lootedArmory) {
                        ms.warship.lootedArmory = true;
                        p.inventory.addItem('military_helmet', 1);
                        p.inventory.addItem('tactical_vest', 1);
                        p.inventory.addItem('military_rifle', 1);
                        p.inventory.addItem('ammo', 40);
                        this.showNotification('⚔️ Знайдено Військову каску, Тактичний бронежилет, Гвинтівку M16 та набої!', 'success');
                    } else {
                        this.showNotification('Арсенал уже пограбовано.', 'info');
                    }
                    return;
                }
                return;
            }

            // 3. Баггі (Сісти або вийти)
            if (p.inBuggy) {
                ms.exitBuggy();
                return;
            } else if (ms.buggy && ms.buggy.active && Math.hypot(ms.buggy.x - p.x, ms.buggy.y - p.y) < 65) {
                ms.enterBuggy();
                return;
            }

            // 4. Скриня Проклятих
            if (ms.cursedChest && Math.hypot(ms.cursedChest.x - p.x, ms.cursedChest.y - p.y) < 65) {
                ms.triggerCursedChest();
                return;
            }

            // 5. Вхід у затоплений есмінець з океану
            if (ms.warship && Math.hypot(ms.warship.x - p.x, ms.warship.y - p.y) < 75) {
                ms.enterWarshipDungeon();
                return;
            }

            // 6. Видобуток обсидіану
            for (let obs of ms.obsidianRocks) {
                if (!obs.mined && Math.hypot(obs.x - p.x, obs.y - p.y) < 55) {
                    ms.mineObsidian(obs);
                    return;
                }
            }

            // 7. Будівлі гравця на поверхні
            if (this.buildingSystem) {
                // Доменна піч
                const furnace = this.buildingSystem.buildings.find(b => b.type === 'blast_furnace' && Math.hypot(b.x - p.x, b.y - p.y) < 60);
                if (furnace) {
                    ms.openSmelterUI();
                    return;
                }
                // Люк у підземний бункер
                const hatch = this.buildingSystem.buildings.find(b => b.type === 'bunker_hatch' && Math.hypot(b.x - p.x, b.y - p.y) < 55);
                if (hatch) {
                    ms.enterPlayerBunker(hatch);
                    return;
                }
                // Двері
                const door = this.buildingSystem.buildings.find(b => (b.type === 'stick_door' || b.type === 'stone_door') && Math.hypot(b.x - p.x, b.y - p.y) < 50);
                if (door) {
                    ms.toggleDoor(door);
                    return;
                }
                // Ліжко з листя
                const bed = this.buildingSystem.buildings.find(b => b.type === 'leaf_bed' && Math.hypot(b.x - p.x, b.y - p.y) < 55);
                if (bed) {
                    ms.sleepInBed();
                    return;
                }
                // Водолазний дзвін
                const bell = this.buildingSystem.buildings.find(b => b.type === 'diving_bell' && Math.hypot(b.x - p.x, b.y - p.y) < 60);
                if (bell) {
                    if (!ms.isDiving) ms.startDiving();
                    else ms.surfaceDiving();
                    return;
                }
            }

            // 8. Метеоритні кратери
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

            // 9. Лопата
            if (p.equippedTool && (p.equippedTool === 'shovel' || p.equippedTool === 'stone_shovel')) {
                ms.dig(p.x, p.y);
                return;
            }

            return origInteract.call(this);
        };

        // Патч атаки гравця (Attack: Bosses / Wraiths / Boat Gun / Shovel Digging)
        const origAttack = Game.prototype.attack;
        Game.prototype.attack = function(...args) {
            const p = this.player;
            const ms = this.megaSystem;
            if (p && ms) {
                // Корабельний кулемет
                if (p.inBoat && ms.boatUpgrades.hasGun) {
                    ms.fireBoatGun();
                    return;
                }
                // Лопата
                if (p.equippedTool && (p.equippedTool === 'shovel' || p.equippedTool === 'stone_shovel')) {
                    ms.dig(p.x, p.y);
                    window.GameTextures?.playerAction(p, 'swing');
                    return;
                }
                // Боси
                for (let b of ms.bosses) {
                    if (b.active && Math.hypot(p.x - b.x, p.y - b.y) < 65) {
                        ms.attackBoss(b, p.equippedTool);
                        window.GameTextures?.playerAction(p, window.ITEM_DB[p.equippedTool]?.range ? 'shoot' : 'swing');
                        return;
                    }
                }
                // Примари Скрині Проклятих
                if (ms.cursedChest && ms.cursedChest.wraiths) {
                    for (let w of ms.cursedChest.wraiths) {
                        if (w.active && Math.hypot(p.x - w.x, p.y - w.y) < 60) {
                            ms.attackWraith(w, p.equippedTool);
                            window.GameTextures?.playerAction(p, 'swing');
                            return;
                        }
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
        // Патч візуального відмальовування нових будівель (Canvas 2D Graphics)
        if (window.Game) {
            const origDrawBuilding = Game.prototype.drawBuilding;
            Game.prototype.drawBuilding = function(building, pos, bDef) {
                if (!bDef) return;
                const ctx = this.ctx;
                const type = building.type;

                // Стіна з палиць
                if (type === 'stick_wall') {
                    const w = bDef.width, h = bDef.height;
                    ctx.save();
                    ctx.translate(pos.x, pos.y);
                    ctx.fillStyle = '#854D0E'; ctx.fillRect(-w/2 + 2, -h/2 + 2, w - 4, h - 4);
                    ctx.strokeStyle = '#5B3310'; ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(-w/2 + 4, -h/2 + 6); ctx.lineTo(w/2 - 4, h/2 - 6);
                    ctx.moveTo(w/2 - 4, -h/2 + 6); ctx.lineTo(-w/2 + 4, h/2 - 6);
                    ctx.stroke();
                    ctx.strokeStyle = '#291807'; ctx.lineWidth = 1.5;
                    ctx.strokeRect(-w/2 + 2, -h/2 + 2, w - 4, h - 4);
                    ctx.restore();
                    return;
                }

                // Кам'яна стіна
                if (type === 'stone_wall') {
                    const w = bDef.width, h = bDef.height;
                    ctx.save();
                    ctx.translate(pos.x, pos.y);
                    ctx.fillStyle = '#475569'; ctx.fillRect(-w/2 + 2, -h/2 + 2, w - 4, h - 4);
                    ctx.strokeStyle = '#1E293B'; ctx.lineWidth = 1.5;
                    ctx.strokeRect(-w/2 + 2, -h/2 + 2, w - 4, h - 4);
                    ctx.beginPath();
                    ctx.moveTo(-w/2 + 2, 0); ctx.lineTo(w/2 - 2, 0);
                    ctx.moveTo(0, -h/2 + 2); ctx.lineTo(0, 0);
                    ctx.moveTo(-w/4, 0); ctx.lineTo(-w/4, h/2 - 2);
                    ctx.moveTo(w/4, 0); ctx.lineTo(w/4, h/2 - 2);
                    ctx.stroke();
                    ctx.restore();
                    return;
                }

                // Двері з палиць
                if (type === 'stick_door') {
                    const w = bDef.width, h = bDef.height;
                    ctx.save();
                    ctx.translate(pos.x, pos.y);
                    if (building.isOpen) {
                        ctx.strokeStyle = '#A16207'; ctx.lineWidth = 4;
                        ctx.beginPath(); ctx.moveTo(-w/2 + 4, -h/2 + 4); ctx.lineTo(-w/2 + 10, h/2 - 4); ctx.stroke();
                    } else {
                        ctx.fillStyle = '#A16207'; ctx.fillRect(-w/2 + 4, -h/2 + 4, w - 8, h - 8);
                        ctx.fillStyle = '#FEF08A'; ctx.beginPath(); ctx.arc(w/4, 0, 2.5, 0, Math.PI*2); ctx.fill();
                    }
                    ctx.restore();
                    return;
                }

                // Кам'яні двері
                if (type === 'stone_door') {
                    const w = bDef.width, h = bDef.height;
                    ctx.save();
                    ctx.translate(pos.x, pos.y);
                    if (building.isOpen) {
                        ctx.strokeStyle = '#64748B'; ctx.lineWidth = 5;
                        ctx.beginPath(); ctx.moveTo(-w/2 + 4, -h/2 + 4); ctx.lineTo(-w/2 + 10, h/2 - 4); ctx.stroke();
                    } else {
                        ctx.fillStyle = '#334155'; ctx.fillRect(-w/2 + 4, -h/2 + 4, w - 8, h - 8);
                        ctx.strokeStyle = '#0F172A'; ctx.lineWidth = 2; ctx.strokeRect(-w/2 + 4, -h/2 + 4, w - 8, h - 8);
                        ctx.fillStyle = '#E2E8F0'; ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI*2); ctx.fill();
                    }
                    ctx.restore();
                    return;
                }

                // Дерев'яна підлога
                if (type === 'wood_floor') {
                    const w = bDef.width, h = bDef.height;
                    ctx.save();
                    ctx.translate(pos.x, pos.y);
                    ctx.fillStyle = '#B45309'; ctx.fillRect(-w/2, -h/2, w, h);
                    ctx.strokeStyle = '#78350F'; ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(-w/2, -h/4); ctx.lineTo(w/2, -h/4);
                    ctx.moveTo(-w/2, h/4); ctx.lineTo(w/2, h/4);
                    ctx.stroke();
                    ctx.restore();
                    return;
                }

                // Кам'яний фундамент
                if (type === 'stone_floor') {
                    const w = bDef.width, h = bDef.height;
                    ctx.save();
                    ctx.translate(pos.x, pos.y);
                    ctx.fillStyle = '#64748B'; ctx.fillRect(-w/2, -h/2, w, h);
                    ctx.strokeStyle = '#334155'; ctx.lineWidth = 1;
                    ctx.strokeRect(-w/2, -h/2, w, h);
                    ctx.beginPath(); ctx.moveTo(-w/2, 0); ctx.lineTo(w/2, 0); ctx.moveTo(0, -h/2); ctx.lineTo(0, h/2); ctx.stroke();
                    ctx.restore();
                    return;
                }

                // Солом'яний дах
                if (type === 'thatched_roof') {
                    const w = bDef.width, h = bDef.height;
                    ctx.save();
                    ctx.translate(pos.x, pos.y);
                    ctx.fillStyle = '#CA8A04';
                    ctx.beginPath();
                    ctx.moveTo(-w/2, h/2); ctx.lineTo(0, -h/2); ctx.lineTo(w/2, h/2); ctx.closePath();
                    ctx.fill();
                    ctx.strokeStyle = '#854D0E'; ctx.lineWidth = 1.5; ctx.stroke();
                    ctx.restore();
                    return;
                }

                // Люк підземного бункера
                if (type === 'bunker_hatch') {
                    ctx.save();
                    ctx.translate(pos.x, pos.y);
                    ctx.fillStyle = '#334155';
                    ctx.beginPath(); ctx.arc(0, 0, 16, 0, Math.PI * 2); ctx.fill();
                    ctx.strokeStyle = '#FBBF24'; ctx.lineWidth = 2.5; ctx.stroke();
                    ctx.strokeStyle = '#FDE047'; ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(-9, 0); ctx.lineTo(9, 0);
                    ctx.moveTo(0, -9); ctx.lineTo(0, 9);
                    ctx.stroke();
                    ctx.restore();
                    return;
                }

                // Ліжко з листя
                if (type === 'leaf_bed') {
                    const w = bDef.width, h = bDef.height;
                    ctx.save();
                    ctx.translate(pos.x, pos.y);
                    ctx.fillStyle = '#78350F'; ctx.fillRect(-w/2, -h/2, w, h);
                    ctx.fillStyle = '#15803D'; ctx.fillRect(-w/2 + 3, -h/2 + 3, w - 6, h - 6);
                    ctx.fillStyle = '#FEF08A'; ctx.fillRect(-w/2 + 5, -h/2 + 5, 12, h - 10);
                    ctx.restore();
                    return;
                }

                // Доменна піч
                if (type === 'blast_furnace') {
                    const w = bDef.width, h = bDef.height;
                    const time = performance.now() / 1000;
                    ctx.save();
                    ctx.translate(pos.x, pos.y);
                    ctx.fillStyle = '#334155'; ctx.fillRect(-w/2, -h/2, w, h);
                    ctx.strokeStyle = '#0F172A'; ctx.lineWidth = 2; ctx.strokeRect(-w/2, -h/2, w, h);
                    ctx.fillStyle = '#EA580C';
                    ctx.beginPath(); ctx.arc(0, 4, 11, 0, Math.PI * 2); ctx.fill();
                    ctx.fillStyle = '#FBBF24';
                    ctx.beginPath(); ctx.arc(0, 4, 6 + Math.sin(time * 8) * 1.5, 0, Math.PI * 2); ctx.fill();
                    ctx.fillStyle = '#1E293B'; ctx.fillRect(-6, -h/2 - 10, 12, 10);
                    ctx.restore();
                    return;
                }

                // Охоронна сигналізація
                if (type === 'alarm_system') {
                    const time = performance.now() / 1000;
                    ctx.save();
                    ctx.translate(pos.x, pos.y);
                    ctx.fillStyle = '#64748B'; ctx.fillRect(-3, -12, 6, 24);
                    ctx.fillStyle = '#1E293B'; ctx.fillRect(-10, -18, 20, 12);
                    const alert = building.alert;
                    ctx.fillStyle = alert ? '#EF4444' : '#059669';
                    ctx.beginPath(); ctx.arc(0, -22, 6 + (alert ? Math.sin(time * 12) * 2 : 0), 0, Math.PI * 2); ctx.fill();
                    if (alert) {
                        ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)'; ctx.lineWidth = 3;
                        ctx.beginPath(); ctx.arc(0, -22, 18, 0, Math.PI * 2); ctx.stroke();
                    }
                    ctx.restore();
                    return;
                }

                // Кулеметна турель
                if (type === 'auto_turret') {
                    ctx.save();
                    ctx.translate(pos.x, pos.y);
                    ctx.fillStyle = '#1E293B'; ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI*2); ctx.fill();
                    ctx.fillStyle = '#475569'; ctx.fillRect(-4, -18, 8, 16);
                    ctx.restore();
                    return;
                }

                // Вогнеметна пастка
                if (type === 'flame_trap') {
                    ctx.save();
                    ctx.translate(pos.x, pos.y);
                    ctx.fillStyle = '#B45309'; ctx.fillRect(-12, -12, 24, 24);
                    ctx.fillStyle = '#F97316'; ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI*2); ctx.fill();
                    ctx.restore();
                    return;
                }

                // Рів із кілками
                if (type === 'spiked_moat') {
                    ctx.save();
                    ctx.translate(pos.x, pos.y);
                    ctx.fillStyle = '#451A03'; ctx.fillRect(-14, -14, 28, 28);
                    ctx.fillStyle = '#D97706';
                    ctx.beginPath();
                    ctx.moveTo(-10, 8); ctx.lineTo(-6, -8); ctx.lineTo(-2, 8);
                    ctx.moveTo(2, 8); ctx.lineTo(6, -8); ctx.lineTo(10, 8);
                    ctx.fill();
                    ctx.restore();
                    return;
                }

                if (origDrawBuilding) origDrawBuilding.call(this, building, pos, bDef);
            };
        }

        // Патч малювання іконок предметів (Canvas 2D Icons)
        const origDrawItemIcon = window.drawItemIcon;
        window.drawItemIcon = function(ctx, itemId, x, y, size) {
            if (!window.ITEM_DB || !window.ITEM_DB[itemId]) return;
            const s = size || 32;
            const cx = x + s / 2;
            const cy = y + s / 2;

            if (itemId === 'shovel' || itemId === 'stone_shovel') {
                ctx.save();
                ctx.strokeStyle = '#854D0E'; ctx.lineWidth = s * 0.12;
                ctx.beginPath(); ctx.moveTo(cx - s*0.25, cy + s*0.25); ctx.lineTo(cx + s*0.15, cy - s*0.15); ctx.stroke();
                ctx.fillStyle = '#64748B';
                ctx.beginPath();
                ctx.moveTo(cx + s*0.15, cy - s*0.15); ctx.lineTo(cx + s*0.35, cy - s*0.05); ctx.lineTo(cx + s*0.05, cy - s*0.35);
                ctx.closePath(); ctx.fill();
                ctx.restore();
                return;
            }

            if (itemId === 'clay') {
                ctx.save();
                ctx.fillStyle = '#C2410C';
                ctx.beginPath(); ctx.arc(cx, cy, s*0.32, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = '#EA580C';
                ctx.beginPath(); ctx.arc(cx - s*0.1, cy - s*0.1, s*0.15, 0, Math.PI*2); ctx.fill();
                ctx.restore();
                return;
            }

            if (itemId === 'sand') {
                ctx.save();
                ctx.fillStyle = '#FDE047';
                ctx.beginPath();
                ctx.moveTo(cx - s*0.3, cy + s*0.2); ctx.lineTo(cx, cy - s*0.25); ctx.lineTo(cx + s*0.3, cy + s*0.2);
                ctx.closePath(); ctx.fill();
                ctx.restore();
                return;
            }

            if (itemId === 'worm') {
                ctx.save();
                ctx.strokeStyle = '#FB7185'; ctx.lineWidth = s * 0.12;
                ctx.beginPath();
                ctx.arc(cx - s*0.1, cy, s*0.15, 0, Math.PI);
                ctx.arc(cx + s*0.1, cy, s*0.15, Math.PI, 0);
                ctx.stroke();
                ctx.restore();
                return;
            }

            if (itemId === 'glass') {
                ctx.save();
                ctx.fillStyle = 'rgba(186, 230, 253, 0.7)';
                ctx.fillRect(cx - s*0.25, cy - s*0.25, s*0.5, s*0.5);
                ctx.strokeStyle = '#38BDF8'; ctx.lineWidth = 1.5;
                ctx.strokeRect(cx - s*0.25, cy - s*0.25, s*0.5, s*0.5);
                ctx.restore();
                return;
            }

            if (itemId === 'brick') {
                ctx.save();
                ctx.fillStyle = '#B91C1C'; ctx.fillRect(cx - s*0.3, cy - s*0.18, s*0.6, s*0.36);
                ctx.strokeStyle = '#7F1D1D'; ctx.lineWidth = 1.5; ctx.strokeRect(cx - s*0.3, cy - s*0.18, s*0.6, s*0.36);
                ctx.restore();
                return;
            }

            if (itemId === 'steel_ingot') {
                ctx.save();
                ctx.fillStyle = '#94A3B8';
                ctx.beginPath();
                ctx.moveTo(cx - s*0.3, cy + s*0.15); ctx.lineTo(cx - s*0.15, cy - s*0.15);
                ctx.lineTo(cx + s*0.3, cy - s*0.15); ctx.lineTo(cx + s*0.15, cy + s*0.15);
                ctx.closePath(); ctx.fill();
                ctx.strokeStyle = '#E2E8F0'; ctx.lineWidth = 1; ctx.stroke();
                ctx.restore();
                return;
            }

            if (itemId === 'obsidian' || itemId === 'obsidian_composite') {
                ctx.save();
                ctx.fillStyle = '#1E1B4B';
                ctx.beginPath();
                ctx.moveTo(cx, cy - s*0.3); ctx.lineTo(cx + s*0.25, cy); ctx.lineTo(cx, cy + s*0.3); ctx.lineTo(cx - s*0.25, cy);
                ctx.closePath(); ctx.fill();
                ctx.strokeStyle = '#8B5CF6'; ctx.lineWidth = 1.5; ctx.stroke();
                ctx.restore();
                return;
            }

            if (itemId === 'obsidian_blade') {
                ctx.save();
                ctx.strokeStyle = '#8B5CF6'; ctx.lineWidth = s * 0.14;
                ctx.beginPath(); ctx.moveTo(cx - s*0.25, cy + s*0.25); ctx.lineTo(cx + s*0.25, cy - s*0.25); ctx.stroke();
                ctx.fillStyle = '#F59E0B'; ctx.fillRect(cx - s*0.3, cy + s*0.2, s*0.15, s*0.1);
                ctx.restore();
                return;
            }

            if (itemId === 'military_helmet') {
                ctx.save();
                ctx.fillStyle = '#15803D';
                ctx.beginPath(); ctx.arc(cx, cy, s*0.3, Math.PI, 0); ctx.closePath(); ctx.fill();
                ctx.strokeStyle = '#14532D'; ctx.lineWidth = 2; ctx.stroke();
                ctx.restore();
                return;
            }

            if (itemId === 'tactical_vest') {
                ctx.save();
                ctx.fillStyle = '#166534';
                ctx.fillRect(cx - s*0.28, cy - s*0.28, s*0.56, s*0.56);
                ctx.fillStyle = '#14532D';
                ctx.fillRect(cx - s*0.2, cy - s*0.1, s*0.4, s*0.2);
                ctx.restore();
                return;
            }

            if (itemId === 'military_uniform') {
                ctx.save();
                ctx.fillStyle = '#15803D';
                ctx.fillRect(cx - s*0.25, cy - s*0.25, s*0.5, s*0.5);
                ctx.fillStyle = '#78350F';
                ctx.beginPath(); ctx.arc(cx - s*0.1, cy - s*0.1, s*0.08, 0, Math.PI*2); ctx.fill();
                ctx.beginPath(); ctx.arc(cx + s*0.1, cy + s*0.1, s*0.08, 0, Math.PI*2); ctx.fill();
                ctx.restore();
                return;
            }

            if (itemId === 'military_rifle') {
                ctx.save();
                ctx.fillStyle = '#1E293B';
                ctx.fillRect(cx - s*0.32, cy - s*0.08, s*0.64, s*0.14);
                ctx.fillStyle = '#64748B';
                ctx.fillRect(cx + s*0.1, cy + s*0.04, s*0.08, s*0.16);
                ctx.restore();
                return;
            }

            if (itemId === 'naval_radar') {
                ctx.save();
                ctx.fillStyle = '#065F46';
                ctx.beginPath(); ctx.arc(cx, cy, s*0.3, 0, Math.PI*2); ctx.fill();
                ctx.strokeStyle = '#34D399'; ctx.lineWidth = 2; ctx.stroke();
                ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + s*0.2, cy - s*0.2); ctx.stroke();
                ctx.restore();
                return;
            }

            if (itemId === 'undying_amulet') {
                ctx.save();
                ctx.fillStyle = '#F59E0B';
                ctx.beginPath(); ctx.arc(cx, cy, s*0.26, 0, Math.PI*2); ctx.fill();
                ctx.strokeStyle = '#FEF08A'; ctx.lineWidth = 2; ctx.stroke();
                ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.arc(cx, cy, s*0.1, 0, Math.PI*2); ctx.fill();
                ctx.restore();
                return;
            }

            if (itemId === 'endless_flask') {
                ctx.save();
                ctx.fillStyle = '#0284C7';
                ctx.beginPath(); ctx.arc(cx, cy + s*0.08, s*0.22, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = '#CBD5E1'; ctx.fillRect(cx - s*0.08, cy - s*0.28, s*0.16, s*0.16);
                ctx.restore();
                return;
            }

            if (itemId === 'buggy_item') {
                ctx.save();
                ctx.fillStyle = '#D97706'; ctx.fillRect(cx - s*0.28, cy - s*0.14, s*0.56, s*0.28);
                ctx.fillStyle = '#0F172A';
                ctx.beginPath();
                ctx.arc(cx - s*0.2, cy + s*0.18, s*0.1, 0, Math.PI*2);
                ctx.arc(cx + s*0.2, cy + s*0.18, s*0.1, 0, Math.PI*2);
                ctx.fill();
                ctx.restore();
                return;
            }

            if (itemId === 'boat_gun_item') {
                ctx.save();
                ctx.fillStyle = '#334155'; ctx.fillRect(cx - s*0.3, cy - s*0.08, s*0.6, s*0.16);
                ctx.fillStyle = '#F59E0B'; ctx.fillRect(cx - s*0.1, cy + s*0.06, s*0.15, s*0.14);
                ctx.restore();
                return;
            }

            if (origDrawItemIcon) origDrawItemIcon.call(this, ctx, itemId, x, y, size);
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
        ['btn-close-radio', 'btn-close-boat', 'btn-close-lore', 'btn-close-smelter'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.onclick = () => {
                const modal = btn.closest('.modal, .game-panel');
                if (modal) { modal.classList.add('hidden'); modal.style.display = 'none'; }
            };
        });

        // Гарячі клавіші: R (Radio), U (Boat), L (Lore), G (Buggy Trunk)
        window.addEventListener('keydown', (e) => {
            if (e.target && ['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
            if (e.key === 'r' || e.key === 'R' || e.key === 'к' || e.key === 'К') {
                window.openRadioUI();
            } else if (e.key === 'u' || e.key === 'U' || e.key === 'г' || e.key === 'Г') {
                window.openBoatUI();
            } else if (e.key === 'l' || e.key === 'L' || e.key === 'д' || e.key === 'Д') {
                window.openLoreUI();
            } else if (e.key === 'g' || e.key === 'G' || e.key === 'п' || e.key === 'П') {
                const p = window.game?.player;
                const ms = window.game?.megaSystem;
                if (p && ms && ms.buggy) {
                    if (p.inBuggy || Math.hypot(p.x - ms.buggy.x, p.y - ms.buggy.y) < 70) {
                        ms.openBuggyStorage();
                    }
                }
            }
        });
    });

    // Глобальна функція виплавки у доменній печі
    window.smeltRecipe = function(index) {
        const ms = window.game?.megaSystem;
        if (!ms) return;
        const playerInv = window.game?.player?.inventory;
        if (!playerInv) return;

        const recipes = [
            { req: [{ id: 'sand', count: 2 }], res: { id: 'glass', count: 1 }, name: 'Загартоване скло' },
            { req: [{ id: 'clay', count: 2 }], res: { id: 'brick', count: 1 }, name: 'Будівельна цегла' },
            { req: [{ id: 'metal_scrap', count: 3 }], res: { id: 'steel_ingot', count: 1 }, name: 'Сталевий злиток' },
            { req: [{ id: 'obsidian', count: 2 }, { id: 'steel_ingot', count: 1 }], res: { id: 'obsidian_composite', count: 1 }, name: 'Обсидіановий сплав' }
        ];

        const r = recipes[index];
        if (!r) return;

        if (!r.req.every(item => playerInv.hasItem(item.id, item.count))) {
            window.game.showNotification('Бракує ресурсів для виплавки!', 'danger');
            return;
        }

        r.req.forEach(item => playerInv.removeItem(item.id, item.count));
        playerInv.addItem(r.res.id, r.res.count);
        MegaAudio.playTone(520, 0.2, 'triangle', 0.35);
        if (window.soundSystem) window.soundSystem.playCraft();
        window.game.spawnParticles(window.game.player.x, window.game.player.y, '#F97316', 15);
        window.game.showNotification(`🔥 Успішно виплавлено: ${r.name}!`, 'success');
        ms.openSmelterUI();
    };

    console.log('[island-mega-expansion.js] Усі розширення (Баггі, Катер, Піч, Сигналізація, Плавання, Спорядження, Лабіринт) успішно активовано! 🚀');
})();

