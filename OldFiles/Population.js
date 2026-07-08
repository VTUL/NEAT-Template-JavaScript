class PlayerPopulation extends Population {
  constructor(config) {
    super(config);
    this.players = []; //new ArrayList<Player>();
    this.bestPlayer; //the best ever player
    this.bestScore = 0; //the score of the best ever player
    this.globalBestScore = 0;
    this.gen = 1;

    for (var i = 0; i < size; i++) {
      this.players.push(new Player());
      this.players[this.players.length - 1].brain.mutate(
        this.innovationHistory,
      );
      this.players[this.players.length - 1].brain.generateNetwork();
    }
  }
  updateAlive() {
    for (var i = 0; i < this.players.length; i++) {
      if (!this.players[i].dead) {
        this.players[i].look(); //get inputs for brain
        this.players[i].think(); //use outputs from neural network
        this.players[i].update(); //move the player according to the outputs from the neural network
        if (!showNothing && (!showBest || i == 0)) {
          this.players[i].show();
        }
        if (this.players[i].score > this.globalBestScore) {
          this.globalBestScore = this.players[i].score;
        }
      }
    }
  }

  done() {
    for (var i = 0; i < this.players.length; i++) {
      if (!this.players[i].dead) {
        return false;
      }
    }
    return true;
  }

  setBestPlayer() {
    var tempBest = this.species[0].players[0];
    tempBest.gen = this.gen;

    if (tempBest.score >= this.bestScore) {
      this.genPlayers.push(tempBest.cloneForReplay());
      console.log("old best: " + this.bestScore);
      console.log("new best: " + tempBest.score);
      this.bestScore = tempBest.score;
      this.bestPlayer = tempBest.cloneForReplay();
    }
  }

  calculateFitness() {
    for (var i = 1; i < this.players.length; i++) {
      this.players[i].calculateFitness();
    }
  }
}
