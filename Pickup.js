class Pickup {
  constructor(location, sprite, type, width, height) {
    this.location = location;
    this.x = this.location.x * gridWidth;
    this.y = this.location.y * gridHeight;
    this.width = width;
    this.height = height;
    this.sprite = sprite;
    this.type = type;
    this.idList = [];
    this.uuid = crypto.randomUUID();
    this.registerLocation();
    this.show();
  }

  show() {
    imageMode(CENTER);
    image(this.sprite, this.x, this.y, this.width, this.height)
  }

  registerLocation() {
    mapGrid[this.location.y][this.location.x].occupants.push({type: this.type, id: this.uuid})
  }

  deregisterLocation() {
    mapGrid[this.location.y][this.location.x].occupants = mapGrid[this.location.y][this.location.x].occupants.filter(value => { 
      return value.id !== this.uuid;
    })
  }

  static inList(pickupId, type, playerId) {
    switch(type) {
      case 2:
        let treat = treats.find((treat) => treat.uuid === pickupId);
        return treat?.idList.includes(playerId);
        break;
      case 3:
        let peanut = pb.find((peanut) => peanut.uuid === pickupId);
        return peanut?.idList.includes(playerId);
        break;
      case 4:
        let ball = balls.find((ball) => ball.uuid === pickupId);
        return ball?.idList.includes(playerId);
        break;
      case 5:
        let bed = beds.find((bed) => bed.uuid === pickupId);
        return bed?.idList.includes(playerId);
        break;
    }

  }
}