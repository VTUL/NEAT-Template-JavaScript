const PLAYER_MOVE_ORDER = ['w', 'd', 's', 'a'];
const SCAN_DX = [0, 0, 1, 0, -1];
const SCAN_DY = [0, -1, 0, 1, 0];
const VISION_SIZE = 23;
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
  image(sprite.sheet, x, y, sprite.w, sprite.h,
    sprite.frameWidth * Math.floor(frame), 0, sprite.frameWidth, sprite.frameHeight);
}

class Player extends Entity {
  constructor(brain = null) {
    const collisionCallback = (collisions) => {
      for (let i = 0; i < collisions.length; i++) {
        const occupant = collisions[i];
        if (occupant.type === 1) {
          if (!this.isInvincible) this.dead = true;
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
          this.stamina = this.maxStamina;
        } else {
          this.isInvincible = true;
          this.isInvinUntil = millis() + 10000;
        }

        if (humanPlaying) {
          pickup.deregisterLocation();
          const list = occupant.type === 2 ? treats : occupant.type === 3 ? pb : occupant.type === 4 ? beds : balls;
          const index = list.indexOf(pickup);
          if (index !== -1) list.splice(index, 1);
        }
      }
    };

    super({ x: PLAYER_START.x, y: PLAYER_START.y }, 40, 24, 5, 0, collisionCallback);
    playerRegistry.set(this.uuid, this);
    this.genomeInputs = VISION_SIZE;
    this.genomeOutputs = 5;
    this.brain = brain;
    this.vision = new Array(VISION_SIZE).fill(0);
    this.decision = [];
    this.dead = false;
    this.score = 0;
    this.isInvinUntil = 0;
    this.isInvincible = false;
    this.tilesVisited = [];

    // Immutable sprite metadata is shared by every player.
    this.spriteSets = PLAYER_SPRITE_SETS();
    this.animationFrame = random(4);
    this.i = floor(random(3));
    this.distanceTrackerX = this.x;
    this.distanceTrackerY = this.y;
    this.r = getRandomInt(0, 255);
    this.g = getRandomInt(0, 255);
    this.b = getRandomInt(0, 255);
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
    this.score = 0;
    this.movesWithoutTreat = 0;
    this.fitnessPenalty = 0;
    this.isInvinUntil = 0;
    this.isInvincible = false;
    this.stamina = this.maxStamina;
    this.speed = this.baseSpeed;
    this.isSprinting = false;
    this.distanceTrackerX = this.x;
    this.distanceTrackerY = this.y;
    this.vision.fill(0);
    this.decision.length = 0;
    this.tilesVisited.length = 0;
    this.registerLocation(this.currentLocation);
    return this;
  }

  show() {
    push();
    if (this.isInvincible) tint(0, 255, 0); else noTint();
    const sprites = this.facing === 'w' ? this.spriteSets.up : this.facing === 's' ? this.spriteSets.down : this.facing === 'd' ? this.spriteSets.right : this.spriteSets.left;
    drawPlayerSprite(sprites[this.i], this.x, this.y, this.animationFrame);
    this.animationFrame = (this.animationFrame + 0.1) % 4;
    pop();
  }

  deadzone(v, dz = 0.25) { return Math.abs(v) < dz ? 0 : v; }

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
    const vision = this.vision;
    vision[0] = this.checkWall(1); vision[1] = this.checkWall(2); vision[2] = this.checkWall(3); vision[3] = this.checkWall(4);
    vision[4] = this.checkOther(1, 1); vision[5] = this.checkOther(2, 1); vision[6] = this.checkOther(3, 1); vision[7] = this.checkOther(4, 1);
    vision[8] = this.checkOther(1, 2); vision[9] = this.checkOther(2, 2); vision[10] = this.checkOther(3, 2); vision[11] = this.checkOther(4, 2);
    vision[12] = this.checkOther(1, 3); vision[13] = this.checkOther(2, 3); vision[14] = this.checkOther(3, 3); vision[15] = this.checkOther(4, 3);
    vision[16] = this.checkOther(1, 4); vision[17] = this.checkOther(2, 4); vision[18] = this.checkOther(3, 4); vision[19] = this.checkOther(4, 4);
    vision[20] = this.stamina / 100;
    vision[21] = this.speed === 5 ? 0 : 1;
    vision[22] = this.isInvincible ? 1 : 0;
    return vision;
  }

  _scan(direction, maxSteps, targetType = null) {
    const dx = SCAN_DX[direction];
    const dy = SCAN_DY[direction];
    const startX = this.currentLocation.x;
    const startY = this.currentLocation.y;
    for (let steps = 1; steps <= maxSteps; steps++) {
      const cell = mapGrid[startY + dy * steps]?.[startX + dx * steps];
      if (!cell?.valid) return 1 / steps;
      if (targetType === null) continue;
      const occupants = cell.occupantsByType?.[targetType];
      if (!occupants?.length) continue;
      for (let i = 0; i < occupants.length; i++) {
        const occ = occupants[i];
        if (!Pickup.inList(occ.id, occ.type, this.uuid)) return 1 / steps;
      }
    }
    return 0;
  }

  checkWall(direction) { return this._scan(direction, 17); }
  checkOther(direction, target) { return this._scan(direction, 19, target); }

  think() {
    const decision = this.brain.propagate(this.vision);
    let maxIndex = 0;
    let max = decision[0] ?? -Infinity;
    for (let i = 1; i < 4; i++) {
      if ((decision[i] ?? -Infinity) > max) { max = decision[i]; maxIndex = i; }
    }
    this.isSprinting = (decision[4] ?? 0) > 0.5;
    if (this.isReadytoMove) {
      this.movesWithoutTreat++;
      if (this.movesWithoutTreat > MAX_MOVES_WITHOUT_TREAT) { this.dead = true; return; }
    }
    this.move(PLAYER_MOVE_ORDER[maxIndex]);
  }

  calculateFitness() {
    console.log(this.tilesVisited);
    const explorationBonus = 0.25 * this.tilesVisited.length;
    const usefulPowerupBonus = 0.1 * stats.usefulPowerupsCollected;
    const wallPenalty = 0.5 * Math.pow(this.fitnessPenalty, 1.25);

    this.brain.fitness = (this.score + explorationBonus + usefulPowerupBonus) - wallPenalty;
  }
}
