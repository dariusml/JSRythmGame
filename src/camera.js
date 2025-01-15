
var camera = {

    position: new Vector2(),
    targetPosition: new Vector2(),
    target: null,

    minX: -100,
    maxX: 100,
    minY: -100,
    maxY: 100,

    smothingSpeed: 4,
    shakingValue: new Vector2(),
    shakingTime: 0,
    shakingSpeed: 40,
    shakingSize: 5,
    shakeInitRandom: new Vector2(),

    timeSinceStart: 0,

    zoom: 1,

    Start: function(player) {
        this.target = player;

        this.maxX = 100000;
        this.maxY = 100000;
        
        this.position.x = this.target.position.x - canvas.width / 2;
        this.position.y = this.target.position.y - canvas.height / 2;
    },

    Update: function(deltaTime) {
        this.timeSinceStart += deltaTime;
        //this.zoom = (Math.cos(this.timeSinceStart * 0.75) + 1.5) * 1;

        this.targetPosition.x = this.target.position.x - canvas.width / 2;
        this.targetPosition.y = this.target.position.y - canvas.height / 2;

        this.shakingValue.x = this.shakingValue.y = 0;
        if (this.shakingTime > 0)
        {
            this.shakingTime -= deltaTime;
            this.shakingValue.x = Math.cos(this.shakeInitRandom.x + this.shakingTime * this.shakingSpeed) * this.shakingSize;
            this.shakingValue.y = Math.sin(this.shakeInitRandom.y + this.shakingTime * this.shakingSpeed) * this.shakingSize;

            this.zoom += 0.002;
        }
        else
            this.zoom -= 0.05;

        if (this.zoom < 1)
            this.zoom = 1;

        const smothStep = this.smothingSpeed * deltaTime;
        this.position.x += ((this.targetPosition.x - this.position.x) * smothStep) + this.shakingValue.x;
        this.position.y += ((this.targetPosition.y - this.position.y) * smothStep) + this.shakingValue.y;

        //this.position.x = this.targetPosition.x;
        //this.position.y = this.targetPosition.y;
    },

    PreDraw: function(ctx) {
        ctx.save();

        ctx.translate(-this.position.x * this.zoom + canvas.width/2, -this.position.y * this.zoom + canvas.height/2);
        ctx.scale(this.zoom, this.zoom);
        ctx.translate(-canvas.width/2, -canvas.height/2);
    },

    PostDraw: function(ctx) {
        ctx.restore();
    },

    Shake: function(time, speed, size) {
        this.shakingTime = time;
        this.shakingSpeed = speed;
        this.shakingSize = size;
        this.shakeInitRandom.Random();
    }

}