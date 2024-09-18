class Genome {
    constructor(inputs, outputs, crossover = false) {
        this.connections = [];
        this.nodes = [];
        this.inputs = inputs;
        this.outputs = outputs;
        this.layers = 2;
        this.nextNode = 0;
        this.biasNode = null;
        this.network = [];

        if (!crossover) {
            this.createNodes();
        }
    }

    createNodes() {
        for (let i = 0; i < this.inputs; i++) {
            this.nodes.push(new Node(i));
            this.nodes[i].layer = 0;
            this.nextNode++;
        }

        for (let i = 0; i < this.outputs; i++) {
            this.nodes.push(new Node(i + this.inputs));
            this.nodes[this.inputs + i].layer = 1;
            this.nextNode++;
        }

        this.biasNode = this.nextNode;
        this.nodes.push(new Node(this.biasNode));
        this.nodes[this.biasNode].layer = 0;
        this.nextNode++;
    }

    getNode(id) {
        return this.nodes.find(node => node.id === id) || null;
    }

    connectNodes() {
        this.nodes.forEach(node => node.outputConnections = []);
        this.connections.forEach(conn => conn.fromNode.outputConnections.push(conn));
    }

    feedForward(vision) {
        this.nodes.slice(0, this.inputs).forEach((node, i) => node.outputValue = vision[i]);
        this.nodes[this.biasNode].outputValue = 1;

        this.network.forEach(node => node.engage());

        const outputs = this.nodes.slice(this.inputs, this.inputs + this.outputs)
                                 .map(node => node.outputValue);

        this.nodes.forEach(node => node.inputValue = 0);

        return outputs;
    }

    generateNetwork() {
        this.connectNodes();
        this.network = this.nodes.filter(node => node.layer === 0)
                                  .concat(this.nodes.filter(node => node.layer === 1));
    }

    addNode(innovationHistory) {
        if (this.connections.length === 0) {
            this.addConnection(innovationHistory);
            return;
        }

        let connection;
        do {
            connection = this.connections[Math.floor(Math.random() * this.connections.length)];
        } while (connection.fromNode === this.nodes[this.biasNode] && this.connections.length > 1);

        connection.enabled = false;

        const newNode = new Node(this.nextNode++);
        this.nodes.push(newNode);
        newNode.layer = connection.fromNode.layer + 1;

        this.connections.push(new Connection(connection.fromNode, newNode, 1,
                                             this.getInnovationNumber(innovationHistory, connection.fromNode, newNode)));
        this.connections.push(new Connection(newNode, connection.toNode, connection.weight,
                                             this.getInnovationNumber(innovationHistory, newNode, connection.toNode)));
        this.connections.push(new Connection(this.nodes[this.biasNode], newNode, 0,
                                             this.getInnovationNumber(innovationHistory, this.nodes[this.biasNode], newNode)));

        if (newNode.layer === connection.toNode.layer) {
            this.nodes.forEach(node => {
                if (node.layer >= newNode.layer && node !== newNode) {
                    node.layer++;
                }
            });
            this.layers++;
        }

        this.connectNodes();
    }

    addConnection(innovationHistory) {
        if (this.fullyConnected()) return;

        let node1, node2;
        do {
            node1 = Math.floor(Math.random() * this.nodes.length);
            node2 = Math.floor(Math.random() * this.nodes.length);
        } while (this.randomConnectionNodesFailed(node1, node2));

        if (this.nodes[node1].layer > this.nodes[node2].layer) [node1, node2] = [node2, node1];

        const connId = this.getInnovationNumber(innovationHistory, this.nodes[node1], this.nodes[node2]);
        this.connections.push(new Connection(this.nodes[node1], this.nodes[node2], Math.random() * 2 - 1, connId));
        this.connectNodes();
    }

    randomConnectionNodesFailed(r1, r2) {
        return this.nodes[r1].layer === this.nodes[r2].layer || this.nodes[r1].isConnectedTo(this.nodes[r2]);
    }

    getInnovationNumber(innovationHistory, fromNode, toNode) {
        let existing = innovationHistory.find(hist => hist.matches(this, fromNode, toNode));
        if (existing) return existing.innovationNumber;

        let connId = nextConnectionNumber++;
        innovationHistory.push(new ConnectionHistory(fromNode.id, toNode.id, connId,
                                                     this.connections.map(conn => conn.innovationNumber)));
        return connId;
    }

    fullyConnected() {
        let maxConnections = 0;
        const nodesInLayers = Array(this.layers).fill(0);

        this.nodes.forEach(node => nodesInLayers[node.layer]++);

        for (let i = 0; i < this.layers - 1; i++) {
            let nodesInFront = nodesInLayers.slice(i + 1).reduce((sum, count) => sum + count, 0);
            maxConnections += nodesInLayers[i] * nodesInFront;
        }

        return this.connections.length >= maxConnections;
    }

    mutate(innovationHistory) {
        if (this.connections.length === 0) {
            this.addConnection(innovationHistory);
            return;
        }

        if (Math.random() < 0.8) {
            this.connections.forEach(conn => conn.mutateWeight());
        }

        if (Math.random() < 0.05) {
            this.addConnection(innovationHistory);
        }

        if (Math.random() < 0.01) {
            this.addNode(innovationHistory);
        }
    }

    crossover(parent2) {
        const child = new Genome(this.inputs, this.outputs, true);
        child.connections = [];
        child.nodes = [];
        child.layers = this.layers;
        child.nextNode = this.nextNode;
        child.biasNode = this.biasNode;

        const childConnections = [];
        const isEnabled = [];

        this.connections.forEach(conn => {
            const parent2Index = this.matchingConnection(parent2, conn.innovationNumber);

            if (parent2Index !== "no connections mate") {
                const parent2Conn = parent2.connections[parent2Index];
                const enabled = conn.enabled && parent2Conn.enabled ? Math.random() < 0.75 : Math.random() < 0.5;
                childConnections.push(Math.random() < 0.5 ? conn : parent2Conn);
                isEnabled.push(enabled);
            } else {
                childConnections.push(conn);
                isEnabled.push(conn.enabled);
            }
        });

        this.nodes.forEach(node => child.nodes.push(node.clone()));

        childConnections.forEach((conn, i) => {
            child.connections.push(conn.clone(child.getNode(conn.fromNode.id), child.getNode(conn.toNode.id)));
            child.connections[i].enabled = isEnabled[i];
        });

        child.connectNodes();
        return child;
    }

    matchingConnection(parent2, innovationNumber) {
        return parent2.connections.findIndex(conn => conn.innovationNumber === innovationNumber) || "no connections mate";
    }

    clone() {
        const clone = new Genome(this.inputs, this.outputs, true);

        this.nodes.forEach(node => clone.nodes.push(node.clone()));

        this.connections.forEach(conn => {
            clone.connections.push(conn.clone(clone.getNode(conn.fromNode.id), clone.getNode(conn.toNode.id)));
        });

        clone.layers = this.layers;
        clone.nextNode = this.nextNode;
        clone.biasNode = this.biasNode;
        clone.connectNodes();

        return clone;
    }
}
