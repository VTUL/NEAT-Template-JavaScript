class Enemy extends Entity {
 static enemyCount = 0; // static counter shared by all enemies

  constructor() {
    super({ x: getRandomInt(0,16), y: 0 }, 36, 18, 8);
    Enemy.enemyCount++;  // increment count on each new enemy
    this.i = (Enemy.enemyCount % 4) + 1;
    this.spawnIndex = 0;

    // this.h = 18;
    // this.w = 36;

    this.playInvin = false;

    this.dropCooldown = 0;

    this.isActive = true;
    this.sprite = new Sprite(squirrel, this.w, this.h, 3);
    this.spriteDown = new Sprite(squirrelDown, this.h, this.w, 4);

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
    const cx = this.x + this.w / 2;
    const cy = this.y + this.h / 2;

    translate(cx, cy);

    if (this.facing === "a") {
      scale(-1, 1);
   }

  //different sprites for different directions
    if (this.facing === "w") {
      scale(-1, -1);
      this.spriteDown.draw();
      this.w = 18;
      this.h = 36;
    } else if (this.facing === "s") {
      this.spriteDown.draw();
      this.w = 18;
      this.h = 36;
    } else {
      this.sprite.draw();
      this.w = 36;
      this.h = 18;
    }

    imageMode(CENTER);
    pop();
    // noFill();
    // stroke(255, 0, 0);
    // rect(this.x, this.y, this.w, this.h);
  }

  checkCollision(player) {
  
}

}
