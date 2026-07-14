let nextConnectionNo = 1000;
let population;
let speed = 30;

let mapGrid = JSON.parse(JSON.stringify(mapGridOriginal));

let showBest = false; //true if only show the best of the previous generation
let runBest = false; //true if replaying the best ever game
let humanPlaying = false; //true if the user is playing
let humanPlayer;

let showBrain = false;
let showBestEachGen = false;
let upToGen = 0;
let genPlayerTemp; //player

let showNothing = false; 
let treats = [];
let enemies = []; 
let beds = [];
let balls = [];
let bedsRespawnTime = 0;
let treatRemoveTime = 0; 
let ballRespawnTime = 0;
let enemyRespawnTime = 0;
let deathMessageTime = 0;
let introTime = 0;
let pb = [];

//images
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

let occupantList = ["player", "enemy", "treat", "peanut", "bed", "tennis"]

let wall;
let blocks = [];
let pendingReset = false;
let startWasPressed = false;
let activeGamepadIndex = null;
let accordionIndex = 0;
let bWasPressed = false;
let rightStickCooldown = 0;
let brainCanvas;

const MAX_MOVES_WITHOUT_TREAT = 35;

const config = new Config({
  // Basic network structure
  inputSize: 29,                    // Number of input nodes
  outputSize: 5,                   // Number of output nodes

  // Activation function (string-based selection)
  activationFunction: 'Tanh',   // 'Sigmoid', 'NEATSigmoid', 'Tanh', 'ReLU', 'LeakyReLU', 'Gaussian'

  // Bias settings
  // bias: 1.0,                       // Bias value
  // connectBias: true,               // Connect the bias node to all output nodes
  // biasMode: 'WEIGHTED_NODE',       // Bias implementation mode

  // Fitness function
  // fitnessFunction: 'XOR',          // Default XOR fitness function

  // Weight initialization
  weightInitialization: {
    type: 'Random',
    params: [-1, 1]                // Min and max values for random weights
  },

  // Speciation parameters
  // c1: 1.0,                         // Coefficient for excess genes
  // c2: 1.0,                         // Coefficient for disjoint genes
  // c3: 0.4,                         // Coefficient for weight differences
  // compatibilityThreshold: 3.0,     // Species compatibility threshold
  // interspeciesMatingRate: 0.001,   // Rate of interspecies mating

  // Mutation parameters
  mutationRate: 1.0,               // Overall mutation rate
  weightMutationRate: 0.8,         // Mutation rate for weights
  addConnectionMutationRate: 0.05, // Rate for adding new connections
  addNodeMutationRate: 0.03,       // Rate for adding new nodes
  minWeight: -4.0,                 // Minimum allowed weight
  maxWeight: 4.0,                  // Maximum allowed weight
  reinitializeWeightRate: 0.1,     // Rate to completely reinitialize weights
  minPerturb: -0.5,                // Minimum perturbation value
  maxPerturb: 0.5,                 // Maximum perturbation value

  // Evolution parameters
  populationSize: 500,             // Size of the population
  generations: 1000,                // Number of generations
  targetFitness: 1000,             // Target fitness to achieve
  survivalRate: 0.2,               // Proportion that survives each generation
  numOfElite: 15,                  // Number of elite individuals to retain
  dropOffAge: 15,                  // Maximum age before dropping off
  populationStagnationLimit: 15,   // Generations with no improvement before reset
  keepDisabledOnCrossOverRate: 0.75, // Keep disabled connections during crossover
  mutateOnlyProb: 0.25,            // Probability for mutation-only

  // Recurrent network options
  allowRecurrentConnections: true, // Allow recurrent connections
  recurrentConnectionRate: 1.0     // Rate for recurrent connections
});


