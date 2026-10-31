window.ITEM_DB = {
  'branch':         { id:'branch', name:'Гілка', icon:'branch', category:'resource', maxStack:20, description:'Суха гілка дерева' },
  'wood':           { id:'wood', name:'Деревина', icon:'wood', category:'resource', maxStack:20, description:'Міцна деревина' },
  'stone':          { id:'stone', name:'Каміння', icon:'stone', category:'resource', maxStack:20, description:'Шматок каменю' },
  'fiber':          { id:'fiber', name:'Волокно', icon:'fiber', category:'resource', maxStack:30, description:'Рослинне волокно' },
  'berry':          { id:'berry', name:'Ягоди', icon:'berry', category:'food', maxStack:15, description:'Солодкі лісові ягоди', effects:{hunger:8,health:2} },
  'coconut':        { id:'coconut', name:'Кокос', icon:'coconut', category:'food', maxStack:10, description:'Кокосовий горіх', effects:{hunger:12,thirst:10} },
  'mushroom':       { id:'mushroom', name:'Гриб', icon:'mushroom', category:'food', maxStack:10, description:'Їстівний гриб', effects:{hunger:6} },
  'fish':           { id:'fish', name:'Риба', icon:'fish', category:'food', maxStack:5, description:'Свіжа риба', effects:{hunger:10} },
  'water':          { id:'water', name:'Вода', icon:'water', category:'food', maxStack:5, description:'Чиста вода', effects:{thirst:25} },
  'cooked_fish':    { id:'cooked_fish', name:'Печена риба', icon:'cooked_fish', category:'food', maxStack:5, description:'Смачна печена риба', effects:{hunger:35,health:5} },
  'cooked_meat':    { id:'cooked_meat', name:'Печене м\'ясо', icon:'cooked_meat', category:'food', maxStack:5, description:'Печене м\'ясо', effects:{hunger:30,health:5} },
  'meat':           { id:'meat', name:'М\'ясо', icon:'meat', category:'food', maxStack:5, description:'Сире м\'ясо', effects:{hunger:10} },
  'canned_food':    { id:'canned_food', name:'Консерви', icon:'canned_food', category:'food', maxStack:6, description:'Запас їжі з тривалим терміном зберігання', effects:{hunger:35,health:8} },
  'ammo':           { id:'ammo', name:'Набої', icon:'ammo', category:'ammo', maxStack:30, description:'Набої для вогнепальної зброї' },
  'pistol':         { id:'pistol', name:'Пістолет', icon:'pistol', category:'weapon', maxStack:1, damage:28, range:210, cooldown:0.45, description:'Надійна зброя на близькій відстані' },
  'rifle':          { id:'rifle', name:'Автомат', icon:'rifle', category:'weapon', maxStack:1, damage:42, range:300, cooldown:0.18, description:'Потужна автоматична зброя' },
  'rare_material':  { id:'rare_material', name:'Рідкісний матеріал', icon:'rare', category:'resource', maxStack:5, description:'Рідкісний матеріал' },
  'stone_axe':      { id:'stone_axe', name:'Кам\'яна сокира', icon:'axe', category:'tool', maxStack:1, toolType:'axe', power:2, description:'Примітивна сокира' },
  'stone_knife':    { id:'stone_knife', name:'Кам\'яний ніж', icon:'knife', category:'tool', maxStack:1, toolType:'knife', power:1, description:'Гострий кам\'яний ніж' },
  'spear':          { id:'spear', name:'Спис', icon:'spear', category:'tool', maxStack:1, toolType:'spear', power:3, description:'Дерев\'яний спис' },
  'fishing_rod':    { id:'fishing_rod', name:'Вудка', icon:'rod', category:'tool', maxStack:1, toolType:'fishing', power:1, description:'Проста вудка' },
  'basket':         { id:'basket', name:'Кошик', icon:'basket', category:'tool', maxStack:1, description:'Плетений кошик' },
  'water_container':{ id:'water_container', name:'Ємність для води', icon:'container', category:'tool', maxStack:1, description:'Дерев\'яна ємність' },
  'rope':           { id:'rope', name:'Мотузка', icon:'rope', category:'resource', maxStack:10, description:'Міцна мотузка' },
  'dog_food_bowl':  { id:'dog_food_bowl', name:'Миска для їжі', icon:'bowl_food', category:'animal', maxStack:1, description:'Миска для годування' },
  'dog_water_bowl': { id:'dog_water_bowl', name:'Миска для води', icon:'bowl_water', category:'animal', maxStack:1, description:'Миска для пиття' },
  'campfire_item':  { id:'campfire_item', name:'Вогнище (предмет)', icon:'campfire', category:'building', maxStack:1, placeable:'campfire', description:'Розмістіть вогнище' },
  'shelter_item':   { id:'shelter_item', name:'Укриття (предмет)', icon:'shelter', category:'building', maxStack:1, placeable:'shelter', description:'Розмістіть укриття' },
  'rain_collector_item': { id:'rain_collector_item', name:'Дощозбірник (предмет)', icon:'rain_collector', category:'building', maxStack:1, placeable:'rain_collector', description:'Розмістіть дощозбірник' },
  'workbench_item': { id:'workbench_item', name:'Верстак (предмет)', icon:'workbench', category:'building', maxStack:1, placeable:'workbench', description:'Розмістіть верстак' },
  'chest_item':     { id:'chest_item', name:'Скриня (предмет)', icon:'chest', category:'building', maxStack:1, placeable:'chest', description:'Розмістіть скриню' },
  'dog_house_item': { id:'dog_house_item', name:'Собача будка (предмет)', icon:'dog_house', category:'building', maxStack:1, placeable:'dog_house', description:'Розмістіть будку' },
  'wooden_house_item': { id:'wooden_house_item', name:'Дерев\'яний будинок (предмет)', icon:'wooden_house', category:'building', maxStack:1, placeable:'wooden_house', description:'Розмістіть будинок' },
  'garden_item':    { id:'garden_item', name:'Грядка (предмет)', icon:'garden', category:'building', maxStack:1, placeable:'garden', description:'Розмістіть грядку' },
  'metal_scrap':    { id:'metal_scrap', name:'Металобрухт', icon:'metal', category:'resource', maxStack:20, description:'Шматок металу з уламків літака' },
  'electronics':   { id:'electronics', name:'Електроніка', icon:'electronics', category:'resource', maxStack:10, description:'Електронні компоненти з літака' },
  'fuel':          { id:'fuel', name:'Паливо', icon:'fuel', category:'resource', maxStack:5, description:'Авіаційне паливо' },
  'glass_shard':   { id:'glass_shard', name:'Уламки скла', icon:'glass', category:'resource', maxStack:15, description:'Скло з ілюмінатора літака' },
  'car':           { id:'car', name:'Позашляховик', icon:'car', category:'vehicle', maxStack:1, description:'Саморобний позашляховик для швидкого пересування' },
  'generator':     { id:'generator', name:'Генератор', icon:'generator', category:'tool', maxStack:1, description:'Саморобний генератор електроенергії' },
  'machinegun':    { id:'machinegun', name:'Кулемет', icon:'machinegun', category:'weapon', maxStack:1, damage:65, range:320, cooldown:0.12, description:'Потужний кулемет з уламків військового літака' },
  'sniper_rifle':  { id:'sniper_rifle', name:'Снайперська гвинтівка', icon:'sniper', category:'weapon', maxStack:1, damage:95, range:500, cooldown:1.2, description:'Точна снайперська гвинтівка' },
  'metal_armor':   { id:'metal_armor', name:'Металевий броньжилет', icon:'armor', category:'armor', maxStack:1, description:'Захисний жилет зі шматків металу, зменшує пошкодження на 40%' },
  'plank':         { id:'plank', name:'Дошка', icon:'plank', category:'resource', maxStack:20, description:'Обрізана дерев\'яна дошка' },
  'bridge_item':   { id:'bridge_item', name:'Міст (секція)', icon:'bridge', category:'building', maxStack:5, placeable:'bridge', description:'Секція мосту через воду' },
  'dock_item':     { id:'dock_item', name:'Причал (предмет)', icon:'dock', category:'building', maxStack:1, placeable:'dock', description:'Причал для швидкого посадки/виходу з човна' },
  'sulfur':         { id:'sulfur', name:'Сірка', icon:'sulfur', category:'resource', maxStack:20, description:'Жовта сірка з вулканічного острова' },
  'gunpowder':      { id:'gunpowder', name:'Порох', icon:'gunpowder', category:'resource', maxStack:30, description:'Порох для виготовлення набоїв' },
  'pearl':          { id:'pearl', name:'Перлина', icon:'pearl', category:'resource', maxStack:15, description:'Цінна морська перлина з рифів' },
  'seaweed':        { id:'seaweed', name:'Водорості', icon:'seaweed', category:'food', maxStack:20, description:'Поживні морські водорості', effects:{hunger:6,thirst:4} },
  'berry_seeds':    { id:'berry_seeds', name:'Насіння ягід', icon:'seeds', category:'resource', maxStack:30, description:'Насіння для посадки на грядку' },
  'palm_seed':      { id:'palm_seed', name:'Саджанець пальми', icon:'seedling', category:'resource', maxStack:10, description:'Саджанець пальми' },
  'egg':            { id:'egg', name:'Яйце', icon:'egg', category:'food', maxStack:15, description:'Свіже куряче яйце', effects:{hunger:8} },
  'cooked_egg':     { id:'cooked_egg', name:'Яєчня', icon:'cooked_egg', category:'food', maxStack:10, description:'Смажена яєчня', effects:{hunger:25,health:5} },
  'milk':           { id:'milk', name:'Молоко', icon:'milk', category:'food', maxStack:5, description:'Свіже козяче молоко', effects:{hunger:15,thirst:30,health:5} },
  'gold_coin':      { id:'gold_coin', name:'Золота монета', icon:'gold', category:'resource', maxStack:50, description:'Піратське золото для торгівлі в селі' },
  'fence_item':     { id:'fence_item', name:'Частокіл (предмет)', icon:'fence', category:'building', maxStack:10, placeable:'fence', description:'Дерев\'яний частокіл для захисту' },
  'gate_item':      { id:'gate_item', name:'Ворота (предмет)', icon:'gate', category:'building', maxStack:5, placeable:'gate', description:'Ворота для проходу' },
  'spikes_item':    { id:'spikes_item', name:'Шипи (предмет)', icon:'spikes', category:'building', maxStack:10, placeable:'spikes', description:'Шипи, які ранять нападників' },
  'spotlight_item': { id:'spotlight_item', name:'Прожектор (предмет)', icon:'spotlight', category:'building', maxStack:2, placeable:'spotlight', description:'Потужний прожектор відлякує зомбі' },
  'animal_pen_item':{ id:'animal_pen_item', name:'Загін для тварин (предмет)', icon:'pen', category:'building', maxStack:1, placeable:'animal_pen', description:'Загін для утримання тварин' },
  'radio_tower_item':{ id:'radio_tower_item', name:'Радіовежа SOS (предмет)', icon:'radio', category:'building', maxStack:1, placeable:'radio_tower', description:'Радіовежа для виклику гелікоптера' }
};

