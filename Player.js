const PLAYER_MOVE_ORDER = ['w', 'd', 's', 'a'];
const PLAYER_ACTIONS = Object.freeze([
  { direction: 'w', dx: 0, dy: -1 },
  { direction: 'd', dx: 1, dy: 0 },
  { direction: 's', dx: 0, dy: 1 },
  { direction: 'a', dx: -1, dy: 0 },
]);
const OPPOSITE_MOVE = Object.freeze({ w: 's', s: 'w', a: 'd', d: 'a' });
const VISION_SIZE = 20;
const RECENT_TILE_WINDOW = 8;
const PLAYER_START = Object.freeze({ x: 9, y: 8 });

const PLAYER_SPRITE_SETS = (() => {
  let sets = null;
  const make = (sheet, w, h) => ({
    sheet, w, h, frameCount: 4,
    get frameWidth() { return this.sheet.width / this.frameCount; },
    get frameHeight() { return this.sheet.height; },
  });

  return () => {
    if (sets) return sets;
    sets = {
      left: [make(derekLeft, 86, 46), make(epcotLeft, 86, 46), make(josieLeft, 86, 46)],
      right: [make(derekRight, 86, 46), make(epcotRight, 86, 46), make(josieRight, 86, 46)],
      up: [make(derekUp, 40, 100), make(epcotUp, 40, 100), make(josieUp, 40, 100)],
      down: [make(derekDown, 40, 100), make(epcotDown, 40, 100), make(josieDown, 40, 100)],
    };
    return sets;
  };
})();

function drawPlayerSprite(sprite, x, y, frame) {
  imageMode(CENTER);
  image(
    sprite.sheet,
    x,
    y,
    sprite.w,
    sprite.h,
    sprite.frameWidth * Math.floor(frame),
    0,
    sprite.frameWidth,
    sprite.frameHeight,
  );
}

class Player extends Entity {
  constructor(brain = null) {
    const tileCallback = (newLocation) => this.recordTileTransition(newLocation);

    const collisionCallback = (collisions) => {
      for (let i = 0; i < collisions.length; i++) {
        const occupant = collisions[i];

        if (occupant.type === 1) {
          if (!this.isInvincible) {
            this.dead = true;
            this.deathCause = 'enemy';
          }
          continue;
        }

        if (occupant.type < 2 || occupant.type > 5) continue;

        const pickup = pickupRegistry.get(occupant.id);
        if (!pickup || pickup.idList.includes(this.uuid)) continue;

        pickup.idList.push(this.uuid);
        if (occupant.type === 2) {
          this.score += Treat.value;
          this.movesWithoutTreat = 0;
        } else if (occupant.type === 3) {
          this.score += PeanutButter.value;
          this.movesWithoutTreat = 0;
        } else if (occupant.type === 4) {
          if (this.stamina <= 15) this.powerupBonus += 10;
          this.stamina = this.maxStamina;
        } else {
          if (this.hasAdjacentEnemy()) this.powerupBonus += 20;
          this.isInvincible = true;
          this.isInvinUntil = millis() + 7000;
        }

        if (humanPlaying) {
          pickup.deregisterLocation();
          const list =
            occupant.type === 2 ? treats :
            occupant.type === 3 ? pb :
            occupant.type === 4 ? beds : balls;
          const index = list.indexOf(pickup);
          if (index !== -1) list.splice(index, 1);
        }
      }
    };

    super({ x: PLAYER_START.x, y: PLAYER_START.y }, 5, 0, collisionCallback, tileCallback);
    playerRegistry.set(this.uuid, this);

    this.brain = brain;
    this.vision = new Array(VISION_SIZE).fill(0);
    this.dead = false;
    this.deathCause = null;
    this.score = 0;
    this.isInvinUntil = 0;
    this.isInvincible = false;
    this.tilesVisited = [{ x: PLAYER_START.x, y: PLAYER_START.y }];
    this.visitedTileKeys = new Set([this.tileKey(PLAYER_START)]);
    this.recentTiles = [{ x: PLAYER_START.x, y: PLAYER_START.y }];
    this.repeatedTileVisits = 0;
    this.immediateReversals = 0;
    this.lastMoveWasReversal = false;
    this.signedPathProgress = 0;
    this.navigationTargetId = null;
    this.powerupBonus = 0;

    this.spriteSets = PLAYER_SPRITE_SETS();
    this.animationFrame = random(4);
    this.i = floor(random(3));
    this.stamina = 100;
    this.maxStamina = 100;
    this.staminaDrainRate = 0.8;
    this.staminaRegenRate = this.maxStamina / (30 * 60);
    this.isSprinting = false;
    this.staminaCooldown = 0;
  }

