class Pickup {
  constructor(location, sprite, type, width, height) {
    this.location = location;
    this.x = location.x * gridWidth;
    this.y = location.y * gridHeight;
    this.width = width;
    this.height = height;
    this.sprite = sprite;
    this.type = type;
    this.idList = [];
    this.uuid = crypto.randomUUID();

    pickupRegistry.set(this.uuid, this);
    this.registerLocation();
  }

  show() {
    image(this.sprite, this.x, this.y, this.width, this.height);
  }

  registerLocation() {
    const cell = mapGrid?.[this.location.y]?.[this.location.x];
    if (cell?.occupants) registerOccupant(cell, { type: this.type, id: this.uuid });
  }

  deregisterLocation() {
    const cell = mapGrid?.[this.location.y]?.[this.location.x];
    if (!cell?.occupants) return;

    deregisterOccupant(cell, this.uuid, this.type);
    pickupRegistry.delete(this.uuid);
  }

  static inList(pickupId, _type, playerId) {
    return pickupRegistry.get(pickupId)?.idList.includes(playerId) ?? false;
  }
}
