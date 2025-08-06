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
let beds = [];
let balls = [];
let bedsRespawnTime = 0;
let treatRemoveTime = 0; 
let ballRespawnTime = 0;
let enemyRespawnTime = 0;
let introTime = 0;
let pb = [];

//images
var bg;
var blockImg;
var derek;
var derekUp;
var derekDown;
var epcot;
var epcotUp;
var epcotDown;
var josie;
var josieUp;
var josieDown;
var acorn;
var squirrel;
var peanut;
var yum;
var bed;
var tennis;
var arrow;

let wall;
let blocks = [];
let pendingReset = false;

let blockWidth = 50;
let blockHeight = 35;
let offsetX;
let offsetY;



//--------------------------------------------------------------------------------------------------------------------------------------------------
function preload(){
  bg = loadImage("images/library_map (1).png");
  blockImg = loadImage("images/square.png");
  acorn = loadImage("images/Acorn_Item.png");
  squirrel = loadImage("spriteSheets/Enemy_Side_Template.png");
  squirrelDown = loadImage("spriteSheets/Enemy_Vertical_1.png");
  yum = loadImage("images/Dog_Treat.png");
  peanut = loadImage("images/Peanut_Butter.png");
  derek = loadImage("spriteSheets/Derek_walk.png");
  derekUp = loadImage("spriteSheets/Derek_Overhead_Walk_2.png");
  derekDown = loadImage("spriteSheets/Derek_overhead_walk.png");
  epcot = loadImage("spriteSheets/Epcot_walk.png");
  epcotUp = loadImage("spriteSheets/Epcot_Overhead_Walk_2.png");
  epcotDown = loadImage("spriteSheets/Epcot_overhead_walk.png");
  josie = loadImage("spriteSheets/Josie_walk.png");
  josieUp = loadImage("spriteSheets/Josie_Overhead_Walk_2.png");
  josieDown = loadImage("spriteSheets/Josie_overhead_walk.png");
  bed = loadImage("images/Dog_Bed-1.png.png");
  tennis = loadImage("images/Ball-1.png.png");
  arrow = loadImage("images/red-pixel-arrow.png"); //stand in
}

//--------------------------------------------------------------------------------------------------------------------------------------------------
function setup() {
  let canvas = createCanvas(1080, 900);
  canvas.parent("canvasContainer");

  population = new Population(500); //maybe make smaller, lots of lag/slowdown

  wall = new Wall(MAP_DATA); //map for collisions

  let wallWidth = wall.getColumns() * blockWidth;
  let wallHeight = wall.getRows() * blockHeight;
  let offsetX = (width - wallWidth) / 2;
  let offsetY = (height - wallHeight) / 2;

  for (let i = 0; i < wall.getRows(); i++) {
    for (let j = 0; j < wall.getColumns(); j++) {
      if (wall.getElement(i, j) === '*') {
        blocks.push(new Block(j * blockWidth + offsetX, i * blockHeight + offsetY));
      }
    }
  }
  
  resetGame();
  introTime = millis() + 3000; 

}

