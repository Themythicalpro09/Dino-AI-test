class Cactus extends Obstacle {
    constructor() {
        const { x, y, width, height, image } = Cactus.createProperties();
        super(x, y, width, height);
        this.image = image;
    }

    static createProperties() {
        const cactusIndex = Math.floor(Math.random() * 6);
        const cactusImage = allCactiImgs[cactusIndex];
        const width = cactusImage.width;
        const height = cactusImage.height;
        const x = width + 225;
        const y = height - 206 - height;

        return { x, y, width, height, image: cactusImage };
    }

    move() {
        this.x -= gameSpeed;
    }

    update() {
        this.move();
    }

    render() {
        image(this.image, this.x, this.y, this.width, this.height);
    }
}