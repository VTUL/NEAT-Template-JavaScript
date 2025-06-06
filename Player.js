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
    this.canEat = false;
    this.canEatUntil = 0;
    this.x = 600; 
    this.y = 220;
    // 400, 220 spawn
    // 170, 350 stairs1
    this.w = 18;  
    this.h = 18;
  }


 

  //---------------------------------------------------------------------------------------------------------------------------------------------------------
  show() {
     //wrap from one stairs to another, left to right
    if (this.x + this.w < 188 && this.y + this.h < 388 && this.y + this.h > 348) {
      this.x = 680 + 5;  
      this.y = 440;
    }
    else if (this.x > 688 && this.x < 700 && this.y + this.h < 478 && this.y + this.h > 438) {
      this.x = 188 - this.w - 5; 
      this.y = 350;
    }

    //stairs2 down and up
    if (this.x + this.w < 398 && this.x > 340 && this.y + this.h < 153 && this.y + this.h > 148) {
      this.x = 795 + 5;  
      this.y = 170;
    }
    else if (this.x > 768 && this.x < 800 && this.y + this.h < 178 && this.y + this.h > 168) {
      this.x = 378 + this.w - 5; 
      this.y = 120;
    }

    //sprite
    
   image(dog, this.x, this.y);
    }
  //---------------------------------------------------------------------------------------------------------------------------------------------------------
  move(direction) {
  let step = 1; // Move in small steps for accurate collision detection
  let dx = 0;
  let dy = 0;

  switch (direction) {
    case "a": dx = -this.speed; break;
    case "d": dx = this.speed; break;
    case "w": dy = -this.speed; break;
    case "s": dy = this.speed; break;
  }

  // Incremental movement with collision checking
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

    if (millis() < this.canEatUntil) {
      this.canEat = true;
    } else {
      this.canEat = false;
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

      
  }

  // Insert AI-related update logic here if needed
}

    //----------------------------------------------------------------------------------------------------------------------------------------------------------

  look() {
    //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace

  }


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
  }

  //---------------------------------------------------------------------------------------------------------------------------------------------------------
  crossover(parent2) {

    var child = new Player();
    child.brain = this.brain.crossover(parent2.brain);
    child.brain.generateNetwork();
    return child;
  }

  collidesWithBlocks(x, y, w, h) {
  // create a temporary object with x,y,w,h to mimic player position
  let tempPlayer = { x: x, y: y, w: w, h: h };

  for (let block of blocks) {
    if (block.intersects(tempPlayer)) {
      return true;
    }
  }
  return false;
}

  
}