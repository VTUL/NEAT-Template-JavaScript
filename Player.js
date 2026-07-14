class Player extends Entity {
  constructor(brain) {
    const collisionCallback = (collisions) => {
      collisions.forEach((occupant) => {
        if (occupant.type === 1) {
          // console.log("Dog collided with Squirrel");
          if (!this.isInvincible) {
            this.dead = true;
          }
          return;
        } else if (occupant.type === 2 || occupant.type === 3) {
          if (occupant.type === 2) {
            for (let i = 0; i <= treats.length; i++) {
              if (treats[i]?.uuid === occupant.id) {
                if (treats[i].idList.includes(this.uuid)) {
                  return;
                } else {
                  //OG:this.score += occupant.type === 2 ? Treat.value : PeanutButter.value;
                  this.score += Treat.value;
                  this.movesWithoutTreat = 0;
                  treats[i].idList.push(this.uuid);
                  if (humanPlaying) {
                    treats[i].deregisterLocation();
                    treats.splice(i, 1);
                  }
                }
              }
            }
          } else if (occupant.type === 3) {
            if (pb[0]?.uuid === occupant.id) {
              if (pb[0].idList.includes(this.uuid)) {
                return;
              } else {
                this.score += PeanutButter.value;
                this.movesWithoutTreat = 0;
                pb[0].idList.push(this.uuid);
                if (humanPlaying) {
                  pb[0].deregisterLocation();
                  pb.splice(0, 1);
                }
              }
            }
          }
        } else if (occupant.type === 4) {
          if (beds[0]?.uuid === occupant.id) {
            if (beds[0].idList.includes(this.uuid)) {
              return;
            } else {
              beds[0].idList.push(this.uuid);
              this.stamina = 100;
              if (humanPlaying) {
                beds[0].deregisterLocation();
                beds.splice(0, 1);
              }
            }
          }
        } else if (occupant.type === 5) {
          if (balls[0]?.uuid === occupant.id) {
            if (balls[0].idList.includes(this.uuid)) {
              return;
            } else {
              balls[0].idList.push(this.uuid);
              this.isInvincible = true;
              this.isInvinUntil = 10000 + millis();
              if (humanPlaying) {
                balls[0].deregisterLocation();
                balls.splice(0, 1);
              }
            }
          }
        }
      });
    };

    super({ x: 9, y: 8 }, 40, 24, 5, 0, collisionCallback);
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
    // this.pickupRewardModifier = 2000;
    // this.distance = 0;
    // this.distanceModifier = 500;

    this.genomeInputs = 11; // 4 for walls, 5 for pickups 1 for enemies
    this.genomeOutputs = 5; // Up, Right, Down, Left, Sprint
    this.brain = brain;

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

    // this.r = getRandomInt(0, 255);
    // this.g = getRandomInt(0, 255);
    // this.b = getRandomInt(0, 255);

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
    // noFill();
    // strokeWeight(4);
    // stroke(this.r, this.g, this.b);
    // rect(this.x - this.w, this.y - this.h, this.w*2, this.h*2);
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
    if (this.isSprinting && this.stamina > 1) {
      this.speed = this.boostedSpeed;
      this.stamina -= this.staminaDrainRate;

      if (this.stamina <= 0) {
        this.stamina = 1;
        this.isSprinting = false; //stop sprinting
        this.staminaCooldown = millis() + 3000;
      }
    } else {
      this.speed = this.baseSpeed;

      //added cooldown for stamina regen after sprinting
      if (
        this.stamina < this.maxStamina &&
        (!this.staminaCooldown || millis() > this.staminaCooldown)
      ) {
        this.stamina += this.staminaRegenRate;
        if (this.stamina > this.maxStamina) this.stamina = this.maxStamina;
      }
    }
  }

  look() {
    this.vision = [];
    //push whisker vision to array
    this.vision.push(this.lookDirection(1));
    this.vision.push(this.lookDirection(2));
    this.vision.push(this.lookDirection(3));
    this.vision.push(this.lookDirection(4));
    this.vision.push(this.lookDirection(5));
    //push direction to array
    this.vision.push(this.facing === "w" ? 1 : 0);
    this.vision.push(this.facing === "s" ? 1 : 0);
    this.vision.push(this.facing === "d" ? 1 : 0);
    //sprinting to array
    this.vision.push((this.stamina / 100).toFixed(3));
    this.vision.push(this.speed === 5 ? 0 : 1);
    //push invincibility to array
    this.vision.push(this.isInvincible ? 1 : 0);
  }

  // 1 = left, 2 = diag left, 3 = forward, 4 = diag right, 5 = right
  lookDirection(direction) {
    switch(direction) {
      case 1:
        if(this.facing === "a") {
          return this.lookStraight(3);
        } else if (this.facing === "w") {
          return this.lookStraight(4);
        } else if (this.facing === "s") {
          return this.lookStraight(2);
        } else {
          return this.lookStraight(1);
        }
        break;
      case 2:
        if(this.facing === "a") {
          return this.lookDiagonal(3);
        } else if (this.facing === "w") {
          return this.lookDiagonal(1);
        } else if (this.facing === "s") {
          return this.lookDiagonal(4);
        } else {
          return this.lookDiagonal(2);
        }
        break;
      case 3:
        if(this.facing === "a") {
          return this.lookStraight(4);
        } else if (this.facing === "w") {
          return this.lookStraight(1);
        } else if (this.facing === "s") {
          return this.lookStraight(3);
        } else {
          return this.lookStraight(2);
        }
        break;
      case 4:
        if(this.facing === "a") {
          return this.lookDiagonal(1);
        } else if (this.facing === "w") {
          return this.lookDiagonal(2);
        } else if (this.facing === "s") {
          return this.lookDiagonal(4);
        } else {
          return this.lookDiagonal(3);
        }
        break;
      case 5:
        if(this.facing === "a") {
          return this.lookStraight(1);
        } else if (this.facing === "w") {
          return this.lookStraight(2);
        } else if (this.facing === "s") {
          return this.lookStraight(4);
        } else {
          return this.lookStraight(3);
        }
        break;
    }
  }

  // 1 = up, 2 = right, 3 = down, 4 = left
  lookStraight(direction) {
    let distance;
    for (let steps = 1; steps <= 17; steps++) {
      let tempX;
      let tempY;
      switch (direction) {
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
      // console.log("this.checkSpace: ", this.checkSpace(tempX, tempY, steps))
      distance = this.checkSpace(tempX, tempY, steps);
      if (typeof distance !== "undefined") return distance;
    }
    return distance;
  }

  checkSpace(tempX, tempY, steps){
    if (
        typeof mapGrid[this.currentLocation.y + tempY]?.[
          this.currentLocation.x + tempX
        ] === "undefined" ||
        !mapGrid[this.currentLocation.y + tempY]?.[
          this.currentLocation.x + tempX
        ]?.valid || mapGrid[this.currentLocation.y + tempY]?.[
          this.currentLocation.x + tempX
        ]?.occupants.some((occupant) => occupant.type === 1)
      ) {
        // console.log("bad thing identified");
        return -((1 / steps).toFixed(3));
      } else if (
        mapGrid[this.currentLocation.y + tempY]?.[
          this.currentLocation.x + tempX
        ]?.occupants.some((occupant) => occupant.type === 2) || mapGrid[this.currentLocation.y + tempY]?.[
          this.currentLocation.x + tempX
        ]?.occupants.some((occupant) => occupant.type === 3) || mapGrid[this.currentLocation.y + tempY]?.[
          this.currentLocation.x + tempX
        ]?.occupants.some((occupant) => occupant.type === 4) || mapGrid[this.currentLocation.y + tempY]?.[
          this.currentLocation.x + tempX
        ]?.occupants.some((occupant) => occupant.type === 5) &&
        !mapGrid[this.currentLocation.y + tempY]?.[
          this.currentLocation.x + tempX
        ]?.occupants.some((occupant) =>
          Pickup.inList(occupant.id, occupant.type, this.uuid),
        )
      ) {
        // console.log("good thing identified");
        return (1 / steps).toFixed(3);
      }
  }

  // 1 = up/left, 2 = up/right, 3 = down/left, 4 = down/right
  lookDiagonal(direction) {
    let distance;
    for (let steps = 1; steps <= 14; steps++) {
      let tempX;
      let tempY;
      switch (direction) {
        case 1:
          tempX = 0 - steps;
          tempY = 0 - steps;
          break;
        case 2:
          tempX = steps;
          tempY = 0 - steps;
          break;
        case 3:
          tempX = 0 - steps;
          tempY = steps;
          break;
        case 4:
          tempX = steps;
          tempY = steps;
          break;
      }
      distance = this.checkSpace(tempX, tempY, steps);
      if (typeof distance !== "undefined") return distance;
  }
}

  // checkWall(direction) {
  //   for(let steps = 1; steps <= 17; steps++) {
  //     let tempX;
  //     let tempY;
  //     switch(direction){
  //       case 1:
  //         tempX = 0;
  //         tempY = 0 - steps;
  //         break;
  //       case 2:
  //         tempX = steps;
  //         tempY = 0;
  //         break;
  //       case 3:
  //         tempX = 0;
  //         tempY = steps;
  //         break;
  //       case 4:
  //         tempX = 0 - steps;
  //         tempY = 0;
  //         break;
  //     }
  //     if (typeof mapGrid[this.currentLocation.y + tempY]?.[this.currentLocation.x + tempX] === "undefined" || !mapGrid[this.currentLocation.y + tempY]?.[this.currentLocation.x + tempX]?.valid) {
  //       return (1/steps).toFixed(3);
  //     }
  //   }
  // }

  // checkOther(direction, target) {
  //   for(let steps = 1; steps <= 19; steps++) {
  //     let tempX;
  //     let tempY;
  //     switch(direction){
  //       case 1:
  //         tempX = 0;
  //         tempY = 0 - steps;
  //         break;
  //       case 2:
  //         tempX = steps;
  //         tempY = 0;
  //         break;
  //       case 3:
  //         tempX = 0;
  //         tempY = steps;
  //         break;
  //       case 4:
  //         tempX = 0 - steps;
  //         tempY = 0;
  //         break;
  //     }
  //     if (typeof mapGrid[this.currentLocation.y + tempY]?.[this.currentLocation.x + tempX] === "undefined" || !mapGrid[this.currentLocation.y + tempY]?.[this.currentLocation.x + tempX]?.valid) {
  //       return 0;
  //     } else if (mapGrid[this.currentLocation.y + tempY]?.[this.currentLocation.x + tempX]?.occupants.some(occupant => occupant.type === target) && !mapGrid[this.currentLocation.y + tempY]?.[this.currentLocation.x + tempX]?.occupants.some(occupant => Pickup.inList(occupant.id, occupant.type, this.uuid))){
  //       return (1/steps).toFixed(3);
  //     }
  //   }
  // }

  // checkDownArea() {
  //   for(let rows = this.currentLocation.y + 1; rows <= gridRows; rows++) {
  //     for(let steps = 1; steps <= gridColumns - 1; steps++) {
  //       if(rows >= gridRows) {
  //         return 0;
  //       } else if (mapGrid[rows]?.[steps]?.occupants.some(occupant => occupant.type === 2) && !mapGrid[rows]?.[steps]?.occupants.some(occupant => Pickup.inList(occupant.id, occupant.type, this.uuid))) {
  //         return 1;
  //       }
  //     }
  //   }
  // }

  // checkRightArea() {
  //   for(let columns = this.currentLocation.x + 1; columns <= gridColumns; columns++) {
  //     for(let steps = 1; steps <= gridRows - 1; steps++) {
  //       if(columns >= gridColumns) {
  //         return 0;
  //       } else if (mapGrid[steps]?.[columns]?.occupants.some(occupant => occupant.type === 2) && !mapGrid[steps]?.[columns]?.occupants.some(occupant => Pickup.inList(occupant.id, occupant.type, this.uuid))) {
  //         return 1;
  //       }
  //       }
  //   }
  // }

  think() {
    let max = 0;
    let maxIndex = 0;
    // console.info("Vision - tUp: ", this.vision[8]);
    // console.info("Vision - tRight: ", this.vision[25]);
    // console.info("Vision - tDown: ", this.vision[24]);
    // console.info("Vision - tLeft: ", this.vision[11]);

    //movement decision
    let directions = ["w", "d", "s", "a"];
    // console.log(`Player ${this.uuid} vision: ${this.vision}`)
    this.decision = this.brain.propagate(this.vision);

    for (let i = 0; i < 4; i++) {
      if (this.decision[i] > max) {
        max = this.decision[i];
        maxIndex = i;
      }
    }

    if (this.decision[4] > 0.5) {
      this.isSprinting = true;
    } else {
      this.isSprinting = false;
    }

    if (this.isReadytoMove) {
      this.movesWithoutTreat++;
      if (this.movesWithoutTreat > MAX_MOVES_WITHOUT_TREAT) {
        this.dead = true;
        return;
      }
    }
    this.move(directions[maxIndex]);
  }

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

  calculateFitness() {
    this.brain.fitness =
      this.score + this.movesTaken / 10 - this.fitnessPenalty / 3;
    // console.log(this.brain);
  }

  // rebirth() {
  //   this.dead = false;
  //   this.movesWithoutTreat = 0;
  //   this.x = 9;
  //   this.y = 8;
  //   this.stamina = 100;
  //   this.isSprinting = false;
  // }

  // crossover(parent2) {
  //   var child = new Player();
  //   child.brain = this.brain.crossover(parent2.brain);
  //   child.brain.generateNetwork();
  //   return child;
  // }
}
