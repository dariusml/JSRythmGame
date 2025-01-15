class Player {

    constructor()
    {
        this.map = null;
        this.distanceBetweenBalls = null;
        this.direction= -1;
        this.position= null;
        this.automode= false;

        this.hitSound= null;
        this.hitSound2= null;
        this.currentHitSound = null;
    
        this.balls= [2];
        this.pivotBall= 0;
    }

    setTargetMap(map)
    {
        this.map = map;
        this.distanceBetweenBalls = map.tilesWidth;
        
        //Creo las bolas e inicializo sus parámetros y posición para que sea acorde con el mapa
        this.balls[0] = new Ball(); this.balls[0].color = "Yellow";
        this.balls[1] = new Ball(); this.balls[1].color = "Blue";

        this.balls[0].position = Vector2.Zero();
        this.balls[0].position.Add(map.beatNodes[0].position);
        this.balls[0].lastPosition.SetWithVector(this.balls[0].position);

        this.balls[1].position = new Vector2(this.balls[0].position.x - this.distanceBetweenBalls, this.balls[0].position.y);
        this.balls[1].lastPosition.SetWithVector(this.balls[1].position);


        this.position = this.balls[this.pivotBall].position;
    }

    Start() {
        this.hitSound = new Audio('assets/hitSound.ogg');
        this.hitSound2= new Audio('assets/hitSound2.ogg')
    }

    Update(deltaTime) {

        if( !this.map.endMapReached() ) //Si aun no hemos llegado al ultimo nodo
        {

            //Para hacer los calculos de posicion de la pelota
            let angle = this.calculateCurrentBallAngle();

            this.balls[(this.pivotBall + 1)%2].position = this.getBallNewPosition(angle, this.balls[(this.pivotBall)].position);
    
            //INPUTS
            if(Input.IsKeyDown(KEY_SPACE))
            {
                //Compruebo si el timing es correcto
                this.pressKeyForBeat();
            }
            if(this.automode)
            {
                if(this.map.timeSinceStart >= this.map.beatNodes[this.map.currentNode + 1].timeOfBeat )
                {
                    this.pressKeyForBeat();
                }
            }
    
            this.position = this.balls[this.pivotBall].position;

        }
        

    }

    StartAtMapBeatNode(indexOfBeatNode)
    {
        //En caso de que "indexOfBeatNode" sea el ultimo nodo, lo capamos y lo llevamos 1 nodo atras
        indexOfBeatNode = clamp(0, this.map.beatNodes.length -2,indexOfBeatNode );

        for(let i = 0; i<this.map.beatNodes.length; ++i)
        {
            if(i<indexOfBeatNode)
            {
                this.map.beatNodes[i].active = false;
            }
            else
            {
                this.map.beatNodes[i].active = true;
            }
            this.map.currentNode = indexOfBeatNode;

            //Pongo el tiempo acorde al beat por el que va ahora
            this.map.timeOfBegining = Date.now() - this.map.beatNodes[ clamp(0,this.map.beatNodes.length - 1,indexOfBeatNode)].timeOfBeat * 1000;

            this.pivotBall = indexOfBeatNode % 2;
            this.balls[this.pivotBall].position = this.map.beatNodes[indexOfBeatNode].position;
            this.balls[(this.pivotBall+1)%2].position.SetWithVector(this.map.beatNodes[this.map.currentNode + 1].position);

            this.direction = this.map.beatNodes[indexOfBeatNode].DirectionAfterIntroduction;

            this.map.song.currentTime = this.map.beatNodes[indexOfBeatNode].timeOfBeat;
            this.map.song.play()
        }
    }

    getBallNewPosition(angle, pivot)
    {
        let newPos = new Vector2();
        newPos.SetWithVector(this.map.beatNodes[this.map.currentNode].position);
        newPos.Add(new Vector2(this.map.tilesWidth,0));

        newPos.rotateAround(pivot,angle);

        return newPos;
    }   

    calculateCurrentBallAngle()
    {
        //Va de 0 a 1, siendo 1 que el circulo ya ha alcanzado la siguiente casilla 
        let proportion = (this.map.timeSinceStart - this.map.beatNodes[this.map.currentNode].timeOfBeat) / (this.map.beatNodes[this.map.currentNode + 1].timeOfBeat - this.map.beatNodes[this.map.currentNode].timeOfBeat);

        let initialAngle = convertoToPositiveAngle(this.map.beatNodes[this.map.currentNode].angle + Math.PI);
        let targetAngle = convertoToPositiveAngle(this.map.beatNodes[this.map.currentNode + 1].angle);

        if(this.direction == -1 && initialAngle<targetAngle)
        {   
            initialAngle = initialAngle +PI2;
        }
        if(this.direction == 1 && initialAngle>targetAngle)
        {
            targetAngle = targetAngle + PI2;
        }

        let angle = lerp( initialAngle, targetAngle, proportion );
        return angle;
    }

    pressKeyForBeat()
    {
        let minTime = this.map.getMinTime(this.map.currentNode + 1);
        let maxTime = this.map.getMaxTime(this.map.currentNode + 1);

        if(this.map.timeSinceStart > minTime && this.map.timeSinceStart < maxTime )
        {
            this.balls[(this.pivotBall+1)%2].position.SetWithVector(this.map.beatNodes[this.map.currentNode + 1].position);
            
            this.map.pressNextNode();
            this.direction = this.map.beatNodes[this.map.currentNode].DirectionAfterIntroduction;

            this.pivotBall = (this.pivotBall+1)%2;

            //HitSound random
            if(this.currentHitSound != null)
            {
                this.currentHitSound.pause();
            }
            if(Math.floor(Math.random()*2) == 0)
            {
                this.currentHitSound = this.hitSound;
            }
            else
            {
                this.currentHitSound = this.hitSound2;
            }
            this.currentHitSound.currentTime=0;
            this.currentHitSound.play();
        }
        else
        {
            this.map.setReloadToPending();
        }
    }

    Draw(ctx)
    {
        for(let i = 0; i<this.balls.length; ++i)
        {
            this.balls[i].Draw(ctx);
        }
    }
}

class Ball
{
    constructor()
    {
        this.lastPosition = new Vector2(0,0);
        this.position = new Vector2(0,0);
        this.size = 12;
        this.color = "Yellow";
    }

    Draw(ctx)
    {
        ctx.beginPath();
        ctx.arc(this.position.x,this.position.y,this.size,0,2*Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}