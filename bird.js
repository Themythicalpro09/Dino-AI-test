class Bird extends Obstacle {
    constructor() {
        const birdProps = Bird.createBirdProperties();
        super(birdProps.x, birdProps.y, birdProps.width, birdProps.height);
        
        this.displayImage = true;
        this.frameTimer = 0;
        this.movementSpeed = birdProps.speed;
        this.frameDelay = 25;
    }

    static createBirdProperties() {
        const x = width + 225;
        const y = Math.random() < 0.5 ? height - 456 : height - 556;
        const speed = Math.random() * gameSpeed / 4 - gameSpeed / 8;
        
        return {
            x: x,
            y: y,
            width: birdImg1.width,
            height: birdImg1.height,
            speed: speed
        };
    }

    move() {
        this.x -= gameSpeed + this.movementSpeed;
    }

    update() {
        this.move();
        this.frameTimer = (this.frameTimer + 1) % this.frameDelay;
        this.displayImage = this.frameTimer < this.frameDelay / 2;
    }

    show() {
        const birdImage = this.displayImage ? birdImg1 : birdImg2;
        image(birdImage, this.x, this.y, this.width, this.height);
    }
}
