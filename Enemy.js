class Enemy {
  constructor() {
    this.x = 1070;
    this.y = 550;
    this.speed = 2;
    this.size = 20;
    this.changeDirTime = 0;
    this.directionX = 0;
    this.directionY = 0;
    this.eat = false;
    this.dead = false;
  }


  findClosestPlayer() {
    // Only check humanPlayer if valid and alive
    if (humanPlaying && humanPlayer && !humanPlayer.dead) {
      if (typeof humanPlayer.x === 'number' && typeof humanPlayer.y === 'number') {
        let d = dist(this.x, this.y, humanPlayer.x, humanPlayer.y);
        return { player: humanPlayer, distance: d };
      }
    }
    // No valid player found
    return { player: null, distance: null };
  }

  randomWalk() {
  if (millis() > this.changeDirTime) {
    this.directionX = random([-1, 0, 1]);
    this.directionY = random([-1, 0, 1]);
    this.changeDirTime = millis() + random(1000, 3000);
  }

  let newX = this.x + this.speed * this.directionX * 0.5;
  let newY = this.y + this.speed * this.directionY * 0.5;

  // Only move if no collision
  if (!this.collidesWithBlocks(newX, newY)) {
    this.x = constrain(newX, 0, width);
    this.y = constrain(newY, 0, height);
  }
}

 move() {
  let { player, distance } = this.findClosestPlayer();
  let detectionRadius = 300;

  if (!this.eat && player && distance !== null && distance < detectionRadius) {
    let angle = atan2(player.y - this.y, player.x - this.x);
    let newX = this.x + this.speed * cos(angle);
    let newY = this.y + this.speed * sin(angle);

    if (!this.collidesWithBlocks(newX, newY)) {
      this.x = newX;
      this.y = newY;
    }
  } else if (this.eat && player && distance !== null && distance < detectionRadius) {
    let angle = atan2(player.y - this.y, player.x - this.x);
    let newX = this.x - this.speed * cos(angle);
    let newY = this.y - this.speed * sin(angle);

    if (!this.collidesWithBlocks(newX, newY)) {
      this.x = newX;
      this.y = newY;
    }
  } else {
    this.randomWalk();
  }
}

  show() {

    fill(255, 0, 0);
    ellipse(this.x, this.y, this.size, this.size);
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
    return distanceSq < radius * radius;
  }

  collidesWithBlocks(x, y) {
  // create a temporary object with enemy's x,y,w,h
  let tempEnemy = { 
    x: x, 
    y: y, 
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