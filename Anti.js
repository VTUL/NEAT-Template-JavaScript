class Anti {
  constructor(x,y) {; 
    this.x = x;
    this.y = y;
    this.r = 7.5;

    this.life = millis() + 10000;
    this.idList = [];

    this.playInvin = false;
  }


  show() {
    imageMode(CENTER);
    image(acorn, this.x, this.y, this.r * 2, this.r * 2);
    imageMode(CORNER);
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