window.RECIPE_DB = {
  'stone_axe':      { id:'stone_axe', name:'Кам\'яна сокира', result:{id:'stone_axe',count:1}, materials:[{id:'branch',count:3},{id:'stone',count:2},{id:'fiber',count:2}], requires:null },
  'stone_knife':    { id:'stone_knife', name:'Кам\'яний ніж', result:{id:'stone_knife',count:1}, materials:[{id:'stone',count:2},{id:'branch',count:1},{id:'fiber',count:1}], requires:null },
  'spear':          { id:'spear', name:'Спис', result:{id:'spear',count:1}, materials:[{id:'branch',count:2},{id:'stone',count:1},{id:'fiber',count:2}], requires:null },
  'campfire_item':  { id:'campfire_item', name:'Вогнище', result:{id:'campfire_item',count:1}, materials:[{id:'branch',count:5},{id:'stone',count:4}], requires:null },
  'basket':         { id:'basket', name:'Кошик', result:{id:'basket',count:1}, materials:[{id:'fiber',count:5},{id:'branch',count:2}], requires:null },
  'water_container':{ id:'water_container', name:'Ємність для води', result:{id:'water_container',count:1}, materials:[{id:'wood',count:2},{id:'fiber',count:3}], requires:null },
  'rope':           { id:'rope', name:'Мотузка', result:{id:'rope',count:1}, materials:[{id:'fiber',count:4}], requires:null },
  'fishing_rod':    { id:'fishing_rod', name:'Вудка', result:{id:'fishing_rod',count:1}, materials:[{id:'branch',count:2},{id:'fiber',count:3}], requires:null },
  'shelter_item':   { id:'shelter_item', name:'Укриття', result:{id:'shelter_item',count:1}, materials:[{id:'wood',count:8},{id:'branch',count:5},{id:'fiber',count:4}], requires:null },
  'rain_collector_item': { id:'rain_collector_item', name:'Дощозбірник', result:{id:'rain_collector_item',count:1}, materials:[{id:'wood',count:4},{id:'fiber',count:3},{id:'stone',count:2}], requires:null },
  'workbench_item': { id:'workbench_item', name:'Верстак', result:{id:'workbench_item',count:1}, materials:[{id:'wood',count:10},{id:'stone',count:5},{id:'branch',count:3}], requires:null },
  'chest_item':     { id:'chest_item', name:'Скриня', result:{id:'chest_item',count:1}, materials:[{id:'wood',count:8},{id:'stone',count:2}], requires:null },
  'dog_house_item': { id:'dog_house_item', name:'Собача будка', result:{id:'dog_house_item',count:1}, materials:[{id:'wood',count:8},{id:'fiber',count:4}], requires:null },
  'dog_food_bowl':  { id:'dog_food_bowl', name:'Миска для їжі', result:{id:'dog_food_bowl',count:1}, materials:[{id:'wood',count:2},{id:'stone',count:1}], requires:null },
  'dog_water_bowl': { id:'dog_water_bowl', name:'Миска для води', result:{id:'dog_water_bowl',count:1}, materials:[{id:'wood',count:2},{id:'stone',count:1}], requires:null },
  'wooden_house_item': { id:'wooden_house_item', name:'Дерев\'яний будинок', result:{id:'wooden_house_item',count:1}, materials:[{id:'wood',count:20},{id:'stone',count:8},{id:'rope',count:3}], requires:'workbench' },
  'garden_item':    { id:'garden_item', name:'Грядка', result:{id:'garden_item',count:1}, materials:[{id:'wood',count:4},{id:'fiber',count:2}], requires:'workbench' },
  'cooked_fish':    { id:'cooked_fish', name:'Печена риба', result:{id:'cooked_fish',count:1}, materials:[{id:'fish',count:1}], requires:'campfire' },
  'cooked_meat':    { id:'cooked_meat', name:'Печене м\'ясо', result:{id:'cooked_meat',count:1}, materials:[{id:'meat',count:1}], requires:'campfire' },
  'plank':          { id:'plank', name:'Дошки', result:{id:'plank',count:2}, materials:[{id:'wood',count:1}], requires:'workbench' },
  'plank_hand':     { id:'plank_hand', name:'Дошка (вручну)', result:{id:'plank',count:1}, materials:[{id:'wood',count:2}], requires:null },
  'machinegun':     { id:'machinegun', name:'Кулемет', result:{id:'machinegun',count:1}, materials:[{id:'metal_scrap',count:12},{id:'electronics',count:3},{id:'rope',count:4}], requires:'workbench' },
  'sniper_rifle':   { id:'sniper_rifle', name:'Снайперська гвинтівка', result:{id:'sniper_rifle',count:1}, materials:[{id:'metal_scrap',count:10},{id:'electronics',count:5},{id:'rope',count:3}], requires:'workbench' },
  'metal_armor':    { id:'metal_armor', name:'Броньжилет', result:{id:'metal_armor',count:1}, materials:[{id:'metal_scrap',count:8},{id:'fiber',count:6},{id:'rope',count:3}], requires:'workbench' },
  'generator':      { id:'generator', name:'Генератор', result:{id:'generator',count:1}, materials:[{id:'metal_scrap',count:10},{id:'electronics',count:8},{id:'fuel',count:2}], requires:'workbench' },
  'car':            { id:'car', name:'Позашляховик', result:{id:'car',count:1}, materials:[{id:'metal_scrap',count:20},{id:'electronics',count:10},{id:'fuel',count:3},{id:'rope',count:5}], requires:'workbench' },
  'bridge_item':    { id:'bridge_item', name:'Міст (секція)', result:{id:'bridge_item',count:1}, materials:[{id:'plank',count:6},{id:'rope',count:2}], requires:'workbench' },
  'dock_item':      { id:'dock_item', name:'Причал', result:{id:'dock_item',count:1}, materials:[{id:'plank',count:12},{id:'rope',count:4},{id:'stone',count:6}], requires:'workbench' },
  'gunpowder':      { id:'gunpowder', name:'Порох', result:{id:'gunpowder',count:2}, materials:[{id:'sulfur',count:1},{id:'wood',count:1}], requires:'workbench' },
  'ammo_craft':     { id:'ammo_craft', name:'Набої (10 шт)', result:{id:'ammo',count:10}, materials:[{id:'gunpowder',count:2},{id:'metal_scrap',count:1}], requires:'workbench' },
  'cooked_egg':     { id:'cooked_egg', name:'Яєчня', result:{id:'cooked_egg',count:1}, materials:[{id:'egg',count:1}], requires:'campfire' },
  'fence_item':     { id:'fence_item', name:'Частокіл', result:{id:'fence_item',count:2}, materials:[{id:'plank',count:2},{id:'wood',count:1}], requires:'workbench' },
  'gate_item':      { id:'gate_item', name:'Ворота', result:{id:'gate_item',count:1}, materials:[{id:'plank',count:4},{id:'rope',count:1}], requires:'workbench' },
  'spikes_item':    { id:'spikes_item', name:'Шипи', result:{id:'spikes_item',count:2}, materials:[{id:'wood',count:2},{id:'metal_scrap',count:1}], requires:null },
  'spotlight_item': { id:'spotlight_item', name:'Прожектор', result:{id:'spotlight_item',count:1}, materials:[{id:'metal_scrap',count:6},{id:'electronics',count:2},{id:'glass_shard',count:4}], requires:'workbench' },
  'animal_pen_item':{ id:'animal_pen_item', name:'Загін для тварин', result:{id:'animal_pen_item',count:1}, materials:[{id:'wood',count:10},{id:'rope',count:3},{id:'plank',count:4}], requires:'workbench' },
  'radio_tower_item':{ id:'radio_tower_item', name:'Радіовежа SOS', result:{id:'radio_tower_item',count:1}, materials:[{id:'metal_scrap',count:15},{id:'electronics',count:8},{id:'generator',count:1},{id:'rope',count:4}], requires:'workbench' }
};

