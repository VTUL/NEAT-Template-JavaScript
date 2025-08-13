class PeanutButter {
  constructor() {
    let index = floor(random(goodSpawns.length));
    let spawn = goodSpawns.splice(index, 1)[0]; // removes and returns the spawn
    this.spawn = spawn;
    this.x = spawn.x * blockWidth + offsetX + blockWidth / 2;
    this.y = spawn.y * blockHeight + offsetY + blockHeight / 2;
    this.gridX = spawn.x;
    this.gridY = spawn.y;
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
  const playerGridX = Math.floor((player.x - offsetX) / blockWidth);
  const playerGridY = Math.floor((player.y - offsetY) / blockHeight);
  //check if both are in the same grid space
  return this.gridX === playerGridX && this.gridY === playerGridY;
  }


}