// animals.js

(function() {

function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

window.Animal = class Animal {
    constructor(species, x, y, id) {
        this.id = id || 'anim_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
        this.species = species;
        this.x = x;
        this.y = y;
        
        // Defaults
        this.speed = 50;
        this.health = 20;
        this.maxHealth = 20;
        this.detectionRadius = 100;
        this.trust = 0;
        this.fedCount = 0;
        this.colorIndex = 0;
        
        if (species === 'rabbit') {
            this.speed = 80; this.health = 20; this.maxHealth = 20; this.detectionRadius = 120;
        } else if (species === 'turtle') {
            this.speed = 20; this.health = 40; this.maxHealth = 40; this.detectionRadius = 60;
        } else if (species === 'parrot') {
            this.speed = 100; this.health = 15; this.maxHealth = 15; this.detectionRadius = 150;
        } else if (species === 'boar') {
            this.speed = 60; this.health = 80; this.maxHealth = 80; this.detectionRadius = 100;
        } else if (species === 'wild_dog') {
            this.speed = 70; this.health = 50; this.maxHealth = 50; this.detectionRadius = 130;
            this.colorIndex = getRandomInt(0, 4);
        }
        
        this.state = 'idle';
        this.stateTimer = Math.random() * 3 + 1;
        this.targetX = null;
        this.targetY = null;
        this.direction = 0; // 0: down, 1: left, 2: right, 3: up
        this.animFrame = 0;
        this.animTimer = 0;
        this.width = 24;
        this.height = 24;
    }

    setState(newState) {
        if (this.state !== newState) {
            this.state = newState;
            this.stateTimer = 0;
        }
    }

    distanceTo(x, y) {
        return distance(this.x, this.y, x, y);
    }

    getRect() {
        return {
            x: this.x - this.width / 2,
            y: this.y - this.height / 2,
            w: this.width,
            h: this.height
        };
    }

    canInteract(playerX, playerY) {
        return this.distanceTo(playerX, playerY) <= 60;
    }

    interact(playerInventory) {
        if (this.species === 'wild_dog') {
            if (this.trust >= 80) {
                return { message: "Дикий собака готовий стати вашим другом! Використайте опцію приручення.", action: 'tame' };
            }
            // Check for food
            let foodSlot = -1;
            let foodItem = null;
            if (playerInventory) {
                for (let i = 0; i < playerInventory.maxSlots; i++) {
                    const slot = playerInventory.getSlot(i);
                    if (slot && window.ITEM_DB[slot.id] && window.ITEM_DB[slot.id].category === 'food' && slot.id !== 'water') {
                        foodSlot = i;
                        foodItem = slot.id;
                        break;
                    }
                }
            }

            if (foodSlot !== -1 && this.trust > 20) {
                playerInventory.removeItem(foodItem, 1);
                this.fedCount++;
                this.trust += getRandomInt(8, 12);
                if (this.trust > 100) this.trust = 100;
                return { message: `Ви погодували собаку. Довіра зросла! (${this.trust}/100)`, action: 'feed' };
            } else if (foodSlot !== -1) {
                playerInventory.removeItem(foodItem, 1);
                this.fedCount++;
                this.trust += getRandomInt(8, 12);
                return { message: `Собака обережно з'їв вашу їжу. Довіра: ${this.trust}/100`, action: 'feed' };
            } else {
                return { message: "Собака обережно дивиться на вас. Потрібна їжа.", action: null };
            }
        } else if (this.species === 'rabbit') {
            return { message: "Кролик злякано дивиться на вас.", action: null };
        } else if (this.species === 'turtle') {
            return { message: "Черепаха повільно кліпає очима.", action: null };
        } else if (this.species === 'parrot') {
            return { message: "Папуга кричить щось незрозуміле.", action: null };
        } else if (this.species === 'boar') {
            return { message: "Кабан виглядає агресивним!", action: null };
        }
        return { message: "Тварина", action: null };
    }

    isWalkable(tx, ty, worldTiles, buildings) {
        if (tx < 0 || ty < 0 || ty >= worldTiles.length || tx >= worldTiles[0].length) return false;
        const tile = worldTiles[ty][tx];
        
        if (this.species === 'turtle') {
            if (tile !== 1 && tile !== 2) return false; // Turtle only on shallow water(1) and beach(2)
        } else if (this.species === 'parrot') {
            // Parrots can fly over anything, but let's restrict to jungle and grass mostly
        } else {
            if (tile === 0 || tile === 1 || tile === 5) return false; // No ocean, shallow, or rock
        }

        // Check buildings
        if (buildings) {
            const bx = tx * 32;
            const by = ty * 32;
            const bList = Array.isArray(buildings) ? buildings : (buildings.buildings || []);
            for (let b of bList) {
                const bdb = window.BUILDING_DB[b.type];
                if (bdb && !bdb.passable) {
                    if (bx < b.x + bdb.width/2 && bx + 32 > b.x - bdb.width/2 &&
                        by < b.y + bdb.height/2 && by + 32 > b.y - bdb.height/2) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    update(dt, playerX, playerY, worldTiles, tileSize, buildings) {
        this.stateTimer -= dt;
        this.animTimer += dt;
        if (this.animTimer > 0.15) {
            this.animTimer = 0;
            if (this.state === 'wander' || this.state === 'flee' || this.state === 'attack') {
                this.animFrame = (this.animFrame + 1) % 4;
            } else {
                this.animFrame = 0;
            }
        }

        const distToPlayer = this.distanceTo(playerX, playerY);

        // Behavior logic
        if (this.species === 'rabbit') {
            if (distToPlayer < this.detectionRadius) {
                this.setState('flee');
                const angle = Math.atan2(this.y - playerY, this.x - playerX);
                this.targetX = this.x + Math.cos(angle) * 100;
                this.targetY = this.y + Math.sin(angle) * 100;
            }
        } else if (this.species === 'parrot') {
            if (distToPlayer < this.detectionRadius) {
                this.setState('flee');
                const angle = Math.atan2(this.y - playerY, this.x - playerX);
                this.targetX = this.x + Math.cos(angle) * 200;
                this.targetY = this.y + Math.sin(angle) * 200;
            }
        } else if (this.species === 'boar') {
            if (distToPlayer < this.detectionRadius) {
                this.setState('attack');
                this.targetX = playerX;
                this.targetY = playerY;
                if (distToPlayer < 30 && window.game && window.game.player) {
                    // Attack logic
                    if (Math.random() < dt) {
                        window.game.player.health -= 5;
                        if (window.game.showNotification) {
                            window.game.showNotification("Кабан атакує!", "danger");
                        }
                    }
                }
            } else if (this.state === 'attack' && distToPlayer > this.detectionRadius * 1.5) {
                this.setState('idle');
                this.stateTimer = 2;
            }
        } else if (this.species === 'wild_dog') {
            if (distToPlayer < this.detectionRadius && this.trust < 50) {
                if (this.state !== 'flee') {
                    this.setState('flee');
                    const angle = Math.atan2(this.y - playerY, this.x - playerX);
                    this.targetX = this.x + Math.cos(angle) * 80;
                    this.targetY = this.y + Math.sin(angle) * 80;
                }
            }
        }

        // State Machine
        if (this.state === 'idle') {
            if (this.stateTimer <= 0) {
                const r = Math.random();
                if (r < 0.6) {
                    this.setState('wander');
                    const angle = Math.random() * Math.PI * 2;
                    const dist = Math.random() * 100 + 50;
                    this.targetX = this.x + Math.cos(angle) * dist;
                    this.targetY = this.y + Math.sin(angle) * dist;
                    this.stateTimer = 5;
                } else if (r < 0.8) {
                    this.setState('eat');
                    this.stateTimer = 3;
                } else {
                    this.setState('sleep');
                    this.stateTimer = 5;
                }
            }
        } else if (this.state === 'wander' || this.state === 'flee' || this.state === 'attack') {
            if (this.targetX !== null && this.targetY !== null) {
                const dx = this.targetX - this.x;
                const dy = this.targetY - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 5) {
                    this.setState('idle');
                    this.stateTimer = Math.random() * 2 + 1;
                } else {
                    let moveSpeed = this.speed * dt;
                    if (this.state === 'flee') moveSpeed *= 1.5;
                    if (this.state === 'attack') moveSpeed *= 1.2;

                    const vx = (dx / dist) * moveSpeed;
                    const vy = (dy / dist) * moveSpeed;

                    const nextX = this.x + vx;
                    const nextY = this.y + vy;

                    const tx = Math.floor(nextX / tileSize);
                    const ty = Math.floor(nextY / tileSize);

                    if (this.isWalkable(tx, ty, worldTiles, buildings)) {
                        this.x = nextX;
                        this.y = nextY;
                    } else {
                        // Blocked, change target
                        this.setState('idle');
                        this.stateTimer = 0.5;
                    }

                    // Update direction
                    if (Math.abs(dx) > Math.abs(dy)) {
                        this.direction = dx > 0 ? 2 : 1;
                    } else {
                        this.direction = dy > 0 ? 0 : 3;
                    }
                }
            }

            if (this.stateTimer <= 0 && this.state === 'wander') {
                this.setState('idle');
                this.stateTimer = Math.random() * 2 + 1;
            }
        } else if (this.state === 'eat' || this.state === 'sleep') {
            if (this.stateTimer <= 0) {
                this.setState('idle');
                this.stateTimer = Math.random() * 2 + 1;
            }
        }
    }

    draw(ctx, camera) {
        if (!camera.isVisible(this.x, this.y)) return;

        const screenPos = camera.worldToScreen(this.x, this.y);
        ctx.save();
        ctx.translate(screenPos.x, screenPos.y);

        // Draw shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(0, this.height/3, this.width/2, this.height/4, 0, 0, Math.PI * 2);
        ctx.fill();

        const bounce = (this.state === 'wander' || this.state === 'flee' || this.state === 'attack') ? Math.sin(this.animFrame * Math.PI) * 2 : 0;
        ctx.translate(0, -bounce);

        // Flip horizontally if facing left
        if (this.direction === 1) {
            ctx.scale(-1, 1);
        }

        if (this.species === 'rabbit') {
            this.drawRabbit(ctx);
        } else if (this.species === 'turtle') {
            this.drawTurtle(ctx);
        } else if (this.species === 'parrot') {
            this.drawParrot(ctx);
        } else if (this.species === 'boar') {
            this.drawBoar(ctx);
        } else if (this.species === 'wild_dog') {
            this.drawDog(ctx, this.colorIndex, false);
        }

        if (this.state === 'sleep') {
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.fillText('Z', 10, -15);
        }

        ctx.restore();
    }

    drawRabbit(ctx) {
        // Body
        ctx.fillStyle = '#A08060';
        ctx.beginPath();
        ctx.ellipse(0, 5, 10, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Head
        ctx.beginPath();
        ctx.arc((this.direction === 2 || this.direction === 0 ? 8 : -8), 0, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Ears
        ctx.fillStyle = '#806040';
        const earX = (this.direction === 2 || this.direction === 0 ? 6 : -6);
        ctx.beginPath();
        ctx.ellipse(earX, -8, 2, 6, Math.PI/8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(earX + 4, -7, 2, 6, -Math.PI/8, 0, Math.PI * 2);
        ctx.fill();

        // Tail
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc((this.direction === 2 || this.direction === 0 ? -9 : 9), 5, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    drawTurtle(ctx) {
        // Shell
        ctx.fillStyle = '#2E7D32';
        ctx.beginPath();
        ctx.ellipse(0, 2, 14, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Shell pattern
        ctx.strokeStyle = '#1B5E20';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-6, -2); ctx.lineTo(6, -2);
        ctx.moveTo(-6, 6); ctx.lineTo(6, 6);
        ctx.moveTo(-10, 2); ctx.lineTo(-6, -2);
        ctx.stroke();
        
        // Head
        ctx.fillStyle = '#558B2F';
        ctx.beginPath();
        ctx.arc((this.direction === 2 || this.direction === 0 ? 16 : -16), 5, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Legs
        ctx.beginPath();
        ctx.arc(-8, 10, 3, 0, Math.PI*2);
        ctx.arc(8, 10, 3, 0, Math.PI*2);
        ctx.fill();
    }

    drawParrot(ctx) {
        // Body (Colorful)
        ctx.fillStyle = '#F44336'; // Red
        ctx.beginPath();
        ctx.ellipse(0, 0, 6, 12, Math.PI/4, 0, Math.PI * 2);
        ctx.fill();
        
        // Wing
        ctx.fillStyle = '#2196F3'; // Blue
        ctx.beginPath();
        ctx.ellipse(-2, 2, 4, 8, Math.PI/3, 0, Math.PI * 2);
        ctx.fill();
        
        // Head
        ctx.fillStyle = '#F44336';
        ctx.beginPath();
        ctx.arc(6, -6, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Beak
        ctx.fillStyle = '#FFEB3B';
        ctx.beginPath();
        ctx.moveTo(10, -6);
        ctx.lineTo(14, -4);
        ctx.lineTo(10, -2);
        ctx.fill();

        // Flying animation
        if (this.state === 'flee' || this.state === 'wander') {
            ctx.fillStyle = '#4CAF50'; // Green wing flap
            ctx.beginPath();
            ctx.ellipse(0, -4 - (this.animFrame % 2 * 4), 8, 3, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawBoar(ctx) {
        // Body
        ctx.fillStyle = '#4E342E'; // Dark brown
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Head
        ctx.fillStyle = '#3E2723';
        ctx.beginPath();
        ctx.arc((this.direction === 2 || this.direction === 0 ? 16 : -16), -2, 10, 0, Math.PI * 2);
        ctx.fill();
        
        // Tusks
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        const tuskX = (this.direction === 2 || this.direction === 0 ? 22 : -22);
        ctx.moveTo(tuskX - 2, 0);
        ctx.lineTo(tuskX + 4, -6);
        ctx.lineTo(tuskX - 2, 4);
        ctx.fill();
        
        // Legs
        ctx.fillStyle = '#212121';
        const lx1 = -10, lx2 = 10;
        const ly = 10;
        const offset1 = (this.animFrame % 2 === 0) ? -2 : 2;
        const offset2 = (this.animFrame % 2 === 0) ? 2 : -2;
        
        ctx.fillRect(lx1, ly, 4, 6 + offset1);
        ctx.fillRect(lx2, ly, 4, 6 + offset2);
    }

    drawDog(ctx, colorIndex, hasCollar) {
        const colors = ['#8B6914', '#333333', '#F5F5DC', '#DAA520', '#808080'];
        const bodyColor = colors[colorIndex] || colors[0];
        
        // Body
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.ellipse(0, 0, 14, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Head
        ctx.beginPath();
        const hx = (this.direction === 2 || this.direction === 0 ? 12 : -12);
        ctx.arc(hx, -6, 7, 0, Math.PI * 2);
        ctx.fill();
        
        // Snout
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(hx + (this.direction === 2 || this.direction === 0 ? 6 : -6), -6, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Ears
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.ellipse(hx - 2, -11, 3, 5, Math.PI/4, 0, Math.PI * 2);
        ctx.fill();
        
        // Legs
        ctx.fillStyle = bodyColor;
        const lx1 = -8, lx2 = 8;
        const ly = 6;
        const offset1 = (this.animFrame % 2 === 0 && (this.state === 'wander' || this.state === 'flee')) ? -2 : 2;
        const offset2 = (this.animFrame % 2 === 0 && (this.state === 'wander' || this.state === 'flee')) ? 2 : -2;
        ctx.fillRect(lx1, ly, 3, 6 + offset1);
        ctx.fillRect(lx2, ly, 3, 6 + offset2);
        
        // Tail
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = bodyColor;
        ctx.moveTo(-12, -2);
        if (this.state === 'idle') {
            ctx.lineTo(-18 + Math.sin(this.animTimer * 10) * 2, -8); // wagging
        } else {
            ctx.lineTo(-18, -4);
        }
        ctx.stroke();

        // Collar
        if (hasCollar) {
            ctx.strokeStyle = '#F44336';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(hx - 4, -2);
            ctx.lineTo(hx + 4, -2);
            ctx.stroke();
        }
    }

    serialize() {
        return {
            id: this.id,
            species: this.species,
            x: this.x,
            y: this.y,
            health: this.health,
            state: this.state,
            stateTimer: this.stateTimer,
            targetX: this.targetX,
            targetY: this.targetY,
            direction: this.direction,
            trust: this.trust,
            fedCount: this.fedCount,
            colorIndex: this.colorIndex
        };
    }

    static deserialize(data) {
        const anim = new Animal(data.species, data.x, data.y, data.id);
        anim.health = data.health;
        anim.state = data.state;
        anim.stateTimer = data.stateTimer;
        anim.targetX = data.targetX;
        anim.targetY = data.targetY;
        anim.direction = data.direction;
        anim.trust = data.trust || 0;
        anim.fedCount = data.fedCount || 0;
        anim.colorIndex = data.colorIndex !== undefined ? data.colorIndex : 0;
        return anim;
    }
};

window.DogCompanion = class DogCompanion {
    constructor(x, y, colorIndex, name, id) {
        this.id = id || 'dog_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
        this.name = name || 'Дружок';
        this.x = x;
        this.y = y;
        this.colorIndex = colorIndex || 0;
        this.size = Math.random() * 0.4 + 0.8; // 0.8 to 1.2
        
        this.health = 100;
        this.maxHealth = 100;
        this.hunger = 100;
        this.maxHunger = 100;
        this.energy = 100;
        this.maxEnergy = 100;
        
        this.trust = 60;
        this.level = 1;
        this.xp = 0;
        this.xpToNext = 100;
        
        this.state = 'idle';
        this.command = 'follow'; // follow, stay, come, search_resources, search_food, guard, explore, rest
        
        this.targetX = null;
        this.targetY = null;
        this.direction = 0;
        this.animFrame = 0;
        this.animTimer = 0;
        
        const personalities = ['playful', 'calm', 'brave', 'curious'];
        this.personality = personalities[Math.floor(Math.random() * personalities.length)];
        
        this.foundItems = [];
        this.searchTimer = 0;
        this.stateTimer = 0;
        
        this.width = 24 * this.size;
        this.height = 24 * this.size;
        this.speed = 100;
    }

    setCommand(cmd) {
        this.command = cmd;
        this.state = 'idle';
        this.targetX = null;
        this.targetY = null;
        
        if (cmd === 'search_resources' || cmd === 'search_food') {
            this.searchTimer = 10 - (this.level * 0.5); // Faster search at higher levels
            if (this.personality === 'curious') this.searchTimer *= 0.8;
        }
    }

    feed(itemId) {
        const item = window.ITEM_DB[itemId];
        if (item && item.category === 'food' && itemId !== 'water') {
            const h = item.effects?.hunger || 10;
            this.hunger = Math.min(this.maxHunger, this.hunger + h);
            this.trust = Math.min(100, this.trust + 2);
            this.heal(item.effects?.health || 0);
            return { success: true, message: `${this.name} із задоволенням з'їв ${item.name}. Ситість: ${Math.round(this.hunger)}/100` };
        }
        return { success: false, message: `${this.name} не хоче це їсти.` };
    }

    giveWater() {
        this.energy = Math.min(this.maxEnergy, this.energy + 20);
        return { success: true, message: `${this.name} попив води і відновив енергію.` };
    }

    pet() {
        this.trust = Math.min(100, this.trust + 2);
        this.addXP(5);
        return { message: `Ви погладили ${this.name}. Він радісно махає хвостом!` };
    }

    play() {
        if (this.energy < 20) {
            return { message: `${this.name} занадто втомлений для ігор.` };
        }
        this.energy -= 15;
        this.hunger -= 10;
        this.trust = Math.min(100, this.trust + 3);
        this.addXP(15);
        return { message: `Ви погралися з ${this.name}. Довіра зросла!` };
    }

    heal(amount) {
        if (amount > 0) {
            this.health = Math.min(this.maxHealth, this.health + amount);
        }
    }

    addXP(amount) {
        this.xp += amount;
        this.checkLevelUp();
    }

    checkLevelUp() {
        if (this.xp >= this.xpToNext) {
            this.level++;
            this.xp -= this.xpToNext;
            this.xpToNext = Math.floor(this.xpToNext * 1.5);
            this.maxHealth += 10;
            this.health = this.maxHealth;
            if (window.game && window.game.showNotification) {
                window.game.showNotification(`${this.name} досяг рівня ${this.level}!`, 'success');
            }
        }
    }

    collectFoundItems() {
        const items = [...this.foundItems];
        this.foundItems = [];
        return items;
    }

    getRect() {
        return {
            x: this.x - this.width / 2,
            y: this.y - this.height / 2,
            w: this.width,
            h: this.height
        };
    }

    distanceTo(x, y) {
        return Math.hypot(this.x - x, this.y - y);
    }

    interact(playerInventory) {
        return { message: `${this.name} чекає на ваші вказівки!`, action: 'open_dog_detail', success: true };
    }

    update(dt, playerX, playerY, worldTiles, tileSize, resources, buildings) {
        this.stateTimer -= dt;
        this.animTimer += dt;
        
        // Needs drain
        this.hunger -= dt * 0.1;
        if (this.command === 'rest') {
            this.energy = Math.min(this.maxEnergy, this.energy + dt * 2);
        } else {
            if (this.state !== 'idle') {
                this.energy -= dt * 0.2;
            }
        }
        
        if (this.hunger < 0) this.hunger = 0;
        if (this.energy < 0) this.energy = 0;

        if (this.animTimer > 0.15) {
            this.animTimer = 0;
            if (this.state === 'moving') {
                this.animFrame = (this.animFrame + 1) % 4;
            } else {
                this.animFrame = 0;
            }
        }

        const distToPlayer = distance(this.x, this.y, playerX, playerY);

        // Command logic
        if (this.command === 'follow') {
            if (distToPlayer > 150) {
                this.speed = 140; // run to catch up
            } else {
                this.speed = 100;
            }

            if (distToPlayer > 60) {
                this.state = 'moving';
                this.targetX = playerX;
                this.targetY = playerY;
            } else if (distToPlayer < 40) {
                this.state = 'idle';
                this.targetX = null;
                this.targetY = null;
            } else {
                if (this.state !== 'idle') this.state = 'moving';
            }
        } else if (this.command === 'stay' || this.command === 'rest') {
            this.state = 'idle';
            this.targetX = null;
            this.targetY = null;
        } else if (this.command === 'come') {
            if (distToPlayer > 30) {
                this.state = 'moving';
                this.targetX = playerX;
                this.targetY = playerY;
                this.speed = 120;
            } else {
                this.setCommand('follow');
            }
        } else if (this.command === 'search_resources' || this.command === 'search_food') {
            this.searchTimer -= dt;
            if (this.state === 'idle') {
                if (Math.random() < 0.05) {
                    this.state = 'moving';
                    const angle = Math.random() * Math.PI * 2;
                    const dist = Math.random() * 80 + 30;
                    this.targetX = this.x + Math.cos(angle) * dist;
                    this.targetY = this.y + Math.sin(angle) * dist;
                    this.stateTimer = 2;
                }
            }
            if (this.searchTimer <= 0) {
                // Find item
                const rList = this.command === 'search_resources' ? ['branch', 'stone', 'fiber'] : ['berry', 'mushroom'];
                const item = rList[Math.floor(Math.random() * rList.length)];
                
                // Add to found items (max 5)
                let existing = this.foundItems.find(i => i.id === item);
                if (existing) {
                    if (existing.count < 5) existing.count++;
                } else {
                    if (this.foundItems.length < 3) {
                        this.foundItems.push({id: item, count: 1});
                    }
                }
                
                this.searchTimer = 15 - (this.level * 0.5);
                if (window.game && window.game.showNotification) {
                    window.game.showNotification(`${this.name} щось знайшов!`, 'info');
                }
                this.addXP(2);
            }
        } else if (this.command === 'guard') {
            // Patrol around player
            if (this.stateTimer <= 0) {
                this.state = 'moving';
                const angle = Math.random() * Math.PI * 2;
                this.targetX = playerX + Math.cos(angle) * 100;
                this.targetY = playerY + Math.sin(angle) * 100;
                this.stateTimer = 3;
            }
            
            // Check for hostile animals (boars)
            if (window.game && window.game.animalManager) {
                const near = window.game.animalManager.getAnimalsNear(this.x, this.y, 200);
                for (let a of near) {
                    if (a.species === 'boar' && Math.random() < dt) {
                        if (window.game.showNotification) {
                            window.game.showNotification(`${this.name} гарчить! Поблизу небезпека!`, 'warning');
                        }
                        break;
                    }
                }
            }
        } else if (this.command === 'explore') {
            if (this.state === 'idle') {
                this.state = 'moving';
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * 200 + 100;
                this.targetX = this.x + Math.cos(angle) * dist;
                this.targetY = this.y + Math.sin(angle) * dist;
                this.stateTimer = 5;
            }
        }

        // Movement execution
        if (this.state === 'moving' && this.targetX !== null && this.targetY !== null && this.energy > 5) {
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 5) {
                this.state = 'idle';
            } else {
                const moveSpeed = this.speed * dt;
                const vx = (dx / dist) * moveSpeed;
                const vy = (dy / dist) * moveSpeed;

                const nextX = this.x + vx;
                const nextY = this.y + vy;
                
                const tx = Math.floor(nextX / tileSize);
                const ty = Math.floor(nextY / tileSize);
                
                let walkable = true;
                if (tx >= 0 && ty >= 0 && ty < worldTiles.length && tx < worldTiles[0].length) {
                    const tile = worldTiles[ty][tx];
                    if (tile === 0 || tile === 1 || tile === 5) walkable = false;
                } else { walkable = false; }
                
                if (buildings) {
                    const bx = tx * tileSize;
                    const by = ty * tileSize;
                    const bList = Array.isArray(buildings) ? buildings : (buildings.buildings || []);
                    for (let b of bList) {
                        const bdb = window.BUILDING_DB[b.type];
                        if (bdb && !bdb.passable) {
                            if (bx < b.x + bdb.width/2 && bx + tileSize > b.x - bdb.width/2 &&
                                by < b.y + bdb.height/2 && by + tileSize > b.y - bdb.height/2) {
                                walkable = false;
                            }
                        }
                    }
                }

                if (walkable) {
                    this.x = nextX;
                    this.y = nextY;
                } else {
                    this.state = 'idle';
                    this.targetX = null;
                    this.targetY = null;
                }

                if (Math.abs(dx) > Math.abs(dy)) {
                    this.direction = dx > 0 ? 2 : 1;
                } else {
                    this.direction = dy > 0 ? 0 : 3;
                }
            }
        }
        
        if (this.stateTimer <= 0 && this.state === 'moving' && this.command !== 'follow' && this.command !== 'come') {
            this.state = 'idle';
            this.stateTimer = Math.random() * 2 + 1;
        }
    }

    draw(ctx, camera) {
        if (!camera.isVisible(this.x, this.y)) return;

        const screenPos = camera.worldToScreen(this.x, this.y);
        ctx.save();
        ctx.translate(screenPos.x, screenPos.y);
        ctx.scale(this.size, this.size);

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(0, 8, 14, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        const bounce = (this.state === 'moving') ? Math.sin(this.animFrame * Math.PI) * 2 : 0;
        ctx.translate(0, -bounce);

        if (this.direction === 1) {
            ctx.scale(-1, 1);
        }

        // Use animal's dog drawing method
        const dummyAnim = new Animal('wild_dog', 0, 0);
        dummyAnim.direction = this.direction;
        dummyAnim.animFrame = this.animFrame;
        dummyAnim.animTimer = this.animTimer;
        dummyAnim.state = (this.state === 'moving') ? 'wander' : 'idle';
        
        dummyAnim.drawDog(ctx, this.colorIndex, true);

        ctx.restore();

        // Draw nameplate
        ctx.save();
        ctx.translate(screenPos.x, screenPos.y - 20 * this.size);
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.strokeText(this.name, 0, 0);
        ctx.fillText(this.name, 0, 0);
        
        // Draw icon if items found
        if (this.foundItems.length > 0) {
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(15, -5, 4, 0, Math.PI*2);
            ctx.fill();
            ctx.stroke();
        }
        
        if (this.command === 'rest') {
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.fillText('Z', 10, -15);
        }
        
        ctx.restore();
    }

    serialize() {
        return {
            id: this.id,
            name: this.name,
            x: this.x,
            y: this.y,
            colorIndex: this.colorIndex,
            size: this.size,
            health: this.health,
            hunger: this.hunger,
            energy: this.energy,
            trust: this.trust,
            level: this.level,
            xp: this.xp,
            xpToNext: this.xpToNext,
            command: this.command,
            personality: this.personality,
            foundItems: this.foundItems
        };
    }

    static deserialize(data) {
        const dog = new DogCompanion(data.x, data.y, data.colorIndex, data.name, data.id);
        dog.size = data.size || dog.size;
        dog.health = data.health;
        dog.hunger = data.hunger;
        dog.energy = data.energy;
        dog.trust = data.trust;
        dog.level = data.level;
        dog.xp = data.xp;
        dog.xpToNext = data.xpToNext;
        dog.command = data.command;
        dog.personality = data.personality || dog.personality;
        dog.foundItems = data.foundItems || [];
        return dog;
    }
};

window.AnimalManager = class AnimalManager {
    constructor() {
        this.animals = [];
        this.dogs = [];
        this.spawnTimer = 0;
    }

    init(worldTiles, tileSize, worldW, worldH) {
        this.animals = [];
        
        const spawnTarget = {
            rabbit: getRandomInt(8, 12),
            turtle: getRandomInt(4, 6),
            parrot: getRandomInt(3, 5),
            boar: getRandomInt(2, 3),
            wild_dog: getRandomInt(3, 4)
        };

        for (let species in spawnTarget) {
            let count = spawnTarget[species];
            for (let i = 0; i < count; i++) {
                this.spawnAnimal(species, worldTiles, tileSize, worldW, worldH);
            }
        }
    }

    spawnAnimal(species, worldTiles, tileSize, worldW, worldH) {
        let spawned = false;
        let attempts = 0;
        
        while (!spawned && attempts < 100) {
            attempts++;
            const tx = getRandomInt(0, worldW - 1);
            const ty = getRandomInt(0, worldH - 1);
            const tile = worldTiles[ty][tx];
            
            let valid = false;
            if (species === 'rabbit' && tile === 3) valid = true; // grass
            if (species === 'turtle' && (tile === 2 || tile === 1)) valid = true; // beach/shallow
            if (species === 'parrot' && tile === 4) valid = true; // jungle
            if (species === 'boar' && (tile === 4 || tile === 3)) valid = true; // jungle/grass
            if (species === 'wild_dog' && tile === 3) valid = true; // grass
            
            if (valid) {
                const wx = tx * tileSize + tileSize/2;
                const wy = ty * tileSize + tileSize/2;
                this.animals.push(new window.Animal(species, wx, wy));
                spawned = true;
            }
        }
    }

    update(dt, playerX, playerY, worldTiles, tileSize, resources, buildings, worldW, worldH) {
        for (let i = this.animals.length - 1; i >= 0; i--) {
            const a = this.animals[i];
            a.update(dt, playerX, playerY, worldTiles, tileSize, buildings);
            if (a.health <= 0) {
                // Drop loot maybe, but not specified in requirements for animal drops
                this.animals.splice(i, 1);
            }
        }

        for (let dog of this.dogs) {
            dog.update(dt, playerX, playerY, worldTiles, tileSize, resources, buildings);
        }
        
        // Respawning logic
        this.spawnTimer += dt;
        if (this.spawnTimer > 300) { // Every 5 game minutes
            this.spawnTimer = 0;
            if (this.animals.length < 15 && worldW && worldH) {
                const speciesList = ['rabbit', 'turtle', 'parrot', 'boar', 'wild_dog'];
                const sp = speciesList[Math.floor(Math.random() * speciesList.length)];
                this.spawnAnimal(sp, worldTiles, tileSize, worldW, worldH);
            }
        }
    }

    getNearestInteractable(px, py, radius) {
        let nearest = null;
        let minDist = radius;

        for (let a of this.animals) {
            const d = a.distanceTo(px, py);
            if (d < minDist) {
                minDist = d;
                nearest = a;
            }
        }

        for (let d of this.dogs) {
            const dist = distance(d.x, d.y, px, py);
            if (dist < minDist) {
                minDist = dist;
                nearest = d;
            }
        }

        return nearest;
    }

    getAnimalsNear(x, y, radius) {
        const res = [];
        for (let a of this.animals) {
            if (a.distanceTo(x, y) <= radius) res.push(a);
        }
        return res;
    }

    tameDog(animalId, name) {
        const index = this.animals.findIndex(a => a.id === animalId && a.species === 'wild_dog');
        if (index !== -1) {
            const a = this.animals[index];
            this.animals.splice(index, 1);
            const dog = new window.DogCompanion(a.x, a.y, a.colorIndex, name);
            dog.trust = a.trust;
            this.dogs.push(dog);
            return dog;
        }
        return null;
    }

    serialize() {
        return {
            spawnTimer: this.spawnTimer,
            animals: this.animals.map(a => a.serialize()),
            dogs: this.dogs.map(d => d.serialize())
        };
    }

    static deserialize(data) {
        const am = new AnimalManager();
        am.spawnTimer = data.spawnTimer || 0;
        if (data.animals) {
            am.animals = data.animals.map(aData => window.Animal.deserialize(aData));
        }
        if (data.dogs) {
            am.dogs = data.dogs.map(dData => window.DogCompanion.deserialize(dData));
        }
        return am;
    }
};

})();
