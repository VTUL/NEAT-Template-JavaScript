class TennisBall {
  // Originally named/planned to be a "TennisBall" item, but is now sunglasses.
  static originalSpawnPoints = [
    { x: 180, y: 400 },
    { x: 920, y: 600 },
    { x: 600, y: 640 },
    { x: 800, y: 240 }
  ];

  static originalGridSpawn = [
    { x: 4, y: 4 },
    //{ x: 19, y: 18 },
    //{ x: 10, y: 19 },
    //{ x: 17, y: 8 }
  ];

  //static spawnPoints = [...TennisBall.originalSpawnPoints];
  static gridSpawn = [...TennisBall.originalGridSpawn];

  constructor() {
  // let spawn = random(TennisBall.gridSpawn);
  //this.x = spawn.x * blockWidth + offsetX + blockWidth / 2;
  //this.y = spawn.y * blockHeight + offsetY + blockHeight / 2;

    this.r = 7.5;
    this.life = millis() + 15000;
    this.idList = [];

    let index = floor(random(goodSpawns.length));
    let spawn = goodSpawns.splice(index, 1)[0]; // removes and returns the spawn
    this.spawn = spawn;
    this.x = spawn.x * blockWidth + offsetX + blockWidth / 2;
    this.y = spawn.y * blockHeight + offsetY + blockHeight / 2;

}


  show() {
    fill(120, 40, 255);
    noStroke();
    image(tennis, this.x - this.r, this.y - this.r, this.r*2, this.r*2);
  }

  static resetSpawns() {
    //goodSpawns.push(this.spawn)
  }

  eaten() {
    goodSpawns.push(this.spawn);
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
