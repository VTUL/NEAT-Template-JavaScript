let nextConnectionNo = 1000;
let population;
let trainingStepsPerFrame = 1;
const MAX_TRAINING_STEPS_PER_FRAME = 12;
const MAX_ENEMIES = 3;
const MAX_TREATS = 22;

const canStructuredClone = typeof structuredClone === 'function';
const cloneGrid = () => (canStructuredClone ? structuredClone(mapGridOriginal) : JSON.parse(JSON.stringify(mapGridOriginal)));

let mapGrid = cloneGrid();

let humanPlaying = false;
let humanPlayer = null;

let treats = [];
let enemies = [];
let beds = [];
let balls = [];
let pb = [];

let bedsRespawnTime = 0;
let PBRespawnTime = 0;
let ballRespawnTime = 0;
let deathMessageTime = 0;
let bestScoreThisGen = 0;

let bg;
let derekLeft;
let derekRight;
let derekUp;
let derekDown;
let epcotLeft;
let epcotRight;
let epcotUp;
let epcotDown;
let josieLeft;
let josieRight;
let josieUp;
let josieDown;
let squirrelUp;
let squirrelDown;
let squirrelRight;
let squirrelLeft;
let peanut;
let treat;
let bed;
let tennis;

let startWasPressed = false;
let activeGamepadIndex = null;
let brainCanvas;
let infoDiv1;
let infoDiv2;
let lastInfoUpdate = 0;

const pickupRegistry = new Map();
const playerRegistry = new Map();

const MAX_MOVES_WITHOUT_TREAT = 60;
const INFO_UPDATE_INTERVAL = 250;

const config = new Config({
  inputSize: 18,
  outputSize: 5,

  bias: 1.0,
  connectBias: true,
  biasMode: 'WEIGHTED_NODE',
  activationFunction: 'Tanh',
  weightInitialization: { type: 'Random', params: [-0.75, 0.75] },

  c1: 1.0,
  c2: 1.0,
  c3: 0.4,
  compatibilityThreshold: 0.3,
  interspeciesMatingRate: 0.07,

  mutationRate: 0.9,
  weightMutationRate: 0.85,
  addConnectionMutationRate: 0.3,
  addNodeMutationRate: 0.25,
  minWeight: -5.0,
  maxWeight: 5.0,
  reinitializeWeightRate: 0.05,
  minPerturb: -0.25,
  maxPerturb: 0.25,

  populationSize: 500,
  generations: 10000,
  targetFitness: 10000,
  survivalRate: 0.25,
  numOfElite: 5,
  dropOffAge: 25,
  populationStagnationLimit: 50,
  keepDisabledOnCrossOverRate: 0.75,
  mutateOnlyProb: 0.35,

  allowRecurrentConnections: true,
  recurrentConnectionRate: 0.15,
});

function preload() {
  bg = loadImage('images/library_map (1).png');
  squirrelLeft = loadImage('spriteSheets/EnemyLeft.png');
  squirrelDown = loadImage('spriteSheets/EnemyDown.png');
  squirrelRight = loadImage('spriteSheets/EnemyRight.png');
  squirrelUp = loadImage('spriteSheets/EnemyUp.png');
  treat = loadImage('images/Treat_Dark_Outline.png');
  peanut = loadImage('images/Peanut_Butter.png');
  derekLeft = loadImage('spriteSheets/DerekLeft.png');
  derekUp = loadImage('spriteSheets/DerekUp.png');
  derekDown = loadImage('spriteSheets/DerekDown.png');
  derekRight = loadImage('spriteSheets/DerekRight.png');
  epcotLeft = loadImage('spriteSheets/EpcotLeft.png');
  epcotUp = loadImage('spriteSheets/EpcotUp.png');
  epcotDown = loadImage('spriteSheets/EpcotDown.png');
  epcotRight = loadImage('spriteSheets/EpcotRight.png');
  josieLeft = loadImage('spriteSheets/JosieLeft.png');
  josieUp = loadImage('spriteSheets/JosieUp.png');
  josieDown = loadImage('spriteSheets/JosieDown.png');
  josieRight = loadImage('spriteSheets/JosieRight.png');
  bed = loadImage('images/Dog_Bed-1.png.png');
  tennis = loadImage('images/Ball-1.png.png');
}

function setup() {
  const canvas = createCanvas(screenWidth, screenHeight);
  canvas.parent('canvasContainer');

  population = new Pool(config);
  resetGame(true);
  frameRate(60);

  brainCanvas = document.getElementById('brain');
  infoDiv1 = document.getElementById('gameInfo1');
  infoDiv2 = document.getElementById('gameInfo2');

  window.addEventListener('gamepadconnected', (e) => {
    activeGamepadIndex = e.gamepad.index;
  });
}

