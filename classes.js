class Entity {
  constructor(currentLocation, w, h, speed, type, collisionCallback) {
    this.isReadytoMove = true;
    this.currentLocation = currentLocation;
    this.w = w
    this.h = h;
    this.nextLocation = {};
    this.type = type;
    this.collisionCallback = collisionCallback;

    this.x =
      (this.currentLocation.x * gridWidth);
    this.y =
      (this.currentLocation.y * gridHeight);

    this.facing;

    this.baseSpeed = speed;
    this.boostedSpeed = 10;
    this.speed = this.baseSpeed;

    this.uuid = crypto.randomUUID();

    this.lastDec;

    this.registerLocation(this.currentLocation);
  }

  move(direction) {
    // console.info("Type", this.type);
    // console.info("Id", this.uuid);
    // console.info("Location", this.currentLocation);
    // console.info("direction", direction);
    if (!this.isReadytoMove) {
      console.info("not ready to move");
      // console.info("X coordinates", this.getX(this.nextLocation))
      switch (this.lastDec) {
        case "a":
          if (this.x - this.speed <= this.getX(this.nextLocation)) {
            this.x = this.getX(this.nextLocation);
            this.isReadytoMove = true;
            this.deregisterLocation(this.currentLocation);
            this.currentLocation = this.nextLocation;
            this.registerLocation(this.currentLocation);
            this.nextLocation = {};
          } else {
            this.x = this.x - this.speed;
          }
          break;
        case "d":
          if (this.x + this.speed >= this.getX(this.nextLocation)) {
            this.x = this.getX(this.nextLocation);
            this.isReadytoMove = true;
            this.deregisterLocation(this.currentLocation);
            this.currentLocation = this.nextLocation;
            this.registerLocation(this.currentLocation);
            this.nextLocation = {};
          } else {
            this.x = this.x + this.speed;
          }
          break;
        case "w":
          if (this.y - this.speed <= this.getY(this.nextLocation)) {
            this.y = this.getY(this.nextLocation);
            this.isReadytoMove = true;
            this.deregisterLocation(this.currentLocation);
            this.currentLocation = this.nextLocation;
            this.registerLocation(this.currentLocation);
            this.nextLocation = {};
          } else {
            this.y = this.y - this.speed;
          }
          break;
        case "s":
          if (this.y + this.speed >= this.getY(this.nextLocation)) {
            this.y = this.getY(this.nextLocation);
            this.isReadytoMove = true;
            this.deregisterLocation(this.currentLocation);
            this.currentLocation = this.nextLocation;
            this.registerLocation(this.currentLocation);
            this.nextLocation = {};
          } else {
            this.y = this.y + this.speed;
          }
          break;
      }
    } else {
      // console.info("ready to move");
      // console.info("direction", direction);
      switch (direction) {
        case "a":
          if (typeof mapGrid[this.currentLocation.y]?.[this.currentLocation.x - 1] !== "undefined" && mapGrid[this.currentLocation.y]?.[this.currentLocation.x - 1]?.valid) {
            this.facing = direction;
            this.nextLocation = {
              x: this.currentLocation.x - 1,
              y: this.currentLocation.y,
            };
            let collisions = this.checkCollision(this.nextLocation);
            if(collisions) {
              this.collisionCallback(collisions);
            }
            this.lastDec = "a";
            this.isReadytoMove = false;
          } else {
            // console.log("Not a valid move in the 'a' direction.")
            this.fitnessPenalty += 1;
          }
          break;
        case "d":
          if (typeof mapGrid[this.currentLocation.y]?.[this.currentLocation.x + 1] !== "undefined" && mapGrid[this.currentLocation.y]?.[this.currentLocation.x + 1]?.valid) {
            this.facing = direction;
            this.nextLocation = {
              x: this.currentLocation.x + 1,
              y: this.currentLocation.y,
            };
            let collisions = this.checkCollision(this.nextLocation);
            if(collisions) {
              this.collisionCallback(collisions);
            }
            this.lastDec = "d";
            this.isReadytoMove = false;
          } else {
            // console.log("Not a valid move in the 'd' direction.")
            this.fitnessPenalty += 1;
          }
          break;
        case "w":
          if (typeof mapGrid[this.currentLocation.y - 1]?.[this.currentLocation.x] !== "undefined" && mapGrid[this.currentLocation.y - 1]?.[this.currentLocation.x]?.valid) {
            this.facing = direction;
            this.nextLocation = {
              x: this.currentLocation.x,
              y: this.currentLocation.y - 1,
            };
            let collisions = this.checkCollision(this.nextLocation);
            if(collisions) {
              this.collisionCallback(collisions);
            }
            this.lastDec = "w";
            this.isReadytoMove = false;
          } else {
            // console.log("Not a valid move in the 'w' direction.")
            this.fitnessPenalty += 1;
          }
          break;
        case "s":
          if (typeof mapGrid[this.currentLocation.y + 1]?.[this.currentLocation.x] !== "undefined" && mapGrid[this.currentLocation.y + 1]?.[this.currentLocation.x]?.valid) {
            this.facing = direction;
            this.nextLocation = {
              x: this.currentLocation.x,
              y: this.currentLocation.y + 1,
            };
            let collisions = this.checkCollision(this.nextLocation);
            if(collisions) {
              this.collisionCallback(collisions);
            }
            this.lastDec = "s";
            this.isReadytoMove = false;
          } else {
            // console.log("Not a valid move in the 's' direction.")
            this.fitnessPenalty += 1;
          }
          break;
        default:
          console.error("No valid directions given");
      }
    }
  }

  checkCollision(location) {
    if(mapGrid[location.y][location.x].occupants.length === 0) {
      return false;      
    } else {
      return mapGrid[location.y][location.x].occupants;
    }
  }

  registerLocation(location) {
    mapGrid[location.y]?.[location.x]?.occupants.push({type: this.type, id: this.uuid})
  }

  deregisterLocation(location) {
    mapGrid[location.y][location.x].occupants = mapGrid[location.y][location.x].occupants.filter(value => { 
      return value.id !== this.uuid;
    })
  }

  getX(location) {
    return location.x * gridWidth;
  }

  getY(location) {
    return location.y * gridHeight;
  }
}

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
                  gameState.movesWithoutTreat = 0;
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
                gameState.movesWithoutTreat = 0;
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
    // this.distanceInterval = 20;
    // this.distanceReward = 100;
    this.pickupRewardModifier = 2000;
    // this.distance = 0;
    this.fitnessPenalty = 0;
    this.penaltyModifier = 100;
    // this.distanceModifier = 500;

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
    console.log("Player show called")
    console.log("this.spriteLeft: ", this.spriteLeft[this.i]);
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

    // collision box
    // noFill();
    // stroke(255, 0, 0);
    // rect(this.x, this.y, this.w, this.h);
  }

  deadzone(v, dz = 0.25) {
  return Math.abs(v) < dz ? 0 : v;
  }

  update() {
    if (this.dead) return;

    this.isInvincible = millis() < this.isInvinUntil;

    if (humanPlaying) {

      //KEYBOARD
      if (keyIsDown(87)) this.move("w"); // W
      if (keyIsDown(83)) this.move("s"); // S
      if (keyIsDown(65)) this.move("a"); // A
      if (keyIsDown(68)) this.move("d"); // D

      //GAMEPAD - left stick for movement, A button for sprinting
      const gp = navigator.getGamepads()[activeGamepadIndex ?? 0];
      if (gp) {
        let lx = this.deadzone(gp.axes[0]);
        let ly = this.deadzone(gp.axes[1]);

        if (ly < 0) this.move("w");
        if (ly > 0) this.move("s");

        if (lx < 0) this.move("a");
        if (lx > 0) this.move("d");

        //sprint (button 0 = A)
        if ((gp.buttons[0]?.pressed || keyIsDown(SHIFT)) && this.stamina > 0) {
          this.isSprinting = true;
        } else {
          this.isSprinting = false;
        }
      } else {
        //keyboard
        this.isSprinting = keyIsDown(SHIFT) && this.stamina > 0;
      }
    }

    //sprint logic
    if (this.isSprinting && this.stamina > 0) {
      this.speed = this.boostedSpeed;
      this.stamina -= this.staminaDrainRate;

      if (this.stamina <= 0) {
        this.stamina = 0;
        this.isSprinting = false;      //stop sprinting
        this.staminaCooldown = millis() + 3000; 
      }

    } else {
      this.speed = this.baseSpeed;

      //added cooldown for stamina regen after sprinting
      if (this.stamina < this.maxStamina && (!this.staminaCooldown || millis() > this.staminaCooldown)) {
        this.stamina += this.staminaRegenRate;
        if (this.stamina > this.maxStamina) this.stamina = this.maxStamina;
      }
    }
  }
 

  // think() {
  //   let max = 0;
  //   let maxIndex = 0;
  //   // console.info("Vision - tUp: ", this.vision[8]);
  //   // console.info("Vision - tRight: ", this.vision[25]);
  //   // console.info("Vision - tDown: ", this.vision[24]);
  //   // console.info("Vision - tLeft: ", this.vision[11]);

  //   //movement decision
  //   console.log("vision: ", this.vision)
    
  //   this.decision = this.brain.feedForward(this.vision);
  //   console.log("decision: ", this.decision);

  //   for (let i = 0; i < 4; i++) {
  //     if (this.decision[i] > max) {
  //       max = this.decision[i];
  //       maxIndex = i;
  //     }
  //   }

  //   if(this.decision[4] > 0.5) {this.isSprinting = true};
  //   this.move(directions[maxIndex]);

  // }

  //---------------------------------------------------------------------------------------------------------------------------------------------------------
  //returns a clone of this player with the same brian
  // clone() {
  //   var clone = new Player();
  //   clone.brain = this.brain.clone();
  //   clone.fitness = this.fitness;
  //   clone.brain.generateNetwork();
  //   clone.gen = this.gen;
  //   clone.bestScore = this.score;
  //   clone.stamina = this.stamina;
  //   clone.maxStamina = this.maxStamina;
  //   return clone;
  // }

  //---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  //since there is some randomness in games sometimes when we want to replay the game we need to remove that randomness
  //this fuction does that

  // cloneForReplay() {
  //   var clone = new Player();
  //   clone.brain = this.brain.clone();
  //   clone.fitness = this.fitness;
  //   clone.brain.generateNetwork();
  //   clone.gen = this.gen;
  //   clone.bestScore = this.score;
  //   clone.stamina = this.stamina;
  //   clone.maxStamina = this.maxStamina;

  //   //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
  //   return clone;
  // }

  // calculateFitness() {
  //   // this.fitness =
  //   //   this.score * this.score * this.pickupRewardModifier +
  //   //   this.distance * this.distanceModifier -
  //   //   this.fitnessPenalty * this.penaltyModifier;

  //   this.fitness = this.score * this.score * this.pickupRewardModifier - (this.fitnessPenalty * this.penaltyModifier);
  // }

  // crossover(parent2) {
  //   var child = new Player();
  //   child.brain = this.brain.crossover(parent2.brain);
  //   child.brain.generateNetwork();
  //   return child;
  // }

}

