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

    this.genomeInputs = 8; // 4 for walls, 4 for enemies
    this.genomeOutputs = 4; // Up, Right, Down, Left
    this.brain = new Genome(this.genomeInputs, this.genomeOutputs);

    this.baseSpeed = 5;
    this.boostedSpeed = 10;
    this.speed = this.baseSpeed;
    this.speedBoostedUntil = 0;
    this.isInvinUntil = 0;
    this.x = 150; 
    this.y = 650;
    // 400, 220 spawn
    // 170, 350 stairs1
    this.w = 48;  
    this.h = 32;
    this.dir = "d"; //the direction the player is facing
    this.isInvincible = false;
    this.lastScoreMillis = millis();
    //this.sprite = new Sprite(dog, this.x, this.y, .5);
    this.frame = 0;
    
  }

  //---------------------------------------------------------------------------------------------------------------------------------------------------------
  show() {

    //stairs1 left and right
    if (this.x + this.w < 0 && this.y + this.h < 610 && this.y + this.h > 548) {
      this.x = width;  
      this.y = 800;
    }
    else if (this.x > width && this.y + this.h < 868 && this.y + this.h > 778) {
      this.x = -this.w; 
      this.y = 560;
    }

    //stairs2 down and up
    if (this.x < 278 && this.x > 170 && this.y + this.h > height) {
      this.x = 700;  
      this.y = 850;
    }
    else if (this.x > 680 && this.x < 730 && this.y + this.h > height) {
      this.x = 230; 
      this.y = 850;
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
      tint(0, 255, 0); // green for invincible
    } else {
      noTint();
    }

    let frameCount = 6; // total frames in sprite sheet
    let frameWidth = dog.width / frameCount;
    let frameHeight = dog.height;

    image(
      dog,
      0,
      0,
      this.w,
      this.h,
      frameWidth * floor(this.frame),  // sx
      0,                              // sy
      frameWidth,                     // sWidth
      frameHeight                     // sHeight
    );

    this.frame += 0.1;
    if (this.frame >= frameCount) this.frame = 0;

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

    //incremental movement with collision checking
    for (let i = 0; i < Math.abs(dx); i++) {
      let newX = this.x + Math.sign(dx);
      if (!this.collidesWithBlocks(newX, this.y, this.w, this.h)) {
        this.x = newX;
      } else {
        break;
      }
    }

    for (let i = 0; i < Math.abs(dy); i++) {
      let newY = this.y + Math.sign(dy);
      if (!this.collidesWithBlocks(this.x, newY, this.w, this.h)) {
        this.y = newY;
      } else {
        break;
      }
    }  

  //this.lifespan++;
}

    //---------------------------------------------------------------------------------------------------------------------------------------------------------
  update() {
    if(this.dead)
      {
        return;
      }
      
    if (millis() < this.speedBoostedUntil) {
      this.speed = this.boostedSpeed;
    } else {
      this.speed = this.baseSpeed;
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
    this.lifespan++;
  } else { // AI control
    this.look();
    this.think();
    this.lifespan++;
  }

  let timeSinceScore = millis() - this.lastScoreMillis;

    if (timeSinceScore > 120000) { // 120 seconds
      this.dead = true;
    }
  

  // Insert AI-related update logic here if needed
}

    //----------------------------------------------------------------------------------------------------------------------------------------------------------

  look() {

    this.vision = [];

    // Push distances to vision array
    this.vision.push(...this.getWallDistances());
    this.vision.push(...this.getMultDistances(enemies));
    this.vision.push(...this.getMultDistances(treats));
    this.vision.push(...this.getMultDistances(anti));
    this.vision.push(...this.getSingDistance(ban));
    this.vision.push(...this.getSingDistance(ball));
    this.vision.push(...this.getSingDistance(pb));

  }


getWallDistances() {
  let maxVision = 300;

  let distances = [maxVision, maxVision, maxVision, maxVision]; // up, right, down, left

  for (let block of blocks) {
    let dx = block.x - this.x;
    let dy = block.y - this.y;

    // Up
    if (dy < 0 && abs(dx) < this.w && abs(dy) < maxVision) {
      distances[0] = min(distances[0], abs(dy));
    }
    // Right
    if (dx > 0 && abs(dy) < this.h && abs(dx) < maxVision) {
      distances[1] = min(distances[1], abs(dx));
    }
    // Down
    if (dy > 0 && abs(dx) < this.w && abs(dy) < maxVision) {
      distances[2] = min(distances[2], abs(dy));
    }
    // Left
    if (dx < 0 && abs(dy) < this.h && abs(dx) < maxVision) {
      distances[3] = min(distances[3], abs(dx));
    }
  }

  // Return inverse distances (as inputs typically are 1/distance)
  return distances.map(d => 1 / d);
}

