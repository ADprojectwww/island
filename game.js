// game.js

// --- Simple Value Noise for Procedural Generation ---
class ValueNoise {
    constructor(seed = Math.random()) {
        this.seed = seed;
        this.r = [];
        let s = seed;
        const random = () => {
            s = Math.sin(s) * 10000;
            return s - Math.floor(s);
        };
        for (let i = 0; i < 256; i++) {
            this.r[i] = Math.floor(random() * 256);
        }
    }
    noise(x, y) {
        let xi = Math.floor(x) & 255;
        let yi = Math.floor(y) & 255;
        let xf = x - Math.floor(x);
        let yf = y - Math.floor(y);
        let rxf = xf * xf * (3.0 - 2.0 * xf);
        let ryf = yf * yf * (3.0 - 2.0 * yf);
        
        let hash = (nx, ny) => this.r[(this.r[nx] + ny) & 255] / 255.0;
        
        let c00 = hash(xi, yi);
        let c10 = hash((xi + 1) & 255, yi);
        let c01 = hash(xi, (yi + 1) & 255);
        let c11 = hash((xi + 1) & 255, (yi + 1) & 255);
        
        let nx0 = c00 * (1 - rxf) + c10 * rxf;
        let nx1 = c01 * (1 - rxf) + c11 * rxf;
        
        return nx0 * (1 - ryf) + nx1 * ryf;
    }
    octaveNoise(x, y, octaves, persistence) {
        let total = 0;
        let frequency = 1;
        let amplitude = 1;
        let maxVal = 0;
        for (let i = 0; i < octaves; i++) {
            total += this.noise(x * frequency, y * frequency) * amplitude;
            maxVal += amplitude;
            amplitude *= persistence;
            frequency *= 2;
        }
        return total / maxVal;
    }
}

