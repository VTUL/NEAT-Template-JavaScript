class Treat extends Pickup {
  static value = 100;
  constructor(sprite, width, height) {
    let location = false;
    while(!location) {
      let tempX = getRandomInt(0,15);
      let tempY = getRandomInt(0,18);
      if(typeof mapGrid[tempY]?.[tempX] !== "undefined" && mapGrid[tempY]?.[tempX]?.valid && mapGrid[tempY]?.[tempX]?.occupants.length === 0) {
        location = {
          x: tempX,
          y: tempY
        }
      }
    }

    super(location, sprite, 2, width, height)

    this.life = millis() + 15000;
  }
}
