class Player extends Entity {
  constructor() {
    super({ x: 8, y: 7 }, 40, 24, 5);
    this.fitness = 0;
    this.vision = []; //the input array fed into the neuralNet
    this.decision = []; //the out put of the NN
    this.unadjustedFitness;
    // this.lifespan = 0; //how long the player lived for this.fitness
    this.bestScore = 0; //stores the this.score achieved used for replay
    this.dead = false;
    this.score = 0;
    this.gen = 0;
    // this.distanceInterval = 20;
    // this.distanceReward = 100;
    this.pickupRewardModifier = 2000;
    // this.distance = 0;
    this.fitnessPenalty = 0;
    this.penaltyModifier = 100;
    // this.distanceModifier = 500;

    this.genomeInputs = 10; // 4 for walls, 5 for pickups 1 for enemies
    this.genomeOutputs = 5; // Up, Right, Down, Left, Sprint
    this.brain = new Genome(this.genomeInputs, this.genomeOutputs);

    this.uuid = crypto.randomUUID();

    this.isInvinUntil = 0;
    
    // this.w = 40;
    // this.h = 24;
    
    this.isInvincible = false;

    // this.lastScoreMillis = millis();
    // this.previousX = this.x;
    // this.previousY = this.y;
    // this.lastMeaningfulMoveTime = millis();
    // this.minMeaningfulDistance = 40; //mess with
    // this.decisionCount = 15;

    //sprite variables
    this.derek = new Sprite(derek, 64, 32, 4);
    this.derekUp = new Sprite(derekUp, 28, 72, 4);
    this.derekDown = new Sprite(derekDown, 28, 72, 4);
    this.epcot = new Sprite(epcot, 64, 32, 4);
    this.epcotUp = new Sprite(epcotUp, 28, 72, 4);
    this.epcotDown = new Sprite(epcotDown, 28, 72, 4);
    this.josie = new Sprite(josie, 64, 32, 4);
    this.josieUp = new Sprite(josieUp, 28, 72, 4);
    this.josieDown = new Sprite(josieDown, 28, 72, 4);
    this.sprite = [this.derek, this.epcot, this.josie];
    this.spriteUp = [this.derekUp, this.epcotUp, this.josieUp];
    this.spriteDown = [this.derekDown, this.epcotDown, this.josieDown];
    this.i = 0;

    this.distanceTrackerX = this.x;
    this.distanceTrackerY = this.y;

    this.stamina = 100;
    this.maxStamina = 100;
    this.staminaDrainRate = 0.8; //per frame when sprinting
    this.staminaRegenRate = this.maxStamina / (30 * 60); //regen over 30 seconds at 60 fps
    this.isSprinting = false;

    // this.checkUp = this.checkUp.bind(this);
    // this.checkRight = this.checkRight.bind(this);
    // this.checkDown = this.checkDown.bind(this);
    // this.checkLeft = this.checkLeft.bind(this);
  }

  show() {
    //draw the player sprite
    push();
    const cx = this.x + this.w / 2;
    const cy = this.y + this.h / 2;

    translate(cx, cy);

    if (this.facing === "a") {
      scale(-1, 1);
    }

    if (this.isInvincible) {
      tint(0, 255, 0);
    } else {
      noTint();
    }

    //different sprites for different directions
    if (this.facing === "w") {
      this.spriteUp[this.i].draw();
      this.w = 24;
      this.h = 40;
    } else if (this.facing === "s") {
      this.spriteDown[this.i].draw();
      this.w = 24;
      this.h = 40;
    } else {
      this.sprite[this.i].draw();
      this.w = 40;
      this.h = 24;
    }

    imageMode(CENTER);
    pop();

    //collision box
    //noFill();
    //stroke(255, 0, 0);
    //rect(this.x, this.y, this.w, this.h);
  }

  update() {
    if (this.dead) return;

    this.isInvincible = millis() < this.isInvinUntil;

    if (humanPlaying) {
      if (keyIsDown(87)) {
        // W
        this.move("w");
      }
      if (keyIsDown(83)) {
        // S
        this.move("s");
      }
      if (keyIsDown(65)) {
        // A
        this.move("a");
      }
      if (keyIsDown(68)) {
        // D
        this.move("d");
      }

      this.isSprinting = keyIsDown(SHIFT) && this.stamina > 0;
    }

    //sprint logic
    if (this.isSprinting && this.stamina > 0) {
      this.speed = this.boostedSpeed;
      this.stamina -= this.staminaDrainRate;
      if (this.stamina < 0) this.stamina = 0;
    } else {
      this.speed = this.baseSpeed;
      if (this.stamina < this.maxStamina) {
        this.stamina += this.staminaRegenRate;
        if (this.stamina > this.maxStamina) this.stamina = this.maxStamina;
      }
    }
  }

  look() {
    this.vision = [];
    const centerX = this.x + this.w / 2;
    const centerY = this.y + this.h / 2;

    //push distances to vision array
    this.vision.push(map(this.checkUp(), 1, 14, 0, 1));
    this.vision.push(map(this.checkRight(), 1, 17, 0, 1));
    this.vision.push(map(this.checkDown(), 1, 14, 0, 1));
    this.vision.push(map(this.checkLeft(), 1, 17, 0, 1));

    this.vision.push(
      map(this.getDistance(enemies, centerX, centerY), 0, 1500, 0, 1)
    );
    this.vision.push(
      map(this.getDistance(treats, centerX, centerY), 0, 1500, 0, 1)
    );
    this.vision.push(
      map(this.getDistance(anti, centerX, centerY), 0, 1500, 0, 1)
    );
    this.vision.push(
      map(this.getDistance(balls, centerX, centerY), 0, 1500, 0, 1)
    );
    this.vision.push(
      map(this.getDistance(beds, centerX, centerY), 0, 1500, 0, 1)
    );
    this.vision.push(
      map(this.getDistance(pb, centerX, centerY), 0, 1500, 0, 1)
    );

  }

