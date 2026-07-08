Object.assign(window, NEATJavaScript);

let mapGrid = JSON.parse(JSON.stringify(mapGridOriginal));
let speed = 30;

const config = new Config({
  inputSize: 29,
  outputSize: 5,

  activationFunction: "Tanh",

  bias: 1.0,
  connectBias: true,

  populationSize: 250,
  generations: 5000,
  targetFitness: 100000,
  survivalRate: 0.2,

  mutationRate: 0.8,
  addConnectionMutationRate: 0.05,
  addNodeMutationRate: 0.03,
  numOfElite: 25,
  dropOffAge: 15,

  c1: 1.0,
  c2: 1.0,
  c3: 0.4,
  compatibilityThreshold: 3.0,

  allowRecurrentConnections: true,
});

let population;
let generation = 0;
let currentGenomeIndex = 0;
let bestGenome = null;
let bestScore = 0;
let bestFitness = 0;

let bg;
let blockImg;
let derekLeft;
let derekRight;
let derekUp;
let derekDown;
let epcotLeft;
let epcotRight
let epcotUp;
let epcotDown;
let josieLeft;
let josieRight
let josieUp;
let josieDown;
let acorn;
let squirrelUp;
let squirrelDown;
let squirrelRight;
let squirrelLeft;
let peanut;
let treat;
let bed;
let tennis;
let arrow;

let treats = [];
let enemies = []; 
let beds = [];
let balls = [];
let bedsRespawnTime = 0;
let treatRemoveTime = 0; 
let ballRespawnTime = 0;
let enemyRespawnTime = 0;
let PBRespawnTime = 0;
let deathMessageTime = 0;
let introTime = 0;
let pb = [];

let occupantList = ["player", "enemy", "treat", "peanut", "bed", "tennis"];

let gameState;

// const startButton = document.getElementById("start-evolution");
// const stopButton = document.getElementById("stop-evolution");

// const saveGenomeButton = document.getElementById("save-genome");

// const generationCount = document.getElementById("generation-count");
// const bestFitnessEl = document.getElementById("best-fitness");
// const bestScoreEl = document.getElementById("best-score");
// const avgFitnessEl = document.getElementById("avg-fitness");
// const speciesCountEl = document.getElementById("species-count");
// const bestCurrentScoreEl = document.getElementById("best-current-score");
// const agentCurrentScoreEl = document.getElementById("agent-current-score");
// const inputVisualization = document.getElementById("input-visualization");

let showBest = false;
let runBest = false;
let showBestEachGen = false;
let showNothing = true;
let humanPlaying = false; //true if the user is playing
let humanPlayer;
let isRunning = false;
let evolutionInterval;
let lastTime = 0;
let gameAccumulator = 0;
const baseTimestep = 1000 / 10;
const MAX_MOVES_WITHOUT_TREAT = 400;

function setup() {
  bg = loadImage("images/library_map (1).png");
  acorn = loadImage("images/Acorn_Item.png");
  squirrelLeft = loadImage("spriteSheets/EnemyLeft.png");
  squirrelDown = loadImage("spriteSheets/EnemyDown.png");
  squirrelRight = loadImage("spriteSheets/EnemyRight.png");
  squirrelUp = loadImage("spriteSheets/EnemyUp.png");
  treat = loadImage("images/Treat_Dark_Outline.png");
  peanut = loadImage("images/Peanut_Butter.png");
  derekLeft = loadImage("spriteSheets/DerekLeft.png");
  derekUp = loadImage("spriteSheets/DerekUp.png");
  derekDown = loadImage("spriteSheets/DerekDown.png");
  derekRight = loadImage("spriteSheets/DerekRight.png");
  epcotLeft = loadImage("spriteSheets/EpcotLeft.png");
  epcotUp = loadImage("spriteSheets/EpcotUp.png");
  epcotDown = loadImage("spriteSheets/EpcotDown.png");
  epcotRight = loadImage("spriteSheets/EpcotRight.png");
  josieLeft = loadImage("spriteSheets/JosieLeft.png");
  josieUp = loadImage("spriteSheets/JosieUp.png");
  josieDown = loadImage("spriteSheets/JosieDown.png");
  josieRight = loadImage("spriteSheets/JosieRight.png");
  bed = loadImage("images/Dog_Bed-1.png.png");
  tennis = loadImage("images/Ball-1.png.png");

  let canvas = createCanvas(screenWidth, screenHeight);
  canvas.parent("canvasContainer");
  
  gameState = createGameState();
  introTime = millis() + 3000; 
  frameRate(speed);
}

