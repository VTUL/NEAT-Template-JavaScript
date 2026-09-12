class TennisBall extends Pickup {
  constructor(sprite, width, height) {
    const location = findPickupSpawnLocation();
    super(location, sprite, 5, width, height);
    this.life = millis() + 15000;
  }
}