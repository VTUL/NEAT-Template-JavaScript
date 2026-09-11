const PLAYER_MOVE_ORDER = ['w', 'd', 's', 'a'];
const SCAN_DX = [0, 0, 1, 0, -1];
const SCAN_DY = [0, -1, 0, 1, 0];
const VISION_SIZE = 23;
const PLAYER_START = Object.freeze({ x: 9, y: 8 });

class Player extends Entity {
  constructor(brain = null) {
    const collisionCallback = (collisions) => {
      if (!collisions?.length) return;

      for (let i = 0; i < collisions.length; i++) {
        const occupant = collisions[i];

        switch (occupant.type) {
          case 1:
            if (!this.isInvincible) this.dead = true;
            break;

          case 2: {
            for (let j = treats.length - 1; j >= 0; j--) {
              const treatObj = treats[j];
              if (!treatObj || treatObj.uuid !== occupant.id) continue;
              if (treatObj.idList.includes(this.uuid)) break;

              this.score += Treat.value;
              this.movesWithoutTreat = 0;
              treatObj.idList.push(this.uuid);
              if (humanPlaying) {
                treatObj.deregisterLocation();
                treats.splice(j, 1);
              }
              break;
            }
            break;
          }

          case 3: {
            const pickup = pb[0];
            if (!pickup || pickup.uuid !== occupant.id || pickup.idList.includes(this.uuid)) break;

            this.score += PeanutButter.value;
            this.movesWithoutTreat = 0;
            pickup.idList.push(this.uuid);
            if (humanPlaying) {
              pickup.deregisterLocation();
              pb.splice(0, 1);
            }
            break;
          }

          case 4: {
            const pickup = beds[0];
            if (!pickup || pickup.uuid !== occupant.id || pickup.idList.includes(this.uuid)) break;

            pickup.idList.push(this.uuid);
            this.stamina = this.maxStamina;
            if (humanPlaying) {
              pickup.deregisterLocation();
              beds.splice(0, 1);
            }
            break;
          }

          case 5: {
            const pickup = balls[0];
            if (!pickup || pickup.uuid !== occupant.id || pickup.idList.includes(this.uuid)) break;

            pickup.idList.push(this.uuid);
            this.isInvincible = true;
            this.isInvinUntil = millis() + 10000;
            if (humanPlaying) {
              pickup.deregisterLocation();
              balls.splice(0, 1);
            }
            break;
          }
        }
      }
    };

    super({ x: PLAYER_START.x, y: PLAYER_START.y }, 40, 24, 5, 0, collisionCallback);

    this.genomeInputs = VISION_SIZE;
    this.genomeOutputs = 5;
    this.brain = brain;

    this.vision = new Array(VISION_SIZE).fill(0);
    this.decision = [];
    this.unadjustedFitness = 0;
    this.bestScore = 0;
    this.dead = false;
    this.score = 0;
    this.gen = 0;

    this.isInvinUntil = 0;
    this.isInvincible = false;

    // Each player keeps its own Sprite instances so animation timing does not
    // depend on how many players are drawing.
    this.spriteLeft = [
      new Sprite(derekLeft, 86, 46, 4),
      new Sprite(epcotLeft, 86, 46, 4),
      new Sprite(josieLeft, 86, 46, 4),
    ];
    this.spriteRight = [
      new Sprite(derekRight, 86, 46, 4),
      new Sprite(epcotRight, 86, 46, 4),
      new Sprite(josieRight, 86, 46, 4),
    ];
    this.spriteUp = [
      new Sprite(derekUp, 40, 100, 4),
      new Sprite(epcotUp, 40, 100, 4),
      new Sprite(josieUp, 40, 100, 4),
    ];
    this.spriteDown = [
      new Sprite(derekDown, 40, 100, 4),
      new Sprite(epcotDown, 40, 100, 4),
      new Sprite(josieDown, 40, 100, 4),
    ];
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
    this.bestScore = 0;
    this.gen = 0;
    this.movesWithoutTreat = 0;
    this.movesTaken = 0;
    this.fitnessPenalty = 0;
    this.isInvinUntil = 0;
    this.isInvincible = false;
    this.stamina = this.maxStamina;
    this.speed = this.baseSpeed;
    this.isSprinting = false;
    this.distanceTrackerX = this.x;
    this.distanceTrackerY = this.y;

    if (this.vision.length !== VISION_SIZE) this.vision = new Array(VISION_SIZE).fill(0);
    else this.vision.fill(0);
    this.decision.length = 0;

    this.registerLocation(this.currentLocation);
    return this;
  }

  show() {
    push();
    if (this.isInvincible) tint(0, 255, 0);
    else noTint();

    const sprites =
      this.facing === 'w' ? this.spriteUp :
      this.facing === 's' ? this.spriteDown :
      this.facing === 'd' ? this.spriteRight :
      this.spriteLeft;

    sprites[this.i].draw(this.x, this.y);
    pop();
  }

  deadzone(v, dz = 0.25) {
    return Math.abs(v) < dz ? 0 : v;
  }

  update() {
    if (this.dead) return;

    const now = millis();
    this.isInvincible = now < this.isInvinUntil;

    if (humanPlaying) {
      let wantsSprint = keyIsDown(SHIFT) && this.stamina > 0;
      const pads = navigator.getGamepads?.();
      const gp = pads?.[activeGamepadIndex ?? 0] ?? null;

      if (gp) {
        const lx = this.deadzone(gp.axes?.[0] ?? 0);
        const ly = this.deadzone(gp.axes?.[1] ?? 0);

        if (ly < 0) this.move('w');
        else if (ly > 0) this.move('s');
        if (lx < 0) this.move('a');
        else if (lx > 0) this.move('d');

        wantsSprint = wantsSprint || !!gp.buttons?.[0]?.pressed;
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
    vision[0] = this.checkWall(1);
    vision[1] = this.checkWall(2);
    vision[2] = this.checkWall(3);
    vision[3] = this.checkWall(4);
    vision[4] = this.checkOther(1, 1);
    vision[5] = this.checkOther(2, 1);
    vision[6] = this.checkOther(3, 1);
    vision[7] = this.checkOther(4, 1);
    vision[8] = this.checkOther(1, 2);
    vision[9] = this.checkOther(2, 2);
    vision[10] = this.checkOther(3, 2);
    vision[11] = this.checkOther(4, 2);
    vision[12] = this.checkOther(1, 3);
    vision[13] = this.checkOther(2, 3);
    vision[14] = this.checkOther(3, 3);
    vision[15] = this.checkOther(4, 3);
    vision[16] = this.checkOther(1, 4);
    vision[17] = this.checkOther(2, 4);
    vision[18] = this.checkOther(3, 4);
    vision[19] = this.checkOther(4, 4);
    vision[20] = this.stamina/100;
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

      const occupants = cell.occupants;
      if (!occupants?.length) continue;

      for (let i = 0; i < occupants.length; i++) {
        const occ = occupants[i];
        if (occ.type === targetType && !Pickup.inList(occ.id, occ.type, this.uuid)) {
          return 1 / steps;
        }
      }
    }

    return 0;
  }

  checkWall(direction) {
    return this._scan(direction, 17);
  }

  checkOther(direction, target) {
    return this._scan(direction, 19, target);
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
        return;
      }
    }

    this.move(PLAYER_MOVE_ORDER[maxIndex]);
  }

  calculateFitness() {
    this.brain.fitness = (this.score + (this.movesTaken / 10)) - (this.fitnessPenalty / 3);
  }
}
