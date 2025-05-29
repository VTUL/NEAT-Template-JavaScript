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

    this.speed = 10;
    this.x = 100;
    this.y = 100;
    this.w = 25;  
    this.h = 25;
  }


 

  //---------------------------------------------------------------------------------------------------------------------------------------------------------
  show() {
    fill(255, 0, 0);
    rect(this.x, this.y, this.w, this.h);
    }
  //---------------------------------------------------------------------------------------------------------------------------------------------------------
  move(direction) {
    switch (direction) {
      case "a":
        this.x = max(0, this.x - this.speed);
        break;
      case "d":
        this.x = min(width - 25, this.x + this.speed);
        break;
      case "w":
        this.y = max(0, this.y - this.speed);
        break;
      case "s":
        this.y = min(height - 25, this.y + this.speed);
        break;
    }
  }
    //---------------------------------------------------------------------------------------------------------------------------------------------------------
  update() {
  if (humanPlaying) {
    if (keyIsDown(87)) { // W
      this.y -= this.speed;
    }
    if (keyIsDown(83)) { // S
      this.y += this.speed;
    }
    if (keyIsDown(65)) { // A
      this.x -= this.speed;
    }
    if (keyIsDown(68)) { // D
      this.x += this.speed;
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
}
