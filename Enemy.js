const ENEMY_MOVE_ORDER = ['w', 'd', 's', 'a'];

class Enemy extends Entity {
  static _spritesReady = false;
  static spriteLeft = null;
  static spriteDown = null;
  static spriteRight = null;
  static spriteUp = null;

  static initSprites() {
    if (Enemy._spritesReady) return;
    Enemy._spritesReady = true;
    Enemy.spriteLeft = new Sprite(squirrelLeft, 48, 24, 3);
    Enemy.spriteDown = new Sprite(squirrelDown, 24, 48, 4);
    Enemy.spriteRight = new Sprite(squirrelRight, 48, 24, 3);
    Enemy.spriteUp = new Sprite(squirrelUp, 24, 48, 4);
  }

  constructor() {
    Enemy.initSprites();
    const collisionCallback = (collisions) => {
      for (let i = 0; i < collisions.length; i++) {
        const occupant = collisions[i];
        if (occupant.type !== 0) continue;

        if (humanPlaying) {
          if (!humanPlayer?.isInvincible) humanPlayer.dead = true;
          return;
        }

        const player = playerRegistry.get(occupant.id);
        if (player && !player.isInvincible) player.dead = true;
        return;
      }
    };

    const whichWall = getRandomInt(1, 4);
    let spawnX = 0;
    let spawnY = 0;
    switch (whichWall) {
      case 1: spawnX = 3; spawnY = getRandomInt(3, 14); break;
      case 2: spawnX = 12; spawnY = getRandomInt(3, 14); break;
      case 3: spawnX = getRandomInt(3, 12); spawnY = 3; break;
      case 4: spawnX = getRandomInt(3, 12); spawnY = 14; break;
    }

    // console.log(`x: ${spawnX} and y: ${spawnY}`)

    super({ x: spawnX, y: spawnY }, 36, 18, 8, 1, collisionCallback);
    this.isActive = true;
    this.spriteLeft = Enemy.spriteLeft;
    this.spriteDown = Enemy.spriteDown;
    this.spriteRight = Enemy.spriteRight;
    this.spriteUp = Enemy.spriteUp;
    this.spawnTime = millis() * trainingStepsPerFrame;
  }

  patrol() {
    this.move(ENEMY_MOVE_ORDER[(Math.random() * 4) | 0]);
  }

  show() {
    push();
    const sprite = this.facing === 'a' ? this.spriteLeft : this.facing === 'w' ? this.spriteUp : this.facing === 'd' ? this.spriteRight : this.spriteDown;
    sprite.draw(this.x, this.y);
    pop();
  }
}
