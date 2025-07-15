class Enemy {
  // Full, unchanging original list
  static originalSpawnOptions = [
    //top
    { spawn: {x: -10, y: 100 }, patrol: [{ x: 60, y: 100 }, { x: 500, y: 100 }] },
    { spawn: {x: 1090, y: 100 }, patrol: [{ x: 1020, y: 100 }, { x: 560, y: 100 }] },
    { spawn: {x: 500, y: -10 }, patrol: [{ x: 500, y: 70 }, { x: 60, y: 70 }] },
    { spawn: {x: 560, y: -10 }, patrol: [{ x: 560, y: 70 }, { x: 1020, y: 70 }] },
    { spawn: { x: -10, y: 235 }, patrol: [{ x: 60, y: 235 }, { x: 500, y: 235 }] },
    { spawn: { x: 1090, y: 235 }, patrol: [{ x: 1020, y: 235 }, { x: 560, y: 235 }] },
    { spawn: { x: 1090, y: 490 },  patrol: [{ x: 1020, y: 490 }, { x: 560, y: 490 }] },
    { spawn: { x: -10, y: 490 },  patrol: [{ x: 100, y: 490 }, { x: 500, y: 490 }] },
    { spawn: { x: 1090, y: 440 },  patrol: [{ x: 1020, y: 440 }, { x: 560, y: 440 }] },
    { spawn: { x: -10, y: 440 },  patrol: [{ x: 100, y: 440 }, { x: 500, y: 440 }] },
    { spawn: { x: 1090, y: 380 },  patrol: [{ x: 1020, y: 380 }, { x: 560, y: 380 }] },
    { spawn: { x: -10, y: 380 },  patrol: [{ x: 100, y: 380 }, { x: 500, y: 380 }] },
    { spawn: { x: 550, y: -10}, patrol: [{ x: 550, y: 100 }, { x: 550, y: 500 }] },
    { spawn: { x: 490, y: -10}, patrol: [{ x: 490, y: 100 }, { x: 490, y: 500 }] },
    { spawn: {x: 60, y: -10}, patrol: [{ x: 60, y: 100 }, { x: 60, y: 400 }] },
    { spawn: { x: 1020, y: -10}, patrol: [{ x: 1020, y: 100 }, { x: 1020, y: 440 }] },
    { spawn: { x: 1000, y: -10}, patrol: [{ x: 1000, y: 100 }, { x: 1000, y: 440 }] },

    //bottom
    { spawn: { x: 1020, y: 910}, patrol: [{ x: 1020, y: 830 }, { x: 1020, y: 500 }] },
    { spawn: { x: 90, y: 910}, patrol: [{ x: 90, y: 830 }, { x: 90, y: 500 }] },
    { spawn: { x: 220, y: 910}, patrol: [{ x: 220, y: 830 }, { x: 220, y: 500 }] },
    { spawn: {x: 350, y: 910}, patrol: [{ x: 350, y: 830 }, { x: 350, y: 500 }] },
    { spawn: {x: -10, y: 600}, patrol: [{ x: 90, y: 600 }, { x: 350, y: 600 }] },
    { spawn: {x: -10, y: 830}, patrol: [{ x: 90, y: 830 }, { x: 350, y: 830 }] },
    { spawn: {x: 1090, y: 590}, patrol: [{ x: 350, y: 640 }, { x: 720, y: 640 }] },
    { spawn: {x: 350, y: 910}, patrol: [{ x: 350, y: 770 }, { x: 720, y: 770 }] },
    { spawn: {x: 730, y: 910}, patrol: [{ x: 730, y: 830 }, { x: 730, y: 500 }] },
    { spawn: {x: 855, y: 910}, patrol: [{ x: 855, y: 830 }, { x: 855, y: 500 }] },
    { spawn: {x: 980, y: 910}, patrol: [{ x: 980, y: 830 }, { x: 980, y: 500 }] }
  ];

  
  static spawnOptions = [...Enemy.originalSpawnOptions];

  static resetSpawns() {
    Enemy.spawnOptions = [...Enemy.originalSpawnOptions];
  }

  constructor() {
    let randomIndex = floor(random(Enemy.spawnOptions.length));
    this.spawn = Enemy.spawnOptions.splice(randomIndex, 1)[0];
    this.patrolPoints = this.spawn.patrol;

    //random spawn position along patrol line
    //let t = random(0, 1);
   //let p0 = this.patrolPoints[0];
    //let p1 = this.patrolPoints[1];

    this.x = this.spawn.spawn.x;
    this.y = this.spawn.spawn.y;

    this.h = 18;
    this.speed = 3;
    this.w = 36;

    this.playInvin = false;

    this.currentPatrolIndex = 0;
    this.dropCooldown = 0;
    this.facing = "d";

    this.isActive = true;
    this.sprite = new Sprite(squirrel, this.w, this.h, 3);
    this.spriteDown = new Sprite(squirrelDown, this.h, this.w, 4);

    this.spawnTime = millis();
    //this.collisionDelay = 1500; //if enemy spawns on player, no insta-kill
  }

  moveTo(targetX, targetY) {
    let angle = atan2(targetY - this.y, targetX - this.x);
    let newX = this.x + this.speed * cos(angle);
    let newY = this.y + this.speed * sin(angle);

    
    this.x = newX;
    this.y = newY;
    

    if (abs(targetX - this.x) > abs(targetY - this.y)) {
      this.facing = targetX < this.x ? "a" : "d";
    } else {
      this.facing = targetY < this.y ? "w" : "s";
    }
  }

  move() {
    // .01% chance per frame to disappear
    if (random(1) < 0.001) {
      if (this.spawn) {
        Enemy.spawnOptions.push(this.spawn);
      }
      this.isActive = false;
      return;
    }

    this.patrol();

    if (this.dropCooldown > 0) {
      this.dropCooldown--;
    } else {
      if (random(1) < 0.0001) {
        this.dropAnti();
        this.dropCooldown = 60000;
      }
    }
  }

  dropAnti() {
    anti.push(new Anti(this.x, this.y));
  }

  patrol() {
  let target = this.patrolPoints[this.currentPatrolIndex];
  let d = dist(this.x, this.y, target.x, target.y);

  if (d < 5) {
    this.x = target.x;
    this.y = target.y;
  
    this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.patrolPoints.length;
  } else {
    this.moveTo(target.x, target.y);
  }
}


  show() {
    push();
    const cx = this.x + this.w / 2;
    const cy = this.y + this.h / 2;

    translate(cx, cy);

    if (this.facing === "a") {
      scale(-1, 1);
   }

    imageMode(CENTER);

  //different sprites for different directions
    if (this.facing === "w") {
      scale(-1, -1);
      this.spriteDown.draw();
    } else if (this.facing === "s") {
      this.spriteDown.draw();
    } else {
      this.sprite.draw();
    }

    imageMode(CORNER);
    pop();
    
    pop();
    noFill();
    stroke(255, 0, 0);
    rect(this.x, this.y, this.w, this.h);
  }

  checkCollision(player) {
  let thisLeft = this.x;
  let thisRight = this.x + this.w;
  let thisTop = this.y;
  let thisBottom = this.y + this.h;

  let playerLeft = player.x;
  let playerRight = player.x + player.w;
  let playerTop = player.y;
  let playerBottom = player.y + player.h;

  let overlapX = thisRight > playerLeft && thisLeft < playerRight;
  let overlapY = thisBottom > playerTop && thisTop < playerBottom;

  return overlapX && overlapY;
}

  /*collidesWithBlocks(x, y) {
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
  }*/
}
