let ground, groundImg, dinoRun1Img, dinoRun2Img, dinoDuck1Img, dinoDuck2Img;
let largeTripleCactusImg, largeDoubleCactusImg, largeSingleCactusImg;
let smallTripleCactusImg, smallDoubleCactusImg, smallSingleCactusImg;
let font;

let allObstacleImgs = [];
let obstacleSpawnTimer = 50;
let allObstacles = [];
let obstacleCount = 0;

let updateLogicSpeed = 1;
let gameSpeed = 10;
let speedIncrement = 0.5;
let score = 0;
let lastScoreMilestone = 0;
let visualizationMode = false;

let generation = 1;
let population = [];
let populationSize = 500;
let alive = populationSize;
let nextConnectionNumber = 1000;
let networkVisualizer;
let displayNetwork = true;
let visualizeClosestObstacle = false;

function preload() {
	groundImg = loadImage("./assets/ground.png");
	dinoRun1Img = loadImage("./assets/dinorun1.png");
	dinoRun2Img = loadImage("./assets/dinorun2.png");
	dinoDuck1Img = loadImage("./assets/dinoduck1.png");
	dinoDuck2Img = loadImage("./assets/dinoduck2.png");

	largeTripleCactusImg = loadImage("./assets/cactuslargetriple.png");
	largeDoubleCactusImg = loadImage("./assets/cactuslargedouble.png");
	largeSingleCactusImg = loadImage("./assets/cactuslargesingle.png");
	smallTripleCactusImg = loadImage("./assets/cactussmalltriple.png");
	smallDoubleCactusImg = loadImage("./assets/cactussmalldouble.png");
	smallSingleCactusImg = loadImage("./assets/cactussmallsingle.png");

	font = loadFont("./assets/PublicPixel.ttf");
}

function setup() {
	createCanvas(2400, 1280);
	frameRate(60);

	allObstacleImgs = [
		largeTripleCactusImg, largeDoubleCactusImg, largeSingleCactusImg,
		smallTripleCactusImg, smallDoubleCactusImg, smallSingleCactusImg
	];

	ground = new Ground();
	population = new Population(populationSize);
	networkVisualizer = new NetworkVisualizer(population.population[0].brain, width / 6, height / 16, 1500, 500);
}

function draw() {
	for (let i = 0; i < updateLogicSpeed; i++) {
		score += gameSpeed / 60;
		if (floor(score) - lastScoreMilestone >= 100) {
			lastScoreMilestone = floor(score);
			gameSpeed += speedIncrement;
		}

		if (obstacleSpawnTimer >= 110 - gameSpeed) {
			if (obstacleCount < 3 && random(1) < 0.6 || obstacleCount >= 3 && random(1) < 0.85) {
				allObstacles.push(new Cactus());
			} else {
				allObstacles.push(new Bird());
			}
			obstacleCount++;
			obstacleSpawnTimer = getRandomInterval();
		}
		obstacleSpawnTimer++;

		allObstacles.forEach((obstacle, i) => {
			obstacle.update();

			population.population.forEach(player => {
				if (!player.isAlive) return;

				if (obstacle.isBird && obstacle.collidedWithPlayer(player, true) ||
					!obstacle.isBird && obstacle.collidedWithPlayer(player, false)) {
					player.isAlive = false;
					player.score = score;
					alive--;
				}

				if (obstacle.playerPassed(player) && !player.obstaclesPassed.has(obstacle.id)) {
					if (player.isDucking && obstacle.isBird) {
						player.birdsPassedWhileDucking++;
					} else if (!player.isDucking && obstacle.isBird) {
						player.birdsPassedWhileJumping++;
					}
					player.obstaclesPassed.add(obstacle.id);
				}

				obstacle.playerPassedForAI(player);
			});

			if (obstacle.offScreen()) {
				allObstacles.splice(i, 1);
				i--;
			}
		});

		ground.update();

		if (population.allDead()) {
			resetGame();
		} else {
			population.updatePlayers();
		}
	}

	background(247);

	if (displayNetwork) {
		networkVisualizer.show(population.bestPlayer);
	}

	ground.show();

	allObstacles.forEach(obstacle => obstacle.show());

	if (!population.allDead()) {
		population.showPlayers();
	}

	if (visualizeClosestObstacle) {
		population.population.forEach(player => {
			if (player.isAlive) {
				player.visualizeClosestObstacle();
			}
		});
	}

	if (visualizationMode) {
		visualizeHitBoxes();
	}

	displayText();
}

function resetGame() {
	generation++;
	allObstacles = [];
	obstacleCount = 0;
	obstacleSpawnTimer = 50;
	gameSpeed = 10;
	score = 0;
	lastScoreMilestone = 0;
	alive = populationSize;
	population.naturalSelection();
}

function padScore(score) {
	return score.toString().padStart(5, '0');
}

function getRandomInterval() {
	return int(random(-30, 30));
}

function visualizeHitBoxes() {
	stroke(255, 0, 0);
	noFill();

	population.population.forEach(dino => {
		if (!dino.isAlive) return;

		if (dino.isDucking) {
			rect(dino.x + 30, dino.y + 60, dino.width - 60, dino.height - 60);
		} else {
			rect(dino.x + 30, dino.y + 30, dino.width - 60, dino.height - 60);
		}
	});

	allObstacles.forEach(obstacle => {
		rect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
	});
}

function displayText() {
	textFont(font);
	fill(53);
	noStroke();
	textSize(40);
	textAlign(LEFT);

	let scoreText = "Score: " + padScore(floor(score));
	let generationText = "Gen: " + generation;
	let aliveText = "Alive: " + alive;

	text(scoreText, width - textWidth(scoreText) - 100, 100);
	text(generationText, width - 500, 175);
	text(aliveText, width - 580, 250);
}

function keyPressed() {
	if (key === "v") {
		visualizationMode = !visualizationMode;
	}
	if (key === "n") {
		displayNetwork = !displayNetwork;
	}
	if (key === "b") {
		visualizeClosestObstacle = !visualizeClosestObstacle;
	}
	if (key >= "1" && key <= "5") {
		updateLogicSpeed = int(key);
	}
}
