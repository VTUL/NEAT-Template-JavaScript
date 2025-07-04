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

    this.genomeInputs = 4 + 4 + 2 * 5; // walls + enemies + 5 items (treats, anti, ban, ball, pb)
    this.genomeOutputs = 5; // Up, Right, Down, Left, Sprint
    this.brain = new Genome(this.genomeInputs, this.genomeOutputs);

    this.baseSpeed = 5;
    this.boostedSpeed = 10;
    this.speed = this.baseSpeed;
    this.isInvinUntil = 0;
    this.x = 20; 
    this.y = 470;
    this.w = 48;  
    this.h = 32;
    this.dir = "d"; //the direction the player is facing
    this.isInvincible = false;
    this.lastScoreMillis = millis();
    this.sprite = new Sprite(dog, this.w, this.h, 6);
    this.previousX = this.x;
    this.previousY = this.y;
    this.lastDistanceToTreat = Infinity;
    this.stallFrames = 0;

    this.stamina = 100; 
    this.maxStamina = 100;
    this.staminaDrainRate = 0.8; //per frame when sprinting
    this.staminaRegenRate = this.maxStamina / (30 * 60); //regen over 30 seconds at 60 fps
    this.isSprinting = false;

    this.uuid = self.crypto.randomUUID();
    
  }

  //---------------------------------------------------------------------------------------------------------------------------------------------------------
  show() {

    //the map wrapping is where ai gets stuck a lot, or they get stuck in corners

    //stairs1 left and right
    if (this.x + this.w < 0 && this.y + this.h > 400 && this.y + this.h < 600) {
      this.x = width;
      this.y = 460;  
    }
    else if (this.x > width && this.y + this.h > 400 && this.y + this.h < 600) {
      this.x = -this.w; 
      this.y = 460;
    }

    //draw the player sprite
    push();
    translate(this.x + this.w / 2, this.y + this.h / 2);

    if (this.facing == "a") {
        scale(-1, 1);
    } else if (this.facing == "w") {
        rotate(-HALF_PI);
    } else if (this.facing == "s") {
        rotate(HALF_PI);
    }

    imageMode(CENTER);

    if (this.isInvincible) {
      tint(0, 255, 0); //green for invincible
    } else {
      noTint();
    }

    this.sprite.draw();


    imageMode(CORNER);
    pop();
    
    }
  //---------------------------------------------------------------------------------------------------------------------------------------------------------
  move(direction) {
    this.facing = direction;
    let step = 1; 
    let dx = 0;
    let dy = 0;

    switch (direction) {
      case "a": dx = -this.speed; break;
      case "d": dx = this.speed; break;
      case "w": dy = -this.speed; break;
      case "s": dy = this.speed; break;
    }

    //incremental movement with collision checking, AI currently gets stuck 
    //in top right corner of map occasionally or loop with wrapping points
    for (let i = 0; i < Math.abs(dx); i++) {
      let newX = this.x + Math.sign(dx);
      if (!this.collidesWithBlocks(newX, this.y, this.w, this.h)) {
        this.x = newX;
        this.updateFitness();
      } else {
        break;
      }
    }

    for (let i = 0; i < Math.abs(dy); i++) {
      let newY = this.y + Math.sign(dy);
      if (!this.collidesWithBlocks(this.x, newY, this.w, this.h)) {
        this.y = newY;
        this.updateFitness();
      } else {
        break;
      }
    }  
}

    //---------------------------------------------------------------------------------------------------------------------------------------------------------
  update() {
    if(this.dead)
      {
        return;
      }
      
    if (millis() < this.isInvinUntil) {
      this.isInvincible = true;
    } else {
      this.isInvincible = false;
    }

    if (humanPlaying) {
      if (keyIsDown(87)) { // W
        this.move("w");
      }
      if (keyIsDown(83)) { // S
        this.move("s");
      }
      if (keyIsDown(65)) { // A
        this.move("a");
      }
      if (keyIsDown(68)) { // D
        this.move("d");
      }

      this.isSprinting = keyIsDown(SHIFT) && this.stamina > 0;

      if (this.isSprinting) {
        this.speed = this.boostedSpeed;
        this.stamina -= this.staminaDrainRate;
      if (this.stamina < 0) {
        this.stamina = 0;
      }
      } else {
        this.speed = this.baseSpeed;
        if (this.stamina < this.maxStamina) {
          this.stamina += this.staminaRegenRate;
          if (this.stamina > this.maxStamina) {
            this.stamina = this.maxStamina;
          }
       }
  }
      this.lifespan++;
    } else { // AI control
      this.look();
      this.think();
      this.lifespan++;
    }

    let timeSinceScore = millis() - this.lastScoreMillis;

    if (timeSinceScore > 20000) { // 20 seconds
      this.dead = true;
    }
  
    if (this.x === this.previousX && this.y === this.previousY) {
      this.stallFrames++;
      if (this.stallFrames > 15) {
        this.fitness -= 5; //increasing penalty the longer it stalls
      }
    } else {
      this.stallFrames = 0; //reset on movement
      this.fitness += 5;
    }
  
    this.previousX = this.x;
    this.previousY = this.y;

    // Inside `if (humanPlaying)` section
  


}

    //----------------------------------------------------------------------------------------------------------------------------------------------------------

  look() {
  this.vision = [];

  // 4 values for walls
  this.vision.push(...this.getWallDistances());

  // 4 values for enemies (same format as walls)
  this.vision.push(...this.getEnemyDistances(enemies));

  // Each of these now returns 2 values: [distance, direction]
  this.vision.push(...this.getMultDistances(treats));
  this.vision.push(...this.getMultDistances(anti));
  this.vision.push(...this.getSingDistance(ban));
  this.vision.push(...this.getSingDistance(ball));
  this.vision.push(...this.getSingDistance(pb));
}


