function Block(x, y) {
  this.x = x;
  this.y = y;
  this.w = 50; // width of block
  this.h = 35; // height of block

  this.show = function () {
    image(blockImg, this.x, this.y, this.w, this.h);
  };

  this.intersects = function (other) {
    //circle-rectangle collision (e.g. Treat or Enemy)
    if (other.r !== undefined) {
      let closestX = constrain(other.x, this.x, this.x + this.w);
      let closestY = constrain(other.y, this.y, this.y + this.h);
      let dx = other.x - closestX;
      let dy = other.y - closestY;
      let distanceSq = dx * dx + dy * dy;
      return distanceSq < other.r * other.r;

    //rectangle-rectangle collision (e.g. Player)
    } else if (other.w !== undefined && other.h !== undefined) {
      return !(
        other.x + other.w < this.x ||
        other.x > this.x + this.w ||
        other.y + other.h < this.y ||
        other.y > this.y + this.h
      );
    }

    return false;
  };
}