function resetGame() {
  console.log("Resetting GameState");

  initGameState(gameState);
  isRunning = true;
  runEvolution();
}

function createGameState() {
  return {
    player: new Player(),
    score: 0,
    moves: 0,
    movesWithoutTreat: 0,
    gameOver: false,
    inputs: new Array(29).fill(0),
    outputs: [0, 0, 0, 0, 0],
  };
}

function initGameState(state) {
  state.player.x = 9;
  state.player.y = 8;
  state.score = 0;
  state.moves = 0;
  state.movesWithoutTreat = 0;
  state.gameOver = false;
  state.inputs = new Array(29).fill(0);
  state.outputs = [0, 0, 0, 0, 0];
}

function calculateInputs(state) {
  const inputs = new Array(29).fill(0);
  const player = state.player;

  inputs[0] = checkWall(1, player);
  inputs[1] = checkWall(2, player);
  inputs[2] = checkWall(3, player);
  inputs[3] = checkWall(4, player);
  inputs[4] = checkOther(1, 1, player);
  inputs[5] = checkOther(2, 1, player);
  inputs[6] = checkOther(3, 1, player);
  inputs[7] = checkOther(4, 1, player);
  inputs[8] = checkOther(1, 2, player);
  inputs[9] = checkOther(2, 2, player);
  inputs[10] = checkOther(3, 2, player);
  inputs[11] = checkOther(4, 2, player);
  inputs[12] = checkOther(1, 3, player);
  inputs[13] = checkOther(2, 3, player);
  inputs[14] = checkOther(3, 3, player);
  inputs[15] = checkOther(4, 3, player);
  inputs[16] = checkOther(1, 4, player);
  inputs[17] = checkOther(2, 4, player);
  inputs[18] = checkOther(3, 4, player);
  inputs[19] = checkOther(4, 4, player);
  inputs[20] = checkOther(1, 5, player);
  inputs[21] = checkOther(2, 5, player);
  inputs[22] = checkOther(3, 5, player);
  inputs[23] = checkOther(4, 5, player);
  inputs[24] = checkDownArea(player);
  inputs[25] = checkRightArea(player);
  inputs[26] = 100 / state.player.stamina;
  inputs[27] = 5 / state.player.speed;
  inputs[28] = state.player.isInvincible ? 1 : 0;

  state.inputs = inputs;
  return inputs;
}

function checkWall(direction, player) {
  for (let steps = 1; steps <= 19; steps++) {
    let tempX;
    let tempY;
    switch (direction) {
      case 1:
        tempX = 0;
        tempY = 0 - steps;
        break;
      case 2:
        tempX = steps;
        tempY = 0;
        break;
      case 3:
        tempX = 0;
        tempY = steps;
        break;
      case 4:
        tempX = 0 - steps;
        tempY = 0;
        break;
    }
    if (
      typeof mapGrid[player.currentLocation.y + tempY]?.[
        player.currentLocation.x + tempX
      ] === "undefined" ||
      !mapGrid[player.currentLocation.y + tempY]?.[player.currentLocation.x + tempX]
        ?.valid
    ) {
      return 1 / steps;
    }
  }
}

