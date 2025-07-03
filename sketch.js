var nextConnectionNo = 1000;
var population;
var speed = 60;

var showBest = false; //true if only show the best of the previous generation
var runBest = false; //true if replaying the best ever game
var humanPlaying = false; //true if the user is playing

var humanPlayer;

var showBrain = true;
var showBestEachGen = false;
var upToGen = 0;
var genPlayerTemp; //player

var showNothing = false; 
let treats = [];
let enemies = []; 
let anti = [];
let balls = [];
let bandanas = [];
let ballsRespawnTime = 0;
let treatRespawnTime = 0;
let PBRespawnTime = 0;
let bandanaRespawnTime = 0;
let enemyRespawnTime = 0;
let pb = [];
var bg;
var blockImg;
var dog;
var acorn;
var squirrel;
var peanut;
var yum;
let wall;
let blocks = [];


//--------------------------------------------------------------------------------------------------------------------------------------------------
function preload(){
  bg = loadImage("images/Library_Map.png");
  blockImg = loadImage("images/square.png");
  acorn = loadImage("images/Acorn_Item.png");
  squirrel = loadImage("spriteSheets/Enemy_Side_Template.png");
  yum = loadImage("images/Dog_Treat.png");
  peanut = loadImage("images/Peanut_Butter.png");
  dog = loadImage("spriteSheets/Dog_template_smaller.png");
}

//--------------------------------------------------------------------------------------------------------------------------------------------------
function setup() {
  let canvas = createCanvas(1080, 900);
  canvas.parent("canvasContainer");

  population = new Population(100);

  wall = new Wall(MAP_DATA); //map for collisions

  let blockSize = 10;
  let wallWidth = wall.getColumns() * blockSize;
  let wallHeight = wall.getRows() * blockSize;
  let offsetX = (width - wallWidth) / 2;
  let offsetY = (height - wallHeight) / 2;

  for (let i = 0; i < wall.getRows(); i++) {
    for (let j = 0; j < wall.getColumns(); j++) {
      if (wall.getElement(i, j) === '*') {
        blocks.push(new Block(j * blockSize + offsetX, i * blockSize + offsetY));
      }
    }
  }

  resetGameState();
  
}

