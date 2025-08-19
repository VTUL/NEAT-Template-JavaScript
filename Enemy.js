class Enemy {
  //commented out spawns that arent on the outer edges
  static topLeftSpawn = [
    //top left

    { spawn: {x: -1, y: 3 }, patrol: [{ x: 1, y: 3 }, { x: 10, y: 3 }] },
    { spawn: {x: 10, y: -1 }, patrol: [{ x: 10, y: 2 }, { x: 1, y: 2 }] },
    { spawn: { x: -1, y: 7 }, patrol: [{ x: 1, y: 7 }, { x: 10, y: 7 }] },
    { spawn: { x: -1, y: 14 },  patrol: [{ x: 1, y: 14 }, { x: 10, y: 14 }] },
    { spawn: { x: -1, y: 12 },  patrol: [{ x: 1, y: 12 }, { x: 10, y: 12 }] },
    { spawn: { x: -1, y: 10 },  patrol: [{ x: 1, y: 10 }, { x: 10, y: 10 }] },
    { spawn: { x: 10, y: -1}, patrol: [{ x: 10, y: 2}, { x: 10, y: 10 }] },
    { spawn: {x: 1, y: -1}, patrol: [{ x: 1, y: 2 }, { x: 1, y: 11 }] },

  ];
  static topRightSpawn = [
    //top right
  
    { spawn: {x: 22, y: 2 }, patrol: [{ x: 20, y: 2 }, { x: 11, y: 2 }] }, 
    { spawn: {x: 11, y: -1 }, patrol: [{ x: 11, y: 3 }, { x: 20, y: 3 }] },
    { spawn: { x: 22, y: 7 }, patrol: [{ x: 20, y: 7 }, { x: 11, y: 7 }] },
    { spawn: { x: 22, y: 14 },  patrol: [{ x: 20, y: 14 }, { x: 11, y: 14 }] },
    { spawn: { x: 22, y: 12 },  patrol: [{ x: 20, y: 12 }, { x: 11, y: 12 }] },
    { spawn: { x: 22, y: 10 },  patrol: [{ x: 20, y: 10 }, { x: 11, y: 10 }] },
    { spawn: { x: 11, y: -1}, patrol: [{ x: 11, y: 2 }, { x: 11, y: 10 }] },
    { spawn: { x: 20, y: -1}, patrol: [{ x: 20, y: 2 }, { x: 20, y: 9 }] },

  ];
  static bottomLeftSpawn = [
    //bottom left

    { spawn: { x: 1, y: 26}, patrol: [{ x: 1, y: 24 }, { x: 1, y: 10 }] },
    { spawn: { x: 2, y: 26}, patrol: [{ x: 2, y: 24 }, { x: 2, y: 10 }] },
    { spawn: { x: 4, y: 26}, patrol: [{ x: 4, y: 24 }, { x: 4, y: 10 }] },
    { spawn: {x: 7, y: 26}, patrol: [{ x: 7, y: 24 }, { x: 7, y: 10 }] },
    { spawn: {x: -1, y: 17}, patrol: [{ x: 1, y: 17 }, { x: 10, y: 17 }] },
    { spawn: {x: -1, y: 23}, patrol: [{ x: 1, y: 23 }, { x: 7, y: 23 }] },
    { spawn: {x: 7, y: 26}, patrol: [{ x: 7, y: 22 }, { x: 14, y: 22 }] },
    { spawn: {x: -1, y: 24}, patrol: [{ x: 1, y: 24 }, { x: 10, y: 24 }] },
    
  ];
  static bottomRightSpawn = [
    //bottom right

    { spawn: { x: 20, y: 26}, patrol: [{ x: 20, y: 24 }, { x: 20, y: 10 }] },
    { spawn: { x: 19, y: 26}, patrol: [{ x: 19, y: 24 }, { x: 19, y: 10 }] },
    { spawn: {x: 22, y: 17}, patrol: [{ x: 20, y: 17 }, { x: 11, y: 17 }] },
    { spawn: {x: 14, y: 26}, patrol: [{ x: 14, y: 24 }, { x: 14, y: 10 }] },
    { spawn: {x: 17, y: 26}, patrol: [{ x: 17, y: 24 }, { x: 17, y: 10 }] },
    { spawn: {x: 22, y: 24}, patrol: [{ x: 20, y: 24 }, { x: 11, y: 24 }] },
    { spawn: {x: 14, y: 26}, patrol: [{ x: 14, y: 21 }, { x: 7, y: 21 }] },
    { spawn: {x: 22, y: 23}, patrol: [{ x: 20, y: 23 }, { x: 14, y: 23 }] },
    
  ];

  
  static topLeftSpawnOptions = [...Enemy.topLeftSpawn];
  static topRightSpawnOptions = [...Enemy.topRightSpawn];
  static bottomLeftSpawnOptions = [...Enemy.bottomLeftSpawn];
  static bottomRightSpawnOptions = [...Enemy.bottomRightSpawn];

  static resetSpawns() {
    Enemy.topLeftSpawnOptions = [...Enemy.topLeftSpawn];
    Enemy.topRightSpawnOptions = [...Enemy.topRightSpawn]; 
    Enemy.bottomLeftSpawnOptions = [...Enemy.bottomLeftSpawn];
    Enemy.bottomRightSpawnOptions = [...Enemy.bottomRightSpawn];
  }
  static enemyCount = 0; //static counter shared by all enemies

  constructor() {
    let randomIndex;
    Enemy.enemyCount++;  //increment count on each new enemy
    this.i = (Enemy.enemyCount % 4) + 1;
    this.spawnIndex = 0;
    this.topLef = 8;
    this.topRig = 8;
    this.botLef = 8;
    this.botRig = 8;

    switch (this.i) {
      case 1:
        randomIndex = floor(random(Enemy.topLeftSpawnOptions.length));
        this.spawn = Enemy.topLeftSpawnOptions.splice(randomIndex, 1)[0];
        break;
      case 2:
        randomIndex = floor(random(Enemy.topRightSpawnOptions.length));
        this.spawn = Enemy.topRightSpawnOptions.splice(randomIndex, 1)[0];
        break;
      case 3:
        randomIndex = floor(random(Enemy.bottomLeftSpawnOptions.length));
        this.spawn = Enemy.bottomLeftSpawnOptions.splice(randomIndex, 1)[0];
        break;
      case 4:
        randomIndex = floor(random(Enemy.bottomRightSpawnOptions.length));
        this.spawn = Enemy.bottomRightSpawnOptions.splice(randomIndex, 1)[0];
        break;
    }

    this.patrolPoints = this.spawn.patrol;
  
    this.x = this.spawn.spawn.x * blockWidth + offsetX + blockWidth / 2;
    this.y = this.spawn.spawn.y * blockHeight + offsetY + blockHeight / 2;
    this.gridX = this.spawn.spawn.x;
    this.gridY = this.spawn.spawn.y;

    this.h = 18;
    this.speed = 5;
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
    this.y = newY  

    if (abs(targetX - this.x) > abs(targetY - this.y)) {
      this.facing = targetX < this.x ? "a" : "d";
    } else {
      this.facing = targetY < this.y ? "w" : "s";
    }
  }

  move() {
    //.01% chance per frame to disappear
    if (random(1) < 0.001) {
      if (this.spawn && this.i == 1) {
        Enemy.topLeftSpawnOptions.push(this.spawn);
      }
      else if (this.spawn && this.i == 2) {
        Enemy.topRightSpawnOptions.push(this.spawn);
      }
      else if (this.spawn && this.i == 3) {
        Enemy.bottomLeftSpawnOptions.push(this.spawn);
      }
      else if (this.spawn && this.i == 4) {
        Enemy.bottomRightSpawnOptions.push(this.spawn);
      }
      this.isActive = false;
      return;
    }

    this.patrol();

    if (this.dropCooldown > 0) {
      this.dropCooldown--;
    } else {
      if (random(1) < 0.001) { //0.0001
        this.dropAnti();
        this.dropCooldown = 30000;
      }
    }
    this.gridX = Math.floor((this.x - offsetX) / blockWidth);
    this.gridY = Math.floor((this.y - offsetY) / blockHeight);
  }

  dropAnti() {
    let centerX = this.gridX * blockWidth + offsetX + blockWidth / 2;
    let centerY = this.gridY * blockHeight + offsetY + blockHeight / 2;
    anti.push(new Anti(centerX, centerY));
  }

  patrol() {
    let targetGrid = this.patrolPoints[this.currentPatrolIndex];
    let targetX = targetGrid.x * blockWidth + offsetX + blockWidth / 2;
    let targetY = targetGrid.y * blockHeight + offsetY + blockHeight / 2;
    let d = dist(this.x, this.y, targetX, targetY);

    if (d < 5) {
      this.x = targetX;
      this.y = targetY;
      this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.patrolPoints.length;
    } else {
      this.moveTo(targetX, targetY);
    }
}

show() {
  push();

  translate(this.x, this.y);

  if (this.facing === "a") {
    scale(-1, 1);
  }

  imageMode(CENTER);

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

  imageMode(CORNER);
  pop();
  //noFill();
  //stroke(255, 0, 0);
  //rect(this.x, this.y, this.w, this.h);
}

checkCollision(player) {
  const playerGridX = Math.floor((player.x - offsetX) / blockWidth);
  const playerGridY = Math.floor((player.y - offsetY) / blockHeight);
  //check if both are in the same grid space
  return this.gridX === playerGridX && this.gridY === playerGridY;
}

}