function draw() {
  const now = millis();
  background(255);
  if (bg) image(bg, 0, 0, width, height);

  if (humanPlaying) {
    updateWorld(now);
    showHumanPlaying();
  } else {
    // Run simulation independently of browser paint rate. Rendering occurs
    // once below, even when several AI ticks run in this frame.
    for (let step = 0; step < trainingStepsPerFrame; step++) {
      updateWorld(millis() * trainingStepsPerFrame);

      if (population.done()) {
        const generationComplete = population.finishEpisode();

        if (generationComplete) {
          population.evolve();
          population.startGeneration();
          resetGame(true);
          visualizeGenome(population.getBestGenome(), brainCanvas);
        } else {
          resetGame();
        }
        break;
      }

      population.updateAlive();
    }
  }

  renderWorld();

  if (!humanPlaying) population.show();
  if (humanPlaying && humanPlayer?.stamina !== undefined) drawStaminaBar(humanPlayer);

  if (deathMessageTime !== 0 && now - deathMessageTime < 2000) {
    fill(255);
    textAlign(CENTER, TOP);
    textSize(60);
    text('You Got Distracted!', 540, 460);
  }

  const gp = getActiveGamepad();
  if (gp && gp.buttons?.length > 9) {
    const startPressed = !!gp.buttons[9].pressed;
    if (startPressed && !startWasPressed) toggleHumanPlay();
    startWasPressed = startPressed;
  }

  if (now - lastInfoUpdate >= INFO_UPDATE_INTERVAL) {
    writeInfo();
    lastInfoUpdate = now;
  }
}

function updateWorld(now) {
  handleRespawns(now);
  for (let i = 0; i < enemies.length; i++) enemies[i].patrol();
}

function renderWorld() {
  for (let i = 0; i < treats.length; i++) treats[i].show();
  if (pb.length) pb[0].show();
  if (beds.length) beds[0].show();
  if (balls.length) balls[0].show();
  for (let i = 0; i < enemies.length; i++) enemies[i].show();
}

function getActiveGamepad() {
  const pads = navigator.getGamepads?.();
  if (!pads) return null;
  return pads[activeGamepadIndex ?? 0] ?? null;
}

function handleRespawns(now) {
  if (pb.length < 1 && now > PBRespawnTime) {
    pb.push(new PeanutButter(peanut, 24, 24));
    PBRespawnTime = now + 10000;
  }

  if (beds.length === 0 && now > bedsRespawnTime) {
    beds.push(new DogBed(bed, 48, 48));
    bedsRespawnTime = now + 20000;
  }

  if (balls.length === 0 && now > ballRespawnTime) {
    balls.push(new TennisBall(tennis, 16, 16));
    ballRespawnTime = now + 25000;
  }

  if (treats.length < MAX_TREATS) treats.push(new Treat(treat, 20, 20));

  for (let i = treats.length - 1; i >= 0; i--) {
    if (treats[i].life < now) {
      treats[i].deregisterLocation();
      treats.splice(i, 1);
    }
  }

  for (let i = pb.length - 1; i >= 0; i--) {
    if (pb[i].life < now) {
      pb[i].deregisterLocation();
      pb.splice(i, 1);
    }
  }

  for (let i = beds.length - 1; i >= 0; i--) {
    if (beds[i].life < now) {
      beds[i].deregisterLocation();
      beds.splice(i, 1);
    }
  }

  for (let i = balls.length - 1; i >= 0; i--) {
    if (balls[i].life < now) {
      balls[i].deregisterLocation();
      balls.splice(i, 1);
    }
  }
}

function drawStaminaBar(player) {
  const barWidth = 200;
  const barHeight = 20;
  const staminaRatio = constrain(player.stamina / player.maxStamina, 0, 1);

  push();
  noStroke();
  fill(50);
  rect(20, 20, barWidth, barHeight);
  fill(0, 200, 255);
  rect(20, 20, barWidth * staminaRatio, barHeight);
  stroke(255);
  noFill();
  rect(20, 20, barWidth, barHeight);
  pop();
}

// function drawGrid() {
//   stroke(100);
//   strokeWeight(1);

//   for (let x = -(gridWidth / 2); x <= (screenWidth + gridWidth / 2); x += gridWidth) {
//     line(x, -(gridWidth / 2), x, screenHeight + (gridWidth / 2));
//   }
//   for (let y = -(gridHeight / 2); y <= (screenHeight + gridHeight / 2); y += gridHeight) {
//     line(-(gridHeight / 2), y, screenWidth + (gridHeight / 2), y);
//   }
// }