window.BUILDING_DB = {
  'campfire':       { id:'campfire', name:'Вогнище', width:40, height:40, passable:false, maxHealth:100, description:'Джерело тепла та приготування їжі', func:'heat' },
  'shelter':        { id:'shelter', name:'Укриття', width:64, height:64, passable:false, maxHealth:150, description:'Примітивне укриття від дощу', func:'rest' },
  'wooden_house':   { id:'wooden_house', name:'Дерев\'яний будинок', width:80, height:80, passable:false, maxHealth:300, description:'Міцний дерев\'яний будинок', func:'rest' },
  'chest':          { id:'chest', name:'Скриня', width:36, height:36, passable:false, maxHealth:100, description:'Зберігає предмети', func:'storage', storageSlots:20 },
  'workbench':      { id:'workbench', name:'Верстак', width:48, height:48, passable:false, maxHealth:150, description:'Відкриває нові рецепти', func:'crafting' },
  'rain_collector': { id:'rain_collector', name:'Дощозбірник', width:36, height:36, passable:false, maxHealth:80, description:'Збирає воду під час дощу', func:'water', waterCapacity:5 },
  'garden':         { id:'garden', name:'Грядка', width:50, height:50, passable:true, maxHealth:50, description:'Для вирощування рослин', func:'farming' },
  'dog_house':      { id:'dog_house', name:'Собача будка', width:40, height:40, passable:false, maxHealth:100, description:'Місце відпочинку для собаки', func:'dog_rest' },
  'feeder':         { id:'feeder', name:'Годівниця', width:30, height:30, passable:false, maxHealth:60, description:'Годівниця для тварин', func:'dog_food' },
  'waterer':        { id:'waterer', name:'Поїлка', width:30, height:30, passable:false, maxHealth:60, description:'Поїлка для тварин', func:'dog_water' },
  'bridge':  { id:'bridge', name:'Міст', width:32, height:64, passable:true, maxHealth:200, description:'Секція мосту — можна ходити по воді', func:'bridge' },
  'dock':    { id:'dock', name:'Причал', width:80, height:48, passable:true, maxHealth:250, description:'Причал для човна', func:'dock' },
  'fence':        { id:'fence', name:'Частокіл', width:32, height:32, passable:false, maxHealth:250, description:'Захисний частокіл', func:'defense' },
  'gate':         { id:'gate', name:'Ворота', width:36, height:36, passable:true, maxHealth:250, description:'Ворота бази', func:'gate' },
  'spikes':       { id:'spikes', name:'Шипи', width:32, height:32, passable:true, maxHealth:120, description:'Шипи для пастки', func:'spikes' },
  'spotlight':    { id:'spotlight', name:'Прожектор', width:36, height:36, passable:false, maxHealth:180, description:'Прожектор проти нічних істот', func:'spotlight' },
  'animal_pen':   { id:'animal_pen', name:'Загін для тварин', width:80, height:80, passable:true, maxHealth:300, description:'Загін для утримання тварин', func:'pen' },
  'radio_tower':  { id:'radio_tower', name:'Радіовежа SOS', width:54, height:72, passable:false, maxHealth:600, description:'Радіовежа для виклику гелікоптера', func:'radio_tower' }
};

