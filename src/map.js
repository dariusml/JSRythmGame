
const beatProperty = {
    noProperty:0,
    directionchanger:1,
    speedBooster:2
}

var defaultTileWidth = 50;
var defaultTileHaight = 30;
var defaultBeatRange = 0.4;
var defaultVolumeLevel = 0.04;

class BeatMap
{
    constructor(songPath, BPM,tilesWidth, tilesHeigth, beatRange)
    {
        this.reloadPending = false;

        this.songPath = songPath;

        if(songToPlay == null)
        {
            songToPlay = new Audio(this.songPath);
        }
        else
        {
            songToPlay.src = songPath;
            songToPlay.load();
            songToPlay.src = songPath;
        }
        this.song =songToPlay;

        this.beatNodes = [];
        this.mapDirectionInLastBeat = -1;

        this.timeOfBegining = null;
        this.timeSinceStart = 0;
        this.timeSinceLastBeat = 0;
        this.currentNode = 0;

        this.tilesWidth = tilesWidth;
        this.tilesHeigth = tilesHeigth;
        this.BPM = BPM;
        this.timeBetweenBeats = 60/BPM;

        this.beatRange = beatRange;
        this.timeOfNextBeat = this.timeBetweenBeats;

        this.numberOfRenders = 50;
        this.editor = false; this.indexNodeToDraw = 0;

        this.objectToFocus = null;

        this.song.volume = defaultVolumeLevel;
    }

    //Añade una nota al mapa dependiendo de minibeats
    addBeat(beatMoment, nodeBeatProperty = beatProperty.noProperty)
    {
        //Creo la nota y le doy valores
        let beatNode = new BeatNode(beatMoment,nodeBeatProperty);
        
        beatNode.size = new Vector2(this.tilesWidth, this.tilesHeigth);

        this.beatNodes.push(beatNode);

        let length = this.beatNodes.length;

        if(length > 1)
        {
            let lastBeat = this.beatNodes[this.beatNodes.length - 2];

            let miniBeatDiff = this.beatNodes[this.beatNodes.length - 1].miniBeat - lastBeat.miniBeat;

            //Le pongo al nodo los datos de cuando rompe
            beatNode.timeOfBeat = lastBeat.timeOfBeat + (miniBeatDiff/4) * this.timeBetweenBeats;

            let beatAngle = (lastBeat.beatAngle +this.mapDirectionInLastBeat * (4 - miniBeatDiff) );
            if(beatAngle<0) beatAngle += 8;
            beatAngle = beatAngle%8;

            this.beatNodes[this.beatNodes.length - 1].beatAngle = beatAngle;
            this.beatNodes[this.beatNodes.length - 1].angle = -(this.beatNodes[this.beatNodes.length - 1].beatAngle - 4) * Math.PI/4;

            this.beatNodes[this.beatNodes.length - 1].setNodeVertex(this.beatNodes[this.beatNodes.length - 2]);


            //Si tiene alguna propiedad la tengo en cuenta
            if(this.beatNodes[this.beatNodes.length - 1].beatProperty.beatProperty == beatProperty.directionchanger) this.mapDirectionInLastBeat *= -1;
            if(this.beatNodes[this.beatNodes.length - 1].beatProperty.beatProperty == beatProperty.speedBooster)
            {
                this.BPM = this.beatNodes[this.beatNodes.length - 1].beatProperty.BPM;
                this.timeBetweenBeats = 60 / this.BPM;
            }

        }
        else
        {
            //Es el primer nodo
            this.beatNodes[0].position = new Vector2(canvas.width/2, canvas.height/2);   
            this.beatNodes[0].setDefaultVertices();
        }

        //Le digo al nodo las propiedades que tiene actualmente el mapa
        beatNode.BPMAfterIntroduction = this.BPM;
        beatNode.DirectionAfterIntroduction = this.mapDirectionInLastBeat;
    }
    //Añade una nota al mapa dependiendo del ángulo, hace uso de addBeat()
    addBeatGlobalAngle(beatAngle, beatProperty)
    {
        if(beatAngle == 0);
        let lastBeatMiniBeat = this.beatNodes[this.beatNodes.length - 1].miniBeat;
        let lastNodeAngle = this.beatNodes[this.beatNodes.length - 1].beatAngle;
        if(lastNodeAngle==0) lastNodeAngle = 8;
        
        if(beatAngle < lastNodeAngle-4) beatAngle+=8;

        let beatsToReachDesired = beatAngle - (lastNodeAngle - 4);
        if(this.mapDirectionInLastBeat == 1)
        {
            beatsToReachDesired = -1*(beatsToReachDesired-8);
        }

        this.addBeat(lastBeatMiniBeat + beatsToReachDesired, beatProperty );
    }

