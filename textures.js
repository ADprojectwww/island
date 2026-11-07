// Local PNG atlases with cached Canvas artwork while images load.
(() => {
    'use strict';
    const cache = new Map();
    const art = {};
    const atlases = {};
    const resourceCells = { tree:0, palm:1, coconut_palm:1, rock_node:2, bush:3, berry_bush:4, mushroom_spot:5, branch_pile:6, fiber_plant:7, stump:8 };
    const buildingCells = { campfire:0, shelter:1, wooden_house:2, chest:3, workbench:4, rain_collector:5, dog_house:6, garden:7, solar_panel:8 };
    const ready = Promise.all(['terrain', 'resources', 'buildings', 'animals-wild', 'animals-farm', 'player', 'aircraft'].map(name => new Promise(resolve => {
        const image = new Image();
        image.onload = () => { atlases[name] = image; resolve(true); };
        image.onerror = () => { console.warn(`Texture atlas unavailable: ${name}`); resolve(false); };
        image.src = `assets/textures/${name}-atlas.png`;
    })));
    // One simulation clock: render calls never advance time, and pausing freezes all effects.
    let animationTime = 0;
    let animalMotion = new WeakMap();
    let playerMotion = new WeakMap();
    let planeFlights = new WeakMap();
    const animalRows = { rabbit:['animals-wild',0,36,36], turtle:['animals-wild',1,36,30], parrot:['animals-wild',2,46,46], boar:['animals-wild',3,54,44], wild_dog:['animals-farm',0,50,43], companion:['animals-farm',1,50,43], chicken:['animals-farm',2,33,36], goat:['animals-farm',3,48,44] };
    const phaseAt = (x, y) => x * 0.037 + y * 0.051;
    function windAt(x, y) {
        const weather = window.game?.weatherSystem;
        const strength = 0.5 + (weather?.windSpeed || 0.2) * (weather?.current === 'storm' ? 2 : 1);
        return (Math.sin(animationTime * 1.8 + phaseAt(x, y)) + Math.sin(animationTime * 3.1 + x * 0.01) * 0.25) * strength;
    }
    function drawWindSprite(ctx, atlas, cell, x, bottom, w, h, sway) {
        const image = atlases[atlas];
        if (!image || !image.complete || !image.naturalWidth) return;
        const sw = image.naturalWidth / 3, sh = image.naturalHeight / 3;
        const sx = cell % 3 * sw + 1, sy = Math.floor(cell / 3) * sh + 1;
        // Bend the canopy more than the base; roots and foundations stay planted.
        for (let strip = 0; strip < 12; strip++) {
            const top = strip / 12, next = (strip + 1) / 12;
            const bend = sway * Math.pow(1 - top, 2);
            ctx.drawImage(image, sx, sy + top * (sh - 2), sw - 2, (sh - 2) / 12,
                x - w / 2 + bend, bottom - h + top * h, w, (next - top) * h + 0.35);
        }
    }
    function drawWaterPatch(ctx, patch, sx, sy, x, y, size) {
        // Split wrapped source samples so camera movement never changes wave phase.
        sx = (sx % 256 + 256) % 256; sy = (sy % 256 + 256) % 256;
        const firstW = Math.min(32, 256 - sx), firstH = Math.min(32, 256 - sy);
        const xs = [[sx, firstW, 0], [0, 32 - firstW, firstW]];
        const ys = [[sy, firstH, 0], [0, 32 - firstH, firstH]];
        for (const [px, pw, dx] of xs) for (const [py, ph, dy] of ys) {
            if (pw <= 0 || ph <= 0) continue;
            ctx.drawImage(patch, px, py, pw, ph, x + dx / 32 * size, y + dy / 32 * size, pw / 32 * size + 0.5, ph / 32 * size + 0.5);
        }
    }
    function fireEffects(ctx, x, y, w, h, seed) {
        const t = animationTime;
        ctx.save();
        ctx.globalAlpha = 0.12 + Math.sin(t * 9 + seed) * 0.025;
        ctx.fillStyle = '#ffbd57'; ctx.beginPath(); ctx.ellipse(x, y + h * 0.15, w * 0.7, h * 0.3, 0, 0, Math.PI * 2); ctx.fill();
        for (let i = 0; i < 5; i++) {
            const rise = ((t * 0.7 + i * 0.21 + seed) % 1 + 1) % 1;
            ctx.globalAlpha = (1 - rise) * 0.8;
            ctx.fillStyle = i % 2 ? '#ffe49b' : '#ff9853';
            ctx.beginPath(); ctx.arc(x + Math.sin(t * 3 + i) * w * 0.16, y - rise * h * 0.9, 1.3 * (1 - rise) + 0.3, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
    }
    function atlasSprite(ctx, atlas, cell, x, y, w, h) {
        const image = atlases[atlas];
        if (!image || !image.complete || !image.naturalWidth || cell === undefined) return false;
        const sw = image.naturalWidth / 3, sh = image.naturalHeight / 3;
        ctx.drawImage(image, cell % 3 * sw + 1, Math.floor(cell / 3) * sh + 1, sw - 2, sh - 2, x, y, w, h);
        return true;
    }
    function terrainPatch(type) {
        const key = 'png-terrain:' + type;
        if (!cache.has(key)) {
            const image = atlases.terrain;
            if (!image || !image.complete || !image.naturalWidth) return null;
            const c = document.createElement('canvas'); c.width = c.height = 256;
            const ctx = c.getContext('2d');
            const sw = image.naturalWidth / 3, sh = image.naturalHeight / 2;
            // Mirror the material at the edges for a continuous repeat over eight tiles.
            for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) {
                ctx.save(); ctx.translate(x ? 256 : 0, y ? 256 : 0); ctx.scale(x ? -1 : 1, y ? -1 : 1);
                ctx.drawImage(image, type % 3 * sw + 2, Math.floor(type / 3) * sh + 2, sw - 4, sh - 4, 0, 0, 128, 128);
                ctx.restore();
            }
            cache.set(key, c);
        }
        return cache.get(key);
    }
    const shape = (c, d, fill, stroke = '#263b35') => {
        const p = new Path2D(d);
        c.fillStyle = fill; c.fill(p);
        c.strokeStyle = stroke; c.lineWidth = 1.3; c.stroke(p);
    };
    const rect = (c, x, y, w, h, color) => { c.fillStyle = color; c.fillRect(x, y, w, h); };
    const line = (c, d, color = '#d5e5db', width = 1.5) => {
        c.strokeStyle = color; c.lineWidth = width; c.stroke(new Path2D(d));
    };
    function register(ids, draw) { ids.split(' ').forEach(id => { art[id] = draw; }); }
    register('mushroom', c => {
        shape(c, 'M14 16h5v12h-5z', '#f6dec1');
        shape(c, 'M4 17Q5 2 16 3Q27 2 29 17Z', '#bd623d');
        rect(c, 10, 9, 3, 2, '#ffe4bb'); rect(c, 20, 11, 3, 2, '#ffe4bb');
    });
    register('meat cooked_meat', (c, id) => {
        shape(c, 'M7 9Q17 0 27 10Q34 22 20 27Q3 32 4 19Z', id === 'meat' ? '#ce706a' : '#965231');
        shape(c, 'M16 11Q23 9 24 16Q23 22 17 21Q11 18 16 11Z', '#f5d9b3');
        line(c, 'M7 15l5 -3M10 24l3 -3', '#6f332b');
    });
    register('viral_herb', c => { line(c, 'M16 30V5M16 20L6 12M16 16L26 7', '#75bd9d', 2); shape(c, 'M6 12Q0 1 13 7ZM26 7Q31 0 20 3Z', '#acdfba'); });
    register('rope', c => {
        c.strokeStyle = '#d4b477'; c.lineWidth = 4;
        for (let i = 0; i < 3; i++) { c.beginPath(); c.ellipse(16, 12 + i * 5, 11, 6, 0, 0, Math.PI * 2); c.stroke(); }
        line(c, 'M6 9l19 16M25 9L6 25', '#80613f', 1);
    });
    register('fishing_rod', c => { line(c, 'M5 29L21 3', '#b18a53', 3); line(c, 'M21 3Q33 6 26 22q-4 4 -4 -1', '#e4e6d8', 1); });
    register('basket water_container dog_food_bowl dog_water_bowl', (c, id) => {
        shape(c, 'M4 12L8 27H25L29 12Z', '#b38753');
        shape(c, 'M4 12Q16 4 29 12Q16 20 4 12Z', id.includes('water') ? '#61b9d2' : '#6c4d32');
        if (id === 'basket') line(c, 'M7 12Q16 -3 26 12M10 19h13M10 23h13', '#e2c38e', 2);
        if (id.includes('food')) { rect(c, 10, 10, 4, 3, '#dbad70'); rect(c, 18, 12, 4, 3, '#dbad70'); }
    });
    register('metal_scrap glass_shard obsidian_shard rare_material meteoric_iron mystic_crystal', (c, id) => {
        const color = {glass_shard:'#a8e5df', obsidian_shard:'#625080', rare_material:'#e2bf69', meteoric_iron:'#7f98af', mystic_crystal:'#9f79f1'}[id] || '#9aaca9';
        shape(c, 'M3 23L8 6L19 3L28 17L24 28L12 26Z', color);
        line(c, 'M8 6l8 12 3 -15M16 18l8 10M3 23l13 -5 12 -1', '#d3e2dd');
    });
    register('electronics radio_scanner black_box_1 night_vision', (c, id) => {
        shape(c, 'M5 7h23v21H5Z', id === 'black_box_1' ? '#d78332' : '#436c59');
        rect(c, 9, 10, 14, 8, '#abd4aa'); rect(c, 10, 21, 3, 3, '#e6b86c');
        line(c, 'M17 21h7M10 5V1M24 5V2M2 12h3M28 12h3', '#b7bca0');
        if (id === 'night_vision') { shape(c, 'M4 13h10v10H4ZM18 13h10v10H18Z', '#97d08b'); }
    });
    register('fuel dynamite', (c, id) => {
        shape(c, 'M7 9h18v19H7Z', id === 'fuel' ? '#bd7949' : '#b94739');
        line(c, 'M11 9V4h10v5M11 14l10 10M21 14L11 24', '#ead7a5', 2);
        if (id === 'dynamite') line(c, 'M18 4q9 -6 11 2', '#d8b47a', 2);
    });
    register('bandage', c => { shape(c, 'M4 11l7 -7 18 18 -7 7Z', '#e9dcc2'); rect(c, 12, 12, 9, 9, '#bb9b7a'); line(c, 'M15 17h3M16 15v4', '#7a6354'); });
    register('herbal_remedy hot_tea viral_serum serum', (c, id) => {
        shape(c, 'M10 4h12v5l4 5v14H6V14l4 -5Z', '#bedbd6');
        rect(c, 8, 17, 16, 9, id === 'hot_tea' ? '#b78345' : '#68b891');
        rect(c, 9, 2, 14, 4, '#8c6947'); line(c, 'M16 19v6M13 22h6', '#f8f0c8', 2);
    });
    register('bunker_key_fragment', c => { shape(c, 'M6 5h11v10h-4v4h10v5h-5v5h-6V15H6Z', '#d5b96c'); });
    register('bunker_diary pilot_diary passenger_letter scientist_notes', (c, id) => {
        shape(c, 'M6 4h21v25H6Z', id.includes('diary') ? '#8e6143' : '#eee0b8');
        line(c, 'M10 4v25M14 10h9M14 15h9M14 20h7', '#635a46');
    });
    register('military_ration', c => { shape(c, 'M5 5h23v24H5Z', '#7b8553'); line(c, 'M7 8h19M7 25h19M12 16h9M16 12v9', '#d9d8aa', 2); });
    register('cutlass meteor_blade', (c, id) => { shape(c, 'M8 25L23 4L29 2L27 11L13 27Z', id === 'cutlass' ? '#c7d6d5' : '#92c9ec'); line(c, 'M5 22l10 7M8 26l-4 4', '#cfac59', 3); });
    register('chitin_armor star_armor giant_crab_shell', (c, id) => {
        shape(c, 'M5 6l7 -3q4 7 8 0l7 3 -3 23H8Z', id === 'star_armor' ? '#879fcf' : '#b4785a');
        line(c, 'M16 11v15M8 15h16M8 21h16', '#e2c9a0', 1.5);
    });
    register('eternal_compass speed_amulet volcanic_heart', (c, id) => {
        shape(c, 'M16 2L29 16L16 30L3 16Z', '#c5a75d');
        shape(c, 'M16 6L22 23L16 19L10 23Z', id === 'volcanic_heart' ? '#f58448' : '#7bc8c0');
    });
    register('boat_chest_item', c => building(c, 'chest'));
    register('boat_sail_item', c => { line(c, 'M15 2v28M4 29h24', '#976c48', 2); shape(c, 'M17 3L29 23H17Z', '#efe6c8'); });
    register('boat_motor_item', c => { shape(c, 'M8 3h17v12H8Z', '#68868b'); line(c, 'M21 15v12h-9M6 25l12 5', '#c4d1d0', 4); });
    register('boat_spotlight_item', c => building(c, 'spotlight'));

    function building(c, id, movingParts = false) {
        const wood = '#a97b4d', metal = '#7f9896';
        if (/house|shelter/.test(id)) {
            shape(c, 'M5 14h22v15H5Z', wood); shape(c, 'M2 15L16 2L30 15Z', '#6d7852');
            rect(c, 13, 19, 7, 10, '#3b4336'); line(c, 'M7 17h5M7 22h5M22 17h3', '#e0c087');
        } else if (/fence|gate|pen|bridge|dock|workbench/.test(id)) {
            for (let x = 4; x < 30; x += 6) rect(c, x, 6, 4, 23, wood);
            rect(c, 2, 12, 28, 3, '#d3ac76'); rect(c, 2, 23, 28, 3, '#6d4b34');
            if (id === 'workbench') { rect(c, 1, 7, 30, 6, '#d3ac76'); line(c, 'M12 6l8 -4', metal, 3); }
            if (id === 'electric_fence') line(c, 'M19 1l-7 14h8l-7 16', '#e6d765', 2);
        } else if (/solar/.test(id)) {
            shape(c, 'M5 3h22l4 20H1Z', '#396a8b');
            line(c, 'M7 9h18M4 16h24M12 4l-2 18M20 4l2 18M16 23v7', '#9ec9d4');
        } else if (/wind|water_wheel/.test(id)) {
            line(c, 'M16 10v20M9 30h14', metal, 3);
            for (let i = 0; !movingParts && i < (id === 'water_wheel' ? 8 : 3); i++) {
                c.save(); c.translate(16, 12); c.rotate(i * Math.PI * 2 / (id === 'water_wheel' ? 8 : 3));
                shape(c, 'M-2 0L-3 -11L2 -10L2 0Z', '#e3d6b2'); c.restore();
            }
        } else if (/spikes|moat/.test(id)) {
            rect(c, 2, 21, 28, 8, '#67523d');
            for (let x = 3; x < 28; x += 7) shape(c, `M${x} 25l3 -20 3 20Z`, '#c0b89b');
        } else if (/garden/.test(id)) {
            rect(c, 2, 5, 28, 25, '#79543b');
            for (let x = 7; x < 30; x += 9) for (let y = 11; y < 30; y += 8) line(c, `M${x} ${y}v-5m0 3l-3 -3m3 3l3 -3`, '#99bd61', 2);
        } else if (/radio/.test(id)) {
            line(c, 'M4 30L16 2L28 30M9 20h14M12 12h8M9 20l14 10M23 20L9 30', metal, 2);
            rect(c, 14, 1, 4, 4, '#e59165');
        } else if (/campfire|flame/.test(id)) {
            line(c, 'M4 28l24 -7M4 21l24 7', wood, 4);
            shape(c, 'M8 23Q2 15 14 4L16 14L23 8Q32 23 19 25Z', '#e99c45');
            shape(c, 'M13 24Q9 19 17 14Q24 23 19 25Z', '#f5da82');
        } else if (/light|turret/.test(id)) {
            line(c, 'M16 16v11M7 30l9 -5 9 5', metal, 4);
            shape(c, 'M6 5h20v13H6Z', '#657c78'); rect(c, 9, 8, 14, 7, id.includes('light') ? '#f4d786' : '#303e3d');
            if (id.includes('turret')) rect(c, 23, 9, 8, 4, '#c4cebf');
        } else if (/battery/.test(id)) {
            rect(c, 5, 7, 23, 22, '#566b60'); rect(c, 8, 3, 5, 4, '#d2bc7d'); rect(c, 21, 3, 5, 4, '#d2bc7d');
            line(c, 'M18 10l-6 9h7l-5 7', '#eddb80', 2);
        } else if (/feeder|waterer/.test(id)) {
            shape(c, 'M3 12h26l-4 16H7Z', wood);
            shape(c, 'M5 13h22l-3 6H8Z', id === 'waterer' ? '#74c3d3' : '#d9bc74');
        } else if (/collector|diving/.test(id)) {
            shape(c, 'M9 8Q16 -3 23 8L28 28H4Z', '#86b2b2');
            shape(c, 'M12 14h9v9h-9Z', '#38677a'); line(c, 'M5 28h22', '#d8c085', 3);
        } else { // Chest: iron bands and visible timber grain.
            shape(c, 'M3 10Q16 0 29 10V28H3Z', wood);
            rect(c, 7, 8, 3, 20, '#b7b9a0'); rect(c, 23, 8, 3, 20, '#b7b9a0');
            line(c, 'M3 17h26M11 23h11', '#694a31'); rect(c, 14, 14, 5, 7, '#ebcb7d');
        }
    }
    function sprite(key, draw) {
        if (!cache.has(key)) {
            const canvas = document.createElement('canvas'); canvas.width = canvas.height = 96;
            const c = canvas.getContext('2d'); c.scale(3, 3); draw(c); cache.set(key, canvas);
        }
        return cache.get(key);
    }
    window.GameTextures = {
        ready,
        get time() { return animationTime; },
        advance(dt) { if (Number.isFinite(dt) && dt > 0) animationTime += Math.min(dt, 0.1); },
        resetAnimation() { animationTime = 0; animalMotion = new WeakMap(); playerMotion = new WeakMap(); planeFlights = new WeakMap(); },
        observeAnimal(animal) {
            let motion = animalMotion.get(animal);
            if (!motion) { motion = { x:animal.x, y:animal.y, phase:0, moving:false, facing:animal.direction === 1 ? -1 : 1 }; animalMotion.set(animal, motion); }
            const dx = animal.x - motion.x, dy = animal.y - motion.y;
            const distance = Math.hypot(dx, dy);
            motion.moving = distance > 0.01 && distance < 60;
            if (motion.moving) {
                motion.phase = (motion.phase + distance / (animal.species === 'turtle' ? 18 : 34) * Math.PI * 2) % (Math.PI * 2);
                if (Math.abs(dx) > 0.01) motion.facing = dx < 0 ? -1 : 1;
            }
            motion.x = animal.x; motion.y = animal.y;
        },
        drawAnimal(ctx, animal, camera, companion = false) {
            const spec = animalRows[companion ? 'companion' : animal.species];
            if (!spec || !atlases[spec[0]] || !atlases[spec[0]].complete || !atlases[spec[0]].naturalWidth) return false;
            const image = atlases[spec[0]], sw = image.naturalWidth / 4, sh = image.naturalHeight / 4;
            const motion = animalMotion.get(animal);
            const moving = motion?.moving || false;
            const phase = motion?.phase || 0;
            const sleep = animal.state === 'sleep' || animal.state === 'rest' || animal.state === 'resting' || (companion && animal.command === 'rest');
            const eating = animal.state === 'eat' || animal.state === 'eating';
            const t = animationTime, seed = phaseAt(animal.x, animal.y);
            // Resting parrots fold their wings; flying parrots use all four frames.
            const frame = moving ? Math.floor(phase / (Math.PI * 2) * 4) % 4 : animal.species === 'parrot' ? 3 : 1;
            const scale = companion ? animal.size : 1;
            const w = spec[2] * scale, h = spec[3] * scale;
            const pos = camera.worldToScreen(animal.x, animal.y);
            const hop = moving ? Math.abs(Math.sin(phase)) * (animal.species === 'rabbit' ? 5 : animal.species === 'parrot' ? 3 : 1.4) : 0;
            const breath = Math.sin(t * (sleep ? 1.5 : 2.7) + seed) * (sleep ? 0.018 : 0.009);
            ctx.save();
            ctx.fillStyle = 'rgba(20,35,25,0.24)'; ctx.beginPath();
            ctx.ellipse(pos.x, pos.y + 9, w * (0.31 - hop * 0.008), h * 0.13, 0, 0, Math.PI * 2); ctx.fill();
            ctx.translate(pos.x, pos.y + 10 - hop);
            ctx.scale(motion?.facing || (animal.direction === 1 ? -1 : 1), 1);
            if (sleep) ctx.scale(1.06, 0.83);
            if (eating) ctx.rotate(Math.sin(t * 5 + seed) * 0.07 + 0.08);
            ctx.scale(1 - breath * 0.3, 1 + breath);
            ctx.drawImage(image, frame * sw + 1, spec[1] * sh + 1, sw - 2, sh - 2, -w / 2, -h, w, h);
            ctx.restore();
            if (sleep) {
                ctx.save(); ctx.fillStyle = '#f5f1d5'; ctx.font = '11px sans-serif';
                ctx.globalAlpha = 0.5 + Math.sin(t * 1.5 + seed) * 0.25;
                ctx.fillText('z', pos.x + w * 0.25, pos.y - h + Math.sin(t * 1.5) * 2); ctx.restore();
            }
            return true;
        },
        observePlayer(player) {
            let motion = playerMotion.get(player);
            if (!motion) { motion = { x:player.x, y:player.y, health:player.health, phase:0, moving:false, actionAt:-10, action:'swing', hurtAt:-10 }; playerMotion.set(player, motion); }
            const distance = Math.hypot(player.x - motion.x, player.y - motion.y);
            motion.moving = distance > 0.01 && distance < 60 && !player.inBoat;
            if (motion.moving) motion.phase = (motion.phase + distance / 36 * Math.PI * 2) % (Math.PI * 2);
            if (player.health < motion.health - 0.05) motion.hurtAt = animationTime;
            motion.health = player.health; motion.x = player.x; motion.y = player.y;
        },
        playerAction(player, action = 'swing') {
            if (!playerMotion.has(player)) this.observePlayer(player);
            const motion = playerMotion.get(player); motion.actionAt = animationTime; motion.action = action;
        },
        drawPlayer(ctx, player, camera) {
            const image = atlases.player;
            if (!image || !image.complete || !image.naturalWidth) return false;
            const motion = playerMotion.get(player);
            const phase = motion?.phase || 0, t = animationTime;
            const actionAge = t - (motion?.actionAt ?? -10), hurtAge = t - (motion?.hurtAt ?? -10);
            const attacking = actionAge >= 0 && actionAge < 0.34;
            const shoot = motion?.action === 'shoot';
            const swing = attacking ? Math.sin(actionAge / 0.34 * Math.PI) : 0;
            const frame = motion?.moving ? Math.floor(phase / (Math.PI * 2) * 4) % 4 : 1;
            const sw = image.naturalWidth / 4, sh = image.naturalHeight / 4;
            const row = Math.max(0, Math.min(3, player.direction || 0));
            const pos = camera.worldToScreen(player.x, player.y);
            const breath = Math.sin(t * 2.5) * 0.007;
            const bob = motion?.moving ? Math.abs(Math.sin(phase)) * 1.5 : 0;
            const facingX = row === 1 ? -1 : row === 2 ? 1 : 0;
            ctx.save();
            ctx.fillStyle = 'rgba(20,35,25,0.28)'; ctx.beginPath(); ctx.ellipse(pos.x, pos.y + 10, 11, 4, 0, 0, Math.PI * 2); ctx.fill();
            ctx.translate(pos.x + (shoot ? -facingX * swing * 1.7 : facingX * swing * 2), pos.y + 11 - bob);
            if (hurtAge >= 0 && hurtAge < 0.3) ctx.translate(Math.sin(hurtAge * 55) * (1 - hurtAge / 0.3) * 2, 0);
            const tool = () => {
                if (!player.equippedTool || !window.drawItemIcon) return;
                ctx.save(); ctx.translate(row === 1 ? -11 : 11, -17);
                ctx.rotate(row === 1 ? -0.3 + swing * 1.1 : 0.3 - swing * 1.1);
                if (row === 1) ctx.scale(-1,1);
                window.drawItemIcon(ctx, player.equippedTool, -11, -15, 24);
                ctx.restore();
            };
            if (row === 3) tool();
            ctx.save();
            ctx.scale(1, 1 + breath);
            if (attacking && !shoot) ctx.rotate(facingX * swing * 0.045);
            ctx.drawImage(image, frame * sw + 1, row * sh + 1, sw - 2, sh - 2, -25, -56, 50, 56);
            ctx.restore();
            if (row !== 3) tool();
            if (attacking && !shoot) {
                ctx.strokeStyle = 'rgba(246,237,196,0.5)'; ctx.lineWidth = 1.5;
                const angle = [Math.PI / 2, Math.PI, 0, -Math.PI / 2][row];
                ctx.beginPath(); ctx.arc(0, -18, 23, angle - 0.8 + swing * 0.5, angle + 0.5 + swing * 0.5); ctx.stroke();
            }
            if (attacking && shoot && actionAge < 0.07) {
                const dx = [0,-1,1,0][row], dy = [1,0,0,-1][row];
                ctx.fillStyle = '#ffdc83'; ctx.beginPath();
                ctx.ellipse(dx * 24, -18 + dy * 15, 4, 2.5, row < 2 ? 0.5 : -0.5, 0, Math.PI * 2); ctx.fill();
            }
            ctx.restore(); return true;
        },
        drawPassenger(ctx, x, y) {
            const image = atlases.player;
            if (!image || !image.complete || !image.naturalWidth) return false;
            const sw = image.naturalWidth / 4, sh = image.naturalHeight / 4;
            ctx.drawImage(image, sw + 1, 1, sw - 2, sh * 0.65, x - 9, y - 22, 18, 22);
            return true;
        },
        beginPlaneCrash(site) { planeFlights.set(site, animationTime); },
        isPlaneAirborne(site) { const start = planeFlights.get(site); return !!atlases.aircraft && atlases.aircraft.complete && atlases.aircraft.naturalWidth && start !== undefined && animationTime - start < 3.2; },
        drawPlane(ctx, site, camera) {
            const image = atlases.aircraft;
            if (!image || !image.complete || !image.naturalWidth) return false;
            const start = planeFlights.get(site);
            const age = start === undefined ? 100 : animationTime - start;
            const flight = age < 3.2;
            const progress = Math.max(0, Math.min(1, age / 3.2));
            const wx = flight ? site.x - 650 * (1 - progress) : site.x;
            const wy = flight ? site.y - 310 * (1 - progress) - Math.sin(progress * Math.PI) * 45 : site.y;
            if (!camera.isVisible(wx, wy, 180)) return true;
            const pos = camera.worldToScreen(wx, wy);
            const sw = image.naturalWidth / 2, sh = image.naturalHeight / 2;
            const cell = flight ? (progress > 0.7 ? 3 : 0) : site.salvageHealth <= 0 ? 2 : 1;
            const w = flight ? 150 : 136, h = flight ? 100 : 96;
            ctx.save();
            ctx.fillStyle = 'rgba(22,35,27,0.22)'; ctx.beginPath();
            ctx.ellipse(pos.x + 8, pos.y + (flight ? 38 * (1 - progress) + 12 : 19), w * 0.36, 9, 0.18, 0, Math.PI * 2); ctx.fill();
            ctx.translate(pos.x, pos.y);
            if (flight) ctx.rotate(0.15 + Math.sin(animationTime * 7) * 0.025 + progress * 0.12);
            ctx.drawImage(image, cell % 2 * sw + 1, Math.floor(cell / 2) * sh + 1, sw - 2, sh - 2, -w / 2, -h / 2, w, h);
            if (flight) {
                ctx.strokeStyle = 'rgba(220,238,230,0.48)'; ctx.lineWidth = 1;
                for (const [ex,ey] of [[17,-15],[-4,20]]) {
                    ctx.save(); ctx.translate(ex,ey); ctx.rotate(animationTime * 42); ctx.beginPath();
                    ctx.ellipse(0,0,2,10,0,0,Math.PI * 2); ctx.stroke(); ctx.restore();
                }
            }
            ctx.restore();
            if (!flight && age < 4) {
                const impact = Math.max(0, (age - 3.2) / 0.8);
                ctx.save(); ctx.globalAlpha = (1 - impact) * 0.4; ctx.strokeStyle = '#e7cf9f'; ctx.lineWidth = 5 * (1 - impact) + 1;
                ctx.beginPath(); ctx.ellipse(pos.x, pos.y + 15, 20 + impact * 60, 8 + impact * 22, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
            }
            if ((flight && progress > 0.65) || (!flight && !site.looted)) {
                ctx.save();
                for (let i = 0; i < 7; i++) {
                    const rise = (animationTime * 0.4 + i / 7) % 1;
                    ctx.globalAlpha = (1 - rise) * 0.36; ctx.fillStyle = '#444b47';
                    ctx.beginPath(); ctx.arc(pos.x - 16 - rise * 16 + Math.sin(animationTime * 1.5 + i) * 5, pos.y - 15 - rise * 75, 5 + rise * 14, 0, Math.PI * 2); ctx.fill();
                }
                ctx.restore();
                if (!flight) {
                    ctx.save(); ctx.translate(pos.x - 20,pos.y + 9);
                    const flicker = Math.sin(animationTime * 12 + site.x) * 2;
                    ctx.fillStyle = '#ed913f'; ctx.beginPath(); ctx.moveTo(-5,0);
                    ctx.quadraticCurveTo(-8,-8,2 + flicker,-21); ctx.quadraticCurveTo(0,-9,5,-12);
                    ctx.quadraticCurveTo(12,-3,5,1); ctx.closePath(); ctx.fill();
                    ctx.fillStyle = '#ffe49d'; ctx.beginPath(); ctx.ellipse(1,-5,3,7 + flicker * 0.4,0,0,Math.PI * 2); ctx.fill(); ctx.restore();
                    fireEffects(ctx, pos.x - 20, pos.y + 8, 25, 28, phaseAt(site.x,site.y));
                }
            }
            return true;
        },
        waterSurface(ctx, type, x, y, size, tileX, tileY, edges) {
            const t = animationTime, worldX = tileX * size, worldY = tileY * size;
            const wave = Math.sin(t * 1.8 - worldX * 0.026 - worldY * 0.017);
            ctx.save(); ctx.strokeStyle = '#d5f9ed'; ctx.lineWidth = 0.7;
            ctx.globalAlpha = (type === 0 ? 0.12 : 0.19) + wave * 0.055;
            ctx.beginPath(); ctx.moveTo(x + 3, y + size * 0.5 + wave * 3);
            ctx.quadraticCurveTo(x + size * 0.5, y + size * 0.4 + wave * 2, x + size - 3, y + size * 0.5 - wave * 2); ctx.stroke();
            const wash = (Math.sin(t * 1.25) + 1) / 2;
            const inset = 1 + wash * 5;
            ctx.globalAlpha = 0.18 + wash * 0.4; ctx.strokeStyle = '#f3fff1'; ctx.lineWidth = 1 + wash * 1.2;
            for (let edge = 0; edge < 4; edge++) {
                if (!edges[edge]) continue;
                ctx.beginPath();
                for (let i = 0; i <= 8; i++) {
                    const along = i / 8 * size;
                    const ripple = Math.sin((edge < 2 ? worldY : worldX) * 0.11 + along * 0.11 - t * 2) * 0.8;
                    const across = inset + ripple;
                    const px = edge === 0 ? across : edge === 1 ? size - across : along;
                    const py = edge === 2 ? across : edge === 3 ? size - across : along;
                    if (i === 0) ctx.moveTo(x + px,y + py); else ctx.lineTo(x + px,y + py);
                }
                ctx.stroke();
            }
            ctx.restore();
        },
        drawWake(ctx, x, y, heading, moving) {
            const t = animationTime;
            ctx.save(); ctx.translate(x,y); ctx.rotate(heading);
            ctx.strokeStyle = '#ddfff1'; ctx.lineWidth = 1.2;
            if (moving) {
                for (let i = 0; i < 4; i++) {
                    const age = (t * 1.8 + i / 4) % 1;
                    ctx.globalAlpha = (1 - age) * 0.35;
                    ctx.beginPath(); ctx.moveTo(-22 - age * 42, -12 - age * 9);
                    ctx.quadraticCurveTo(-18 - age * 32, 0, -22 - age * 42, 12 + age * 9); ctx.stroke();
                }
            } else {
                const age = t * 0.5 % 1;
                ctx.globalAlpha = (1 - age) * 0.13; ctx.beginPath(); ctx.ellipse(0, 7, 28 + age * 8, 9 + age * 4, 0, 0, Math.PI * 2); ctx.stroke();
            }
            ctx.restore();
        },
        drawResource(ctx, r, x, y) {
            const cell = resourceCells[r.depleted ? 'stump' : r.type];
            if (atlases.resources && atlases.resources.complete && atlases.resources.naturalWidth && cell !== undefined) {
                const tree = r.type === 'tree' || r.type.includes('palm');
                const w = r.depleted ? 28 : tree ? 72 : r.type === 'rock_node' ? 40 : 38;
                const h = r.depleted ? 24 : tree ? 82 : 40;
                ctx.save(); ctx.fillStyle = 'rgba(20,40,24,0.18)';
                ctx.beginPath(); ctx.ellipse(x, y + 6, w * 0.3, 6, 0, 0, Math.PI * 2); ctx.fill();
                const living = !r.depleted && !r.withered && ['tree', 'palm', 'coconut_palm', 'bush', 'berry_bush', 'fiber_plant'].includes(r.type);
                if (living) drawWindSprite(ctx, 'resources', cell, x, y + 10, w, h, windAt(r.x, r.y) * (tree ? 2.5 : 1.2));
                else atlasSprite(ctx, 'resources', cell, x - w / 2, y + 10 - h, w, h);
                ctx.restore();
                return true;
            }
            const known = ['tree', 'palm', 'coconut_palm', 'bush', 'berry_bush', 'rock_node', 'branch_pile', 'fiber_plant', 'mushroom_spot'];
            if (!known.includes(r.type)) return false;
            const image = sprite('resource:' + r.type, c => {
                if (r.type === 'tree' || r.type.includes('palm')) {
                    shape(c, 'M14 31L15 11h3l2 20Z', '#8b6544');
                    line(c, 'M16 23h3M16 27h3M16 18h2', '#c39c6b', 0.7);
                    if (r.type === 'tree') {
                        for (let i = 0; i < 16; i++) {
                            const a = i * 2.4, radius = 3 + i % 3 * 2;
                            c.fillStyle = ['#355b3c', '#4d7949', '#699451', '#89a75f'][i % 4];
                            c.beginPath(); c.arc(16 + Math.cos(a) * radius, 11 + Math.sin(a) * radius, 5.5, 0, Math.PI * 2); c.fill();
                        }
                    } else {
                        for (let i = 0; i < 7; i++) {
                            c.save(); c.translate(16, 10); c.rotate(i * Math.PI * 2 / 7);
                            shape(c, 'M0 0Q-7 -8 0 -10Q7 -8 0 0Z', i % 2 ? '#5c975c' : '#3c7952');
                            line(c, 'M0 0V-9', '#92b969', 0.7); c.restore();
                        }
                        if (r.type === 'coconut_palm') { rect(c, 12, 11, 4, 4, '#9b774e'); rect(c, 17, 12, 4, 4, '#765135'); }
                    }
                } else if (r.type === 'rock_node') {
                    shape(c, 'M3 25L6 12L19 8L29 20L25 29H8Z', '#929e99');
                    shape(c, 'M6 12L19 8L16 21L3 25Z', '#b5beb1');
                    line(c, 'M16 21l9 8M16 21l13 -1', '#687b77', 1);
                } else if (r.type === 'branch_pile') {
                    line(c, 'M4 25L27 12M6 10L26 27M10 28L23 8', '#6f5237', 3);
                    line(c, 'M5 24L26 11M7 9l18 17', '#bd9b67', 0.8);
                } else if (r.type === 'mushroom_spot') {
                    c.translate(3, 5); c.scale(0.8, 0.8); art.mushroom(c);
                } else {
                    for (let i = 0; i < 9; i++) {
                        const px = 6 + (i * 7) % 21, py = 12 + (i * 11) % 15;
                        shape(c, `M16 30Q${px - 7} ${py - 10} ${px} ${py - 5}Q${px + 8} ${py} 16 30Z`, ['#406f45', '#5f8d50', '#85a85b'][i % 3]);
                    }
                    if (r.type === 'berry_bush') for (let i = 0; i < 5; i++) { c.fillStyle = '#cf7964'; c.beginPath(); c.arc(8 + i * 4, 18 + i % 2 * 5, 1.7, 0, Math.PI * 2); c.fill(); }
                }
            });
            ctx.save(); ctx.fillStyle = 'rgba(23,45,33,0.22)'; ctx.beginPath(); ctx.ellipse(x, y + 8, 15, 5, 0, 0, Math.PI * 2); ctx.fill();
            ctx.drawImage(image, x - 22, y - 34, 44, 44); ctx.restore();
            return true;
        },
        drawItem(ctx, id, x, y, size) {
            const item = window.ITEM_DB[id];
            if (!item) return false;
            if (item.placeable && atlasSprite(ctx, 'buildings', buildingCells[item.placeable], x, y, size, size)) return true;
            const resourceItemCells = { mushroom:5, berry:4, palm_seed:1, fiber:7, branch:6 };
            if (atlasSprite(ctx, 'resources', resourceItemCells[id], x, y, size, size)) return true;
            if (!art[id] && !item.placeable) return false;
            const image = sprite('item:' + id, c => item.placeable ? building(c, item.placeable) : art[id](c, id));
            ctx.drawImage(image, x, y, size, size); return true;
        },
        drawBuilding(ctx, id, x, y, w, h, state = {}) {
            const t = animationTime, seed = phaseAt(state.x ?? x, state.y ?? y);
            const isFire = id === 'campfire' || (id === 'flame_trap' && state.active);
            ctx.save();
            if (isFire) {
                // Only the upper flame bends; the stone ring stays still.
                if (id === 'campfire' && atlases.buildings && atlases.buildings.complete && atlases.buildings.naturalWidth) {
                    drawWindSprite(ctx, 'buildings', buildingCells[id], x, y + h / 2, w, h, Math.sin(t * 11 + seed) * 1.8);
                } else {
                    const image = sprite('world-building:' + id, c => building(c, id, true));
                    ctx.drawImage(image, x - w / 2, y - h / 2, w, h);
                }
                fireEffects(ctx, x, y, w, h, seed);
            } else {
                const flexible = id === 'shelter' || id === 'garden';
                if (flexible && atlases.buildings && atlases.buildings.complete && atlases.buildings.naturalWidth) drawWindSprite(ctx, 'buildings', buildingCells[id], x, y + h / 2, w, h, windAt(state.x ?? x, state.y ?? y) * 0.7);
                else if (!atlasSprite(ctx, 'buildings', buildingCells[id], x - w / 2, y - h / 2, w, h)) {
                    const image = sprite('world-building:' + id, c => building(c, id, true));
                    ctx.drawImage(image, x - w / 2, y - h / 2, w, h);
                }
            }
            if (id === 'solar_panel' && !window.game?.timeSystem?.isNight()) {
                const shine = Math.pow(Math.max(0, Math.sin(t * 0.65 + seed)), 12);
                ctx.globalAlpha = shine * 0.3; ctx.strokeStyle = '#e4fcff'; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.moveTo(x - w * 0.2, y - h * 0.25); ctx.lineTo(x + w * 0.25, y - h * 0.1); ctx.stroke();
            }
            if (id === 'wooden_house' && window.game?.timeSystem?.isNight()) {
                ctx.globalAlpha = 0.4 + Math.sin(t * 2.3 + seed) * 0.06; ctx.fillStyle = '#ffd77a';
                ctx.fillRect(x - w * 0.27, y - h * 0.04, w * 0.075, h * 0.11);
            }
            if (id === 'rain_collector' && window.game?.weatherSystem?.isRaining()) {
                for (let i = 0; i < 3; i++) {
                    const fall = (t * 1.5 + i / 3) % 1;
                    ctx.globalAlpha = 1 - fall; ctx.fillStyle = '#b5e3ef';
                    ctx.fillRect(x + Math.sin(i * 3) * w * 0.2, y - h * 0.45 + fall * h * 0.2, 1, 3);
                }
            }
            if (id === 'wind_turbine' || id === 'water_wheel') {
                ctx.globalAlpha = 1; ctx.translate(x, y - h * 0.12);
                ctx.rotate(t * (id === 'wind_turbine' ? 1.2 + (window.game?.weatherSystem?.windSpeed || 0) * 3 : 0.7));
                const blades = id === 'wind_turbine' ? 3 : 8;
                for (let i = 0; i < blades; i++) { ctx.rotate(Math.PI * 2 / blades); rect(ctx, -2, -h * 0.32, 4, h * 0.32, '#e5d9b7'); }
            }
            ctx.restore();
        },
        terrain(ctx, type, x, y, size, variant, tileX = 0, tileY = 0) {
            if (atlases.terrain && atlases.terrain.complete && atlases.terrain.naturalWidth && type >= 0 && type <= 5) {
                const patch = terrainPatch(type);
                if (patch) {
                    const sx = ((tileX % 8) + 8) % 8 * 32;
                    const sy = ((tileY % 8) + 8) % 8 * 32;
                    if (type < 2) drawWaterPatch(ctx, patch, sx + animationTime * (type === 0 ? 3 : 1.8), sy + animationTime * 1.3, x, y, size);
                    else ctx.drawImage(patch, sx, sy, 32, 32, x, y, size + 0.5, size + 0.5);
                    return;
                }
            }
            const key = `terrain:${type}:${variant}`;
            const image = sprite(key, c => {
                const colors = ['#176c86', '#57b6c7', '#e4cc8f', '#719956', '#3d7148', '#92958c'];
                rect(c, 0, 0, 32, 32, colors[type] || colors[0]);
                let seed = 937 + type * 123 + variant * 719;
                const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
                for (let i = 0; i < 34; i++) {
                    const px = random() * 32, py = random() * 32;
                    c.globalAlpha = 0.06 + random() * 0.12;
                    if (type < 2) line(c, `M${px} ${py}h${3 + random() * 7}`, '#d9f7ed', 0.6);
                    else if (type === 3 || type === 4) line(c, `M${px} ${py}l-1 -3m1 3l2 -2`, i % 2 ? '#d6dea0' : '#193d2f', 0.7);
                    else rect(c, px, py, 0.6 + random() * 2, 0.7, i % 2 ? '#fff0c8' : '#4c5444');
                }
                c.globalAlpha = 1;
            });
            ctx.drawImage(image, x, y, size + 0.5, size + 0.5);
        }
    };
})();
