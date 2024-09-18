class Obstacle {
	constructor(x, y, width, height) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.passed = false;
	}

	offScreen() {
		return this.x < -300;
	}

	collidedWithPlayer(player, isBird) {
		const playerRightEdge = player.x + player.width - 30;
		const playerBottomEdge = player.y + player.height - 30;

		if (player.x + 30 < this.x + this.width && playerRightEdge > this.x) {
			if (player.isDucking) {
				return player.y + 60 > this.y && player.y + 60 < this.y + this.height;
			} else if (isBird) {
				return (player.y + 30 > this.y && player.y + 30 < this.y + this.height) ||
				       (playerBottomEdge < this.y + this.height && playerBottomEdge > this.y);
			} else {
				return player.y + 30 + player.height - 60 > this.y;
			}
		}

		return false;
	}

	playerPassed(player) {
		return player.x > this.x + this.width;
	}

	playerPassedForAI(player) {
		if (!this.passed && player.x > this.x + this.width) {
			this.passed = true;
		}
	}
}
