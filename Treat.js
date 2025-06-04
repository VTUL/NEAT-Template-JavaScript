class Treat {
  static spawnPoints = [
    { x: 305, y: 432 },
    { x: 812, y: 275 },
    { x: 978, y: 90 },
    { x: 450, y: 150 },
    { x: 221, y: 378 },
    { x: 643, y: 519 },
    { x: 877, y: 327 },
    { x: 313, y: 610 },
    { x: 1087, y: 205 },
    { x: 700, y: 355 },
    { x: 900, y: 575 },
    { x: 650, y: 162 },
    { x: 302, y: 476 },
    { x: 480, y: 510 },
    { x: 731, y: 399 },
    { x: 150, y: 250 },

  ];

  constructor() {
    let spawn = random(Treat.spawnPoints); 
    this.x = spawn.x;
    this.y = spawn.y;
    this.r = 5;
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
