class TennisBall {
  static originalSpawnPoints = [
    { x: 200, y: 215 },
    { x: 750, y: 80 },
    { x: 800, y: 570 },
    { x: 102, y: 830 }
  ];

   static spawnPoints = [...TennisBall.originalSpawnPoints];

  constructor() {
    let spawn = random(TennisBall.spawnPoints); 
    this.x = spawn.x;
    this.y = spawn.y;
    this.r = 7.5;

    this.life = millis() + 30000;
    this.idList = [];
  }

  show() {
    fill(123, 245, 60);
    noStroke();
    image(bed, this.x, this.y, this.r*5, this.r*5);
  }

  static resetSpawns() {
    TennisBall.spawnPoints = [...TennisBall.originalSpawnPoints];
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