class Enemy extends Entity {
  static enemyCount = 0; // static counter shared by all enemies

  constructor() {
    //Is this collision callback needed here?
    const collisionCallback = (collisions) => {
  collisions.forEach((occupant) => {
    if (occupant.type === 0) {
      // if (humanPlaying && !humanPlayer.isInvincible) {
      //   humanPlayer.dead = true;
      // }
      // else {
      // AI players
      let deadPlayer = population.players.filter((player) => occupant.id === player.uuid);
      if (deadPlayer[0] && !deadPlayer[0].isInvincible) deadPlayer[0].dead = true;
      
      // }
    }
  });
};

    const whichWall = getRandomInt(1,4);
    const spawnX = whichWall === 1 ? 0 : whichWall === 2 ? 15 : getRandomInt(1,14); 
    const spawnY = whichWall === 3 ? 1 : whichWall === 4 ? 18 : getRandomInt(2,17);
    super({ x: spawnX, y: spawnY }, 36, 18, 8, 1, collisionCallback);
    Enemy.enemyCount++;  // increment count on each new enemy
    // this.i = (Enemy.enemyCount % 4) + 1;
    // this.spawnIndex = 0;

    // this.playInvin = false;

    this.isActive = true;
    this.spriteLeft = new Sprite(squirrelLeft, 48, 24, 3);
    this.spriteDown = new Sprite(squirrelDown, 24, 48, 4);
    this.spriteRight = new Sprite(squirrelRight, 48, 24, 3);
    this.spriteUp = new Sprite(squirrelUp, 24, 48, 4);

    this.spawnTime = millis();
  }

