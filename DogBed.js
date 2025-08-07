class DogBed {
  constructor() {
    let index = floor(random(goodSpawns.length));
    let spawn = goodSpawns.splice(index, 1)[0]; // removes and returns the spawn
    this.spawn = spawn;
    this.x = spawn.x * blockWidth + offsetX + blockWidth / 2;
    this.y = spawn.y * blockHeight + offsetY + blockHeight / 2;
    this.r = 20;

    this.life = millis() + 15000;
    this.idList = [];
  }

  show() {
    imageMode(CENTER);
    image(bed, this.x, this.y, this.r * 2, this.r * 2);
    imageMode(CORNER);  
  }

  eaten() {
    goodSpawns.push(this.spawn);
  }

checkCollision(player) {
  let playerLeft = player.x;
  let playerRight = player.x + player.w;
  let playerTop = player.y;
  let playerBottom = player.y + player.h;

  let closestX = constrain(this.x, playerLeft, playerRight);
  let closestY = constrain(this.y, playerTop, playerBottom);

  let dx = this.x - closestX;
  let dy = this.y - closestY;
  let distanceSq = dx * dx + dy * dy;

  if (distanceSq < this.r * this.r) {
    this.collected = true;
    return true;
  }
  return false;
}
A
}