// --- Particle System ---
class ParticleSystem {
    constructor() {
        this.particles = [];
    }
    emit(x, y, vx, vy, color, size, life) {
        this.particles.push({ x, y, vx, vy, color, size, life, maxLife: life });
    }
    update(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= dt;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    draw(ctx, camera) {
        ctx.save();
        for (let p of this.particles) {
            let sx = p.x - camera.x + camera.width / 2;
            let sy = p.y - camera.y + camera.height / 2;
            ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(sx, sy, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}

// --- Input Manager ---
class InputManager {
    constructor(canvas) {
        this.keys = {};
        this.prevKeys = {};
        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseWorldX = 0;
        this.mouseWorldY = 0;
        this.clicked = false;
        this.touches = [];
        this.joystickActive = false;
        this.joystickBase = { x: 80, y: window.innerHeight - 80 };
        this.joystickPos = { x: 80, y: window.innerHeight - 80 };
        this.joystickDir = { x: 0, y: 0 };
        this.actionClicked = false;
        
        window.addEventListener('keydown', e => {
            this.keys[e.key.toLowerCase()] = true;
            this.keys[e.code] = true;
        });
        window.addEventListener('keyup', e => {
            this.keys[e.key.toLowerCase()] = false;
            this.keys[e.code] = false;
        });
        window.addEventListener('mousemove', e => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
        window.addEventListener('mousedown', e => {
            this.clicked = true;
        });
        window.addEventListener('mouseup', e => {
            this.clicked = false;
        });

        // Touch support
        if ('ontouchstart' in window) {
            window.addEventListener('touchstart', this.handleTouch.bind(this), { passive: false });
            window.addEventListener('touchmove', this.handleTouch.bind(this), { passive: false });
            window.addEventListener('touchend', this.handleTouch.bind(this), { passive: false });
        }
    }
    handleTouch(e) {
        e.preventDefault();
        this.joystickActive = false;
        this.joystickDir = { x: 0, y: 0 };
        this.actionClicked = false;
        
        for (let i = 0; i < e.touches.length; i++) {
            let t = e.touches[i];
            if (t.clientX < window.innerWidth / 2) {
                this.joystickActive = true;
                let dx = t.clientX - this.joystickBase.x;
                let dy = t.clientY - this.joystickBase.y;
                let dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > 40) {
                    this.joystickPos.x = this.joystickBase.x + (dx / dist) * 40;
                    this.joystickPos.y = this.joystickBase.y + (dy / dist) * 40;
                } else {
                    this.joystickPos.x = t.clientX;
                    this.joystickPos.y = t.clientY;
                }
                if (dist > 5) {
                    this.joystickDir.x = dx / dist;
                    this.joystickDir.y = dy / dist;
                }
            } else {
                this.actionClicked = true;
            }
            this.mouseX = t.clientX;
            this.mouseY = t.clientY;
            this.clicked = true;
        }
        if (e.touches.length === 0) {
            this.clicked = false;
        }
    }
    isDown(key) {
        let k = key.toLowerCase();
        return !!this.keys[k] || !!this.keys[key];
    }
    wasPressed(key) {
        if (key === 'e' && this.actionClicked) {
            this.actionClicked = false;
            return true;
        }
        let k = key.toLowerCase();
        let pressed = (!!this.keys[k] && !this.prevKeys[k]) || (!!this.keys[key] && !this.prevKeys[key]);
        if (!pressed && k === 'e') {
            pressed = (!!this.keys['KeyE'] && !this.prevKeys['KeyE']) ||
                      (!!this.keys['у'] && !this.prevKeys['у']) ||
                      (!!this.keys['У'] && !this.prevKeys['У']);
        }
        return pressed;
    }
    update() {
        for (let k in this.keys) {
            this.prevKeys[k] = this.keys[k];
        }
    }
    updateMouseWorld(camera) {
        let w = camera.screenToWorld(this.mouseX, this.mouseY);
        this.mouseWorldX = w.x;
        this.mouseWorldY = w.y;
    }
    getMovement() {
        let x = 0;
        let y = 0;
        if (this.isDown('w') || this.isDown('arrowup') || this.isDown('KeyW') || this.isDown('ц') || this.isDown('Ц')) y -= 1;
        if (this.isDown('s') || this.isDown('arrowdown') || this.isDown('KeyS') || this.isDown('і') || this.isDown('І') || this.isDown('ы')) y += 1;
        if (this.isDown('a') || this.isDown('arrowleft') || this.isDown('KeyA') || this.isDown('ф') || this.isDown('Ф')) x -= 1;
        if (this.isDown('d') || this.isDown('arrowright') || this.isDown('KeyD') || this.isDown('в') || this.isDown('В')) x += 1;
        
        if (this.joystickActive) {
            x += this.joystickDir.x;
            y += this.joystickDir.y;
        }
        
        let len = Math.sqrt(x * x + y * y);
        if (len > 0) {
            x /= len;
            y /= len;
        }
        return { x, y };
    }
    drawJoystick(ctx) {
        if (!('ontouchstart' in window)) return;
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.joystickBase.x, this.joystickBase.y, 50, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.stroke();
        
        if (!this.joystickActive) {
            this.joystickPos = { ...this.joystickBase };
        }
        ctx.beginPath();
        ctx.arc(this.joystickPos.x, this.joystickPos.y, 25, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(window.innerWidth - 80, window.innerHeight - 80, 40, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 152, 0, 0.5)';
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('ДІЯ', window.innerWidth - 80, window.innerHeight - 80);
        
        ctx.restore();
    }
}

// --- Camera ---
class Camera {
    constructor(canvasWidth, canvasHeight) {
        this.x = 0;
        this.y = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.width = canvasWidth;
        this.height = canvasHeight;
        this.zoom = 1;
        this.smoothing = 0.08;
    }
    follow(tx, ty, dt) {
        this.targetX = tx;
        this.targetY = ty;
        let lerp = (a, b, t) => a + (b - a) * t;
        let f = 1.0 - Math.pow(1.0 - this.smoothing, dt * 60);
        this.x = lerp(this.x, this.targetX, f);
        this.y = lerp(this.y, this.targetY, f);
    }
    worldToScreen(wx, wy) {
        return {
            x: (wx - this.x) * this.zoom + this.width / 2,
            y: (wy - this.y) * this.zoom + this.height / 2
        };
    }
    screenToWorld(sx, sy) {
        return {
            x: (sx - this.width / 2) / this.zoom + this.x,
            y: (sy - this.height / 2) / this.zoom + this.y
        };
    }
    isVisible(wx, wy, margin = 64) {
        return wx >= this.x - this.width / (2 * this.zoom) - margin &&
               wx <= this.x + this.width / (2 * this.zoom) + margin &&
               wy >= this.y - this.height / (2 * this.zoom) - margin &&
               wy <= this.y + this.height / (2 * this.zoom) + margin;
    }
    resize(w, h) {
        this.width = w;
        this.height = h;
    }
    getViewBounds() {
        return {
            left: this.x - this.width / (2 * this.zoom),
            right: this.x + this.width / (2 * this.zoom),
            top: this.y - this.height / (2 * this.zoom),
            bottom: this.y + this.height / (2 * this.zoom)
        };
    }
}

// --- Player ---
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 24;
        this.height = 24;
        this.speed = 120;
        this.health = 100;
        this.maxHealth = 100;
        this.hunger = 100;
        this.maxHunger = 100;
        this.thirst = 100;
        this.maxThirst = 100;
        this.energy = 100;
        this.maxEnergy = 100;
        this.level = 1;
        this.xp = 0;
        this.xpToNext = 100;
        this.direction = 0;
        this.moving = false;
        this.equippedTool = null;
        this.animFrame = 0;
        this.animTimer = 0;
        this.interactTarget = null;
        this.inventory = window.Inventory ? new window.Inventory(30) : null;
    }
    update(dt, input, world, buildingSystem) {
        let mov = input.getMovement();
        this.moving = (mov.x !== 0 || mov.y !== 0);
        
        if (this.moving) {
            if (Math.abs(mov.x) > Math.abs(mov.y)) {
                this.direction = mov.x < 0 ? 1 : 2;
            } else {
                this.direction = mov.y < 0 ? 3 : 0;
            }
            
            let nx = this.x + mov.x * this.speed * dt;
            let ny = this.y + mov.y * this.speed * dt;
            
            if (world.isWalkable(nx, this.y, this.width, this.height, buildingSystem, this.x, this.y)) {
                this.x = nx;
            }
            if (world.isWalkable(this.x, ny, this.width, this.height, buildingSystem, this.x, this.y)) {
                this.y = ny;
            }
            
            this.animTimer += dt * 10;
            if (this.animTimer > 1) {
                this.animTimer = 0;
                this.animFrame = (this.animFrame + 1) % 4;
            }
            
            this.energy -= dt * 0.5;
        } else {
            this.animFrame = 0;
            this.energy += dt * 1.5;
        }
        
        // Prevent player from ever being stuck inside solid buildings
        if (buildingSystem) {
            let rects = buildingSystem.getCollisionRects();
            for (let r of rects) {
                if (!r.passable) {
                    let halfW = r.w / 2 + this.width / 2;
                    let halfH = r.h / 2 + this.height / 2;
                    let dx = this.x - r.x;
                    let dy = this.y - r.y;
                    if (Math.abs(dx) < halfW && Math.abs(dy) < halfH) {
                        let overlapX = halfW - Math.abs(dx);
                        let overlapY = halfH - Math.abs(dy);
                        if (overlapX < overlapY) {
                            this.x += (dx >= 0 ? overlapX : -overlapX);
                        } else {
                            this.y += (dy >= 0 ? overlapY : -overlapY);
                        }
                    }
                }
            }
        }
        
        this.energy = Math.max(0, Math.min(this.maxEnergy, this.energy));
    }
    draw(ctx, camera) {
        let pos = camera.worldToScreen(this.x, this.y);
        ctx.save();
        ctx.translate(pos.x, pos.y);
        
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(0, this.height/2, this.width/2, this.width/4, 0, 0, Math.PI*2);
        ctx.fill();

        ctx.fillStyle = '#1565C0';
        ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
        
        ctx.fillStyle = '#FFB74D';
        ctx.beginPath();
        ctx.arc(0, -this.height/2 - 5, 10, 0, Math.PI*2);
        ctx.fill();

        if (this.equippedTool) {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 3;
            ctx.beginPath();
            if (this.direction === 2) {
                ctx.moveTo(10, 0); ctx.lineTo(25, -10);
            } else if (this.direction === 1) {
                ctx.moveTo(-10, 0); ctx.lineTo(-25, -10);
            } else if (this.direction === 0) {
                ctx.moveTo(10, 0); ctx.lineTo(20, 10);
            } else {
                ctx.moveTo(-10, -this.height/2); ctx.lineTo(-10, -this.height/2 - 15);
            }
            ctx.stroke();
        }

        ctx.restore();
    }
    getRect() {
        return { x: this.x - this.width/2, y: this.y - this.height/2, w: this.width, h: this.height };
    }
    addXP(amount) {
        this.xp += amount;
        if (window.game) window.game.showNotification(`+${amount} XP`, 'info');
        this.checkLevelUp();
    }
    checkLevelUp() {
        if (!this.xpToNext || this.xpToNext <= 0 || isNaN(this.xpToNext)) this.xpToNext = 100;
        let safety = 0;
        while (this.xp >= this.xpToNext && safety < 50) {
            safety++;
            this.xp -= this.xpToNext;
            this.level++;
            this.xpToNext = Math.floor(this.xpToNext * 1.5);
            this.maxHealth += 10;
            this.maxEnergy += 10;
            this.health = this.maxHealth;
            this.energy = this.maxEnergy;
            if (window.game) {
                window.game.showNotification(`Рівень підвищено: ${this.level}!`, 'success');
                window.game.spawnParticles(this.x, this.y, '#FFD700', 30);
            }
        }
    }
    serialize() {
        return {
            x: this.x, y: this.y,
            health: this.health, maxHealth: this.maxHealth,
            hunger: this.hunger, maxHunger: this.maxHunger,
            thirst: this.thirst, maxThirst: this.maxThirst,
            energy: this.energy, maxEnergy: this.maxEnergy,
            level: this.level, xp: this.xp, xpToNext: this.xpToNext,
            equippedTool: this.equippedTool,
            inventory: this.inventory ? this.inventory.serialize() : null
        };
    }
    static deserialize(data) {
        let p = new Player(data.x, data.y);
        p.health = data.health; p.maxHealth = data.maxHealth;
        p.hunger = data.hunger; p.maxHunger = data.maxHunger;
        p.thirst = data.thirst; p.maxThirst = data.maxThirst;
        p.energy = data.energy; p.maxEnergy = data.maxEnergy;
        p.level = data.level; p.xp = data.xp; p.xpToNext = data.xpToNext;
        p.equippedTool = data.equippedTool;
        if (data.inventory && window.Inventory) {
            p.inventory = window.Inventory.deserialize(data.inventory, 30);
        }
        return p;
    }
}

// --- World ---
class World {
    constructor(width, height, tileSize) {
        this.width = width;
        this.height = height;
        this.tileSize = tileSize;
        this.tiles = [];
        this.resources = [];
        this.droppedItems = [];
        this.nextResourceId = 0;
        this.nextDroppedId = 0;
        this.noise = new ValueNoise(0.5);
    }
    generate() {
        this.tiles = new Array(this.height).fill(0).map(() => new Array(this.width).fill(0));
        let centerX = this.width / 2;
        let centerY = this.height / 2;
        let maxDist = Math.min(centerX, centerY) - 5;

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                let dx = x - centerX;
                let dy = y - centerY;
                let dist = Math.sqrt(dx * dx + dy * dy);
                
                let n = this.noise.octaveNoise(x * 0.05, y * 0.05, 4, 0.5);
                let edgeFalloff = Math.max(0, 1 - (dist / maxDist));
                let val = (n * 0.5 + 0.5) * edgeFalloff;

                let type = 0;
                if (val > 0.7) type = 5;       
                else if (val > 0.5) type = 4;  
                else if (val > 0.3) type = 3;  
                else if (val > 0.15) type = 2; 
                else if (val > 0.05) type = 1; 
                else type = 0;                 

                this.tiles[y][x] = type;

                if (Math.random() < 0.05) {
                    let rType = null;
                    if (type === 2) rType = (Math.random() < 0.5) ? 'palm' : 'coconut_palm';
                    else if (type === 3) {
                        let rr = Math.random();
                        if (rr < 0.3) rType = 'tree';
                        else if (rr < 0.5) rType = 'bush';
                        else if (rr < 0.7) rType = 'branch_pile';
                        else if (rr < 0.9) rType = 'fiber_plant';
                        else rType = 'rock_node';
                    }
                    else if (type === 4) {
                        let rr = Math.random();
                        if (rr < 0.5) rType = 'tree';
                        else if (rr < 0.7) rType = 'berry_bush';
                        else if (rr < 0.9) rType = 'mushroom_spot';
                        else rType = 'fiber_plant';
                    }
                    else if (type === 5) {
                        rType = 'rock_node';
                    }

                    if (rType) {
                        this.resources.push({
                            id: 'res_' + this.nextResourceId++,
                            type: rType,
                            x: x * this.tileSize + this.tileSize/2 + (Math.random() * 10 - 5),
                            y: y * this.tileSize + this.tileSize/2 + (Math.random() * 10 - 5),
                            health: 100,
                            maxHealth: 100,
                            respawnTime: this.getRespawnTime(rType),
                            depleted: false,
                            depletedAt: 0
                        });
                    }
                }
            }
        }
    }
    getRespawnTime(type) {
        const times = {
            'branch_pile': 120, 'tree': 300, 'palm': 300, 'coconut_palm': 200,
            'rock_node': 240, 'bush': 150, 'fiber_plant': 120, 'berry_bush': 180, 'mushroom_spot': 200
        };
        return times[type] || 200;
    }
    getTile(tx, ty) {
        if (tx < 0 || tx >= this.width || ty < 0 || ty >= this.height) return 0;
        return this.tiles[ty][tx];
    }
    getTileAtWorld(wx, wy) {
        let tx = Math.floor(wx / this.tileSize);
        let ty = Math.floor(wy / this.tileSize);
        return this.getTile(tx, ty);
    }
    isWalkable(wx, wy, pw, ph, buildingSystem, currentX, currentY) {
        let tx = Math.floor(wx / this.tileSize);
        let ty = Math.floor(wy / this.tileSize);
        let tType = this.getTile(tx, ty);
        if (tType === 0 || tType === 1) return false; 

        if (buildingSystem) {
            let rects = buildingSystem.getCollisionRects();
            for (let r of rects) {
                if (!r.passable) {
                    let collides = (wx + pw/2 > r.x - r.w/2 && wx - pw/2 < r.x + r.w/2 &&
                                   wy + ph/2 > r.y - r.h/2 && wy - ph/2 < r.y + r.h/2);
                    if (collides) {
                        // Unstuck tolerance: if the player was already overlapping this obstacle,
                        // allow movement if it increases distance from obstacle center (moving away)
                        if (currentX !== undefined && currentY !== undefined) {
                            let currCollides = (currentX + pw/2 > r.x - r.w/2 && currentX - pw/2 < r.x + r.w/2 &&
                                               currentY + ph/2 > r.y - r.h/2 && currentY - ph/2 < r.y + r.h/2);
                            if (currCollides) {
                                let currDist = Math.hypot(currentX - r.x, currentY - r.y);
                                let newDist = Math.hypot(wx - r.x, wy - r.y);
                                if (newDist >= currDist) {
                                    continue; // Moving away / escaping is allowed
                                }
                            }
                        }
                        return false;
                    }
                }
            }
        }
        return true;
    }
    isWater(wx, wy) {
        let t = this.getTileAtWorld(wx, wy);
        return t === 0 || t === 1;
    }
    getResourcesNear(x, y, radius) {
        return this.resources.filter(r => !r.depleted && Math.hypot(r.x - x, r.y - y) <= radius);
    }
    harvestResource(resourceId, toolType) {
        let res = this.resources.find(r => r.id === resourceId);
        if (!res || res.depleted) return { items: [], depleted: false, message: 'Ресурс порожній' };

        let needsAxe = ['tree', 'palm'].includes(res.type);
        if (needsAxe && toolType !== 'axe') {
            return { items: [], depleted: false, message: 'Потрібна сокира!' };
        }

        res.health -= 50; 
        if (res.health <= 0) {
            res.depleted = true;
            res.depletedAt = window.game ? window.game.timeSystem.totalTime : 0;
            let items = [];
            switch(res.type) {
                case 'branch_pile': items.push({id:'branch', count: Math.floor(Math.random()*2)+2}); break;
                case 'tree': items.push({id:'wood', count: 2}, {id:'branch', count: 1}); break;
                case 'palm': items.push({id:'wood', count: 1}, {id:'coconut', count: 1}); break;
                case 'coconut_palm': items.push({id:'coconut', count: 2}); break;
                case 'rock_node': items.push({id:'stone', count: Math.floor(Math.random()*2)+2}); break;
                case 'bush': items.push({id:'fiber', count: 3}); break;
                case 'fiber_plant': items.push({id:'fiber', count: 2}); break;
                case 'berry_bush': items.push({id:'berry', count: 3}); break;
                case 'mushroom_spot': items.push({id:'mushroom', count: 2}); break;
            }
            return { items, depleted: true, message: 'Зібрано!' };
        }
        return { items: [], depleted: false, message: '' };
    }
    addDroppedItem(itemId, count, x, y) {
        let item = { id: 'drop_' + this.nextDroppedId++, itemId, count, x, y };
        this.droppedItems.push(item);
        return item;
    }
    removeDroppedItem(droppedId) {
        this.droppedItems = this.droppedItems.filter(i => i.id !== droppedId);
    }
    getDroppedItemsNear(x, y, radius) {
        return this.droppedItems.filter(i => Math.hypot(i.x - x, i.y - y) <= radius);
    }
    update(dt, totalTime) {
        for (let r of this.resources) {
            if (r.depleted && totalTime - r.depletedAt >= r.respawnTime) {
                r.depleted = false;
                r.health = r.maxHealth;
            }
        }
    }
    drawTerrain(ctx, camera) {
        let bounds = camera.getViewBounds();
        let startX = Math.max(0, Math.floor(bounds.left / this.tileSize));
        let startY = Math.max(0, Math.floor(bounds.top / this.tileSize));
        let endX = Math.min(this.width - 1, Math.ceil(bounds.right / this.tileSize));
        let endY = Math.min(this.height - 1, Math.ceil(bounds.bottom / this.tileSize));
        
        let tTime = window.game ? window.game.timeSystem.totalTime : 0;
        let waveOffset = Math.sin(tTime) * 2;

        for (let y = startY; y <= endY; y++) {
            for (let x = startX; x <= endX; x++) {
                let type = this.tiles[y][x];
                let px = x * this.tileSize;
                let py = y * this.tileSize;
                
                let sx = px - camera.x + camera.width / 2;
                let sy = py - camera.y + camera.height / 2;

                ctx.fillStyle = '#000';
                switch(type) {
                    case 0: ctx.fillStyle = '#006994'; break;
                    case 1: ctx.fillStyle = '#48CAE4'; break;
                    case 2: ctx.fillStyle = '#F4D03F'; break;
                    case 3: ctx.fillStyle = '#27AE60'; break;
                    case 4: ctx.fillStyle = '#1B5E20'; break;
                    case 5: ctx.fillStyle = '#7F8C8D'; break;
                }
                
                let varSeed = (x * 37 + y * 13) % 20;
                
                if (type === 0 || type === 1) { 
                    ctx.globalAlpha = 0.9 + Math.sin(tTime*2 + x) * 0.1;
                    ctx.fillRect(Math.floor(sx), Math.floor(sy + waveOffset), this.tileSize+1, this.tileSize+1);
                    ctx.globalAlpha = 1.0;
                } else {
                    ctx.fillRect(Math.floor(sx), Math.floor(sy), this.tileSize+1, this.tileSize+1);
                    if (type === 2 && varSeed < 2) { 
                        ctx.fillStyle = '#D4AC0D';
                        ctx.fillRect(Math.floor(sx)+5, Math.floor(sy)+5, 2, 2);
                    }
                    if (type === 3 && varSeed < 4) { 
                        ctx.fillStyle = '#1E8449';
                        ctx.fillRect(Math.floor(sx)+4, Math.floor(sy)+4, 2, 4);
                    }
                    if (type === 4 && varSeed < 5) { 
                        ctx.fillStyle = '#2E7D32';
                        ctx.fillRect(Math.floor(sx)+2, Math.floor(sy)+2, 4, 4);
                    }
                    if (type === 5 && varSeed < 3) { 
                        ctx.fillStyle = '#95A5A6';
                        ctx.fillRect(Math.floor(sx)+10, Math.floor(sy)+10, 6, 2);
                    }
                }
            }
        }
    }
    drawResources(ctx, camera) {
        for (let r of this.resources) {
            if (r.depleted) {
                if (r.type === 'tree' || r.type === 'palm') {
                    if (camera.isVisible(r.x, r.y)) {
                        let pos = camera.worldToScreen(r.x, r.y);
                        ctx.fillStyle = '#6B3410';
                        ctx.beginPath(); ctx.arc(pos.x, pos.y, 6, 0, Math.PI*2); ctx.fill();
                    }
                }
                continue;
            }
            if (!camera.isVisible(r.x, r.y)) continue;
            let pos = camera.worldToScreen(r.x, r.y);
            ctx.save();
            ctx.translate(pos.x, pos.y);
            
            if (r.type === 'tree') {
                ctx.fillStyle = '#8B4513'; ctx.fillRect(-4, -10, 8, 20); 
                ctx.fillStyle = '#2ECC71'; ctx.beginPath(); ctx.arc(0, -15, 15, 0, Math.PI*2); ctx.fill(); 
                ctx.fillStyle = '#1E8449'; ctx.beginPath(); ctx.arc(5, -18, 10, 0, Math.PI*2); ctx.fill(); 
            } else if (r.type === 'palm' || r.type === 'coconut_palm') {
                ctx.fillStyle = '#A0522D'; ctx.beginPath(); ctx.moveTo(-3, 10); ctx.quadraticCurveTo(5, -5, -3, -15); ctx.lineTo(3, -15); ctx.quadraticCurveTo(10, -5, 3, 10); ctx.fill();
                ctx.fillStyle = '#27AE60'; 
                for(let a=0; a<Math.PI*2; a+=Math.PI/2) {
                    ctx.beginPath(); ctx.ellipse(Math.cos(a)*10, -15+Math.sin(a)*10, 15, 4, a, 0, Math.PI*2); ctx.fill();
                }
                if (r.type === 'coconut_palm') {
                    ctx.fillStyle = '#8B4513';
                    ctx.beginPath(); ctx.arc(-5, -12, 4, 0, Math.PI*2); ctx.fill();
                    ctx.beginPath(); ctx.arc(5, -12, 4, 0, Math.PI*2); ctx.fill();
                }
            } else if (r.type === 'rock_node') {
                ctx.fillStyle = '#BDC3C7';
                ctx.beginPath(); ctx.moveTo(-10, 5); ctx.lineTo(-5, -8); ctx.lineTo(5, -10); ctx.lineTo(12, 0); ctx.lineTo(8, 8); ctx.lineTo(-8, 8); ctx.fill();
            } else if (r.type === 'bush') {
                ctx.fillStyle = '#2ECC71';
                ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI*2); ctx.fill();
                ctx.beginPath(); ctx.arc(-5, 5, 8, 0, Math.PI*2); ctx.fill();
                ctx.beginPath(); ctx.arc(5, 5, 8, 0, Math.PI*2); ctx.fill();
            } else if (r.type === 'berry_bush') {
                ctx.fillStyle = '#27AE60';
                ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = '#E74C3C'; 
                ctx.beginPath(); ctx.arc(-3, -3, 2, 0, Math.PI*2); ctx.fill();
                ctx.beginPath(); ctx.arc(4, 2, 2, 0, Math.PI*2); ctx.fill();
                ctx.beginPath(); ctx.arc(0, 5, 2, 0, Math.PI*2); ctx.fill();
            } else if (r.type === 'mushroom_spot') {
                ctx.fillStyle = '#E5E7E9'; ctx.fillRect(-2, -5, 4, 10); 
                ctx.fillStyle = '#A04000'; ctx.beginPath(); ctx.arc(0, -6, 6, Math.PI, 0); ctx.fill(); 
            } else if (r.type === 'branch_pile') {
                ctx.strokeStyle = '#6B3410'; ctx.lineWidth = 3;
                ctx.beginPath(); ctx.moveTo(-8, -5); ctx.lineTo(8, 5); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(6, -6); ctx.lineTo(-6, 6); ctx.stroke();
            } else if (r.type === 'fiber_plant') {
                ctx.strokeStyle = '#2ECC71'; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.moveTo(0, 10); ctx.quadraticCurveTo(5, 0, 8, -10); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(0, 10); ctx.quadraticCurveTo(-5, 0, -8, -8); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(0, 10); ctx.lineTo(0, -12); ctx.stroke();
            }
            
            ctx.restore();
        }
    }
    drawDroppedItems(ctx, camera) {
        for (let item of this.droppedItems) {
            if (!camera.isVisible(item.x, item.y)) continue;
            let pos = camera.worldToScreen(item.x, item.y);
            
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.arc(pos.x, pos.y, 6, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = '#000'; ctx.lineWidth = 1; ctx.stroke();
            
            if (window.ITEM_DB && window.ITEM_DB[item.itemId]) {
                let cat = window.ITEM_DB[item.itemId].category;
                if (cat === 'food') ctx.fillStyle = '#E74C3C';
                else if (cat === 'resource') ctx.fillStyle = '#8B4513';
                else if (cat === 'tool') ctx.fillStyle = '#95A5A6';
                else ctx.fillStyle = '#F1C40F';
                ctx.beginPath(); ctx.arc(pos.x, pos.y, 4, 0, Math.PI*2); ctx.fill();
            }
        }
    }
    serialize() {
        return {
            tiles: this.tiles,
            resources: this.resources,
            droppedItems: this.droppedItems,
            nextResourceId: this.nextResourceId,
            nextDroppedId: this.nextDroppedId,
            seed: this.noise.seed
        };
    }
    static deserialize(data, width, height, tileSize) {
        let w = new World(width, height, tileSize);
        w.tiles = data.tiles;
        w.resources = data.resources;
        w.droppedItems = data.droppedItems;
        w.nextResourceId = data.nextResourceId;
        w.nextDroppedId = data.nextDroppedId;
        w.noise = new ValueNoise(data.seed || 0.5);
        return w;
    }
}

// --- Main Game Orchestrator ---
class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        if (!this.canvas) {
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'game-canvas';
            document.getElementById('game-container').appendChild(this.canvas);
        }
        this.ctx = this.canvas.getContext('2d');
        this.input = new InputManager(this.canvas);
        this.camera = new Camera(window.innerWidth, window.innerHeight);
        this.particles = new ParticleSystem();
        
