class Player extends Entity {
  constructor() {

    const collisionCallback = (collisions) => {
      collisions.forEach((occupant) => {
        if(occupant.type === 1) {
          // console.log("Dog collided with Squirrel");
          if(!this.isInvincible) {
            this.dead = true;
          }
          return;
        } else if(occupant.type === 2 || occupant.type === 3) {
          if(occupant.type === 2) {
            for(let i = 0; i <= treats.length; i++) {
              if (treats[i]?.uuid === occupant.id) {
                if(treats[i].idList.includes(this.uuid)) {
                  return;
                } else {
                  //OG:this.score += occupant.type === 2 ? Treat.value : PeanutButter.value;
                  this.score += Treat.value
                  treats[i].idList.push(this.uuid);
                  if(humanPlaying) {
                    treats[i].deregisterLocation();
                    treats.splice(i, 1);
                  }
                }
              }
            }
          }
          else if(occupant.type === 3) {
            if (pb[0]?.uuid === occupant.id) {
              if(pb[0].idList.includes(this.uuid)) {
                return;
              } else {
                this.score += PeanutButter.value;
                pb[0].idList.push(this.uuid);
                if(humanPlaying) {
                  pb[0].deregisterLocation();
                  pb.splice(0, 1);
                }
              }
            }
          }
            
          
          
        } else if(occupant.type === 4) {
          if (beds[0]?.uuid === occupant.id) {
            if(beds[0].idList.includes(this.uuid)) {
              return;
            } else {
              beds[0].idList.push(this.uuid);
              this.stamina = 100;
              if(humanPlaying) {
                  beds[0].deregisterLocation();
                  beds.splice(0, 1);
                }
            }
          }
        } else if(occupant.type === 5) {
          if (balls[0]?.uuid === occupant.id) {
            if(balls[0].idList.includes(this.uuid)) {
              return;
            } else {
              balls[0].idList.push(this.uuid);
              this.isInvincible = true;
              this.isInvinUntil = 10000 + millis();
              if(humanPlaying) {
                  balls[0].deregisterLocation();
                  balls.splice(0, 1);
                }
            }
          }
        }
      })
    }

    super({ x: 9, y: 8 }, 40, 24, 5, 0, collisionCallback);
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

    this.genomeInputs = 29; // 4 for walls, 5 for pickups 1 for enemies
    this.genomeOutputs = 5; // Up, Right, Down, Left, Sprint
    this.brain = new Genome(this.genomeInputs, this.genomeOutputs);

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
    this.derekRight = new Sprite(derekRight, 86, 46, 4);
    this.derekLeft = new Sprite(derekLeft, 86, 46, 4);
    this.derekUp = new Sprite(derekUp, 40, 100, 4);
    this.derekDown = new Sprite(derekDown, 40, 100, 4);
    this.epcotRight = new Sprite(epcotRight, 86, 46, 4);
    this.epcotLeft = new Sprite(epcotLeft, 86, 46, 4);
    this.epcotUp = new Sprite(epcotUp, 40, 100, 4);
    this.epcotDown = new Sprite(epcotDown, 40, 100, 4);
    this.josieRight = new Sprite(josieRight, 86, 46, 4);
    this.josieLeft = new Sprite(josieLeft, 86, 46, 4);
    this.josieUp = new Sprite(josieUp, 40, 100, 4);
    this.josieDown = new Sprite(josieDown, 40, 100, 4);
    this.spriteLeft = [this.derekLeft, this.epcotLeft, this.josieLeft];
    this.spriteRight = [this.derekRight, this.epcotRight, this.josieRight];
    this.spriteUp = [this.derekUp, this.epcotUp, this.josieUp];
    this.spriteDown = [this.derekDown, this.epcotDown, this.josieDown];
    this.i = floor(random(3));

    

    this.distanceTrackerX = this.x;
    this.distanceTrackerY = this.y;

    this.stamina = 100;
    this.maxStamina = 100;
    this.staminaDrainRate = 0.8; //per frame when sprinting
    this.staminaRegenRate = this.maxStamina / (30 * 60); //regen over 30 seconds at 60 fps
    this.isSprinting = false;
  }

