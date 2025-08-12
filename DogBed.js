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
    const objGridX = Math.floor((this.x - offsetX) / blockWidth);
    const objGridY = Math.floor((this.y - offsetY) / blockHeight);

    const playerGridX = Math.floor((player.x - offsetX) / blockWidth);
    const playerGridY = Math.floor((player.y - offsetY) / blockHeight);

    //check if both are in the same grid space
    return objGridX === playerGridX && objGridY === playerGridY;
  }
}