        this.paused = false;
        this.running = false;
        this.buildMode = false;
        this.selectedBuilding = null;
        this.lastTime = 0;
        
        this.worldWidth = 120;
        this.worldHeight = 120;
        this.tileSize = 32;

        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.camera.resize(window.innerWidth, window.innerHeight);
        });
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.systemsLoaded = !!(window.TimeSystem && window.WeatherSystem && window.SurvivalSystem && window.BuildingSystem && window.CraftingSystem && window.QuestSystem && window.EventSystem);
    }
    
    init() {
        this.world = new World(this.worldWidth, this.worldHeight, this.tileSize);
        this.world.generate();
        
        let cx = this.worldWidth / 2 * this.tileSize;
        let cy = this.worldHeight / 2 * this.tileSize;
        for (let r = 0; r < 20; r++) {
            let tx = Math.floor(this.worldWidth/2) + r;
            let ty = Math.floor(this.worldHeight/2);
            let t = this.world.getTile(tx, ty);
            if (t >= 2 && t <= 4) {
                cx = tx * this.tileSize;
                cy = ty * this.tileSize;
                break;
            }
        }
        
        this.player = new Player(cx, cy);
        
        if (this.systemsLoaded) {
            this.timeSystem = new window.TimeSystem();
            this.weatherSystem = new window.WeatherSystem();
            this.survivalSystem = new window.SurvivalSystem();
            this.buildingSystem = new window.BuildingSystem();
            this.craftingSystem = new window.CraftingSystem();
            this.questSystem = new window.QuestSystem();
            this.eventSystem = new window.EventSystem();
            
            this.questSystem.init();
        }
        
        if (window.AnimalManager) {
            this.animalManager = new window.AnimalManager();
            this.animalManager.init(this.world.tiles, this.tileSize, this.worldWidth, this.worldHeight);
        }
        
        if (this.player.inventory && window.ITEM_DB) {
            this.player.inventory.addItem('branch', 5);
            this.player.inventory.addItem('stone', 2);
            this.player.inventory.addItem('berry', 5);
        }
    }
    
    loadFromSave() {
        if (!window.SaveManager || !window.SaveManager.hasSave()) {
            alert('Збереження не знайдено!');
            return;
        }
        let data = window.SaveManager.load();
        if (!data) return;
        
        this.world = World.deserialize(data.world, this.worldWidth, this.worldHeight, this.tileSize);
        this.player = Player.deserialize(data.player);
        
        if (this.systemsLoaded) {
            this.timeSystem = window.TimeSystem.deserialize(data.timeSystem);
            this.weatherSystem = window.WeatherSystem.deserialize(data.weatherSystem);
            this.survivalSystem = new window.SurvivalSystem(); 
            this.buildingSystem = window.BuildingSystem.deserialize(data.buildingSystem);
            this.craftingSystem = window.CraftingSystem.deserialize(data.craftingSystem);
            this.questSystem = window.QuestSystem.deserialize(data.questSystem);
            this.eventSystem = window.EventSystem.deserialize(data.eventSystem);
        }
        
        if (window.AnimalManager && data.animalManager) {
            this.animalManager = window.AnimalManager.deserialize(data.animalManager);
        }
        
        this.showNotification('Гру завантажено', 'success');
    }
    
    start() {
        let menu = document.getElementById('main-menu');
        if (menu) {
            menu.classList.remove('active');
            menu.classList.add('hidden');
            menu.style.display = 'none';
        }
        let container = document.getElementById('game-container');
        if (container) {
            container.classList.remove('hidden');
            container.style.display = 'block';
        }
        this.running = true;
        this.paused = false;
        this.lastTime = performance.now();
        requestAnimationFrame(this.gameLoop.bind(this));
        
        if (this.autoSaveInterval) clearInterval(this.autoSaveInterval);
        this.autoSaveInterval = setInterval(() => this.saveGame(), 120000);
        updateHUD();
    }
    
    pause() {
        this.paused = true;
        let ov = document.getElementById('pause-overlay');
        if (ov) {
            ov.classList.remove('hidden');
            ov.style.display = 'flex';
        }
    }
    
    resume() {
        this.paused = false;
        let ov = document.getElementById('pause-overlay');
        if (ov) {
            ov.classList.add('hidden');
            ov.style.display = 'none';
        }
        this.lastTime = performance.now();
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    gameLoop(timestamp) {
        if (!this.running) return;
        if (this.paused) return; 
        
        let dt = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;
        if (dt > 0.1) dt = 0.1; 
        
        this.update(dt);
        this.render();
        
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    update(dt) {
        this.input.updateMouseWorld(this.camera);
        
        if (this.input.wasPressed('escape')) {
            if (this.buildMode) {
                this.exitBuildMode();
            } else {
                let openPanels = document.querySelectorAll('.panel:not(.hidden), .game-panel:not(.hidden), .modal:not(.hidden)');
                let openNonPause = Array.from(openPanels).filter(p => p.id !== 'pause-overlay');
                if (openNonPause.length > 0) {
                    openNonPause.forEach(p => {
                        p.classList.add('hidden');
                        p.style.display = 'none';
                    });
                } else if (this.paused) {
                    this.resume();
                } else {
                    this.pause();
                    return;
                }
            }
        }
        
        let panels = { 'i': 'panel-inventory', 'c': 'panel-crafting', 'b': 'panel-building', 'm': 'panel-map', 'q': 'panel-quests', 'k': 'panel-companions' };
        for (let key in panels) {
            if (this.input.wasPressed(key)) this.togglePanel(panels[key]);
        }
        
        if (this.buildMode && this.input.clicked && !this.input.joystickActive && !this.input.actionClicked) {
            if (this.input.mouseX < window.innerWidth - 200 || this.input.mouseY < window.innerHeight - 100) {
                this.placeBuildingAtMouse();
                this.input.clicked = false; 
            }
        }
        
        if (this.input.wasPressed('e')) {
            this.handleInteraction();
        }
        
        this.player.update(dt, this.input, this.world, this.buildingSystem);
        this.camera.follow(this.player.x, this.player.y, dt);
        this.particles.update(dt);
        
        if (this.systemsLoaded) {
            this.timeSystem.update(dt);
            this.weatherSystem.update(dt);
            this.world.update(dt, this.timeSystem.totalTime);
            this.buildingSystem.update(dt, this.weatherSystem, this.timeSystem.totalTime);
            
            let pStats = { health: this.player.health, hunger: this.player.hunger, thirst: this.player.thirst, energy: this.player.energy };
            this.survivalSystem.update(dt, pStats, this.weatherSystem, this.timeSystem);
            this.player.health = pStats.health;
            this.player.hunger = pStats.hunger;
            this.player.thirst = pStats.thirst;
            this.player.energy = pStats.energy;
            
            if (this.player.health <= 0) {
                alert("Ви загинули! Гра закінчена.");
                this.running = false;
                window.location.reload();
            }
            
            let event = this.eventSystem.update(dt, { totalTime: this.timeSystem.totalTime, day: this.timeSystem.day, weather: this.weatherSystem.current, player: this.player, buildings: this.buildingSystem.buildings });
            if (event) {
                this.showNotification(`Подія: ${event.type}`, 'info');
            }
            
            this.craftingSystem.updateAvailability(this.buildingSystem.buildings);
            
            let qState = { inventory: this.player.inventory, buildings: this.buildingSystem.buildings, dogs: this.animalManager ? this.animalManager.dogs : [], player: this.player, time: this.timeSystem };
            this.questSystem.checkProgress(qState);
        }
        
        if (this.animalManager) {
            this.animalManager.update(dt, this.player.x, this.player.y, this.world.tiles, this.world.tileSize, this.world.resources, this.buildingSystem ? this.buildingSystem.buildings : []);
        }
        
        this.input.update(); 
        updateHUD();
    }
    
    render() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.world.drawTerrain(this.ctx, this.camera);
        this.world.drawResources(this.ctx, this.camera);
        this.world.drawDroppedItems(this.ctx, this.camera);
        
        if (this.buildingSystem) {
            for (let b of this.buildingSystem.buildings) {
                if (!this.camera.isVisible(b.x, b.y)) continue;
                let pos = this.camera.worldToScreen(b.x, b.y);
                let bDef = window.BUILDING_DB[b.type];
                this.ctx.save();
                this.ctx.translate(pos.x, pos.y);
                this.ctx.fillStyle = '#A0522D';
                this.ctx.fillRect(-bDef.width/2, -bDef.height/2, bDef.width, bDef.height);
                this.ctx.strokeStyle = '#000';
                this.ctx.strokeRect(-bDef.width/2, -bDef.height/2, bDef.width, bDef.height);
                if (b.type === 'campfire') {
                    this.ctx.fillStyle = '#E74C3C';
                    this.ctx.beginPath(); this.ctx.arc(0, 0, 10, 0, Math.PI*2); this.ctx.fill();
                    if (this.systemsLoaded && this.timeSystem.isNight()) {
                        this.ctx.fillStyle = 'rgba(255, 165, 0, 0.3)';
                        this.ctx.beginPath(); this.ctx.arc(0, 0, 150, 0, Math.PI*2); this.ctx.fill();
                    }
                }
                this.ctx.restore();
            }
        }
        
        if (this.animalManager) {
            for (let a of this.animalManager.animals) {
                if (this.camera.isVisible(a.x, a.y)) a.draw(this.ctx, this.camera);
            }
            for (let d of this.animalManager.dogs) {
                if (this.camera.isVisible(d.x, d.y)) d.draw(this.ctx, this.camera);
            }
        }
        
        this.player.draw(this.ctx, this.camera);
        this.particles.draw(this.ctx, this.camera);
        
        if (this.systemsLoaded) {
            if (this.weatherSystem.isRaining()) {
                this.ctx.fillStyle = 'rgba(0,0,255,0.2)';
                this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
                this.ctx.strokeStyle = 'rgba(255,255,255,0.4)';
                this.ctx.beginPath();
                for(let i=0; i<100; i++) {
                    let rx = Math.random() * this.canvas.width;
                    let ry = Math.random() * this.canvas.height;
                    this.ctx.moveTo(rx, ry);
                    this.ctx.lineTo(rx-5, ry+15);
                }
                this.ctx.stroke();
            }
            let light = this.timeSystem.getLightLevel();
            if (light < 1.0) {
                this.ctx.fillStyle = `rgba(0, 0, 30, ${1.0 - light})`;
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            }
        }
        
        if (this.buildMode && this.selectedBuilding && window.BUILDING_DB) {
            let bDef = window.BUILDING_DB[this.selectedBuilding];
            let wx = this.input.mouseWorldX;
            let wy = this.input.mouseWorldY;
            let pos = this.camera.worldToScreen(wx, wy);
            
            let canPlace = this.buildingSystem.canPlace(this.selectedBuilding, wx, wy, this.world.tiles, this.world.tileSize);
            
            this.ctx.save();
            this.ctx.translate(pos.x, pos.y);
            this.ctx.fillStyle = canPlace.valid ? 'rgba(46, 204, 113, 0.5)' : 'rgba(231, 76, 60, 0.5)';
            this.ctx.fillRect(-bDef.width/2, -bDef.height/2, bDef.width, bDef.height);
            this.ctx.strokeStyle = canPlace.valid ? '#2ECC71' : '#E74C3C';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(-bDef.width/2, -bDef.height/2, bDef.width, bDef.height);
            this.ctx.restore();
            
            if (!canPlace.valid) {
                this.ctx.fillStyle = '#fff';
                this.ctx.font = '14px Arial';
                this.ctx.fillText(canPlace.reason, pos.x + 20, pos.y - 20);
            }
        }
        
        this.drawTooltips();
        this.input.drawJoystick(this.ctx);
    }
    
    drawTooltips() {
        let px = this.player.x;
        let py = this.player.y;
        let range = 50;
        let targetFound = false;
        let text = '';
        let targetX = 0, targetY = 0;
        
        let drops = this.world.getDroppedItemsNear(px, py, range);
        if (drops.length > 0) {
            let item = window.ITEM_DB ? window.ITEM_DB[drops[0].itemId] : null;
            text = `[E] Підібрати ${item ? item.name : 'предмет'}`;
            targetX = drops[0].x; targetY = drops[0].y;
            targetFound = true;
        }
        if (!targetFound) {
            let res = this.world.getResourcesNear(px, py, range);
            if (res.length > 0) {
                text = `[E] Зібрати`;
                targetX = res[0].x; targetY = res[0].y;
                targetFound = true;
            }
        }
        if (!targetFound && this.animalManager) {
            let animal = this.animalManager.getNearestInteractable(px, py, range);
            if (animal) {
                text = `[E] Взаємодіяти`;
                targetX = animal.x; targetY = animal.y;
                targetFound = true;
            }
        }
        if (!targetFound && this.buildingSystem) {
            let bldgs = this.buildingSystem.getBuildingsNear(px, py, range);
            if (bldgs.length > 0) {
                let bDef = window.BUILDING_DB[bldgs[0].type];
                text = `[E] ${bDef.name}`;
                targetX = bldgs[0].x; targetY = bldgs[0].y;
                targetFound = true;
            }
        }
        
        if (targetFound && !this.buildMode) {
            let pos = this.camera.worldToScreen(targetX, targetY - 20);
            this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
            this.ctx.font = '14px Arial';
            let w = this.ctx.measureText(text).width;
            this.ctx.fillRect(pos.x - w/2 - 5, pos.y - 15, w + 10, 20);
            this.ctx.fillStyle = '#fff';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(text, pos.x, pos.y - 5);
        }
    }
    
    handleInteraction() {
        if (this.buildMode) return;
        let px = this.player.x;
        let py = this.player.y;
        let range = 50;
        
        let drops = this.world.getDroppedItemsNear(px, py, range);
        if (drops.length > 0) {
            let d = drops[0];
            let added = this.player.inventory.addItem(d.itemId, d.count);
            if (added > 0) {
                if (added < d.count) d.count -= added;
                else this.world.removeDroppedItem(d.id);
                this.showNotification(`Підібрано ${d.itemId} x${added}`, 'success');
                this.player.addXP(1);
            } else {
                this.showNotification('Інвентар повний', 'error');
            }
            return;
        }
        let res = this.world.getResourcesNear(px, py, range);
        if (res.length > 0) {
            let r = res[0];
            let tool = this.player.equippedTool ? (window.ITEM_DB[this.player.equippedTool].toolType || null) : null;
            let result = this.world.harvestResource(r.id, tool);
            if (result.message) {
                if (result.depleted) {
                    this.showNotification(result.message, 'success');
                    for (let it of result.items) {
                        let added = this.player.inventory.addItem(it.id, it.count);
                        if (added < it.count) {
                            this.world.addDroppedItem(it.id, it.count - added, r.x, r.y);
                        }
                    }
                    this.player.addXP(5);
                    this.spawnParticles(r.x, r.y, '#2ECC71', 10);
                } else if (result.message === 'Потрібна сокира!') {
                    this.showNotification(result.message, 'warning');
                } else {
                    this.spawnParticles(r.x, r.y, '#95A5A6', 5);
                }
            }
            return;
        }
        if (this.animalManager) {
            let animal = this.animalManager.getNearestInteractable(px, py, range);
            if (animal) {
                let res = animal.interact(this.player.inventory);
                if (res.message) this.showNotification(res.message, res.success ? 'success' : 'info');
                if (res.action === 'tame' && window.AnimalManager) {
                    let animalToTame = animal;
                    let dialog = document.getElementById('naming-dialog');
                    let input = document.getElementById('dog-name-input');
                    let confirmBtn = document.getElementById('btn-confirm-name');
                    if (dialog && input && confirmBtn) {
                        dialog.classList.remove('hidden');
                        dialog.style.display = 'flex';
                        input.value = 'Дружок';
                        input.focus();
                        confirmBtn.onclick = () => {
                            let name = input.value.trim() || 'Дружок';
                            dialog.classList.add('hidden');
                            dialog.style.display = 'none';
                            this.animalManager.tameDog(animalToTame.id, name);
                            this.showNotification(`Собаку ${name} приручено!`, "success");
                            this.player.addXP(50);
                            window.updateCompanionUI();
                        };
                    } else {
                        this.animalManager.tameDog(animalToTame.id, "Дружок");
                        this.showNotification("Собаку приручено!", "success");
                        this.player.addXP(50);
                        window.updateCompanionUI();
                    }
                }
                return;
            }
        }
        if (this.buildingSystem) {
            let bldgs = this.buildingSystem.getBuildingsNear(px, py, range);
            if (bldgs.length > 0) {
                let res = this.buildingSystem.interact(bldgs[0].id, this.player);
                if (res.message) this.showNotification(res.message, 'info');
                if (res.action === 'open_storage' && res.data) {
                    window.openChestUI(res.data);
                }
                return;
            }
        }
    }
    
    togglePanel(id) {
        let p = document.getElementById(id);
        if (!p) return;
        let isVis = !p.classList.contains('hidden') && p.style.display !== 'none';
        
        // Hide all active panels
        document.querySelectorAll('.panel, .game-panel, .modal').forEach(el => {
            if (el.id !== 'pause-overlay') {
                el.classList.add('hidden');
                el.style.display = 'none';
            }
        });
        
        if (!isVis) {
            p.classList.remove('hidden');
            p.style.display = 'flex';
            if (id === 'panel-inventory') window.updateInventoryUI();
            if (id === 'panel-crafting') window.updateCraftingUI();
            if (id === 'panel-building') window.updateBuildingUI();
            if (id === 'panel-quests') window.updateQuestUI();
            if (id === 'panel-companions') window.updateCompanionUI();
            if (id === 'panel-map') window.updateMapUI();
        }
    }
    
    enterBuildMode(itemStrId, buildingTypeId, costArray) {
        this.buildMode = true;
        this.selectedBuilding = buildingTypeId;
        this.buildItem = itemStrId; 
        this.buildCost = costArray || null;
        document.querySelectorAll('.panel, .game-panel, .modal').forEach(el => {
            el.classList.add('hidden');
            el.style.display = 'none';
        });
        this.showNotification("Режим будівництва: виберіть місце (клік для розміщення)", 'info');
    }
    
    exitBuildMode() {
        this.buildMode = false;
        this.selectedBuilding = null;
        this.buildItem = null;
        this.buildCost = null;
        this.showNotification("Будівництво скасовано", 'info');
    }
    
    placeBuildingAtMouse() {
        if (!this.buildMode || !this.selectedBuilding) return;
        let wx = this.input.mouseWorldX;
        let wy = this.input.mouseWorldY;
        
        let canPlace = this.buildingSystem.canPlace(this.selectedBuilding, wx, wy, this.world.tiles, this.world.tileSize);
        if (canPlace.valid) {
            let placed = false;
            if (this.buildItem) {
                placed = this.player.inventory.removeItem(this.buildItem, 1);
            } else if (this.buildCost) {
                let canAfford = true;
                for (let mat of this.buildCost) {
                    if (this.player.inventory.countItem(mat.id) < mat.count) {
                        canAfford = false;
                        break;
                    }
                }
                if (canAfford) {
                    for (let mat of this.buildCost) {
                        this.player.inventory.removeItem(mat.id, mat.count);
                    }
                    placed = true;
                }
            } else {
                placed = true;
            }
            if (placed) {
                this.buildingSystem.place(this.selectedBuilding, wx, wy);
                this.showNotification("Будівлю споруджено!", 'success');
                this.player.addXP(20);
                this.spawnParticles(wx, wy, '#F4D03F', 20);
                this.exitBuildMode();
            } else {
                this.showNotification("Недостатньо матеріалів для будівництва", 'error');
                this.exitBuildMode();
            }
        } else {
            this.showNotification(canPlace.reason, 'error');
        }
    }
    
    spawnParticles(x, y, color, count) {
        for(let i=0; i<count; i++) {
            let angle = Math.random() * Math.PI * 2;
            let speed = Math.random() * 50 + 20;
            this.particles.emit(x, y, Math.cos(angle)*speed, Math.sin(angle)*speed, color, Math.random()*2+1, Math.random()*0.5+0.2);
        }
    }
    
    saveGame() {
        if (!window.SaveManager) return;
        let data = {
            world: this.world.serialize(),
            player: this.player.serialize(),
            timeSystem: this.systemsLoaded ? this.timeSystem.serialize() : null,
            weatherSystem: this.systemsLoaded ? this.weatherSystem.serialize() : null,
            buildingSystem: this.systemsLoaded ? this.buildingSystem.serialize() : null,
            craftingSystem: this.systemsLoaded ? this.craftingSystem.serialize() : null,
            questSystem: this.systemsLoaded ? this.questSystem.serialize() : null,
            eventSystem: this.systemsLoaded ? this.eventSystem.serialize() : null,
            animalManager: this.animalManager ? this.animalManager.serialize() : null
        };
        window.SaveManager.save(data);
        this.showNotification('Гру збережено', 'success');
        let btnCont = document.getElementById('btn-continue');
        if (btnCont) btnCont.removeAttribute('disabled');
    }
    
    showNotification(msg, type='info') {
        let area = document.getElementById('notification-area');
        if (!area) return;
        let d = document.createElement('div');
        d.className = 'notification';
        
        d.style.padding = '8px 16px';
        d.style.marginBottom = '6px';
        d.style.borderRadius = '6px';
        d.style.color = '#fff';
        d.style.fontFamily = 'system-ui, sans-serif';
        d.style.fontSize = '14px';
        d.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
        d.style.opacity = '1';
        d.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        
        if (type === 'success') d.style.backgroundColor = 'rgba(46, 204, 113, 0.95)';
        else if (type === 'warning') d.style.backgroundColor = 'rgba(241, 196, 15, 0.95)';
        else if (type === 'error' || type === 'danger') d.style.backgroundColor = 'rgba(231, 76, 60, 0.95)';
        else d.style.backgroundColor = 'rgba(0, 188, 212, 0.95)'; 
        
        d.innerText = msg;
        area.appendChild(d);
        
        setTimeout(() => {
            d.style.opacity = '0';
            d.style.transform = 'translateY(-10px)';
            setTimeout(() => { if (d.parentNode) d.parentNode.removeChild(d); }, 400);
        }, 3200);
    }
}

