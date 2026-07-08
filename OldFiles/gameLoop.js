var speed = 30;

let mapGrid = JSON.parse(JSON.stringify(mapGridOriginal));

var showBest = false; //true if only show the best of the previous generation
var runBest = false; //true if replaying the best ever game
var humanPlaying = false; //true if the user is playing
var humanPlayer;

var showBrain = false;
var showBestEachGen = false;
var upToGen = 0;
var genPlayerTemp; //player

var showNothing = false;
let treats = [];
let enemies = [];
let beds = [];
let balls = [];
let bedsRespawnTime = 0;
let treatRemoveTime = 0;
let ballRespawnTime = 0;
let PBRespawnTime = 0;
let enemyRespawnTime = 0;
let deathMessageTime = 0;
let introTime = 0;
let pb = [];

//images
var bg;
var blockImg;
var derekLeft;
var derekRight;
var derekUp;
var derekDown;
var epcotLeft;
var epcotRight;
var epcotUp;
var epcotDown;
var josieLeft;
var josieRight;
var josieUp;
var josieDown;
var acorn;
var squirrelUp;
var squirrelDown;
var squirrelRight;
var squirrelLeft;
var peanut;
var treat;
var bed;
var tennis;
var arrow;

let occupantList = ["player", "enemy", "treat", "peanut", "bed", "tennis"];

let pendingReset = false;
let startWasPressed = false;
let activeGamepadIndex = null;

let bWasPressed = false;
let rightStickCooldown = 0;

function preload() {
  bg = loadImage("images/library_map (1).png");
  blockImg = loadImage("images/square.png");
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
  arrow = loadImage("images/red-pixel-arrow.png"); //stand in
}

function setupCanvas() {
  let canvas = createCanvas(screenWidth, screenHeight);
  canvas.parent("canvasContainer");

  resetGame();
  introTime = millis() + 3000;
  frameRate(speed);
}

function draw() {
  drawEnvironment();
  drawGrid();

  handleRespawns(); //handle respawning of items

  //move and show enemies, remove inactive

  drawToScreen();

  if (showBestEachGen) {
    //show the best of each gen
    showBestPlayersForEachGeneration();
  } else if (humanPlaying) {
    //if the user is controling the ship
    showHumanPlaying();
  } else if (runBest) {
    //if replaying the best ever game
    showBestEverPlayer();
  } else {
    //if just evolving normally
    if (!population.done()) {
      //if any players are alive then update them
      population.updateAlive();
      for (let i = 0; i < population.players.length; i++) {
        if (!population.players[i].dead) {
          //handleInteractions(population.players[i]);
        }
      }
    } else {
      //all dead
      //genetic algorithm
      population.naturalSelection();
      resetGame(); //reset the game state for the next generation
    }
  }
  // drawGrid();

  if (humanPlaying && humanPlayer && humanPlayer.stamina !== undefined) {
    drawStaminaBar(humanPlayer);
  } else if (
    showBestEachGen &&
    genPlayerTemp &&
    genPlayerTemp.stamina !== undefined
  ) {
    drawStaminaBar(genPlayerTemp);
  } else if (
    !humanPlaying &&
    showBest &&
    !showBestEachGen &&
    population.players[0] &&
    population.players[0].stamina !== undefined
  ) {
    //default what viewer first sees
    drawStaminaBar(population.players[0]);
  }

  if (millis() - deathMessageTime < 2000 && deathMessageTime !== 0) {
    fill(255);
    textAlign(CENTER, TOP);
    textSize(60);
    text("You Got Distracted!", 540, 460);
  }
}

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

function resetGame() {
  mapGrid = JSON.parse(JSON.stringify(mapGridOriginal));

  treats = [];
  enemies = [];
  beds = [];
  balls = [];
  pb = [];

  treats.length = 0;
  enemies.length = 0;

  beds.push(new DogBed(bed, 48, 48));
  balls.push(new TennisBall(tennis, 16, 16));
  pb.push(new PeanutButter(peanut, 24, 24));

  //reset timers for collectible respawns
  bedsRespawnTime = millis() + 20000; //dog bed in 20 seconds
  ballRespawnTime = millis() + 40000; //TennisBall in 40 seconds
  PBRespawnTime = millis() + 60000; //peanut butter in 60 seconds

  enemyRespawnTime = millis() + 5000; //enemies every 5 seconds
  treatRemoveTime = millis() + 1000; //treats removed after 1 second

  for (let i = 0; i < 25; i++) {
    treats.push(new Treat(treat, 20, 20));
  }

  for (let i = 0; i < 5; i++) {
    enemies.push(new Enemy());
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
  humanPlayer = new Player();
}



// DRAW FUNCTIONS



function drawGrid() {
  // console.info("mapgrid", mapGrid);
  stroke(100);
  strokeWeight(1);

  //vertical lines
  for (
    let x = -(gridWidth / 2);
    x <= screenWidth + gridWidth / 2;
    x += gridWidth
  ) {
    line(x, -(gridWidth / 2), x, screenHeight + gridWidth / 2);
  }

  //horizontal lines
  for (
    let y = -(gridHeight / 2);
    y <= screenHeight + gridHeight / 2;
    y += gridHeight
  ) {
    line(-(gridHeight / 2), y, screenWidth + gridHeight / 2, y);
  }

  noStroke();
}

function drawStaminaBar(player) {
  let barWidth = 200;
  let barHeight = 20;
  let staminaRatio = player.stamina / player.maxStamina;

  fill(50);
  rect(20, 20, barWidth, barHeight);

  fill(0, 200, 255);
  rect(20, 20, barWidth * staminaRatio, barHeight);

  stroke(255);
  noFill();
  rect(20, 20, barWidth, barHeight);
}

function drawEnvironment() {
background(255);

  //add treats/collectibles to the screen
  if (bg) {
    imageMode(CORNER);
    image(bg, 0, 0, width, height); 
  }
}

function drawEntities() {
for (let i = enemies.length - 1; i >= 0; i--) {
    enemies[i].patrol();
    enemies[i].show();
  }
}

function drawPickups() {
for (let i = 0; i < treats.length; i++) {
    treats[i].show();
  }

  if (beds?.length >= 1) {
    beds[0].show();
  }

  if (balls?.length >= 1) {
    balls[0].show();
  }
}

function drawToScreen() {
  if (!showNothing) {
    //pretty stuff
    // drawBrain();
    // writeInfo();
  }
}