function checkOther(direction, target, player) {
  for (let steps = 1; steps <= 19; steps++) {
    let tempX;
    let tempY;
    switch (direction) {
      case 1:
        tempX = 0;
        tempY = 0 - steps;
        break;
      case 2:
        tempX = steps;
        tempY = 0;
        break;
      case 3:
        tempX = 0;
        tempY = steps;
        break;
      case 4:
        tempX = 0 - steps;
        tempY = 0;
        break;
    }
    if (
      typeof mapGrid[player.currentLocation.y + tempY]?.[
        player.currentLocation.x + tempX
      ] === "undefined" ||
      !mapGrid[player.currentLocation.y + tempY]?.[player.currentLocation.x + tempX]
        ?.valid
    ) {
      return 0;
    } else if (
      mapGrid[player.currentLocation.y + tempY]?.[
        player.currentLocation.x + tempX
      ]?.occupants.some((occupant) => occupant.type === target) &&
      !mapGrid[player.currentLocation.y + tempY]?.[
        player.currentLocation.x + tempX
      ]?.occupants.some((occupant) =>
        Pickup.inList(occupant.id, occupant.type, player.uuid),
      )
    ) {
      return 1 / steps;
    }
  }
}

function checkDownArea(player) {
  for (let rows = player.currentLocation.y + 1; rows <= gridRows; rows++) {
    for (let steps = 1; steps <= gridColumns - 1; steps++) {
      if (rows >= gridRows) {
        return 0;
      } else if (
        mapGrid[rows]?.[steps]?.occupants.some(
          (occupant) => occupant.type === 2,
        ) &&
        !mapGrid[rows]?.[steps]?.occupants.some((occupant) =>
          Pickup.inList(occupant.id, occupant.type, player.uuid),
        )
      ) {
        return 1;
      }
    }
  }
}

function checkRightArea(player) {
  for (
    let columns = player.currentLocation.x + 1;
    columns <= gridColumns;
    columns++
  ) {
    for (let steps = 1; steps <= gridRows - 1; steps++) {
      if (columns >= gridColumns) {
        return 0;
      } else if (
        mapGrid[steps]?.[columns]?.occupants.some(
          (occupant) => occupant.type === 2,
        ) &&
        !mapGrid[steps]?.[columns]?.occupants.some((occupant) =>
          Pickup.inList(occupant.id, occupant.type, player.uuid),
        )
      ) {
        return 1;
      }
    }
  }
}

function updateGameState(state, outputs) {
  console.log("moves: ", state.moves);
  state.moves++;
  state.movesWithoutTreat++;

  state.outputs = outputs;

  const maxOutput = Math.max(...outputs.slice(0, -1));
  const decision = outputs.indexOf(maxOutput);
  console.log("Maxoutputs: ", maxOutput);
  console.log("decision: ", decision);

  let directions = ["w", "d", "s", "a"];
  state.player.move(directions[decision]);
  state.player.show();

  if (state.movesWithoutTreat > MAX_MOVES_WITHOUT_TREAT) {
    state.gameOver = true;
  }
}

