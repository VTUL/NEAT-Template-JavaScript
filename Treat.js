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
    this.w = 20;
    this.h = 20;
  }


  show() {
      image(yum, this.x, this.y, this.w, this.h);
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
