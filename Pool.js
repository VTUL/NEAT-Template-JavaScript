class Pool extends Population {
  constructor(config) {
    super(config);
    this.players = [];
    this.globalBestScore = 0;

    for (let i = 0; i < config.populationSize; i++) {
      this.players.push(new Player(this.genomes[i]));
    }
  }

  updateAlive() {
    for (let i = 0; i < this.players.length; i++) {
      const player = this.players[i];
      if (player.dead) continue;

      if (player.isReadytoMove) {
        player.look();
        player.think();
      } else {
        player.move();
      }

      player.update();
      if (player.score > this.globalBestScore) this.globalBestScore = player.score;
    }
  }

  show() {
    for (let i = 0; i < this.players.length; i++) {
      const player = this.players[i];
      if (!player.dead) player.show();
    }
  }

  done() {
    for (let i = 0; i < this.players.length; i++) {
      if (!this.players[i].dead) return false;
    }
    return true;
  }

  calculateFitness() {
    for (let i = 0; i < this.players.length; i++) {
      this.players[i].calculateFitness();
    }
  }
}
