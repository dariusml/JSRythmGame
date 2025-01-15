var songToPlay = null;

var mapCreatorScene = {

    player: null,
    map : null,
    mapCreator: null,
    timeLine: null,

    camera: null,

    Start: function()
    {
        let musicPath = songOfMapCreator;
        if(editorRawText == null)
        {
            this.map = new BeatMap(musicPath,initialBPMOfMapCreator,50,30,0.2);
            this.map.StartDefault();     
            this.map.addBeat(this.map.beatNodes[this.map.beatNodes.length-1].miniBeat + 4,{beatProperty: beatProperty.directionchanger } );
            this.map.addBeat(this.map.beatNodes[this.map.beatNodes.length-1].miniBeat + 4,{beatProperty: beatProperty.speedBooster, BPM:12 } );
            this.map.addBeat(this.map.beatNodes[this.map.beatNodes.length-1].miniBeat + 4,{beatProperty: beatProperty.speedBooster, BPM:184 });
        }
        else //En caso de que ya estuvuesemos en modo editor y hubiesemos hecho alguna modificación
        {
            this.map = load(editorRawText);
        }
        this.map.editor = true;

        this.player = new Player()
        this.player.Start();
        this.player.setTargetMap(this.map); this.player.automode = true;
        this.mapCreator = new MapCreator(this.map);
        this.timeLine = new TimeLine(this.player,this.mapCreator, this.map.tilesWidth * 1.5);
        this.timeLine.Start();

        //camara
        this.camera = camera;
        this.camera.Start(this.player);

        songSelector.style.display = "none";

    },

    Update: function(deltaTime)
    {
        this.map.Update(deltaTime);

        // Si estoy en modo edicion
        if(this.map.editor)
        {
            nameSelector.style.display = "block";
            BPMSelector.style.display = "block";
            //En caso de que este escribiendo el nombre del mapa o los BPM, no se modifica
            if( !( mapNameBox === document.activeElement || BPMTextBox=== document.activeElement))
            {
                
                this.mapCreator.Update(deltaTime);
                this.timeLine.Update(deltaTime);
                this.camera.target = this.map.beatNodes[this.map.indexNodeToDraw];
                
            }
        }
        else
        {
            nameSelector.style.display = "none"
            this.player.Update(deltaTime);
            this.camera.target = this.player;
        }

        //Si hemos alcanzado el final del mapa volvemos a la escena
        if( this.map.endMapReached() ) this.map.setReloadToPending();

        if(this.map.reloadPending) reloadScene();

        this.camera.Update(deltaTime);
    },

    Draw: function(ctx)
    {

        // background gradient
        ctx.fillStyle = "Black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        this.camera.PreDraw(ctx);

        this.map.Draw(ctx);
        if(this.map.editor) this.mapCreator.Draw(ctx);

        this.player.Draw(ctx);
        
        if (this.defeat)
        {
            ctx.fillStyle = "white";
            ctx.font = "70px Comic Sans MS regular";
            ctx.textAlign = 'center';
            ctx.fillText('Time survived:' + Math.floor(this.timeSurvived).toString() + "s", canvas.width / 2, (canvas.height / 2) + 40);
            ctx.textAlign = 'left';
        }



        this.camera.PostDraw(ctx);


        //Dibujo la UI
        if(this.map.editor) this.timeLine.Draw(ctx);
        
    },


    setToDefaultSettings: function()
    {
        this.player= null;
        this.map = null;
        this.mapCreator= null;
        this.timeLine= null;
    
        this.camera= null;

        if(songToPlay != null) songToPlay.load();
    },
    
}


