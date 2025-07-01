class PeanutButter {
  static spawnPoints = [
    { x: 400, y: 90 },
    { x: 730, y: 800 },
    { x: 200, y: 600 },
    { x: 985, y: 700 }
  ];

  constructor() {
    let spawn = random(PeanutButter.spawnPoints); 
    this.x = spawn.x;
    this.y = spawn.y;
    this.w = 25;
    this.h = 25;

    this.life = millis() + 30000;
    this.idList = [];
  }
  show() {
    image(peanut, this.x, this.y, this.w, this.h);
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