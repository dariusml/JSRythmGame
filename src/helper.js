
const PI2 = Math.PI * 2;
const PIH = Math.PI / 2;
const degToRad = Math.PI / 180;
const radToDeg = 180 / Math.PI;


function clamp(min,max,value)
{
    if(value>max) return max;
    if(value<min) return min;

    return value;
}

function convertoToPositiveAngle(angle)
{
    let newAngle = angle%PI2;

    if(newAngle < 0 ) newAngle = PI2+newAngle;

    return newAngle;
}

function lerp(initialValue, finalValue, proportion)
{
    return initialValue + (finalValue-initialValue) * proportion;
}

function RandomBetween(min, max)
{
    return (Math.random() * (max - min)) + min;
}

function GetRandomColor() {
    var r = 255 * Math.random() | 0,
        g = 255 * Math.random() | 0,
        b = 255 * Math.random() | 0;
    return 'rgb(' + r + ',' + g + ',' + b + ')';
}

function SqrDistance(p1, p2)
{
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;

    return (dx * dx) + (dy * dy);
}

function PointInsideCircle(pointPosition, circlePosition, circleRadius)
{
    const difX = pointPosition.x - circlePosition.x;
    const difY = pointPosition.y - circlePosition.y;

    const dist = Math.sqrt(difX * difX + difY * difY);

    return dist < circleRadius;
}

function PointInsideCircle2(pointPosition, circlePosition, circleSqrRadius)
{
    return SqrDistance(pointPosition, circlePosition) < circleSqrRadius;
}

function PointInsideRectangle(point, rectangle)
{
    return point.x >= (rectangle.position.x) &&
           point.x <= (rectangle.position.x + rectangle.width) &&
           point.y >= (rectangle.position.y) &&
           point.y <= (rectangle.position.y + rectangle.height);
}

function PointInsideRectangle2(point, rectangle)
{
    return point.x >= (rectangle.position.x-rectangle.width/2) &&
           point.x <= (rectangle.position.x + rectangle.width/2) &&
           point.y >= (rectangle.position.y - rectangle.height/2) &&
           point.y <= (rectangle.position.y + rectangle.height/2);
}

function CheckCollisionPolygon(point, polygon)
{
    // polygon es un array de puntos
    let count = polygon.length;
    for (var i = 0; i < polygon.length; i++)
    {
        let d = PointToSegmentSign(polygon[i], polygon[(i + 1) % polygon.length], point);
        if (d < 0)
            count--;
    }
    return (count == 0);
}
 
function DistancePointToSegment (A, B, p)
{
    // A y B son los puntos de la recta
    return (((B.x - A.x)*(A.y - p.y) - (A.x - p.x)*(B.y - A.y)) /
            (Math.sqrt((B.x - A.x)*(B.x - A.x) + (B.y - A.y)*(B.y - A.y))));
}

function PointToSegmentSign(A, B, p)
{
    return ((B.x - A.x)*(A.y - p.y) - (A.x - p.x)*(B.y - A.y));
}

function RotatePointAroundPoint(origCoord, pointCoord, angle)
{
    var x = pointCoord.x,
        y = pointCoord.y,
        cx = origCoord.x,
        cy = origCoord.y;
    var rad = angle;//(Math.PI / 180) * angle;
    var cos = Math.cos(rad);
    var sin = Math.sin(rad);
    return {
        x: (cos * (x - cx)) + (sin * (y - cy)) + cx,
        y: (cos * (y - cy)) - (sin * (x - cx)) + cy
    };
}

function IntersectionBetweenLines(p1, p2, p3, p4)
{
    let c2x = p3.x - p4.x; // (x3 - x4)
    let c3x = p1.x - p2.x; // (x1 - x2)
    let c2y = p3.y - p4.y; // (y3 - y4)
    let c3y = p1.y - p2.y; // (y1 - y2)

    // down part of intersection point formula
    let d  = c3x * c2y - c3y * c2x;

    if (d == 0) {
      throw new Error('Number of intersection points is zero or infinity.');
  }

    // upper part of intersection point formula
    let u1 = p1.x * p2.y - p1.y * p2.x; // (x1 * y2 - y1 * x2)
    let u4 = p3.x * p4.y - p3.y * p4.x; // (x3 * y4 - y3 * x4)

    // intersection point formula
    
    let px = (u1 * c2x - c3x * u4) / d;
    let py = (u1 * c2y - c3y * u4) / d;
    
    let p = { x: px, y: py };

    return p;
}

