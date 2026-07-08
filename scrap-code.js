function gameLoop(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  const timeStep = baseTimestep / speed;

  if (
    isRunning &&
    currentGenomeIndex < population.genomes.length &&
    !gameState.gameOver
  ) {
    gameAccumulator += deltaTime;
    while (gameAccumulator >= timeStep) {
      const genomeToVisualize =
        population.genomes[Math.max(0, currentGenomeIndex - 1)];
      if (genomeToVisualize) {
        genomeToVisualize.resetState();
        const inputs = calculateInputs(gameState);
        const outputs = genomeToVisualize.propagate(inputs);

        updateGameState(gameState, outputs);
        // agentCurrentScoreEl.textContent = gameState.score;
      }
      gameAccumulator -= timeStep;
      if (gameState.gameOver) break;
    }
  } else if (gameState.gameOver) {
    gameAccumulator = 0;
  }
}