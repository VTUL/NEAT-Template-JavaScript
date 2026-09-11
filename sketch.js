let nextConnectionNo = 1000;
let population;
let speed = 30;

const canStructuredClone = typeof structuredClone === 'function';
const cloneGrid = () => (canStructuredClone ? structuredClone(mapGridOriginal) : JSON.parse(JSON.stringify(mapGridOriginal)));

let mapGrid = cloneGrid();

let humanPlaying = false;
let humanPlayer = null;

let showNothing = false;
let treats = [];
let enemies = [];
let beds = [];
let balls = [];
let pb = [];

let bedsRespawnTime = 0;
let PBRespawnTime = 0;
let treatRemoveTime = 0;
let ballRespawnTime = 0;
let enemyRespawnTime = 0;
let deathMessageTime = 0;
let introTime = 0;
let bestScoreThisGen = 0;

let bg;
let blockImg;
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

let occupantList = ['player', 'enemy', 'treat', 'peanut', 'bed', 'tennis'];

let wall;
let blocks = [];
let pendingReset = false;
let startWasPressed = false;
let activeGamepadIndex = null;
let accordionIndex = 0;
let bWasPressed = false;
let rightStickCooldown = 0;
let brainCanvas;
let infoDiv1;
let infoDiv2;
let lastInfoUpdate = 0;
let lastInfo1 = '';
let lastInfo2 = '';

const MAX_MOVES_WITHOUT_TREAT = 35;
const INFO_UPDATE_INTERVAL = 250;

const config = new Config({
  inputSize: 23,
  outputSize: 5,
  activationFunction: 'Tanh',
  weightInitialization: { type: 'Random', params: [-1, 1] },
  mutationRate: 1.0,
  weightMutationRate: 0.8,
  addConnectionMutationRate: 0.05,
  addNodeMutationRate: 0.03,
  minWeight: -4.0,
  maxWeight: 4.0,
  reinitializeWeightRate: 0.1,
  minPerturb: -0.5,
  maxPerturb: 0.5,
  populationSize: 300,
  generations: 1000,
  targetFitness: 1000,
  survivalRate: 0.2,
  numOfElite: 15,
  dropOffAge: 15,
  populationStagnationLimit: 15,
  keepDisabledOnCrossOverRate: 0.75,
  mutateOnlyProb: 0.25,
  allowRecurrentConnections: true,
  recurrentConnectionRate: 1.0
});

function preload() {
  bg = loadImage('images/library_map (1).png');
  blockImg = loadImage('images/square.png');
  acorn = loadImage('images/Acorn_Item.png');
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
  arrow = loadImage('images/red-pixel-arrow.png');
}

function setup() {
  const canvas = createCanvas(screenWidth, screenHeight);
  canvas.parent('canvasContainer');

  population = new Pool(config);
  resetGame();
  introTime = millis() + 3000;
  frameRate(speed);

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

  for (let i = 0, len = treats.length; i < len; i++) treats[i].show();
  if (beds.length >= 1) beds[0].show();
  if (balls.length >= 1) balls[0].show();

  handleRespawns(now);

  for (let i = enemies.length - 1; i >= 0; i--) {
    enemies[i].patrol();
    enemies[i].show();
  }

  // if (!humanPlaying) {
  //   noStroke();
  //   fill(0);
  //   textAlign(CENTER, TOP);
  //   textSize(32);
  //   text('AI Playing', 540, 15);
  // }

  drawToScreen(now);

  if (humanPlaying) {
    showHumanPlaying();
  } else if (!population.done()) {
    population.updateAlive();
  } else {
    population.calculateFitness();
    population.evolve();
    resetGame();
    visualizeGenome(population.getBestGenome(), brainCanvas);
  }

  if (humanPlaying && humanPlayer && humanPlayer.stamina !== undefined) {
    drawStaminaBar(humanPlayer);
  }

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

function getActiveGamepad() {
  const pads = navigator.getGamepads?.();
  if (!pads) return null;
  return pads[activeGamepadIndex ?? 0] ?? null;
}

function handleRespawns(now) {
  if (pb.length < 1 && now > PBRespawnTime) {
    pb.push(new PeanutButter(peanut, 24, 24));
    PBRespawnTime = now + 5000;
  }
  if (pb.length >= 1) pb[0].show();

  if (beds.length === 0 && now > bedsRespawnTime) {
    beds.push(new DogBed(bed, 48, 48));
    bedsRespawnTime = now + 20000;
  }

  if (balls.length === 0 && now > ballRespawnTime) {
    balls.push(new TennisBall(tennis, 16, 16));
    ballRespawnTime = now + 25000;
  }

  if (now > enemyRespawnTime && enemies.length < 7) {
    enemies.push(new Enemy());
    enemyRespawnTime = now + 5000;
  }

  if (treats.length < 25) treats.push(new Treat(treat, 20, 20));

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

function drawGrid() {
  stroke(100);
  strokeWeight(1);

  for (let x = -(gridWidth / 2); x <= (screenWidth + gridWidth / 2); x += gridWidth) {
    line(x, -(gridWidth / 2), x, screenHeight + (gridWidth / 2));
  }
  for (let y = -(gridHeight / 2); y <= (screenHeight + gridHeight / 2); y += gridHeight) {
    line(-(gridHeight / 2), y, screenWidth + (gridHeight / 2), y);
  }
}

function drawToScreen(now) {
  if (!showNothing) {
    writeInfo(now);
  }
}

function writeInfo() {
  let currentBestScore = bestScoreThisGen;
  for (let i = 0; i < population.players.length; i++) {
    if (population.players[i].score > bestScoreThisGen) {
      bestScoreThisGen = population.players[i].score;
    }
  }

  if (currentBestScore >= bestScoreThisGen) return;

  let info1 = '';
  let info2 = '';
  info1 += 'Best Score this Gen: ' + bestScoreThisGen + '<br>';
  info2 += 'Generation: ' + (population.generation + 1) + '<br>';
  info2 += 'Species: ' + population.species.length + '<br>';
  info1 += 'Global Best Score: ' + population.globalBestScore + '<br>';

  if (infoDiv1) infoDiv1.innerHTML = info1;
  if (infoDiv2) infoDiv2.innerHTML = info2;
}

function keyPressed() {
  switch (key) {
    case 'I':
      speed = frameRate() + 30;
      frameRate(speed);
      break;
    case 'U':
      if (speed > 40) {
        speed = frameRate() - 30;
        frameRate(speed);
      }
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
    humanPlayer.look();
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
      if (cell?.occupants) cell.occupants.length = 0;
    }
  }
}

function resetGame() {
  clearMapOccupants();
  bestScoreThisGen = 0;

  treats.length = 0;
  enemies.length = 0;
  beds.length = 0;
  balls.length = 0;
  pb.length = 0;

  beds.push(new DogBed(bed, 48, 48));
  balls.push(new TennisBall(tennis, 16, 16));
  pb.push(new PeanutButter(peanut, 24, 24));

  const now = millis();
  bedsRespawnTime = now + 20000;
  ballRespawnTime = now + 40000;
  PBRespawnTime = now + 60000;
  enemyRespawnTime = now + 5000;
  treatRemoveTime = now + 1000;

  for (let i = 0; i < 25; i++) treats.push(new Treat(treat, 20, 20));
  for (let i = 0; i < 5; i++) enemies.push(new Enemy());

  const genomes = population.genomes;
  const players = population.players;
  players.length = genomes.length;

  for (let i = 0; i < genomes.length; i++) {
    if (players[i]) players[i].reset(genomes[i]);
    else players[i] = new Player(genomes[i]);
  }
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