getDirectionBucket(dx, dy) {
  let angle = atan2(dy, dx); // -PI to PI
  angle = degrees(angle);
  if (angle < 0) angle += 360;

  // 8-direction compass (every 45°)
  if (angle >= 337.5 || angle < 22.5) return 4;   // East
  if (angle >= 22.5 && angle < 67.5) return 3;    // NE
  if (angle >= 67.5 && angle < 112.5) return 2;   // North
  if (angle >= 112.5 && angle < 157.5) return 1;  // NW
  if (angle >= 157.5 && angle < 202.5) return 8;  // West
  if (angle >= 202.5 && angle < 247.5) return 7;  // SW
  if (angle >= 247.5 && angle < 292.5) return 6;  // South
  if (angle >= 292.5 && angle < 337.5) return 5;  // SE
}


//vision not wide enough?
getWallDistances() {
  let maxVision = 300;
  let coneWidth = 80;

  let distances = [maxVision, maxVision, maxVision, maxVision]; // up, right, down, left

  for (let block of blocks) {
    let dx = block.x - this.x;
    let dy = block.y - this.y;

     // Up cone
    if (dy < 0 && abs(dx) < coneWidth && abs(dy) < maxVision) {
      distances[0] = min(distances[0], abs(dy));
    }
    // Right cone
    if (dx > 0 && abs(dy) < coneWidth && abs(dx) < maxVision) {
      distances[1] = min(distances[1], abs(dx));
    }
    // Down cone
    if (dy > 0 && abs(dx) < coneWidth && abs(dy) < maxVision) {
      distances[2] = min(distances[2], abs(dy));
    }
    // Left cone
    if (dx < 0 && abs(dy) < coneWidth && abs(dx) < maxVision) {
      distances[3] = min(distances[3], abs(dx));
    }
  }

  //return inverse distances (as inputs typically are 1/distance)
  return distances.map(d => 1 / d);
}

//gets distance of array items
getMultDistances(obj) {
  if (obj.length === 0) return [0, 0]; //nothing seen

  let maxVision = 300;
  let nearest = null;
  let minDist = maxVision;

  for (let o of obj) {
    let dx = o.x - this.x;
    let dy = o.y - this.y;
    let d = dist(this.x, this.y, o.x, o.y);

    if (d < minDist) {
      minDist = d;
      nearest = { dx, dy, dist: d };
    }
  }

  if (nearest) {
    let normalizedDist = 1 / (nearest.dist + 1); //avoid div by 0
    let directionBucket = this.getDirectionBucket(nearest.dx, nearest.dy);
    return [normalizedDist, directionBucket];
  }

  return [0, 0]; //nothing seen, return zero distance and direction
}


getEnemyDistances(obj) {
  let maxVision = 300;
  let coneWidth = 80; // wider cone tolerance

  let distances = [maxVision, maxVision, maxVision, maxVision]; // up, right, down, left

  for (let o of obj) {
    let dx = o.x - this.x;
    let dy = o.y - this.y;

    // Up cone
    if (dy < 0 && abs(dx) < coneWidth && abs(dy) < maxVision) {
      distances[0] = min(distances[0], abs(dy));
    }
    // Right cone
    if (dx > 0 && abs(dy) < coneWidth && abs(dx) < maxVision) {
      distances[1] = min(distances[1], abs(dx));
    }
    // Down cone
    if (dy > 0 && abs(dx) < coneWidth && abs(dy) < maxVision) {
      distances[2] = min(distances[2], abs(dy));
    }
    // Left cone
    if (dx < 0 && abs(dy) < coneWidth && abs(dx) < maxVision) {
      distances[3] = min(distances[3], abs(dx));
    }
  }

  return distances.map(d => d === maxVision ? 0 : 1 / d); // normalize or zero if unseen
}


