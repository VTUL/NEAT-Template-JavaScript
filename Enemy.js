class Enemy {
  // Full, unchanging original list
  static originalSpawnOptions = [
    { spawn: {x: -10, y: 100 }, patrol: [{ x: 60, y: 100 }, { x: 500, y: 100 }] },
    { spawn: {x: 1090, y: 100 }, patrol: [{ x: 1020, y: 100 }, { x: 560, y: 100 }] },
    { spawn: { x: -10, y: 240 }, patrol: [{ x: 60, y: 240 }, { x: 500, y: 240 }] },
    { spawn: { x: 1090, y: 240 }, patrol: [{ x: 1020, y: 240 }, { x: 560, y: 240 }] },
    { spawn: { x: 1090, y: 240 }, patrol: [{ x: 1020, y: 240 }, { x: 560, y: 240 }] },
    { spawn: { x: 1090, y: 480 },  patrol: [{ x: 1020, y: 480 }, { x: 560, y: 480 }] },
    { spawn: { x: -10, y: 480 },  patrol: [{ x: 100, y: 480 }, { x: 500, y: 480 }] },
    { spawn: { x: 1090, y: 400 },  patrol: [{ x: 1020, y: 400 }, { x: 560, y: 400 }] },
    { spawn: { x: -10, y: 400 },  patrol: [{ x: 100, y: 400 }, { x: 500, y: 400 }] },
    { spawn: { x: 550, y: -10}, patrol: [{ x: 550, y: 100 }, { x: 550, y: 500 }] },
    { spawn: { x: 500, y: -10}, patrol: [{ x: 500, y: 100 }, { x: 500, y: 500 }] },
    { spawn: {x: 60, y: -10}, patrol: [{ x: 60, y: 100 }, { x: 60, y: 400 }] },
    { spawn: { x: 1020, y: 910}, patrol: [{ x: 1020, y: 830 }, { x: 1020, y: 100 }] },
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

    this.radius = 18;
    this.speed = 3;
    this.size = 36;

    this.playInvin = false;

    this.currentPatrolIndex = 0;
    this.dropCooldown = 0;
    this.facing = "d";

    this.isActive = true;
    this.sprite = new Sprite(squirrel, this.size, this.radius, 3);
    this.spriteDown = new Sprite(squirrelDown, this.radius, this.size, 4);

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
    this.moveTo(target.x, target.y);

    if (d < 5) {
      this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.patrolPoints.length;
    }
  }

  show() {
    push();
    translate(this.x, this.y);
    if (this.facing == "a") {
      scale(-1, 1);
      this.sprite.draw();
    } else if (this.facing == "w") {
      scale(-1, -1); //placeholder but sprite jumps a bit
      this.spriteDown.draw();
    } else if (this.facing == "s") {
      this.spriteDown.draw();
    }
    else{
      this.sprite.draw();
    }
    imageMode(CENTER);
    
    pop();
  }

  checkCollision(player) {
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