// --- Global UI Functions ---

window.updateHUD = function() {
    if (!window.game || !window.game.player) return;
    let p = window.game.player;
    
    let setBar = (fillId, textId, val, max) => {
        let fill = document.getElementById(fillId);
        if (fill) fill.style.width = Math.max(0, Math.min(100, (val / max) * 100)) + '%';
        let text = document.getElementById(textId);
        if (text) text.innerText = `${Math.round(val)}/${Math.round(max)}`;
    };
    setBar('hud-health', 'hud-health-text', p.health, p.maxHealth);
    setBar('hud-hunger', 'hud-hunger-text', p.hunger, p.maxHunger);
    setBar('hud-thirst', 'hud-thirst-text', p.thirst, p.maxThirst);
    setBar('hud-energy', 'hud-energy-text', p.energy, p.maxEnergy);
    
    if (window.game.systemsLoaded) {
        let dEl = document.getElementById('hud-day');
        if (dEl) dEl.innerText = window.game.timeSystem.getDayString();
        let tEl = document.getElementById('hud-time');
        if (tEl) tEl.innerText = window.game.timeSystem.getTimeString();
        let wEl = document.getElementById('hud-weather');
        if (wEl) {
            let icons = {
                'sunny': '☀️ Ясно',
                'cloudy': '☁️ Хмарно',
                'rain': '🌧️ Дощ',
                'heavy_rain': '🌧️ Злива',
                'storm': '⛈️ Шторм',
                'fog': '🌫️ Туман'
            };
            wEl.innerText = icons[window.game.weatherSystem.current] || window.game.weatherSystem.current;
        }
    }
};