function writeInfo() {
  for (let i = 0; i < population.players.length; i++) {
    bestScoreThisGen = Math.max(bestScoreThisGen, population.players[i].score);
  }

  let info1 = '';
  let info2 = '';
  info1 += 'Best Score this Gen: ' + bestScoreThisGen + '<br>';
  info2 += 'Generation: ' + (population.generation + 1) + '<br>';
  info2 += 'Episode: ' + population.currentEpisode + ' / ' + EPISODES_PER_GENERATION + '<br>';
  info1 += 'Species: ' + population.species.length + '<br>';
  info1 += 'Global Best Score: ' + population.globalBestScore + '<br>';
  if(trainingStepsPerFrame > 1) info2 += 'Training steps/frame: ' + trainingStepsPerFrame + '<br>';

  if (infoDiv1) infoDiv1.innerHTML = info1;
  if (infoDiv2) infoDiv2.innerHTML = info2;
}

function keyPressed() {
  switch (key) {
    case 'I':
      trainingStepsPerFrame = Math.min(trainingStepsPerFrame + 1, MAX_TRAINING_STEPS_PER_FRAME);
      break;
    case 'U':
      trainingStepsPerFrame = Math.max(trainingStepsPerFrame - 1, 1);
      break;
    case 'P':
      toggleHumanPlay();
      break;
  }

  switch (keyCode) {
    case UP_ARROW:
      if (humanPlaying) humanPlayer.move('w');
      break;
    case DOWN_ARROW:
      if (humanPlaying) humanPlayer.move('s');
      break;
    case LEFT_ARROW:
      if (humanPlaying) humanPlayer.move('a');
      break;
    case RIGHT_ARROW:
      if (humanPlaying) humanPlayer.move('d');
      break;
  }
}

function showHumanPlaying() {
  if (!humanPlayer) return;

  if (!humanPlayer.dead) {
    humanPlayer.update();
    humanPlayer.show();
  } else {
    humanPlaying = false;
    deathMessageTime = millis();
  }
}

function clearMapOccupants() {
  for (let y = 0; y < mapGrid.length; y++) {
    const row = mapGrid[y];
    for (let x = 0; x < row.length; x++) {
      const cell = row[x];
      if (!cell) continue;
      if (cell.occupants) cell.occupants.length = 0;
      if (cell.nonPlayerOccupants) cell.nonPlayerOccupants.length = 0;
      if (cell.occupantsByType) {
        for (const occupants of Object.values(cell.occupantsByType)) occupants.length = 0;
      }
    }
  }
}

function resetGame(resetGenerationStats = false) {
  clearMapOccupants();
  if (resetGenerationStats) bestScoreThisGen = 0;

  treats.length = 0;
  enemies.length = 0;
  beds.length = 0;
  balls.length = 0;
  pb.length = 0;
  pickupRegistry.clear();

  beds.push(new DogBed(bed, 48, 48));
  balls.push(new TennisBall(tennis, 16, 16));
  pb.push(new PeanutButter(peanut, 24, 24));

  const now = millis() * trainingStepsPerFrame;
  bedsRespawnTime = now + 9000;
  ballRespawnTime = now + 12000;
  PBRespawnTime = now + 10000;

  for (let i = 0; i < MAX_TREATS; i++) treats.push(new Treat(treat, 20, 20));
  for (let i = 0; i < MAX_ENEMIES; i++) enemies.push(new Enemy());

  const genomes = population.genomes;
  const players = population.players;
  players.length = genomes.length;

  for (let i = 0; i < genomes.length; i++) {
    if (players[i]) players[i].reset(genomes[i]);
    else players[i] = new Player(genomes[i]);
  }
}

function findPickupSpawnLocation() {
  const emptyCells = [];
  const validCells = [];

  for (let y = 0; y < mapGrid.length; y++) {
    const row = mapGrid[y];
    for (let x = 0; x < row.length; x++) {
      const cell = row[x];
      if (!cell?.valid) continue;

      const location = { x, y };
      validCells.push(location);
      if (cell.occupants.length === 0) emptyCells.push(location);
    }
  }

  const candidates = emptyCells.length ? emptyCells : validCells;
  if (!candidates.length) throw new Error('The map has no valid cell for a pickup.');
  return candidates[(Math.random() * candidates.length) | 0];
}

function getRandomInt(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);
}

function toggleHumanPlay() {
  resetGame();
  humanPlaying = !humanPlaying;
  if (humanPlaying) {
    humanPlayer = humanPlayer instanceof Player ? humanPlayer.reset() : new Player();
  } else {
    humanPlayer = null;
  }
}
