class PeanutButter extends Pickup {
  static value = 1000;
  constructor(sprite, width, height) {
    let location = false;
    while(!location) {
      let tempX = getRandomInt(0,15);
      let tempY = getRandomInt(0,18);
      if(typeof mapGrid[tempY]?.[tempX] !== "undefined" && mapGrid[tempY]?.[tempX]?.valid) {
        location = {
          x: tempX,
          y: tempY
        }
      }
    }

    super(location, sprite, 3, width, height)

    this.life = millis() + 15000;
  }
}