    eraseLastNode()
    {
        this.beatNodes.pop();
        this.mapDirectionInLastBeat = this.beatNodes[this.beatNodes.length-1].DirectionAfterIntroduction;
        this.BPM = this.beatNodes[this.beatNodes.length-1].BPMAfterIntroduction;
        this.timeBetweenBeats = 60/this.BPM;
    }

    getMinTime(beatIndex)
    {
        let minTime = this.beatNodes[beatIndex].timeOfBeat - (60/this.beatNodes[beatIndex-1].BPMAfterIntroduction)*this.beatRange;
        return minTime;
    }
    getMaxTime(beatIndex)
    {
        let maxTime = this.beatNodes[beatIndex].timeOfBeat + (60/this.beatNodes[beatIndex-1].BPMAfterIntroduction)*this.beatRange;
        return maxTime;
    }
    
    pressNextNode()
    {
        this.beatNodes[this.currentNode].active = false;
        ++this.currentNode;
    }

    createMap()
    {

    }
    StartDefault()
    {
        this.addBeat( 0 );
        this.addBeat( 4 );
    }

    Update(deltatime)
    {
        //Si le he dado al play
        if(this.timeOfBegining != null && !this.reloadPending)
        {
            this.timeSinceStart = (Date.now()-this.timeOfBegining)/1000;

            if(!this.endMapReached()) //Si no es el ultimo nodo
            {
                this.timeOfNextBeat = this.beatNodes[this.currentNode + 1].timeOfBeat;
                if(this.timeSinceStart>this.timeOfNextBeat + this.timeBetweenBeats * this.beatRange)
                {
                    this.setReloadToPending();
                }
            }
        }
    }

    Draw(ctx)
    {
        //va a renderizar 50 nodos por delante
        let i = this.currentNode + this.numberOfRenders;
        if(this.beatNodes.length - 1 < this.currentNode + 50)
        {
            i = this.beatNodes.length - 1;
        }

        if(this.editor)
        {

            let j = this.indexNodeToDraw + this.numberOfRenders/2;
            if(j > this.beatNodes.length - 1) j = this.beatNodes.length - 1;
            let limitToDraw = j - this.numberOfRenders;
            for(; j>=0 && j> limitToDraw; --j)
            {
                this.beatNodes[j].Draw(ctx);
            }
        }
        else
        {
            for(; i>=this.currentNode ; --i)
            {
                this.beatNodes[i].Draw(ctx);
            }
        }

    }

    
    endMapReached()
    {
        return this.currentNode + 1 >= this.beatNodes.length
    }



    setReloadToPending()
    {
        this.reloadPending = true;
        //reloadScene();
    }

    saveMap(mapName)
    {
        let mapToText = this.convertMapToText();

        let data = new Blob([mapToText], {type: 'text/plain'});
        saveAs(data, mapName+".txt");
    }

    convertMapToText()
    {
        let mapToText ="";
        mapToText += this.songPath;
        //mapToText += 
        for(let i = 0; i<this.beatNodes.length; ++i)
        {
            mapToText += "|" + this.beatNodes[i].miniBeat + "," + this.beatNodes[i].DirectionAfterIntroduction + "," + this.beatNodes[i].BPMAfterIntroduction;
        }

        return mapToText;
    }
}

