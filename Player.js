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
    this.fitnessPenalty = 1;
    this.penaltyModifier = 1;
    this.distanceModifier = 500;

    this.genomeInputs = 22; // 4 for walls, 5 for pickups 1 for enemies 22
    this.genomeOutputs = 5; // Up, Right, Down, Left, Sprint
    this.brain = new Genome(this.genomeInputs, this.genomeOutputs);
    
    this.uuid = crypto.randomUUID();

    this.baseSpeed = 5;
    this.boostedSpeed = 10;
    this.speed = this.baseSpeed;
    this.isInvinUntil = 0;
    this.gridX = 11;
    this.gridY = 11;
    this.visitedTiles = new Set();
    this.recentTiles = [];
    this.x = this.gridX * blockWidth + offsetX + blockWidth / 2;
    this.y = this.gridY * blockHeight + offsetY + blockHeight / 2;
    this.w = 40;
    this.h = 24;
    this.targetX = this.x;
    this.targetY = this.y;
    this.isMoving = false;

    this.dir = "d"; //the direction the player is facing
    this.isInvincible = false;

    this.lastScoreMillis = millis();
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
    this.staminaRegenRate = this.maxStamina / (15 * 30); //regen over 15 seconds at 30 fps
    this.isSprinting = false;

    this.checkUp = this.checkUp.bind(this);
    this.checkRight = this.checkRight.bind(this);
    this.checkDown = this.checkDown.bind(this);
    this.checkLeft = this.checkLeft.bind(this);

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
    translate(this.x, this.y);

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
    if (this.facing === "w" ) {
      this.spriteUp[this.i].draw();
      this.w = 24;
      this.h = 40;
    } else if (this.facing === "s" ) {
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

  isWalkable(x, y) {
    if (y < 0 || y >= MAP_DATA.length) return false;
    if (x < 0 || x >= MAP_DATA[0].length) return false;
    return MAP_DATA[y][x] === '-';
  }


  move(direction) {
    this.facing = direction; //update facing direction
    if (this.isMoving) return; //already sliding to a tile, sprite turns/flips too early

    let newGridX = this.gridX;
    let newGridY = this.gridY;

    switch (direction) {
      case "a": newGridX -= 1; break;
      case "d": newGridX += 1; break;
      case "w": newGridY -= 1; break;
      case "s": newGridY += 1; break;
   }

    //check if that grid space is walkable
    if (this.isWalkable(newGridX, newGridY)) {
      this.gridX = newGridX;
      this.gridY = newGridY;

      //set target pixel position (center of grid cell)
      this.targetX = this.gridX * blockWidth + offsetX + blockWidth / 2;
      this.targetY = this.gridY * blockHeight + offsetY + blockHeight / 2;

      this.isMoving = true; //start sliding
    }
}


  update() {
    if (this.dead) return;

    this.isInvincible = millis() < this.isInvinUntil;

    if (this.isMoving) {
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.sqrt(dx*dx + dy*dy);

    if (dist <= this.speed) {
      //snap to center
      this.x = this.targetX;
      this.y = this.targetY;
      this.isMoving = false; //done moving
    } else {
      //move toward target
      const angle = Math.atan2(dy, dx);
      this.x += Math.cos(angle) * this.speed;
      this.y += Math.sin(angle) * this.speed;
    }
  }

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


    const now = millis();
    const timeSinceScore = now - this.lastScoreMillis;
   
    if (timeSinceScore > 10000) {
      this.dead = true;
      console.info("Player timed out; Fitness: ", this.fitness, "Score: ", this.score);
    }


    this.lifespan++;

    const tileKey = `${this.gridX},${this.gridY}`; //trying to stop looping
    this.visitedTiles.add(tileKey);
    this.recentTiles.push(tileKey);
    if (this.recentTiles.length > 40) this.recentTiles.shift();

    if (this.recentTiles.slice(0, -1).includes(tileKey)) {
      this.fitnessPenalty += 5; 
    }
    
}


  look() {
  this.vision = [];
  //use grid coordinates for distance calculations
  const gridX = this.gridX;
  const gridY = this.gridY;

  //push distances to vision array
  this.vision.push(map(this.getWallDistances(this.checkUp), 1, 30, 0, 1));
  this.vision.push(map(this.getWallDistances(this.checkRight), 1, 30, 0, 1));
  this.vision.push(map(this.getWallDistances(this.checkDown), 1, 30, 0, 1));
  this.vision.push(map(this.getWallDistances(this.checkLeft), 1, 30, 0, 1));

  // --- Nearest treat/enemy grid distances ---
  // Treats: smaller is better (closer is attractive)
  //const nearestTreat = this.getNearestGrid(treats, this.gridX, this.gridY);
  //let treatDist = nearestTreat ? Math.abs(nearestTreat.gridX - this.gridX) + Math.abs(nearestTreat.gridY - this.gridY) : 40;
  //this.vision.push(map(treatDist, 0, 40, 1, 0)); // 1=far, 0=close

  // Enemies: smaller is dangerous, so invert
  //const nearestEnemy = this.getNearestGrid(enemies, this.gridX, this.gridY);
  //let enemyDist = nearestEnemy ? Math.abs(nearestEnemy.gridX - this.gridX) + Math.abs(nearestEnemy.gridY - this.gridY) : 40;
  //this.vision.push(map(enemyDist, 0, 40, 0, 1)); // 0=close (danger), 1=far (safe)

  // console.info("Vision Raw - Up: ", this.getWallDistances(this.checkUp))
  // console.info("Vision Raw - Right: ", this.getWallDistances(this.checkRight))
  // console.info("Vision Raw - Down: ", this.getWallDistances(this.checkDown))
  // console.info("Vision Raw - Left: ", this.getWallDistances(this.checkLeft))

 //add directional vector (dx/dy) and distance for each target type
  const targets = [treats, enemies, anti, balls, beds, pb];

  for (let targetList of targets) {
    const nearest = this.getNearestGrid(targetList, gridX, gridY);
    if (nearest) {
      const dx = nearest.gridX - gridX;
      const dy = nearest.gridY - gridY;
      const maxGridRange = 40; // adjust as needed for your map size

      //normalize and push to vision
      this.vision.push(map(dx, -maxGridRange, maxGridRange, -1, 1));
      this.vision.push(map(dy, -maxGridRange, maxGridRange, -1, 1));
      const gridDist = Math.abs(dx) + Math.abs(dy);
      this.vision.push(map(gridDist, 0, maxGridRange, 1, 0));
    } else {
      //no target found = neutral values
      this.vision.push(0); // dx
      this.vision.push(0); // dy
      this.vision.push(1); // max distance
    }
  }

    /*this.vision.push(map(this.getDistance(enemies, gridX, gridY), 0, 1500, 0, 1));
    this.vision.push(map(this.getDistance(treats, gridX, gridY), 0, 1500, 0, 1));
    this.vision.push(map(this.getDistance(anti, gridX, gridY), 0, 1500, 0, 1));
    this.vision.push(map(this.getDistance(balls, gridX, gridY), 0, 1500, 0, 1));
    this.vision.push(map(this.getDistance(beds, gridX, gridY), 0, 1500, 0, 1));
    this.vision.push(map(this.getDistance(pb, gridX, gridY), 0, 1500, 0, 1));*/

   //  if (this.self == population[0] && !this.dead) {
      //   console.info("Vision: ", pbData.distance);
      // }

  }

  getNearestGrid(targets, gridX, gridY) {
    if (!targets || targets.length === 0) return null;

    let nearest = null;
    let minDist = Infinity;

    for (let t of targets) {
      if (t.idList?.includes(this.uuid)) continue;
      //each target has gridX and gridY properties (except anti)
      const dx = t.gridX - gridX;
      const dy = t.gridY - gridY;
      const dist = Math.abs(dx) + Math.abs(dy);

      if (dist < minDist) {
        minDist = dist;
        nearest = t;
      }
    }

    return nearest;
  }

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
    return this.isWalkable(this.gridX, this.gridY - i);
  }

  checkRight(i) {
    return this.isWalkable(this.gridX + i, this.gridY);
  }

  checkDown(i) {
    return this.isWalkable(this.gridX, this.gridY + i);
  }

  checkLeft(i) {
    return this.isWalkable(this.gridX - i, this.gridY);
  }

  getDistance(targets, gridX, gridY) {
    if (!targets || targets.length === 0) {
      return 1500;
    }
    return targets?.reduce((accumulator, currentValue) => {
      if(currentValue.idList?.includes(this.uuid)) {return accumulator};
      const temp =
        Math.abs(gridX - currentValue.x) + Math.abs(gridY - currentValue.y);
      if (temp < accumulator) {
        return temp;
      }
      return accumulator;
    }, 1500);
  }

  think() {
    let max = 0;
    let maxIndex = 0;
     //console.info("Vision - Up: ", this.vision[0]);
     //console.info("Vision - Right: ", this.vision[1]);
     //console.info("Vision - Down: ", this.vision[2]);
     //console.info("Vision - Left: ", this.vision[3]);
     //console.info("Vision - Enemies: ", this.vision[4]);
     //console.info("Vision - Treats: ", this.vision[5]);
     //console.info("Vision - Anti: ", this.vision[6]);
     //console.info("Vision - balls: ", this.vision[7]);
     //console.info("Vision - Ball: ", this.vision[8]);
     //console.info("Vision - PB: ", this.vision[9]);

    //movement decision
    let directions = ["w", "d", "s", "a"];
    const stillValid = this.canMove(directions[this.lastDec]);

    if(this.decisionCount > 0 && stillValid) {
      this.move(directions[this.lastDec]);
      this.decisionCount--;
    } else if (stillValid && !directions[0]) {
      this.decisionCount++;
      this.move(directions[this.lastDec]);
    } else {
      this.decision = this.brain.feedForward(this.vision);
      
      for (let i = 0; i < 4; i++) {
      // if (this.self == population[0] && !this.dead) {
          //console.info(i + ": ", this.canMove(directions[i]));
          //console.info(i + ": ", this.decision[i]);
      // }
      // if (this.decision[i] > max && this.canMove(directions[i])) {
      
        if (this.decision[i] > max && this.canMove(directions[i])) {
          max = this.decision[i];
          maxIndex = i;
        }
      }
    
    this.lastDec = maxIndex;
    this.isSprinting = this.decision[4] >= 0.7 && this.stamina > 0;
    this.decisionCount = 60;
    // if (this.self == population[0] && !this.dead) {
         //console.info("chosen direction: ", directions[this.lastDec]);
    //   }

    // if (typeof(maxIndex) === "undefined") {
      // console.log("random movement")
      // this.move(directions[Math.floor(Math.random() * directions.length)]);
    // } else {
       //console.info("Decision: ", directions[this.lastDec]);
      
      this.move(directions[this.lastDec]);
    }
      
    // }
  }


  //helper method to check if a move is possible (not blocked by wall)
  canMove(direction) {
    //use grid coordinates and isWalkable for grid-based movement
    let newGridX = this.gridX;
    let newGridY = this.gridY;
    switch (direction) {
      case "a": newGridX -= 1; break;
      case "d": newGridX += 1; break;
      case "w": newGridY -= 1; break;
      case "s": newGridY += 1; break;
    }
    return this.isWalkable(newGridX, newGridY);
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
    const exploreReward = this.visitedTiles.size * 100; //100 points per unique tile
    //this.fitness = (this.score * this.score * this.pickupRewardModifier) + (this.distanceMarker * this.distanceRewardModifier)  - this.fitnessPenalty;
    this.fitness = (this.score * this.score * this.pickupRewardModifier) + (this.distanceMarker * this.distanceRewardModifier) + exploreReward  - this.fitnessPenalty;
  }

  crossover(parent2) {
    var child = new Player();
    child.brain = this.brain.crossover(parent2.brain);
    child.brain.generateNetwork();
    return child;
  }

}
