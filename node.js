class Node {
	constructor(idNumber) {
		this.id = idNumber;
		this.layer = 0;
		this.inputValue = 0;
		this.outputValue = 0;
		this.outputConnections = [];
	}

	engage() {
		if (this.layer !== 0) {
			this.outputValue = this.sigmoid(this.inputValue);
		}

		this.outputConnections.forEach(connection => {
			if (connection.enabled) {
				connection.toNode.inputValue += connection.weight * this.outputValue;
			}
		});
	}

	sigmoid(x) {
		return 1.0 / (1.0 + Math.exp(-4.9 * x));
	}

	clone() {
		const clone = new Node(this.id);
		clone.layer = this.layer;
		return clone;
	}

	isConnectedTo(node) {
		if (node.layer === this.layer) return false;

		if (node.layer < this.layer) {
			return node.outputConnections.some(conn => conn.toNode === this);
		} else {
			return this.outputConnections.some(conn => conn.toNode === node);
		}
	}
}
