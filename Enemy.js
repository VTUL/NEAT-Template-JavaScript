class Enemy extends Entity {
  static enemyCount = 0; // static counter shared by all enemies

  constructor() {
    const collisionCallback = (collisions) => {
      collisions.forEach((occupant) => {
        if(occupant.type === 0) {          
          let deadPlayer = population.players.filter((player) => {
            return occupant.id === player.uuid;
          })
          deadPlayer[0].dead = true;
        }
      })
    }

    const whichWall = getRandomInt(1,4);
    const spawnX = whichWall === 1 ? 0 : whichWall === 2 ? 15 : getRandomInt(1,14); 
    const spawnY = whichWall === 3 ? 1 : whichWall === 4 ? 18 : getRandomInt(2,17);
    super({ x: spawnX, y: spawnY }, 36, 18, 8, 1, collisionCallback);
    Enemy.enemyCount++;  // increment count on each new enemy
    // this.i = (Enemy.enemyCount % 4) + 1;
    // this.spawnIndex = 0;

    // this.playInvin = false;

    // this.dropCooldown = 0;

    this.isActive = true;
    this.spriteLeft = new Sprite(squirrelLeft, 48, 24, 3);
    this.spriteDown = new Sprite(squirrelDown, 24, 48, 4);
    this.spriteRight = new Sprite(squirrelRight, 48, 24, 3);
    this.spriteUp = new Sprite(squirrelUp, 24, 48, 4);

    this.spawnTime = millis();
  }

  patrol() {
    this.move(this.getRandDirection());

  // if (this.dropCooldown > 0) {
  //     this.dropCooldown--;
  //   } else {
  //     if (random(1) < 0.0001) {
  //       this.dropAnti();
  //       this.dropCooldown = 60000;
  //     }
  //   }
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

  // dropAnti() {
  //   anti.push(new Anti(this.x, this.y));
  // }

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
