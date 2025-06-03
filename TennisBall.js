class TennisBall {
  static spawnPoints = [
    { x: 200, y: 150 },
    { x: 700, y: 100 },
    { x: 600, y: 450 },
    { x: 1000, y: 200 }
  ];

  constructor() {
    let spawn = random(TennisBall.spawnPoints); 
    this.x = spawn.x;
    this.y = spawn.y;
    this.r = 5;
  }

  show() {
    fill(123, 245, 60);
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