window.drawItemIcon = function(ctx, itemId, x, y, size) {
    if (!window.ITEM_DB || !window.ITEM_DB[itemId]) return;
    let item = window.ITEM_DB[itemId];
    let cat = item.category;
    let cx = x + size/2;
    let cy = y + size/2;
    ctx.save();
    
    if (itemId === 'branch') {
        ctx.strokeStyle = '#8B4513'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(cx-10, cy-10); ctx.lineTo(cx+10, cy+10); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx+6, cy-6); ctx.stroke();
    } else if (itemId === 'wood') {
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(cx-12, cy-6, 24, 12);
        ctx.fillStyle = '#D2B48C';
        ctx.beginPath(); ctx.arc(cx-12, cy, 6, 0, Math.PI*2); ctx.fill();
    } else if (itemId === 'stone') {
        ctx.fillStyle = '#7F8C8D';
        ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#95A5A6';
        ctx.beginPath(); ctx.arc(cx-3, cy-3, 5, 0, Math.PI*2); ctx.fill();
    } else if (itemId === 'fiber') {
        ctx.strokeStyle = '#27AE60'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy+4, 8, 0, Math.PI); ctx.stroke();
    } else if (itemId === 'berry') {
        ctx.fillStyle = '#E74C3C';
        ctx.beginPath(); ctx.arc(cx-5, cy, 6, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx+5, cy, 6, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#27AE60';
        ctx.fillRect(cx-1, cy-10, 2, 5);
    } else if (itemId === 'coconut') {
        ctx.fillStyle = '#6E473B';
        ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#3E2723';
        ctx.beginPath(); ctx.arc(cx-2, cy-3, 2, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx+3, cy-3, 2, 0, Math.PI*2); ctx.fill();
    } else if (itemId === 'fish' || itemId === 'cooked_fish') {
        ctx.fillStyle = itemId === 'cooked_fish' ? '#D35400' : '#3498DB';
        ctx.beginPath(); ctx.ellipse(cx, cy, 12, 6, 0, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.moveTo(cx-12, cy); ctx.lineTo(cx-18, cy-6); ctx.lineTo(cx-18, cy+6); ctx.closePath(); ctx.fill();
    } else if (itemId === 'water') {
        ctx.fillStyle = '#29B6F6';
        ctx.beginPath(); ctx.arc(cx, cy+2, 8, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.moveTo(cx, cy-10); ctx.lineTo(cx-6, cy); ctx.lineTo(cx+6, cy); ctx.closePath(); ctx.fill();
    } else if (itemId === 'stone_axe') {
        ctx.strokeStyle = '#8B4513'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(cx-8, cy+10); ctx.lineTo(cx+6, cy-10); ctx.stroke();
        ctx.fillStyle = '#7F8C8D';
        ctx.fillRect(cx+2, cy-14, 10, 8);
    } else if (itemId === 'stone_knife') {
        ctx.strokeStyle = '#8B4513'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(cx-6, cy+8); ctx.lineTo(cx, cy); ctx.stroke();
        ctx.fillStyle = '#BDC3C7';
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx+12, cy-10); ctx.lineTo(cx+6, cy-4); ctx.closePath(); ctx.fill();
    } else if (itemId === 'spear') {
        ctx.strokeStyle = '#8B4513'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(cx-12, cy+12); ctx.lineTo(cx+10, cy-10); ctx.stroke();
        ctx.fillStyle = '#BDC3C7';
        ctx.beginPath(); ctx.moveTo(cx+10, cy-10); ctx.lineTo(cx+15, cy-15); ctx.lineTo(cx+7, cy-13); ctx.closePath(); ctx.fill();
    } else if (cat === 'building') {
        ctx.fillStyle = '#FF9800';
        ctx.fillRect(cx-10, cy-8, 20, 16);
        ctx.fillStyle = '#E65100';
        ctx.beginPath(); ctx.moveTo(cx-12, cy-8); ctx.lineTo(cx, cy-16); ctx.lineTo(cx+12, cy-8); ctx.closePath(); ctx.fill();
    } else {
        ctx.fillStyle = cat === 'food' ? '#E74C3C' : (cat === 'resource' ? '#8B4513' : '#00BCD4');
        ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI*2); ctx.fill();
    }
    ctx.restore();
};

