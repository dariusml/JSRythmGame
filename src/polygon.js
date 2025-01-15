class Polygon
{
    constructor(nvertices)
    {
        this.position = new Vector2(0,0);

        this.vertices = [];

        for(let i = 0; i<nvertices; ++i)
        {
            this.vertices.push(new Vector2(0,0));
        }
        this.center = new Vector2(0,0);

        this.fillStyle = "Red";
        this.strokeStyle = "#FFFFFF";
        this.lineWidth = 1;
    }

    rotatePolygonAroundPoint(pivot, angle)
    {
        this.center.rotateAround(pivot, angle)
        for(let i = 0; i<this.vertices.length; ++i)
        {
            this.vertices[i].rotateAround(pivot, angle);
        }
    }

    moveTo(newPos)
    {
        let xOffset = newPos.x - this.center.x;
        let yOffset = newPos.y - this.center.y;

        this.center.x += xOffset;
        this.center.y += yOffset;

        for(let i = 0; i<this.vertices.length; ++i)
        {
            this.vertices[i].x += xOffset
            this.vertices[i].y += yOffset
        }

        this.position.x = newPos.x;
        this.position.y = newPos.y;
    }

    Draw(ctx,stroke = false)
    {
        ctx.beginPath();
        ctx.moveTo(this.vertices[0].x, this.vertices[0].y);

        for(let i = 0; i<=this.vertices.length;++i)
        {
            ctx.lineTo(this.vertices[i%this.vertices.length].x, this.vertices[i%this.vertices.length].y)
        }

        ctx.lineWidth = this.lineWidth;
        ctx.fillStyle = this.fillStyle;
        ctx.strokeStyle = this.strokeStyle;

        ctx.fill();
        if(stroke)
        {
            ctx.stroke();
            console.log("Stroke dibujado")
        }
    }
}