function load(mapData)
{
    let separatedData = mapData.split("|");

    let mapPath = separatedData[0];
    let initialNode = separatedData[1];

    let initialBPM = parseInt(initialNode.split(",")[2]);

    let mapToReturn = new BeatMap(mapPath, initialBPM, defaultTileWidth, defaultTileHaight, defaultBeatRange);

    for(let i = 1; i < separatedData.length; ++i )
    {
        let currentNodeData = separatedData[i].split(",");

        let miniBeat = parseInt(currentNodeData[0]);
        let direccion= parseInt(currentNodeData[1]);
        let BPM      = parseInt(currentNodeData[2]) ;

        let property;

        //Miro si el anterior nodo tenia direccion o bpm diferentes para saber si es un nodo con beatProperty
        if(mapToReturn.beatNodes.length != 0)
        {
            if( mapToReturn.beatNodes[mapToReturn.beatNodes.length - 1].DirectionAfterIntroduction != direccion )
            {
                property = {beatProperty: beatProperty.directionchanger}
            }
            if( mapToReturn.beatNodes[mapToReturn.beatNodes.length - 1].BPMAfterIntroduction != BPM )
            {
                property = {beatProperty: beatProperty.speedBooster, BPM: BPM}
            }
        }

        mapToReturn.addBeat(miniBeat, property);
    }

    return mapToReturn;
}

class BeatNode
{
    constructor(miniBeat, beatProperty)
    {

        this.miniBeat = miniBeat;
        //beatAngle de 0 - 7
        this.beatAngle = 4;
        this.angle = 0;
        this.beatProperty = beatProperty;
        this.active = true;

        this.size = new Vector2(0,0);
        this.position = new Vector2(0,0);
        this.vertices = [6];

        this.timeOfBeat = 0;


        this.BPMAfterIntroduction = null;
        this.DirectionAfterIntroduction = null;
    }

    setNodeVertex(lastNode)
    {
        this.position = new Vector2(lastNode.position.x, lastNode.position.y);
        this.position.Add(new Vector2(this.size.x, 0));

        this.position.rotateAround(lastNode.position, this.angle);


        this.setDefaultVertices();
        for(let i = 0; i<this.vertices.length; ++i)
        {
            this.vertices[i].rotateAround(this.position, this.angle);
        }

        if(lastNode.beatAngle != this.beatAngle) this.reshapeLastNode(lastNode, this);
        else
        {

        }

    }

    setDefaultVertices()    
    {
        let x = this.position.x;
        let y = this.position.y;

        this.vertices[0] = new Vector2(x - this.size.x/2, y -this.size.y/2);
        this.vertices[1] = new Vector2(x, y -this.size.y/2);
        this.vertices[2] = new Vector2(x + this.size.x/2, y -this.size.y/2);
        this.vertices[3] = new Vector2(x + this.size.x/2, y +this.size.y/2);
        this.vertices[4] = new Vector2(x, y +this.size.y/2);
        this.vertices[5] = new Vector2(x - this.size.x/2, y +this.size.y/2);
    }

    reshapeLastNode(lastNode, currentNode)
    {
        try{
            let p1l1 = lastNode.vertices[0];
            let p2l1 = lastNode.vertices[1];
    
            let p1l2 = currentNode.vertices[1];
            let p2l2 = currentNode.vertices[0];
            let pInterseccion1 = Vector2.intersection(p1l1,p2l1,p1l2,p2l2);
    
            p1l1 = lastNode.vertices[4];
            p2l1 = lastNode.vertices[5];
    
            p1l2 = currentNode.vertices[5];
            p2l2 = currentNode.vertices[4];
            let pInterseccion2 = Vector2.intersection(p1l1,p2l1,p1l2,p2l2);
    
            //puntos intermedios
            lastNode.vertices[1] = pInterseccion1;
            lastNode.vertices[4] = pInterseccion2;
        }
        catch(exception)
        {
            
        }

        //puntos finales
        lastNode.vertices[2] = currentNode.vertices[0];
        lastNode.vertices[3] = currentNode.vertices[5];
    }


    Draw(ctx)
    {
        if(this.active)
        {
            ctx.beginPath();
            ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
    
            for(let i = 0; i<=this.vertices.length;++i)
            {
                ctx.lineTo(this.vertices[i%this.vertices.length].x, this.vertices[i%this.vertices.length].y)
            }
    
            ctx.strokeStyle = "#FFFFFF";

            if(this.beatProperty.beatProperty == beatProperty.directionchanger)ctx.fillStyle = "Gray";
            else if(this.beatProperty.beatProperty == beatProperty.speedBooster) ctx.fillStyle = "Purple"
            else ctx.fillStyle = "Red";
    
            ctx.lineWidth = 1;
    
            ctx.fill();
            ctx.stroke();

            for(let i = 0; i<=this.vertices.length;++i)
            {
                ctx.fillStyle = "Green";
                ctx.fillRect(this.vertices[i%this.vertices.length].x-3, this.vertices[i%this.vertices.length].y-3,6,6);
            }
            ctx.fillStyle = "White";
            ctx.fillRect(this.position.x-3, this.position.y-3,6,6);
        }
    }
}



