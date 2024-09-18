class Connection {
    constructor(fromNode, toNode, weight, innovationNumber) {
        this.fromNode = fromNode;
        this.toNode = toNode;
        this.weight = weight;
        this.enabled = true;
        this.innovationNumber = innovationNumber;
    }

    mutateWeight() {
        this.weight = Math.random() < 0.1 
            ? Math.random() * 2 - 1 
            : this.weight + Math.randomGaussian() / 50;

        this.weight = Math.max(-1, Math.min(1, this.weight));
    }

    clone(fromNode, toNode) {
        const copy = new Connection(fromNode, toNode, this.weight, this.innovationNumber);
        copy.enabled = this.enabled;
        return copy;
    }
}
