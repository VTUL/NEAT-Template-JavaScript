class Player {
  constructor() {
    this.fitness = 0;
    this.vision = []; //the input array fed into the neuralNet
    this.decision = []; //the out put of the NN
    this.unadjustedFitness;
    this.lifespan = 0; //how long the player lived for this.fitness
    this.bestScore = 0; //stores the this.score achieved used for replay
    this.dead = false;
    this.score = 0;
    this.gen = 0;
    this.distanceInterval = 20;
    this.distanceReward = 100;
    this.pickupRewardModifier = 2000;
    this.distance = 0;
    this.fitnessPenalty = 0;
    this.penaltyModifier = 100;
    this.distanceModifier = 500;

    this.genomeInputs = 22; // 4 for walls, 5 for pickups 1 for enemies
    this.genomeOutputs = 5; // Up, Right, Down, Left, Sprint
    this.brain = new Genome(this.genomeInputs, this.genomeOutputs);

    this.uuid = crypto.randomUUID();

    this.baseSpeed = 5;
    this.boostedSpeed = 10;
    this.speed = this.baseSpeed;
    this.isInvinUntil = 0;
    this.x = 516;
    this.y = 375;
    this.w = 40;
    this.h = 24;
    this.dir = "d"; //the direction the player is facing
    this.isInvincible = false;

    this.lastScoreMillis = millis();
    this.previousX = this.x;
    this.previousY = this.y;
    this.lastMeaningfulMoveTime = millis();
    this.minMeaningfulDistance = 40; //mess with
  
    this.lastDec;
    this.decisionCount = 15;
    
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

    this.checkUp = this.checkUp.bind(this);
    this.checkRight = this.checkRight.bind(this);
    this.checkDown = this.checkDown.bind(this);
    this.checkLeft = this.checkLeft.bind(this);

    this.recentPositions = [];

  }

  show() {

     /*if (this.x + this.w < 0 && this.y + this.h > 400 && this.y + this.h < 600) {
       this.x = width;
       this.y = 460;
     } else if (
      this.x > width &&
       this.y + this.h > 400 &&
       this.y + this.h < 600
     ) {
       this.x = -this.w;
       this.y = 460;
     }*/

     //draw the player sprite
     push();
    const cx = this.x + this.w / 2;
    const cy = this.y + this.h / 2;

    translate(cx, cy);

    if (this.facing === "a") {
      scale(-1, 1);
   }

    imageMode(CENTER);

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

    imageMode(CORNER);
    pop();

    //collision box
    //noFill();
    //stroke(255, 0, 0);
    //rect(this.x, this.y, this.w, this.h);
    
  }

  move(direction) {
    this.facing = direction;
    let dx = 0;
    let dy = 0;

    switch (direction) {
      case "a":
        if (
          !this.collidesWithBlocks(
            this.x - this.speed - 2,
            this.y,
            this.w,
            this.h
          )
        ) {
          this.x = this.x - this.speed;
          if((Math.abs(this.distanceTrackerX - this.x) > this.distanceInterval || Math.abs(this.distanceTrackerY - this.y) > this.distanceInterval)) {
            this.distanceTrackerX = this.x;
            this.distanceTrackerY = this.y;
            this.distance += this.distanceReward;
          }
        } else {
          this.fitnessPenalty += 1;
        }
        break;
      case "d":
        if (
          !this.collidesWithBlocks(
            this.x + this.speed + 2,
            this.y,
            this.w,
            this.h
          )
        ) {
          this.x = this.x + this.speed;
          if((Math.abs(this.distanceTrackerX - this.x) > this.distanceInterval || Math.abs(this.distanceTrackerY - this.y) > this.distanceInterval)) {
            this.distanceTrackerX = this.x;
            this.distanceTrackerY = this.y;
            this.distance += this.distanceReward;
          }
        } else {
          this.fitnessPenalty += 1;
        }
        break;
      case "w":
        if (
          !this.collidesWithBlocks(
            this.x,
            this.y - this.speed - 5,
            this.w,
            this.h
          )
        ) {
          this.y = this.y - this.speed;
          if((Math.abs(this.distanceTrackerX - this.x) > this.distanceInterval || Math.abs(this.distanceTrackerY - this.y) > this.distanceInterval)) {
            this.distanceTrackerX = this.x;
            this.distanceTrackerY = this.y;
            this.distance += this.distanceReward;
          }
        } else {
          this.fitnessPenalty += 1;
        }
        break;
      case "s":
        if (
          !this.collidesWithBlocks(
            this.x,
            this.y + this.speed + 5,
            this.w,
            this.h
          )
        ) {
          this.y = this.y + this.speed;
          if((Math.abs(this.distanceTrackerX - this.x) > this.distanceInterval || Math.abs(this.distanceTrackerY - this.y) > this.distanceInterval)) {
            this.distanceTrackerX = this.x;
            this.distanceTrackerY = this.y;
            this.distance += this.distanceReward;
          }
        } else {
          this.fitnessPenalty += 1;
        }
        break;
    }

    //track and analyze recent positions for loop detection
    this.recentPositions.push({ x: this.x, y: this.y });
    if (this.recentPositions.length > 10) this.recentPositions.shift();

    const looped = this.recentPositions.filter(
      pos => Math.abs(pos.x - this.x) < 10 && Math.abs(pos.y - this.y) < 10
      ).length;

    if (looped > 3) {
      this.fitnessPenalty += 10; //discourage standing still or cycling
    }

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
    
    // console.info("ID: ", this.id);
    // console.info("Fitness Penalty: ", this.fitnessPenalty);
    // console.info("Distance: ", this.distance);
    // console.info("X: ", this.x);
    // console.info("Y: ", this.y);

    const dx = this.x - this.previousX;
    const dy = this.y - this.previousY;
    const movedEnough = Math.abs(dx) + Math.abs(dy) >= this.minMeaningfulDistance;

    if (movedEnough) {
      this.lastMeaningfulMoveTime = millis();
      this.previousX = this.x;
      this.previousY = this.y;
    }

    const now = millis();
    const timeSinceScore = now - this.lastScoreMillis;
    const timeSinceMovement = now - this.lastMeaningfulMoveTime;

    //taking out meaniful movement check for now
    // if (timeSinceMovement > 10000) {
    if (timeSinceScore > 20000) {
      this.dead = true;
    }


    this.lifespan++;
}


  look() {
  this.vision = [];
  const centerX = this.x + this.w / 2;
  const centerY = this.y + this.h / 2;

  //push distances to vision array
  this.vision.push(map(this.getWallDistances(this.checkUp), 1, 30, 0, 1));
  this.vision.push(map(this.getWallDistances(this.checkRight), 1, 30, 0, 1));
  this.vision.push(map(this.getWallDistances(this.checkDown), 1, 30, 0, 1));
  this.vision.push(map(this.getWallDistances(this.checkLeft), 1, 30, 0, 1));

  // console.info("Vision Raw - Up: ", this.getWallDistances(this.checkUp))
  // console.info("Vision Raw - Right: ", this.getWallDistances(this.checkRight))
  // console.info("Vision Raw - Down: ", this.getWallDistances(this.checkDown))
  // console.info("Vision Raw - Left: ", this.getWallDistances(this.checkLeft))

 //add directional vector (dx/dy) and distance for each target type
  /*const targets = [enemies, treats, anti, balls, beds, pb];

  for (let targetList of targets) {
    const nearest = this.getNearest(targetList, centerX, centerY);
    if (nearest) {
      const dx = nearest.x - centerX;
      const dy = nearest.y - centerY;
      const maxRange = 1080;

      //normalize and push to vision
      this.vision.push(map(dx, -maxRange, maxRange, -1, 1));
      this.vision.push(map(dy, -maxRange, maxRange, -1, 1));
      const dist = Math.abs(dx) + Math.abs(dy);
      this.vision.push(map(dist, 0, maxRange, 0, 1));
    } else {
      //no target found = neutral values
      this.vision.push(0); // dx
      this.vision.push(0); // dy
      this.vision.push(1); // max distance
    }
  }*/

    this.vision.push(map(this.getDistance(enemies, centerX, centerY), 0, 1500, 0, 1));
    this.vision.push(map(this.getDistance(treats, centerX, centerY), 0, 1500, 0, 1));
    this.vision.push(map(this.getDistance(anti, centerX, centerY), 0, 1500, 0, 1));
    this.vision.push(map(this.getDistance(balls, centerX, centerY), 0, 1500, 0, 1));
    this.vision.push(map(this.getDistance(beds, centerX, centerY), 0, 1500, 0, 1));
    this.vision.push(map(this.getDistance(pb, centerX, centerY), 0, 1500, 0, 1));

   //  if (this.self == population[0] && !this.dead) {
      //   console.info("Vision: ", pbData.distance);
      // }

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


  //vision not wide enough?
  getWallDistances(direction) {
    const visionInterval = 4;
    const visionDistance = 25;

    let distance = 30;
    for (let i = 1; i <= visionDistance + 1; i += visionInterval) {
      if (direction(i)) {
        distance = i;
        break;
      }
    }
    return distance;
  }

  checkUp(i) {
    return (
      this.collidesWithBlocks(this.x, this.y - i - 10, this.w, this.h)
    );
  }

  checkRight(i) {
    return (
      this.collidesWithBlocks(this.x + this.w + i, this.y, this.w, this.h)
    );
  }

  checkDown(i) {
    return (
      this.collidesWithBlocks(this.x, this.y + this.h + i, this.w, this.h)
    );
  }

  checkLeft(i) {
    return (
      this.collidesWithBlocks(this.x - i - 5, this.y, this.w, this.h)
    );
  }

  getDistance(targets, centerX, centerY) {
    if (!targets || targets.length === 0) {
      return 1500;
    }
    return targets?.reduce((accumulator, currentValue) => {
      if(currentValue.idList?.includes(this.uuid)) {return accumulator};
      const temp =
        Math.abs(centerX - currentValue.x) + Math.abs(centerY - currentValue.y);
      if (temp < accumulator) {
        return temp;
      }
      return accumulator;
    }, 1500);
  }

  // getNearestDirection(target, centerX, centerY) {
  //   // console.log(target);
  //   const y = target.y - centerY;
  //   const x = target.x - centerX;
  //   const angle = (Math.atan2(y, x) * 180) / Math.PI;

  //   if (angle < 22.5 || angle > 337.5) {
  //     return 4;
  //   } else if (angle < 67.5) {
  //     return 3;
  //   } else if (angle < 112.5) {
  //     return 2;
  //   } else if (angle < 157.5) {
  //     return 1;
  //   } else if (angle < 202.5) {
  //     return 8;
  //   } else if (angle < 247.5) {
  //     return 7;
  //   } else if (angle < 292.5) {
  //     return 6;
  //   } else {
  //     return 5;
  //   }
  // }

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
    const stillValid = this.canMove(directions[this.lastDec]);

    if(this.decisionCount > 0 && stillValid) {
      this.move(directions[this.lastDec]);
      this.decisionCount--;
    } else {
      this.decision = this.brain.feedForward(this.vision);
      
      for (let i = 0; i < 4; i++) {
      // if (this.self == population[0] && !this.dead) {
      //   console.info(i + ": ", this.canMove(directions[i]));
      // }
      // if (this.decision[i] > max && this.canMove(directions[i])) {
      
        if (this.decision[i] > max && this.canMove(directions[i])) {
          max = this.decision[i];
          maxIndex = i;
        }
      }
    
    this.lastDec = maxIndex;
    this.isSprinting = this.decision[4] >= 0.7 && this.stamina > 0;
    this.decisionCount = 30;
    // if (this.self == population[0] && !this.dead) {
    //     console.info("chosen direction: ", directions[maxIndex]);
    //   }

    // if (typeof(maxIndex) === "undefined") {
      // console.log("random movement")
      // this.move(directions[Math.floor(Math.random() * directions.length)]);
    // } else {
      // console.info("Decision: ", directions[maxIndex]);
      
      this.move(directions[this.lastDec]);
    }
      
    // }
  }

  //helper method to check if a move is possible (not blocked by wall)
  canMove(direction) {
    // console.log(direction);
    let dx = 0,
      dy = 0;
    switch (direction) {
      case "a":
        dx -= this.speed;
        break;
      case "d":
        dx += this.speed;
        break;
      case "w":
        dy -= this.speed;
        break;
      case "s":
        dy += this.speed;
        break;
    }

    //check if path is blocked at full step (not pixel by pixel here)
    return !this.collidesWithBlocks(this.x + dx, this.y + dy, this.w, this.h);
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
    // this.fitness = (this.score * this.score * this.pickupRewardModifier) + (this.distanceMarker * this.distanceRewardModifier)  - this.fitnessPenalty;
    this.fitness = (this.score * this.score * this.pickupRewardModifier) + (this.distance * this.distanceModifier) - (this.fitnessPenalty * this.penaltyModifier);
  }

  crossover(parent2) {
    var child = new Player();
    child.brain = this.brain.crossover(parent2.brain);
    child.brain.generateNetwork();
    return child;
  }

  collidesWithBlocks(x, y, w, h) {
    //creates a temporary object with x,y,w,h to mimic player position
    let tempPlayer = { x: x, y: y, w: w, h: h };

    for (let block of blocks) {
      if (block.intersects(tempPlayer)) {
        return true;
      }
    }
    return false;
  }
}