class Treat {
  constructor() {
    this.r = 10;
    this.collected = false;

    // Try to find a position not colliding with any block
    let tries = 0;
    do {
      this.x = random(this.r, width - this.r);
      this.y = random(this.r, height - this.r);
      tries++;
      if (tries > 100) {
        // Give up after 100 tries to avoid infinite loop
        break;
      }
    } while (this.collidesWithBlocks());
  }

  collidesWithBlocks() {
    // For each block, check if circle overlaps rectangle
    for (let block of blocks) {
      // block assumed to have x, y, w, h
      // Circle-rectangle collision test:
      let closestX = constrain(this.x, block.x, block.x + block.w);
      let closestY = constrain(this.y, block.y, block.y + block.h);

      let dx = this.x - closestX;
      let dy = this.y - closestY;
      let distSq = dx * dx + dy * dy;

      if (distSq < this.r * this.r) {
        return true; // collision found
      }
    }
    return false; // no collision
  }

  show() {
    if (!this.collected) {
      fill(70, 91, 214);
      noStroke();
      ellipse(this.x, this.y, this.r * 2);
    }
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
