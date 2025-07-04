class Enemy {

   static spawnOptions = [
      { patrol: [{ x: 60, y: 100 }, { x: 1020, y: 100 }] },
      { patrol: [{ x: 60, y: 240 }, { x: 1020, y: 240 }] },
      { patrol: [{ x: 100, y: 480 }, { x: 1020, y: 480 }] },
      { patrol: [{ x: 100, y: 400 }, { x: 1020, y: 400 }] },
      { patrol: [{ x: 550, y: 100 }, { x: 550, y: 500 }] },
      { patrol: [{ x: 60, y: 100 }, { x: 60, y: 400 }] },
      { patrol: [{ x: 1020, y: 100 }, { x: 1020, y: 830 }] },
      { patrol: [{ x: 90, y: 500 }, { x: 90, y: 830 }] },
      { patrol: [{ x: 220, y: 500 }, { x: 220, y: 830 }] },
      { patrol: [{ x: 350, y: 500 }, { x: 350, y: 830 }] },
      { patrol: [{ x: 90, y: 600 }, { x: 350, y: 600 }] },
      { patrol: [{ x: 90, y: 830 }, { x: 350, y: 830 }] },
      { patrol: [{ x: 350, y: 640 }, { x: 720, y: 640 }] },
      { patrol: [{ x: 350, y: 770 }, { x: 720, y: 770 }] },
      { patrol: [{ x: 730, y: 500 }, { x: 730, y: 830 }] },
      { patrol: [{ x: 855, y: 500 }, { x: 855, y: 830 }] },
      { patrol: [{ x: 980, y: 500 }, { x: 980, y: 830 }] }, //overlap with another

  
    ];

 constructor() {
    

    let randomIndex = floor(random(Enemy.spawnOptions.length));
    this.spawn = Enemy.spawnOptions.splice(randomIndex, 1)[0];
    this.patrolPoints = this.spawn.patrol;

    //random spawn position along patrol line
    let t = random(0, 1); 
    let p0 = this.patrolPoints[0];
    let p1 = this.patrolPoints[1];

    this.x = lerp(p0.x, p1.x, t);
    this.y = lerp(p0.y, p1.y, t);

    this.radius = 18;
    this.speed = 3;
    this.size = 36;

    this.playInvin = false;

    this.currentPatrolIndex = 0;
    this.dropCooldown = 0; 
    this.facing = "d";

    this.isActive = true;
    this.sprite = new Sprite(squirrel, this.size, this.radius, 3);

    this.spawnTime = millis();  //store the spawn time
    this.collisionDelay = 3000; //3 seconds

}

  

  moveTo(targetX, targetY) {
    let angle = atan2(targetY - this.y, targetX - this.x);
    let newX = this.x + this.speed * cos(angle);
    let newY = this.y + this.speed * sin(angle);

    if (!this.collidesWithBlocks(newX, newY)) {
      this.x = newX;
      this.y = newY;
    }

    if (abs(targetX - this.x) > abs(targetY - this.y)) {
      this.facing = targetX < this.x ? "a" : "d"; //left or right
    } else {
      this.facing = targetY < this.y ? "w" : "s"; //up or down
    }
  }

  move() {
     // .01% chance per frame to disappear
    if (random(1) < 0.001) {
      if (this.spawn) {
        Enemy.spawnOptions.push(this.spawn); //reusable
      }
    this.isActive = false;
    return;
    }


    this.patrol();

    // Drop anti-treats
    if (this.dropCooldown > 0) {
      this.dropCooldown--;
    } else {
      if (random(1) < 0.0001) { // .001% chance per frame (adjust?)
        this.dropAnti();
        this.dropCooldown = 60000; // cooldown
      }
    }
  }

  dropAnti() {
  anti.push(new Anti(this.x, this.y));
}

  patrol() {
  let target = this.patrolPoints[this.currentPatrolIndex];

  let d = dist(this.x, this.y, target.x, target.y);

  this.moveTo(target.x, target.y);

  //if close enough, advance to next patrol point
  if (d < 5) {
    this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.patrolPoints.length; 
  }
}

  show() {
  push();
  translate(this.x, this.y);
  if (this.facing == "a") {
        scale(-1, 1);
    } else if (this.facing == "w") {
        rotate(-HALF_PI);
    } else if (this.facing == "s") {
        rotate(HALF_PI);
    }
  imageMode(CENTER);
  //image(squirrel, 0, 0, this.size, this.radius);
  this.sprite.draw();
  pop();
}


  checkCollision(player) {
    //collision delay to prevent immediate collision on player
    if (!player || millis() - this.spawnTime < this.collisionDelay) return false;

    let playerLeft = player.x;
    let playerRight = player.x + player.w;
    let playerTop = player.y;
    let playerBottom = player.y + player.h;

    let closestX = constrain(this.x, playerLeft, playerRight);
    let closestY = constrain(this.y, playerTop, playerBottom);

    let dx = this.x - closestX;
    let dy = this.y - closestY;
    let distanceSq = dx * dx + dy * dy;

    let radius = this.size / 2;

    return distanceSq < (radius + 2) * (radius + 2);
  }

  collidesWithBlocks(x, y) {
    let tempEnemy = {
    x: x - this.size / 2,
    y: y - this.size / 2,
    w: this.size,
    h: this.size
    };


    for (let block of blocks) {
      if (block.intersects(tempEnemy)) {
        return true;
      }
    }
    return false;
  }
}