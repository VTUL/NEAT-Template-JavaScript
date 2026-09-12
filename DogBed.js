class DogBed extends Pickup {
  constructor(sprite, width, height) {
    const location = findPickupSpawnLocation();
    super(location, sprite, 4, width, height);
    this.life = millis() + 15000;
  }
}