window.updateInventoryUI = function() {
    let p = window.game ? window.game.player : null;
    if (!p || !p.inventory) return;
    let grid = document.getElementById('inv-grid') || document.getElementById('inventory-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    // Equip slot update
    let eqSlot = document.getElementById('equip-slot');
    if (eqSlot) {
        eqSlot.innerHTML = '';
        if (p.equippedTool && window.ITEM_DB[p.equippedTool]) {
            let eqItem = window.ITEM_DB[p.equippedTool];
            let cvs = document.createElement('canvas');
            cvs.width = 48; cvs.height = 48;
            window.drawItemIcon(cvs.getContext('2d'), p.equippedTool, 0, 0, 48);
            eqSlot.appendChild(cvs);
            eqSlot.title = `${eqItem.name} (Клік щоб зняти)`;
            eqSlot.onclick = () => {
                p.equippedTool = null;
                window.game.showNotification("Інструмент знято", "info");
                window.updateInventoryUI();
            };
        } else {
            eqSlot.title = "Порожньо (екіпіруйте інструмент)";
            eqSlot.innerHTML = '<span style="color:#666;font-size:18px;">∅</span>';
            eqSlot.onclick = null;
        }
    }
    
    for (let i = 0; i < p.inventory.maxSlots; i++) {
        let slot = p.inventory.slots[i];
        let div = document.createElement('div');
        div.className = 'inv-slot' + (slot ? '' : ' empty');
        
        if (slot && window.ITEM_DB[slot.id]) {
            let itemDef = window.ITEM_DB[slot.id];
            div.title = `${itemDef.name}\n${itemDef.description}\nКлік: дія / ПКМ: викинути`;
            
            let cvs = document.createElement('canvas');
            cvs.width = 48; cvs.height = 48;
            window.drawItemIcon(cvs.getContext('2d'), slot.id, 0, 0, 48);
            div.appendChild(cvs);
            
            let countSpan = document.createElement('span');
            countSpan.className = 'item-count';
            countSpan.innerText = slot.count;
            div.appendChild(countSpan);
            
            if (p.equippedTool === slot.id) {
                div.classList.add('selected');
            }
            
            div.onclick = () => {
                if (itemDef.category === 'food') {
                    p.inventory.useItem(i, p);
                    window.game.showNotification(`Вжито: ${itemDef.name}`, 'success');
                    window.updateInventoryUI();
                    window.updateHUD();
                } else if (itemDef.category === 'tool') {
                    if (p.equippedTool === slot.id) {
                        p.equippedTool = null;
                        window.game.showNotification("Інструмент знято", 'info');
                    } else {
                        p.equippedTool = slot.id;
                        window.game.showNotification(`Екіпіровано: ${itemDef.name}`, 'success');
                    }
                    window.updateInventoryUI();
                } else if (itemDef.category === 'building' && itemDef.placeable) {
                    window.game.enterBuildMode(slot.id, itemDef.placeable);
                }
            };
            
            div.oncontextmenu = (e) => {
                e.preventDefault();
                let dropped = p.inventory.dropItem(i, 1, p.x, p.y);
                if (dropped) {
                    window.game.world.addDroppedItem(dropped.itemId, dropped.count, p.x + (Math.random()*20-10), p.y + (Math.random()*20-10));
                    window.game.showNotification(`Викинуто: ${itemDef.name}`, 'info');
                    window.updateInventoryUI();
                }
            };
        }
        grid.appendChild(div);
    }
};

window.updateCraftingUI = function() {
    let list = document.getElementById('craft-list') || document.getElementById('crafting-list');
    if (!list || !window.game || !window.game.craftingSystem) return;
    list.innerHTML = '';
    
    let pInv = window.game.player.inventory;
    let avail = window.game.craftingSystem.getAvailableRecipes();
    
    for (let recId of avail) {
        let rec = window.RECIPE_DB[recId];
        if (!rec) continue;
        
        let row = document.createElement('div');
        row.style.background = 'rgba(0,0,0,0.3)';
        row.style.border = '1px solid rgba(255,255,255,0.1)';
        row.style.borderRadius = '8px';
        row.style.padding = '10px 14px';
        row.style.display = 'flex';
        row.style.justifyContent = 'space-between';
        row.style.alignItems = 'center';
        row.style.gap = '10px';
        
        let left = document.createElement('div');
        left.style.display = 'flex';
        left.style.alignItems = 'center';
        left.style.gap = '10px';
        
        let iconCvs = document.createElement('canvas');
        iconCvs.width = 36; iconCvs.height = 36;
        window.drawItemIcon(iconCvs.getContext('2d'), rec.result.id, 0, 0, 36);
        left.appendChild(iconCvs);
        
        let details = document.createElement('div');
        let nameEl = document.createElement('div');
        nameEl.style.fontWeight = 'bold';
        nameEl.style.color = '#FFD700';
        nameEl.innerText = rec.name;
        details.appendChild(nameEl);
        
        let matsDiv = document.createElement('div');
        matsDiv.style.display = 'flex';
        matsDiv.style.flexWrap = 'wrap';
        matsDiv.style.gap = '6px';
        matsDiv.style.marginTop = '4px';
        
        let canCraft = true;
        for (let mat of rec.materials) {
            let have = pInv.countItem(mat.id);
            let pill = document.createElement('span');
            pill.style.fontSize = '11px';
            pill.style.padding = '2px 6px';
            pill.style.borderRadius = '4px';
            let matName = window.ITEM_DB[mat.id] ? window.ITEM_DB[mat.id].name : mat.id;
            pill.innerText = `${matName}: ${have}/${mat.count}`;
            if (have >= mat.count) {
                pill.style.background = 'rgba(46, 204, 113, 0.3)';
                pill.style.color = '#2ECC71';
            } else {
                pill.style.background = 'rgba(231, 76, 60, 0.3)';
                pill.style.color = '#E74C3C';
                canCraft = false;
            }
            matsDiv.appendChild(pill);
        }
        details.appendChild(matsDiv);
        left.appendChild(details);
        
        let btn = document.createElement('button');
        btn.innerText = 'Створити';
        btn.style.padding = '6px 14px';
        btn.style.borderRadius = '6px';
        btn.style.border = 'none';
        btn.style.cursor = canCraft ? 'pointer' : 'not-allowed';
        btn.style.background = canCraft ? '#00BCD4' : '#555';
        btn.style.color = '#fff';
        btn.style.fontWeight = 'bold';
        btn.disabled = !canCraft;
        
        btn.onclick = () => {
            let res = window.game.craftingSystem.craft(recId, pInv);
            if (res.success) {
                window.game.showNotification(res.message, 'success');
                window.game.player.addXP(10);
                window.updateCraftingUI();
                window.updateInventoryUI();
            } else {
                window.game.showNotification(res.message, 'error');
            }
        };
        
        row.appendChild(left);
        row.appendChild(btn);
        list.appendChild(row);
    }
};

window.updateBuildingUI = function() {
    let list = document.getElementById('build-list') || document.getElementById('building-list');
    if (!list || !window.BUILDING_DB) return;
    list.innerHTML = '';
    
    let pInv = window.game.player.inventory;
    
    // Map of buildings to crafting recipe material costs
    let buildCosts = {
        'campfire': [{id:'branch', count:5}, {id:'stone', count:4}],
        'shelter': [{id:'wood', count:8}, {id:'branch', count:5}, {id:'fiber', count:4}],
        'wooden_house': [{id:'wood', count:20}, {id:'stone', count:8}, {id:'rope', count:3}],
        'chest': [{id:'wood', count:8}, {id:'stone', count:2}],
        'workbench': [{id:'wood', count:10}, {id:'stone', count:5}, {id:'branch', count:3}],
        'rain_collector': [{id:'wood', count:4}, {id:'fiber', count:3}, {id:'stone', count:2}],
        'garden': [{id:'wood', count:4}, {id:'fiber', count:2}],
        'dog_house': [{id:'wood', count:8}, {id:'fiber', count:4}],
        'feeder': [{id:'wood', count:2}, {id:'stone', count:1}],
        'waterer': [{id:'wood', count:2}, {id:'stone', count:1}]
    };
    
    for (let bldId in window.BUILDING_DB) {
        let bDef = window.BUILDING_DB[bldId];
        let cost = buildCosts[bldId] || [{id:'wood', count:5}];
        
        let card = document.createElement('div');
        card.style.background = 'rgba(0,0,0,0.3)';
        card.style.border = '1px solid rgba(255,255,255,0.1)';
        card.style.borderRadius = '8px';
        card.style.padding = '12px';
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.style.justifyContent = 'space-between';
        card.style.gap = '8px';
        
        let title = document.createElement('div');
        title.style.fontWeight = 'bold';
        title.style.color = '#00BCD4';
        title.innerText = bDef.name;
        
        let desc = document.createElement('div');
        desc.style.fontSize = '12px';
        desc.style.color = '#ccc';
        desc.innerText = bDef.description;
        
        let matsDiv = document.createElement('div');
        matsDiv.style.display = 'flex';
        matsDiv.style.flexWrap = 'wrap';
        matsDiv.style.gap = '4px';
        
        let canAfford = true;
        for (let mat of cost) {
            let have = pInv.countItem(mat.id);
            let pill = document.createElement('span');
            pill.style.fontSize = '11px';
            pill.style.padding = '2px 5px';
            pill.style.borderRadius = '4px';
            let matName = window.ITEM_DB[mat.id] ? window.ITEM_DB[mat.id].name : mat.id;
            pill.innerText = `${matName}: ${have}/${mat.count}`;
            if (have >= mat.count) {
                pill.style.background = 'rgba(46, 204, 113, 0.3)';
                pill.style.color = '#2ECC71';
            } else {
                pill.style.background = 'rgba(231, 76, 60, 0.3)';
                pill.style.color = '#E74C3C';
                canAfford = false;
            }
            matsDiv.appendChild(pill);
        }
        
        let btn = document.createElement('button');
        btn.innerText = 'Будувати';
        btn.style.padding = '6px';
        btn.style.borderRadius = '6px';
        btn.style.border = 'none';
        btn.style.cursor = canAfford ? 'pointer' : 'not-allowed';
        btn.style.background = canAfford ? '#FF9800' : '#555';
        btn.style.color = '#fff';
        btn.style.fontWeight = 'bold';
        btn.disabled = !canAfford;
        
        btn.onclick = () => {
            window.game.enterBuildMode(null, bldId, cost);
        };
        
        card.appendChild(title);
        card.appendChild(desc);
        card.appendChild(matsDiv);
        card.appendChild(btn);
        list.appendChild(card);
    }
};

window.updateQuestUI = function() {
    let list = document.getElementById('quest-list');
    if (!list || !window.game || !window.game.questSystem) return;
    list.innerHTML = '';
    
    let quests = window.game.questSystem.quests;
    for (let q of quests) {
        let div = document.createElement('div');
        div.style.background = 'rgba(0,0,0,0.3)';
        div.style.border = '1px solid rgba(255,255,255,0.1)';
        div.style.borderRadius = '8px';
        div.style.padding = '10px';
        div.style.display = 'flex';
        div.style.flexDirection = 'column';
        div.style.gap = '4px';
        
        let titleRow = document.createElement('div');
        titleRow.style.display = 'flex';
        titleRow.style.justifyContent = 'space-between';
        
        let title = document.createElement('span');
        title.style.fontWeight = 'bold';
        title.style.color = q.completed ? '#2ECC71' : '#FFD700';
        title.innerText = (q.completed ? '✓ ' : '• ') + q.title;
        
        let status = document.createElement('span');
        status.style.fontSize = '12px';
        status.style.color = q.completed ? '#2ECC71' : '#ccc';
        status.innerText = q.completed ? 'Виконано!' : `${Math.floor(q.progress)}/${q.target}`;
        
        titleRow.appendChild(title);
        titleRow.appendChild(status);
        div.appendChild(titleRow);
        
        let desc = document.createElement('div');
        desc.style.fontSize = '12px';
        desc.style.color = '#aaa';
        desc.innerText = q.description;
        div.appendChild(desc);
        
        let bar = document.createElement('div');
        bar.style.height = '6px';
        bar.style.background = 'rgba(255,255,255,0.1)';
        bar.style.borderRadius = '3px';
        bar.style.overflow = 'hidden';
        
        let fill = document.createElement('div');
        fill.style.height = '100%';
        fill.style.width = Math.min(100, (q.progress / q.target) * 100) + '%';
        fill.style.background = q.completed ? '#2ECC71' : '#00BCD4';
        bar.appendChild(fill);
        div.appendChild(bar);
        
        list.appendChild(div);
    }
};

window.updateCompanionUI = function() {
    let list = document.getElementById('companion-list');
    if (!list || !window.game || !window.game.animalManager) return;
    list.innerHTML = '';
    
    let dogs = window.game.animalManager.dogs;
    if (dogs.length === 0) {
        list.innerHTML = '<p style="padding:15px;text-align:center;color:#aaa;">У вас немає компаньйонів.<br>Знайдіть дикого собаку, погодуйте його і приручіть!</p>';
        return;
    }
    
    for (let d of dogs) {
        let card = document.createElement('div');
        card.style.background = 'rgba(0,0,0,0.3)';
        card.style.border = '1px solid rgba(255,255,255,0.1)';
        card.style.borderRadius = '8px';
        card.style.padding = '12px';
        card.style.display = 'flex';
        card.style.justifyContent = 'space-between';
        card.style.alignItems = 'center';
        
        let info = document.createElement('div');
        let nameRow = document.createElement('div');
        nameRow.style.fontWeight = 'bold';
        nameRow.style.fontSize = '16px';
        nameRow.style.color = '#FFD700';
        nameRow.innerText = `🐕 ${d.name} (Рівень ${d.level})`;
        info.appendChild(nameRow);
        
        let statsRow = document.createElement('div');
        statsRow.style.fontSize = '12px';
        statsRow.style.color = '#ccc';
        statsRow.style.marginTop = '4px';
        statsRow.innerText = `❤️ ${Math.round(d.health)} | 🍗 ${Math.round(d.hunger)} | ⚡ ${Math.round(d.energy)} | 💖 ${Math.round(d.trust)}%`;
        info.appendChild(statsRow);
        
        let cmdRow = document.createElement('div');
        cmdRow.style.fontSize = '11px';
        cmdRow.style.color = '#00BCD4';
        cmdRow.style.marginTop = '2px';
        cmdRow.innerText = `Команда: ${d.command}`;
        info.appendChild(cmdRow);
        
        let btn = document.createElement('button');
        btn.innerText = 'Керувати';
        btn.style.padding = '8px 14px';
        btn.style.background = '#00BCD4';
        btn.style.color = '#fff';
        btn.style.border = 'none';
        btn.style.borderRadius = '6px';
        btn.style.cursor = 'pointer';
        btn.onclick = () => window.showDogDetailPanel(d);
        
        card.appendChild(info);
        card.appendChild(btn);
        list.appendChild(card);
    }
};

window.activeDog = null;

window.showDogDetailPanel = function(dog) {
    window.activeDog = dog;
    let panel = document.getElementById('panel-dog-detail');
    if (!panel) return;
    
    document.querySelectorAll('.panel, .game-panel, .modal').forEach(el => {
        el.classList.add('hidden');
        el.style.display = 'none';
    });
    panel.classList.remove('hidden');
    panel.style.display = 'flex';
    
    window.refreshDogDetailStats();
    
    // Command buttons
    let cmdBtns = panel.querySelectorAll('.cmd-btn');
    cmdBtns.forEach(btn => {
        let cmd = btn.getAttribute('data-cmd');
        btn.style.background = (dog.command === cmd) ? '#00BCD4' : 'rgba(255,255,255,0.1)';
        btn.onclick = () => {
            dog.setCommand(cmd);
            window.game.showNotification(`${dog.name}: команда "${btn.innerText}"`, 'info');
            cmdBtns.forEach(b => b.style.background = 'rgba(255,255,255,0.1)');
            btn.style.background = '#00BCD4';
            window.refreshDogDetailStats();
            btn.blur();
        };
    });
    
    // Care buttons
    let feedBtn = document.getElementById('btn-dog-feed');
    if (feedBtn) feedBtn.onclick = () => {
        let pInv = window.game.player.inventory;
        let foodSlot = -1;
        for (let i = 0; i < pInv.maxSlots; i++) {
            let s = pInv.getSlot(i);
            if (s && window.ITEM_DB[s.id] && window.ITEM_DB[s.id].category === 'food' && s.id !== 'water') {
                foodSlot = i;
                break;
            }
        }
        if (foodSlot !== -1) {
            let s = pInv.getSlot(foodSlot);
            let res = dog.feed(s.id);
            if (res.success) {
                pInv.removeItem(s.id, 1);
                window.game.showNotification(res.message, 'success');
                window.refreshDogDetailStats();
                window.updateInventoryUI();
            } else {
                window.game.showNotification(res.message, 'warning');
            }
        } else {
            window.game.showNotification("У вас немає їжі для собаки!", 'error');
        }
    };
    
    let waterBtn = document.getElementById('btn-dog-water');
    if (waterBtn) waterBtn.onclick = () => {
        let res = dog.giveWater();
        window.game.showNotification(res.message, 'info');
        window.refreshDogDetailStats();
    };
    
    let petBtn = document.getElementById('btn-dog-pet');
    if (petBtn) petBtn.onclick = () => {
        let res = dog.pet();
        window.game.showNotification(res.message, 'success');
        window.refreshDogDetailStats();
    };
    
    let playBtn = document.getElementById('btn-dog-play');
    if (playBtn) playBtn.onclick = () => {
        let res = dog.play();
        window.game.showNotification(res.message, 'info');
        window.refreshDogDetailStats();
    };
    
    let healBtn = document.getElementById('btn-dog-heal');
    if (healBtn) healBtn.onclick = () => {
        dog.heal(25);
        window.game.showNotification(`Ви обробили рани ${dog.name}. +25 Здоров'я`, 'success');
        window.refreshDogDetailStats();
    };
    
    // Rename button
    let renameBtn = document.getElementById('btn-rename-dog');
    if (renameBtn) renameBtn.onclick = () => {
        let newName = prompt("Введіть нове ім'я для собаки:", dog.name);
        if (newName && newName.trim()) {
            dog.name = newName.trim();
            window.refreshDogDetailStats();
            window.updateCompanionUI();
        }
    };
    
    // Items found
    let takeItemsBtn = document.getElementById('btn-dog-take-items');
    if (takeItemsBtn) takeItemsBtn.onclick = () => {
        let items = dog.collectFoundItems();
        if (items.length > 0) {
            for (let it of items) {
                window.game.player.inventory.addItem(it.id, it.count);
            }
            window.game.showNotification(`Забрано знахідки від ${dog.name}!`, 'success');
            window.refreshDogDetailStats();
            window.updateInventoryUI();
        } else {
            window.game.showNotification("Собака поки нічого не знайшов.", 'info');
        }
    };
};

window.refreshDogDetailStats = function() {
    let dog = window.activeDog;
    if (!dog) return;
    
    let nameEl = document.getElementById('dog-detail-name');
    if (nameEl) nameEl.innerText = dog.name;
    let lvlEl = document.getElementById('dog-detail-level');
    if (lvlEl) lvlEl.innerText = dog.level;
    
    let setVal = (id, val) => {
        let el = document.getElementById(id);
        if (el) el.innerText = val;
    };
    setVal('dog-stat-health', `${Math.round(dog.health)}/${Math.round(dog.maxHealth)}`);
    setVal('dog-stat-hunger', `${Math.round(dog.hunger)}/${Math.round(dog.maxHunger)}`);
    setVal('dog-stat-energy', `${Math.round(dog.energy)}/${Math.round(dog.maxEnergy)}`);
    setVal('dog-stat-trust', `${Math.round(dog.trust)}%`);
    setVal('dog-stat-xp', `${Math.round(dog.xp)}/${Math.round(dog.xpToNext)}`);
    
    let persMap = { 'playful':'Грайливий', 'calm':'Спокійний', 'brave':'Хоробрий', 'curious':'Допитливий' };
    setVal('dog-stat-personality', persMap[dog.personality] || dog.personality);
    
    let foundArea = document.getElementById('dog-found-items-area');
    let foundGrid = document.getElementById('dog-found-items');
    if (foundArea && foundGrid) {
        if (dog.foundItems && dog.foundItems.length > 0) {
            foundArea.classList.remove('hidden');
            foundGrid.innerHTML = '';
            for (let it of dog.foundItems) {
                let d = document.createElement('div');
                d.className = 'inv-slot';
                let cvs = document.createElement('canvas');
                cvs.width = 40; cvs.height = 40;
                window.drawItemIcon(cvs.getContext('2d'), it.id, 0, 0, 40);
                d.appendChild(cvs);
                let sp = document.createElement('span');
                sp.className = 'item-count';
                sp.innerText = it.count;
                d.appendChild(sp);
                foundGrid.appendChild(d);
            }
        } else {
            foundArea.classList.add('hidden');
        }
    }
};

window.openChestUI = function(chestBuilding) {
    let panel = document.getElementById('panel-chest');
    if (!panel) return;
    
    document.querySelectorAll('.panel, .game-panel, .modal').forEach(el => {
        el.classList.add('hidden');
        el.style.display = 'none';
    });
    panel.classList.remove('hidden');
    panel.style.display = 'flex';
    
    // Ensure chest has deserialized Inventory instance
    if (!chestBuilding._invInstance) {
        let slots = 20;
        let bDef = window.BUILDING_DB[chestBuilding.type];
        if (bDef && bDef.storageSlots) slots = bDef.storageSlots;
        chestBuilding._invInstance = chestBuilding.inventory ? 
            window.Inventory.deserialize(chestBuilding.inventory, slots) : 
            new window.Inventory(slots);
    }
    let chestInv = chestBuilding._invInstance;
    let pInv = window.game.player.inventory;
    
    let refreshGrids = () => {
        let chestGrid = document.getElementById('chest-grid');
        let playerGrid = document.getElementById('chest-player-grid');
        if (!chestGrid || !playerGrid) return;
        
        chestGrid.innerHTML = '';
        for (let i = 0; i < chestInv.maxSlots; i++) {
            let slot = chestInv.slots[i];
            let div = document.createElement('div');
            div.className = 'inv-slot' + (slot ? '' : ' empty');
            if (slot && window.ITEM_DB[slot.id]) {
                let cvs = document.createElement('canvas');
                cvs.width = 48; cvs.height = 48;
                window.drawItemIcon(cvs.getContext('2d'), slot.id, 0, 0, 48);
                div.appendChild(cvs);
                let sp = document.createElement('span');
                sp.className = 'item-count';
                sp.innerText = slot.count;
                div.appendChild(sp);
                div.title = `${window.ITEM_DB[slot.id].name} (Клік щоб забрати в інвентар)`;
                div.onclick = () => {
                    let added = pInv.addItem(slot.id, 1);
                    if (added > 0) {
                        chestInv.removeItem(slot.id, 1);
                        chestBuilding.inventory = chestInv.serialize();
                        refreshGrids();
                        window.updateInventoryUI();
                    }
                };
            }
            chestGrid.appendChild(div);
        }
        
        playerGrid.innerHTML = '';
        for (let i = 0; i < pInv.maxSlots; i++) {
            let slot = pInv.slots[i];
            let div = document.createElement('div');
            div.className = 'inv-slot' + (slot ? '' : ' empty');
            if (slot && window.ITEM_DB[slot.id]) {
                let cvs = document.createElement('canvas');
                cvs.width = 48; cvs.height = 48;
                window.drawItemIcon(cvs.getContext('2d'), slot.id, 0, 0, 48);
                div.appendChild(cvs);
                let sp = document.createElement('span');
                sp.className = 'item-count';
                sp.innerText = slot.count;
                div.appendChild(sp);
                div.title = `${window.ITEM_DB[slot.id].name} (Клік щоб покласти в скриню)`;
                div.onclick = () => {
                    let added = chestInv.addItem(slot.id, 1);
                    if (added > 0) {
                        pInv.removeItem(slot.id, 1);
                        chestBuilding.inventory = chestInv.serialize();
                        refreshGrids();
                        window.updateInventoryUI();
                    }
                };
            }
            playerGrid.appendChild(div);
        }
    };
    
    refreshGrids();
};

window.updateMapUI = function() {
    let canvas = document.getElementById('map-canvas');
    if (!canvas || !window.game || !window.game.world) return;
    let ctx = canvas.getContext('2d');
    let world = window.game.world;
    let w = canvas.width;
    let h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    
    let scaleX = w / world.width;
    let scaleY = h / world.height;
    
    for (let ty = 0; ty < world.height; ty++) {
        for (let tx = 0; tx < world.width; tx++) {
            let t = world.getTile(tx, ty);
            if (t === 0) ctx.fillStyle = '#006994';
            else if (t === 1) ctx.fillStyle = '#48CAE4';
            else if (t === 2) ctx.fillStyle = '#F4D03F';
            else if (t === 3) ctx.fillStyle = '#27AE60';
            else if (t === 4) ctx.fillStyle = '#1B5E20';
            else if (t === 5) ctx.fillStyle = '#7F8C8D';
            ctx.fillRect(tx * scaleX, ty * scaleY, Math.ceil(scaleX), Math.ceil(scaleY));
        }
    }
    
    if (window.game.buildingSystem) {
        ctx.fillStyle = '#FF9800';
        for (let b of window.game.buildingSystem.buildings) {
            let bx = (b.x / window.game.tileSize) * scaleX;
            let by = (b.y / window.game.tileSize) * scaleY;
            ctx.fillRect(bx - 2, by - 2, 4, 4);
        }
    }
    
    if (window.game.animalManager) {
        ctx.fillStyle = '#4CAF50';
        for (let d of window.game.animalManager.dogs) {
            let dx = (d.x / window.game.tileSize) * scaleX;
            let dy = (d.y / window.game.tileSize) * scaleY;
            ctx.beginPath(); ctx.arc(dx, dy, 3, 0, Math.PI*2); ctx.fill();
        }
    }
    
    if (window.game.player) {
        let px = (window.game.player.x / window.game.tileSize) * scaleX;
        let py = (window.game.player.y / window.game.tileSize) * scaleY;
        ctx.fillStyle = '#F44336';
        ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 1.5; ctx.stroke();
    }
};

window.Game = Game;

// --- Application Entry Point ---
window.addEventListener('load', () => {
    window.game = new Game();
    
    // Check savegame for Continue button
    let btnCont = document.getElementById('btn-continue');
    if (btnCont) {
        if (window.SaveManager && window.SaveManager.hasSave()) {
            btnCont.removeAttribute('disabled');
        } else {
            btnCont.setAttribute('disabled', 'true');
        }
    }
    
    // Main Menu Buttons
    let btnNew = document.getElementById('btn-new-game');
    if (btnNew) btnNew.onclick = () => {
        window.game.init();
        window.game.start();
    };
    
    if (btnCont) btnCont.onclick = () => {
        window.game.loadFromSave();
        window.game.start();
    };
    
    let btnSettings = document.getElementById('btn-settings');
    if (btnSettings) btnSettings.onclick = () => {
        let p = document.getElementById('panel-settings');
        if (p) {
            p.classList.remove('hidden');
            p.style.display = 'flex';
        }
    };
    
    let btnAbout = document.getElementById('btn-about');
    if (btnAbout) btnAbout.onclick = () => {
        let p = document.getElementById('panel-about');
        if (p) {
            p.classList.remove('hidden');
            p.style.display = 'flex';
        }
    };
    
    // Close buttons across all panels
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.onclick = () => {
            let parent = btn.closest('.panel, .game-panel, .modal');
            if (parent) {
                parent.classList.add('hidden');
                parent.style.display = 'none';
            }
        };
    });
    
    // Side Panel Buttons
    let sideBinds = {
        'btn-toggle-inv': 'panel-inventory',
        'btn-toggle-craft': 'panel-crafting',
        'btn-toggle-build': 'panel-building',
        'btn-toggle-map': 'panel-map',
        'btn-toggle-quests': 'panel-quests',
        'btn-toggle-companions': 'panel-companions'
    };
    for (let btnId in sideBinds) {
        let b = document.getElementById(btnId);
        if (b) {
            b.onclick = () => window.game.togglePanel(sideBinds[btnId]);
        }
    }
    
    // Pause Overlay Buttons
    let btnResume = document.getElementById('btn-resume');
    if (btnResume) btnResume.onclick = () => window.game.resume();
    
    let btnSave = document.getElementById('btn-save');
    if (btnSave) btnSave.onclick = () => window.game.saveGame();
    
    let btnPauseSettings = document.getElementById('btn-pause-settings');
    if (btnPauseSettings) btnPauseSettings.onclick = () => {
        let p = document.getElementById('panel-settings');
        if (p) {
            p.classList.remove('hidden');
            p.style.display = 'flex';
        }
    };
    
    let btnMainMenu = document.getElementById('btn-main-menu');
    if (btnMainMenu) btnMainMenu.onclick = () => {
        window.game.paused = true;
        window.game.running = false;
        let ov = document.getElementById('pause-overlay');
        if (ov) { ov.classList.add('hidden'); ov.style.display = 'none'; }
        let gc = document.getElementById('game-container');
        if (gc) { gc.classList.add('hidden'); gc.style.display = 'none'; }
        let mm = document.getElementById('main-menu');
        if (mm) { mm.classList.remove('hidden'); mm.classList.add('active'); mm.style.display = 'flex'; }
        if (btnCont && window.SaveManager && window.SaveManager.hasSave()) {
            btnCont.removeAttribute('disabled');
        }
    };
    
    // Reset save button in settings
    let btnResetSave = document.getElementById('btn-reset-save');
    if (btnResetSave) btnResetSave.onclick = () => {
        if (confirm('Ви впевнені, що хочете видалити збережену гру? Цю дію неможливо скасувати.')) {
            if (window.SaveManager) window.SaveManager.deleteSave();
            if (btnCont) btnCont.setAttribute('disabled', 'true');
            alert('Збереження видалено.');
        }
    };
    
    // Mobile Controls Check
    let hasTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    let mobControls = document.getElementById('mobile-controls');
    if (hasTouch && mobControls) {
        mobControls.classList.remove('hidden');
    }
    let mobInteract = document.getElementById('btn-mobile-interact');
    if (mobInteract) mobInteract.onclick = () => window.game.handleInteraction();
    
    let mobAttack = document.getElementById('btn-mobile-attack');
    if (mobAttack) mobAttack.onclick = () => window.game.handleInteraction();

    // Prevent any button click from trapping keyboard focus away from game controls
    document.addEventListener('click', (e) => {
        if (e.target && e.target.tagName === 'BUTTON') {
            e.target.blur();
        }
    });
});

