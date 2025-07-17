class Anti {
  constructor(x,y) {; 
    this.x = x;
    this.y = y;
    this.r = 7.5;

    this.life = millis() + 8000;
    this.idList = [];

    this.playInvin = false;
  }


  show() {
    image(acorn, this.x, this.y, this.r * 2, this.r * 2);
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
}