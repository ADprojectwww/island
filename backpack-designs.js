// ============================================================
// backpack-designs.js
// 5 УНІКАЛЬНИХ ДИЗАЙНІВ РЮКЗАКА:
// 1. Woven Basket (Плетений кошик виживальника)
// 2. Leather Explorer (Шкіряний рюкзак мандрівника зі спальником)
// 3. Military Tactical (Військовий тактичний рюкзак хакі зі стропами MOLLE та шевроном)
// 4. Diver's Oxygen Pack (Неопреновий гідромішок із кисневим балоном та шлангом)
// 5. Void Shaman Pack (Містичний рюкзак Аномалії з сяючими рунами та Кристалом Пустоти)
// ============================================================

(function() {
    'use strict';

    // ─── 1. НОВІ РЮКЗАКИ В ITEM_DB ТА RECIPE_DB ─────────────────
    if (window.ITEM_DB) {
        const backpacks = {
            'basket': {
                id: 'basket',
                name: 'Плетений кошик',
                icon: 'basket',
                category: 'backpack',
                backpackType: 'basket',
                slots: 25,
                maxStack: 1,
                description: 'Легкий солом\'яний кошик із мотузковими лямками (25 слотів)'
            },
            'leather_backpack': {
                id: 'leather_backpack',
                name: 'Шкіряний рюкзак',
                icon: 'leather_backpack',
                category: 'backpack',
                backpackType: 'leather_backpack',
                slots: 40,
                maxStack: 1,
                description: 'Міцний рюкзак із вичиненої шкіри з кишенями та спальником (40 слотів)'
            },
            'military_backpack': {
                id: 'military_backpack',
                name: 'Тактичний рюкзак',
                icon: 'military_backpack',
                category: 'backpack',
                backpackType: 'military_backpack',
                slots: 50,
                maxStack: 1,
                description: 'Армійський рюкзак зі стропами MOLLE та шевроном (50 слотів)'
            },
            'diver_backpack': {
                id: 'diver_backpack',
                name: 'Водолазний акваланг',
                icon: 'diver_backpack',
                category: 'backpack',
                backpackType: 'diver_backpack',
                slots: 45,
                maxStack: 1,
                description: 'Неопреновий гідромішок із кисневим балоном (+90с кисню під водою, 45 слотів)'
            },
            'void_backpack': {
                id: 'void_backpack',
                name: 'Рюкзак Аномалії',
                icon: 'void_backpack',
                category: 'backpack',
                backpackType: 'void_backpack',
                slots: 50,
                maxStack: 1,
                description: 'Містичний ранець із Кристалом Пустоти. Відновлює психіку та світиться вночі (50 слотів)'
            }
        };
        Object.assign(window.ITEM_DB, backpacks);
    }

    if (window.RECIPE_DB) {
        const bpRecipes = {
            'diver_backpack': {
                id: 'diver_backpack',
                name: 'Водолазний акваланг',
                result: { id: 'diver_backpack', count: 1 },
                materials: [{ id: 'metal_scrap', count: 6 }, { id: 'fiber', count: 8 }, { id: 'glass_shard', count: 2 }, { id: 'leather_backpack', count: 1 }],
                requires: 'workbench'
            },
            'void_backpack': {
                id: 'void_backpack',
                name: 'Рюкзак Аномалії',
                result: { id: 'void_backpack', count: 1 },
                materials: [{ id: 'void_crystal', count: 2 }, { id: 'rope', count: 4 }, { id: 'fiber', count: 10 }, { id: 'military_backpack', count: 1 }],
                requires: 'workbench'
            }
        };
        Object.assign(window.RECIPE_DB, bpRecipes);
    }

    // ─── 2. МАЛЮВАННЯ ДЕТАЛЬНИХ ІКОНОК РЮКЗАКІВ (drawItemIcon) ───
    window.drawBackpackIcon = function(ctx, type, cx, cy, size) {
        ctx.save();
        const s = size / 48;
        ctx.translate(cx, cy);
        ctx.scale(s, s);

        if (type === 'basket') {
            // 1. Плетений кошик
            ctx.fillStyle = '#C29B38';
            ctx.beginPath();
            ctx.roundRect(-14, -12, 28, 26, 5);
            ctx.fill();
            ctx.strokeStyle = '#8C6D23';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Візерунок лози
            ctx.strokeStyle = '#A17D24';
            ctx.lineWidth = 1;
            for (let x = -10; x <= 10; x += 5) {
                ctx.beginPath(); ctx.moveTo(x, -12); ctx.lineTo(x, 14); ctx.stroke();
            }
            for (let y = -8; y <= 10; y += 5) {
                ctx.beginPath(); ctx.moveTo(-14, y); ctx.lineTo(14, y); ctx.stroke();
            }

            // Шкіряна кришка
            ctx.fillStyle = '#854D0E';
            ctx.fillRect(-15, -14, 30, 5);
            // Ручка
            ctx.strokeStyle = '#78350F';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, -14, 8, Math.PI, 0);
            ctx.stroke();

            // Карта, що стирчить
            ctx.fillStyle = '#FEF3C7';
            ctx.fillRect(4, -18, 6, 8);
            ctx.fillStyle = '#DC2626';
            ctx.fillRect(4, -15, 6, 2);

        } else if (type === 'leather_backpack') {
            // 2. Шкіряний рюкзак мандрівника
            ctx.fillStyle = '#78350F';
            ctx.beginPath();
            ctx.roundRect(-15, -10, 30, 26, 6);
            ctx.fill();
            ctx.strokeStyle = '#451A03';
            ctx.lineWidth = 1.8;
            ctx.stroke();

            // Дві бічні кишені
            ctx.fillStyle = '#92400E';
            ctx.fillRect(-13, 0, 11, 12);
            ctx.fillRect(2, 0, 11, 12);
            ctx.strokeRect(-13, 0, 11, 12);
            ctx.strokeRect(2, 0, 11, 12);

            // Згорнутий спальник зверху
            ctx.fillStyle = '#E2E8F0';
            ctx.beginPath();
            ctx.roundRect(-16, -17, 32, 8, 3);
            ctx.fill();
            ctx.strokeStyle = '#64748B';
            ctx.stroke();
            // Ремінці спальника
            ctx.fillStyle = '#B45309';
            ctx.fillRect(-10, -17, 3, 8);
            ctx.fillRect(7, -17, 3, 8);

            // Золотаві латунні пряжки
            ctx.fillStyle = '#F59E0B';
            ctx.fillRect(-9, 4, 3, 4);
            ctx.fillRect(6, 4, 3, 4);

        } else if (type === 'military_backpack') {
            // 3. Військовий тактичний рюкзак
            ctx.fillStyle = '#365314';
            ctx.beginPath();
            ctx.roundRect(-15, -14, 30, 30, 4);
            ctx.fill();
            ctx.strokeStyle = '#1A2E05';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Плями камуфляжу
            ctx.fillStyle = '#1E3A8A'; // темні плями
            ctx.fillStyle = '#14532D';
            ctx.beginPath(); ctx.ellipse(-6, -6, 5, 3, 0.4, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.ellipse(6, 4, 6, 4, -0.3, 0, Math.PI*2); ctx.fill();

            // Стропи MOLLE
            ctx.strokeStyle = '#111827';
            ctx.lineWidth = 1.2;
            for (let y = -4; y <= 10; y += 4) {
                ctx.beginPath(); ctx.moveTo(-11, y); ctx.lineTo(11, y); ctx.stroke();
            }

            // Патч-шевронець (синьо-жовтий)
            ctx.fillStyle = '#2563EB'; ctx.fillRect(-4, -11, 8, 3);
            ctx.fillStyle = '#EAB308'; ctx.fillRect(-4, -8, 8, 3);

            // Антена рації
            ctx.strokeStyle = '#0F172A';
            ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(11, -12); ctx.lineTo(15, -22); ctx.stroke();
            ctx.fillStyle = '#EF4444';
            ctx.beginPath(); ctx.arc(15, -22, 1.5, 0, Math.PI*2); ctx.fill();

        } else if (type === 'diver_backpack') {
            // 4. Водолазний акваланг
            ctx.fillStyle = '#EAB308';
            ctx.beginPath();
            ctx.roundRect(-14, -10, 28, 25, 6);
            ctx.fill();
            ctx.strokeStyle = '#1E293B';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Металевий кисневий балон
            ctx.fillStyle = '#CBD5E1';
            ctx.beginPath();
            ctx.roundRect(-5, -17, 10, 28, 4);
            ctx.fill();
            ctx.strokeStyle = '#475569';
            ctx.lineWidth = 1.2;
            ctx.stroke();

            // Блік на балоні
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(-3, -15, 2, 24);

            // Вентиль і манометр
            ctx.fillStyle = '#0284C7';
            ctx.beginPath(); ctx.arc(0, -18, 3, 0, Math.PI*2); ctx.fill();
            // Шланг
            ctx.strokeStyle = '#0F172A';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(3, -18);
            ctx.quadraticCurveTo(14, -14, 10, 5);
            ctx.stroke();

        } else if (type === 'void_backpack') {
            // 5. Рюкзак Аномалії (Void Shaman)
            ctx.fillStyle = '#2E1065';
            ctx.beginPath();
            ctx.roundRect(-15, -12, 30, 27, 6);
            ctx.fill();
            ctx.strokeStyle = '#7C3AED';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Пульсуюче свічення
            const glow = (Math.sin(Date.now() / 250) + 1) / 2;
            ctx.strokeStyle = `rgba(192, 132, 252, ${0.4 + glow * 0.5})`;
            ctx.lineWidth = 1.5;
            // Рунічні знаки
            ctx.beginPath();
            ctx.moveTo(-9, -4); ctx.lineTo(-4, 4); ctx.lineTo(-9, 10);
            ctx.moveTo(9, -4); ctx.lineTo(4, 4); ctx.lineTo(9, 10);
            ctx.stroke();

            // Центральний Кристал Пустоти
            ctx.fillStyle = '#E879F9';
            ctx.beginPath();
            ctx.moveTo(0, -6);
            ctx.lineTo(6, 2);
            ctx.lineTo(0, 10);
            ctx.lineTo(-6, 2);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Магічні іскри
            ctx.fillStyle = '#C084FC';
            ctx.beginPath();
            ctx.arc(-8, -14 + glow * 2, 1.5, 0, Math.PI*2);
            ctx.arc(7, -15 - glow * 2, 1.5, 0, Math.PI*2);
            ctx.fill();
        }

        ctx.restore();
    };

    // ─── 3. МАЛЮВАННЯ РЮКЗАКА НА ПЕРСОНАЖІ (In-Game Canvas) ──────
    window.drawBackpackOnPlayer = function(ctx, type, row, frame, breath, facingX) {
        if (!type || type === 'none') return;

        ctx.save();

        if (row === 3) {
            // ── ПОЗИЦІЯ: СПИНА ДО ЕКРАНА (ПОВНИЙ ВИГЛЯД) ───────────
            ctx.translate(0, -32 + breath * 3);

            if (type === 'basket') {
                ctx.fillStyle = '#C29B38';
                ctx.beginPath(); ctx.roundRect(-9, -4, 18, 17, 3); ctx.fill();
                ctx.strokeStyle = '#78350F'; ctx.lineWidth = 1; ctx.stroke();
                // Солом'яні лінії
                ctx.strokeStyle = '#9A7420';
                for (let x = -6; x <= 6; x += 3) {
                    ctx.beginPath(); ctx.moveTo(x, -4); ctx.lineTo(x, 13); ctx.stroke();
                }
                // Кришка
                ctx.fillStyle = '#854D0E'; ctx.fillRect(-10, -6, 20, 3);
            } else if (type === 'leather_backpack') {
                ctx.fillStyle = '#78350F';
                ctx.beginPath(); ctx.roundRect(-10, -5, 20, 19, 4); ctx.fill();
                ctx.strokeStyle = '#451A03'; ctx.lineWidth = 1.2; ctx.stroke();
                // Кишені
                ctx.fillStyle = '#92400E';
                ctx.fillRect(-8, 3, 7, 9); ctx.fillRect(1, 3, 7, 9);
                // Згорнутий спальник
                ctx.fillStyle = '#E2E8F0';
                ctx.beginPath(); ctx.roundRect(-11, -10, 22, 6, 2); ctx.fill();
                ctx.fillStyle = '#B45309'; ctx.fillRect(-7, -10, 2, 6); ctx.fillRect(5, -10, 2, 6);
                // Пряжки
                ctx.fillStyle = '#F59E0B'; ctx.fillRect(-6, 6, 2, 3); ctx.fillRect(3, 6, 2, 3);
            } else if (type === 'military_backpack') {
                ctx.fillStyle = '#365314';
                ctx.beginPath(); ctx.roundRect(-10, -6, 20, 20, 3); ctx.fill();
                ctx.strokeStyle = '#1A2E05'; ctx.lineWidth = 1.5; ctx.stroke();
                // Стропи MOLLE
                ctx.strokeStyle = '#111827'; ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(-8, 1); ctx.lineTo(8, 1); ctx.moveTo(-8, 6); ctx.lineTo(8, 6); ctx.stroke();
                // Шеврон
                ctx.fillStyle = '#2563EB'; ctx.fillRect(-3, -4, 6, 2);
                ctx.fillStyle = '#EAB308'; ctx.fillRect(-3, -2, 6, 2);
                // Антена
                ctx.strokeStyle = '#0F172A'; ctx.lineWidth = 1.2;
                ctx.beginPath(); ctx.moveTo(8, -6); ctx.lineTo(11, -15); ctx.stroke();
            } else if (type === 'diver_backpack') {
                ctx.fillStyle = '#EAB308';
                ctx.beginPath(); ctx.roundRect(-9, -5, 18, 19, 4); ctx.fill();
                ctx.strokeStyle = '#1E293B'; ctx.lineWidth = 1.2; ctx.stroke();
                // Балон
                ctx.fillStyle = '#CBD5E1';
                ctx.beginPath(); ctx.roundRect(-4, -9, 8, 20, 3); ctx.fill();
                ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-2, -8, 2, 17);
                // Шланг
                ctx.strokeStyle = '#0F172A'; ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.moveTo(2, -9); ctx.quadraticCurveTo(9, -7, 7, 4); ctx.stroke();
            } else if (type === 'void_backpack') {
                ctx.fillStyle = '#2E1065';
                ctx.beginPath(); ctx.roundRect(-10, -6, 20, 20, 4); ctx.fill();
                ctx.strokeStyle = '#7C3AED'; ctx.lineWidth = 1.5; ctx.stroke();
                // Сяючий Кристал Пустоти
                const glow = (Math.sin(Date.now() / 200) + 1) / 2;
                ctx.fillStyle = '#E879F9';
                ctx.beginPath();
                ctx.moveTo(0, -1); ctx.lineTo(4, 4); ctx.lineTo(0, 9); ctx.lineTo(-4, 4); ctx.closePath(); ctx.fill();
                ctx.strokeStyle = `rgba(232, 121, 249, ${0.4 + glow * 0.5})`;
                ctx.stroke();
            }

        } else if (row === 1 || row === 2) {
            // ── ПОЗИЦІЯ: БІЧНИЙ ВИГЛЯД (ВИГЛЯДАЄ ЗЗАДУ СПИНИ) ───────
            // Якщо row === 1 (ліворуч), рюкзак праворуч (x > 0); якщо row === 2 (праворуч), рюкзак ліворуч (x < 0)
            const offX = row === 1 ? 7 : -7;
            ctx.translate(offX, -30 + breath * 2);

            if (type === 'basket') {
                ctx.fillStyle = '#C29B38';
                ctx.beginPath(); ctx.roundRect(-4, -4, 8, 16, 2); ctx.fill();
                ctx.strokeStyle = '#78350F'; ctx.stroke();
            } else if (type === 'leather_backpack') {
                ctx.fillStyle = '#78350F';
                ctx.beginPath(); ctx.roundRect(-5, -5, 10, 18, 3); ctx.fill();
                ctx.fillStyle = '#E2E8F0'; ctx.fillRect(-5, -8, 10, 4); // спальник
            } else if (type === 'military_backpack') {
                ctx.fillStyle = '#365314';
                ctx.beginPath(); ctx.roundRect(-5, -6, 10, 19, 2); ctx.fill();
                ctx.strokeStyle = '#0F172A'; ctx.stroke();
            } else if (type === 'diver_backpack') {
                ctx.fillStyle = '#EAB308'; ctx.fillRect(-4, -5, 8, 17);
                ctx.fillStyle = '#CBD5E1'; ctx.beginPath(); ctx.roundRect(-3, -8, 6, 18, 2); ctx.fill();
            } else if (type === 'void_backpack') {
                ctx.fillStyle = '#2E1065';
                ctx.beginPath(); ctx.roundRect(-5, -5, 10, 18, 3); ctx.fill();
                ctx.fillStyle = '#E879F9'; ctx.fillRect(-2, 1, 4, 6); // кристал
            }

        } else if (row === 0) {
            // ── ПОЗИЦІЯ: ПЕРЕДНІЙ ВИГЛЯД (ЛЯМКИ ЧЕРЕЗ ПЛЕЧІ) ────────
            ctx.translate(0, -32 + breath * 2);

            let strapColor = '#78350F';
            if (type === 'military_backpack') strapColor = '#1A2E05';
            if (type === 'diver_backpack') strapColor = '#1E293B';
            if (type === 'void_backpack') strapColor = '#7C3AED';

            // Дві лямки через плечі
            ctx.fillStyle = strapColor;
            ctx.fillRect(-8, -4, 3, 14);
            ctx.fillRect(5, -4, 3, 14);

            // Нагрудна пряжка
            ctx.fillStyle = type === 'leather_backpack' ? '#F59E0B' : '#94A3B8';
            ctx.fillRect(-5, 2, 10, 2);

            // Додаткові деталі спереду
            if (type === 'diver_backpack') {
                // Шланг із клапаном
                ctx.strokeStyle = '#0284C7'; ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.moveTo(6, -4); ctx.lineTo(1, 5); ctx.stroke();
            } else if (type === 'military_backpack') {
                // Рація на лівій лямці
                ctx.fillStyle = '#0F172A'; ctx.fillRect(-9, -2, 4, 6);
            }
        }

        ctx.restore();
    };

    // ─── 4. ІНТЕЛЕКТУАЛЬНИЙ ХУК В GameTextures.drawPlayer ────────
    if (window.GameTextures) {
        const origDrawPlayer = window.GameTextures.drawPlayer;
        window.GameTextures.drawPlayer = function(ctx, player, camera) {
            const res = origDrawPlayer.apply(this, arguments);
            if (!res) return false;

            // Якщо гравець намальований — додаємо рюкзак
            const bpType = player.equippedBackpack || (window.game?.ultimateSystem?.equippedBackpack);
            if (bpType && bpType !== 'none' && bpType !== 'default') {
                const row = Math.max(0, Math.min(3, player.direction || 0));
                const pos = camera.worldToScreen(player.x, player.y);
                const t = Date.now() / 1000;
                const breath = Math.sin(t * 2.5) * 0.007;

                ctx.save();
                ctx.translate(pos.x, pos.y + 11);
                window.drawBackpackOnPlayer(ctx, bpType, row, 0, breath, 0);
                ctx.restore();
            }
            return true;
        };
    }

    // ─── 5. ПЕРЕХОПЛЕННЯ drawItemIcon В GAME.JS ──────────────────
    const origDrawIcon = window.drawItemIcon;
    window.drawItemIcon = function(ctx, itemId, x, y, size) {
        if (['basket', 'leather_backpack', 'military_backpack', 'diver_backpack', 'void_backpack'].includes(itemId)) {
            window.drawBackpackIcon(ctx, itemId, x + size/2, y + size/2, size);
            return;
        }
        if (origDrawIcon) origDrawIcon.apply(this, arguments);
    };

    // ─── 6. МОДАЛЬНЕ ВІКНО «ГАРДЕРОБ РЮКЗАКІВ» (UI WARDROBE) ─────
    window.openBackpackWardrobe = function() {
        let modal = document.getElementById('backpack-wardrobe-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'backpack-wardrobe-modal';
            modal.className = 'modal';
            modal.style.position = 'fixed';
            modal.style.top = '0'; modal.style.left = '0';
            modal.style.width = '100vw'; modal.style.height = '100vh';
            modal.style.background = 'rgba(0,0,0,0.85)';
            modal.style.display = 'flex'; modal.style.alignItems = 'center'; modal.style.justifyContent = 'center';
            modal.style.zIndex = '110';
            document.body.appendChild(modal);
        }

        const backpacks = [
            { id: 'basket',            name: 'Плетений кошик',       slots: 25, bonus: 'Легкий солом\'яний плетений кошик із сувоєм карти', color: '#D4A373' },
            { id: 'leather_backpack',  name: 'Шкіряний мандрівник',  slots: 40, bonus: 'Вичинена шкіра, латунні пряжки та спальник (+10% захист)', color: '#92400E' },
            { id: 'military_backpack', name: 'Військовий тактичний', slots: 50, bonus: 'Камуфляж хакі, стропи MOLLE, антена та шеврон', color: '#365314' },
            { id: 'diver_backpack',    name: 'Водолазний акваланг',  slots: 45, bonus: 'Неопрен, кисневий балон, манометр (+90с під водою)', color: '#EAB308' },
            { id: 'void_backpack',     name: 'Рюкзак Аномалії',      slots: 50, bonus: 'Опівнічний оксамит, сяючі руни, Кристал Пустоти (+Sanity)', color: '#7C3AED' }
        ];

        const p = window.game?.player;
        const current = p?.equippedBackpack || 'leather_backpack';

        modal.innerHTML = `
            <div style="background: linear-gradient(135deg, #0F172A, #1E1B4B); border: 2px solid #8B5CF6; border-radius: 16px; padding: 26px; max-width: 580px; width: 90%; color: #F1F5F9; box-shadow: 0 10px 40px rgba(139,92,246,0.4); position: relative;">
                <button id="btn-close-wardrobe" style="position: absolute; top: 12px; right: 16px; background: transparent; border: none; color: #94A3B8; font-size: 24px; cursor: pointer;">&times;</button>
                <h2 style="color: #C084FC; margin-top: 0; font-size: 1.6rem;">🎒 Гардероб та дизайн рюкзака</h2>
                <p style="color: #94A3B8; font-size: 0.95rem;">Оберіть дизайн та тип рюкзака, що відображатиметься на вашому персонажі:</p>
                <div id="wardrobe-list" style="display: flex; flex-direction: column; gap: 10px; max-height: 360px; overflow-y: auto;"></div>
            </div>
        `;

        const list = modal.querySelector('#wardrobe-list');
        backpacks.forEach(b => {
            const hasItem = p?.inventory ? (p.inventory.hasItem(b.id) || b.id === 'basket') : true;
            const isEquipped = current === b.id;

            const card = document.createElement('div');
            card.style.background = isEquipped ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255,255,255,0.05)';
            card.style.border = isEquipped ? '2px solid #A855F7' : '1px solid rgba(255,255,255,0.1)';
            card.style.borderRadius = '10px';
            card.style.padding = '12px 16px';
            card.style.display = 'flex';
            card.style.alignItems = 'center';
            card.style.justifyContent = 'space-between';
            card.style.gap = '14px';

            card.innerHTML = `
                <div style="display: flex; align-items: center; gap: 14px;">
                    <canvas id="icon-${b.id}" width="44" height="44" style="background: rgba(0,0,0,0.3); border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);"></canvas>
                    <div>
                        <b style="color: ${b.color}; font-size: 1.05rem;">${b.name}</b> ${isEquipped ? '⭐ [Активний]' : ''}<br>
                        <span style="font-size: 0.85rem; color: #E2E8F0;">Місткість: <b>${b.slots} слотів</b></span><br>
                        <span style="font-size: 0.8rem; color: #94A3B8;">${b.bonus}</span>
                    </div>
                </div>
                <button class="equip-bp-btn" style="background: ${isEquipped ? '#10B981' : hasItem ? '#8B5CF6' : '#475569'}; color: #fff; font-weight: bold; border: none; padding: 8px 16px; border-radius: 8px; cursor: ${hasItem ? 'pointer' : 'default'};" ${hasItem ? '' : 'disabled'}>
                    ${isEquipped ? 'Одягнено' : hasItem ? 'Одягнути' : 'Не скрафчено'}
                </button>
            `;

            // Малюємо прев'ю іконки на canvas
            setTimeout(() => {
                const cvs = card.querySelector(`#icon-${b.id}`);
                if (cvs) {
                    const c = cvs.getContext('2d');
                    window.drawBackpackIcon(c, b.id, 22, 22, 38);
                }
            }, 10);

            if (hasItem && !isEquipped) {
                card.querySelector('.equip-bp-btn').onclick = () => {
                    if (p) {
                        p.equippedBackpack = b.id;
                        if (window.game?.ultimateSystem) {
                            window.game.ultimateSystem.equippedBackpack = b.id;
                            window.game.ultimateSystem.expandInventorySlots(p.inventory, b.slots);
                        }
                        window.game.showNotification(`🎒 Одягнено: ${b.name} (${b.slots} слотів)!`, 'success');
                    }
                    window.openBackpackWardrobe(); // оновлюємо вікно
                };
            }

            list.appendChild(card);
        });

        modal.style.display = 'flex';
        modal.querySelector('#btn-close-wardrobe').onclick = () => { modal.style.display = 'none'; };
    };

    // ─── 7. ДОДАВАННЯ КНОПКИ ГАРДЕРОБУ В ПАНЕЛЬ ІНВЕНТАРЮ ─────────
    function attachWardrobeButton() {
        const invPanel = document.getElementById('panel-inventory');
        if (!invPanel || document.getElementById('btn-open-wardrobe')) return;

        const equipArea = invPanel.querySelector('.equipment-area');
        if (equipArea) {
            const btn = document.createElement('button');
            btn.id = 'btn-open-wardrobe';
            btn.innerHTML = '🎨 Дизайн рюкзака';
            btn.style.marginLeft = '12px';
            btn.style.background = '#8B5CF6';
            btn.style.color = '#fff';
            btn.style.border = 'none';
            btn.style.padding = '6px 14px';
            btn.style.borderRadius = '6px';
            btn.style.cursor = 'pointer';
            btn.style.fontWeight = 'bold';
            btn.style.fontSize = '0.9rem';
            btn.onclick = () => window.openBackpackWardrobe();
            equipArea.appendChild(btn);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attachWardrobeButton);
    } else {
        attachWardrobeButton();
    }

    console.log('[backpack-designs.js] 5 дизайнів рюкзака та візуальний рендерер активовано ✅');
})();
