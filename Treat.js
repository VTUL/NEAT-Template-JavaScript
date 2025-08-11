class Treat {
  constructor() {
    //I wanted to m akre sure treats were evenly spread out but 
    //it might not be too different from just taking available random spawns
    let randomX;
    let randomY;
    let foundIndex;
    Treat.treatCount++;  // increment count on each new enemy
    this.i = (Treat.treatCount % 4) + 1;

    switch (this.i) {
      case 1:
        randomX = floor(random(10));
        randomY = floor(random(12));
        foundIndex = goodSpawns.findIndex(spawn => spawn.x === randomX && spawn.y === randomY);
        if (foundIndex !== -1) {
          this.spawn = goodSpawns.splice(foundIndex, 1)[0];
        }
        break;
      case 2:
        randomX = random(11, 22);
        randomY = floor(random(12));
        foundIndex = goodSpawns.findIndex(spawn => spawn.x === randomX && spawn.y === randomY);
        if (foundIndex !== -1) {
          this.spawn = goodSpawns.splice(foundIndex, 1)[0];
        }
        break;
      case 3:
        randomX = floor(random(10));
        randomY = random(13, 26);
        foundIndex = goodSpawns.findIndex(spawn => spawn.x === randomX && spawn.y === randomY);
        if (foundIndex !== -1) {
          this.spawn = goodSpawns.splice(foundIndex, 1)[0];
        }
        break;
      case 4:
        randomX = random(11, 22);
        randomY = random(13, 26);
        foundIndex = goodSpawns.findIndex(spawn => spawn.x === randomX && spawn.y === randomY);
        if (foundIndex !== -1) {
          this.spawn = goodSpawns.splice(foundIndex, 1)[0];
        }
        break;
      default:
        let randomIndex = floor(random(goodSpawns.length));
        this.spawn = goodSpawns.splice(randomIndex, 1)[0];
        break;

  }

    //let index = floor(random(goodSpawns.length));
    //let spawn = goodSpawns.splice(index, 1)[0]; // removes and returns the spawn
    //this.spawn = spawn;
    this.x = this.spawn.x * blockWidth + offsetX + blockWidth / 2;
    this.y = this.spawn.y * blockHeight + offsetY + blockHeight / 2;
    this.w = 20;
    this.h = 20;
    this.life = millis() + random(10000, 20000); //treats last between 10 and 20 seconds
    this.idList = [];
  }

  show() {
    imageMode(CENTER);  
    image(yum, this.x, this.y, this.w, this.h);
    noTint(); 
    imageMode(CORNER);
  }

  eaten() {
    goodSpawns.push(this.spawn);
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