class MapCreator{

    constructor(map)
    {
        this.map = map;
        this.centerRadius = 1.1 * Math.sqrt(map.tilesWidth*map.tilesWidth + map.tilesHeigth*map.tilesHeigth);

        //Poligonos que sirven para visualizar donde pondrias la siguiente nota
        this.letersOrder = ["D","E","W","Q","A","Z","S","C"];
        this.polygonAddersPolygons = [];
        for(let i = 0; i<8; ++i)
        {
            this.polygonAddersPolygons.push(new Polygon(5));

            this.polygonAddersPolygons[i].fillStyle = "#FFFFFF";
            this.polygonAddersPolygons[i].strokeStyle = "Red";

            let tilesWidth = map.tilesWidth;
            let tilesHeigth = map.tilesHeigth;
            //Los poligonos van a tener forma de beatnode normal con un pico a un lado, aqui los vertices que luego diran como se dibuja
            this.polygonAddersPolygons[i].vertices[0].x = -tilesWidth*3/4;

            this.polygonAddersPolygons[i].vertices[1].x = -tilesWidth/2;
            this.polygonAddersPolygons[i].vertices[1].y = -tilesHeigth/2;

            this.polygonAddersPolygons[i].vertices[2].x = +tilesWidth/2;
            this.polygonAddersPolygons[i].vertices[2].y = -tilesHeigth/2;

            this.polygonAddersPolygons[i].vertices[3].x = +tilesWidth/2;
            this.polygonAddersPolygons[i].vertices[3].y = +tilesHeigth/2;

            this.polygonAddersPolygons[i].vertices[4].x = -tilesWidth/2;
            this.polygonAddersPolygons[i].vertices[4].y = +tilesHeigth/2;

            this.polygonAddersPolygons[i].rotatePolygonAroundPoint(new Vector2(0,0), i * Math.PI/4)
        }

        this.changeMade = false;
    }

    addInMap(beatIdentifier,viaAngle = false, beatProperty)
    {
        if(viaAngle)
        {
            this.map.addBeatGlobalAngle(beatIdentifier, beatProperty)
        }
        else
        {
            this.map.addBeat(this.map.beatNodes[this.map.beatNodes.length-1].miniBeat + beatIdentifier, beatProperty);
        }

        this.changeMade = true;
    }

    eraseLastNodeOfMap()
    {
        //Elimino el ultimo nodo del mapa
        this.map.eraseLastNode();


        //Por temas de redibujado del que ahora es ultimo nodo, lo mejor es eliminarlo y volverlo a crear tal y como estaba antes
        let angleOfCurrentLastNode = this.map.beatNodes[this.map.beatNodes.length-1].beatAngle;
        let beatProperty = this.map.beatNodes[this.map.beatNodes.length-1].beatProperty;

        this.map.eraseLastNode();
        this.map.addBeatGlobalAngle(angleOfCurrentLastNode, beatProperty)

        this.changeMade = true;
    }

    Start()
    {
        console.log("Start");
    }

