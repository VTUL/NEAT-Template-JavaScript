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

    this.registerLocation();
  }

  show() {
    image(this.sprite, this.x, this.y, this.width, this.height);
  }

  registerLocation() {
    const cell = mapGrid?.[this.location.y]?.[this.location.x];
    if (cell?.occupants) {
      cell.occupants.push({ type: this.type, id: this.uuid });
    }
  }

  deregisterLocation() {
    const occupants = mapGrid?.[this.location.y]?.[this.location.x]?.occupants;
    if (!occupants?.length) return;

    for (let i = occupants.length - 1; i >= 0; i--) {
      if (occupants[i].id !== this.uuid) continue;
      occupants[i] = occupants[occupants.length - 1];
      occupants.pop();
      return;
    }
  }

  static inList(pickupId, type, playerId) {
    const list =
      type === 2 ? treats :
      type === 3 ? pb :
      type === 4 ? balls :
      type === 5 ? beds :
      null;

    if (!list) return false;

    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      if (item.uuid === pickupId) return item.idList.includes(playerId);
    }

    return false;
  }
}