window.Inventory = class Inventory {
  constructor(maxSlots = 30) {
    this.maxSlots = maxSlots;
    this.slots = new Array(maxSlots).fill(null);
  }

  addItem(itemId, count = 1) {
    if (!window.ITEM_DB[itemId]) return 0;
    const itemData = window.ITEM_DB[itemId];
    let remaining = count;

    for (let i = 0; i < this.maxSlots; i++) {
      if (this.slots[i] && this.slots[i].id === itemId) {
        const space = itemData.maxStack - this.slots[i].count;
        if (space > 0) {
          const toAdd = Math.min(space, remaining);
          this.slots[i].count += toAdd;
          remaining -= toAdd;
          if (remaining === 0) return count;
        }
      }
    }

    for (let i = 0; i < this.maxSlots; i++) {
      if (!this.slots[i]) {
        const toAdd = Math.min(itemData.maxStack, remaining);
        this.slots[i] = { id: itemId, count: toAdd };
        remaining -= toAdd;
        if (remaining === 0) return count;
      }
    }

    return count - remaining;
  }

  removeItem(itemId, count = 1) {
    if (!this.hasItem(itemId, count)) return false;
    let remaining = count;
    for (let i = this.maxSlots - 1; i >= 0; i--) {
      if (this.slots[i] && this.slots[i].id === itemId) {
        if (this.slots[i].count > remaining) {
          this.slots[i].count -= remaining;
          return true;
        } else {
          remaining -= this.slots[i].count;
          this.slots[i] = null;
          if (remaining === 0) return true;
        }
      }
    }
    return false;
  }

  hasItem(itemId, count = 1) {
    return this.countItem(itemId) >= count;
  }

  countItem(itemId) {
    let total = 0;
    for (let i = 0; i < this.maxSlots; i++) {
      if (this.slots[i] && this.slots[i].id === itemId) {
        total += this.slots[i].count;
      }
    }
    return total;
  }

  getSlot(index) {
    if (index < 0 || index >= this.maxSlots) return null;
    return this.slots[index];
  }

  setSlot(index, slot) {
    if (index >= 0 && index < this.maxSlots) {
      this.slots[index] = slot;
    }
  }

  findItemSlot(itemId) {
    for (let i = 0; i < this.maxSlots; i++) {
      if (this.slots[i] && this.slots[i].id === itemId) {
        return i;
      }
    }
    return -1;
  }

  useItem(index, playerStats) {
    const slot = this.slots[index];
    if (!slot) return false;
    const itemData = window.ITEM_DB[slot.id];
    
    if (itemData.category === 'food' && itemData.effects) {
      if (itemData.effects.hunger) playerStats.hunger = Math.min(playerStats.maxHunger || 100, playerStats.hunger + itemData.effects.hunger);
      if (itemData.effects.thirst) playerStats.thirst = Math.min(playerStats.maxThirst || 100, playerStats.thirst + itemData.effects.thirst);
      if (itemData.effects.health) playerStats.health = Math.min(playerStats.maxHealth || 100, playerStats.health + itemData.effects.health);
      if (itemData.effects.energy) playerStats.energy = Math.min(playerStats.maxEnergy || 100, playerStats.energy + itemData.effects.energy);
      
      this.removeItem(slot.id, 1);
      return true;
    }
    
    if (itemData.category === 'tool' || itemData.category === 'weapon') {
      playerStats.equippedTool = slot.id;
      return true;
    }
    
    return false;
  }

  moveItem(fromIndex, toIndex) {
    if (fromIndex === toIndex || fromIndex < 0 || fromIndex >= this.maxSlots || toIndex < 0 || toIndex >= this.maxSlots) return;
    const fromSlot = this.slots[fromIndex];
    const toSlot = this.slots[toIndex];

    if (!fromSlot) return;

    if (!toSlot) {
      this.slots[toIndex] = fromSlot;
      this.slots[fromIndex] = null;
    } else if (fromSlot.id === toSlot.id) {
      const itemData = window.ITEM_DB[fromSlot.id];
      const space = itemData.maxStack - toSlot.count;
      if (space >= fromSlot.count) {
        toSlot.count += fromSlot.count;
        this.slots[fromIndex] = null;
      } else {
        toSlot.count = itemData.maxStack;
        fromSlot.count -= space;
      }
    } else {
      this.slots[toIndex] = fromSlot;
      this.slots[fromIndex] = toSlot;
    }
  }

  dropItem(index, count, x, y) {
    const slot = this.slots[index];
    if (!slot) return null;
    const dropCount = Math.min(slot.count, count);
    const droppedId = 'drop_' + Date.now() + Math.random().toString(36).substring(2, 9);
    
    const droppedItem = {
      id: droppedId,
      itemId: slot.id,
      count: dropCount,
      x: x,
      y: y
    };
    
    slot.count -= dropCount;
    if (slot.count <= 0) {
      this.slots[index] = null;
    }
    
    return droppedItem;
  }

  isEmpty() {
    return this.slots.every(slot => slot === null);
  }

  isFull() {
    return this.slots.every(slot => slot !== null && slot.count >= window.ITEM_DB[slot.id].maxStack);
  }

  serialize() {
    return this.slots;
  }

  static deserialize(data, maxSlots) {
    const inv = new window.Inventory(maxSlots);
    if (data && Array.isArray(data)) {
      for (let i = 0; i < maxSlots; i++) {
        if (i < data.length) {
          inv.slots[i] = data[i] ? { id: data[i].id, count: data[i].count } : null;
        }
      }
    }
    return inv;
  }
};

