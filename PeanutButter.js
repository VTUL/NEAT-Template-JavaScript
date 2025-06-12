class PeanutButter {
  static spawnPoints = [
    { x: 460, y: 150 },
    { x: 700, y: 800 },
    { x: 180, y: 600 },
    { x: 990, y: 770 }
  ];

  constructor() {
    let spawn = random(PeanutButter.spawnPoints); 
    this.x = spawn.x;
    this.y = spawn.y;
    this.w = 18;
    this.h = 20;
  }
  show() {
      fill(135, 77, 21);
      noStroke();
      rect(this.x, this.y, this.w, this.h);
  }

checkCollision(player) {
  // Assuming this object and player have x, y, w, h (x,y = top-left corner)
  let thisLeft = this.x;
  let thisRight = this.x + this.w;
  let thisTop = this.y;
  let thisBottom = this.y + this.h;

  let playerLeft = player.x;
  let playerRight = player.x + player.w;
  let playerTop = player.y;
  let playerBottom = player.y + player.h;

  // Check if rectangles overlap on x and y axes
  let overlapX = thisRight > playerLeft && thisLeft < playerRight;
  let overlapY = thisBottom > playerTop && thisTop < playerBottom;

  return overlapX && overlapY;
}


}