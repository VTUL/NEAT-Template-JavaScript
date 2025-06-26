class Bandana {
  static spawnPoints = [
    { x: 180, y: 400 },
    { x: 920, y: 600 },
    { x: 600, y: 640 },
    { x: 800, y: 240 }
  ];

  constructor() {
    let spawn = random(Bandana.spawnPoints);
    this.x = spawn.x;
    this.y = spawn.y;
    this.r = 7.5;
  }

  show() {
    fill(120, 40, 255);
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