    Update(deltatime)
    {
        //actualizo la posicion del apoyo visual de añadir nodos
        for(let i = 0; i<this.polygonAddersPolygons.length; ++i)
        {
            let newPos = Vector2.Zero();
            newPos.x = this.map.beatNodes[this.map.beatNodes.length - 1].position.x + this.centerRadius * Math.cos(Math.PI*i/4);
            newPos.y = this.map.beatNodes[this.map.beatNodes.length - 1].position.y - this.centerRadius * Math.sin(Math.PI*i/4);
            this.polygonAddersPolygons[i].moveTo( newPos );
        }


        //Quitar nodo
        if(Input.IsKeyDown(KEY_BACKSPACE))
        {
            this.eraseLastNodeOfMap();
        }

        //Inputs para añadir propiedad al nodo
        let property;
        if(Input.IsKeyPressed(KEY_F))
        {
            property = {beatProperty: beatProperty.directionchanger};
        }
        if(Input.IsKeyPressed(KEY_G))
        {
            property = {beatProperty: beatProperty.speedBooster, BPM: BPMTextBox.value};
        }


        //Inputs para añadir nodos
        if(Input.IsKeyDown(KEY_1)) this.addInMap(1,false,property);
        if(Input.IsKeyDown(KEY_2)) this.addInMap(2,false,property);
        if(Input.IsKeyDown(KEY_3)) this.addInMap(3,false,property);
        if(Input.IsKeyDown(KEY_4)) this.addInMap(4,false,property);
        if(Input.IsKeyDown(KEY_5)) this.addInMap(5,false,property);
        if(Input.IsKeyDown(KEY_6)) this.addInMap(6,false,property);
        if(Input.IsKeyDown(KEY_7)) this.addInMap(7,false,property);

        if(Input.IsKeyDown(KEY_A)) this.addInMap(0,true,property);
        if(Input.IsKeyDown(KEY_Q)) this.addInMap(1,true,property);
        if(Input.IsKeyDown(KEY_W)) this.addInMap(2,true,property);
        if(Input.IsKeyDown(KEY_E)) this.addInMap(3,true,property);
        if(Input.IsKeyDown(KEY_D)) this.addInMap(4,true,property);
        if(Input.IsKeyDown(KEY_C)) this.addInMap(5,true,property);
        if(Input.IsKeyDown(KEY_S)) this.addInMap(6,true,property);
        if(Input.IsKeyDown(KEY_Z)) this.addInMap(7,true,property);

    }

    Draw(ctx)
    {
        //Dibujo las pistas visuales de creacion de siguiente nota mediante angulo
        for(let i = 0; i<this.polygonAddersPolygons.length; ++i)
        {
            this.polygonAddersPolygons[i].Draw(ctx);

            let font = "bold "+  this.map.tilesHeigth/2 + "px Verdana";

            ctx.font = font;
            ctx.fillStyle = "Black";
            ctx.fillText( this.letersOrder[i] , this.polygonAddersPolygons[i].center.x - this.map.tilesHeigth/4, this.polygonAddersPolygons[i].center.y + this.map.tilesHeigth/6);
        }
    }

}


class TimeLine{

    constructor(player,mapCreator, size)
    {
        this.player = player;

        this.mapCreator = mapCreator;
        this.map = mapCreator.map
        this.size = size;

        this.cursorImg = graphicAssets.cursor.image;
        this.cursorHover = graphicAssets.cursor_hover.image;

        this.currentCursor = this.cursorImg;

        this.firstTimelineBeat = 0;
        this.numberOfMinibeatsInTimeline = 120;
        this.selectedNode = 0;

        this.timeStampBegin = 0; this.beginBeatNodeIndex = 0;
        this.timeStampEnd = 0;   this.endBeatNodeIndex = 0;
        this.endOfTimeLineReached = false;
        this.lastMinibeat = 0;

        
        this.playButton = new Polygon(3);
    }

    Start()
    {
        this.UpdateTimeStamps();

        //Creo el play button
        this.playButton.vertices[0].x = this.map.tilesWidth;
        this.playButton.vertices[0].y = 0;

        this.playButton.vertices[1].x = -this.map.tilesWidth * Math.cos(Math.PI/6);
        this.playButton.vertices[1].y = this.map.tilesWidth * Math.sin(Math.PI/6);

        this.playButton.vertices[2].x = -this.map.tilesWidth * Math.cos(Math.PI/6);
        this.playButton.vertices[2].y = -this.map.tilesWidth * Math.sin(Math.PI/6);

        this.playButton.center.x = 0;
        this.playButton.center.y = 0;
        this.playButton.moveTo(new Vector2(canvas.width - this.map.tilesWidth*1.2, this.playButton.vertices[1].y*1.3 ));
        this.playButton.fillStyle = "#FFFFFF"
    }

