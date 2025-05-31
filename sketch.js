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
let ball;
let ban;
let ballRespawnTime = 0;
let treatRespawnTime = 0;
let PBRespawnTime = 0;
let bandanaRespawnTime = 0;
let enemyRespawnTime = 0;
let pb;
var bg;
//haven't built map/bounds yet


//--------------------------------------------------------------------------------------------------------------------------------------------------
function preload(){
  bg = loadImage("images/VT_NewmanLibrary4th.png");
}

//--------------------------------------------------------------------------------------------------------------------------------------------------
function setup() {
  window.canvas = createCanvas(1280, 720);
    
  population = new Population(500);

  for (let i = 0; i < 10; i++) {
    treats.push(new Treat());
  }

  ball = new TennisBall();
  ballRespawnTime = millis() + 10000;
  ban = new Bandana();
  bandanaRespawnTime = millis() + 20000;
  PBRespawnTime = millis() + 60000;

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

  for (let i = treats.length - 1; i >= 0; i--) {
    treats[i].show();
  }

  if (ball) {
    ball.show();
  }

  if (ban) {
    ban.show();
  }

  if (!pb && millis() > PBRespawnTime) {
    pb = new PeanutButter();
    PBRespawnTime = millis() + 60000;
  }

  if (pb) {
    pb.show();
  }

   //respawn ball if it was collected and 10 seconds passed
  if (!ball && millis() > ballRespawnTime) {
    ball = new TennisBall();
    ballRespawnTime = millis() + 10000;
  }
  //respawn bandana if it was collected and 60 seconds passed
  if (!ban && millis() > bandanaRespawnTime) {
    ban = new Bandana();
    bandanaRespawnTime = millis() + 60000;
  }

   //respawn enemies if killed and 10 seconds passed
 if (millis() > enemyRespawnTime) {
    enemies.push(new Enemy());
    enemyRespawnTime = millis() + 10000; 
  }

  //respawn treats if it was collected and 3 seconds passed
 if (treats.length <= 5 && millis() > treatRespawnTime) {
    treats.push(new Treat());
    treatRespawnTime = millis() + 3000; 
  }

  for (let i = 0; i < enemies.length; i++) {

  enemies[i].move();
  enemies[i].show();
  }
  
//placeholder text so player knows how to start playing
  if (!humanPlaying && !runBest && !showBestEachGen) {
    fill(0);
    textAlign(RIGHT, BOTTOM); 
    textSize(24);
    text("Press P to play as human", width - 10, height - 10);
  }

  
  drawToScreen();
  if (showBestEachGen) { //show the best of each gen
    showBestPlayersForEachGeneration();
  } else if (humanPlaying) { //if the user is controling the ship[
    showHumanPlaying();
  } else if (runBest) { // if replaying the best ever game
    showBestEverPlayer();
  } else { //if just evolving normally
    if (!population.done()) { //if any players are alive then update them
      population.updateAlive();
    } else { //all dead
      //genetic algorithm
      population.naturalSelection();
    }
  }
}
//-----------------------------------------------------------------------------------
function showBestPlayersForEachGeneration() {
  if (!genPlayerTemp.dead) { //if current gen player is not dead then update it

    genPlayerTemp.look();
    genPlayerTemp.think();
    genPlayerTemp.update();
    genPlayerTemp.show();
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
  fill(200);
  textAlign(LEFT);
  textSize(30);
  stroke(0);
  if (showBestEachGen) {
    text("Score: " + genPlayerTemp.score, 650, 50); //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
    text("Gen: " + (genPlayerTemp.gen + 1), 1150, 50);
  } else
  if (humanPlaying) {
    text("Score: " + humanPlayer.score, 650, 50); //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
  } else
  if (runBest) {
    text("Score: " + population.bestPlayer.score, 650, 50); //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
    text("Gen: " + population.gen, 1150, 50);
  } else {
    if (showBest) {
      text("Score: " + population.players[0].score, 650, 50); //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
      text("Gen: " + population.gen, 1150, 50);
      text("Species: " + population.species.length, 50, canvas.height / 2 + 300);
      text("Global Best Score: " + population.bestScore, 50, canvas.height / 2 + 200);
    }
  }
}

//--------------------------------------------------------------------------------------------------------------------------------------------------

function keyPressed() {
  switch (key) {
    case ' ':
      //toggle showBest
      showBest = !showBest;
      break;
      // case '+': //speed up frame rate
      //   speed += 10;
      //   frameRate(speed);
      //   prvarln(speed);
      //   break;
      // case '-': //slow down frame rate
      //   if(speed > 10) {
      //     speed -= 10;
      //     frameRate(speed);
      //     prvarln(speed);
      //   }
      //   break;
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
      treats.splice(i, 1);
      player.score += 1;
    }
  }

  //Tennis Ball
  if (ball && ball.checkCollision(player)) {
    player.speedBoostedUntil = millis() + 3000;
    ball = null;
    ballRespawnTime = millis() + 10000;
  }

  //Bandana
  if (ban && ban.checkCollision(player)) {
    player.canEat = true;
    player.canEatUntil = millis() + 10000;
    ban = null;
    bandanaRespawnTime = millis() + 60000;
  }

   //Peanut Butter
  if (pb && pb.checkCollision(player)) {
    pb = null;
    player.score += 10;
    PBRespawnTime = millis() + 60000;
  }

  //Enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    if (enemies[i].checkCollision(player) && !player.canEat) {
      player.dead = true;
    }
    else if (enemies[i].checkCollision(player) && player.canEat) {
      enemies[i].dead = true;
      enemies.splice(i, 1);
      enemyRespawnTime = millis() + 10000; 
  }

  if(player.canEat)
  {
    enemies[i].eat = true; //if player can eat then enemy will run away
  }
    else
    {
      enemies[i].eat = false; //if player can't eat then enemy will chase player
    }

}
}