window.CraftingSystem = class CraftingSystem {
  constructor() {
    this.unlockedRecipes = new Set();
    this.updateAvailability([]);
  }

  updateAvailability(buildings) {
    const hasWorkbench = buildings.some(b => b.type === 'workbench');
    const hasCampfire = buildings.some(b => b.type === 'campfire');

    for (const [id, recipe] of Object.entries(window.RECIPE_DB)) {
      if (!recipe.requires) {
        this.unlockedRecipes.add(id);
      } else if (recipe.requires === 'workbench' && hasWorkbench) {
        this.unlockedRecipes.add(id);
      } else if (recipe.requires === 'campfire' && hasCampfire) {
        this.unlockedRecipes.add(id);
      } else {
        this.unlockedRecipes.delete(id);
      }
    }
  }

  getAvailableRecipes() {
    return Array.from(this.unlockedRecipes);
  }

  canCraft(recipeId, inventory) {
    const recipe = window.RECIPE_DB[recipeId];
    if (!recipe) return false;
    if (!this.unlockedRecipes.has(recipeId)) return false;

    for (const mat of recipe.materials) {
      if (!inventory.hasItem(mat.id, mat.count)) {
        return false;
      }
    }
    return true;
  }

  craft(recipeId, inventory) {
    if (!this.canCraft(recipeId, inventory)) {
      return { success: false, message: 'Не вистачає матеріалів або рецепт недоступний.', itemId: null };
    }

    const recipe = window.RECIPE_DB[recipeId];
    for (const mat of recipe.materials) {
      inventory.removeItem(mat.id, mat.count);
    }

    inventory.addItem(recipe.result.id, recipe.result.count);
    return { success: true, message: `Створено ${recipe.name}!`, itemId: recipe.result.id };
  }

  serialize() {
    return { unlockedRecipes: Array.from(this.unlockedRecipes) };
  }

  static deserialize(data) {
    const sys = new window.CraftingSystem();
    if (data && data.unlockedRecipes) {
      sys.unlockedRecipes = new Set(data.unlockedRecipes);
    }
    return sys;
  }
};