    Update(deltaTime)
    {
        this.currentCursor = this.cursorImg; //Seteo la imagen del cursor a default
        if(this.mapCreator.changeMade)
        {
            editorRawText = this.map.convertMapToText(); // guardo el mapa actual cambio realizado en memoria
            this.UpdateTimeStamps();
            if(this.selectedNode>= this.map.beatNodes.length)
            {
                this.SetSelectedNode(this.map.beatNodes.length - 1);
            }
            this.mapCreator.changeMade = false;
        }

        if(this.mouseInTimeline())
        {
            this.currentCursor = this.cursorHover;

            if(Input.mouse.x < canvas.width * 0.15)
            {
                this.firstTimelineBeat -=1;
                if(this.firstTimelineBeat < 0) this.firstTimelineBeat = 0;
                this.UpdateTimeStamps();
                this.endOfTimeLineReached = false;
            }
            if(Input.mouse.x > canvas.width * 0.85)
            {
                this.firstTimelineBeat +=1;
                if(this.firstTimelineBeat + this.numberOfMinibeatsInTimeline > this.map.beatNodes[this.map.beatNodes.length - 1].miniBeat + 8)
                {
                    this.endOfTimeLineReached = true;
                    this.firstTimelineBeat-=1;
                    this.lastMinibeat = this.map.beatNodes[this.map.beatNodes.length - 1].miniBeat;
                }
                this.UpdateTimeStamps();
            }

            if(Input.IsMousePressed())
            {
                this.SetSelectedNode(this.GetIndexOfPointed());
            }

        }

        if(this.endOfTimeLineReached)
        {
            this.firstTimelineBeat = this.map.beatNodes[this.map.beatNodes.length - 1].miniBeat + 8 - this.numberOfMinibeatsInTimeline;
            if(this.firstTimelineBeat<0)  this.firstTimelineBeat = 0;
            if(this.map.beatNodes[this.map.beatNodes.length - 1].miniBeat != this.lastMinibeat)
            {
                this.lastMinibeat = this.map.beatNodes[this.map.beatNodes.length - 1].miniBeat;
                this.UpdateTimeStamps();
                this.SetSelectedNode(this.map.beatNodes.length - 1);
            }
        }



        if(this.mouseInPlayButton())
        {
            this.currentCursor = this.cursorHover;
            if(Input.IsMousePressed())
            {
                this.player.StartAtMapBeatNode(this.selectedNode);
                this.map.editor = false;
            }
        }
    }
    UpdateTimeStamps()
    {
        let terminado = false;
        let beginFound = true;

        for(let i = 0; i< this.map.beatNodes.length && !terminado; ++i)
        {
            if(this.firstTimelineBeat >= this.map.beatNodes[i].miniBeat && beginFound)
            {
                let index = clamp(0,this.map.beatNodes.length - 1, i+1);
                this.timeStampBegin = this.map.beatNodes[i+1].timeOfBeat;
                this.beginBeatNodeIndex = i;
                beginFound = true;
            }


            if(this.firstTimelineBeat + this.numberOfMinibeatsInTimeline <= this.map.beatNodes[i].miniBeat)
            {
                this.timeStampEnd = this.map.beatNodes[i].timeOfBeat;

                this.endBeatNodeIndex = i;
                terminado = true;
            } 
        }
        if(!terminado)
        {
            this.timeStampEnd = this.map.beatNodes[this.map.beatNodes.length - 1].timeOfBeat;
            this.endBeatNodeIndex = this.map.beatNodes.length - 1;
        }
    }

    Draw(ctx)
    {

        this.DrawTimeline(ctx);
        this.DrawBeatsInTimeLine(ctx);
        
        this.playButton.Draw(ctx);

        this.DrawInstrucciones(ctx);


        //Dibujo el cursor visal para que pueda dibujar la timeline
        ctx.save();
        ctx.drawImage(this.currentCursor, Input.mouse.x, Input.mouse.y, 11.4, 21);
        ctx.restore();
    }