  patrol() {
    this.move(this.getRandDirection());
}

  getRandDirection() {
    let rand = Math.random();
    // console.log(rand);
    switch(true) {
      case (rand <= 0.25):
        return "w";
      case (rand >= 0.25 && rand <= 0.5):
        return "d";
      case (rand >= 0.5 && rand <= 0.75):
        return "s";
      case (rand >= 0.75):
        return "a";
    }
  }

  show() {
    // console.log("update enemies");
    push();

    if(this.facing === "a") {
      this.spriteLeft.draw(this.x, this.y);
    } else if(this.facing === "w") {
      this.spriteUp.draw(this.x, this.y);
    } else if(this.facing === "d") {
      this.spriteRight.draw(this.x, this.y);
    } else {
      this.spriteDown.draw(this.x, this.y);
    }

    pop();
    // noFill();
    // stroke(255, 0, 0);
    // rect(this.x, this.y, this.w, this.h);
  }
}

class Pickup {
  constructor(location, sprite, type, width, height) {
    this.location = location;
    this.x = this.location.x * gridWidth;
    this.y = this.location.y * gridHeight;
    this.width = width;
    this.height = height;
    this.sprite = sprite;
    this.type = type;
    this.idList = [];
    this.uuid = crypto.randomUUID();
    this.registerLocation();
    this.show();
  }