window.BuildingSystem = class BuildingSystem {
  constructor() {
    this.buildings = [];
    this.nextId = 0;
  }

  canPlace(typeId, x, y, worldTiles, tileSize) {
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
      // Bridge/dock: must be on water (type 0 or 1) or shallow (1), or beach (2)
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
      const rect2 = { x: b.x - b2Data.width/2, y: b.y - b2Data.height/2, w: b2Data.width, h: b2Data.height };
      
      if (rect1.x < rect2.x + rect2.w &&
          rect1.x + rect1.w > rect2.x &&
          rect1.y < rect2.y + rect2.h &&
          rect1.h + rect1.y > rect2.y) {
        return { valid: false, reason: 'Місце зайняте іншою будівлею' };
      }
    }
    return { valid: true, reason: '' };
  }

  place(typeId, x, y) {
    const bData = window.BUILDING_DB[typeId];
    if (!bData) return null;

    const building = {
      id: 'bld_' + this.nextId++,
      type: typeId,
      x: x,
      y: y,
      health: bData.maxHealth,
      maxHealth: bData.maxHealth,
      active: true,
      inventory: null,
      waterLevel: 0
    };

    if (bData.func === 'storage') {
      const inv = new window.Inventory(bData.storageSlots);
      building.inventory = inv.serialize();
    }

    this.buildings.push(building);
    return building;
  }

  remove(buildingId) {
    const idx = this.buildings.findIndex(b => b.id === buildingId);
    if (idx !== -1) {
      this.buildings.splice(idx, 1);
      return true;
    }
    return false;
  }

  getBuildingAt(x, y) {
    for (const b of this.buildings) {
      const bData = window.BUILDING_DB[b.type];
      const hw = bData.width / 2;
      const hh = bData.height / 2;
      if (x >= b.x - hw && x <= b.x + hw && y >= b.y - hh && y <= b.y + hh) {
        return b;
      }
    }
    return null;
  }

  getBuildingsNear(x, y, radius) {
    return this.buildings.filter(b => {
      const dx = b.x - x;
      const dy = b.y - y;
      return Math.sqrt(dx*dx + dy*dy) <= radius;
    });
  }

  hasBuilding(typeId) {
    return this.buildings.some(b => b.type === typeId);
  }

  getCollisionRects() {
    return this.buildings.map(b => {
      const bData = window.BUILDING_DB[b.type];
      return {
        x: b.x,
        y: b.y,
        w: bData ? bData.width : 40,
        h: bData ? bData.height : 40,
        passable: bData ? bData.passable : false
      };
    }).filter(r => !r.passable);
  }

  update(dt, weather, totalTime) {
    const isRaining = weather.isRaining();
    for (const b of this.buildings) {
      if (b.type === 'rain_collector' && isRaining) {
        const bData = window.BUILDING_DB[b.type];
        b.waterLevel = Math.min(bData.waterCapacity, b.waterLevel + dt * 0.05);
      }
    }
  }

  interact(buildingId, player) {
    const b = this.buildings.find(b => b.id === buildingId);
    if (!b) return { action: 'none', message: '', data: null };

    const bData = window.BUILDING_DB[b.type];
    if (!bData) return { action: 'none', message: '', data: null };
    
    if (bData.func === 'water') {
      if (b.waterLevel >= 1) {
        b.waterLevel -= 1;
        player.inventory.addItem('water', 1);
        return { action: 'harvest', message: 'Ви зібрали чисту воду.', data: null };
      }
      return { action: 'none', message: 'Дощозбірник порожній. Зачекайте дощу.', data: null };
    }
    
    if (bData.func === 'storage') {
      return { action: 'open_storage', message: 'Відкрито скриню.', data: b };
    }

    if (bData.func === 'crafting') {
      return { action: 'open_crafting', message: 'Відкрито верстак для створення предметів.', data: b };
    }

    if (bData.func === 'farming') {
      if (!b.crop) {
        if (player.inventory.hasItem('berry_seeds', 1)) {
          player.inventory.removeItem('berry_seeds', 1);
          b.crop = 'berry';
          b.growProgress = 0;
          b.isWatered = false;
          return { action: 'farming', message: 'Посаджено кущ лісових ягід! Полийте водою для швидшого росту.', data: b };
        } else if (player.inventory.hasItem('palm_seed', 1)) {
          player.inventory.removeItem('palm_seed', 1);
          b.crop = 'coconut';
          b.growProgress = 0;
          b.isWatered = false;
          return { action: 'farming', message: 'Посаджено саджанець пальми! Полийте водою.', data: b };
        }
        return { action: 'none', message: 'Потрібне насіння ягід або саджанець пальми для посадки.', data: b };
      } else {
        if (!b.isWatered && player.inventory.hasItem('water', 1)) {
          player.inventory.removeItem('water', 1);
          b.isWatered = true;
          b.growProgress = Math.min(100, (b.growProgress || 0) + 35);
          return { action: 'farming', message: 'Грядку полито! Ріст прискорено.', data: b };
        }
        if (b.growProgress >= 100) {
          const cropId = b.crop;
          const count = cropId === 'berry' ? 4 : 2;
          player.inventory.addItem(cropId, count);
          player.inventory.addItem('berry_seeds', 1);
          b.crop = null;
          b.growProgress = 0;
          b.isWatered = false;
          return { action: 'harvest', message: `Зібрано свіжий врожай (${count} шт) та насіння!`, data: b };
        }
        const prog = Math.floor(b.growProgress || 0);
        return { action: 'none', message: `Рослина росте... ${prog}% ${b.isWatered ? '(Полито)' : '(Потрібен полив)'}`, data: b };
      }
    }

    if (bData.func === 'gate') {
      b.isOpen = !b.isOpen;
      return { action: 'gate', message: b.isOpen ? 'Ворота відчинено.' : 'Ворота зачинено.', data: b };
    }

    if (bData.func === 'pen') {
      return { action: 'pen', message: 'Загін для тварин. Годуйте курей насінням, а кіз волокном.', data: b };
    }

    if (bData.func === 'spotlight') {
      b.active = !b.active;
      return { action: 'spotlight', message: b.active ? 'Прожектор увімкнено! Світло відлякує зомбі.' : 'Прожектор вимкнено.', data: b };
    }

    if (bData.func === 'radio_tower') {
      return { action: 'radio_tower', message: 'Радіовежа SOS. Взаємодійте для виклику рятувальників!', data: b };
    }

    if (bData.func === 'dog_rest' || bData.func === 'dog_food' || bData.func === 'dog_water') {
      return { action: 'dog_building', message: `Місце для собаки: ${bData.name}.`, data: b };
    }

    if (bData.func === 'rest' || bData.func === 'heat') {
      player.energy = Math.min(player.maxEnergy, player.energy + 25);
      // Ensure player is safely outside obstacle collision perimeter so they can freely move
      const minSafeDist = Math.max(bData.width, bData.height) / 2 + 18;
      const dx = player.x - b.x;
      const dy = player.y - b.y;
      const dist = Math.hypot(dx, dy);
      if (dist < minSafeDist) {
        const angle = dist > 0.1 ? Math.atan2(dy, dx) : (Math.PI / 2);
        player.x = b.x + Math.cos(angle) * minSafeDist;
        player.y = b.y + Math.sin(angle) * minSafeDist;
      }
      return { action: 'rest', message: 'Ви відпочили та відновили сили!', data: null };
    }

    return { action: 'interact', message: `Взаємодія з ${bData.name}.`, data: null };
  }

  serialize() {
    return { buildings: this.buildings, nextId: this.nextId };
  }

  static deserialize(data) {
    const sys = new window.BuildingSystem();
    if (data) {
      sys.buildings = data.buildings || [];
      sys.nextId = data.nextId || 0;
    }
    return sys;
  }
};

