class ConnectionHistory {
    constructor(fromNode, toNode, innovationNum, innovationNumbers) {
        this.fromNode = fromNode;
        this.toNode = toNode;
        this.innovationNumber = innovationNum;
        this.innovationNumbers = [...innovationNumbers];
    }

    matches(genome, fromNode, toNode) {
        if (genome.connections.length !== this.innovationNumbers.length) {
            return false;
        }

        if (fromNode.id !== this.fromNode || toNode.id !== this.toNode) {
            return false;
        }

        const innovationNumbersSet = new Set(this.innovationNumbers);
        return genome.connections.every(conn => innovationNumbersSet.has(conn.innovationNumber));
    }
}
