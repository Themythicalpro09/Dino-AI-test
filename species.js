class Species {
	constructor(player) {
		this.players = [];
		this.bestFitness = 0;
		this.champion = null;
		this.averageFitness = 0;
		this.staleness = 0;
		this.benchmarkBrain = null;

		this.excessCoeff = 1;
		this.weightDiffCoeff = 0.5;
		this.compatibilityThreshold = 3;

		if (player) {
			this.players.push(player);
			this.bestFitness = player.fitness;
			this.benchmarkBrain = player.brain.clone();
			this.champion = player.clone();
		}
	}

	isSameSpecies(genome) {
		let excessAndDisjoint = this.getExcessAndDisjoint(genome, this.benchmarkBrain);
		let averageWeightDiff = this.averageWeightDiff(genome, this.benchmarkBrain);

		let largeGenomerNormalizer = Math.max(genome.connections.length - 20, 1);

		let compatibility =
			(this.excessCoeff * excessAndDisjoint) / largeGenomerNormalizer +
			this.weightDiffCoeff * averageWeightDiff;

		return this.compatibilityThreshold > compatibility;
	}

	getExcessAndDisjoint(brain1, brain2) {
		let matching = 0;
		for (let conn1 of brain1.connections) {
			for (let conn2 of brain2.connections) {
				if (conn1.innovationNumber === conn2.innovationNumber) {
					matching++;
					break;
				}
			}
		}
		return brain1.connections.length + brain2.connections.length - 2 * matching;
	}

	averageWeightDiff(brain1, brain2) {
		if (!brain1.connections.length || !brain2.connections.length) {
			return 0;
		}

		let matching = 0;
		let totalDifference = 0;

		for (let conn1 of brain1.connections) {
			for (let conn2 of brain2.connections) {
				if (conn1.innovationNumber === conn2.innovationNumber) {
					matching++;
					totalDifference += Math.abs(conn1.weight - conn2.weight);
					break;
				}
			}
		}

		return matching === 0 ? 100 : totalDifference / matching;
	}

	addToSpecies(player) {
		this.players.push(player);
	}

	sortSpecies() {
		this.players.sort((a, b) => b.fitness - a.fitness);

		if (!this.players.length) {
			this.staleness = 200;
			return;
		}

		if (this.players[0].fitness > this.bestFitness) {
			this.staleness = 0;
			this.bestFitness = this.players[0].fitness;
			this.benchmarkBrain = this.players[0].brain.clone();
			this.champion = this.players[0].clone();
		} else {
			this.staleness++;
		}
	}

	killWeakest() {
		if (this.players.length > 2) {
			this.players.splice(Math.floor(this.players.length / 2));
		}
	}

	fitnessSharing() {
		for (let player of this.players) {
			player.fitness /= this.players.length;
		}
	}

	setAverageFitness() {
		let totalFitness = this.players.reduce((sum, player) => sum + player.fitness, 0);
		this.averageFitness = totalFitness / this.players.length;
	}

	selectPlayer() {
		let fitnessSum = this.players.reduce((sum, player) => sum + player.fitness, 0);
		let rand = Math.random() * fitnessSum;
		let runningSum = 0;

		for (let player of this.players) {
			runningSum += player.fitness;
			if (runningSum > rand) {
				return player;
			}
		}

		return this.players[0];
	}

	reproduce(innovationHistory) {
		let child;

		if (Math.random() < 0.25) {
			child = this.selectPlayer().clone();
		} else {
			let parent1 = this.selectPlayer();
			let parent2 = this.selectPlayer();
			child = parent1.fitness < parent2.fitness ? parent2.crossover(parent1) : parent1.crossover(parent2);
		}

		child.brain.mutate(innovationHistory);
		return child;
	}
}
