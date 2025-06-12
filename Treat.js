class Treat {
  static spawnPoints = [
    { x: 370, y: 470 },
    { x: 812, y: 300 },
    { x: 880, y: 150 },
    { x: 450, y: 150 },
    { x: 221, y: 378 },
    { x: 730, y: 519 },
    { x: 877, y: 347 },
    { x: 313, y: 680 },
    { x: 970, y: 205 },
    { x: 730, y: 355 },
    { x: 890, y: 575 },
    { x: 650, y: 182 },
    { x: 302, y: 550 },
    { x: 480, y: 790 },
    { x: 100, y: 450 },
    { x: 80, y: 750 },

  ];

  constructor() {
    let spawn = random(Treat.spawnPoints); 
    this.x = spawn.x;
    this.y = spawn.y;
    this.r = 8;
  }


  show() {
      fill(255, 193, 0);
      noStroke();
      ellipse(this.x, this.y, this.r * 2);
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
