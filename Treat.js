class Treat {
  static originalSpawnPoints = [
    //top
    { x: 500, y: 70 },
    { x: 90, y: 90 },
    { x: 290, y: 90 },
    { x: 720, y: 90 },
     { x: 905, y: 90 },
    { x: 1010, y: 90 },
    { x: 190, y: 100 },
    { x: 400, y: 100 },
    { x: 540, y: 100 },
    { x: 800, y: 100 },
    { x: 60, y: 160 },
    { x: 490, y: 160 },
    { x: 550, y: 160 },
    { x: 1020, y: 160 },
    //upper mid
    { x: 90, y: 230 },
    { x: 290, y: 230 },
    { x: 390, y: 230 },
    { x: 540, y: 200 },
    { x: 690, y: 230 },
    { x: 850, y: 230 },
    { x: 720, y: 235 },
    { x: 290, y: 235 },
    { x: 550, y: 300 },
    //mid
    { x: 550, y: 370 },
    { x: 490, y: 370 },
    { x: 720, y: 380 },
    { x: 290, y: 380 },
    { x: 90, y: 390 },
    { x: 200, y: 400 },
    { x: 800, y: 400 },
    { x: 1010, y: 400 },
    { x: 900, y: 420 },
    { x: 720, y: 440 },
    { x: 290, y: 440 },
    { x: 550, y: 450 },
    { x: 650, y: 450 },
    { x: 1020, y: 465 },
    { x: 290, y: 500 },   
    //lower mid
    { x: 290, y: 570 }, 
    { x: 90, y: 570 },
    { x: 220, y: 570 },
    { x: 1010, y: 600 },
    { x: 500, y: 630 },
    { x: 90, y: 665 },
    { x: 220, y: 665 },
    { x: 350, y: 665 },
    { x: 730, y: 700 },
    { x: 855, y: 700 },
    { x: 980, y: 700 },
    { x: 850, y: 700 },
    { x: 90, y: 730 },
    { x: 1000, y: 730 },
    { x: 450, y: 750 },
    { x: 600, y: 750 },
    //bottom
    { x: 1010, y: 800 },
    { x: 100, y: 830 },
    { x: 200, y: 830 },
    { x: 250, y: 830 },
    { x: 790, y: 830 },
    { x: 950, y: 830 },

  ];

  static spawnPoints = [...Treat.originalSpawnPoints];

  constructor() {
    let index = Math.floor(Math.random() * Treat.spawnPoints.length);
    this.spawn = Treat.spawnPoints.splice(index, 1)[0];

    this.x = this.spawn.x;
    this.y = this.spawn.y;
    this.w = 20;
    this.h = 20;
    this.life = millis() + 10000;
    this.idList = [];
  }

  show() {
    image(yum, this.x, this.y, this.w, this.h);
  }

  eaten() {
    Treat.spawnPoints.push(this.spawn);
  }

  static resetSpawns() {
    Treat.spawnPoints = [...Treat.originalSpawnPoints];
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
