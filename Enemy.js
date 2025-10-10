class Enemy {
  //commented out spawns that arent on the outer edges
  static enemySpawns = [
    //outside the map
    //left
    { spawn: {x: -1, y: -1 }},
    { spawn: {x: -1, y: 0 }},
    { spawn: {x: -1, y: 1 }},
    { spawn: {x: -1, y: 2 }},
    { spawn: {x: -1, y: 3 }},
    { spawn: {x: -1, y: 4 }},
    { spawn: {x: -1, y: 5 }},
    { spawn: {x: -1, y: 6 }},
    { spawn: {x: -1, y: 7 }},
    { spawn: {x: -1, y: 8 }},
    { spawn: {x: -1, y: 9 }},
    { spawn: {x: -1, y: 10 }},
    { spawn: {x: -1, y: 11 }},
    { spawn: {x: -1, y: 12 }},
    { spawn: {x: -1, y: 13 }},
    { spawn: {x: -1, y: 14 }},
    { spawn: {x: -1, y: 15 }},
    { spawn: {x: -1, y: 16 }},
    { spawn: {x: -1, y: 17 }},
    { spawn: {x: -1, y: 18 }},
    { spawn: {x: -1, y: 19 }},
    { spawn: {x: -1, y: 20 }},
    { spawn: {x: -1, y: 21 }},
    { spawn: {x: -1, y: 22 }},
    { spawn: {x: -1, y: 23 }},
    { spawn: {x: -1, y: 24 }},
    { spawn: {x: -1, y: 25 }},
    { spawn: {x: -1, y: 26 }},
    { spawn: {x: -1, y: 27 }},
    //right
    { spawn: {x: 23, y: -1 }},
    { spawn: {x: 23, y: 0 }},
    { spawn: {x: 23, y: 1 }},
    { spawn: {x: 23, y: 2 }},
    { spawn: {x: 23, y: 3 }},
    { spawn: {x: 23, y: 4 }},
    { spawn: {x: 23, y: 5 }},
    { spawn: {x: 23, y: 6 }},
    { spawn: {x: 23, y: 7 }},
    { spawn: {x: 23, y: 8 }},
    { spawn: {x: 23, y: 9 }},
    { spawn: {x: 23, y: 10 }},
    { spawn: {x: 23, y: 11 }},
    { spawn: {x: 23, y: 12 }},
    { spawn: {x: 23, y: 13 }},
    { spawn: {x: 23, y: 14 }},
    { spawn: {x: 23, y: 15 }},
    { spawn: {x: 23, y: 16 }},
    { spawn: {x: 23, y: 17 }},
    { spawn: {x: 23, y: 18 }},
    { spawn: {x: 23, y: 19 }},
    { spawn: {x: 23, y: 20 }},
    { spawn: {x: 23, y: 21 }},
    { spawn: {x: 23, y: 22 }},
    { spawn: {x: 23, y: 23 }},
    { spawn: {x: 23, y: 24 }},
    { spawn: {x: 23, y: 25 }},
    { spawn: {x: 23, y: 26 }},
    { spawn: {x: 23, y: 27 }},
    //top
    { spawn: {x: 0, y: -1 }},
    { spawn: {x: 1, y: -1 }},
    { spawn: {x: 2, y: -1 }},
    { spawn: {x: 3, y: -1 }},
    { spawn: {x: 4, y: -1 }},
    { spawn: {x: 5, y: -1 }},
    { spawn: {x: 6, y: -1 }},
    { spawn: {x: 7, y: -1 }},
    { spawn: {x: 8, y: -1 }},
    { spawn: {x: 9, y: -1 }},
    { spawn: {x: 10, y: -1 }},
    { spawn: {x: 11, y: -1 }},
    { spawn: {x: 12, y: -1 }},
    { spawn: {x: 13, y: -1 }},
    { spawn: {x: 14, y: -1 }},
    { spawn: {x: 15, y: -1 }},
    { spawn: {x: 16, y: -1 }},
    { spawn: {x: 17, y: -1 }},
    { spawn: {x: 18, y: -1 }},
    { spawn: {x: 19, y: -1 }},
    { spawn: {x: 20, y: -1 }},
    { spawn: {x: 21, y: -1 }},
    { spawn: {x: 22, y: -1 }},
    { spawn: {x: 23, y: -1 }},
    //bottom
    { spawn: {x: -1, y: 27 }},
    { spawn: {x: 0, y: 27 }},
    { spawn: {x: 1, y: 27 }},
    { spawn: {x: 2, y: 27 }},
    { spawn: {x: 3, y: 27 }},
    { spawn: {x: 4, y: 27 }},
    { spawn: {x: 5, y: 27 }},
    { spawn: {x: 6, y: 27 }},
    { spawn: {x: 7, y: 27 }},
    { spawn: {x: 8, y: 27 }},
    { spawn: {x: 9, y: 27 }},
    { spawn: {x: 10, y: 27 }},
    { spawn: {x: 11, y: 27 }},
    { spawn: {x: 12, y: 27 }},
    { spawn: {x: 13, y: 27 }},
    { spawn: {x: 14, y: 27 }},
    { spawn: {x: 15, y: 27 }},
    { spawn: {x: 16, y: 27 }},
    { spawn: {x: 17, y: 27 }},
    { spawn: {x: 18, y: 27 }},
    { spawn: {x: 19, y: 27 }},
    { spawn: {x: 20, y: 27 }},
    { spawn: {x: 21, y: 27 }},
    { spawn: {x: 22, y: 27 }},
    { spawn: {x: 23, y: 27 }},
  ]

  
  static enemySpawnOptions = [...Enemy.enemySpawns];
 

  static resetSpawns() {
    Enemy.enemySpawnOptions = [...Enemy.enemySpawns];
  }


  constructor() {
    let randomIndex = floor(random(Enemy.enemySpawnOptions.length));
    this.spawn = Enemy.enemySpawnOptions.splice(randomIndex, 1)[0];
    this.gridX = this.spawn.spawn.x;
    this.gridY = this.spawn.spawn.y;

    //pixel conversion
    this.x = this.gridX * blockWidth + offsetX + blockWidth / 2;
    this.y = this.gridY * blockHeight + offsetY + blockHeight / 2;

    //move in to nearest inside bound tile
    let nearest = this.findNearestValidSpawn(this.gridX, this.gridY);
    this.targetGrid = { x: nearest.x, y: nearest.y };

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
  }



  moveTo(targetX, targetY) {
    let angle = atan2(targetY - this.y, targetX - this.x);

    //move toward target
    this.x += this.speed * cos(angle);
    this.y += this.speed * sin(angle);

    //update grid
    this.gridX = Math.floor((this.x - offsetX) / blockWidth);
    this.gridY = Math.floor((this.y - offsetY) / blockHeight);

    //update facing
    if (abs(targetX - this.x) > abs(targetY - this.y)) {
      this.facing = targetX < this.x ? "a" : "d";
    } else {
      this.facing = targetY < this.y ? "w" : "s";
    }

    //check if at target
    let d = dist(this.x, this.y, targetX, targetY);
    if (d < this.speed) {  
      this.x = targetX;   
      this.y = targetY;
      this.pickNewTarget();
    }

}




  move() {
    //.01% chance per frame to disappear
    if (random(1) < 0.001) {
      if (this.spawn) {
        Enemy.enemySpawnOptions.push(this.spawn);
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
    let gridSpace = { x: this.gridX, y: this.gridY };
    if(goodSpawns.some(s => s.x === gridSpace.x && s.y === gridSpace.y)){ 
      anti.push(new Anti(centerX, centerY));
    }
  }

  patrol() {
    if (!this.targetGrid) {
      this.pickNewTarget();
    }

    let targetX = this.targetGrid.x * blockWidth + offsetX + blockWidth / 2;
    let targetY = this.targetGrid.y * blockHeight + offsetY + blockHeight / 2;

    let d = dist(this.x, this.y, targetX, targetY);

    if (d < 1) { 
      this.pickNewTarget(); 
    } else {
      this.moveTo(targetX, targetY); 
    }
  }


  pickNewTarget() {
    //pick a random direction
    const dirs = ["w", "a", "s", "d"];
    const dir = random(dirs);

    //random distance
    const distance = floor(random(3, 6 + 1)); 

    let newX = this.gridX;
    let newY = this.gridY;

    switch (dir) {
      case "w": newY -= distance; break;
      case "s": newY += distance; break;
      case "a": newX -= distance; break;
      case "d": newX += distance; break;
    }

  //step towards target until hitting a wall
  let stepX = this.gridX;
  let stepY = this.gridY;
  let lastValid = { x: stepX, y: stepY };

  let dx = Math.sign(newX - stepX);
  let dy = Math.sign(newY - stepY);

  while (stepX !== newX || stepY !== newY) {
    if (this.isWalkable(stepX + dx, stepY + dy)) {
      stepX += dx;
      stepY += dy;
      lastValid = { x: stepX, y: stepY };
    } else {
      break; //stop, wall
    }
  }

  this.targetGrid = {
  x: constrain(lastValid.x, 1, MAP_DATA[0].length - 2),
  y: constrain(lastValid.y, 1, MAP_DATA.length - 2)
};
 //set the farthest valid cell in that direction

}


isWalkable(x, y) {
  if (y < 0 || y >= MAP_DATA.length) return false;
  if (x < 0 || x >= MAP_DATA[0].length) return false;
  return MAP_DATA[y][x] === "-"; 
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

findNearestValidSpawn(x, y) {
  let nearest = fullSpawns[0];
  let bestDist = dist(x, y, nearest.x, nearest.y);

  for (let s of fullSpawns) {
    let d = dist(x, y, s.x, s.y);
    if (d < bestDist) {
      bestDist = d;
      nearest = s;
    }
  }
  return nearest;
}


}

