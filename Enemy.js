class Enemy extends Entity {
  static enemyCount = 0; // static counter shared by all enemies

  constructor() {
    const whichWall = getRandomInt(1,4);
    const spawnX = whichWall === 1 ? 0 : whichWall === 2 ? 15 : getRandomInt(0,15); 
    const spawnY = whichWall === 3 ? 1 : whichWall === 4 ? 18 : getRandomInt(1,18);
    super({ x: spawnX, y: spawnY }, 36, 18, 8);
    Enemy.enemyCount++;  // increment count on each new enemy
    this.i = (Enemy.enemyCount % 4) + 1;
    this.spawnIndex = 0;

    this.playInvin = false;

    this.dropCooldown = 0;

    this.isActive = true;
    this.sprite = new Sprite(squirrel, 48, 24, 3);
    this.spriteDown = new Sprite(squirrelDown, 24, 24, 4);

    this.spawnTime = millis();
    // this.currentLocation = {x: this.getRandomIntInclusive(0,16), y: 0}
  }

  patrol() {
    this.move(this.getRandDirection());

  if (this.dropCooldown > 0) {
      this.dropCooldown--;
    } else {
      if (random(1) < 0.0001) {
        this.dropAnti();
        this.dropCooldown = 60000;
      }
    }
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

  dropAnti() {
    anti.push(new Anti(this.x, this.y));
  }

  show() {
    // console.log("update enemies");
    push();

    if (this.facing === "a") {
      scale(-1, 1);
   }

  //different sprites for different directions
    if (this.facing === "w") {
      scale(-1, -1);
      this.spriteDown.draw(this.x, this.y);
    } else if (this.facing === "s") {
      this.spriteDown.draw(this.x, this.y);
    } else {
      this.sprite.draw(this.x, this.y);
    }

    pop();
    // noFill();
    // stroke(255, 0, 0);
    // rect(this.x, this.y, this.w, this.h);
  }

  checkCollision(player) {
  
}

}
