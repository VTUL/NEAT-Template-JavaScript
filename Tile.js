class Tile {
  
  //-------------------------------------------------------------------------------------------------------------------------------------------
  //constructor
  constructor(x, y) {
    this.pos = new PVector(x, y);
    this.wall = false;
    this.dot = false;
    this.bigDot = false;
    this.eaten = false;
  }
  //-----------------------------------------------------------------------------------------------------------------------------------------------
  //draw a dot if there is one in this tile
  show() {
    rectMode(CENTER);
    if (dot) {
      if (!eaten) {//draw dot
        fill(255, 255, 0);
        noStroke();
        rect(pos.x, pos.y, 4, 4);
      }
    } else if (bigDot) {
      if (!eaten) {//draw big dot
        fill(255, 255, 0);
        noStroke();
        if (bigDotsActive) {
          rect(pos.x, pos.y, 9, 9);
        } else {
          rect(pos.x, pos.y, 4, 4);
        }
      }
    }
  }
//-------------------------------------------------------------------------------------------------------------------------------------------------------
//returns a copy of this tile
  clone() {
    clone = new Tile(pos.x, pos.y);
    clone.wall = wall;
    clone.dot = dot;
    clone.bigDot  = bigDot;
    clone.eaten = eaten;
    return clone;
  }
}