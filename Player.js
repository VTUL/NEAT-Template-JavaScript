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

    this.genomeInputs = 5;
    this.genomeOutputs = 2;
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
    //flip the sprite based on direction
    if (this.facing == "a") {
      scale(-1, 1); 
    } else if (this.facing == "w") {
      rotate(-HALF_PI); 
    } else if (this.facing == "s") {
     rotate(HALF_PI); 
    }

    imageMode(CENTER);

    if (this.isInvincible) {
      tint(150, 255, 150); //green for invincible
  } else {
      noTint();
  }

    image(dog, 0, 0, this.w, this.h);
    imageMode(CORNER);

    pop();

    //sprite
    //fill(0, 0, 255);
    //rect(this.x, this.y, this.w, this.h);
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
  }

  // Insert AI-related update logic here if needed
}

    //----------------------------------------------------------------------------------------------------------------------------------------------------------

  look() {
    //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace

    //distance to walls? collision detection
    //distance to enemies?
    //distance to food?
    //distance to power-ups?
    //distance to anti-power-ups?

    let timeSinceScore = millis() - this.lastScoreMillis;

    if (timeSinceScore > 120000) { //120 seconds in milliseconds
      this.dead = true;
    }

}

  //Code-Bullet's Pacman AI example for method to call in look()
  //sets some inputs for the NN for whether or not there is a wall directly next to it in all directions
  /*void setDistanceToWalls() {

    PVector matrixPosition = pixelToTile(pacman.pos); //our player pos just coords?
    PVector[] directions = new  PVector[4]; 
    for (int i = 0; i< 4; i++) {//add 4 directions to the array
      directions[i] = new PVector(pacman.vel.x, pacman.vel.y);
      directions[i].rotate(PI/2 *i);
      directions[i].x = round(directions[i].x);
      directions[i].y = round(directions[i].y);
    }

    int visionIndex = 4;
    for (PVector dir : directions) {//for each direction 
      PVector lookingPosition = new PVector(matrixPosition.x + dir.x, matrixPosition.y+ dir.y);//look int that direction
      if (originalTiles[(int)lookingPosition.y][(int)lookingPosition.x].wall) {//if there is a wall in that direction
        vision[visionIndex] = 1;
      } else {
        vision[visionIndex] = 0;
      }

      while (true) {//keep look in that direction until you reach a dot or a wall
        if (originalTiles[(int)lookingPosition.y][(int)lookingPosition.x].wall) {//if wall
          vision[visionIndex + 4] = 0;
          break;
        }

        if (pacman.tiles[(int)lookingPosition.y][(int)lookingPosition.x].dot && !pacman.tiles[(int)lookingPosition.y][(int)lookingPosition.x].eaten) {//if dot 
          vision[visionIndex + 4] = 1;//this allows the players to see in which direction a dot is
          break;
        }

        lookingPosition.add(dir);//look further in that direction if neither a dot nor a wall was found
      }
      visionIndex +=1;
    }
  }*/

  //---------------------------------------------------------------------------------------------------------------------------------------------------------
  //gets the output of the this.brain then converts them to actions
  think() {

      var max = 0;
      var maxIndex = 0;
      //get the output of the neural network
      this.decision = this.brain.feedForward(this.vision);

      for (var i = 0; i < this.decision.length; i++) {
        if (this.decision[i] > max) {
          max = this.decision[i];
          maxIndex = i;
        }
      }

      //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
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
    this.fitness = random(10);
    //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace

    //this.fitness = this.score + this.lifespan / 100; //example fitness function
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