function draw() {
  console.log("Draw Call");
  if(!isRunning) return;
  background("#000000");

  if (bg) {
    imageMode(CORNER);
    image(bg, 0, 0, width, height); 
  }

  for (let i = 0; i < treats.length; i++) {
    treats[i].show();
  }

  if (beds?.length >= 1) {
    beds[0].show();
  }

  if (balls?.length >= 1) {
    balls[0].show();
  }

  handleRespawns(); //handle respawning of items
  
  //move and show enemies, remove inactive
  for (let i = enemies.length - 1; i >= 0; i--) {
    enemies[i].patrol();
    enemies[i].show();

    // if (!enemies[i].isActive) {
    //   enemies.splice(i, 1); //0.1% chance to disappear
    // }
  }
  
  console.log("gameState.player: ", gameState.player)
  gameState.player.show();

  if (
    isRunning &&
    !gameState.gameOver
  ) {
      const inputs = calculateInputs(gameState);
      const outputs = population.genomes[0].propagate(inputs);

      console.log("outputs: ", outputs)

      updateGameState(gameState, outputs);
      // agentCurrentScoreEl.textContent = gameState.score;
    }
    else if (gameState.gameOver) {
    isRunning = false;
  }

  console.log("gameState: ", gameState);

  //lets player know if AI is playing
  // if (!humanPlaying) {
    noStroke();
    fill(0);
    textAlign(CENTER, TOP); 
    textSize(32);
    text("AI Playing", 540, 15);
  // }  

  drawToScreen();

  // if (showBestEachGen) { //show the best of each gen
  //   showBestPlayersForEachGeneration();
  // } else if (humanPlaying) { //if the user is controling the ship
  //   showHumanPlaying();
  // } else if (runBest) { //if replaying the best ever game
  //   showBestEverPlayer();
  // } else { //if just evolving normally
  //   if (!population.done()) { //if any players are alive then update them
  //     population.updateAlive();
  //     for (let i = 0; i < population.players.length; i++) {
  //       if (!population.players[i].dead) {
  //         //handleInteractions(population.players[i]);
  //       }
  //     }
  //   } else { //all dead
  //     //genetic algorithm
  //     population.naturalSelection();
  //     resetGame(); //reset the game state for the next generation
  //   }
  // }
  // drawGrid(); 

  // if (humanPlaying && humanPlayer && humanPlayer.stamina !== undefined) {
  //   drawStaminaBar(humanPlayer);
  // }
  // else if(showBestEachGen && genPlayerTemp && genPlayerTemp.stamina !== undefined) {
  //   drawStaminaBar(genPlayerTemp);
  // }
  // else if(!humanPlaying && showBest && !showBestEachGen && population.players[0] && population.players[0].stamina !== undefined) {
  //   //default what viewer first sees
  //   drawStaminaBar(population.players[0]);
  // }

  // if (millis() - deathMessageTime < 2000 && deathMessageTime !== 0) {
  //   fill(255);
  //   textAlign(CENTER, TOP); 
  //   textSize(60);
  //   text("You Got Distracted!", 540, 460);
  // }

  //handle gamepad input for toggling human play - mapping to button 9 (Start on Xbox controller)
  // const gp = navigator.getGamepads()?.[activeGamepadIndex ?? 0];
  // if (gp && gp.buttons?.length > 9) {
  //   const startPressed = gp.buttons[9].pressed;

  //   if (startPressed && !startWasPressed) {
  //     toggleHumanPlay();
  //   }

  //   startWasPressed = startPressed;
  // }
}

function initPopulation() {
  population = new Population(config);
  generation = 0;
  currentGenomeIndex = 0;
  bestGenome = null;
  bestScore = 0;
  bestFitness = 0;

  // initGameState(gameState);
  updateStats();
}

function evaluateGenome(genome) {
  // initGameState(gameState);
  genome.resetState();

  let fitness = gameState.score * 10;
  fitness += gameState.moves / 100;

  if (gameState.score === 0) {
    fitness = gameState.moves / 200;
  }

  genome.fitness = fitness;

  if (
    genome.fitness > bestFitness ||
    (genome.fitness === bestFitness && gameState.score > bestScore) ||
    (gameState.maxScoreReached && !bestGameState.maxScoreReached)
  ) {
    bestFitness = genome.fitness;
    bestScore = gameState.score;

    bestGenome = genome.copy();
  }

  return genome.fitness;
}

function runEvolution() {
  if (!isRunning) return;
  // console.log("value of population: ", population);

  const batchSize = 5;
  let evaluatedCount = 0;

  while (
    evaluatedCount < batchSize &&
    currentGenomeIndex < population.genomes.length
  ) {
    const currentGenome = population.genomes[currentGenomeIndex];
    evaluateGenome(currentGenome);
    currentGenomeIndex++;
    evaluatedCount++;
  }

  if (currentGenomeIndex >= population.genomes.length) {
    population.evolve();
    generation++;
    currentGenomeIndex = 0;
    updateStats();
  }

  setTimeout(runEvolution, 0);
}

function updateStats() {
  // generationCount.textContent = generation;
  // bestFitnessEl.textContent = bestFitness.toFixed(2);
  // bestScoreEl.textContent = bestScore;

  if (population && population.genomes.length > 0) {
    const avgFitness =
      population.genomes.reduce(
        (sum, genome) => sum + (genome.fitness || 0),
        0,
      ) / population.genomes.length;
    // avgFitnessEl.textContent = avgFitness.toFixed(2);
    // speciesCountEl.textContent = population.species.length;
  } else {
    // avgFitnessEl.textContent = "0.00";
    // speciesCountEl.textContent = "0";
  }

  // bestCurrentScoreEl.textContent = bestGameState.score;
}