  show() {
    //draw the player sprite
    push();

    if (this.isInvincible) {
      tint(0, 255, 0);
    } else {
      noTint();
    }

    //different sprites for different directions
    if (this.facing === "w") {
      this.spriteUp[this.i].draw(this.x, this.y);
    } else if (this.facing === "s") {
      this.spriteDown[this.i].draw(this.x, this.y);
    } else if (this.facing === "d") {
      this.spriteRight[this.i].draw(this.x, this.y);
    } else {
      this.spriteLeft[this.i].draw(this.x, this.y);
    }

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
    //push walls to vision array
    this.vision.push(this.checkWall(1));
    this.vision.push(this.checkWall(2));
    this.vision.push(this.checkWall(3));
    this.vision.push(this.checkWall(4));

    //push enemies to vision array
    this.vision.push(this.checkOther(1, 1));
    this.vision.push(this.checkOther(2, 1));
    this.vision.push(this.checkOther(3, 1));
    this.vision.push(this.checkOther(4, 1));
    //push pickups to vision array
    this.vision.push(this.checkOther(1, 2));
    this.vision.push(this.checkOther(2, 2));
    this.vision.push(this.checkOther(3, 2));
    this.vision.push(this.checkOther(4, 2));
    this.vision.push(this.checkOther(1, 3));
    this.vision.push(this.checkOther(2, 3));
    this.vision.push(this.checkOther(3, 3));
    this.vision.push(this.checkOther(4, 3));
    this.vision.push(this.checkOther(1, 4));
    this.vision.push(this.checkOther(2, 4));
    this.vision.push(this.checkOther(3, 4));
    this.vision.push(this.checkOther(4, 4));
    this.vision.push(this.checkOther(1, 5));
    this.vision.push(this.checkOther(2, 5));
    this.vision.push(this.checkOther(3, 5));
    this.vision.push(this.checkOther(4, 5));
    //push directionality of valid treat
    this.vision.push(this.checkDownArea());
    this.vision.push(this.checkRightArea());
    //sprinting to array
    this.vision.push(100/this.stamina);
    this.vision.push(5/this.speed);
    //push invincibility to array
    this.vision.push(this.isInvincible ? 1 : 0);
  }

  checkWall(direction) {
    for(let steps = 1; steps <= 19; steps++) {
      let tempX;
      let tempY;
      switch(direction){
        case 1:
          tempX = 0;
          tempY = 0 - steps;
          break;
        case 2:
          tempX = steps;
          tempY = 0;
          break;
        case 3:
          tempX = 0;
          tempY = steps;
          break;
        case 4:
          tempX = 0 - steps;
          tempY = 0;
          break;
      }
      if (typeof mapGrid[this.currentLocation.y + tempY]?.[this.currentLocation.x + tempX] === "undefined" || !mapGrid[this.currentLocation.y + tempY]?.[this.currentLocation.x + tempX]?.valid) {
        return 1/steps;
      }
    }
  }

  checkOther(direction, target) {
    for(let steps = 1; steps <= 19; steps++) {
      let tempX;
      let tempY;
      switch(direction){
        case 1:
          tempX = 0;
          tempY = 0 - steps;
          break;
        case 2:
          tempX = steps;
          tempY = 0;
          break;
        case 3:
          tempX = 0;
          tempY = steps;
          break;
        case 4:
          tempX = 0 - steps;
          tempY = 0;
          break;
      }
      if (typeof mapGrid[this.currentLocation.y + tempY]?.[this.currentLocation.x + tempX] === "undefined" || !mapGrid[this.currentLocation.y + tempY]?.[this.currentLocation.x + tempX]?.valid) {
        return 0;
      } else if (mapGrid[this.currentLocation.y + tempY]?.[this.currentLocation.x + tempX]?.occupants.some(occupant => occupant.type === target) && !mapGrid[this.currentLocation.y + tempY]?.[this.currentLocation.x + tempX]?.occupants.some(occupant => Pickup.inList(occupant.id, occupant.type, this.uuid))){
        return 1/steps;
      } 
    }
  }

  checkDownArea() {
    for(let rows = this.currentLocation.y + 1; rows <= gridRows; rows++) {
      for(let steps = 1; steps <= gridColumns - 1; steps++) {
        if(rows >= gridRows) {
          return 0;
        } else if (mapGrid[rows]?.[steps]?.occupants.some(occupant => occupant.type === 2) && !mapGrid[rows]?.[steps]?.occupants.some(occupant => Pickup.inList(occupant.id, occupant.type, this.uuid))) {
          return 1;
        }
      }
    }
  }

  checkRightArea() {
    for(let columns = this.currentLocation.x + 1; columns <= gridColumns; columns++) {
      for(let steps = 1; steps <= gridRows - 1; steps++) {
        if(columns >= gridColumns) {
          return 0;
        } else if (mapGrid[steps]?.[columns]?.occupants.some(occupant => occupant.type === 2) && !mapGrid[steps]?.[columns]?.occupants.some(occupant => Pickup.inList(occupant.id, occupant.type, this.uuid))) {
          return 1;
        }
        }
    }
  }

  think() {
    let max = 0;
    let maxIndex = 0;
    // console.info("Vision - tUp: ", this.vision[8]);
    // console.info("Vision - tRight: ", this.vision[25]);
    // console.info("Vision - tDown: ", this.vision[24]);
    // console.info("Vision - tLeft: ", this.vision[11]);

    //movement decision
    let directions = ["w", "d", "s", "a"];
    this.decision = this.brain.feedForward(this.vision);

    for (let i = 0; i < 4; i++) {
      if (this.decision[i] > max) {
        max = this.decision[i];
        maxIndex = i;
      }
    }

    if(this.decision[4] > 0.5) {this.isSprinting = true};
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
