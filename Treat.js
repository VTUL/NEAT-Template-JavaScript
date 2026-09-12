class Treat extends Pickup {
  static value = 1;

  constructor(sprite, width, height) {
    const location = findPickupSpawnLocation();
    super(location, sprite, 2, width, height);
    this.life = millis() + 10000;
  }
}