  reset(brain = this.brain, spawnLocation = PLAYER_START) {
    this.brain = brain ?? this.brain;
    const spawnX = spawnLocation?.x ?? PLAYER_START.x;
    const spawnY = spawnLocation?.y ?? PLAYER_START.y;

    this.deregisterLocation(this.currentLocation);
    this.currentLocation = { x: spawnX, y: spawnY };
    this.nextLocation = null;
    this.nextX = spawnX;
    this.nextY = spawnY;
    this.x = spawnX * gridWidth;
    this.y = spawnY * gridHeight;
    this.facing = null;
    this.lastDec = null;
    this.isReadytoMove = true;
    this.dead = false;
    this.deathCause = null;
    this.score = 0;
    this.movesWithoutTreat = 0;
    this.powerupBonus = 0;
    this.invalidMove = false;
    this.movesTaken = 0;
    this.fitnessPenalty = 0;
    this.staminaCooldown = 0;
    this.isInvinUntil = 0;
    this.isInvincible = false;
    this.stamina = this.maxStamina;
    this.speed = this.baseSpeed;
    this.isSprinting = false;
    this.repeatedTileVisits = 0;
    this.immediateReversals = 0;
    this.lastMoveWasReversal = false;
    this.signedPathProgress = 0;
    this.navigationTargetId = null;

    this.vision.fill(0);
    this.tilesVisited.length = 0;
    this.tilesVisited.push({ x: spawnX, y: spawnY });
    this.visitedTileKeys.clear();
    this.visitedTileKeys.add(this.tileKey(this.currentLocation));
    this.recentTiles.length = 0;
    this.recentTiles.push({ x: spawnX, y: spawnY });

    this.resetBrainState();
    this.registerLocation(this.currentLocation);
    return this;
  }

  resetBrainState() {
    if (!this.brain) return;
    if (typeof this.brain.resetState === 'function') {
      this.brain.resetState();
    } else if (typeof this.brain.clearState === 'function') {
      this.brain.clearState();
    }
  }

  tileKey(location) {
    return `${location.x},${location.y}`;
  }

  recordTileTransition(newLocation) {
    const previousLocation = this.currentLocation;
    const reversed = !!this.lastDec && OPPOSITE_MOVE[this.lastDec] === this.facing;
    this.lastMoveWasReversal = reversed;
    if (reversed) this.immediateReversals++;

    if (this.wasRecentlyVisited(newLocation)) this.repeatedTileVisits++;

    const key = this.tileKey(newLocation);
    if (!this.visitedTileKeys.has(key)) {
      this.visitedTileKeys.add(key);
      this.tilesVisited.push({ x: newLocation.x, y: newLocation.y });
    }

    this.recentTiles.push({ x: newLocation.x, y: newLocation.y });
    if (this.recentTiles.length > RECENT_TILE_WINDOW) this.recentTiles.shift();

    const target = pickupRegistry.get(this.navigationTargetId);
    if (
      target?.location &&
      (target.type === 2 || target.type === 3) &&
      !target.idList.includes(this.uuid)
    ) {
      const oldDistance = this.shortestPathDistance(previousLocation, target.location);
      const newDistance = this.shortestPathDistance(newLocation, target.location);
      if (Number.isFinite(oldDistance) && Number.isFinite(newDistance)) {
        this.signedPathProgress += oldDistance - newDistance;
      }
    }
  }

  wasRecentlyVisited(location) {
    for (let i = this.recentTiles.length - 2; i >= 0; i--) {
      const tile = this.recentTiles[i];
      if (tile.x === location.x && tile.y === location.y) return true;
    }
    return false;
  }

  show() {
    push();
    if (this.isInvincible) tint(0, 255, 0); else noTint();
    const sprites =
      this.facing === 'w' ? this.spriteSets.up :
      this.facing === 's' ? this.spriteSets.down :
      this.facing === 'd' ? this.spriteSets.right :
      this.spriteSets.left;
    drawPlayerSprite(sprites[this.i], this.x, this.y, this.animationFrame);
    this.animationFrame = (this.animationFrame + 0.1) % 4;
    pop();
  }

  deadzone(v, dz = 0.25) {
    return Math.abs(v) < dz ? 0 : v;
  }

  clampVisionValue(value) {
    return Math.max(-1, Math.min(1, value));
  }

  normalizeRange(value, min, max) {
    if (!Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(max) || max === min) {
      return -1;
    }
    return this.clampVisionValue((((value - min) / (max - min)) * 2) - 1);
  }