//--------------------------------------------------------------------------------------------------------------------------------------------------
function preload(){
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

//--------------------------------------------------------------------------------------------------------------------------------------------------
function setup() {

  let canvas = createCanvas(screenWidth, screenHeight);
  canvas.parent("canvasContainer");

  population = new Pool(config);
  // console.log("population: ", population);
  
  resetGame();
  introTime = millis() + 3000; 
  frameRate(speed);

  let acc = document.getElementsByClassName("accordion");
  brainCanvas = document.getElementById("brain");
  let i;

  for (i = 0; i < acc.length; i++) {
    acc[i].addEventListener("click", function() {
      /* Toggle between adding and removing the "active" class,
      to highlight the button that controls the panel */
      this.classList.toggle("active");

      /* Toggle between hiding and showing the active panel */
      let panel = this.nextElementSibling;
      if (panel.style.display === "block") {
        panel.style.display = "none";
      } else {
        panel.style.display = "block";
      }
    });
  }

}

function toggleAccordion(index) {
  const acc = document.getElementsByClassName("accordion");
  const btn = acc[index];
  if (!btn) return;

  btn.classList.toggle("active");

  const panel = btn.nextElementSibling;
  panel.style.display =
    panel.style.display === "block" ? "none" : "block";
}


window.addEventListener("gamepadconnected", (e) => {
  activeGamepadIndex = e.gamepad.index;
});


//--------------------------------------------------------------------------------------------------------------------------------------------------------
function draw() {
  background(255);

  //add treats/collectibles to the screen
  if (bg) {
    imageMode(CORNER);
    image(bg, 0, 0, width, height); 
  }

  /*for(let i = 0; i < blocks.length; i++){
    blocks[i].show();
  }*/

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

  // if(population.players.length > 0){
  //   stroke('blue');
  // strokeWeight(5);
  // point(population.players[0].x,population.players[0].y)
  // }

  

  //lets player know if AI is playing
  if (!humanPlaying) {
    noStroke();
    fill(0);
    textAlign(CENTER, TOP); 
    textSize(32);
    text("AI Playing", 540, 15);
  }  

  drawToScreen();

  // console.log("population: ", population);

  if (showBestEachGen) { //show the best of each gen
    showBestPlayersForEachGeneration();
  } else if (humanPlaying) { //if the user is controling the ship
    showHumanPlaying();
  } else if (runBest) { //if replaying the best ever game
    showBestEverPlayer();
  } else { //if just evolving normally
    if (!population.done()) { //if any players are alive then update them
      population.updateAlive();
      for (let i = 0; i < population.genomes.length; i++) {
        if (!population.genomes[i].dead) {
          //handleInteractions(population.players[i]);
        }
      }
    } else { //all dead
      //genetic algorithm
      population.calculateFitness();
      population.evolve();
      console.log("population after evolve: ", population);
      resetGame(); //reset the game state for the next generation
      visualizeGenome(population.getBestGenome(), brainCanvas)
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

  if (millis() - deathMessageTime < 2000 && deathMessageTime !== 0) {
    fill(255);
    textAlign(CENTER, TOP); 
    textSize(60);
    text("You Got Distracted!", 540, 460);
  }

  //handle gamepad input for toggling human play - mapping to button 9 (Start on Xbox controller)
  const gp = navigator.getGamepads()?.[activeGamepadIndex ?? 0];
  if (gp && gp.buttons?.length > 9) {
    const startPressed = gp.buttons[9].pressed;

    if (startPressed && !startWasPressed) {
      toggleHumanPlay();
    }

    startWasPressed = startPressed;
  }

  //gamepad UI controls (accordions)
  const acc = document.getElementsByClassName("accordion");

  if (gp && acc.length > 0) {

    //right stick UP / DOWN selects accordion (axes[3])
    if (millis() > rightStickCooldown) {
      const selectY = gp.axes[3];

      if (selectY > 0.6) {
        accordionIndex = Math.min(accordionIndex + 1, acc.length - 1);
        rightStickCooldown = millis() + 250;
      }
      else if (selectY < -0.6) {
        accordionIndex = Math.max(accordionIndex - 1, 0);
        rightStickCooldown = millis() + 250;
      }
    }

    //B button toggles accordion (button 1)
    const bPressed = gp.buttons[1]?.pressed;
    if (bPressed && !bWasPressed) {
      toggleAccordion(accordionIndex);
    }
    bWasPressed = bPressed;

    //visual highlight
    for (let i = 0; i < acc.length; i++) {
      acc[i].classList.toggle("selected", i === accordionIndex);
    }
  }
}

function handleRespawns() {
  //respawn Peanut Butter if missing and timer passed
  if (pb?.length < 1 && millis() > PBRespawnTime) {
    pb.push(new PeanutButter(peanut, 24, 24));
    PBRespawnTime = millis() + 5000;
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
 if (treats.length < 25) {
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
  // console.info("mapgrid", mapGrid);
  stroke(100); 
  strokeWeight(1);

  //vertical lines
  for (let x = -(gridWidth/2); x <= (screenWidth + gridWidth/2); x += gridWidth) {
    line(x, -(gridWidth/2), x, screenHeight+(gridWidth/2));
  }

  //horizontal lines
  for (let y = -(gridHeight/2); y <= (screenHeight + gridHeight/2); y += gridHeight) {
    line(-(gridHeight/2), y, screenWidth+(gridHeight/2), y);
  }

  noStroke(); 
}

//-----------------------------------------------------------------------------------
// function showBestPlayersForEachGeneration() {
//   if (!genPlayerTemp.dead) { //if current gen player is not dead then update it

//     genPlayerTemp.look();
//     genPlayerTemp.think();
//     genPlayerTemp.update();
//     genPlayerTemp.show();
//     //handleInteractions(genPlayerTemp);
//   } else { //if dead move on to the next generation
//     upToGen++;
//     if (upToGen >= population.genPlayers.length) { //if at the end then return to the start and stop doing it
//       upToGen = 0;
//       showBestEachGen = false;
//     } else { //if not at the end then get the next generation
//       genPlayerTemp = population.genPlayers[upToGen].cloneForReplay();
//     }
//   }
// }
//-----------------------------------------------------------------------------------
// function showHumanPlaying() {
//   if (!humanPlayer.dead) { //if the player isnt dead then move and show the player based on input
//     humanPlayer.look();
//     humanPlayer.update();
//     humanPlayer.show();
//     //handleInteractions(humanPlayer); //handle interactions with treats, enemies, and the tennis ball

//   }
//   else { //once done return to ai
//     humanPlaying = false;
//     deathMessageTime = millis();
//     //different way to let the user know they died
//     /*
//     fill(255);
//     textAlign(CENTER, TOP); 
//     textSize(50);
//     text("You Died", 540, 450);
//   }*/
//   }
// }
//-----------------------------------------------------------------------------------
// function showBestEverPlayer() {
//   if (!population.bestPlayer.dead) { //if best player is not dead
//     population.bestPlayer.look();
//     population.bestPlayer.think();
//     population.bestPlayer.update();
//     population.bestPlayer.show();
//     //handleInteractions(bestPlayer);
//   } else { //once dead
//     runBest = false; //stop replaying it
//     population.bestPlayer = population.bestPlayer.cloneForReplay(); //reset the best player so it can play again
//   }
// }
//---------------------------------------------------------------------------------------------------------------------------------------------------------
//draws the display screen
function drawToScreen() {
  if (!showNothing) {
    //pretty stuff
    // drawBrain();
    writeInfo();
  }
}
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// function drawBrain() { //show the brain of whatever genome is currently showing
//   let startX = 800; //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
//   let startY = 10;
//   let w = 400;
//   let h = 90;

//   if (runBest) {
//     population.bestPlayer.brain.drawGenome(startX, startY, w, h);
//   } else
//   if (humanPlaying) {
//     showBrain = false;
//   } else if (showBestEachGen) {
//     genPlayerTemp.brain.drawGenome(startX, startY, w, h);
//   } else {
//     population.players[0].brain.drawGenome(startX, startY, w, h);
//   }

//   //write the info to the HTML div
//   /*let canvas2 = document.getElementById("canvas2");
//   if (canvas2) {
//     canvas2.innerHTML = brain;*/
// }
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//writes info about the current player
function writeInfo() {
  let info1 = "";
  let info2 = "";

  if (showBestEachGen) {
    info1 += "Score: " + genPlayerTemp.score + "<br>";
    info2 += "Generation: " + (population.generation + 1) + "<br>";
  } else if (humanPlaying) {
    info1 += "Score: " + humanPlayer.score + "<br>";
  } else if (runBest) {
    info1 += "Score: " + population.bestPlayer.score + "<br>";
    info2 += "Generation: " + population.generation + "<br>";
  } else {
    if (showBest) {
      info1 += "Score: " + population.genomes[0].score + "<br>";
      info2 += "Generation: " + population.generation + "<br>";
      info2 += "Species: " + population.species.length + "<br>";
      info1 += "Global Best Score: " + population.bestScore + "<br>";
    }
    else{
      //added this code because population.players[0].score is measured by fitness scores, not actual game score 
      let bestScoreThisGen = 0;
      for (let i = 0; i < population.players.length; i++) {
        if (population.players[i].score > bestScoreThisGen) {
            bestScoreThisGen = population.players[i].score;
        }
      }
      //when all runs visible 
      info1 += "Best Score this Gen: " + bestScoreThisGen + "<br>";
      info2 += "Generation: " + population.generation + "<br>";
      info2 += "Species: " + population.species.length + "<br>";
      info1 += "Global Best Score: " + population.globalBestScore + "<br>";
    }
  }

  //write the info to the HTML div
  let infoDiv1 = document.getElementById("gameInfo1");
  let infoDiv2 = document.getElementById("gameInfo2");
  if (infoDiv1) infoDiv1.innerHTML = info1;
  if (infoDiv2) infoDiv2.innerHTML = info2
}

//--------------------------------------------------------------------------------------------------------------------------------------------------

function keyPressed() {
  console.info("key pressed", key)
  switch (key) {
    case ' ':
      //toggle showBest
      showBest = !showBest;
      break;
       case 'I': //speed up frame rate
        //  console.log("Plus pressed");
         speed = frameRate() + 30;
         console.info("speed", speed);
         frameRate(speed);
        //  prvarln(speed);
         break;
       case 'U': //slow down frame rate
         if(speed > 40) {
           speed = frameRate() - 30;
           frameRate(speed);
          //  prvarln(speed);
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
    case 'P': //playz
      toggleHumanPlay();
      break;
    case 'J':
      //switch to next dog sprite
      /*if (humanPlaying) {
        humanPlayer.i = (humanPlayer.i + 1) % 3;
      }
      else if (showBestEachGen) {
        genPlayerTemp.i = (genPlayerTemp.i + 1) % 3;
      }
      else if (showBest) {
        population.players[0].i = (population.players[0].i + 1) % 3;
      }
      else if (runBest) {
        population.bestPlayer.i = (population.bestPlayer.i + 1) % 3;
      }
      else if (population && population.players) {
        for (let player of population.players) {
          player.i = (player.i + 1) % 3;
        }
}*/
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
//  function handleInteractions(player) {
  // if (player.dead) return;

  //Treats
  // for (let i = treats.length - 1; i >= 0; i--) {
  //   if (treats[i] && treats[i].checkCollision(player) && !treats[i].idList.includes(player.uuid)) {
  //     player.score += 1;
  //     treats[i].idList.push(player.uuid); //add player id to the treat
  //     if(humanPlaying){
  //       treats[i].eaten(); 
  //       treats.splice(i, 1); 
  //     }
  //     player.lastScoreMillis = millis();
  //   }
  // }

  //Dog Beds
  // if (beds?.length >= 0 && beds[0]?.checkCollision(player) && !beds[0].idList.includes(player.uuid)) {
  //   player.stamina = player.maxStamina; //reset stamina
  //   beds[0].idList.push(player.uuid); //add player id
  //   if(humanPlaying)
  //     beds.splice(0, 1); 
  //   bedsRespawnTime = millis() + 20000;
  // }

  //TennisBall
  // if (balls?.length >= 0 && balls[0]?.checkCollision(player) && !balls[0].idList.includes(player.uuid)) {
  //   player.isInvincible = true;
  //   player.isInvinUntil = millis() + 10000;
  //   balls[0].idList.push(player.uuid); //add player id
  //   if(humanPlaying)
  //     balls.splice(0, 1); 
  //   ballRespawnTime = millis() + 40000;
  // }

   //Peanut Butter
  // if (pb?.length >= 0 && pb[0]?.checkCollision(player) && !pb[0].idList.includes(player.uuid)) {
  //   pb[0].idList.push(player.uuid); //add player id
  //   player.score += 10;
  //   if(humanPlaying)
  //     pb.splice(0, 1); 
  //   PBRespawnTime = millis() + 60000;
  //   player.lastScoreMillis = millis();
  // }


  //Enemies
  // for (let i = enemies.length - 1; i >= 0; i--) {
  // if (enemies[i].checkCollision(player) && !player.isInvincible) {
  //   player.dead = true;
  // }

  //enemy invincibility handling
//   if (enemies[i]) {
//     if (player.isInvincible) {
//       enemies[i].playInvin = true;  
//     } else {
//       enemies[i].playInvin = false; 
//     }
//   }
// }

// }

//function to reset the game state
function resetGame() {
  // Treat.resetSpawns();
  // Enemy.resetSpawns();
  // DogBed.resetSpawns();
  // TennisBall.resetSpawns();
  // PeanutButter.resetSpawns();

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
  bedsRespawnTime = millis() + 20000;       //dog bed in 20 seconds
  ballRespawnTime = millis() + 40000;    //TennisBall in 40 seconds
  PBRespawnTime = millis() + 60000;         //peanut butter in 60 seconds

  enemyRespawnTime = millis() + 5000;       //enemies every 5 seconds
  treatRemoveTime = millis() + 1000;        //treats removed after 1 second

  for (let i = 0; i < 25; i++) {
    treats.push(new Treat(treat, 20, 20));
  }

  for (let i = 0; i < 5; i++) {
    enemies.push(new Enemy());
  }

  for(let i = 0; i < population.genomes.length; i++) {
    population.players[i] = new Player(population.genomes[i]);
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