function resetGameState() {
  treats = [];
  enemies = [];
  balls = [];
  bandanas = [];
  pb = [];

  for (let i = 0; i < 20; i++) {
    treats.push(new Treat());
  }

  balls.push(new TennisBall());
  bandanas.push(new Bandana());
  pb.push(new PeanutButter());

  ballRespawnTime = millis() + 10000;
  bandanaRespawnTime = millis() + 20000;
  PBRespawnTime = millis() + 60000;

  for (let i = 0; i < 5; i++) {
    enemies.push(new Enemy());
  }
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function draw() {
  frameRate(30)
  background(255);

//add treats/collectibles to the screen
  if (bg) {
    image(bg, 0, 0, width, height); 
  }

  for(var i = 0; i < blocks.length; i++)
    blocks[i].show();


  for (let i = 0; i < treats.length; i++) {
    treats[i].show();
  }

  if (balls?.length >= 1) {
    balls[0].show();
  }

  if (bandanas?.length >= 1) {
    bandanas[0].show();
  }

  if (pb?.length < 1 && millis() > PBRespawnTime) {
    pb.push(new PeanutButter());
    PBRespawnTime = millis() + 60000;
  }

  if (pb?.length >= 1) {
    pb[0].show();
  }

   //respawn balls if it was collected and 10 seconds passed
  if (balls.length === 0 && millis() > ballsRespawnTime) {
    balls.push(new TennisBall());
    ballsRespawnTime = millis() + 10000;
  }

  //respawn bandana if it was collected and 60 seconds passed
  if (bandanas.length === 0 && millis() > bandanaRespawnTime) {
    bandanas.push(new Bandana());
    bandanaRespawnTime = millis() + 60000;
  }

   //respawn enemies if killed and 5 seconds passed
 if (millis() > enemyRespawnTime && enemies.length < 10) {
    enemies.push(new Enemy());
    enemyRespawnTime = millis() + 5000; 
  }

  //respawn treats if it was collected and 3 seconds passed
 if (treats.length <= 15 && millis() > treatRespawnTime) {
      treats.push(new Treat());
    treatRespawnTime = millis() + 1000; 
  }

  //backwards loop for easier splicing
  for (let i = enemies.length - 1; i >= 0; i--) {
  enemies[i].move();
  enemies[i].show();

  if (!enemies[i].isActive) {
    enemies.splice(i, 1); //.01% chance to disappear
  }
  }


  for (let a of anti) {
  a.show();
  }
  
//placeholder text so player knows how to start playing
  if (!humanPlaying && !runBest && !showBestEachGen) {
    fill(255);
    textAlign(RIGHT, BOTTOM); 
    textSize(24);
    text("Press P to play as human", width - 10, height - 10);
  }

  //placeholder text for debugging
  if (!runBest ) {
    fill(255);
    textAlign(LEFT, BOTTOM); 
    textSize(24);
    text("Press Space to see all AI runs", 10, height - 10);
  }

  
  
  drawToScreen();

  if (showBestEachGen) { //show the best of each gen
    showBestPlayersForEachGeneration();
  } else if (humanPlaying) { //if the user is controling the ship[
    showHumanPlaying();
  } else if (runBest) { //if replaying the best ever game
    showBestEverPlayer();
  } else { //if just evolving normally
    if (!population.done()) { //if any players are alive then update them
      population.updateAlive();
      for (let i = 0; i < population.players.length; i++) {
        if (!population.players[i].dead) {
          handleInteractions(population.players[i]);
      }
  }
    } else { //all dead
      //genetic algorithm
      population.naturalSelection();
      resetGameState();
    }
  }
  //drawGrid(); 

  if (humanPlaying && humanPlayer && humanPlayer.stamina !== undefined) {
  let barWidth = 200;
  let barHeight = 20;
  let staminaRatio = humanPlayer.stamina / humanPlayer.maxStamina;

  //bar bg
  fill(50);
  rect(20, 20, barWidth, barHeight);

  //stamina
  fill(0, 200, 255);
  rect(20, 20, barWidth * staminaRatio, barHeight);

  //border
  stroke(255);
  noFill();
  rect(20, 20, barWidth, barHeight);
}

}
//temp function to draw a grid for mapping out patrolls and treats
function drawGrid() {
  let gridSize = 100; 

  stroke(200); 
  strokeWeight(1);

  //vertical lines
  for (let x = 0; x <= width; x += gridSize) {
    line(x, 0, x, height);
  }

  //horizontal lines
  for (let y = 0; y <= height; y += gridSize) {
    line(0, y, width, y);
  }

  noStroke(); 
}

//-----------------------------------------------------------------------------------
function showBestPlayersForEachGeneration() {
  if (!genPlayerTemp.dead) { //if current gen player is not dead then update it

    genPlayerTemp.look();
    genPlayerTemp.think();
    genPlayerTemp.update();
    genPlayerTemp.show();
    handleInteractions(genPlayerTemp);
  } else { //if dead move on to the next generation
    upToGen++;
    if (upToGen >= population.genPlayers.length) { //if at the end then return to the start and stop doing it
      upToGen = 0;
      showBestEachGen = false;
    } else { //if not at the end then get the next generation
      genPlayerTemp = population.genPlayers[upToGen].cloneForReplay();
    }
  }
}
//-----------------------------------------------------------------------------------
function showHumanPlaying() {
  if (!humanPlayer.dead) { //if the player isnt dead then move and show the player based on input
    humanPlayer.look();
    humanPlayer.update();
    humanPlayer.show();
    handleInteractions(humanPlayer); //handle interactions with treats, enemies, and the tennis balls

  }
  else { //once done return to ai
    humanPlaying = false;
  }
}
//-----------------------------------------------------------------------------------
function showBestEverPlayer() {
  if (!population.bestPlayer.dead) { //if best player is not dead
    population.bestPlayer.look();
    population.bestPlayer.think();
    population.bestPlayer.update();
    population.bestPlayer.show();
    handleInteractions(bestPlayer);
  } else { //once dead
    runBest = false; //stop replaying it
    population.bestPlayer = population.bestPlayer.cloneForReplay(); //reset the best player so it can play again
  }
}
//---------------------------------------------------------------------------------------------------------------------------------------------------------
//draws the display screen
function drawToScreen() {
  if (!showNothing) {
    //pretty stuff
    drawBrain();
    writeInfo();
  }
}
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function drawBrain() { //show the brain of whatever genome is currently showing
  var startX = 0; //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
  var startY = 0;
  var w = 0;
  var h = 0;

  if (runBest) {
    population.bestPlayer.brain.drawGenome(startX, startY, w, h);
  } else
  if (humanPlaying) {
    showBrain = false;
  } else if (showBestEachGen) {
    genPlayerTemp.brain.drawGenome(startX, startY, w, h);
  } else {
    population.players[0].brain.drawGenome(startX, startY, w, h);
  }
}
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//writes info about the current player
function writeInfo() {
  let info = "";

  if (showBestEachGen) {
    info += "Score: " + genPlayerTemp.score + "<br>";
    info += "Gen: " + (genPlayerTemp.gen + 1) + "<br>";
  } else if (humanPlaying) {
    info += "Score: " + humanPlayer.score + "<br>";
  } else if (runBest) {
    info += "Score: " + population.bestPlayer.score + "<br>";
    info += "Gen: " + population.gen + "<br>";
  } else {
    // if (showBest) {
      info += "Score: " + population.players[0].score + "<br>";
      info += "Gen: " + population.gen + "<br>";
      info += "Species: " + population.species.length + "<br>";
      info += "Global Best Score: " + population.bestScore + "<br>";
    // }
  }

  // Write the info to the HTML div
  let infoDiv = document.getElementById("gameInfo");
  if (infoDiv) {
    infoDiv.innerHTML = info;
  }
}

//--------------------------------------------------------------------------------------------------------------------------------------------------

function keyPressed() {
  switch (key) {
    case ' ':
      //toggle showBest
      showBest = !showBest;
      break;
       case '+': //speed up frame rate
         speed += 10;
         frameRate(speed);
         prvarln(speed);
         break;
       case '-': //slow down frame rate
         if(speed > 10) {
           speed -= 10;
           frameRate(speed);
           prvarln(speed);
         }
         break;
    case 'B': //run the best
      runBest = !runBest;
      break;
    case 'G': //show generations
      showBestEachGen = !showBestEachGen;
      upToGen = 0;
      genPlayerTemp = population.genPlayers[upToGen].clone();
      break;
    case 'N': //show absolutely nothing in order to speed up computation
      showNothing = !showNothing;
      break;
    case 'P': //play
      humanPlaying = !humanPlaying;
      humanPlayer = new Player();
      break;
  }
  //any of the arrow keys
  switch (keyCode) {
  case UP_ARROW:
    if (humanPlaying) humanPlayer.move("w");
    break;
  case DOWN_ARROW:
    if (humanPlaying) humanPlayer.move("s");
    break;
  case LEFT_ARROW:
    if (humanPlaying) humanPlayer.move("a");
    break;
  case RIGHT_ARROW: //right is used to move through the generations

      if (showBestEachGen) { //if showing the best player each generation then move on to the next generation
        upToGen++;
        if (upToGen >= population.genPlayers.length) { //if reached the current generation then exit out of the showing generations mode
          showBestEachGen = false;
        } else {
          genPlayerTemp = population.genPlayers[upToGen].cloneForReplay();
        }
      } else if (humanPlaying) { //if the user is playing then move player right

        //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
      }
      break;
  }
}

function handleInteractions(player) {
  if (player.dead) return;

  //Treats
  for (let i = treats.length - 1; i >= 0; i--) {
    if (treats[i].checkCollision(player)) {
      treats[i].eaten(); 
      treats.splice(i, 1);
      player.score += 1;
      player.lastScoreMillis = millis();
    }
  }

  //Tennis balls
  if (balls?.length >= 0 && balls[0]?.checkCollision(player)) {
    player.stamina = player.maxStamina; //reset stamina
    balls = [];
    ballsRespawnTime = millis() + 10000;
  }

  //Bandana
  if (bandanas?.length >= 0 && bandanas[0]?.checkCollision(player)) {
    player.isInvincible = true;
    player.isInvinUntil = millis() + 10000;
    bandanas = [];
    bandanaRespawnTime = millis() + 60000;
  }

   //Peanut Butter
  if (pb?.length >= 0 && pb[0]?.checkCollision(player)) {
    pb = [];
    player.score += 10;
    PBRespawnTime = millis() + 60000;
    player.lastScoreMillis = millis();
  }

  //Anti
  for (let i = anti.length - 1; i >= 0; i--) {
    if (anti[i].checkCollision(player) && !player.isInvincible) {
      anti.splice(i, 1);
      player.score -= 5;
    }

    //get rid of make in
    if (anti[i]) {
    if (player.isInvincible) {
      anti[i].playInvin = true;  
    } else {
      anti[i].playInvin = false; 
    }
  }
  }

  //Enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
  if (enemies[i].checkCollision(player) && !player.isInvincible) {
    player.dead = true;
    player.fitnessPenalty += 200;
  }

  //random chance of enemy being
  if (enemies[i]) {
    if (player.isInvincible) {
      enemies[i].playInvin = true;  
    } else {
      enemies[i].playInvin = false; 
    }
  }
}

}