function visualizeInputs(state) {
  // inputVisualization.innerHTML = "";

  // const inputNames = [
  //   "Obs F",
  //   "Obs L",
  //   "Obs R",
  //   "Tail F",
  //   "Tail L",
  //   "Tail R",
  //   "Food→",
  //   "Food↓",
  //   "Dir ↑",
  //   "Dir →",
  //   "Dir ↓",
  // ];

  // if (!state.inputs || state.inputs.length !== 11) {
  //   for (let i = 0; i < 11; i++) {
  //     const inputBox = document.createElement("div");
  //     inputBox.className = "input-box";
  //     const inputName = document.createElement("div");
  //     inputName.className = "input-name";
  //     inputName.textContent = inputNames[i] || `In ${i}`;
  //     const inputValueEl = document.createElement("div");
  //     inputValueEl.className = "input-value";
  //     inputValueEl.textContent = "N/A";
  //     inputBox.appendChild(inputName);
  //     inputBox.appendChild(inputValueEl);
  //     inputVisualization.appendChild(inputBox);
  //   }
  //   return;
  // }

  // for (let i = 0; i < state.inputs.length; i++) {
  //   const inputValue = state.inputs[i];
  //   const inputBox = document.createElement("div");
  //   inputBox.className = "input-box";

  //   const intensity = Math.min(1, Math.max(0, Math.abs(inputValue)));
  //   let bgColor = "#f0f0f0";

  //   if (i < 3) {
  //     bgColor =
  //       inputValue > 0
  //         ? `rgba(255, 100, 100, 0.8)`
  //         : `rgba(100, 255, 100, 0.3)`;
  //   } else if (i < 6) {
  //     bgColor = `rgba(255, ${Math.floor(200 * (1 - intensity))}, ${Math.floor(200 * (1 - intensity))}, 0.8)`;
  //   } else if (i < 8) {
  //     bgColor =
  //       inputValue > 0
  //         ? `rgba(150, 150, 255, 0.8)`
  //         : `rgba(200, 200, 255, 0.3)`;
  //   } else {
  //     bgColor =
  //       inputValue > 0
  //         ? `rgba(100, 220, 220, 0.8)`
  //         : `rgba(180, 240, 240, 0.3)`;
  //   }

  //   inputBox.style.backgroundColor = bgColor;

  //   const inputName = document.createElement("div");
  //   inputName.className = "input-name";
  //   inputName.textContent = inputNames[i] || `Input ${i}`;
  //   const inputValueEl = document.createElement("div");
  //   inputValueEl.className = "input-value";
  //   inputValueEl.textContent = inputValue.toFixed(2);

  //   inputBox.appendChild(inputName);
  //   inputBox.appendChild(inputValueEl);
  //   inputVisualization.appendChild(inputBox);
  // }

  // if (state.outputs && state.outputs.length === 3) {
  //   const outputNames = ["Straight", "Left", "Right"];
  //   for (let i = 0; i < 3; i++) {
  //     const outputValue = state.outputs[i];
  //     const outputBox = document.createElement("div");
  //     outputBox.className = "input-box";
  //     const intensity = Math.min(1, Math.max(0, outputValue));
  //     const gray = Math.floor(255 * (1 - intensity));
  //     outputBox.style.backgroundColor = `rgb(${gray}, ${gray}, ${gray})`;
  //     outputBox.style.color = intensity > 0.5 ? "white" : "black";
  //     outputBox.style.border =
  //       outputValue === Math.max(...state.outputs)
  //         ? "2px solid #27ae60"
  //         : "1px solid #ccc";

  //     const outputName = document.createElement("div");
  //     outputName.className = "input-name";
  //     outputName.textContent = outputNames[i];
  //     const outputValueEl = document.createElement("div");
  //     outputValueEl.className = "input-value";
  //     outputValueEl.textContent = outputValue.toFixed(2);

  //     outputBox.appendChild(outputName);
  //     outputBox.appendChild(outputValueEl);
  //     inputVisualization.appendChild(outputBox);
  //   }
  // }
}

