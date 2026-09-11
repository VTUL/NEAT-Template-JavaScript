const MOVE_DELTAS = Object.freeze({
  a: [-1, 0],
  d: [1, 0],
  w: [0, -1],
  s: [0, 1],
});

class Entity {
  constructor(currentLocation, w, h, speed, type, collisionCallback = () => {}) {
    this.isReadytoMove = true;
    this.currentLocation = currentLocation;
    this.nextLocation = null;
    this.nextX = currentLocation.x;
    this.nextY = currentLocation.y;
    this.w = w;
    this.h = h;
    this.type = type;
    this.collisionCallback = collisionCallback;

    this.x = currentLocation.x * gridWidth;
    this.y = currentLocation.y * gridHeight;

    this.facing = null;
    this.baseSpeed = speed;
    this.boostedSpeed = 10;
    this.speed = speed;

    this.uuid = crypto.randomUUID();

    this.lastDec = null;
    this.movesWithoutTreat = 0;
    this.movesTaken = 0;
    this.fitnessPenalty = 0;

    this.registerLocation(currentLocation);
  }

  move(direction = 'a', increasePenalty = () => {}) {
    if (!this.isReadytoMove) {
      this._continueMove();
      return;
    }

    const delta = MOVE_DELTAS[direction];
    if (!delta) {
      console.error('No valid directions given');
      return;
    }

    const nx = this.currentLocation.x + delta[0];
    const ny = this.currentLocation.y + delta[1];
    const cell = mapGrid[ny]?.[nx];

    this.facing = direction;

    if (!cell?.valid) {
      this.fitnessPenalty++;
      increasePenalty();
      return;
    }

    this.movesTaken++;
    this.nextX = nx;
    this.nextY = ny;
    this.nextLocation = { x: nx, y: ny };

    const occupants = cell.occupants;
    if (occupants?.length) this.collisionCallback(occupants);

    this.lastDec = direction;
    this.isReadytoMove = false;
  }

  _continueMove() {
    if (!this.nextLocation) return;

    const targetX = this.nextX * gridWidth;
    const targetY = this.nextY * gridHeight;
    const step = this.speed;

    switch (this.lastDec) {
      case 'a':
        this.x = this.x - step <= targetX ? targetX : this.x - step;
        break;
      case 'd':
        this.x = this.x + step >= targetX ? targetX : this.x + step;
        break;
      case 'w':
        this.y = this.y - step <= targetY ? targetY : this.y - step;
        break;
      case 's':
        this.y = this.y + step >= targetY ? targetY : this.y + step;
        break;
      default:
        return;
    }

    if (this.x === targetX && this.y === targetY) {
      this.deregisterLocation(this.currentLocation);
      this.currentLocation = this.nextLocation;
      this.registerLocation(this.currentLocation);
      this.nextLocation = null;
      this.isReadytoMove = true;
    }
  }

  checkCollision(location) {
    const occupants = mapGrid[location.y]?.[location.x]?.occupants;
    return occupants?.length ? occupants : false;
  }

  registerLocation(location) {
    const cell = mapGrid[location.y]?.[location.x];
    if (!cell?.occupants) return;
    cell.occupants.push({ type: this.type, id: this.uuid });
  }

  deregisterLocation(location) {
    const occupants = mapGrid[location.y]?.[location.x]?.occupants;
    if (!occupants?.length) return;

    for (let i = occupants.length - 1; i >= 0; i--) {
      if (occupants[i].id !== this.uuid) continue;
      occupants[i] = occupants[occupants.length - 1];
      occupants.pop();
      return;
    }
  }

  getX(location) {
    return location.x * gridWidth;
  }

  getY(location) {
    return location.y * gridHeight;
  }
}