//gets single item
getSingDistance(obj) {
  if (!obj) return [0, 0];

  let dx = obj.x - this.x;
  let dy = obj.y - this.y;
  let d = dist(this.x, this.y, obj.x, obj.y);

  if (d > 300) return [0, 0]; // Out of vision

  let normalizedDist = 1 / (d + 1);
  let directionBucket = this.getDirectionBucket(dx, dy);
  return [normalizedDist, directionBucket];
}





  //-----------------------------------------------------------------------------------------------------------------------------------------------------

  //---------------------------------------------------------------------------------------------------------------------------------------------------------
  //gets the output of the this.brain then converts them to actions
  think() {
    this.decision = this.brain.feedForward(this.vision);

    // sprint decision
    let wantsToSprint = this.decision[4] > 0.5; // treat as true/false

    //decide sprinting
    if (wantsToSprint && this.stamina > 0) {
      this.isSprinting = true;
      this.speed = this.boostedSpeed;
      this.stamina -= this.staminaDrainRate;
    if (this.stamina < 0) this.stamina = 0;
    } else {
      this.isSprinting = false;
      this.speed = this.baseSpeed;
      if (this.stamina < this.maxStamina) {
        this.stamina += this.staminaRegenRate;
        if (this.stamina > this.maxStamina) {
          this.stamina = this.maxStamina;
        }
      }
    }

//movement decision
let directions = ["w", "d", "s", "a"];
let dirConfidences = this.decision
  .slice(0, 4) // first four are movement
  .map((conf, i) => ({ dir: directions[i], conf }))
  .sort((a, b) => b.conf - a.conf);

if (dirConfidences[0].conf < 0.5) {
  this.move(random(['w', 'a', 's', 'd']));
  return;
}

for (let { dir } of dirConfidences) {
  if (this.canMove(dir)) {
    this.move(dir);
    break;
  }
}

}

//helper method to check if a move is possible (not blocked by wall)
canMove(direction) {
  let dx = 0, dy = 0;
  switch (direction) {
    case "a": dx = -this.speed; break;
    case "d": dx = this.speed; break;
    case "w": dy = -this.speed; break;
    case "s": dy = this.speed; break;
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

    //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
    return clone;
  }

  //---------------------------------------------------------------------------------------------------------------------------------------------------------
  //fot Genetic algorithm
  calculateFitness() {
    //this.fitness = score*score;
    if (this.dead) this.fitness -= 100;
}

//update fitness every frame instead of after all players die
updateFitness() {
    this.fitness = this.score * 50 + this.lifespan * 0.1;

    //good
    let nearestTreat = this.getNearestMult(treats);
    if (nearestTreat) {
    let d = dist(this.x, this.y, nearestTreat.x, nearestTreat.y);
    if (d < this.lastDistanceToTreat) {
        this.fitness += 25; //reward moving closer?
    }
    this.lastDistanceToTreat = d;
}

    if (ban) {
        let d = dist(this.x, this.y, ban.x, ban.y);
        this.fitness += 10 / (d + 1);
    }

    if (ball) {
        let d = dist(this.x, this.y, ball.x, ball.y);
        this.fitness += 10 / (d + 1);
    }

    if (pb) {
        let d = dist(this.x, this.y, pb.x, pb.y);
        this.fitness += 20 / (d + 1);
    }

    //bad
    let nearestEnemy = this.getNearestMult(enemies);
    if (nearestEnemy && !this.isInvincible) {
        let d = dist(this.x, this.y, nearestEnemy.x, nearestEnemy.y);
        this.fitness -= 25 / (d + 1);
    }

    let nearestAnti = this.getNearestMult(anti);
    if (nearestAnti && !this.isInvincible) {
        let d = dist(this.x, this.y, nearestAnti.x, nearestAnti.y);
        this.fitness -= 5 / (d + 1);
    }
}

  getNearestMult(obj) {
  if (obj.length == 0) return null;

  let nearest = obj[0];
  let minDist = dist(this.x, this.y, nearest.x, nearest.y);

  for (let o of obj) {
    let d = dist(this.x, this.y, o.x, o.y);
    if (d < minDist) {
      nearest = o;
      minDist = d;
    }
  }
  return nearest;
}

  //---------------------------------------------------------------------------------------------------------------------------------------------------------
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