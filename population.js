class Population {
	constructor(size) {
		this.populationSize = size;
		this.population = [];
		this.generation = 1;
		this.bestPlayer = null;
		this.bestFitness = 0;

		this.species = [];
		this.innovationHistory = [];

		this.initializePopulation();
	}

	initializePopulation() {
		for (let i = 0; i < this.populationSize; i++) {
			let player = new Player();
			player.brain.mutate(this.innovationHistory);
			player.brain.generateNetwork();
			this.population.push(player);
		}
	}

	updatePlayers() {
		this.population.forEach(player => {
			if (player.isAlive) {
				player.look();
				player.think();
				player.update();
			}
		});
	}

	showPlayers() {
		this.population.forEach(player => {
			if (player.isAlive) {
				player.show();
			}
		});
	}

	allDead() {
		return this.population.every(player => !player.isAlive);
	}

	setBestPlayer() {
		this.bestPlayer = this.population.reduce((best, player) => 
			player.fitness > best.fitness ? player.clone() : best, 
			this.bestPlayer || { fitness: 0 }
		);
		this.bestFitness = this.bestPlayer.fitness;
	}

	getAverageFitnessSum() {
		return this.species.reduce((sum, s) => sum + s.averageFitness, 0);
	}

	naturalSelection() {
		this.speciate();
		this.calculateFitness();
		this.sortSpecies();
		this.killWeakest();
		this.setBestPlayer();
		this.killStaleSpecies();
		this.killExtinctSpecies();
		this.nextGeneration();
	}

	speciate() {
		this.species.forEach(species => species.players = []);

		this.population.forEach(player => {
			let speciesFound = this.species.find(species => species.isSameSpecies(player.brain));
			if (speciesFound) {
				speciesFound.addToSpecies(player);
			} else {
				this.species.push(new Species(player));
			}
		});
	}

	calculateFitness() {
		this.population.forEach(player => player.calculateFitness());
	}

	sortSpecies() {
		this.species.forEach(species => species.sortSpecies());
		this.species.sort((a, b) => b.bestFitness - a.bestFitness);
	}

	killWeakest() {
		this.species.forEach(species => {
			species.killWeakest();
			species.fitnessSharing();
			species.setAverageFitness();
		});
	}

	killStaleSpecies() {
		this.species = this.species.filter(species => species.staleness < 15);
	}

	killExtinctSpecies() {
		const averageSum = this.getAverageFitnessSum();
		this.species = this.species.filter(species => 
			(species.averageFitness / averageSum) * this.populationSize >= 1
		);
	}

	nextGeneration() {
		const averageSum = this.getAverageFitnessSum();
		let children = [];

		this.species.forEach(species => {
			children.push(species.champion.clone());
			const childrenPerSpecies = Math.floor((species.averageFitness / averageSum) * this.populationSize) - 1;
			for (let j = 0; j < childrenPerSpecies; j++) {
				children.push(species.reproduce(this.innovationHistory));
			}
		});

		while (children.length < this.populationSize) {
			children.push(this.species[0].reproduce(this.innovationHistory));
		}

		this.population = children;
		this.generation++;
		this.population.forEach(player => player.brain.generateNetwork());
	}
}