window.WeatherSystem = class WeatherSystem {
  constructor() {
    this.current = 'sunny';
    this.intensity = 0;
    this.duration = 300;
    this.windSpeed = 0.2;
    this.windDirection = 0;
    this.particles = [];
  }

  update(dt) {
    this.duration -= dt;
    if (this.duration <= 0) {
      const weathers = ['sunny', 'cloudy', 'rain', 'heavy_rain', 'storm', 'fog'];
      this.current = weathers[Math.floor(Math.random() * weathers.length)];
      this.duration = 180 + Math.random() * 300;
      this.intensity = Math.random();
      this.windSpeed = Math.random();
      this.windDirection = Math.random() * Math.PI * 2;
    }

    if (this.isRaining() || this.current === 'fog') {
      const maxParticles = this.current === 'heavy_rain' ? 200 : (this.current === 'storm' ? 300 : 100);
      if (this.particles.length < maxParticles) {
        this.particles.push({
          x: Math.random() * 800,
          y: -10,
          vx: Math.cos(this.windDirection) * this.windSpeed * 100,
          vy: 200 + Math.random() * 100,
          life: 0,
          maxLife: 2 + Math.random()
        });
      }
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life += dt;
      if (p.life >= p.maxLife || p.y > 600) {
        this.particles.splice(i, 1);
      }
    }
  }

  isRaining() {
    return ['rain', 'heavy_rain', 'storm'].includes(this.current);
  }

  getVisibility() {
    if (this.current === 'fog') return 0.4;
    if (this.current === 'storm') return 0.6;
    if (this.current === 'heavy_rain') return 0.7;
    if (this.current === 'rain') return 0.85;
    if (this.current === 'cloudy') return 0.9;
    return 1.0;
  }

  getTemperatureModifier() {
    if (this.isRaining()) return 0.5;
    if (this.current === 'sunny') return 1.5;
    return 1.0;
  }

  serialize() {
    return {
      current: this.current,
      intensity: this.intensity,
      duration: this.duration,
      windSpeed: this.windSpeed,
      windDirection: this.windDirection
    };
  }

  static deserialize(data) {
    const sys = new window.WeatherSystem();
    if (data) {
      sys.current = data.current || 'sunny';
      sys.intensity = data.intensity || 0;
      sys.duration = data.duration || 300;
      sys.windSpeed = data.windSpeed || 0;
      sys.windDirection = data.windDirection || 0;
    }
    return sys;
  }
};

