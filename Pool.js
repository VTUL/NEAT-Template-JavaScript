const EPISODES_PER_GENERATION = 3;

function robustFitness(episodeScores) {  
  return episodeScores.reduce((sum, score) => sum + score, 0) / episodeScores.length;
}

class Pool extends Population {
  constructor(config) {
    super(config);
    this.players = [];
    this.globalBestScore = 0;
    this.currentEpisode = 1;
    this.episodeScores = Array.from(
      { length: config.populationSize },
      () => [],
    );

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

  recordEpisodeScores() {
    for (let i = 0; i < this.players.length; i++) {
      this.episodeScores[i].push(this.players[i].getFitnessScore());
    }
  }

  finishEpisode() {
    this.recordEpisodeScores();

    if (this.currentEpisode < EPISODES_PER_GENERATION) {
      this.currentEpisode++;
      return false;
    }

    this.calculateFitness();
    return true;
  }

  calculateFitness() {
    for (let i = 0; i < this.genomes.length; i++) {
      const scores = this.episodeScores[i];
      if (scores.length !== EPISODES_PER_GENERATION) {
        throw new Error(
          `Genome ${i} has ${scores.length} episode scores; expected ${EPISODES_PER_GENERATION}.`,
        );
      }
      this.genomes[i].fitness = robustFitness(scores);
    }
  }

  startGeneration() {
    this.currentEpisode = 1;
    this.episodeScores = Array.from(
      { length: this.genomes.length },
      () => [],
    );
  }
}