var game = {

    gameStarted:false,
    defeat:false,
    victory:false,
    timeEndScreen:2.5,

    player: null,
    map : null,

    camera: null,
    playButton: null,

    cursorImg: null,
    cursorHover: null,
    currentCursor:null,

    progressBar:null,

    Start: function()
    {
        mapSelector.style.display = "none";

        this.map = load(mapRawText);

        this.player = new Player()
        this.player.Start();
        this.player.setTargetMap(this.map); this.player.automode = false;

        //camara
        this.camera = camera;
        this.camera.Start(this.player);

        this.createPlayButton();

        this.cursorImg= graphicAssets.cursor.image;
        this.cursorHover= graphicAssets.cursor_hover.image;

        this.progressBar = new ProgressBar(new Vector2(canvas.width*0.15, canvas.height*0.1), canvas.width*0.7, canvas.height*0.05);

    },

    Update: function(deltaTime)
    {
        this.map.Update(deltaTime);
        this.player.Update(deltaTime);
        this.camera.Update(deltaTime);

        
        this.currentCursor = this.cursorImg;
        if(this.mouseInPlayButton() && !this.gameStarted)
        {
            this.currentCursor = this.cursorHover;
            if(Input.IsMousePressed())
            {
                this.player.StartAtMapBeatNode(0);
                this.map.editor = false;
                this.gameStarted = true;
            }
        }

        this.progressBar.value = clamp(0,1,this.map.timeSinceStart / this.map.beatNodes[this.map.beatNodes.length-1].timeOfBeat);

        //Level finish variable setUp
        if(this.map.endMapReached())
        {
            this.map.setReloadToPending();
        }
        if(this.map.reloadPending)
        {
            if(this.map.endMapReached()) this.victory = true;
            else                         this.defeat = true;

            this.timeEndScreen -= deltaTime;
            if(this.timeEndScreen<=0) location.reload();
        }

    },

    Draw: function(ctx)
    {

        ctx.fillStyle = "Black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        this.camera.PreDraw(ctx);

        this.map.Draw(ctx);
        this.player.Draw(ctx);
        
        this.camera.PostDraw(ctx);

        if(!this.gameStarted)this.playButton.Draw(ctx);

        //Dibujo el cursor visual
        if(!this.gameStarted)
        {
            ctx.save();
            ctx.drawImage(this.currentCursor, Input.mouse.x, Input.mouse.y, 11.4, 21);
            ctx.restore();
        }

        this,this.progressBar.Draw(ctx);

        //Dibujo pantalla de derrota o victoria segun el caso
        if(this.victory)
        {
            this.DrawVictory(ctx);
        }
        if(this.defeat)
        {
            this.DrawDefeat(ctx);
        }
        
    },

    DrawVictory: function(ctx)
    {
        ctx.fillStyle = "white";
        ctx.font = "120px Comic Sans MS regular";
        ctx.textAlign = 'center';
        ctx.fillText('Victory', canvas.width / 2, (canvas.height / 2) + 40);
        ctx.textAlign = 'left';
    },
    DrawDefeat: function(ctx)
    {
        ctx.fillStyle = "white";
        ctx.font = "120px Comic Sans MS regular";
        ctx.textAlign = 'center';
        ctx.fillText('Defeat', canvas.width / 2, (canvas.height / 2) + 40);
        ctx.textAlign = 'left';
    },
    
    setToDefaultSettings: function()
    {
        this.gameStarted = false;
        this.defeat=false;
        this.victory=false;
        this.timeEndScreen=2;
    
        this.player= null;
        this.map = null;

        this.camera = null;
        this.playButton= null;

        this.cursorImg= null;
        this.cursorHover= null;
        this.currentCursor=null;

        if(songToPlay != null) songToPlay.load();
    },

    createPlayButton: function()
    {
                //Creo el play button
                this.playButton = new Polygon(3);
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
    },

    mouseInPlayButton: function()
    {
        let sqrRadius = (this.playButton.vertices[0].x - this.playButton.center.x)*(this.playButton.vertices[0].x - this.playButton.center.x);        
        return PointInsideCircle2({x:Input.mouse.x, y:Input.mouse.y}, this.playButton.position, sqrRadius);
    }
    
}




