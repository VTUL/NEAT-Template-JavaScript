class PeanutButter extends Pickup {
  static value = 5;

  constructor(sprite, width, height) {
    const location = findPickupSpawnLocation();
    super(location, sprite, 3, width, height);
    this.life = millis() + 10000;
  }
}