//--------------------------------------------------------------------------------------------------------------------------------------------------------
function draw() {
  frameRate(30);
  background(255);

  //add treats/collectibles to the screen
  if (bg) {
    image(bg, 0, 0, width, height); 
  }

  for(var i = 0; i < blocks.length; i++){
    blocks[i].show();
  }

  for (let i = treats.length - 1; i >= 0; i--) {
    if (treats?.length >= 1) 
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
    enemies[i].move();
    enemies[i].show();

    if (!enemies[i].isActive) {
      enemies.splice(i, 1); //0.1% chance to disappear
    }
  }

  // if(population.players.length > 0){
  //   stroke('blue');
  // strokeWeight(5);
  // point(population.players[0].x,population.players[0].y)
  // }

  for (let a of anti) {
    a.show();
  }
  
  //placeholder text so player knows how to start playing
  if (!humanPlaying && !runBest && !showBestEachGen) {
    noStroke();
    fill(255);
    textAlign(RIGHT, BOTTOM); 
    textSize(24);
    text("Press P to play as human", width - 10, height - 4);
  }

  
  if (!showBestEachGen) {
    noStroke();
    fill(255);
    textAlign(LEFT, BOTTOM); 
    textSize(24);
    text("Press G to see best AI each gen", 400, height - 4);
  }

    noStroke();
    fill(0);
    textAlign(CENTER, TOP); 
    textSize(24);
    text("Press J to play as another dog!", 540, 50);

  //placeholder text for debugging
  if (showBest) {
    noStroke();
    fill(255);
    textAlign(LEFT, BOTTOM); 
    textSize(24);
    text("Press Space to see all AI runs", 10, height - 4);
  }

  //lets player know if AI is playing
  if (!humanPlaying) {
    noStroke();
    fill(0);
    textAlign(CENTER, TOP); 
    textSize(32);
    text("AI Playing", 540, 15);
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
      resetGame(); //reset the game state for the next generation
    }
  }
  drawGrid(); 

  if (humanPlaying && humanPlayer && humanPlayer.stamina !== undefined) {
    drawStaminaBar(humanPlayer);
  }
  else if(showBestEachGen && genPlayerTemp && genPlayerTemp.stamina !== undefined) {
    drawStaminaBar(genPlayerTemp);
  }
  else if(!humanPlaying && showBest && !showBestEachGen && population.players[0] && population.players[0].stamina !== undefined) {
    //default what viewer first sees
    drawStaminaBar(population.players[0]);
  }

  /*if(millis() < introTime)
    drawArrow();*/

}