  update() {
    if (this.dead) return;
    const now = millis();
    this.isInvincible = now < this.isInvinUntil;

    if (humanPlaying) {
      let wantsSprint = keyIsDown(SHIFT) && this.stamina > 0;
      const gp = navigator.getGamepads?.()?.[activeGamepadIndex ?? 0] ?? null;
      if (gp) {
        const lx = this.deadzone(gp.axes?.[0] ?? 0);
        const ly = this.deadzone(gp.axes?.[1] ?? 0);
        if (ly < 0) this.move('w'); else if (ly > 0) this.move('s');
        if (lx < 0) this.move('a'); else if (lx > 0) this.move('d');
        wantsSprint ||= !!gp.buttons?.[0]?.pressed;
      } else {
        if (keyIsDown(87)) this.move('w');
        if (keyIsDown(83)) this.move('s');
        if (keyIsDown(65)) this.move('a');
        if (keyIsDown(68)) this.move('d');
      }
      this.isSprinting = wantsSprint;
    }

    if (this.isSprinting && this.stamina > 1) {
      this.speed = this.boostedSpeed;
      this.stamina -= this.staminaDrainRate;
      if (this.stamina <= 0) {
        this.stamina = 1;
        this.isSprinting = false;
        this.staminaCooldown = now + 3000;
      }
    } else {
      this.speed = this.baseSpeed;
      if (this.stamina < this.maxStamina && (!this.staminaCooldown || now > this.staminaCooldown)) {
        this.stamina = Math.min(this.maxStamina, this.stamina + this.staminaRegenRate);
      }
    }
  }

  look() {
    const navigation = this.buildScoringDistanceField();
    this.navigationTargetId = navigation.targetId;

    for (let i = 0; i < PLAYER_ACTIONS.length; i++) {
      const action = PLAYER_ACTIONS[i];
      const destination = {
        x: this.currentLocation.x + action.dx,
        y: this.currentLocation.y + action.dy,
      };
      const legal = !!mapGrid[destination.y]?.[destination.x]?.valid;

      this.vision[i] = legal ? 1 : -1;
      this.vision[4 + i] = legal
        ? this.getPathProgressSignal(destination, navigation.distances)
        : 0;
      this.vision[8 + i] = legal ? this.getEnemyDangerSignal(destination) : 1;
      this.vision[12 + i] = legal ? this.getRecentVisitSignal(destination) : 1;
    }

    this.vision[16] = this.normalizeRange(this.stamina, 0, this.maxStamina);
    this.vision[17] = this.isInvincible ? 1 : -1;
    this.vision[18] = this.normalizeRange(
      this.movesWithoutTreat,
      0,
      MAX_MOVES_WITHOUT_TREAT,
    );
    this.vision[19] = this.lastMoveWasReversal ? 1 : -1;
    return this.vision;
  }

  getCollectableScoringPickups() {
    const result = [];
    for (const pickup of pickupRegistry.values()) {
      if (
        (pickup.type === 2 || pickup.type === 3) &&
        pickup.location &&
        !pickup.idList.includes(this.uuid)
      ) {
        result.push(pickup);
      }
    }
    return result;
  }

  buildScoringDistanceField() {
    const height = mapGrid.length;
    const distances = Array.from(
      { length: height },
      (_, y) => new Array(mapGrid[y]?.length ?? 0).fill(Infinity),
    );
    const owners = Array.from(
      { length: height },
      (_, y) => new Array(mapGrid[y]?.length ?? 0).fill(null),
    );
    const queue = [];
    const pickups = this.getCollectableScoringPickups();

    for (let i = 0; i < pickups.length; i++) {
      const pickup = pickups[i];
      const { x, y } = pickup.location;
      if (!mapGrid[y]?.[x]?.valid) continue;
      if (distances[y][x] === 0) continue;
      distances[y][x] = 0;
      owners[y][x] = pickup.uuid;
      queue.push({ x, y });
    }

    for (let head = 0; head < queue.length; head++) {
      const current = queue[head];
      const nextDistance = distances[current.y][current.x] + 1;

      for (let i = 0; i < PLAYER_ACTIONS.length; i++) {
        const action = PLAYER_ACTIONS[i];
        const nx = current.x + action.dx;
        const ny = current.y + action.dy;
        if (!mapGrid[ny]?.[nx]?.valid || distances[ny][nx] <= nextDistance) continue;

        distances[ny][nx] = nextDistance;
        owners[ny][nx] = owners[current.y][current.x];
        queue.push({ x: nx, y: ny });
      }
    }

    return {
      distances,
      targetId: owners[this.currentLocation.y]?.[this.currentLocation.x] ?? null,
    };
  }