window.TimeSystem = class TimeSystem {
  constructor() {
    this.day = 1;
    this.hour = 8.0; 
    this.totalTime = 0;
    this.dayDurationReal = 600; 
  }

  update(dt) {
    this.totalTime += dt;
    const hoursPerSecond = 24 / this.dayDurationReal;
    this.hour += dt * hoursPerSecond;
    if (this.hour >= 24) {
      this.hour -= 24;
      this.day++;
    }
  }

  getTimeString() {
    const h = Math.floor(this.hour);
    const m = Math.floor((this.hour - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  getDayString() {
    return `День ${this.day}`;
  }

  isNight() {
    return this.hour < 6 || this.hour >= 21;
  }

  getLightLevel() {
    if (this.hour >= 8 && this.hour <= 18) return 1.0;
    if (this.hour < 5 || this.hour > 22) return 0.2;
    if (this.hour >= 5 && this.hour < 8) {
      return 0.2 + 0.8 * ((this.hour - 5) / 3);
    }
    if (this.hour > 18 && this.hour <= 22) {
      return 1.0 - 0.8 * ((this.hour - 18) / 4);
    }
    return 1.0;
  }

  getHour() {
    return this.hour;
  }

  serialize() {
    return {
      day: this.day,
      hour: this.hour,
      totalTime: this.totalTime,
      dayDurationReal: this.dayDurationReal
    };
  }

  static deserialize(data) {
    const sys = new window.TimeSystem();
    if (data) {
      sys.day = data.day || 1;
      sys.hour = data.hour || 8.0;
      sys.totalTime = data.totalTime || 0;
      sys.dayDurationReal = data.dayDurationReal || 600;
    }
    return sys;
  }
};

window.SurvivalSystem = class SurvivalSystem {
  constructor() {}

  update(dt, playerStats, weather, time) {
    const tempMod = weather.getTemperatureModifier();
    
    playerStats.hunger -= dt * 0.1;
    playerStats.thirst -= dt * 0.15 * tempMod;
    
    if (playerStats.moving) {
      playerStats.energy -= dt * 0.2;
    } else {
      playerStats.energy += dt * 0.1;
    }

    if (time.isNight()) {
      playerStats.energy -= dt * 0.05;
    }

    playerStats.hunger = Math.max(0, playerStats.hunger);
    playerStats.thirst = Math.max(0, playerStats.thirst);
    playerStats.energy = Math.max(0, Math.min(playerStats.maxEnergy || 100, playerStats.energy));

    if (playerStats.hunger === 0 || playerStats.thirst === 0) {
      playerStats.health -= dt * 0.5;
    } else if (playerStats.hunger > 50 && playerStats.thirst > 50) {
      playerStats.health += dt * 0.1;
    }

    playerStats.health = Math.max(0, Math.min(playerStats.maxHealth || 100, playerStats.health));
  }
};

window.QuestSystem = class QuestSystem {
  constructor() {
    this.quests = [];
  }

  init() {
    this.quests = [
      { id: 'q1', title: 'Перші кроки', description: 'Зібрати 5 гілок', completed: false, progress: 0, target: 5, type: 'gather', targetId: 'branch' },
      { id: 'q2', title: 'Інструменти', description: 'Створити кам\'яну сокиру', completed: false, progress: 0, target: 1, type: 'craft', targetId: 'stone_axe' },
      { id: 'q3', title: 'Вгамуй спрагу', description: 'Знайти воду', completed: false, progress: 0, target: 1, type: 'gather', targetId: 'water' },
      { id: 'q4', title: 'Притулок', description: 'Збудувати укриття', completed: false, progress: 0, target: 1, type: 'build', targetId: 'shelter' },
      { id: 'q5', title: 'Вірний друг', description: 'Приручити собаку', completed: false, progress: 0, target: 1, type: 'tame' },
      { id: 'q6', title: 'Дослідник', description: 'Дослідити острів', completed: false, progress: 0, target: 50, type: 'explore' }
    ];
  }

  checkProgress(gameState) {
    for (const q of this.quests) {
      if (q.completed) continue;

      if (q.type === 'gather') {
        const count = gameState.player && gameState.player.inventory ? gameState.player.inventory.countItem(q.targetId) : 0;
        q.progress = Math.max(q.progress, count);
      } else if (q.type === 'craft') {
        const count = gameState.player && gameState.player.inventory ? gameState.player.inventory.countItem(q.targetId) : 0;
        q.progress = Math.max(q.progress, count);
      } else if (q.type === 'build') {
        const hasBuilt = gameState.buildings && gameState.buildings.some(b => b.type === q.targetId);
        if (hasBuilt) q.progress = 1;
      } else if (q.type === 'tame') {
        if (gameState.dogs && gameState.dogs.length > 0) q.progress = 1;
      } else if (q.type === 'explore') {
        q.progress = Math.min(q.target, q.progress + 0.01);
      }

      if (q.progress >= q.target) {
        q.completed = true;
        q.progress = q.target;
      }
    }
  }

  getActiveQuests() {
    return this.quests.filter(q => !q.completed);
  }

  getCompletedQuests() {
    return this.quests.filter(q => q.completed);
  }

  serialize() {
    return { quests: this.quests };
  }

  static deserialize(data) {
    const sys = new window.QuestSystem();
    if (data && data.quests) {
      sys.quests = data.quests;
    } else {
      sys.init();
    }
    return sys;
  }
};

window.EventSystem = class EventSystem {
  constructor() {
    this.lastEventTime = 0;
    this.minCooldown = 180;
    this.nextPlaneCrashTime = 15;
    this.eventLog = [];
  }

  update(dt, gameState) {
    // Game chooses a valid land position for the crash site.
    if (gameState.totalTime >= this.nextPlaneCrashTime) {
      this.lastEventTime = gameState.totalTime;
      this.nextPlaneCrashTime = gameState.totalTime + 300 + Math.random() * 180;
      const ev = { type: 'plane_crash', data: {}, message: 'У небі пролунав вибух — літак упав на острові!' };
      this.eventLog.push(ev.message);
      return ev;
    }
    if (gameState.totalTime - this.lastEventTime > this.minCooldown) {
      if (Math.random() < 0.0005) {
        this.lastEventTime = gameState.totalTime;
        const events = [
          { type: 'supply_drop', data: { x: Math.random() * 1000, y: Math.random() * 1000 }, message: 'Припаси викинуто на берег!' },
          { type: 'wild_dog_pack', data: {}, message: 'Зграя диких собак неподалік.' }
        ];
        const ev = events[Math.floor(Math.random() * events.length)];
        this.eventLog.push(ev.message);
        return ev;
      }
    }
    return null;
  }

  serialize() {
    return {
      lastEventTime: this.lastEventTime,
      minCooldown: this.minCooldown,
      nextPlaneCrashTime: this.nextPlaneCrashTime,
      eventLog: this.eventLog
    };
  }

  static deserialize(data) {
    const sys = new window.EventSystem();
    if (data) {
      sys.lastEventTime = data.lastEventTime || 0;
      sys.minCooldown = data.minCooldown || 300;
      sys.nextPlaneCrashTime = data.nextPlaneCrashTime || 15;
      sys.eventLog = data.eventLog || [];
    }
    return sys;
  }
};
