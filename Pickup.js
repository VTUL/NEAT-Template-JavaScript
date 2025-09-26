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

  deregisterLocation(location) {
    mapGrid[location.y][location.x].occupants = mapGrid[location.y][location.x].occupants.filter(value => { 
      return value.id !== this.uuid;
    })
  }
}