// startButton.addEventListener("click", () => {
//   if (!isRunning) {
//     isRunning = true;
//     startButton.disabled = true;
//     stopButton.disabled = false;
//     console.log("Starting evolution...");
//     runEvolution();
//   }
// });

// stopButton.addEventListener("click", () => {
//   if (isRunning) {
//     isRunning = false;
//     startButton.disabled = false;
//     stopButton.disabled = true;
//     console.log("Stopping evolution...");
//   }
// });

// saveGenomeButton.addEventListener("click", () => {
//   if (!bestGenome) {
//     console.error("No best genome available to save.");
//     alert("No best genome has been found yet. Run the evolution for a bit.");
//     return;
//   }

//   try {
//     const genomeData = bestGenome.toJSON();
//     const genomeJsonString = JSON.stringify(genomeData, null, 2);
//     const blob = new Blob([genomeJsonString], {
//       type: "application/json",
//     });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `best_snake_genome_gen_${generation}_score_${bestScore}.json`;
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//     URL.revokeObjectURL(url);
//     console.log("Best genome saved successfully.");
//   } catch (error) {
//     console.error("Error saving genome:", error);
//     alert("An error occurred while trying to save the genome.");
//   }
// });

function handleRespawns() {
  //respawn Peanut Butter if missing and timer passed
  if (pb?.length < 1 && millis() > PBRespawnTime) {
    pb.push(new PeanutButter(peanut, 24, 24));
    PBRespawnTime = millis() + 60000;
  }

  if (pb?.length >= 1) {
    pb[0].show();
  }

   //respawn beds if it was collected and 10 seconds passed
  if (beds.length === 0 && millis() > bedsRespawnTime) {
    beds.push(new DogBed(bed, 48, 48));
    bedsRespawnTime = millis() + 20000;
  }

  //respawn TennisBall if it was collected and 30 seconds passed
  if (balls.length === 0 && millis() > ballRespawnTime) {
    balls.push(new TennisBall(tennis, 16, 16));
    ballRespawnTime = millis() + 40000;
  }

   //respawn enemies if killed and 5 seconds passed
 if (millis() > enemyRespawnTime && enemies.length < 10) {
    enemies.push(new Enemy());
    enemyRespawnTime = millis() + 5000; 
  }

  //respawn treats 
 if (treats.length < 15) {
    treats.push(new Treat(treat, 20, 20));
  }

  //remove expired anti items
  // for (let i = anti.length - 1; i >= 0; i--) {
  //   if (anti[i].life < millis()) {
  //     anti.splice(i, 1);
  //   }
  // }
  //remove expired treats causes game to crash

  for (let i = 0; i < treats.length; i++) {
    if (treats[i].life < millis()) {
      treats[i].deregisterLocation();
      treats.splice(i, 1);
    }
  }

    //remove expired peanut butter
  for (let i = pb.length - 1; i >= 0; i--) {
    if (pb[i].life < millis()) {
      pb[i].deregisterLocation();
      pb.splice(i, 1);
    }
  }

  //remove expired beds
  for (let i = beds.length - 1; i >= 0; i--) {
    if (beds[i].life < millis()) {
      beds[i].deregisterLocation();
      beds.splice(i, 1);
    }
  }

  //remove expired tennis balls
  for (let i = balls.length - 1; i >= 0; i--) {
    if (balls[i].life < millis()) {
      balls[i].deregisterLocation();
      balls.splice(i, 1);
    }
  }

}

function getRandomInt(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); 
}

function drawToScreen() {
  // if (!showNothing) {
    //pretty stuff
    // drawBrain();
    // writeInfo();
  // }
}

window.addEventListener("load", () => {
  console.log("Page loaded. Initializing...");

  initPopulation();
  resetGame();
});
