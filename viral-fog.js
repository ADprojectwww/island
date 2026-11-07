// Viral fog, infected wildlife, rare medicine plants, and hidden refuges.

(function() {
    const HERB_ID = 'viral_herb';
    const SERUM_ID = 'viral_serum';
    const OUTBREAK_TIME = 90;

    if (window.ITEM_DB) {
        Object.assign(window.ITEM_DB, {
            [HERB_ID]: {
                id: HERB_ID,
                name: 'Світна трава',
                icon: '🌿',
                category: 'resource',
                maxStack: 10,
                description: 'Рідкісна рослина, що росте біля вірусного туману'
            },
            [SERUM_ID]: {
                id: SERUM_ID,
                name: 'Сироватка від вірусу',
                icon: '🧪',
                category: 'medicine',
                maxStack: 5,
                description: 'Лікує вірусну гарячку та заражених тварин'
            }
        });
    }

    if (window.RECIPE_DB) {
        window.RECIPE_DB[SERUM_ID] = {
            id: SERUM_ID,
            name: 'Сироватка від вірусу',
            result: { id: SERUM_ID, count: 1 },
            materials: [{ id: HERB_ID, count: 2 }, { id: 'water', count: 1 }],
            requires: null
        };
    }

    if (window.DiseaseSystem && window.DiseaseSystem.DISEASES) {
        window.DiseaseSystem.DISEASES.viral_fever = {
            id: 'viral_fever',
            name: '☣️ Вірусна гарячка',
            description: 'Тривале перебування у вірусному тумані',
            duration: 300,
            tick: (stats, dt) => {
                stats.health -= 0.8 * dt;
                stats.energy -= 0.6 * dt;
            },
            cure: SERUM_ID
        };
    }

    window.ViralFogSystem = class ViralFogSystem {
        constructor(worldWidth, worldHeight, tileSize) {
            this.worldWidth = worldWidth;
            this.worldHeight = worldHeight;
            this.tileSize = tileSize;
            this.outbreakStartedAt = null;
            this.zones = [];
            this.secrets = [];
            this.affectedTiles = [];
            this.updateAccumulator = 0;
            this.playerExposure = 0;
            this.animalBiteCooldown = 0;
        }

        initialize(game) {
            const targets = [[20, 23], [99, 91], [22, 95]];
            this.zones = targets.map((target, index) => {
                const center = this.nearestLand(game.world, target[0], target[1]);
                return {
                    id: `viral_zone_${index + 1}`,
                    tx: center.tx,
                    ty: center.ty,
                    radius: 1.8,
                    maxRadius: 18
                };
            });
            this.secrets = this.zones.map((zone, index) => {
                const location = this.nearestLand(game.world, zone.tx + 5, zone.ty + 4);
                return {
                    id: `spore_refuge_${index + 1}`,
                    tx: location.tx,
                    ty: location.ty,
                    revealed: false,
                    opened: false,
                    guidedBy: null
                };
            });
        }

        nearestLand(world, tx, ty) {
            let best = null;
            let bestDistance = Infinity;
            for (let y = 0; y < world.height; y++) {
                for (let x = 0; x < world.width; x++) {
                    const tile = world.getTile(x, y);
                    if (tile < 2) continue;
                    const distance = (x - tx) ** 2 + (y - ty) ** 2;
                    if (distance < bestDistance) {
                        best = { tx: x, ty: y };
                        bestDistance = distance;
                    }
                }
            }
            return best || {
                tx: Math.max(0, Math.min(this.worldWidth - 1, tx)),
                ty: Math.max(0, Math.min(this.worldHeight - 1, ty))
            };
        }

        startOutbreak(game, totalTime) {
            if (this.outbreakStartedAt !== null) return;
            if (!this.zones.length) this.initialize(game);
            this.outbreakStartedAt = totalTime;
            this.zones.forEach((zone, index) => {
                const x = zone.tx * this.tileSize + this.tileSize / 2;
                const y = zone.ty * this.tileSize + this.tileSize / 2;
                const alreadyExists = game.world.resources.some(resource =>
                    resource.type === HERB_ID && Math.hypot(resource.x - x, resource.y - y) < this.tileSize
                );
                if (!alreadyExists) {
                    game.world.resources.push({
                        id: `viral_herb_${index + 1}`,
                        type: HERB_ID,
                        x,
                        y,
                        health: 100,
                        maxHealth: 100,
                        respawnTime: 240,
                        depleted: false,
                        depletedAt: 0
                    });
                }
            });
            game.showNotification('☣️ На віддалених островах з’явився вірусний туман. Знайдіть світну траву для сироватки.', 'warning');
        }

        update(dt, game) {
            const totalTime = game.timeSystem ? game.timeSystem.totalTime : 0;
            if (this.outbreakStartedAt === null && totalTime >= OUTBREAK_TIME) {
                this.startOutbreak(game, totalTime);
            }
            if (this.outbreakStartedAt === null) return;

            this.updateAccumulator += dt;
            if (this.updateAccumulator < 1) return;
            const elapsed = this.updateAccumulator;
            this.updateAccumulator = 0;

            for (const zone of this.zones) {
                zone.radius = Math.min(zone.maxRadius, 1.8 + (totalTime - this.outbreakStartedAt) / 30);
            }
            this.rebuildAffectedTiles(game.world);
            this.witherResources(game.world);
            this.updateAnimals(elapsed, game);
            this.updatePlayerExposure(elapsed, game);
        }

        strengthAt(wx, wy) {
            if (this.outbreakStartedAt === null) return 0;
            const tx = wx / this.tileSize;
            const ty = wy / this.tileSize;
            let strength = 0;
            for (const zone of this.zones) {
                const distance = Math.hypot(tx - zone.tx, ty - zone.ty);
                if (distance > zone.radius) continue;
                strength = Math.max(strength, 1 - distance / (zone.radius + 0.5));
            }
            return strength;
        }

        rebuildAffectedTiles(world) {
            this.affectedTiles = [];
            if (this.outbreakStartedAt === null) return;
            for (let ty = 0; ty < world.height; ty++) {
                for (let tx = 0; tx < world.width; tx++) {
                    if (world.getTile(tx, ty) < 2) continue;
                    const strength = this.strengthAt(
                        (tx + 0.5) * this.tileSize,
                        (ty + 0.5) * this.tileSize
                    );
                    if (strength > 0) this.affectedTiles.push({ tx, ty, strength });
                }
            }
        }

        witherResources(world) {
            for (const resource of world.resources) {
                if (resource.withered || !['tree', 'palm', 'coconut_palm', 'bush', 'berry_bush'].includes(resource.type)) continue;
                if (this.strengthAt(resource.x, resource.y) >= 0.55) resource.withered = true;
            }
        }

        updateAnimals(dt, game) {
            if (!game.animalManager) return;
            const animals = game.animalManager.animals;
            for (const animal of animals) {
                if (animal.viralInfected || animal.viralCured) continue;
                if (this.strengthAt(animal.x, animal.y) >= 0.4) {
                    animal.viralExposure = (animal.viralExposure || 0) + dt;
                    if (animal.viralExposure >= 3) {
                        animal.viralInfected = true;
                        game.showNotification('Заражена тварина! Вилікуйте її сироваткою, щоб знайти таємну схованку.', 'danger');
                    }
                } else {
                    animal.viralExposure = Math.max(0, (animal.viralExposure || 0) - dt * 0.5);
                }
            }

            this.animalBiteCooldown = Math.max(0, this.animalBiteCooldown - dt);
            if (this.animalBiteCooldown > 0) return;
            const infectedNearby = animals.find(animal =>
                animal.viralInfected && Math.hypot(animal.x - game.player.x, animal.y - game.player.y) < 34
            );
            if (infectedNearby) {
                this.animalBiteCooldown = 4;
                game.player.health = Math.max(0, game.player.health - 5);
                if (game.diseaseSystem) game.diseaseSystem.contract('viral_fever');
                game.showNotification('Заражена тварина вкусила вас!', 'danger');
            }
        }

        updatePlayerExposure(dt, game) {
            if (!game.diseaseSystem) return;
            if (this.strengthAt(game.player.x, game.player.y) >= 0.4) {
                this.playerExposure += dt;
                if (this.playerExposure >= 5) {
                    game.diseaseSystem.contract('viral_fever');
                    this.playerExposure = 0;
                }
            } else {
                this.playerExposure = Math.max(0, this.playerExposure - dt);
            }
        }

        cureAnimal(animal, game) {
            animal.viralInfected = false;
            animal.viralCured = true;
            animal.viralExposure = 0;
            const secret = this.secrets
                .filter(location => !location.revealed && !location.opened)
                .sort((a, b) => {
                    const da = Math.hypot(a.tx - animal.x / this.tileSize, a.ty - animal.y / this.tileSize);
                    const db = Math.hypot(b.tx - animal.x / this.tileSize, b.ty - animal.y / this.tileSize);
                    return da - db;
                })[0];
            if (!secret) {
                game.showNotification('Тварину вилікувано, але вона не знайшла нових слідів.', 'success');
                return;
            }
            secret.revealed = true;
            secret.guidedBy = animal.id;
            animal.viralGuideTarget = {
                x: (secret.tx + 0.5) * this.tileSize,
                y: (secret.ty + 0.5) * this.tileSize
            };
            game.showNotification('Тварину вилікувано! Вона поведе вас до прихованої схованки — шукайте її на карті.', 'success');
        }

        interactWithSecret(game) {
            const player = game.player;
            const secret = this.secrets.find(location =>
                location.revealed &&
                Math.hypot(player.x - (location.tx + 0.5) * this.tileSize, player.y - (location.ty + 0.5) * this.tileSize) <= 58
            );
            if (!secret) return false;
            if (secret.opened) {
                game.showNotification('У цій схованці більше нічого немає.', 'info');
                return true;
            }

            secret.opened = true;
            const rewards = [
                { id: HERB_ID, count: 2 },
                { id: 'bandage', count: 2 },
                { id: 'canned_food', count: 3 }
            ];
            for (const reward of rewards) {
                const added = player.inventory.addItem(reward.id, reward.count);
                if (added < reward.count) {
                    game.world.addDroppedItem(
                        reward.id,
                        reward.count - added,
                        player.x + Math.random() * 20 - 10,
                        player.y + Math.random() * 20 - 10
                    );
                }
            }
            player.addXP(100);
            game.spawnParticles(player.x, player.y, '#A3E635', 24);
            game.showNotification('Відкрито таємну схованку: світна трава, пов’язки та їжа!', 'success');
            return true;
        }

        drawMap(ctx, canvas, game) {
            const scaleX = canvas.width / this.worldWidth;
            const scaleY = canvas.height / this.worldHeight;
            for (const tile of this.affectedTiles) {
                if (game.fogOfWar && !game.fogOfWar.isExplored(tile.tx, tile.ty)) continue;
                ctx.fillStyle = `rgba(132, 190, 75, ${0.2 + tile.strength * 0.45})`;
                ctx.fillRect(tile.tx * scaleX, tile.ty * scaleY, Math.ceil(scaleX), Math.ceil(scaleY));
            }
            for (const secret of this.secrets) {
                if (!secret.revealed || secret.opened) continue;
                if (game.fogOfWar && !game.fogOfWar.isExplored(secret.tx, secret.ty)) continue;
                const x = (secret.tx + 0.5) * scaleX;
                const y = (secret.ty + 0.5) * scaleY;
                ctx.fillStyle = '#FDE047';
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#713F12';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }

        serialize() {
            return {
                outbreakStartedAt: this.outbreakStartedAt,
                zones: this.zones,
                secrets: this.secrets,
                playerExposure: this.playerExposure
            };
        }

        static deserialize(data, worldWidth, worldHeight, tileSize, game) {
            const system = new ViralFogSystem(worldWidth, worldHeight, tileSize);
            if (data) {
                system.outbreakStartedAt = data.outbreakStartedAt === undefined ? null : data.outbreakStartedAt;
                system.zones = data.zones || [];
                system.secrets = data.secrets || [];
                system.playerExposure = data.playerExposure || 0;
            }
            if (!system.zones.length || !system.secrets.length) system.initialize(game);
            if (system.outbreakStartedAt !== null) system.rebuildAffectedTiles(game.world);
            return system;
        }
    };

    if (window.Animal) {
        const animalSerialize = window.Animal.prototype.serialize;
        window.Animal.prototype.serialize = function() {
            const data = animalSerialize.call(this);
            data.viralInfected = !!this.viralInfected;
            data.viralCured = !!this.viralCured;
            data.viralExposure = this.viralExposure || 0;
            data.viralGuideTarget = this.viralGuideTarget || null;
            return data;
        };

        const animalDeserialize = window.Animal.deserialize;
        window.Animal.deserialize = function(data) {
            const animal = animalDeserialize.call(this, data);
            animal.viralInfected = !!data.viralInfected;
            animal.viralCured = !!data.viralCured;
            animal.viralExposure = data.viralExposure || 0;
            animal.viralGuideTarget = data.viralGuideTarget || null;
            return animal;
        };

        const animalUpdate = window.Animal.prototype.update;
        window.Animal.prototype.update = function() {
            animalUpdate.apply(this, arguments);
            if (!this.viralGuideTarget) return;
            const distance = Math.hypot(this.x - this.viralGuideTarget.x, this.y - this.viralGuideTarget.y);
            if (distance <= 18) {
                this.viralGuideTarget = null;
                this.state = 'idle';
                return;
            }
            this.state = 'wander';
            this.targetX = this.viralGuideTarget.x;
            this.targetY = this.viralGuideTarget.y;
            this.stateTimer = 10;
        };

        const animalDraw = window.Animal.prototype.draw;
        window.Animal.prototype.draw = function(ctx, camera) {
            animalDraw.call(this, ctx, camera);
            if (!this.viralInfected && !this.viralGuideTarget) return;
            const pos = camera.worldToScreen(this.x, this.y);
            ctx.save();
            ctx.strokeStyle = this.viralInfected ? 'rgba(190, 255, 75, 0.9)' : 'rgba(253, 224, 71, 0.9)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, this.viralInfected ? 17 : 14, 0, Math.PI * 2);
            ctx.stroke();
            if (this.viralInfected) {
                ctx.fillStyle = '#D9F99D';
                ctx.font = '12px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('☣', pos.x, pos.y - 20);
            }
            ctx.restore();
        };
    }

    if (typeof World !== 'undefined') {
        const WorldClass = World;
        const harvestResource = WorldClass.prototype.harvestResource;
        WorldClass.prototype.harvestResource = function(resourceId, toolType) {
            const resource = this.resources.find(item => item.id === resourceId);
            const result = harvestResource.call(this, resourceId, toolType);
            if (resource && resource.type === HERB_ID && result.depleted) {
                result.items = [{ id: HERB_ID, count: 1 }];
            }
            return result;
        };

        const drawTerrain = WorldClass.prototype.drawTerrain;
        WorldClass.prototype.drawTerrain = function(ctx, camera) {
            drawTerrain.call(this, ctx, camera);
            const game = window.game;
            const virus = game && game.viralFogSystem;
            if (!virus || virus.outbreakStartedAt === null) return;
            for (const tile of virus.affectedTiles) {
                const wx = (tile.tx + 0.5) * this.tileSize;
                const wy = (tile.ty + 0.5) * this.tileSize;
                if (!camera.isVisible(wx, wy)) continue;
                const pos = camera.worldToScreen(tile.tx * this.tileSize, tile.ty * this.tileSize);
                ctx.fillStyle = `rgba(111, 91, 48, ${0.22 + tile.strength * 0.73})`;
                ctx.fillRect(pos.x, pos.y, this.tileSize + 1, this.tileSize + 1);
                if (tile.strength > 0.45) {
                    ctx.strokeStyle = `rgba(210, 220, 150, ${tile.strength * 0.32})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(pos.x + 7, pos.y + 21);
                    ctx.lineTo(pos.x + 13, pos.y + 17);
                    ctx.lineTo(pos.x + 17, pos.y + 24);
                    ctx.stroke();
                }
            }
        };

        const drawResources = WorldClass.prototype.drawResources;
        WorldClass.prototype.drawResources = function(ctx, camera) {
            drawResources.call(this, ctx, camera);
            const game = window.game;
            const virus = game && game.viralFogSystem;
            if (!virus || virus.outbreakStartedAt === null) return;

            for (const resource of this.resources) {
                if (resource.depleted || !camera.isVisible(resource.x, resource.y)) continue;
                const pos = camera.worldToScreen(resource.x, resource.y);
                if (resource.type === HERB_ID) {
                    ctx.save();
                    const t = window.GameTextures?.time || 0;
                    ctx.translate(Math.sin(t * 2 + resource.x * 0.03) * 1.2, 0);
                    ctx.fillStyle = '#BEF264';
                    ctx.shadowColor = '#A3E635';
                    ctx.shadowBlur = 12 + Math.sin(t * 3 + resource.y * 0.02) * 3;
                    ctx.beginPath();
                    ctx.ellipse(pos.x, pos.y, 5, 10, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.ellipse(pos.x - 5, pos.y - 3, 5, 3, -0.5, 0, Math.PI * 2);
                    ctx.ellipse(pos.x + 5, pos.y + 1, 5, 3, 0.5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                } else if (resource.withered) {
                    ctx.fillStyle = 'rgba(105, 78, 47, 0.96)';
                    ctx.beginPath();
                    if (['tree', 'palm', 'coconut_palm'].includes(resource.type)) {
                        ctx.arc(pos.x, pos.y - 15, 11, 0, Math.PI * 2);
                    } else {
                        ctx.ellipse(pos.x, pos.y + 2, 11, 8, 0, 0, Math.PI * 2);
                    }
                    ctx.fill();
                    if (['tree', 'palm', 'coconut_palm'].includes(resource.type)) {
                        ctx.strokeStyle = 'rgba(62, 50, 39, 0.9)';
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        ctx.moveTo(pos.x, pos.y - 15);
                        ctx.lineTo(pos.x - 8, pos.y - 24);
                        ctx.moveTo(pos.x, pos.y - 15);
                        ctx.lineTo(pos.x + 8, pos.y - 25);
                        ctx.stroke();
                    }
                }
            }

            const time = game.timeSystem ? game.timeSystem.totalTime : 0;
            for (let index = 0; index < virus.zones.length; index++) {
                const zone = virus.zones[index];
                const x = (zone.tx + 0.5) * this.tileSize;
                const y = (zone.ty + 0.5) * this.tileSize;
                if (!camera.isVisible(x, y)) continue;
                const center = camera.worldToScreen(x, y);
                const radius = zone.radius * this.tileSize;
                ctx.save();
                ctx.fillStyle = 'rgba(170, 205, 105, 0.1)';
                for (let puff = 0; puff < 4; puff++) {
                    const angle = time * 0.06 + puff * Math.PI / 2 + index;
                    const distance = radius * (0.25 + 0.15 * Math.sin(time * 0.1 + puff));
                    const puffX = center.x + Math.cos(angle) * distance;
                    const puffY = center.y + Math.sin(angle) * distance * 0.55;
                    ctx.beginPath();
                    ctx.ellipse(puffX, puffY, 20 + puff * 3, 10 + puff * 2, angle, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            }
        };
    }

    if (window.Game) {
        const gameInit = window.Game.prototype.init;
        window.Game.prototype.init = function() {
            gameInit.call(this);
            this.viralFogSystem = new window.ViralFogSystem(this.worldWidth, this.worldHeight, this.tileSize);
            this.viralFogSystem.initialize(this);
        };

        const gameLoad = window.Game.prototype.loadFromSave;
        window.Game.prototype.loadFromSave = function() {
            gameLoad.call(this);
            const data = window.SaveManager ? window.SaveManager.load() : null;
            this.viralFogSystem = data && data.viralFogSystem
                ? window.ViralFogSystem.deserialize(data.viralFogSystem, this.worldWidth, this.worldHeight, this.tileSize, this)
                : new window.ViralFogSystem(this.worldWidth, this.worldHeight, this.tileSize);
            if (!this.viralFogSystem.zones.length) this.viralFogSystem.initialize(this);
            if (this.viralFogSystem.outbreakStartedAt !== null) {
                this.viralFogSystem.rebuildAffectedTiles(this.world);
            }
        };

        const gameSave = window.Game.prototype.saveGame;
        window.Game.prototype.saveGame = function() {
            gameSave.call(this);
            if (!window.SaveManager || !this.viralFogSystem) return;
            const data = window.SaveManager.load() || {};
            data.viralFogSystem = this.viralFogSystem.serialize();
            window.SaveManager.save(data);
        };

        const gameUpdate = window.Game.prototype.update;
        window.Game.prototype.update = function(dt) {
            gameUpdate.call(this, dt);
            if (this.viralFogSystem) this.viralFogSystem.update(dt, this);
        };

        const gameRender = window.Game.prototype.render;
        window.Game.prototype.render = function() {
            gameRender.call(this);
            if (!this.viralFogSystem || this.viralFogSystem.outbreakStartedAt === null) return;
            const strength = this.viralFogSystem.strengthAt(this.player.x, this.player.y);
            if (strength < 0.25) return;
            this.ctx.save();
            this.ctx.fillStyle = 'rgba(20, 35, 10, 0.72)';
            this.ctx.fillRect(12, this.canvas.height - 100, 190, 24);
            this.ctx.fillStyle = '#D9F99D';
            this.ctx.font = '12px sans-serif';
            this.ctx.textAlign = 'left';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('☣ Вірусний туман поруч', 20, this.canvas.height - 88);
            this.ctx.restore();
        };

        const gameInteraction = window.Game.prototype.handleInteraction;
        window.Game.prototype.handleInteraction = function() {
            if (this.viralFogSystem && this.viralFogSystem.interactWithSecret(this)) return;

            if (this.animalManager && this.player && this.player.inventory) {
                const infected = this.animalManager.animals
                    .filter(animal => animal.viralInfected && animal.canInteract(this.player.x, this.player.y))
                    .sort((a, b) => a.distanceTo(this.player.x, this.player.y) - b.distanceTo(this.player.x, this.player.y))[0];
                if (infected) {
                    if (!this.player.inventory.hasItem(SERUM_ID, 1)) {
                        this.showNotification('Щоб вилікувати тварину, потрібна сироватка від вірусу.', 'warning');
                        return;
                    }
                    this.player.inventory.removeItem(SERUM_ID, 1);
                    this.viralFogSystem.cureAnimal(infected, this);
                    return;
                }
            }
            gameInteraction.call(this);
        };
    }

    const updateMapUI = window.updateMapUI;
    if (updateMapUI) {
        window.updateMapUI = function() {
            updateMapUI();
            const game = window.game;
            const canvas = document.getElementById('map-canvas');
            if (game && canvas && game.viralFogSystem) {
                game.viralFogSystem.drawMap(canvas.getContext('2d'), canvas, game);
            }
        };
    }
})();
