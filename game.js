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
        this.canvas = canvas;
        this.keys = {};
        this.prevKeys = {};
        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseWorldX = 0;
        this.mouseWorldY = 0;
        this.clicked = false;
        this.shotClicked = false;
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
        // Canvas-only input keeps inventory/UI clicks separate from gameplay.
        // shotClicked preserves a very quick click that can otherwise fall
        // between two animation frames.
        this.canvas.addEventListener('mousedown', e => {
            if (e.button !== 0) return;
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            this.clicked = true;
            this.shotClicked = true;
        });
        window.addEventListener('mouseup', e => {
            if (e.button === 0) this.clicked = false;
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
        const physicalKey = /^[a-z]$/.test(k) ? `Key${k.toUpperCase()}` : null;
        return !!this.keys[k] || !!this.keys[key] || !!(physicalKey && this.keys[physicalKey]);
    }
    wasPressed(key) {
        if (key === 'e' && this.actionClicked) {
            this.actionClicked = false;
            return true;
        }
        let k = key.toLowerCase();
        // e.key changes with keyboard layout (for example, F becomes “а” on a
        // Ukrainian layout), whereas e.code always identifies the physical key.
        const physicalKey = /^[a-z]$/.test(k) ? `Key${k.toUpperCase()}` : null;
        let pressed = (!!this.keys[k] && !this.prevKeys[k]) ||
                      (!!this.keys[key] && !this.prevKeys[key]) ||
                      (!!physicalKey && !!this.keys[physicalKey] && !this.prevKeys[physicalKey]);
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
        this.inBoat = false;
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
            
            const moveSpeed = this.inBoat ? 185 : this.speed;
            let nx = this.x + mov.x * moveSpeed * dt;
            let ny = this.y + mov.y * moveSpeed * dt;
            const canMove = (tx, ty) => this.inBoat
                ? world.isBoatNavigable(tx, ty, this.width, this.height, buildingSystem)
                : world.isWalkable(tx, ty, this.width, this.height, buildingSystem, this.x, this.y);
            
            if (canMove(nx, this.y)) {
                this.x = nx;
            }
            if (canMove(this.x, ny)) {
                this.y = ny;
            }
            
            this.animTimer += dt * 10;
            if (this.animTimer > 1) {
                this.animTimer = 0;
                this.animFrame = (this.animFrame + 1) % 4;
            }
            
            this.energy -= dt * (this.inBoat ? 0.18 : 0.5);
        } else {
            this.animFrame = 0;
            this.energy += dt * 1.5;
        }
        
        // Prevent player from ever being stuck inside solid buildings
        if (buildingSystem && !this.inBoat) {
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
        if (this.inBoat) return;
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
            inBoat: this.inBoat,
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
        p.inBoat = !!data.inBoat;
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
        // A navigable archipelago: one large home island, medium islands and
        // small resource islands.  The fixed layout keeps a new game reliable,
        // while the noise makes each shoreline naturally irregular.
        const islands = [
            { x: 60, y: 60, radius: 34, roughness: 0.16 },
            { x: 20, y: 23, radius: 14, roughness: 0.19 },
            { x: 99, y: 23, radius: 11, roughness: 0.20 },
            { x: 99, y: 91, radius: 16, roughness: 0.17 },
            { x: 22, y: 95, radius: 9, roughness: 0.22 },
            { x: 12, y: 65, radius: 6, roughness: 0.24 },
            { x: 78, y: 108, radius: 7, roughness: 0.22 },
            { x: 108, y: 60, radius: 5, roughness: 0.25 }
        ];

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                let elevation = 0;
                const n = this.noise.octaveNoise(x * 0.065, y * 0.065, 4, 0.52);
                for (const island of islands) {
                    const dist = Math.hypot(x - island.x, y - island.y);
                    const falloff = Math.max(0, 1 - dist / island.radius);
                    // The coastline uses low-frequency noise, not a perfect circle.
                    const local = falloff + (n - 0.5) * island.roughness;
                    elevation = Math.max(elevation, local);
                }

                let type = 0;
                if (elevation > 0.82) type = 5;
                else if (elevation > 0.64) type = 4;
                else if (elevation > 0.39) type = 3;
                else if (elevation > 0.18) type = 2;
                else if (elevation > 0.07) type = 1;

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
        // Check if there's a bridge/dock building on this water tile
        if ((tType === 0 || tType === 1) && buildingSystem) {
            const bx = tx * this.tileSize + this.tileSize / 2;
            const by = ty * this.tileSize + this.tileSize / 2;
            const bridges = buildingSystem.buildings.filter(b => (b.type === 'bridge' || b.type === 'dock'));
            const onBridge = bridges.some(b => {
                const bDef = window.BUILDING_DB[b.type];
                if (!bDef) return false;
                return wx >= b.x - bDef.width/2 && wx <= b.x + bDef.width/2 &&
                       wy >= b.y - bDef.height/2 && wy <= b.y + bDef.height/2;
            });
            if (!onBridge) return false;
        } else if (tType === 0 || tType === 1) {
            return false;
        } 

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
    isBoatNavigable(wx, wy, pw, ph, buildingSystem) {
        const t = this.getTileAtWorld(wx, wy);
        if (t !== 0 && t !== 1 && t !== 2) return false;
        // A boat may touch the beach to embark/disembark, but never crosses buildings.
        if (buildingSystem) {
            for (const r of buildingSystem.getCollisionRects()) {
                if (wx + pw / 2 > r.x - r.w / 2 && wx - pw / 2 < r.x + r.w / 2 &&
                    wy + ph / 2 > r.y - r.h / 2 && wy - ph / 2 < r.y + r.h / 2) return false;
            }
        }
        return true;
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

// --- Hostile encounters ---
class PirateManager {
    constructor() {
        this.pirates = [];
        this.nextId = 0;
    }
    init(world, player) {
        this.pirates = [];
        for (let i = 0; i < 4; i++) {
            let pos = this.findWaterPosition(world, player.x, player.y, 520);
            if (pos) {
                this.pirates.push({
                    id: 'pirate_' + this.nextId++, x: pos.x, y: pos.y,
                    heading: Math.random() * Math.PI * 2, health: 110, maxHealth: 110,
                    attackCooldown: 0, patrolTimer: 2 + Math.random() * 5
                });
            }
        }
    }
    findWaterPosition(world, px, py, minDistance) {
        for (let attempt = 0; attempt < 300; attempt++) {
            const tx = Math.floor(Math.random() * world.width);
            const ty = Math.floor(Math.random() * world.height);
            if (world.getTile(tx, ty) !== 0) continue;
            const x = tx * world.tileSize + world.tileSize / 2;
            const y = ty * world.tileSize + world.tileSize / 2;
            if (Math.hypot(x - px, y - py) >= minDistance) return { x, y };
        }
        return null;
    }
    update(dt, game) {
        for (const pirate of this.pirates) {
            pirate.attackCooldown = Math.max(0, pirate.attackCooldown - dt);
            pirate.patrolTimer -= dt;
            const player = game.player;
            const dist = Math.hypot(player.x - pirate.x, player.y - pirate.y);
            let heading = pirate.heading;
            let speed = 22;
            if (player.inBoat && dist < 340) {
                heading = Math.atan2(player.y - pirate.y, player.x - pirate.x);
                speed = 45;
                if (dist < 120 && pirate.attackCooldown <= 0) {
                    pirate.attackCooldown = 2.1;
                    const armorReduction = player.inventory && player.inventory.hasItem('metal_armor', 1) ? 0.6 : 1.0;
                    player.health = Math.max(0, player.health - Math.round(7 * armorReduction));
                    game.showNotification('Пірати відкрили вогонь по вашому човну!', 'danger');
                }
            } else if (pirate.patrolTimer <= 0) {
                pirate.heading += (Math.random() - 0.5) * 1.8;
                pirate.patrolTimer = 3 + Math.random() * 5;
            }
            pirate.heading = heading;
            const nx = pirate.x + Math.cos(heading) * speed * dt;
            const ny = pirate.y + Math.sin(heading) * speed * dt;
            if (game.world.isWater(nx, ny)) {
                pirate.x = nx;
                pirate.y = ny;
            } else {
                pirate.heading += Math.PI * 0.7;
            }
        }
    }
    getNearest(x, y, range) {
        let closest = null;
        let distance = range;
        for (const pirate of this.pirates) {
            const d = Math.hypot(pirate.x - x, pirate.y - y);
            if (d <= distance) { closest = pirate; distance = d; }
        }
        return closest;
    }
    damage(pirate, amount, game) {
        if (!pirate) return false;
        pirate.health -= amount;
        if (pirate.health > 0) return false;
        this.pirates = this.pirates.filter(p => p.id !== pirate.id);
        game.world.addDroppedItem('ammo', 8 + Math.floor(Math.random() * 8), pirate.x, pirate.y);
        game.world.addDroppedItem('canned_food', 1 + Math.floor(Math.random() * 2), pirate.x + 12, pirate.y);
        return true;
    }
    draw(ctx, camera) {
        for (const pirate of this.pirates) {
            if (!camera.isVisible(pirate.x, pirate.y, 90)) continue;
            const pos = camera.worldToScreen(pirate.x, pirate.y);
            ctx.save();
            ctx.translate(pos.x, pos.y);
            ctx.rotate(pirate.heading);
            ctx.fillStyle = 'rgba(0,0,0,0.28)';
            ctx.beginPath(); ctx.ellipse(2, 12, 27, 7, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#3E2723';
            ctx.beginPath(); ctx.moveTo(-28, 2); ctx.lineTo(-18, 10); ctx.lineTo(20, 10); ctx.lineTo(30, 2); ctx.lineTo(20, -5); ctx.lineTo(-18, -5); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#111827'; ctx.fillRect(-5, -34, 4, 32);
            ctx.fillStyle = '#202020';
            ctx.beginPath(); ctx.moveTo(-3, -31); ctx.lineTo(20, -15); ctx.lineTo(-3, -5); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#B91C1C'; ctx.fillRect(-4, -39, 14, 9);
            ctx.fillStyle = '#F8FAFC'; ctx.font = '10px Arial'; ctx.fillText('☠', -2, -31);
            ctx.fillStyle = '#991B1B'; ctx.fillRect(-22, 0, 12, 3); ctx.fillRect(10, 0, 12, 3);
            ctx.restore();
        }
    }
    serialize() { return { pirates: this.pirates, nextId: this.nextId }; }
    static deserialize(data) {
        const manager = new PirateManager();
        manager.pirates = (data && data.pirates) || [];
        manager.nextId = (data && data.nextId) || manager.pirates.length;
        return manager;
    }
}

class NightZombieManager {
    constructor() {
        this.zombies = [];
        this.nextId = 0;
        this.spawnTimer = 0;
        this.activeNight = 0;
    }
    spawn(game) {
        const world = game.world;
        const player = game.player;
        for (let attempt = 0; attempt < 180; attempt++) {
            const tx = Math.floor(Math.random() * world.width);
            const ty = Math.floor(Math.random() * world.height);
            const tile = world.getTile(tx, ty);
            if (tile !== 2 && tile !== 3 && tile !== 4) continue;
            const x = tx * world.tileSize + world.tileSize / 2;
            const y = ty * world.tileSize + world.tileSize / 2;
            const dist = Math.hypot(x - player.x, y - player.y);
            if (dist < 180 || dist > 430) continue;
            this.zombies.push({ id: 'zombie_' + this.nextId++, x, y, health: 65, maxHealth: 65, attackCooldown: 0, step: Math.random() * 6 });
            return true;
        }
        return false;
    }
    update(dt, game) {
        const time = game.timeSystem;
        if (!time || !time.isNight()) {
            this.zombies = [];
            this.spawnTimer = 0;
            return;
        }
        if (this.activeNight !== time.day) {
            this.activeNight = time.day;
            this.zombies = [];
            for (let i = 0; i < 3; i++) this.spawn(game);
            game.showNotification('Ніч настала: зомбі вийшли на полювання.', 'warning');
        }
        this.spawnTimer += dt;
        if (this.spawnTimer > 18 && this.zombies.length < 8) {
            this.spawnTimer = 0;
            this.spawn(game);
        }
        for (const zombie of this.zombies) {
            zombie.attackCooldown = Math.max(0, zombie.attackCooldown - dt);
            zombie.step += dt * 7;
            const dx = game.player.x - zombie.x;
            const dy = game.player.y - zombie.y;
            const dist = Math.hypot(dx, dy);
            if (dist > 26 && !game.player.inBoat) {
                const speed = 38;
                const nx = zombie.x + dx / dist * speed * dt;
                const ny = zombie.y + dy / dist * speed * dt;
                const tile = game.world.getTileAtWorld(nx, ny);
                if (tile === 2 || tile === 3 || tile === 4) {
                    zombie.x = nx;
                    zombie.y = ny;
                }
            } else if (dist < 32 && zombie.attackCooldown <= 0 && !game.player.inBoat) {
                zombie.attackCooldown = 1.15;
                const armorMod = game.player.inventory && game.player.inventory.hasItem('metal_armor', 1) ? 0.6 : 1.0;
                game.player.health = Math.max(0, game.player.health - Math.round(5 * armorMod));
                game.showNotification('Зомбі вкусив вас!', 'danger');
            }
        }
    }
    getNearest(x, y, range) {
        let closest = null;
        let distance = range;
        for (const zombie of this.zombies) {
            const d = Math.hypot(zombie.x - x, zombie.y - y);
            if (d <= distance) { closest = zombie; distance = d; }
        }
        return closest;
    }
    damage(zombie, amount, game) {
        if (!zombie) return false;
        zombie.health -= amount;
        if (zombie.health > 0) return false;
        this.zombies = this.zombies.filter(z => z.id !== zombie.id);
        if (Math.random() < 0.3) game.world.addDroppedItem('ammo', 2 + Math.floor(Math.random() * 4), zombie.x, zombie.y);
        return true;
    }
    draw(ctx, camera) {
        for (const zombie of this.zombies) {
            if (!camera.isVisible(zombie.x, zombie.y, 40)) continue;
            const pos = camera.worldToScreen(zombie.x, zombie.y);
            ctx.save();
            ctx.translate(pos.x, pos.y + Math.sin(zombie.step) * 1.5);
            ctx.fillStyle = 'rgba(0,0,0,0.28)'; ctx.beginPath(); ctx.ellipse(0, 12, 11, 4, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#475F3A'; ctx.fillRect(-8, -5, 16, 20);
            ctx.fillStyle = '#7A9B55'; ctx.beginPath(); ctx.arc(0, -12, 10, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#EF4444'; ctx.fillRect(-5, -14, 3, 3); ctx.fillRect(3, -14, 3, 3);
            ctx.strokeStyle = '#6B4226'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-7, 0); ctx.lineTo(-15, 6); ctx.moveTo(7, 0); ctx.lineTo(15, 6); ctx.stroke();
            ctx.fillStyle = '#334155'; ctx.fillRect(-7, 15, 5, 8); ctx.fillRect(2, 15, 5, 8);
            ctx.restore();
        }
    }
    serialize() { return { zombies: this.zombies, nextId: this.nextId, spawnTimer: this.spawnTimer, activeNight: this.activeNight }; }
    static deserialize(data) {
        const manager = new NightZombieManager();
        manager.zombies = (data && data.zombies) || [];
        manager.nextId = (data && data.nextId) || manager.zombies.length;
        manager.spawnTimer = (data && data.spawnTimer) || 0;
        manager.activeNight = (data && data.activeNight) || 0;
        return manager;
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
        this.lastAttackAt = 0;
        this.shotTracers = [];
        
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
        this.boat = this.createStartingBoat();
        this.crashSites = [];
        
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
        this.pirateManager = new PirateManager();
        this.pirateManager.init(this.world, this.player);
        this.zombieManager = new NightZombieManager();
        
        if (this.player.inventory && window.ITEM_DB) {
            this.player.inventory.addItem('branch', 5);
            this.player.inventory.addItem('stone', 2);
            this.player.inventory.addItem('berry', 5);
        }

        // --- EXPANSION SYSTEMS INITIALIZATION ---
        this.fortPirates = [
            { id: 'fp_1', x: 99 * this.tileSize, y: 88 * this.tileSize, health: 80, maxHealth: 80, speed: 45, attackCd: 0 },
            { id: 'fp_2', x: 102 * this.tileSize, y: 92 * this.tileSize, health: 80, maxHealth: 80, speed: 45, attackCd: 0 },
            { id: 'fp_3', x: 96 * this.tileSize, y: 94 * this.tileSize, health: 80, maxHealth: 80, speed: 45, attackCd: 0 }
        ];

        this.treasureChests = [
            { id: 'tc_1', x: 100 * this.tileSize, y: 90 * this.tileSize, looted: false },
            { id: 'tc_2', x: 98 * this.tileSize, y: 93 * this.tileSize, looted: false }
        ];

        this.villageTrader = {
            id: 'v_trader',
            x: 99 * this.tileSize,
            y: 23 * this.tileSize,
            name: 'Торговець'
        };

        this.pirateRaidTimer = 240 + Math.random() * 120; // First raid in 4-6 minutes
        this.activeRaidPirates = [];

        this.evacuationState = 'idle'; // 'idle', 'active', 'helicopter_arrived', 'won'
        this.evacuationTimer = 180; // 3 minutes survival
        this.helicopter = null;
    }

    createStartingBoat() {
        let best = null;
        let bestDistance = Infinity;
        for (let y = 0; y < this.world.height; y++) {
            for (let x = 0; x < this.world.width; x++) {
                if (this.world.getTile(x, y) !== 1) continue;
                const wx = x * this.tileSize + this.tileSize / 2;
                const wy = y * this.tileSize + this.tileSize / 2;
                const dist = Math.hypot(wx - this.player.x, wy - this.player.y);
                if (dist < bestDistance) {
                    best = { x: wx, y: wy };
                    bestDistance = dist;
                }
            }
        }
        return { x: best ? best.x : this.player.x + 40, y: best ? best.y : this.player.y + 40, heading: 0 };
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
        this.boat = data.boat || this.createStartingBoat();
        if (this.player.inBoat) {
            this.boat.x = this.player.x;
            this.boat.y = this.player.y;
        }
        this.crashSites = data.crashSites || [];
        
        if (this.systemsLoaded) {
            this.timeSystem = window.TimeSystem.deserialize(data.timeSystem);
            this.weatherSystem = window.WeatherSystem.deserialize(data.weatherSystem);
            this.survivalSystem = new window.SurvivalSystem(); 
            this.buildingSystem = window.BuildingSystem.deserialize(data.buildingSystem);
            this.craftingSystem = window.CraftingSystem.deserialize(data.craftingSystem);
            this.questSystem = window.QuestSystem.deserialize(data.questSystem);
            this.eventSystem = window.EventSystem.deserialize(data.eventSystem);
            // Older saves did not have the crash timer. Give them a nearby first
            // event instead of making players wait through the old cooldown.
            if (!data.eventSystem || data.eventSystem.nextPlaneCrashTime === undefined) {
                this.eventSystem.nextPlaneCrashTime = this.timeSystem.totalTime + 15;
            }
        }
        
        if (window.AnimalManager && data.animalManager) {
            this.animalManager = window.AnimalManager.deserialize(data.animalManager);
        }
        this.pirateManager = PirateManager.deserialize(data.pirateManager);
        if (this.pirateManager.pirates.length === 0) this.pirateManager.init(this.world, this.player);
        this.zombieManager = NightZombieManager.deserialize(data.zombieManager);
        
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

        // --- 1. Evacuation Timer & Waves ---
        if (this.evacuationState === 'active') {
            this.evacuationTimer -= dt;
            const hud = document.getElementById('sos-hud');
            const timerEl = document.getElementById('sos-timer');
            if (hud) {
                hud.classList.remove('hidden');
                hud.style.display = 'flex';
            }
            if (timerEl) {
                const mins = Math.floor(Math.max(0, this.evacuationTimer) / 60);
                const secs = Math.floor(Math.max(0, this.evacuationTimer) % 60);
                timerEl.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            }

            // Spawn assault waves
            if (Math.random() < dt * 0.35 && this.zombieManager) {
                const angle = Math.random() * Math.PI * 2;
                const dist = 320;
                this.zombieManager.zombies.push({
                    id: 'sos_z_' + Date.now(),
                    x: this.player.x + Math.cos(angle) * dist,
                    y: this.player.y + Math.sin(angle) * dist,
                    health: 45, maxHealth: 45, attackCooldown: 0
                });
            }

            if (this.evacuationTimer <= 0) {
                this.evacuationState = 'helicopter_arrived';
                this.helicopter = {
                    x: this.player.x,
                    y: this.player.y - 40,
                    landed: true,
                    rotorAngle: 0
                };
                if (window.soundSystem) window.soundSystem.playHelicopter(5.0);
                this.showNotification('🚁 РЯТУВАЛЬНИЙ ГЕЛІКОПТЕР ПРИБУВ! Сядьте в гелікоптер на клавішу [E]!', 'success');
            }
        }

        // --- 2. Random Pirate Raids ---
        this.pirateRaidTimer -= dt;
        if (this.pirateRaidTimer <= 0 && this.activeRaidPirates.length === 0) {
            this.pirateRaidTimer = 300 + Math.random() * 180;
            this.triggerPirateRaid();
        }

        // Update active raid pirates
        for (let i = this.activeRaidPirates.length - 1; i >= 0; i--) {
            const rp = this.activeRaidPirates[i];
            const dist = Math.hypot(this.player.x - rp.x, this.player.y - rp.y);
            if (dist > 28) {
                rp.x += ((this.player.x - rp.x) / dist) * rp.speed * dt;
                rp.y += ((this.player.y - rp.y) / dist) * rp.speed * dt;
            } else {
                rp.attackCd = (rp.attackCd || 0) - dt;
                if (rp.attackCd <= 0) {
                    rp.attackCd = 1.4;
                    const armorMod = this.player.inventory && this.player.inventory.hasItem('metal_armor', 1) ? 0.6 : 1.0;
                    this.player.health = Math.max(0, this.player.health - Math.round(8 * armorMod));
                    this.showNotification('Пірат завдав вам удару шаблею!', 'danger');
                }
            }
            if (rp.health <= 0) {
                this.activeRaidPirates.splice(i, 1);
                this.world.addDroppedItem('gold_coin', 1 + Math.floor(Math.random() * 2), rp.x, rp.y);
                this.world.addDroppedItem('ammo', 3 + Math.floor(Math.random() * 5), rp.x, rp.y);
                this.player.addXP(25);
            }
        }

        // --- 3. Fort Pirates update ---
        if (this.fortPirates) {
            for (const fp of this.fortPirates) {
                if (fp.health <= 0) continue;
                const d = Math.hypot(this.player.x - fp.x, this.player.y - fp.y);
                if (d < 220) {
                    if (d > 30) {
                        fp.x += ((this.player.x - fp.x) / d) * fp.speed * dt;
                        fp.y += ((this.player.y - fp.y) / d) * fp.speed * dt;
                    } else {
                        fp.attackCd = (fp.attackCd || 0) - dt;
                        if (fp.attackCd <= 0) {
                            fp.attackCd = 1.3;
                            const armorMod = this.player.inventory && this.player.inventory.hasItem('metal_armor', 1) ? 0.6 : 1.0;
                            this.player.health = Math.max(0, this.player.health - Math.round(9 * armorMod));
                            this.showNotification('Охоронець форту атакував вас!', 'danger');
                        }
                    }
                }
            }
        }

        // --- 4. Base Defense: Spikes & Spotlight ---
        if (this.buildingSystem) {
            const spikesList = this.buildingSystem.buildings.filter(b => b.type === 'spikes');
            const spotlights = this.buildingSystem.buildings.filter(b => b.type === 'spotlight' && b.active);

            // Spikes damage enemies
            for (const sp of spikesList) {
                if (this.zombieManager) {
                    for (const z of this.zombieManager.zombies) {
                        if (Math.hypot(z.x - sp.x, z.y - sp.y) < 26) {
                            z.health -= 25 * dt;
                            if (Math.random() < dt * 2) this.spawnParticles(z.x, z.y, '#DC2626', 4);
                        }
                    }
                }
                for (const rp of this.activeRaidPirates) {
                    if (Math.hypot(rp.x - sp.x, rp.y - sp.y) < 26) {
                        rp.health -= 25 * dt;
                    }
                }
            }

            // Spotlight burns and repels zombies at night
            if (this.systemsLoaded && this.timeSystem.isNight()) {
                for (const spot of spotlights) {
                    if (this.zombieManager) {
                        for (const z of this.zombieManager.zombies) {
                            const d = Math.hypot(z.x - spot.x, z.y - spot.y);
                            if (d < 140) {
                                z.health -= 20 * dt;
                                z.x += ((z.x - spot.x) / d) * 50 * dt;
                                z.y += ((z.y - spot.y) / d) * 50 * dt;
                            }
                        }
                    }
                }
            }
        }
        
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
        if (this.input.wasPressed('f') || this.input.wasPressed(' ') || this.input.wasPressed('Space')) {
            this.attack();
        }
        // Holding the left mouse button fires toward the cursor. The weapon's
        // own cooldown controls pistol shots versus automatic fire.
        if (!this.buildMode && (this.input.clicked || this.input.shotClicked) && !this.input.joystickActive) {
            this.attack(this.input.mouseWorldX, this.input.mouseWorldY, true);
        }
        this.input.shotClicked = false;
        
        this.player.update(dt, this.input, this.world, this.buildingSystem);
        if (this.player.inBoat && this.boat) {
            this.boat.x = this.player.x;
            this.boat.y = this.player.y;
            const directionToAngle = [Math.PI / 2, Math.PI, 0, -Math.PI / 2];
            this.boat.heading = directionToAngle[this.player.direction] || 0;
        }
        this.camera.follow(this.player.x, this.player.y, dt);
        this.particles.update(dt);
        for (let i = this.shotTracers.length - 1; i >= 0; i--) {
            this.shotTracers[i].life -= dt;
            if (this.shotTracers[i].life <= 0) this.shotTracers.splice(i, 1);
        }
        
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
                this.handleWorldEvent(event);
            }
            
            if (this.zombieManager) this.zombieManager.update(dt, this);
            if (this.pirateManager) this.pirateManager.update(dt, this);
            
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
        this.drawCrashSites();
        this.drawBoat();
        if (this.pirateManager) this.pirateManager.draw(this.ctx, this.camera);
        
        if (this.buildingSystem) {
            for (let b of this.buildingSystem.buildings) {
                if (!this.camera.isVisible(b.x, b.y)) continue;
                let pos = this.camera.worldToScreen(b.x, b.y);
                let bDef = window.BUILDING_DB[b.type];
                this.drawBuilding(b, pos, bDef);
            }
        }

        // Draw Village Trader
        if (this.villageTrader && this.camera.isVisible(this.villageTrader.x, this.villageTrader.y)) {
            const pos = this.camera.worldToScreen(this.villageTrader.x, this.villageTrader.y);
            this.ctx.fillStyle = '#059669';
            this.ctx.beginPath(); this.ctx.arc(pos.x, pos.y, 14, 0, Math.PI * 2); this.ctx.fill();
            this.ctx.fillStyle = '#FEF08A';
            this.ctx.beginPath(); this.ctx.arc(pos.x, pos.y - 12, 7, 0, Math.PI * 2); this.ctx.fill();
            this.ctx.fillStyle = '#10B981';
            this.ctx.font = 'bold 12px sans-serif'; this.ctx.textAlign = 'center';
            this.ctx.fillText('Торговець', pos.x, pos.y - 24);
        }

        // Draw Treasure Chests
        if (this.treasureChests) {
            for (const tc of this.treasureChests) {
                if (!tc.looted && this.camera.isVisible(tc.x, tc.y)) {
                    const pos = this.camera.worldToScreen(tc.x, tc.y);
                    this.ctx.fillStyle = '#B45309';
                    this.ctx.fillRect(pos.x - 12, pos.y - 10, 24, 20);
                    this.ctx.fillStyle = '#F59E0B';
                    this.ctx.fillRect(pos.x - 12, pos.y - 2, 24, 4);
                    this.ctx.fillStyle = '#FEF08A';
                    this.ctx.beginPath(); this.ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2); this.ctx.fill();
                }
            }
        }

        // Draw Fort Pirates & Raid Pirates
        const allPirates = (this.fortPirates || []).concat(this.activeRaidPirates || []);
        for (const p of allPirates) {
            if (p.health > 0 && this.camera.isVisible(p.x, p.y)) {
                const pos = this.camera.worldToScreen(p.x, p.y);
                this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
                this.ctx.beginPath(); this.ctx.ellipse(pos.x, pos.y + 10, 10, 5, 0, 0, Math.PI * 2); this.ctx.fill();
                this.ctx.fillStyle = '#DC2626';
                this.ctx.fillRect(pos.x - 8, pos.y - 6, 16, 16);
                this.ctx.fillStyle = '#FBBF24';
                this.ctx.beginPath(); this.ctx.arc(pos.x, pos.y - 10, 7, 0, Math.PI * 2); this.ctx.fill();
                this.ctx.fillStyle = '#1E293B';
                this.ctx.fillRect(pos.x - 11, pos.y - 18, 22, 5);
                this.ctx.fillStyle = '#EF4444';
                this.ctx.fillRect(pos.x - 12, pos.y - 24, 24, 3);
                this.ctx.fillStyle = '#22C55E';
                this.ctx.fillRect(pos.x - 12, pos.y - 24, 24 * (p.health / p.maxHealth), 3);
            }
        }

        // Draw Rescue Helicopter
        if (this.helicopter && this.camera.isVisible(this.helicopter.x, this.helicopter.y)) {
            const pos = this.camera.worldToScreen(this.helicopter.x, this.helicopter.y);
            this.ctx.fillStyle = '#1E3A8A';
            this.ctx.fillRect(pos.x - 28, pos.y - 16, 56, 32);
            this.ctx.fillStyle = '#3B82F6';
            this.ctx.fillRect(pos.x + 12, pos.y - 12, 16, 24);
            this.ctx.fillStyle = '#1E293B';
            this.ctx.fillRect(pos.x - 52, pos.y - 6, 26, 12);
            this.helicopter.rotorAngle = (this.helicopter.rotorAngle || 0) + 0.35;
            this.ctx.strokeStyle = '#94A3B8'; this.ctx.lineWidth = 4;
            this.ctx.beginPath();
            this.ctx.moveTo(pos.x + Math.cos(this.helicopter.rotorAngle) * 55, pos.y - 22 + Math.sin(this.helicopter.rotorAngle) * 8);
            this.ctx.lineTo(pos.x - Math.cos(this.helicopter.rotorAngle) * 55, pos.y - 22 - Math.sin(this.helicopter.rotorAngle) * 8);
            this.ctx.stroke();
            this.ctx.fillStyle = '#10B981';
            this.ctx.font = 'bold 14px sans-serif'; this.ctx.textAlign = 'center';
            this.ctx.fillText('🚁 ЗОНА ЕВАКУАЦІЇ', pos.x, pos.y + 32);
        }
        
        if (this.animalManager) {
            for (let a of this.animalManager.animals) {
                if (this.camera.isVisible(a.x, a.y)) a.draw(this.ctx, this.camera);
            }
            for (let d of this.animalManager.dogs) {
                if (this.camera.isVisible(d.x, d.y)) d.draw(this.ctx, this.camera);
            }
        }
        if (this.zombieManager) this.zombieManager.draw(this.ctx, this.camera);
        
        this.player.draw(this.ctx, this.camera);
        this.particles.draw(this.ctx, this.camera);
        this.drawShotTracers();
        
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
        this.drawCrosshair();
        this.input.drawJoystick(this.ctx);
    }
    
    drawCrosshair() {
        const item = this.player && this.player.equippedTool && window.ITEM_DB[this.player.equippedTool];
        if (!item || item.category !== 'weapon' || this.input.joystickActive) return;
        const x = this.input.mouseX;
        const y = this.input.mouseY;
        if (x < 0 || y < 0 || x > this.canvas.width || y > this.canvas.height) return;
        this.ctx.save();
        this.ctx.strokeStyle = '#FDE047';
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath(); this.ctx.arc(x, y, 10, 0, Math.PI * 2); this.ctx.stroke();
        this.ctx.beginPath(); this.ctx.moveTo(x - 15, y); this.ctx.lineTo(x - 5, y); this.ctx.moveTo(x + 5, y); this.ctx.lineTo(x + 15, y); this.ctx.moveTo(x, y - 15); this.ctx.lineTo(x, y - 5); this.ctx.moveTo(x, y + 5); this.ctx.lineTo(x, y + 15); this.ctx.stroke();
        this.ctx.restore();
    }

    drawShotTracers() {
        if (!this.shotTracers.length) return;
        this.ctx.save();
        this.ctx.lineCap = 'round';
        for (const shot of this.shotTracers) {
            const start = this.camera.worldToScreen(shot.x, shot.y);
            const end = this.camera.worldToScreen(shot.endX, shot.endY);
            this.ctx.globalAlpha = Math.max(0, shot.life / shot.maxLife);
            this.ctx.strokeStyle = '#FDE047';
            this.ctx.lineWidth = 2.5;
            this.ctx.beginPath(); this.ctx.moveTo(start.x, start.y); this.ctx.lineTo(end.x, end.y); this.ctx.stroke();
            this.ctx.strokeStyle = '#FFFFFF';
            this.ctx.lineWidth = 0.8;
            this.ctx.beginPath(); this.ctx.moveTo(start.x, start.y); this.ctx.lineTo(end.x, end.y); this.ctx.stroke();
        }
        this.ctx.restore();
    }

    drawBoat() {
        if (!this.boat || !this.camera.isVisible(this.boat.x, this.boat.y, 80)) return;
        const pos = this.camera.worldToScreen(this.boat.x, this.boat.y);
        const bob = Math.sin((this.systemsLoaded ? this.timeSystem.totalTime : 0) * 2.2) * 1.5;
        this.ctx.save();
        this.ctx.translate(pos.x, pos.y + bob);
        this.ctx.rotate(this.boat.heading || 0);
        this.ctx.fillStyle = 'rgba(0,0,0,0.25)';
        this.ctx.beginPath(); this.ctx.ellipse(1, 14, 27, 7, 0, 0, Math.PI * 2); this.ctx.fill();
        this.ctx.fillStyle = '#754022';
        this.ctx.beginPath(); this.ctx.moveTo(-30, 0); this.ctx.lineTo(-20, 12); this.ctx.lineTo(20, 12); this.ctx.lineTo(31, 0); this.ctx.lineTo(20, -7); this.ctx.lineTo(-20, -7); this.ctx.closePath(); this.ctx.fill();
        this.ctx.strokeStyle = '#3F2315'; this.ctx.lineWidth = 2; this.ctx.stroke();
        this.ctx.fillStyle = '#B8793E'; this.ctx.fillRect(-5, -37, 4, 34);
        this.ctx.fillStyle = '#F7E7C6';
        this.ctx.beginPath(); this.ctx.moveTo(-2, -34); this.ctx.lineTo(20, -16); this.ctx.lineTo(-2, -5); this.ctx.closePath(); this.ctx.fill();
        this.ctx.strokeStyle = '#D1B98B'; this.ctx.stroke();
        if (this.player && this.player.inBoat) {
            this.ctx.fillStyle = '#1565C0'; this.ctx.fillRect(-15, -8, 8, 11);
            this.ctx.fillStyle = '#FFB74D'; this.ctx.beginPath(); this.ctx.arc(-11, -12, 4, 0, Math.PI * 2); this.ctx.fill();
        }
        this.ctx.restore();
    }

    drawCrashSites() {
        if (!this.crashSites) return;
        const time = this.systemsLoaded ? this.timeSystem.totalTime : 0;
        for (const site of this.crashSites) {
            if (!this.camera.isVisible(site.x, site.y, 100)) continue;
            const pos = this.camera.worldToScreen(site.x, site.y);
            this.ctx.save();
            this.ctx.translate(pos.x, pos.y);
            this.ctx.fillStyle = 'rgba(0,0,0,0.32)'; this.ctx.beginPath(); this.ctx.ellipse(0, 18, 40, 10, 0, 0, Math.PI * 2); this.ctx.fill();
            this.ctx.rotate(-0.28);
            this.ctx.fillStyle = '#9CA3AF'; this.ctx.fillRect(-34, -8, 56, 14);
            this.ctx.fillStyle = '#4B5563'; this.ctx.fillRect(-12, -19, 34, 5);
            this.ctx.fillStyle = '#6B7280'; this.ctx.fillRect(-27, 4, 36, 13);
            this.ctx.fillStyle = '#374151'; this.ctx.fillRect(16, -14, 5, 28);
            this.ctx.fillStyle = '#1F2937'; this.ctx.fillRect(-7, -5, 10, 7);
            this.ctx.restore();
            if (!site.looted) {
                this.ctx.fillStyle = `rgba(48,48,48,${0.55 + Math.sin(time * 3) * 0.15})`;
                for (let i = 0; i < 4; i++) {
                    const offset = Math.sin(time * 2 + i) * 7;
                    this.ctx.beginPath(); this.ctx.arc(pos.x - 8 + i * 7 + offset, pos.y - 26 - i * 9, 9 + i * 2, 0, Math.PI * 2); this.ctx.fill();
                }
                this.ctx.fillStyle = '#F97316'; this.ctx.beginPath(); this.ctx.arc(pos.x - 5, pos.y + 12, 6 + Math.sin(time * 8) * 2, 0, Math.PI * 2); this.ctx.fill();
            }
        }
    }

    drawBuilding(building, pos, bDef) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(pos.x, pos.y);
        if (building.type === 'wooden_house') {
            const w = bDef.width, h = bDef.height;
            ctx.fillStyle = 'rgba(0,0,0,0.28)'; ctx.beginPath(); ctx.ellipse(0, h / 2 - 2, w * 0.58, 10, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#77716A'; ctx.fillRect(-w / 2 + 4, h / 2 - 12, w - 8, 10);
            ctx.fillStyle = '#A96A38'; ctx.fillRect(-w / 2 + 7, -h / 2 + 3, w - 14, h - 18);
            ctx.strokeStyle = '#70411F'; ctx.lineWidth = 1;
            for (let y = -h / 2 + 10; y < h / 2 - 15; y += 9) { ctx.beginPath(); ctx.moveTo(-w / 2 + 8, y); ctx.lineTo(w / 2 - 8, y); ctx.stroke(); }
            ctx.fillStyle = '#6E3020';
            ctx.beginPath(); ctx.moveTo(-w / 2 - 7, -h / 2 + 8); ctx.lineTo(0, -h / 2 - 24); ctx.lineTo(w / 2 + 7, -h / 2 + 8); ctx.closePath(); ctx.fill();
            ctx.strokeStyle = '#4B1D14'; ctx.lineWidth = 2; ctx.stroke();
            ctx.fillStyle = '#5B3A29'; ctx.fillRect(w / 2 - 21, -h / 2 - 18, 10, 24);
            ctx.fillStyle = '#4A2A19'; ctx.fillRect(-9, h / 2 - 34, 18, 25);
            ctx.fillStyle = '#D8B56A'; ctx.beginPath(); ctx.arc(5, h / 2 - 21, 1.5, 0, Math.PI * 2); ctx.fill();
            const lit = this.systemsLoaded && this.timeSystem.isNight();
            ctx.fillStyle = lit ? '#FDE68A' : '#8FC4D9'; ctx.fillRect(-w / 2 + 14, -5, 16, 14);
            ctx.strokeStyle = '#5A3823'; ctx.strokeRect(-w / 2 + 14, -5, 16, 14);
            ctx.beginPath(); ctx.moveTo(-w / 2 + 22, -5); ctx.lineTo(-w / 2 + 22, 9); ctx.moveTo(-w / 2 + 14, 2); ctx.lineTo(-w / 2 + 30, 2); ctx.stroke();
            if (lit) { ctx.fillStyle = 'rgba(255,213,102,0.16)'; ctx.beginPath(); ctx.arc(-w / 2 + 22, 2, 45, 0, Math.PI * 2); ctx.fill(); }
            ctx.restore();
            return;
        }
        if (building.type === 'bridge') {
            ctx.fillStyle = '#8B6914';
            ctx.fillRect(-bDef.width / 2, -bDef.height / 2, bDef.width, bDef.height);
            ctx.strokeStyle = '#5A3E0A'; ctx.lineWidth = 2;
            // Draw planks
            for (let py2 = -bDef.height/2 + 4; py2 < bDef.height/2; py2 += 10) {
                ctx.beginPath();
                ctx.moveTo(-bDef.width/2, py2);
                ctx.lineTo(bDef.width/2, py2);
                ctx.stroke();
            }
            // Railings
            ctx.strokeStyle = '#6B3A10'; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(-bDef.width/2+2, -bDef.height/2); ctx.lineTo(-bDef.width/2+2, bDef.height/2); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(bDef.width/2-2, -bDef.height/2); ctx.lineTo(bDef.width/2-2, bDef.height/2); ctx.stroke();
            ctx.restore();
            return;
        }
        if (building.type === 'dock') {
            ctx.fillStyle = '#A0784D';
            ctx.fillRect(-bDef.width / 2, -bDef.height / 2, bDef.width, bDef.height);
            ctx.strokeStyle = '#5A3E0A'; ctx.lineWidth = 2;
            for (let px2 = -bDef.width/2 + 8; px2 < bDef.width/2; px2 += 12) {
                ctx.beginPath(); ctx.moveTo(px2, -bDef.height/2); ctx.lineTo(px2, bDef.height/2); ctx.stroke();
            }
            ctx.strokeStyle = '#4A2E08'; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(-bDef.width/2, -bDef.height/2+2); ctx.lineTo(bDef.width/2, -bDef.height/2+2); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(-bDef.width/2, bDef.height/2-2); ctx.lineTo(bDef.width/2, bDef.height/2-2); ctx.stroke();
            // Mooring post
            ctx.fillStyle = '#5A3210'; ctx.beginPath(); ctx.arc(bDef.width/2 - 6, 0, 5, 0, Math.PI*2); ctx.fill();
            ctx.restore();
            return;
        }
        ctx.fillStyle = '#A0522D';
        ctx.fillRect(-bDef.width / 2, -bDef.height / 2, bDef.width, bDef.height);
        ctx.strokeStyle = '#3F2315'; ctx.strokeRect(-bDef.width / 2, -bDef.height / 2, bDef.width, bDef.height);
        if (building.type === 'fence') {
            ctx.fillStyle = '#78350F';
            ctx.fillRect(-bDef.width/2 + 2, -bDef.height/2, 6, bDef.height);
            ctx.fillRect(bDef.width/2 - 8, -bDef.height/2, 6, bDef.height);
            ctx.fillStyle = '#92400E';
            ctx.fillRect(-bDef.width/2, -bDef.height/4, bDef.width, 6);
            ctx.fillRect(-bDef.width/2, bDef.height/4 - 6, bDef.width, 6);
            ctx.restore();
            return;
        }
        if (building.type === 'gate') {
            ctx.fillStyle = '#78350F';
            ctx.fillRect(-bDef.width/2, -bDef.height/2, 5, bDef.height);
            ctx.fillRect(bDef.width/2 - 5, -bDef.height/2, 5, bDef.height);
            if (!building.isOpen) {
                ctx.fillStyle = '#B45309';
                ctx.fillRect(-bDef.width/2 + 5, -bDef.height/2 + 4, bDef.width - 10, bDef.height - 8);
                ctx.fillStyle = '#FEF08A';
                ctx.beginPath(); ctx.arc(2, 0, 2, 0, Math.PI * 2); ctx.fill();
            } else {
                ctx.fillStyle = 'rgba(180, 83, 9, 0.4)';
                ctx.fillRect(-bDef.width/2 + 5, -bDef.height/2 + 4, 6, bDef.height - 8);
            }
            ctx.restore();
            return;
        }
        if (building.type === 'spikes') {
            ctx.fillStyle = '#374151';
            ctx.fillRect(-bDef.width/2, bDef.height/2 - 6, bDef.width, 6);
            ctx.fillStyle = '#9CA3AF';
            for (let sx = -bDef.width/2 + 4; sx <= bDef.width/2 - 4; sx += 8) {
                ctx.beginPath();
                ctx.moveTo(sx, bDef.height/2 - 6);
                ctx.lineTo(sx + 3, -bDef.height/2 + 4);
                ctx.lineTo(sx + 6, bDef.height/2 - 6);
                ctx.closePath();
                ctx.fill();
            }
            ctx.restore();
            return;
        }
        if (building.type === 'spotlight') {
            ctx.fillStyle = '#4B5563';
            ctx.fillRect(-6, 2, 12, bDef.height/2 - 2);
            ctx.fillStyle = building.active ? '#FEF08A' : '#6B7280';
            ctx.beginPath(); ctx.arc(0, -6, 10, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#1F2937'; ctx.lineWidth = 2; ctx.stroke();
            if (building.active) {
                ctx.fillStyle = 'rgba(254, 240, 138, 0.22)';
                ctx.beginPath(); ctx.arc(0, -6, 140, 0, Math.PI * 2); ctx.fill();
            }
            ctx.restore();
            return;
        }
        if (building.type === 'animal_pen') {
            ctx.strokeStyle = '#854D0E'; ctx.lineWidth = 3;
            ctx.strokeRect(-bDef.width/2, -bDef.height/2, bDef.width, bDef.height);
            // Straw inside
            ctx.fillStyle = 'rgba(234, 179, 8, 0.25)';
            ctx.fillRect(-bDef.width/2 + 4, -bDef.height/2 + 4, bDef.width - 8, bDef.height - 8);
            ctx.fillStyle = '#78350F';
            ctx.fillRect(-bDef.width/4, -bDef.height/4, bDef.width/2, 8); // Trough
            ctx.restore();
            return;
        }
        if (building.type === 'radio_tower') {
            // Lattice tower
            ctx.strokeStyle = '#E2E8F0'; ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-16, bDef.height/2); ctx.lineTo(-4, -bDef.height/2 + 10);
            ctx.moveTo(16, bDef.height/2); ctx.lineTo(4, -bDef.height/2 + 10);
            ctx.lineTo(0, -bDef.height/2);
            ctx.stroke();
            // Cross bars
            for (let ty = bDef.height/2 - 10; ty > -bDef.height/2 + 15; ty -= 12) {
                ctx.beginPath(); ctx.moveTo(-12, ty); ctx.lineTo(12, ty); ctx.stroke();
            }
            // Blinking red beacon
            const blink = Math.sin(performance.now() * 0.006) > 0;
            ctx.fillStyle = blink ? '#EF4444' : '#7F1D1D';
            ctx.beginPath(); ctx.arc(0, -bDef.height/2, 4, 0, Math.PI * 2); ctx.fill();
            if (blink) {
                ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
                ctx.beginPath(); ctx.arc(0, -bDef.height/2, 16, 0, Math.PI * 2); ctx.fill();
            }
            ctx.restore();
            return;
        }
        if (building.type === 'campfire') {
            ctx.fillStyle = '#E74C3C'; ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill();
            if (this.systemsLoaded && this.timeSystem.isNight()) { ctx.fillStyle = 'rgba(255,165,0,0.3)'; ctx.beginPath(); ctx.arc(0, 0, 150, 0, Math.PI * 2); ctx.fill(); }
        }
        ctx.restore();
    }

    handleWorldEvent(event) {
        if (event.type === 'plane_crash') {
            const site = this.createCrashSite();
            this.showNotification(site ? 'Подія: літак упав — знайдіть уламки та припаси!' : event.message, 'warning');
        } else {
            this.showNotification(`Подія: ${event.type}`, 'info');
        }
    }

    createCrashSite() {
        for (let attempt = 0; attempt < 360; attempt++) {
            const tx = Math.floor(Math.random() * this.world.width);
            const ty = Math.floor(Math.random() * this.world.height);
            const tile = this.world.getTile(tx, ty);
            if (tile !== 2 && tile !== 3) continue;
            const x = tx * this.tileSize + this.tileSize / 2;
            const y = ty * this.tileSize + this.tileSize / 2;
            const dist = Math.hypot(x - this.player.x, y - this.player.y);
            if (dist < 280 || dist > 1200) continue;
            const site = {
                id: 'crash_' + Date.now() + '_' + Math.floor(Math.random() * 1000), x, y, looted: false,
                loot: [
                    { id: 'pistol', count: 1 }, { id: 'rifle', count: 1 },
                    { id: 'ammo', count: 18 + Math.floor(Math.random() * 13) },
                    { id: 'canned_food', count: 2 + Math.floor(Math.random() * 3) },
                    { id: 'water', count: 2 }
                ],
                salvageHealth: 300,
                maxSalvageHealth: 300,
                salvageLoot: [
                    { id: 'metal_scrap', count: 25 },
                    { id: 'electronics', count: 8 },
                    { id: 'fuel', count: 3 },
                    { id: 'glass_shard', count: 10 }
                ]
            };
            this.crashSites.push(site);
            return site;
        }
        return null;
    }

    getCrashSiteNear(x, y, range) {
        return (this.crashSites || []).find(site =>
            Math.hypot(site.x - x, site.y - y) <= range &&
            (!site.looted || (site.salvageHealth !== undefined && site.salvageHealth > 0))
        ) || null;
    }

    collectCrashLoot(site) {
        let collected = 0;
        for (const stack of site.loot) {
            if (stack.count <= 0) continue;
            const added = this.player.inventory.addItem(stack.id, stack.count);
            stack.count -= added;
            collected += added;
        }
        site.looted = site.loot.every(stack => stack.count <= 0);
        if (collected > 0) {
            this.showNotification(site.looted ? 'Ви зібрали всі припаси з уламків!' : 'Зібрано припаси; звільніть місце в інвентарі.', 'success');
            this.player.addXP(35);
            this.spawnParticles(site.x, site.y, '#F59E0B', 20);
        } else {
            this.showNotification('Інвентар повний.', 'error');
        }
    }

    salvageCrash(site) {
        if (!site.salvageHealth || site.salvageHealth <= 0) {
            this.showNotification('Уламки вже повністю розібрані.', 'info');
            return;
        }
        const tool = this.player.equippedTool;
        const toolData = tool ? window.ITEM_DB[tool] : null;
        const isAxe = toolData && toolData.toolType === 'axe';
        if (!isAxe) {
            this.showNotification('Потрібна сокира, щоб розібрати уламки!', 'warning');
            return;
        }
        const damage = 50;
        site.salvageHealth = Math.max(0, site.salvageHealth - damage);
        this.spawnParticles(site.x, site.y, '#9CA3AF', 12);
        const progress = Math.floor((1 - site.salvageHealth / site.maxSalvageHealth) * 100);
        if (site.salvageHealth <= 0) {
            // Give all remaining loot
            for (const stack of (site.salvageLoot || [])) {
                if (stack.count <= 0) continue;
                const added = this.player.inventory.addItem(stack.id, stack.count);
                if (added < stack.count) {
                    this.world.addDroppedItem(stack.id, stack.count - added, site.x + Math.random() * 20 - 10, site.y + Math.random() * 20 - 10);
                }
                stack.count = 0;
            }
            this.showNotification('Літак повністю розібрано! Отримано металобрухт та електроніку.', 'success');
            this.player.addXP(80);
            this.spawnParticles(site.x, site.y, '#F59E0B', 30);
        } else {
            // Partial loot on each hit
            const lootChance = Math.random();
            if (lootChance < 0.5) {
                const added = this.player.inventory.addItem('metal_scrap', 1);
                if (added === 0) this.world.addDroppedItem('metal_scrap', 1, site.x, site.y);
            } else if (lootChance < 0.7) {
                const added = this.player.inventory.addItem('glass_shard', 1);
                if (added === 0) this.world.addDroppedItem('glass_shard', 1, site.x, site.y);
            }
            this.showNotification(`Розбираєте літак... ${progress}%`, 'info');
        }
    }

    handleBoatInteraction() {
        if (!this.boat) return false;
        if (this.player.inBoat) {
            for (let radius = 0; radius <= 4; radius++) {
                for (let dy = -radius; dy <= radius; dy++) {
                    for (let dx = -radius; dx <= radius; dx++) {
                        const x = this.boat.x + dx * this.tileSize;
                        const y = this.boat.y + dy * this.tileSize;
                        const tile = this.world.getTileAtWorld(x, y);
                        if (tile !== 2 && tile !== 3 && tile !== 4) continue;
                        if (this.world.isWalkable(x, y, this.player.width, this.player.height, this.buildingSystem, x, y)) {
                            this.player.x = x; this.player.y = y; this.player.inBoat = false;
                            this.showNotification('Ви висадилися на берег.', 'info');
                            return true;
                        }
                    }
                }
            }
            this.showNotification('Підійдіть ближче до берега, щоб висадитися.', 'warning');
            return true;
        }
        const nearDock = this.buildingSystem ? this.buildingSystem.buildings.find(b => b.type === 'dock' && Math.hypot(b.x - this.player.x, b.y - this.player.y) <= 80) : null;
        const boatRange = nearDock ? 120 : 64;
        if (Math.hypot(this.boat.x - this.player.x, this.boat.y - this.player.y) <= boatRange) {
            this.player.x = this.boat.x; this.player.y = this.boat.y; this.player.inBoat = true;
            const msg = nearDock ? 'Ви відчалили від причалу!' : 'Ви сіли в човен. Пливіть до інших островів!';
            this.showNotification(msg, 'success');
            return true;
        }
        return false;
    }

    attack(aimX = null, aimY = null, allowMiss = false) {
        const now = performance.now();
        const item = this.player.equippedTool && window.ITEM_DB[this.player.equippedTool];
        const isGun = item && item.category === 'weapon';
        // Mouse clicks are reserved for firearms, preventing accidental bare-hand
        // attacks while navigating or using the interface.
        if (allowMiss && !isGun) {
            if (now - this.lastAttackAt > 900) {
                this.lastAttackAt = now;
                this.showNotification('Екіпіруйте пістолет або автомат у інвентарі (I).', 'warning');
            }
            return;
        }
        if (!item && !allowMiss) {
            this.showNotification('Спочатку екіпіруйте зброю в інвентарі.', 'warning');
            return;
        }
        const range = isGun ? item.range : (this.player.equippedTool === 'spear' ? 72 : 48);
        const cooldown = isGun ? item.cooldown : 0.55;
        if (now - this.lastAttackAt < cooldown * 1000) return;
        if (isGun && !this.player.inventory.hasItem('ammo', 1)) {
            this.lastAttackAt = now;
            this.showNotification('Немає набоїв!', 'warning');
            return;
        }

        const candidates = [];
        if (this.zombieManager) {
            for (const zombie of this.zombieManager.zombies) candidates.push({ entity: zombie, type: 'zombie', radius: 18 });
        }
        if (this.pirateManager) {
            for (const pirate of this.pirateManager.pirates) candidates.push({ entity: pirate, type: 'pirate', radius: 28 });
        }

        let target = null;
        let type = null;
        let endX = this.player.x;
        let endY = this.player.y;
        if (aimX !== null && aimY !== null) {
            const aimDx = aimX - this.player.x;
            const aimDy = aimY - this.player.y;
            const aimDistance = Math.hypot(aimDx, aimDy);
            if (aimDistance < 2) return;
            if (Math.abs(aimDx) > Math.abs(aimDy)) this.player.direction = aimDx < 0 ? 1 : 2;
            else this.player.direction = aimDy < 0 ? 3 : 0;
            const ux = aimDx / aimDistance;
            const uy = aimDy / aimDistance;
            let closestProjection = range + 1;
            for (const candidate of candidates) {
                const dx = candidate.entity.x - this.player.x;
                const dy = candidate.entity.y - this.player.y;
                const projection = dx * ux + dy * uy;
                const sideways = Math.abs(dx * uy - dy * ux);
                if (projection > 0 && projection <= range && sideways <= candidate.radius && projection < closestProjection) {
                    target = candidate.entity;
                    type = candidate.type;
                    closestProjection = projection;
                }
            }
            const shotDistance = target ? closestProjection : Math.min(range, aimDistance);
            endX = this.player.x + ux * shotDistance;
            endY = this.player.y + uy * shotDistance;
        } else {
            let closestDistance = range + 1;
            for (const candidate of candidates) {
                const distance = Math.hypot(candidate.entity.x - this.player.x, candidate.entity.y - this.player.y);
                if (distance <= range && distance < closestDistance) {
                    target = candidate.entity;
                    type = candidate.type;
                    closestDistance = distance;
                }
            }
            if (target) { endX = target.x; endY = target.y; }
        }

        if (!target && !allowMiss) {
            this.showNotification('Немає ворога в радіусі атаки.', 'info');
            return;
        }
        this.lastAttackAt = now;
        if (isGun) {
            this.player.inventory.removeItem('ammo', 1);
            this.shotTracers.push({ x: this.player.x, y: this.player.y, endX, endY, life: 0.09, maxLife: 0.09 });
        }
        if (!target) return;

        const damage = isGun ? item.damage : (this.player.equippedTool === 'spear' ? 22 : this.player.equippedTool === 'stone_axe' ? 15 : 8);
        const defeated = type === 'zombie' ? this.zombieManager.damage(target, damage, this) : this.pirateManager.damage(target, damage, this);
        this.spawnParticles(target.x, target.y, type === 'zombie' ? '#84CC16' : '#F59E0B', 10);
        this.showNotification(defeated ? (type === 'zombie' ? 'Зомбі знищено!' : 'Піратський корабель потоплено!') : `Влучання: ${damage}`, defeated ? 'success' : 'info');
        if (defeated) this.player.addXP(type === 'zombie' ? 12 : 30);
    }

    drawTooltips() {
        let px = this.player.x;
        let py = this.player.y;
        let range = 50;
        let targetFound = false;
        let text = '';
        let targetX = 0, targetY = 0;

        if (this.player.inBoat) {
            text = '[E] Висадитися на берег';
            targetX = this.boat.x; targetY = this.boat.y;
            targetFound = true;
        } else if (this.boat && Math.hypot(this.boat.x - px, this.boat.y - py) <= 64) {
            text = '[E] Сісти в човен';
            targetX = this.boat.x; targetY = this.boat.y;
            targetFound = true;
        }
        if (this.evacuationState === 'helicopter_arrived' && this.helicopter && Math.hypot(this.helicopter.x - px, this.helicopter.y - py) <= 80) {
            text = '[E] Сісти в гелікоптер (ВРЯТУВАТИСЯ!)';
            targetX = this.helicopter.x; targetY = this.helicopter.y;
            targetFound = true;
        } else if (this.villageTrader && Math.hypot(this.villageTrader.x - px, this.villageTrader.y - py) <= 70) {
            text = '[E] Торгувати (Сільський торговець)';
            targetX = this.villageTrader.x; targetY = this.villageTrader.y;
            targetFound = true;
        } else if (this.treasureChests) {
            const tc = this.treasureChests.find(c => !c.looted && Math.hypot(c.x - px, c.y - py) <= 60);
            if (tc) {
                text = '[E] Відкрити скриню зі скарбами';
                targetX = tc.x; targetY = tc.y;
                targetFound = true;
            }
        }

        if (!targetFound) {
            const crash = this.getCrashSiteNear(px, py, range + 10);
            if (crash) {
                text = crash.looted ? (crash.salvageHealth > 0 ? '[E] Розібрати уламки (потрібна сокира)' : '[E] Уламки повністю розібрані') : '[E] Обшукати уламки літака';
                targetX = crash.x; targetY = crash.y;
                targetFound = true;
            }
        }
        
        let drops = this.world.getDroppedItemsNear(px, py, range);
        if (!targetFound && drops.length > 0) {
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
        if (this.handleBoatInteraction()) return;

        // 1. Helicopter Evacuation Boarding
        if (this.evacuationState === 'helicopter_arrived' && this.helicopter) {
            if (Math.hypot(this.helicopter.x - px, this.helicopter.y - py) <= 80) {
                this.evacuationState = 'won';
                const vic = document.getElementById('victory-overlay');
                const stats = document.getElementById('victory-stats');
                if (vic) { vic.classList.remove('hidden'); vic.style.display = 'flex'; }
                if (stats) {
                    const days = this.timeSystem ? this.timeSystem.day : 1;
                    stats.innerHTML = `<strong>Днів виживання:</strong> ${days}<br><strong>Здоров'я:</strong> ${Math.round(this.player.health)} HP<br><strong>Статус:</strong> Успішно евакуйовано на велику землю!`;
                }
                const btnRestart = document.getElementById('btn-victory-restart');
                if (btnRestart) btnRestart.onclick = () => location.reload();
                return;
            }
        }

        // 2. Village Trader interaction
        if (this.villageTrader && Math.hypot(this.villageTrader.x - px, this.villageTrader.y - py) <= 70) {
            window.openTraderUI();
            return;
        }

        // 3. Treasure Chests in Pirate Fort
        if (this.treasureChests) {
            const chest = this.treasureChests.find(c => !c.looted && Math.hypot(c.x - px, c.y - py) <= 60);
            if (chest) {
                chest.looted = true;
                const coins = 4 + Math.floor(Math.random() * 4);
                const ammoCount = 8 + Math.floor(Math.random() * 8);
                this.player.inventory.addItem('gold_coin', coins);
                this.player.inventory.addItem('ammo', ammoCount);
                this.player.inventory.addItem('metal_scrap', 3);
                if (Math.random() < 0.4) this.player.inventory.addItem('gunpowder', 3);
                if (window.soundSystem) window.soundSystem.playPickup();
                this.showNotification(`Скриню піратів відкрито! Отримано: Золоті монети x${coins}, Набої x${ammoCount}`, 'success');
                this.player.addXP(45);
                return;
            }
        }

        // 4. Radio Tower SOS activation
        if (this.buildingSystem) {
            const tower = this.buildingSystem.buildings.find(b => b.type === 'radio_tower' && Math.hypot(b.x - px, b.y - py) <= 64);
            if (tower) {
                if (this.evacuationState === 'idle') {
                    this.startEvacuation();
                    return;
                }
            }
        }

        const crash = this.getCrashSiteNear(px, py, range + 10);
        if (crash) {
            if (!crash.looted) {
                this.collectCrashLoot(crash);
            } else if (crash.salvageHealth !== undefined && crash.salvageHealth > 0) {
                this.salvageCrash(crash);
            } else if (crash.salvageHealth === 0) {
                this.showNotification('Уламки вже повністю розібрані.', 'info');
            } else {
                this.showNotification('Уламки вже обшукані.', 'info');
            }
            return;
        }
        
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
            animalManager: this.animalManager ? this.animalManager.serialize() : null,
            boat: this.boat,
            crashSites: this.crashSites,
            pirateManager: this.pirateManager ? this.pirateManager.serialize() : null,
            zombieManager: this.zombieManager ? this.zombieManager.serialize() : null
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
    } else if (itemId === 'pistol' || itemId === 'rifle') {
        ctx.fillStyle = '#374151';
        if (itemId === 'pistol') {
            ctx.fillRect(cx-10, cy-5, 18, 6); ctx.fillRect(cx-2, cy, 6, 12);
        } else {
            ctx.fillRect(cx-13, cy-5, 27, 6); ctx.fillRect(cx-5, cy, 5, 12); ctx.fillRect(cx+10, cy-3, 8, 3);
        }
        ctx.fillStyle = '#9CA3AF'; ctx.fillRect(cx+6, cy-4, 7, 2);
    } else if (itemId === 'ammo') {
        ctx.fillStyle = '#D4A017';
        ctx.fillRect(cx-8, cy-9, 4, 18); ctx.fillRect(cx, cy-9, 4, 18); ctx.fillRect(cx+8, cy-9, 4, 18);
        ctx.fillStyle = '#FDE68A'; ctx.fillRect(cx-8, cy-11, 4, 3); ctx.fillRect(cx, cy-11, 4, 3); ctx.fillRect(cx+8, cy-11, 4, 3);
    } else if (itemId === 'canned_food') {
        ctx.fillStyle = '#A7AEB8'; ctx.fillRect(cx-9, cy-10, 18, 20);
        ctx.fillStyle = '#DC2626'; ctx.fillRect(cx-9, cy-4, 18, 8);
        ctx.fillStyle = '#E5E7EB'; ctx.fillRect(cx-9, cy-11, 18, 2); ctx.fillRect(cx-9, cy+9, 18, 2);
    } else if (cat === 'building') {
        ctx.fillStyle = '#FF9800';
        ctx.fillRect(cx-10, cy-8, 20, 16);
        ctx.fillStyle = '#E65100';
        ctx.beginPath(); ctx.moveTo(cx-12, cy-8); ctx.lineTo(cx, cy-16); ctx.lineTo(cx+12, cy-8); ctx.closePath(); ctx.fill();
    } else if (itemId === 'sulfur') {
        ctx.fillStyle = '#FACC15';
        ctx.beginPath(); ctx.moveTo(cx, cy - 10); ctx.lineTo(cx + 8, cy + 8); ctx.lineTo(cx - 8, cy + 8); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#FEF08A'; ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fill();
    } else if (itemId === 'gunpowder') {
        ctx.fillStyle = '#1F2937'; ctx.beginPath(); ctx.ellipse(cx, cy + 2, 8, 10, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#B45309'; ctx.fillRect(cx - 3, cy - 10, 6, 4);
    } else if (itemId === 'pearl') {
        ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.arc(cx, cy, 8, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#93C5FD'; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(cx - 2, cy - 2, 2.5, 0, Math.PI * 2); ctx.fill();
    } else if (itemId === 'seaweed') {
        ctx.strokeStyle = '#059669'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(cx - 4, cy + 10); ctx.quadraticCurveTo(cx - 10, cy, cx - 4, cy - 10); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + 3, cy + 10); ctx.quadraticCurveTo(cx + 8, cy, cx + 2, cy - 10); ctx.stroke();
    } else if (itemId === 'egg' || itemId === 'cooked_egg') {
        if (itemId === 'egg') {
            ctx.fillStyle = '#FEF3C7'; ctx.beginPath(); ctx.ellipse(cx, cy, 7, 9, 0, 0, Math.PI * 2); ctx.fill();
        } else {
            ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#F59E0B'; ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill();
        }
    } else if (itemId === 'milk') {
        ctx.fillStyle = '#E2E8F0'; ctx.fillRect(cx - 6, cy - 6, 12, 15);
        ctx.fillStyle = '#3B82F6'; ctx.fillRect(cx - 5, cy - 10, 10, 4);
    } else if (itemId === 'gold_coin') {
        ctx.fillStyle = '#EAB308'; ctx.beginPath(); ctx.arc(cx, cy, 9, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#CA8A04'; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.fillStyle = '#713F12'; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('$', cx, cy);
    } else if (itemId === 'berry_seeds' || itemId === 'palm_seed') {
        ctx.fillStyle = '#84CC16';
        ctx.beginPath(); ctx.arc(cx - 4, cy - 2, 3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + 4, cy, 3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx, cy + 4, 3, 0, Math.PI * 2); ctx.fill();
    } else if (itemId === 'machinegun') {
        ctx.fillStyle = '#1E293B'; ctx.fillRect(cx - 14, cy - 4, 28, 7);
        ctx.fillStyle = '#475569'; ctx.fillRect(cx - 4, cy + 3, 8, 8);
        ctx.fillStyle = '#0F172A'; ctx.fillRect(cx + 8, cy - 7, 5, 3);
    } else if (itemId === 'sniper_rifle') {
        ctx.fillStyle = '#334155'; ctx.fillRect(cx - 16, cy - 3, 32, 5);
        ctx.fillStyle = '#0F172A'; ctx.fillRect(cx - 6, cy - 7, 12, 3); // Scope
        ctx.fillRect(cx - 6, cy + 2, 4, 7); // Grip
    } else if (itemId === 'metal_armor') {
        ctx.fillStyle = '#94A3B8';
        ctx.beginPath();
        ctx.moveTo(cx - 8, cy - 10); ctx.lineTo(cx + 8, cy - 10);
        ctx.lineTo(cx + 10, cy + 8); ctx.lineTo(cx - 10, cy + 8);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#475569'; ctx.lineWidth = 1.5; ctx.stroke();
    } else if (itemId === 'car') {
        ctx.fillStyle = '#DC2626'; ctx.fillRect(cx - 12, cy - 4, 24, 10);
        ctx.fillStyle = '#93C5FD'; ctx.fillRect(cx - 6, cy - 8, 12, 5);
        ctx.fillStyle = '#111827';
        ctx.beginPath(); ctx.arc(cx - 8, cy + 6, 3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + 8, cy + 6, 3, 0, Math.PI * 2); ctx.fill();
    } else if (itemId === 'generator') {
        ctx.fillStyle = '#F59E0B'; ctx.fillRect(cx - 10, cy - 6, 20, 14);
        ctx.fillStyle = '#1E293B'; ctx.fillRect(cx - 6, cy - 9, 12, 3);
    } else if (itemId === 'plank') {
        ctx.fillStyle = '#D97706'; ctx.fillRect(cx - 12, cy - 5, 24, 10);
        ctx.strokeStyle = '#78350F'; ctx.lineWidth = 1; ctx.strokeRect(cx - 12, cy - 5, 24, 10);
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
                } else if (itemDef.category === 'tool' || itemDef.category === 'weapon') {
                    if (p.equippedTool === slot.id) {
                        p.equippedTool = null;
                        window.game.showNotification("Зброю або інструмент знято", 'info');
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

    if (window.game.boat) {
        ctx.fillStyle = '#F8FAFC';
        const bx = (window.game.boat.x / window.game.tileSize) * scaleX;
        const by = (window.game.boat.y / window.game.tileSize) * scaleY;
        ctx.beginPath(); ctx.arc(bx, by, 3, 0, Math.PI * 2); ctx.fill();
    }
    if (window.game.crashSites) {
        ctx.fillStyle = '#F97316';
        for (const site of window.game.crashSites) {
            if (site.looted) continue;
            const x = (site.x / window.game.tileSize) * scaleX;
            const y = (site.y / window.game.tileSize) * scaleY;
            ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
        }
    }
    if (window.game.pirateManager) {
        ctx.fillStyle = '#7F1D1D';
        for (const pirate of window.game.pirateManager.pirates) {
            const x = (pirate.x / window.game.tileSize) * scaleX;
            const y = (pirate.y / window.game.tileSize) * scaleY;
            ctx.fillRect(x - 2, y - 2, 4, 4);
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
let appInitialized = false;
function initIslandGameApp() {
    if (appInitialized) return;
    appInitialized = true;

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
        try {
            window.game.init();
            window.game.start();
        } catch (err) {
            console.error('Error starting new game:', err);
        }
    };
    
    if (btnCont) btnCont.onclick = () => {
        try {
            window.game.loadFromSave();
            window.game.start();
        } catch (err) {
            console.error('Error loading game:', err);
        }
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
    if (mobAttack) mobAttack.onclick = () => window.game.attack();

    // Prevent any button click from trapping keyboard focus away from game controls
    document.addEventListener('click', (e) => {
        if (e.target && e.target.tagName === 'BUTTON') {
            e.target.blur();
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initIslandGameApp);
    window.addEventListener('load', initIslandGameApp);
} else {
    initIslandGameApp();
}



// --- Village Trader Barter Modal ---
window.openTraderUI = function() {
    const dialog = document.getElementById('trader-dialog');
    const container = document.getElementById('trader-offers');
    const btnClose = document.getElementById('btn-close-trader');
    if (!dialog || !container) return;

    dialog.classList.remove('hidden');
    dialog.style.display = 'flex';
    if (btnClose) btnClose.onclick = () => { dialog.classList.add('hidden'); dialog.style.display = 'none'; };

    const trades = [
        { give: 'pearl', giveCount: 1, get: 'fuel', getCount: 2, label: '1 Перлина ➔ 2 Авіапаливо' },
        { give: 'pearl', giveCount: 2, get: 'electronics', getCount: 3, label: '2 Перлини ➔ 3 Електроніка' },
        { give: 'gold_coin', giveCount: 1, get: 'ammo', getCount: 15, label: '1 Золота монета ➔ 15 Набоїв' },
        { give: 'gold_coin', giveCount: 3, get: 'machinegun', getCount: 1, label: '3 Золоті монети ➔ Кулемет' },
        { give: 'gold_coin', giveCount: 4, get: 'car', getCount: 1, label: '4 Золоті монети ➔ Позашляховик' },
        { give: 'cooked_fish', giveCount: 2, get: 'berry_seeds', getCount: 5, label: '2 Печені риби ➔ 5 Насіння ягід' }
    ];

    container.innerHTML = '';
    trades.forEach(t => {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.justifyContent = 'space-between';
        row.style.alignItems = 'center';
        row.style.background = 'rgba(255,255,255,0.06)';
        row.style.padding = '8px 12px';
        row.style.borderRadius = '8px';
        row.style.border = '1px solid rgba(255,255,255,0.1)';

        const text = document.createElement('span');
        text.textContent = t.label;
        text.style.color = '#F1F5F9';
        text.style.fontWeight = '500';

        const btn = document.createElement('button');
        btn.textContent = 'Обміняти';
        btn.style.background = '#F59E0B';
        btn.style.color = '#000';
        btn.style.border = 'none';
        btn.style.padding = '6px 14px';
        btn.style.borderRadius = '6px';
        btn.style.fontWeight = 'bold';
        btn.style.cursor = 'pointer';

        btn.onclick = () => {
            if (window.game && window.game.player && window.game.player.inventory.hasItem(t.give, t.giveCount)) {
                window.game.player.inventory.removeItem(t.give, t.giveCount);
                window.game.player.inventory.addItem(t.get, t.getCount);
                if (window.soundSystem) window.soundSystem.playPickup();
                window.game.showNotification(`Успішний обмін: отримано ${t.getCount} шт!`, 'success');
            } else {
                window.game.showNotification(`Недостатньо предметів для обміну! Потрібно ${t.giveCount} шт.`, 'warning');
            }
        };

        row.appendChild(text);
        row.appendChild(btn);
        container.appendChild(row);
    });
};
