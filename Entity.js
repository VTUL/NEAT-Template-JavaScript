class Entity {
  constructor(currentLocation, w, h, speed, type, collisionCallback) {
    this.isReadytoMove = true;
    this.currentLocation = currentLocation;
    this.w = w
    this.h = h;
    this.nextLocation = {};
    this.type = type;
    this.collisionCallback = collisionCallback;

    this.x =
      (this.currentLocation.x * gridWidth);
    this.y =
      (this.currentLocation.y * gridHeight);

    this.facing;

    this.baseSpeed = speed;
    this.boostedSpeed = 10;
    this.speed = this.baseSpeed;

    this.uuid = crypto.randomUUID();

    this.lastDec;

    this.registerLocation(this.currentLocation);
  }

  move(direction) {
    // console.info("Type", this.type);
    // console.info("Id", this.uuid);
    // console.info("Location", this.currentLocation);
    // // console.info("direction", direction);
    if (!this.isReadytoMove) {
      // console.info("not ready to move");
      // console.info("X coordinates", this.getX(this.nextLocation))
      switch (this.lastDec) {
        case "a":
          if (this.x - this.speed <= this.getX(this.nextLocation)) {
            this.x = this.getX(this.nextLocation);
            this.isReadytoMove = true;
            this.deregisterLocation(this.currentLocation);
            this.currentLocation = this.nextLocation;
            this.registerLocation(this.currentLocation);
            this.nextLocation = {};
          } else {
            this.x = this.x - this.speed;
          }
          break;
        case "d":
          if (this.x + this.speed >= this.getX(this.nextLocation)) {
            this.x = this.getX(this.nextLocation);
            this.isReadytoMove = true;
            this.deregisterLocation(this.currentLocation);
            this.currentLocation = this.nextLocation;
            this.registerLocation(this.currentLocation);
            this.nextLocation = {};
          } else {
            this.x = this.x + this.speed;
          }
          break;
        case "w":
          if (this.y - this.speed <= this.getY(this.nextLocation)) {
            this.y = this.getY(this.nextLocation);
            this.isReadytoMove = true;
            this.deregisterLocation(this.currentLocation);
            this.currentLocation = this.nextLocation;
            this.registerLocation(this.currentLocation);
            this.nextLocation = {};
          } else {
            this.y = this.y - this.speed;
          }
          break;
        case "s":
          if (this.y + this.speed >= this.getY(this.nextLocation)) {
            this.y = this.getY(this.nextLocation);
            this.isReadytoMove = true;
            this.deregisterLocation(this.currentLocation);
            this.currentLocation = this.nextLocation;
            this.registerLocation(this.currentLocation);
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
          if (typeof mapGrid[this.currentLocation.y]?.[this.currentLocation.x - 1] !== "undefined" && mapGrid[this.currentLocation.y]?.[this.currentLocation.x - 1]?.valid) {
            this.facing = direction;
            this.nextLocation = {
              x: this.currentLocation.x - 1,
              y: this.currentLocation.y,
            };
            let collisions = this.checkCollision(this.nextLocation);
            if(collisions) {
              this.collisionCallback(collisions);
            }
            this.lastDec = "a";
            this.isReadytoMove = false;
          } else {
            // console.log("Not a valid move in the 'a' direction.")
            this.fitnessPenalty += 1;
          }
          break;
        case "d":
          if (typeof mapGrid[this.currentLocation.y]?.[this.currentLocation.x + 1] !== "undefined" && mapGrid[this.currentLocation.y]?.[this.currentLocation.x + 1]?.valid) {
            this.facing = direction;
            this.nextLocation = {
              x: this.currentLocation.x + 1,
              y: this.currentLocation.y,
            };
            let collisions = this.checkCollision(this.nextLocation);
            if(collisions) {
              this.collisionCallback(collisions);
            }
            this.lastDec = "d";
            this.isReadytoMove = false;
          } else {
            // console.log("Not a valid move in the 'd' direction.")
            this.fitnessPenalty += 1;
          }
          break;
        case "w":
          if (typeof mapGrid[this.currentLocation.y - 1]?.[this.currentLocation.x] !== "undefined" && mapGrid[this.currentLocation.y - 1]?.[this.currentLocation.x]?.valid) {
            this.facing = direction;
            this.nextLocation = {
              x: this.currentLocation.x,
              y: this.currentLocation.y - 1,
            };
            let collisions = this.checkCollision(this.nextLocation);
            if(collisions) {
              this.collisionCallback(collisions);
            }
            this.lastDec = "w";
            this.isReadytoMove = false;
          } else {
            // console.log("Not a valid move in the 'w' direction.")
            this.fitnessPenalty += 1;
          }
          break;
        case "s":
          if (typeof mapGrid[this.currentLocation.y + 1]?.[this.currentLocation.x] !== "undefined" && mapGrid[this.currentLocation.y + 1]?.[this.currentLocation.x]?.valid) {
            this.facing = direction;
            this.nextLocation = {
              x: this.currentLocation.x,
              y: this.currentLocation.y + 1,
            };
            let collisions = this.checkCollision(this.nextLocation);
            if(collisions) {
              this.collisionCallback(collisions);
            }
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

  checkCollision(location) {
    if(mapGrid[location.y][location.x].occupants.length === 0) {
      return false;      
    } else {
      return mapGrid[location.y][location.x].occupants;
    }
  }

  registerLocation(location) {
    mapGrid[location.y]?.[location.x]?.occupants.push({type: this.type, id: this.uuid})
  }

  deregisterLocation(location) {
    mapGrid[location.y][location.x].occupants = mapGrid[location.y][location.x].occupants.filter(value => { 
      return value.id !== this.uuid;
    })
  }

  getX(location) {
    return location.x * gridWidth;
  }

  getY(location) {
    return location.y * gridHeight;
  }
}