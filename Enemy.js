const ENEMY_MOVE_ORDER = ['w', 'd', 's', 'a'];

class Enemy extends Entity {
  static enemyCount = 0;
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
      if (!collisions?.length) return;

      for (let i = 0; i < collisions.length; i++) {
        const occupant = collisions[i];
        if (occupant.type !== 0) continue;

        if (humanPlaying) {
          if (!humanPlayer?.isInvincible) humanPlayer.dead = true;
          return;
        }

        const players = population?.players;
        if (!players?.length) return;

        for (let j = 0; j < players.length; j++) {
          const player = players[j];
          if (player.uuid !== occupant.id) continue;
          if (!player.isInvincible) player.dead = true;
          return;
        }
      }
    };

    const whichWall = getRandomInt(1, 4);
    let spawnX = 0;
    let spawnY = 0;
    switch(whichWall){
      case 1:
        spawnX = 0;
        spawnY = getRandomInt(2, 17);
       break;
      case 2:
        spawnX = 15;
        spawnY = getRandomInt(2, 17);
      break;
      case 3:
        spawnX = getRandomInt(1, 14);
        spawnY = 1;
      break;
      case 4:
        spawnX = getRandomInt(1, 14);
        spawnY = 18;
    }

    super({ x: spawnX, y: spawnY }, 36, 18, 8, 1, collisionCallback);

    Enemy.enemyCount++;
    this.isActive = true;
    this.spriteLeft = Enemy.spriteLeft;
    this.spriteDown = Enemy.spriteDown;
    this.spriteRight = Enemy.spriteRight;
    this.spriteUp = Enemy.spriteUp;
    this.spawnTime = millis();
  }

  patrol() {
    this.move(ENEMY_MOVE_ORDER[(Math.random() * 4) | 0]);
  }

  show() {
    push();

    const sprite =
      this.facing === 'a' ? this.spriteLeft :
      this.facing === 'w' ? this.spriteUp :
      this.facing === 'd' ? this.spriteRight :
      this.spriteDown;

    sprite.draw(this.x, this.y);
    pop();
  }
}