function handleRespawns() {
  //respawn Peanut Butter if missing and timer passed
  if (pb?.length < 1 && millis() > PBRespawnTime) {
    pb.push(new PeanutButter());
    PBRespawnTime = millis() + 60000;
  }

  if (pb?.length >= 1) {
    pb[0].show();
  }

   //respawn beds if it was collected and 10 seconds passed
  if (beds.length === 0 && millis() > bedsRespawnTime) {
    beds.push(new DogBed());
    bedsRespawnTime = millis() + 20000;
  }

  //respawn TennisBall if it was collected and 30 seconds passed
  if (balls.length === 0 && millis() > ballRespawnTime) {
    balls.push(new TennisBall());
    ballRespawnTime = millis() + 40000;
  }

   //respawn enemies if killed and 5 seconds passed
 if (millis() > enemyRespawnTime && enemies.length < 10) {
    enemies.push(new Enemy());
    enemyRespawnTime = millis() + 5000; 
  }

  //respawn treats 
 if (treats.length < 25) {
    treats.push(new Treat());
    
  }

  //remove expired anti items
  for (let i = anti.length - 1; i >= 0; i--) {
    if (anti[i].life < millis()) {
      anti.splice(i, 1);
    }
  }
  //remove expired treats causes game to crash
for (let i = treats.length - 1; i >= 0; i--) {
  if (treats[i].life < millis()) {
    treats[i].eaten(); //call eaten to reset spawn point
    treats.splice(i, 1);
  }
}

  //remove expired peanut butter
for (let i = pb.length - 1; i >= 0; i--) {
  if (pb[i].life < millis()) {
    pb.splice(i, 1);
  }
}

//remove expired beds
for (let i = beds.length - 1; i >= 0; i--) {
  if (beds[i].life < millis()) {
    beds.splice(i, 1);
  }
}

//remove expired tennis balls
for (let i = balls.length - 1; i >= 0; i--) {
  if (balls[i].life < millis()) {
    balls.splice(i, 1);
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

function drawArrow() {
  let tempSprite = new Sprite(derek, 64, 32, 4);
  imageMode(CENTER);
  image(arrow, 480, 430, 30, 30);
  imageMode(CORNER);

  noStroke();
  fill(0);
  textAlign(LEFT, TOP); 
  textSize(20);
  text("This is the player", 470, 390);
  translate(510, 420); 
  tempSprite.draw();
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
    //different way to let the user know they died
    /*
    fill(255);
    textAlign(CENTER, TOP); 
    textSize(50);
    text("You Died", 540, 450);
  }*/
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
    else{
      //when all runs visible 
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
      if (population.genPlayers.length > 0) {
        showBestEachGen = true;
        upToGen = 0;
        genPlayerTemp = population.genPlayers[upToGen].clone();
      }
      break;
    case 'N': //show absolutely nothing in order to speed up computation
      showNothing = !showNothing;
      break;
    case 'P': //play
      humanPlaying = !humanPlaying;
      humanPlayer = new Player();
      break;
    case 'J':
      //switch to next dog sprite
      if (humanPlaying) {
        humanPlayer.i = (humanPlayer.i + 1) % humanPlayer.sprite.length;
      }
      else if (showBestEachGen) {
        genPlayerTemp.i = (genPlayerTemp.i + 1) % genPlayerTemp.sprite.length;
      }
      else if (showBest) {
        population.players[0].i = (population.players[0].i + 1) % population.players[0].sprite.length;
      }
      else if (runBest) {
        population.bestPlayer.i = (population.bestPlayer.i + 1) % population.bestPlayer.sprite.length;
      }
      else if (population && population.players) {
        for (let player of population.players) {
          player.i = (player.i + 1) % player.sprite.length;
        }
}
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
        humanPlayer.move("d");
      }
      break;
  }
}

//maybe have unique function for humanplayer where things disappear
function handleInteractions(player) {
  if (player.dead) return;

  //Treats
  for (let i = treats.length - 1; i >= 0; i--) {
    if (treats[i] && treats[i].checkCollision(player) && !treats[i].idList.includes(player.uuid)) {
      player.score += 1;
      treats[i].idList.push(player.uuid); //add player id to the treat
      if(humanPlaying){
        treats[i].eaten(); 
        treats.splice(i, 1); //remove anti item if human player
      }
      player.lastScoreMillis = millis();
    }
  }

  //Dog Beds
  if (beds?.length >= 0 && beds[0]?.checkCollision(player) && !beds[0].idList.includes(player.uuid)) {
    player.stamina = player.maxStamina; //reset stamina
    beds[0].idList.push(player.uuid); //add player id
    if(humanPlaying)
      beds.splice(0, 1); //remove anti item if human player
    bedsRespawnTime = millis() + 20000;
  }

  //TennisBall
  if (balls?.length >= 0 && balls[0]?.checkCollision(player) && !balls[0].idList.includes(player.uuid)) {
    player.isInvincible = true;
    player.isInvinUntil = millis() + 10000;
    balls[0].idList.push(player.uuid); //add player id
    if(humanPlaying)
      balls.splice(0, 1); //remove anti item if human player
    ballRespawnTime = millis() + 40000;
  }

   //Peanut Butter
  if (pb?.length >= 0 && pb[0]?.checkCollision(player) && !pb[0].idList.includes(player.uuid)) {
    pb[0].idList.push(player.uuid); //add player id
    player.score += 10;
    if(humanPlaying)
      pb.splice(0, 1); //remove anti item if human player
    PBRespawnTime = millis() + 60000;
    player.lastScoreMillis = millis();
  }

  //Anti
  for (let i = anti.length - 1; i >= 0; i--) {
    if (anti[i].checkCollision(player) && !player.isInvincible && !anti[i].idList.includes(player.uuid)) {
      anti[i].idList.push(player.uuid); //add player id
      player.score -= 5;
      if(humanPlaying)
        anti.splice(i, 1); //remove anti item if human player
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
  Treat.resetSpawns();
  Enemy.resetSpawns();
  DogBed.resetSpawns();
  TennisBall.resetSpawns();
  PeanutButter.resetSpawns();

  treats = [];
  enemies = [];
  beds = [];
  balls = [];
  pb = [];
  anti = [];

  treats.length = 0;
  enemies.length = 0;
  anti.length = 0;

  beds.push(new DogBed());
  balls.push(new TennisBall());
  pb.push(new PeanutButter());

  //reset timers for collectible respawns
  bedsRespawnTime = millis() + 20000;       //dog bed in 20 seconds
  ballRespawnTime = millis() + 40000;    //TennisBall in 40 seconds
  PBRespawnTime = millis() + 60000;         //peanut butter in 60 seconds

  enemyRespawnTime = millis() + 5000;       //enemies every 5 seconds
  treatRemoveTime = millis() + 1000;        //treats removed after 1 second

  for (let i = 0; i < 25; i++) {
    treats.push(new Treat());
  }

  for (let i = 0; i < 5; i++) {
    enemies.push(new Enemy());
  }

                          

}

