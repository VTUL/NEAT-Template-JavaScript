class PeanutButter {
  constructor() {
    let index = floor(random(goodSpawns.length));
    let spawn = goodSpawns.splice(index, 1)[0]; // removes and returns the spawn
    this.spawn = spawn;
    this.x = spawn.x * blockWidth + offsetX + blockWidth / 2;
    this.y = spawn.y * blockHeight + offsetY + blockHeight / 2;
    this.w = 25;
    this.h = 25;

    this.life = millis() + 20000;
    this.idList = [];
  }
  show() {
    imageMode(CENTER);
    image(peanut, this.x, this.y, this.w, this.h);
    imageMode(CORNER);
  }

  eaten() {
    goodSpawns.push(this.spawn);
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


}