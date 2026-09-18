const MOVE_DELTAS = Object.freeze({
  a: [-1, 0],
  d: [1, 0],
  w: [0, -1],
  s: [0, 1],
});

function registerOccupant(cell, occupant) {
  cell.occupants.push(occupant);
  const byType = cell.occupantsByType ??= Object.create(null);
  (byType[occupant.type] ??= []).push(occupant);

  if (occupant.type !== 0) (cell.nonPlayerOccupants ??= []).push(occupant);
}

function deregisterOccupant(cell, id, type) {
  const remove = (list) => {
    if (!list) return;
    for (let i = list.length - 1; i >= 0; i--) {
      if (list[i].id !== id) continue;
      list[i] = list[list.length - 1];
      list.pop();
      return;
    }
  };

  remove(cell.occupants);
  remove(cell.occupantsByType?.[type]);
  if (type !== 0) remove(cell.nonPlayerOccupants);
}

class Entity {
  constructor(currentLocation, speed, type, collisionCallback = () => {}, tileCallback = () => {}) {
    this.isReadytoMove = true;
    this.currentLocation = currentLocation;
    this.nextLocation = null;
    this.nextX = currentLocation.x;
    this.nextY = currentLocation.y;
    this.type = type;
    this.collisionCallback = collisionCallback;
    this.tileCallback = tileCallback;

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
    this.invalidMove = false;

    this.registerLocation(currentLocation);
  }

  move(direction = 'a') {
    if (!this.isReadytoMove) {
      this._continueMove();
      return;
    }

    const delta = MOVE_DELTAS[direction];
    if (!delta) return;

    const nx = this.currentLocation.x + delta[0];
    const ny = this.currentLocation.y + delta[1];
    const cell = mapGrid[ny]?.[nx];
    this.facing = direction;

    if (!cell?.valid && this.invalidMove) {
      this.fitnessPenalty++;
      return;
    } else if(!cell?.valid) {
      this.invalidMove = true;
      return;
    }

    this.movesTaken++;
    this.invalidMove = false;
    this.nextX = nx;
    this.nextY = ny;
    this.nextLocation = { x: nx, y: ny };
    this.tileCallback(this.nextLocation);

    // AI players need only non-player objects; enemies need only players.
    const occupants = this.type === 0 ? cell.nonPlayerOccupants : cell.occupantsByType?.[0];
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
      case 'a': this.x = this.x - step <= targetX ? targetX : this.x - step; break;
      case 'd': this.x = this.x + step >= targetX ? targetX : this.x + step; break;
      case 'w': this.y = this.y - step <= targetY ? targetY : this.y - step; break;
      case 's': this.y = this.y + step >= targetY ? targetY : this.y + step; break;
      default: return;
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
    if (cell?.occupants) registerOccupant(cell, { type: this.type, id: this.uuid });
  }

  deregisterLocation(location) {
    const cell = mapGrid[location.y]?.[location.x];
    if (cell?.occupants) deregisterOccupant(cell, this.uuid, this.type);
  }

}
