class TennisBall {
  constructor() {
    //random position on the screen
    this.x = random(width);
    this.y = random(height);
    this.r = 10;
    this.collected = false;
  }

  show() {
    if (!this.collected) {
      fill(123, 245, 60);
      noStroke();
      ellipse(this.x, this.y, this.r * 2);
    }
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