  show() {
    imageMode(CENTER);
    image(this.sprite, this.x, this.y, this.width, this.height)
  }

  registerLocation() {
    mapGrid[this.location.y][this.location.x].occupants.push({type: this.type, id: this.uuid})
  }

  deregisterLocation() {
    mapGrid[this.location.y][this.location.x].occupants = mapGrid[this.location.y][this.location.x].occupants.filter(value => { 
      return value.id !== this.uuid;
    })
  }

  static inList(pickupId, type, playerId) {
    switch(type) {
      case 2:
        let treat = treats.find((treat) => treat.uuid === pickupId);
        return treat?.idList.includes(playerId);
        break;
      case 3:
        let peanut = pb.find((peanut) => peanut.uuid === pickupId);
        return peanut?.idList.includes(playerId);
        break;
      case 4:
        let ball = balls.find((ball) => ball.uuid === pickupId);
        return ball?.idList.includes(playerId);
        break;
      case 5:
        let bed = beds.find((bed) => bed.uuid === pickupId);
        return bed?.idList.includes(playerId);
        break;
    }

  }
}

class PeanutButter extends Pickup {
  static value = 1000;
  constructor(sprite, width, height) {
    let location = false;
    while(!location) {
      let tempX = getRandomInt(0,15);
      let tempY = getRandomInt(0,18);
      if(typeof mapGrid[tempY]?.[tempX] !== "undefined" && mapGrid[tempY]?.[tempX]?.valid && mapGrid[tempY]?.[tempX]?.occupants.length === 0) {
        location = {
          x: tempX,
          y: tempY
        }
      }
    }

    super(location, sprite, 3, width, height)

    this.life = millis() + 15000;
  }
}

class DogBed extends Pickup {
  constructor(sprite, width, height) {
    let location = false;
    while(!location) {
      let tempX = getRandomInt(0,15);
      let tempY = getRandomInt(0,18);
      if(typeof mapGrid[tempY]?.[tempX] !== "undefined" && mapGrid[tempY]?.[tempX]?.valid && mapGrid[tempY]?.[tempX]?.occupants.length === 0) {
        location = {
          x: tempX,
          y: tempY
        }
      }
    }

    super(location, sprite, 4, width, height)

    this.life = millis() + 15000;
  }
}

class TennisBall extends Pickup {
  constructor(sprite, width, height) {
    let location = false;
    while(!location) {
      let tempX = getRandomInt(0,15);
      let tempY = getRandomInt(0,18);
      if(typeof mapGrid[tempY]?.[tempX] !== "undefined" && mapGrid[tempY]?.[tempX]?.valid && mapGrid[tempY]?.[tempX]?.occupants.length === 0) {
        location = {
          x: tempX,
          y: tempY
        }
      }
    }

    super(location, sprite, 5, width, height)

    this.life = millis() + 15000;
  }
}

class Treat extends Pickup {
  static value = 100;
  constructor(sprite, width, height) {
    let location = false;
    while(!location) {
      let tempX = getRandomInt(0,15);
      let tempY = getRandomInt(0,18);
      if(typeof mapGrid[tempY]?.[tempX] !== "undefined" && mapGrid[tempY]?.[tempX]?.valid && mapGrid[tempY]?.[tempX]?.occupants.length === 0) {
        location = {
          x: tempX,
          y: tempY
        }
      }
    }

    super(location, sprite, 2, width, height)

    this.life = millis() + 15000;
  }
}

function Sprite(sheet, w, h, frameCount) {
    this.sheet = sheet;
    this.w = w; //displayed width
    this.h = h; //displayed height
    this.frameCount = frameCount; //frames in sheet

    this.frameWidth = this.sheet.width / this.frameCount;
    this.frameHeight = this.sheet.height;

    this.frame = 0;

    this.draw = function(x, y) {
        imageMode(CENTER);
        image(
            this.sheet,
            x, y, this.w, this.h,                          
            this.frameWidth * floor(this.frame), 0,         
            this.frameWidth, this.frameHeight               
        );

        //animate
        this.frame += 0.1; 
        if (this.frame >= this.frameCount) {
            this.frame = 0;
        }
    }
}