  getNearest(targets, centerX, centerY) {
    if (!targets || targets.length === 0) return null;

    let nearest = null;
    let minDist = Infinity;

    for (let t of targets) {
      if (t.idList?.includes(this.uuid)) continue;
      const dx = t.x - centerX;
      const dy = t.y - centerY;
      const dist = Math.abs(dx) + Math.abs(dy);

      if (dist < minDist) {
        minDist = dist;
        nearest = t;
      }
    }

    return nearest;
  }

  checkUp() {
    let dist;
    for(let steps = 1; steps <= gridRows; steps++) {
      if (typeof mapGrid[this.currentLocation.y - steps]?.[this.currentLocation.x] === "undefined" || !mapGrid[this.currentLocation.y - steps]?.[this.currentLocation.x]) {
        dist = steps;
        break; 
      }
    }
    return dist;
  }

  checkRight() {
    let dist;
    for(let steps = 1; steps <= gridColumns; steps++) {
      if (typeof mapGrid[this.currentLocation.y]?.[this.currentLocation.x + steps] === "undefined" || !mapGrid[this.currentLocation.y]?.[this.currentLocation.x + steps]) {
        dist = steps;
        break; 
      }
    }
    return dist;
  }

  checkDown() {
    let dist;
    for(let steps = 1; steps <= gridRows; steps++) {
      if (typeof mapGrid[this.currentLocation.y + steps]?.[this.currentLocation.x] === "undefined" || !mapGrid[this.currentLocation.y + steps]?.[this.currentLocation.x]) {
        dist = steps;
        break; 
      }
    }
    return dist;
  }

  checkLeft() {
    let dist;
    for(let steps = 1; steps <= gridColumns; steps++) {
      if (typeof mapGrid[this.currentLocation.y]?.[this.currentLocation.x - steps] === "undefined" || !mapGrid[this.currentLocation.y]?.[this.currentLocation.x - steps]) {
        dist = steps;
        break; 
      }
    }
    return dist;
  }

  getDistance(targets, centerX, centerY) {
    if (!targets || targets.length === 0) {
      return 1500;
    }
    return targets?.reduce((accumulator, currentValue) => {
      if (currentValue.idList?.includes(this.uuid)) {
        return accumulator;
      }
      const temp =
        Math.abs(centerX - currentValue.x) + Math.abs(centerY - currentValue.y);
      if (temp < accumulator) {
        return temp;
      }
      return accumulator;
    }, 1500);
  }

  think() {
    let max = 0;
    let maxIndex = 0;
    // console.info("Vision - Up: ", this.vision[0]);
    // console.info("Vision - Right: ", this.vision[1]);
    // console.info("Vision - Down: ", this.vision[2]);
    // console.info("Vision - Left: ", this.vision[3]);
    // console.info("Vision - Enemies: ", this.vision[4]);
    // console.info("Vision - Treats: ", this.vision[5]);
    // console.info("Vision - Anti: ", this.vision[6]);
    // console.info("Vision - balls: ", this.vision[7]);
    // console.info("Vision - Ball: ", this.vision[8]);
    // console.info("Vision - PB: ", this.vision[9]);

    //movement decision
    let directions = ["w", "d", "s", "a"];
    this.decision = this.brain.feedForward(this.vision);

    for (let i = 0; i < 4; i++) {
      if (this.decision[i] > max) {
        max = this.decision[i];
        maxIndex = i;
      }
    }

    this.move(directions[maxIndex]);
  }

  //---------------------------------------------------------------------------------------------------------------------------------------------------------
  //returns a clone of this player with the same brian
  clone() {
    var clone = new Player();
    clone.brain = this.brain.clone();
    clone.fitness = this.fitness;
    clone.brain.generateNetwork();
    clone.gen = this.gen;
    clone.bestScore = this.score;
    clone.stamina = this.stamina;
    clone.maxStamina = this.maxStamina;
    return clone;
  }

  //---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  //since there is some randomness in games sometimes when we want to replay the game we need to remove that randomness
  //this fuction does that

  cloneForReplay() {
    var clone = new Player();
    clone.brain = this.brain.clone();
    clone.fitness = this.fitness;
    clone.brain.generateNetwork();
    clone.gen = this.gen;
    clone.bestScore = this.score;
    clone.stamina = this.stamina;
    clone.maxStamina = this.maxStamina;

    //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
    return clone;
  }

  calculateFitness() {
    // this.fitness =
    //   this.score * this.score * this.pickupRewardModifier +
    //   this.distance * this.distanceModifier -
    //   this.fitnessPenalty * this.penaltyModifier;

    this.fitness = this.score * this.score * this.pickupRewardModifier - (this.fitnessPenalty * this.penaltyModifier);
  }

  crossover(parent2) {
    var child = new Player();
    child.brain = this.brain.crossover(parent2.brain);
    child.brain.generateNetwork();
    return child;
  }

}
