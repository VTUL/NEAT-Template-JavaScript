class Treat {
  static spawnPoints = [
    { x: 90, y: 90 },
    { x: 290, y: 230 },
    { x: 290, y: 500 },
    { x: 550, y: 450 },
    { x: 900, y: 420 },
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