class Vector2
{
    constructor(x, y)
    {
        this.x = x;
        this.y = y;
    }

    static Zero()
    {
        return new Vector2(0, 0);
    }

    static intersection(l1p1, l1p2, l2p1, l2p2)
    {
        let newIntersection = IntersectionBetweenLines(l1p1, l1p2, l2p1, l2p2);

        return new Vector2(newIntersection.x, newIntersection.y);
    }
    
    static getDirection(p1,p2)
    {
    dx= p2.x - p1.x;
    dy= p2.y - p1.y;

    return new Vector2(dx, dy);
    }

    static getAnotherPoint(p1, directorVector)
    {

        return new Vector2(p1.x + 2*directorVector.x, p1.y + 2*directorVector.y);
    }

    static normal(p1,p2){

    if(arguments.length == 1) //Si me pasan una direccion
    {
        dx = p1.x;
        dy = p1.y;

        return new Vector2(-dy, dx);
    }
    if(arguments.length == 2) //Si me pasan 2 ptos que hacen una direccion, primero hago el vector director y luego saco la normal del vector
    {
        dx = p2.x-p1.x;
        dy = p2.y-p1.y;

        return new Vector2(-dy, dx);
    }

    }

    Set(x, y)
    {
        this.x = x;
        this.y = y;
    }

    SetWithVector(vector)
    {
        this.x = vector.x;
        this.y = vector.y;
    }

    Length()
    {
        const x2 = this.x * this.x;
        const y2 = this.y * this.y;
        return Math.sqrt(x2 + y2);
    }

    Normalize()
    {
        length = this.Length();
        if(length > 0)
        {
            this.x = this.x/length;
            this.y = this.y/length;
        }
        else
        {
            this.x =0;
            this.y = 0;
        }
    }

    Add(otherVector)
    {
        this.x += otherVector.x;
        this.y += otherVector.y;
    }

    Sub(otherVector)
    {
        this.x -= otherVector.x;
        this.y -= otherVector.y;
    }

    DotProduct(otherVector)
    {
        // TODO
    }

    MultiplyScalar(scalar)
    {
        this.x *= scalar;
        this.y *= scalar;
    }

    AngleBetween(otherVector)
    {
        // vec1 and vec2 should be normalized

        // a · b = |a| × |b| × cos(θ)
        // cos(θ) = (a · b) / |a| × |b|
        // θ = arccos[(a · b) / |a| × |b|]
        // si a y b son unitarios: θ = arccos(a · b)
        
        // TODO

        return 0;
    }

    Random()
    {
        this.x = (Math.random() * 2) - 1;
        this.y = (Math.random() * 2) - 1;
    }

    RandomNormalized()
    {
        this.Random();
        this.Normalize();
    }




    rotateAround(pointToRotateAround, angle)
    {
        let newPoint = RotatePointAroundPoint(pointToRotateAround, {x: this.x, y: this.y}, angle);

        this.x = newPoint.x;
        this.y = newPoint.y;
    }
}


function getAngle(p1,p2)
{
    dy = p2.y - p1.y;
    dx = p2.x - p1.x;

    return Math.atan2(dy,dx);
}

function radToVector(angle)
{

    return new Vector2(Math.cos(angle), Math.sin(angle));
}

function normalize(vector)
{
    magnitudeVector = Math.sqrt(vector.x*vector.x + vector.y*vector.y);
    normalizedVector = {x:vector.x/magnitudeVector, y:vector.y/magnitudeVector};

    return new Vector2(normalizedVector.x, normalizedVector.y);
}

function radToDegree(radians){
    return radians *(180/Math.PI);
}