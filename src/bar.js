class ProgressBar{

    constructor(position, width, height)
    {
        this.value=0;

        this.width = width;
        this.height = height;

        this.position = position;
        this.size = new Vector2(this.width,this.height);

        this.fillStyleBack = "#BBBBBB";
        this.fillStyleBar  = "#FFFFFF";
    }

    Draw(ctx)
    {
        ctx.fillStyle = this.fillStyleBack;
        ctx.fillRect(this.position.x, this.position.y, this.size.x, this.size.y);

        ctx.fillStyle = this.fillStyleBar;
        ctx.fillRect(this.position.x, this.position.y, this.size.x*this.value, this.size.y);

    }

}