  getPathProgressSignal(destination, distances) {
    const currentDistance = distances[this.currentLocation.y]?.[this.currentLocation.x];
    const nextDistance = distances[destination.y]?.[destination.x];
    if (!Number.isFinite(currentDistance) || !Number.isFinite(nextDistance)) return 0;
    return this.clampVisionValue(currentDistance - nextDistance);
  }

  getEnemyDangerSignal(destination) {
    if (this.isInvincible) return -1;

    let minimumDistance = Infinity;
    for (let i = 0; i < enemies.length; i++) {
      const enemy = enemies[i];
      if (!enemy?.isActive) continue;

      const positions = [enemy.currentLocation, enemy.nextLocation];
      for (let j = 0; j < positions.length; j++) {
        const position = positions[j];
        if (!position) continue;
        const distance =
          Math.abs(position.x - destination.x) +
          Math.abs(position.y - destination.y);
        minimumDistance = Math.min(minimumDistance, distance);
      }
    }

    if (minimumDistance === 0) return 1;
    if (minimumDistance === 1) return 0.5;
    if (minimumDistance === 2) return 0;
    return -1;
  }

  getRecentVisitSignal(destination) {
    for (let i = this.recentTiles.length - 1; i >= 0; i--) {
      const tile = this.recentTiles[i];
      if (tile.x !== destination.x || tile.y !== destination.y) continue;

      const age = this.recentTiles.length - 1 - i;
      return this.clampVisionValue(1 - (2 * age) / RECENT_TILE_WINDOW);
    }
    return -1;
  }

  shortestPathDistance(start, goal) {
    if (!start || !goal) return Infinity;
    if (start.x === goal.x && start.y === goal.y) return 0;

    const queue = [{ x: start.x, y: start.y, distance: 0 }];
    const visited = new Set([this.tileKey(start)]);

    for (let head = 0; head < queue.length; head++) {
      const current = queue[head];
      for (let i = 0; i < PLAYER_ACTIONS.length; i++) {
        const action = PLAYER_ACTIONS[i];
        const nx = current.x + action.dx;
        const ny = current.y + action.dy;
        if (!mapGrid[ny]?.[nx]?.valid) continue;
        if (nx === goal.x && ny === goal.y) return current.distance + 1;

        const key = `${nx},${ny}`;
        if (visited.has(key)) continue;
        visited.add(key);
        queue.push({ x: nx, y: ny, distance: current.distance + 1 });
      }
    }
    return Infinity;
  }

  hasAdjacentEnemy() {
    const { x, y } = this.currentLocation;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const occupants = mapGrid[y + dy]?.[x + dx]?.occupantsByType?.[1];
        if (occupants?.length) return true;
      }
    }
    return false;
  }

  think() {
    const decision = this.brain.propagate(this.vision);
    let maxIndex = 0;
    let max = decision[0] ?? -Infinity;
    for (let i = 1; i < 4; i++) {
      if ((decision[i] ?? -Infinity) > max) {
        max = decision[i];
        maxIndex = i;
      }
    }

    this.isSprinting = (decision[4] ?? 0) > 0.5;

    if (this.isReadytoMove) {
      this.movesWithoutTreat++;
      if (this.movesWithoutTreat > MAX_MOVES_WITHOUT_TREAT) {
        this.dead = true;
        this.deathCause = 'timeout';
        return;
      }
    }

    this.move(PLAYER_MOVE_ORDER[maxIndex]);
  }

  getFitnessScore() {
    const scoreReward = 25 * this.score;
    const explorationReward = this.tilesVisited.length;
    const progressReward = 2 * this.signedPathProgress;
    const usefulPowerupReward = 0.5 * this.powerupBonus;

    const movementPenalty = 0.05 * this.movesTaken;
    const revisitPenalty = 0.5 * this.repeatedTileVisits;
    const reversalPenalty = 1.5 * this.immediateReversals;
    const invalidMovePenalty = 2 * this.fitnessPenalty;
    const deathPenalty =
      this.deathCause === 'enemy' ? 15 :
      this.deathCause === 'timeout' ? 5 : 0;

    return (
      scoreReward +
      explorationReward +
      progressReward +
      usefulPowerupReward -
      movementPenalty -
      revisitPenalty -
      reversalPenalty -
      invalidMovePenalty -
      deathPenalty
    );
  }

  calculateFitness() {
    this.brain.fitness = this.getFitnessScore();
    return this.brain.fitness;
  }
}