var menuScene = {

    playButton:  null,
    editorButton:null,

    mousePos: null,
    cursorImg: null,
    cursorHover: null,
    currentCursor:null,

    cursorPointingTo:null,

    Start: function()
    {
        this.playButton   = new Polygon(4); this.playButton.fillStyle   = "#BBBBBB";
        this.editorButton = new Polygon(4); this.editorButton.fillStyle = "#BBBBBB";

        this.playButton.vertices[0] = new Vector2(-canvas.width * 0.4, -canvas.height*0.2);
        this.playButton.vertices[1] = new Vector2( canvas.width * 0.4, -canvas.height*0.2);
        this.playButton.vertices[2] = new Vector2( canvas.width * 0.4, +canvas.height*0.2);
        this.playButton.vertices[3] = new Vector2(-canvas.width * 0.4, +canvas.height*0.2);

        this.editorButton.vertices[0] = new Vector2(-canvas.width * 0.4, -canvas.height*0.2);
        this.editorButton.vertices[1] = new Vector2( canvas.width * 0.4, -canvas.height*0.2);
        this.editorButton.vertices[2] = new Vector2( canvas.width * 0.4, +canvas.height*0.2);
        this.editorButton.vertices[3] = new Vector2(-canvas.width * 0.4, +canvas.height*0.2);

        this.playButton.moveTo(new Vector2(canvas.width/2, canvas.height*0.25) );
        this.editorButton.moveTo(new Vector2(canvas.width/2, canvas.height*0.75) );

        this.mousePos = new Vector2(0,0);
        this.cursorImg= graphicAssets.cursor.image;
        this.cursorHover= graphicAssets.cursor_hover.image;
    },

    Update: function(deltaTime)
    {
        this.currentCursor = this.cursorImg;
        this.cursorPointingTo = null;

        this.mousePos.x = Input.mouse.x;
        this.mousePos.y = Input.mouse.y;

        let buttonWidth = this.playButton.vertices[1].x - this.playButton.vertices[0].x;
        let buttonHeight = this.playButton.vertices[2].y - this.playButton.vertices[1].y;

        if( PointInsideRectangle2(this.mousePos, {position:this.playButton.position, width: buttonWidth, height: buttonHeight }) )
        {
            this.currentCursor = this.cursorHover;
            this.cursorPointingTo = selectMapScene;
        }
        if( PointInsideRectangle2(this.mousePos, {position:this.editorButton.position, width: buttonWidth, height: buttonHeight }) )
        {
            this.currentCursor = this.cursorHover;
            this.cursorPointingTo = selectSongScene;

        }

        if(Input.IsMousePressed() && this.cursorPointingTo != null)
        {
            loadScene(this.cursorPointingTo);
        }
    },

    Draw: function(ctx)
    {
        ctx.fillStyle = "Black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        let font = "bold "+  canvas.height/5 + "px Verdana";
        ctx.font = font;
        this.playButton.Draw(ctx);        ctx.fillStyle = "White"; ctx.fillText("PLAY", this.playButton.vertices[3].x,this.playButton.vertices[3].y);
        this.editorButton.Draw(ctx);       ctx.fillStyle = "White";;ctx.fillText("EDITOR", this.editorButton.vertices[3].x,this.editorButton.vertices[3].y);

        //Dibujo el cursor visual
        ctx.save();
        ctx.drawImage(this.currentCursor, Input.mouse.x, Input.mouse.y, 11.4, 21);
        ctx.restore();
    },


    setToDefaultSettings: function()
    {
        this.playButton =  null;
        this.editorButton=null;
    
        this.mousePos= null;
        this.cursorImg= null;
        this.cursorHover= null;
        this.currentCursor=null;
    
        this.cursorPointingTo=null;
    },

}



var selectMapScene = {

    Start: function()
    {
        mapSelector.style.display = "block";
    },

    Update: function(deltaTime)
    {
    },

    Draw: function(ctx)
    {
        ctx.fillStyle = "Black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        let font = "bold "+  canvas.height/10 + "px Verdana";
        ctx.font = font;
        ctx.fillStyle = "#FFFFFF";
        ctx.strokeStyle = "#000000";
        ctx.fillText( "Select map" ,0 , canvas.height/2);
    },

    setToDefaultSettings: function()
    {
    },

}

var selectSongScene = {
    Start: function()
    {
        songSelector.style.display = "block";
    },

    Update: function(deltaTime)
    {
    },

    Draw: function(ctx)
    {
        ctx.fillStyle = "Black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        let font = "bold "+  canvas.height/12 + "px Verdana";
        ctx.font = font;
        ctx.fillStyle = "#FFFFFF";
        ctx.strokeStyle = "#000000";
        ctx.fillText( "write song relative path" ,0 , canvas.height/3);
        ctx.fillText( "write initial BPM" ,0 , canvas.height*2/3);
    },

    setToDefaultSettings: function()
    {
    },
}

