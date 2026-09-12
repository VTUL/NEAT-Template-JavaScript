class Pool extends Population {
  constructor(config) {
    super(config);
    this.players = [];
    this.bestScore = 0;
    this.globalBestScore = 0;

    for (let i = 0; i < config.populationSize; i++) {
      this.players.push(new Player(this.genomes[i]));
    }
  }

  updateAlive() {
    const players = this.players;

    for (let i = 0, len = players.length; i < len; i++) {
      const player = players[i];
      if (player.dead) continue;

      if (player.isReadytoMove) {
        player.look();
        player.think();
      } else {
        player.move();
      }

      player.update();

      player.show();

      if (player.score > this.globalBestScore) {
        this.globalBestScore = player.score;
      }
    }
  }

  done() {
    const players = this.players;
    for (let i = 0, len = players.length; i < len; i++) {
      if (!players[i].dead) return false;
    }
    return true;
  }

  calculateFitness() {
    const players = this.players;
    for (let i = 0, len = players.length; i < len; i++) {
      players[i].calculateFitness();
    }
  }
}
