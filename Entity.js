class Entity {
  constructor(currentLocation, w, h, speed) {
    this.isReadytoMove = true;
    this.currentLocation = currentLocation;
    this.w = w
    this.h = h;
    this.nextLocation = {};

    this.x =
      this.currentLocation.x * gridWidth + gridWidth - this.w / 2;
    this.y =
      this.currentLocation.y * gridHeight + gridHeight - this.h / 2;

    this.facing = "d";

    this.baseSpeed = speed;
    this.boostedSpeed = 10;
    this.speed = this.baseSpeed;

    this.lastDec;
  }

  move(direction) {
    // // console.info("direction", direction);
    if (!this.isReadytoMove) {
      // console.info("not ready to move");
      // console.info("X coordinates", this.getX(this.nextLocation))
      switch (this.lastDec) {
        case "a":
          if (this.x - this.speed <= this.getX(this.nextLocation)) {
            this.x = this.getX(this.nextLocation);
            this.isReadytoMove = true;
            this.currentLocation = this.nextLocation;
            this.nextLocation = {};
          } else {
            this.x = this.x - this.speed;
          }
          break;
        case "d":
          if (this.x + this.speed >= this.getX(this.nextLocation)) {
            this.x = this.getX(this.nextLocation);
            this.isReadytoMove = true;
            this.currentLocation = this.nextLocation;
            this.nextLocation = {};
          } else {
            this.x = this.x + this.speed;
          }
          break;
        case "w":
          if (this.y - this.speed <= this.getY(this.nextLocation)) {
            this.y = this.getY(this.nextLocation);
            this.isReadytoMove = true;
            this.currentLocation = this.nextLocation;
            this.nextLocation = {};
          } else {
            this.y = this.y - this.speed;
          }
          break;
        case "s":
          if (this.y + this.speed >= this.getY(this.nextLocation)) {
            this.y = this.getY(this.nextLocation);
            this.isReadytoMove = true;
            this.currentLocation = this.nextLocation;
            this.nextLocation = {};
          } else {
            this.y = this.y + this.speed;
          }
          break;
      }
    } else {
      // console.info("ready to move");
      // console.info("direction", direction);
      switch (direction) {
        case "a":
          if (typeof mapGrid[this.currentLocation.y]?.[this.currentLocation.x - 1] !== "undefined" && mapGrid[this.currentLocation.y]?.[this.currentLocation.x - 1]) {
            this.facing = direction;
            this.nextLocation = {
              x: this.currentLocation.x - 1,
              y: this.currentLocation.y,
            };
            this.lastDec = "a";
            this.isReadytoMove = false;
          } else {
            // console.log("Not a valid move in the 'a' direction.")
            this.fitnessPenalty += 1;
          }
          break;
        case "d":
          if (typeof mapGrid[this.currentLocation.y]?.[this.currentLocation.x + 1] !== "undefined" && mapGrid[this.currentLocation.y]?.[this.currentLocation.x + 1]) {
            this.facing = direction;
            this.nextLocation = {
              x: this.currentLocation.x + 1,
              y: this.currentLocation.y,
            };
            this.lastDec = "d";
            this.isReadytoMove = false;
          } else {
            // console.log("Not a valid move in the 'd' direction.")
            this.fitnessPenalty += 1;
          }
          break;
        case "w":
          if (typeof mapGrid[this.currentLocation.y - 1]?.[this.currentLocation.x] !== "undefined" && mapGrid[this.currentLocation.y - 1]?.[this.currentLocation.x]) {
            this.facing = direction;
            this.nextLocation = {
              x: this.currentLocation.x,
              y: this.currentLocation.y - 1,
            };
            this.lastDec = "w";
            this.isReadytoMove = false;
          } else {
            // console.log("Not a valid move in the 'w' direction.")
            this.fitnessPenalty += 1;
          }
          break;
        case "s":
          if (typeof mapGrid[this.currentLocation.y + 1]?.[this.currentLocation.x] !== "undefined" && mapGrid[this.currentLocation.y + 1]?.[this.currentLocation.x]) {
            this.facing = direction;
            this.nextLocation = {
              x: this.currentLocation.x,
              y: this.currentLocation.y + 1,
            };
            this.lastDec = "s";
            this.isReadytoMove = false;
          } else {
            // console.log("Not a valid move in the 's' direction.")
            this.fitnessPenalty += 1;
          }
          break;
        default:
          console.error("No valid directions given");
      }
    }
  }

  getCenter(location) {
    return {
      x: getX(location),
      y: getY(location),
    };
  }

  getX(location) {
    // console.info("location", location);
    // console.info("gridWidth", gridWidth);
    return location.x * gridWidth + gridWidth;
  }

  getY(location) {
    return location.y * gridHeight + gridHeight;
  }

  getRandomIntInclusive(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); 
  }
}