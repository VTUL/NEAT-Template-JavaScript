class Enemy {
 constructor() {
     let spawnOptions = [
      { patrol: [{ x: 150, y: 670 }, { x: 1000, y: 670 }] },
      { patrol: [{ x: 330, y: 550 }, { x: 480, y: 410 }] },
      { patrol: [{ x: 230, y: 200 }, { x: 380, y: 90 }] },
      { patrol: [{ x: 70, y: 480 }, { x: 220, y: 300 }] },
      { patrol: [{ x: 990, y: 200 }, { x: 990, y: 350 }] },
      { patrol: [{ x: 800, y: 100 }, { x: 800, y: 350 }] },
      { patrol: [{ x: 800, y: 770 }, { x: 1020, y: 770 }] },
      { patrol: [{ x: 160, y: 670 }, { x: 160, y: 870 }] },
      { patrol: [{ x: 480, y: 80 }, { x: 480, y: 400 }] },
      { patrol: [{ x: 260, y: 800 }, { x: 800, y: 800 }] },
      { patrol: [{ x: 760, y: 70 }, { x: 420, y: 70 }] },
      { patrol: [{ x: 500, y: 320 }, { x: 200, y: 320 }] },
      { patrol: [{ x: 740, y: 350 }, { x: 740, y: 670 }] },
      { patrol: [{ x: 1020, y: 790 }, { x: 1020, y: 320 }] },
      { patrol: [{ x: 220, y: 190 }, { x: 220, y: 680 }] },
      { patrol: [{ x: 900, y: 350 }, { x: 900, y: 670 }] },
      { patrol: [{ x: 490, y: 180 }, { x: 990, y: 190 }] }
    ];

    let randomIndex = floor(random(spawnOptions.length));
    let selectedSpawn = spawnOptions[randomIndex];

    this.patrolPoints = selectedSpawn.patrol;

    //random spawn position along patrol line
    let t = random(0, 1); 
    let p0 = this.patrolPoints[0];
    let p1 = this.patrolPoints[1];

    this.x = lerp(p0.x, p1.x, t);
    this.y = lerp(p0.y, p1.y, t);

    this.radius = 15;
    this.speed = 1;
    this.size = 30;

    this.playInvin = false;

    this.currentPatrolIndex = 0;
    this.dropCooldown = 0; 
    this.facing = "d";

    this.isActive = true; 
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
        this.isActive = false;
        return; // Stop moving if disappearing
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
  image(squirrel, 0, 0, this.size, this.radius);
  pop();
}


  checkCollision(player) {
    if (!player) return false;

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