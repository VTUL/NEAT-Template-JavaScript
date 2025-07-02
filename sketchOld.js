
//this is a template to add a NEAT ai to any game
//note //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
//this means that there is some information specific to the game to input here


var nextConnectionNo = 1000;
var population;
var speed = 60;


var showBest = true; //true if only show the best of the previous generation
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
let anti = [];
let ball;
let ban;
let ballRespawnTime = 0;
let treatRespawnTime = 0;
let PBRespawnTime = 0;
let bandanaRespawnTime = 0;
let enemyRespawnTime = 0;
let pb;
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

  population = new Population(500); //maybe make smaller, lots of lag/slowdown

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

  for (let i = 0; i < 15; i++) {
    treats.push(new Treat());
  }

  ball = new TennisBall();
  ballRespawnTime = 0; // allow immediate usage on start
  ban = new Bandana();
  bandanaRespawnTime = 0;
  pb = new PeanutButter();
  PBRespawnTime = 0;

  for (let i = 0; i < 5; i++) {
    enemies.push(new Enemy());
  }
 
}

//--------------------------------------------------------------------------------------------------------------------------------------------------------
function draw() {
  background(255);

  //add treats/collectibles to the screen
  if (bg) {
    image(bg, 0, 0, width, height); 
  }

  for(var i = 0; i < blocks.length; i++)
    blocks[i].show();


  for (let i = treats.length - 1; i >= 0; i--) {
    treats[i].show();
  }

  if (ball) {
    ball.show();
  }

  if (ban) {
    ban.show();
  }

  if (pb) {
    pb.show();
  }

  handleRespawns(); //handle respawning of items
  
  //move and show enemies, remove inactive
  for (let i = enemies.length - 1; i >= 0; i--) {
    enemies[i].move();
    enemies[i].show();

    if (!enemies[i].isActive) {
      enemies.splice(i, 1); 
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
  } else if (humanPlaying) { //if the user is controling the ship
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
      //resetGame(); //reset the game state for the next generation
    }
  }
  //drawGrid(); 

  if (humanPlaying && humanPlayer && humanPlayer.stamina !== undefined) {
    drawStaminaBar(humanPlayer);
  }
  
}

function handleRespawns() {
  //respawn Peanut Butter if missing and timer passed
  if ((!pb || pb.life < millis()) && millis() > PBRespawnTime) {
    pb = new PeanutButter();
    PBRespawnTime = millis() + 60000;
  } else if (pb && pb.life < millis()) {
    //mark pb for respawn and clear current instance
    pb = null;
    PBRespawnTime = millis() + 60000;
  }

  //respawn Tennis Ball if missing and timer passed
  if ((!ball || ball.life < millis()) && millis() > ballRespawnTime) {
    ball = new TennisBall();
    ballRespawnTime = millis() + 10000;
  } else if (ball && ball.life < millis()) {
    ball = null;
    ballRespawnTime = millis() + 10000;
  }

  //respawn Bandana if missing and timer passed
  if ((!ban || ban.life < millis()) && millis() > bandanaRespawnTime) {
    ban = new Bandana();
    bandanaRespawnTime = millis() + 60000;
  } else if (ban && ban.life < millis()) {
    ban = null;
    bandanaRespawnTime = millis() + 60000;
  }

  //respawn enemies if gone and timer passed
  if (millis() > enemyRespawnTime && enemies.length < 5) {
    enemies.push(new Enemy());
    enemyRespawnTime = millis() + 5000;
  }

  //respawn treats if count low and timer passed
  if (millis() > treatRespawnTime && treats.length < 15) {
    treats.push(new Treat());
    treatRespawnTime = millis() + 3000; 
  }

  //remove expired treats
  for (let i = treats.length - 1; i >= 0; i--) {
    if (treats[i].life < millis()) {
      treats[i].eaten(); //return spawn point to the array if needed
      treats.splice(i, 1);
    }
  }

  //remove expired anti items
  for (let i = anti.length - 1; i >= 0; i--) {
    if (anti[i].life < millis()) {
      anti.splice(i, 1);
    }
  }
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
    handleInteractions(humanPlayer); //handle interactions with treats, enemies, and the tennis ball

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
    if (showBest) {
      info += "Score: " + population.players[0].score + "<br>";
      info += "Gen: " + population.gen + "<br>";
      info += "Species: " + population.species.length + "<br>";
      info += "Global Best Score: " + population.bestScore + "<br>";
    }
  }

  //write the info to the HTML div
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

//maybe have unique function for humanplayer where things disappear
function handleInteractions(player) {
  if (player.dead) return;

  //Treats
  for (let i = treats.length - 1; i >= 0; i--) {
    if (treats[i].checkCollision(player) && !treats[i].idList.includes(player.uuid)) {
      player.score += 1;
      treats[i].idList.push(player.uuid); //add player id to the treat
      player.lastScoreMillis = millis();
    }
  }

  //Tennis Ball
  if (ball && ball.checkCollision(player) && !ball.idList.includes(player.uuid)) {
    player.stamina = player.maxStamina; //reset stamina
    ball.idList.push(player.uuid); //add player id
    ballRespawnTime = millis() + 10000;
  }

  //Bandana
  if (ban && ban.checkCollision(player && !ban.idList.includes(player.uuid))) {
    player.isInvincible = true;
    player.isInvinUntil = millis() + 10000;
    ban.idList.push(player.uuid); //add player id
    bandanaRespawnTime = millis() + 60000;
  }

   //Peanut Butter
  if (pb && pb.checkCollision(player)&& !pb.idList.includes(player.uuid)) {
    pb.idList.push(player.uuid); //add player id
    player.score += 10;
    PBRespawnTime = millis() + 60000;
    player.lastScoreMillis = millis();
  }

  //Anti
  for (let i = anti.length - 1; i >= 0; i--) {
    if (anti[i].checkCollision(player) && !player.isInvincible && !anti[i].idList.includes(player.uuid)) {
      anti[i].idList.push(player.uuid); //add player id
      player.score -= 5;
    }

    //get rid of anti penalty
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
  }

  //enemy invincibility handling
  if (enemies[i]) {
    if (player.isInvincible) {
      enemies[i].playInvin = true;  
    } else {
      enemies[i].playInvin = false; 
    }
  }
}

}

//function to reset the game state
function resetGame() {
  // Clear all dynamic game state
  treats = [];
  enemies = [];
  anti = [];

  ball = null;
  ban = null;
  pb = null;

  // Reset collectibles
  ball = new TennisBall();
  ban = new Bandana();
  pb = new PeanutButter();

  // Set their respawn times based on current millis
  ballRespawnTime = millis() + 10000;
  bandanaRespawnTime = millis() + 60000;
  PBRespawnTime = millis() + 60000;

  // Reset treat timer
  treatRespawnTime = millis() + 3000;
  enemyRespawnTime = millis() + 5000;

  // Add initial treats and enemies
  for (let i = 0; i < 15; i++) {
    treats.push(new Treat());
  }
  for (let i = 0; i < 5; i++) {
    enemies.push(new Enemy());
  }
}