    DrawTimeline(ctx)
    {
        //Dibujo la timeLine
        ctx.lineWidth = this.size*0.1;
        ctx.strokeStyle = "#FFFFFF"
        ctx.fillStyle= "#969696";
        ctx.fillRect(0,canvas.height - this.size,canvas.width, this.size);
        ctx.strokeRect(0,canvas.height - this.size,canvas.width, this.size);

        //Dibujo las rayas de la timeline
        ctx.lineWidth = this.size*0.2 / this.numberOfMinibeatsInTimeline;
        if(ctx.lineWidth < 1) ctx.lineWidth = 1;

        for(let i = 0; i<this.numberOfMinibeatsInTimeline; ++i)
        {
            let currentBeat = this.firstTimelineBeat + i;
            
            let xPos = canvas.width * i / this.numberOfMinibeatsInTimeline;
            let lineHeight = this.size/3;
            if(currentBeat % 4 == 0) 
            {
                ctx.strokeStyle = "Red"; 
                lineHeight = this.size * 0.5;
            } 

            ctx.beginPath();
            ctx.moveTo(xPos , canvas.height);
            ctx.lineTo(xPos, canvas.height-lineHeight);
            ctx.stroke();

            ctx.strokeStyle = "Black"; 
        }


        let font = "bold "+  this.map.tilesHeigth/2 + "px Verdana";
        ctx.font = font;
        ctx.fillStyle = "#BBBBBB";
        ctx.strokeStyle = "#000000";
        ctx.fillText( this.timeStampBegin + "s" ,this.size*0.2 , canvas.height - this.size - this.map.tilesHeigth );

        ctx.fillText( this.timeStampEnd + "s" ,canvas.width - this.size * 0.8 , canvas.height - this.size - this.map.tilesHeigth);

    }

    DrawBeatsInTimeLine(ctx)
    {

        for(let i = this.beginBeatNodeIndex; i<=this.endBeatNodeIndex; ++i)
        {
            ctx.strokeStyle = "Green"; 
            if(i == this.selectedNode) ctx.strokeStyle = "#FFFFFF";
            let beat = this.map.beatNodes[i].miniBeat - this.firstTimelineBeat;

            let xPos = canvas.width * beat / this.numberOfMinibeatsInTimeline;

            ctx.beginPath();
            ctx.moveTo(xPos , canvas.height - this.size);
            ctx.lineTo(xPos, canvas.height);
            ctx.stroke();
        }
    }

    DrawInstrucciones(ctx)
    {
        let font = "bold "+  this.map.tilesHeigth/3 + "px Verdana";
        ctx.font = font;
        ctx.fillStyle = "#FFFFFF";
        ctx.strokeStyle = "#000000";

        ctx.fillText( "1,2,3,4,5,6,7 |o| q,w,e,d,c,x,z,a para añadir beats" ,this.size*0.2 , this.map.tilesHeigth/3 );

        ctx.fillText( "manten |f| antes de añadir un nodo para que sea un nodo de cambio de direccion" ,this.size*0.2 , 3*this.map.tilesHeigth/3);
        ctx.fillText( "manten |g| antes de añadir un nodo para que sea un nodo de cambio de BPM" ,this.size*0.2 , 5*this.map.tilesHeigth/3);
    }

    GetIndexOfPointed()
    {
        let searchCompleted = false;
        //Traduzco la posicion del mouse a la del beat
        let mouseBeatPos =clamp(0,1,(Input.mouse.x / canvas.width)) * this.numberOfMinibeatsInTimeline + this.firstTimelineBeat;
        
        let indexOfPointedNode;

        //Busco en los beats que tengo en la timeLine
        for(let i = this.beginBeatNodeIndex; i<=this.endBeatNodeIndex && !searchCompleted; ++i)
        {
            if(this.map.beatNodes[clamp(0,this.endBeatNodeIndex,i+1)].miniBeat >= mouseBeatPos)
            {
                searchCompleted = true;
                indexOfPointedNode = i;
            }
            if(i+1>=this.map.beatNodes.length)
            {
                indexOfPointedNode = i;
                searchCompleted = true;
            }
        }
        return indexOfPointedNode;
    }

    SetSelectedNode(selectedNode)
    {
        this.selectedNode = selectedNode;
        this.map.indexNodeToDraw = this.selectedNode;
    }

    mouseInTimeline()
    {
        return Input.mouse.y > canvas.height - this.size;
    }

    mouseInPlayButton()
    {
        let sqrRadius = (this.playButton.vertices[0].x - this.playButton.center.x)*(this.playButton.vertices[0].x - this.playButton.center.x);        
        return PointInsideCircle2({x:Input.mouse.x, y:Input.mouse.y}, this.playButton.position, sqrRadius);
    }

}