//gets distance of array items
getMultDistances(obj) {
  let maxVision = 300;
  let distances = [maxVision, maxVision, maxVision, maxVision]; // up, right, down, left

  for (let o of obj) {
    let dx = o.x - this.x;
    let dy = o.y - this.y;

    if (dy < 0 && abs(dx) < this.w && abs(dy) < maxVision) { // Up
      distances[0] = min(distances[0], abs(dy));
    }
    if (dx > 0 && abs(dy) < this.h && abs(dx) < maxVision) { // Right
      distances[1] = min(distances[1], abs(dx));
    }
    if (dy > 0 && abs(dx) < this.w && abs(dy) < maxVision) { // Down
      distances[2] = min(distances[2], abs(dy));
    }
    if (dx < 0 && abs(dy) < this.h && abs(dx) < maxVision) { // Left
      distances[3] = min(distances[3], abs(dx));
    }
  }

  return distances.map(d => d === maxVision ? 0 : 1 / d); // Return 0 if nothing found
}

//gets single item
getSingDistance(obj) {
  if (!obj) return [0, 0, 0, 0]; // Safeguard for null/undefined objects

  let maxVision = 300;
  let distances = [maxVision, maxVision, maxVision, maxVision]; // up, right, down, left

  let dx = obj.x - this.x;
  let dy = obj.y - this.y;

  if (dy < 0 && abs(dx) < this.w && abs(dy) < maxVision) { // Up
    distances[0] = min(distances[0], abs(dy));
  }
  if (dx > 0 && abs(dy) < this.h && abs(dx) < maxVision) { // Right
    distances[1] = min(distances[1], abs(dx));
  }
  if (dy > 0 && abs(dx) < this.w && abs(dy) < maxVision) { // Down
    distances[2] = min(distances[2], abs(dy));
  }
  if (dx < 0 && abs(dy) < this.h && abs(dx) < maxVision) { // Left
    distances[3] = min(distances[3], abs(dx));
  }

  return distances.map(d => d === maxVision ? 0 : 1 / d); // Return 0 if nothing found
}



  //-----------------------------------------------------------------------------------------------------------------------------------------------------

  //---------------------------------------------------------------------------------------------------------------------------------------------------------
  //gets the output of the this.brain then converts them to actions
  think() {
  this.decision = this.brain.feedForward(this.vision);

  //pair directions with their confidence
  let directions = ["w", "d", "s", "a"];
  let dirConfidences = this.decision
    .map((conf, i) => ({ dir: directions[i], conf }))
    .sort((a, b) => b.conf - a.conf); //sort descending by confidence

  if (dirConfidences[0].conf < 0.5){
    this.move(random(['w', 'a', 's', 'd']));
    return;
  }  //low confidence, random move so its not stuck

  //try each direction in order of confidence
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
    this.fitness = this.score + this.lifespan * 0.1; 

    if (this.dead) this.fitness -= 10;

    let nearestTreat = this.getNearestMult(treats);
    let nearestEnemy = this.getNearestMult(enemies);
    let nearestAnti = this.getNearestMult(anti);

  //good
    if (nearestTreat) {
      let d = dist(this.x, this.y, nearestTreat.x, nearestTreat.y);
      this.fitness += 1 / (d + 1);
    }

    if (ban) {
    let d = dist(this.x, this.y, ban.x, ban.y);
    this.fitness += 3 / (d + 1); 
   }

  if (ball) {
    let d = dist(this.x, this.y, ball.x, ball.y);
    this.fitness += 3 / (d + 1);
  }

  if (pb) {
    let d = dist(this.x, this.y, pb.x, pb.y);
    this.fitness += 5 / (d + 1); 
  }


  //bad
    if (nearestEnemy && !this.isInvincible) {
      let d = dist(this.x, this.y, nearestEnemy.x, nearestEnemy.y);
      this.fitness -= 5 / (d + 1);
    }

    if (nearestAnti && !this.isInvincible) {
      let d = dist(this.x, this.y, nearestEnemy.x, nearestEnemy.y);
      this.fitness -= 1 / (d + 1);
    }

    if (timeSinceScore > 60000) { // 60 seconds
      this.fitness -= 1;
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