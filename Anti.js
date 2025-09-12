class Anti {
  constructor(x,y) {; 
    this.x = x;
    this.y = y;
    this.gridX = Math.floor((this.x - offsetX) / blockWidth);
    this.gridY = Math.floor((this.y - offsetY) / blockHeight);
    let index = goodSpawns.findIndex(s => s.x === this.gridX && s.y === this.gridY);
    this.r = 7.5;
    this.spawn = goodSpawns.splice(index, 1)[0];

    this.life = millis() + 15000;
    this.idList = [];

    this.playInvin = false;
  }

  show() {
    imageMode(CENTER);
    image(acorn, this.x, this.y, this.r * 2, this.r * 2);
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