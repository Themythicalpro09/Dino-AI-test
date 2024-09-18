class Player {
	constructor() {
		this.x = width / 6;
		this.y = height - 350;
		this.width = 132;
		this.height = 144;

		this.isGrounded = true;
		this.isDucking = false;
		this.velocityY = 0;
		this.gravity = 1;
		this.maxFallSpeed = 30;

		this.animTimer = 0;
		this.displayRun1 = true;
		this.displayDuck1 = false;

		this.obstacles = [];
		this.obstacleSpawnTimer = 50;
		this.obstacleIndex = 0;
		this.obstaclesPassed = new Set();

		this.isAlive = true;

		this.fitness = 0;
		this.score = 0;
		this.totalJumps = 0;
		this.totalDucks = 0;
		this.birdsPassedWhileDucking = 0;
		this.birdsPassedWhileJumping = 0;

		this.decision = [];
		this.vision = [0, 0, 0, 0, 0, 0];

		this.inputs = 6;
		this.outputs = 3;
		this.brain = new Genome(this.inputs, this.outputs);
	}

	move() {
		this.y -= this.velocityY;
		if (!this.isGrounded) {
			this.velocityY -= this.gravity;
			if (this.y > height - 350) {
				this.velocityY = 0;
				this.y = height - 350;
				this.isGrounded = true;
				if (this.isDucking) {
					this.width = 177;
				}
			}
		}
	}

	jump(isBigJump) {
		if (this.isDucking) {
			this.stopDucking();
		}

		if (this.isGrounded) {
			this.isGrounded = false;
			this.totalJumps++;
			this.velocityY = isBigJump ? 22 : 18;
			this.gravity = isBigJump ? 1 : 1.2;
		}
	}

	duck() {
		if (!this.isDucking) {
			this.isDucking = true;
			this.gravity = 5;
			this.totalDucks++;
			if (this.isGrounded) {
				this.width = 177;
			}
		}
	}

	stopDucking() {
		this.isDucking = false;
		this.width = 132;
	}

	update() {
		this.move();

		this.animTimer++;
		if (this.animTimer === 5) {
			this.animTimer = 0;
			this.displayRun1 = !this.displayRun1;
			if (this.isDucking) {
				this.displayDuck1 = !this.displayDuck1;
			}
		}
	}

	show() {
		const img = !this.isGrounded ? dinoRun2Img :
					(this.isDucking ? (this.displayDuck1 ? dinoDuck1Img : dinoDuck2Img) :
					(this.displayRun1 ? dinoRun1Img : dinoRun2Img));
		image(img, this.x, this.y, this.width, this.height);
	}

	closestObstacle() {
		return allObstacles.findIndex(obstacle => !obstacle.passed);
	}

	look() {
		this.vision = [0, 0, 0, 0, 0, 0];

		const closestObstacleIndex = this.closestObstacle();
		const closestObstacle = allObstacles[closestObstacleIndex];

		if (!closestObstacle) return;

		const distanceToObstacle = Math.abs(
			closestObstacle.x + closestObstacle.width / 2 - (this.x + this.width / 2)
		);

		const nextObstacle = allObstacles[closestObstacleIndex + 1];
		const gapBetweenObstacles = nextObstacle ? nextObstacle.x - (closestObstacle.x + closestObstacle.width) : 0;

		this.vision[0] = map(this.y, 930, 677, 0, 1);
		this.vision[1] = map(distanceToObstacle, 0, 2400, 1, 0);
		this.vision[2] = map(closestObstacle.width, 0, 225, 0, 1);
		this.vision[3] = map(closestObstacle.height, 0, 144, 0, 1);
		this.vision[4] = closestObstacle.isBird ? map(Math.abs(closestObstacle.y + closestObstacle.height - this.y), 0, 62, 0, 1) : 0;
		this.vision[5] = map(gameSpeed, 10, 40, 0, 1);
	}

	think() {
		this.decision = this.brain.feedForward(this.vision);
		const maxDecisionValue = Math.max(...this.decision);
		const actionIndex = this.decision.indexOf(maxDecisionValue);

		if (maxDecisionValue < 0.7) {
			this.stopDucking();
			return;
		}

		switch (actionIndex) {
			case 0:
				this.jump(true);
				break;
			case 1:
				this.jump(false);
				break;
			case 2:
				this.duck();
				break;
		}
	}

	calculateFitness() {
		this.fitness = this.score;
		this.fitness -= this.totalJumps * 5;
		this.fitness -= this.birdsPassedWhileJumping * 50;
		this.fitness += this.birdsPassedWhileDucking * 100;
		this.fitness = Math.max(0, this.fitness * this.fitness);
	}

	clone() {
		const clone = new Player();
		clone.brain = this.brain.clone();
		clone.brain.generateNetwork();
		return clone;
	}

	crossover(parent2) {
		const child = new Player();
		child.brain = this.brain.crossover(parent2.brain);
		child.brain.generateNetwork();
		return child;
	}

	visualizeClosestObstacle() {
		const closestObstacleIndex = this.closestObstacle();
		const closestObstacle = allObstacles[closestObstacleIndex];
		if (closestObstacle) {
			stroke(255, 0, 0);
			line(this.x + this.width / 2, this.y, closestObstacle.x + closestObstacle.width / 2, this.y);
		}
	}
}
